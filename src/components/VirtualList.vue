<script setup lang="ts" generic="T">
import { useVirtualizer } from "@tanstack/vue-virtual";
import { computed, nextTick, ref, watch } from "vue";

import type {
	VirtualListAlign,
	VirtualListBehavior,
	VirtualListExpose,
	VirtualSnapshot,
} from "@/types/virtuallist";

export type ScrollDirection = "forward" | "backward" | null;

const props = withDefaults(
	defineProps<{
		items: T[];
		getItemKey: (item: T, index: number) => string | number;
		estimateSize?: (index: number) => number;
		overscan?: number;
		snapshot?: VirtualSnapshot | null;
		firstInitAtTheBottom?: boolean;
		isLoading?: boolean;
	}>(),
	{
		estimateSize: () => 80,
		overscan: 5,
		snapshot: null,
		firstInitAtTheBottom: true,
	},
);

const emit = defineEmits<{
	snapshot: [snapshot: VirtualSnapshot];
	loadMore: [];
	loadMoreFromBottom: [];
}>();

const scrollElement = ref<HTMLElement | null>(null);
const initialized = ref(false);
const initializing = ref(false);
const highlightedItemKey = ref<string | number | null>(null);
let highlightTimer: ReturnType<typeof setTimeout> | undefined;

const getItemKey = (index: number) => {
	const item = props.items[index];

	return item ? props.getItemKey(item, index) : index;
};

const stickCurrentPosition = async () => {
	const el = scrollElement.value;
	if (!el) return;

	const prevScrollHeight = el.scrollHeight;
	const prevScrollTop = el.scrollTop;

	await nextTick();

	const delta = el.scrollHeight - prevScrollHeight;
	el.scrollTop = prevScrollTop + delta;
};

const virtualizer = useVirtualizer({
	get count() {
		return props.items.length;
	},

	getScrollElement: () => scrollElement.value,

	estimateSize: props.estimateSize,

	overscan: props.overscan,

	getItemKey,

	/**
	 * Restore previous position if available.
	 *
	 * Otherwise start from 0 temporarily.
	 * We will position the chat at the bottom once
	 * the initial items have been rendered.
	 */
	initialOffset: props.snapshot?.offset ?? 0,

	initialMeasurementsCache: props.snapshot?.measurements ?? [],

	/**
	 * Chat behavior.
	 */
	anchorTo: "end",

	followOnAppend: false,

	scrollEndThreshold: 80,
});

const virtualItems = computed(() => {
	return virtualizer.value.getVirtualItems();
});

const totalSize = computed(() => {
	return virtualizer.value.getTotalSize();
});

const scrollDirection = computed<ScrollDirection>(() => {
	return virtualizer.value.scrollDirection;
});

/**
 * Initialize chat position.
 *
 * If we have a snapshot:
 *   restore it.
 *
 * Otherwise:
 *   go to the newest message.
 */
async function initializePosition() {
	if (initialized.value || initializing.value || props.items.length === 0) {
		return;
	}

	initializing.value = true;

	await nextTick();

	/**
	 * Wait for Vue to render the virtual items.
	 */
	await new Promise<void>((resolve) => {
		requestAnimationFrame(() => resolve());
	});

	/**
	 * Force measurement before calculating bottom.
	 */
	virtualizer.value.measure();

	await nextTick();

	requestAnimationFrame(() => {
		if (props.snapshot) {
			virtualizer.value.scrollToOffset(props.snapshot.offset, {
				behavior: "auto",
			});
		} else {
			/**
			 * IMPORTANT:
			 *
			 * Use `auto`, NOT `smooth`.
			 *
			 * This prevents the user from seeing:
			 *
			 * TOP -> BOTTOM
			 */
			if (props.firstInitAtTheBottom) {
				virtualizer.value.scrollToEnd({
					behavior: "auto",
				});
			}
		}

		initialized.value = true;
		initializing.value = false;
	});
}

/**
 * Initial messages may be loaded asynchronously.
 *
 * Example:
 *
 * items = []
 *      ↓
 * API request
 *      ↓
 * items = [...]
 *
 * We initialize only after messages exist.
 */
watch(
	() => props.items.length,
	() => {
		if (!initialized.value) {
			initializePosition();
		}
	},
	{
		immediate: true,
	},
);

watch(
	() => virtualizer.value.scrollOffset,
	(offset) => {
		if (offset === null) {
			return;
		}

		// At top
		if (offset <= 80) {
			emit("loadMore");
		}

		if (virtualizer.value.isAtEnd(80)) {
			emit("loadMoreFromBottom");
		}
	},
);

/**
 * Save current virtual state.
 */
function takeSnapshot() {
	const snapshot: VirtualSnapshot = {
		offset: virtualizer.value.scrollOffset ?? 0,
		measurements: virtualizer.value.takeSnapshot(),
	};

	emit("snapshot", snapshot);

	return snapshot;
}

function scrollToIndex(
	index: number,
	options?: {
		align?: VirtualListAlign;
		behavior?: VirtualListBehavior;
	},
) {
	virtualizer.value.scrollToIndex(index, options);
}

function scrollToEnd() {
	virtualizer.value.scrollToEnd();
}

function scrollToOffset(offset: number) {
	virtualizer.value.scrollToOffset(offset);
}

function isAtEnd(threshold = 80) {
	return virtualizer.value.isAtEnd(threshold);
}

function scrollToTop() {
	virtualizer.value.scrollToOffset(0);
}

function scrollToBottom(behavior: VirtualListBehavior = "smooth") {
	virtualizer.value.scrollToEnd({
		behavior,
	});
}

const isAtTop = computed(() => {
	const offset = virtualizer.value.scrollOffset;

	return offset === null || offset <= 0;
});

const isAtBottom = computed(() => {
	return virtualizer.value.isAtEnd(80);
});

const isScrolling = computed(() => {
	return virtualizer.value.isScrolling;
});

function scrollToItem(
	id: string | number,
	options?: {
		align?: VirtualListAlign;
		behavior?: VirtualListBehavior;
	},
	highlighted: boolean = true,
	highlightDuration: number = 2500,
) {
	const index = props.items.findIndex((item, itemIndex) => {
		return props.getItemKey(item, itemIndex) === id;
	});

	if (index === -1) {
		return;
	}

	// Scroll to item
	virtualizer.value.scrollToIndex(index, options);

	// Skip highlighted
	if (!highlighted) return;

	// Clear previous timer
	if (highlightTimer) {
		clearTimeout(highlightTimer);
	}

	// Highlight item
	highlightedItemKey.value = id;

	// Remove highlight after duration
	highlightTimer = setTimeout(() => {
		highlightedItemKey.value = null;
	}, highlightDuration);
}

defineExpose<VirtualListExpose>({
	isAtEnd,
	takeSnapshot,

	scrollToTop,
	scrollToBottom,
	scrollToIndex,
	scrollToEnd,
	scrollToOffset,

	isAtBottom,
	isAtTop,
	isScrolling,
	scrollToItem,
	stickCurrentPosition,
});
</script>

<template>
	<div
		ref="scrollElement"
		class="h-full overflow-x-hidden overflow-y-auto min-h-0 relative overscroll-y-contain"
		:style="{
			'overflow-anchor': 'none',
		}"
	>
		<!-- Loading -->
		<div class="flex items-center px-2" v-if="isLoading">
			<loader2
				class="animate-spin absolute top-[-0.5px] left-[50%]"
				color="gray"
				:size="18"
			/>
		</div>
		<div
			:style="{
				height: `${totalSize}px`,
				width: '100%',
				position: 'relative',
			}"
		>
			<div
				v-for="virtualItem in virtualItems"
				:key="String(virtualItem.key)"
				:data-index="virtualItem.index"
				:ref="
					(el) => {
						if (el) {
							virtualizer.measureElement(el as HTMLElement);
						}
					}
				"
				:style="{
					position: 'absolute',
					top: 0,
					left: 0,
					width: '100%',
					transform: `translateY(${virtualItem.start}px)`,
				}"
			>
				<slot
					name="bonus"
					:item="items[virtualItem.index]"
					:index="virtualItem.index"
					:virtual-item="virtualItem"
				>
				</slot>
				<slot
					:item="items[virtualItem.index]"
					:index="virtualItem.index"
					:virtual-item="virtualItem"
					:highlighted="
						props.getItemKey(items[virtualItem.index], virtualItem.index) ===
						highlightedItemKey
					"
					:scroll-direction="scrollDirection"
				/>
			</div>
		</div>
		<slot name="footer" />
	</div>
</template>
