<template>
	<h1>Name: {{ room?.name }}, messages: {{ messages.length }}</h1>
	<button @click="loadMore" :disabled="matrixStatus == 'PREPARING'">
		Load more {{ loading && " Loading" }}
	</button>
	<section class="max-h-62.5 overflow-auto bg-red-600">
		<VirtualList
			:items="messages"
			:get-item-key="(message) => message.getId() ?? ''"
			:estimate-size="() => 80"
			:overscan="5"
			:is-loading="false"
			v-if="messages.length"
		>
			<template #default="{ item }: { item: MatrixEvent }">
				{{ item.getContent().body }}
			</template>
		</VirtualList>
	</section>
</template>
<script setup lang="ts">
import {
	matrixClient,
	MatrixStatus,
	matrixStatus,
} from "@/common/libs/matrix/matrix";
import {
	getNextRoomTimeLineEvents,
	getRoomTimeLineEvents
} from "@/common/libs/matrix/matrix-message";
import { autoJoinRoom, getRoomById } from "@/common/libs/matrix/matrix-room";
import VirtualList from "@/components/VirtualList.vue";
import { EventType, Room, RoomEvent, type MatrixEvent } from "matrix-js-sdk";
import { computed, onUnmounted, ref, watch } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const roomId = route.params.id.toString() ?? "";
const refresh = ref(0);
const loading = ref(false);

const room = computed(() => {
	void refresh.value;
	void matrixStatus.value;
	return getRoomById(matrixClient.value!, decodeURIComponent(roomId));
});

const messages = computed(() => {
	void refresh.value;
	void matrixStatus.value;
	console.log(room.value?.getLiveTimeline().getEvents());
	return getRoomTimeLineEvents(room.value!).filter(
		(d) =>
			!d.getOriginalContent()?.["m.new_content"] &&
			[EventType.RoomMessage, EventType.Reaction].includes(
				d.getType() as EventType,
			),
	);
});

async function loadMore() {
	if (loading.value) return;

	loading.value = true;
	await getNextRoomTimeLineEvents(matrixClient.value!, room.value!);
	loading.value = false;
	refresh.value++;
}

const handleRoomTimeLine = async (
	event: MatrixEvent,
	room: Room | undefined,
	toStartOfTimeline: boolean | undefined,
	_: boolean | undefined, // removed
) => {
	if (toStartOfTimeline) return;
	if (!room || !event) return;
	refresh.value++;
};

const handleRoomEchoTimeLine = async (
	event: MatrixEvent,
	room: Room | undefined,
) => {
	if (!room || !event) return;
	refresh.value++;
};

watch(
	[() => matrixClient.value, () => matrixStatus.value],
	async ([client, status]) => {
		if (!client) return;
		if (![MatrixStatus.SYNCING].includes(status as any)) {
			setTimeout(() => {
				refresh.value++;
			}, 1000);
			return;
		}

		// console.log((await getRoomEventByIdFromServer(
		// 	client,
		// 	room.value!,
		// 	decodeURIComponent("%24ipPCpMMg1YppC-4chx_bbp7LVTDgXXLMD0YWju0l4r4")
		// )));

		autoJoinRoom(client);
		client.on(RoomEvent.Timeline, handleRoomTimeLine);
		client.on(RoomEvent.LocalEchoUpdated, handleRoomEchoTimeLine);
	},
);

onUnmounted(() => {
	matrixClient.value?.off(RoomEvent.Timeline, handleRoomTimeLine);
	matrixClient.value?.off(RoomEvent.LocalEchoUpdated, handleRoomEchoTimeLine);
});
</script>
