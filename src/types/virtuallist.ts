import { useVirtualizer } from "@tanstack/vue-virtual";
import type { Ref } from "vue";

export type VirtualSnapshot = {
	offset: number;
	measurements: ReturnType<
		ReturnType<typeof useVirtualizer>["value"]["takeSnapshot"]
	>;
};

export type VirtualListBehavior = "auto" | "smooth";
export type VirtualListAlign = "start" | "center" | "end" | "auto";

export type VirtualListExpose = {
	scrollToTop: () => void;
	scrollToBottom: (behavior?: VirtualListBehavior) => void;
	scrollToIndex: (
		index: number,
		options?: {
			align?: VirtualListAlign;
			behavior?: VirtualListBehavior;
		},
	) => void;
	takeSnapshot: () => VirtualSnapshot;
	isAtEnd: (threshold?: number) => boolean;
	scrollToEnd: () => void;
	scrollToOffset: (offset: number) => void;
	isAtBottom: Readonly<Ref<boolean>>;
	isAtTop: Readonly<Ref<boolean>>;
	isScrolling: Readonly<Ref<boolean>>;
	scrollToItem: (
		id: string | number,
		options?: {
			align?: VirtualListAlign;
			behavior?: VirtualListBehavior;
		},
		highlighted?: boolean,
		highlightedTime?: number,
	) => void;
	stickCurrentPosition: () => Promise<void>;
};
