import {
	computed,
	nextTick,
	onUnmounted,
	ref,
	toValue,
	watch,
	type MaybeRefOrGetter,
} from "vue";
import { EventType, Room, RoomEvent, type MatrixEvent } from "matrix-js-sdk";
import {
	matrixClient,
	MatrixStatus,
	matrixStatus,
} from "@/common/libs/matrix/matrix";
import {
	getRoomTimeLineEvents,
	paginateRoomTimeline,
	type TimelinePaginationDirection,
} from "@/common/libs/matrix/matrix-message";
import { autoJoinRoom, getRoomById } from "@/common/libs/matrix/matrix-room";
import type {
	VirtualListAlign,
	VirtualListBehavior,
} from "@/types/virtuallist";

export interface ScrollableList {
	scrollToItem: (
		id: string | number,
		options?: {
			align?: VirtualListAlign;
			behavior?: VirtualListBehavior;
		},
		highlighted?: boolean,
		highlightDuration?: number,
	) => void;
}

export interface JumpResult {
	success: boolean;
	message: string;
}

export function useChatRoom(roomIdSource: MaybeRefOrGetter<string>) {
	const refresh = ref(0);
	const loading = ref(false);
	const syncDirection = ref<TimelinePaginationDirection>("oldest");
	const syncStatusMessage = ref<string | null>(null);

	const jumpLoading = ref(false);
	const jumpResult = ref<JumpResult | null>(null);

	const room = computed(() => {
		void refresh.value;
		void matrixStatus.value;
		const client = matrixClient.value;
		if (!client) return null;
		const id = toValue(roomIdSource);
		return getRoomById(client, decodeURIComponent(id));
	});

	const messages = computed(() => {
		void refresh.value;
		void matrixStatus.value;
		const currentRoom = room.value;
		if (!currentRoom) return [];

		return getRoomTimeLineEvents(currentRoom).filter(
			(event) =>
				!event.getOriginalContent()?.["m.new_content"] &&
				[EventType.RoomMessage, EventType.Reaction].includes(
					event.getType() as EventType,
				),
		);
	});

	async function syncMessages(
		direction: TimelinePaginationDirection = syncDirection.value,
	): Promise<boolean> {
		const client = matrixClient.value;
		const currentRoom = room.value;
		if (loading.value || !client || !currentRoom) return false;

		loading.value = true;
		syncStatusMessage.value = `Syncing ${direction} messages...`;

		try {
			const hasMore = await paginateRoomTimeline(
				client,
				currentRoom,
				direction,
				30,
			);
			refresh.value++;
			syncStatusMessage.value = hasMore
				? `Synced ${direction} messages successfully.`
				: `Reached the end of ${direction} messages.`;
			return hasMore;
		} finally {
			loading.value = false;
			setTimeout(() => {
				syncStatusMessage.value = null;
			}, 3000);
		}
	}

	async function jumpToEvent(
		targetEventId: string,
		virtualListRef?: ScrollableList | null,
	): Promise<boolean> {
		const cleanId = targetEventId.trim();
		if (!cleanId) {
			jumpResult.value = {
				success: false,
				message: "Please enter a valid Event ID.",
			};
			return false;
		}

		const client = matrixClient.value;
		const currentRoom = room.value;
		if (!client || !currentRoom) {
			jumpResult.value = {
				success: false,
				message: "Matrix client or room not ready.",
			};
			return false;
		}

		jumpLoading.value = true;
		jumpResult.value = null;

		try {
			// 1. Check if the event is already in the loaded messages
			let exists = messages.value.some((msg) => msg.getId() === cleanId);

			// 2. If not found in memory, paginate backwards to search history
			let attempts = 0;
			const maxAttempts = 15;

			while (!exists && attempts < maxAttempts) {
				attempts++;
				const hasMore = await paginateRoomTimeline(
					client,
					currentRoom,
					"oldest",
					40,
				);
				refresh.value++;
				exists = messages.value.some((msg) => msg.getId() === cleanId);
				if (!hasMore || exists) break;
			}

			if (exists) {
				await nextTick();
				if (virtualListRef) {
					virtualListRef.scrollToItem(
						cleanId,
						{ align: "center", behavior: "smooth" },
						true,
						3000,
					);
				}
				jumpResult.value = {
					success: true,
					message: `Jumped to event ${cleanId}`,
				};
				return true;
			} else {
				jumpResult.value = {
					success: false,
					message: `Event ${cleanId} could not be found in timeline.`,
				};
				return false;
			}
		} finally {
			jumpLoading.value = false;
			setTimeout(() => {
				if (jumpResult.value?.success) {
					jumpResult.value = null;
				}
			}, 4000);
		}
	}

	const handleRoomTimeline = (
		_event: MatrixEvent,
		targetRoom: Room | undefined,
		toStartOfTimeline: boolean | undefined,
	): void => {
		if (toStartOfTimeline || !targetRoom) return;
		refresh.value++;
	};

	const handleRoomEchoTimeline = (
		_event: MatrixEvent,
		targetRoom: Room | undefined,
	): void => {
		if (!targetRoom) return;
		refresh.value++;
	};

	watch(
		[matrixClient, matrixStatus],
		([client, status]) => {
			if (!client) return;

			if (status !== MatrixStatus.SYNCING) {
				setTimeout(() => {
					refresh.value++;
				}, 1000);
				return;
			}

			autoJoinRoom(client);
			client.on(RoomEvent.Timeline, handleRoomTimeline);
			client.on(RoomEvent.LocalEchoUpdated, handleRoomEchoTimeline);
		},
		{ immediate: true },
	);

	onUnmounted(() => {
		const client = matrixClient.value;
		if (client) {
			client.off(RoomEvent.Timeline, handleRoomTimeline);
			client.off(RoomEvent.LocalEchoUpdated, handleRoomEchoTimeline);
		}
	});

	return {
		room,
		messages,
		loading,
		syncDirection,
		syncStatusMessage,
		jumpLoading,
		jumpResult,
		syncMessages,
		jumpToEvent,
		matrixStatus,
	};
}
