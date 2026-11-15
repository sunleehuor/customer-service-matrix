<script setup lang="ts">
import type { MatrixEvent } from "matrix-js-sdk";
import { computed, ref } from "vue";
import { useRoute } from "vue-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import VirtualList from "@/components/VirtualList.vue";

import { useChatRoom } from "@/common/composables/useChatRoom";
import type { VirtualListExpose } from "@/types/virtuallist";

const route = useRoute();
const roomId = computed(() => route.params.id?.toString() ?? "");

const virtualListRef = ref<VirtualListExpose | null>(null);
const eventIdInput = ref("");

const {
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
} = useChatRoom(roomId);

async function handleJump(): Promise<void> {
	if (!eventIdInput.value.trim() || jumpLoading.value) return;
	await jumpToEvent(eventIdInput.value, virtualListRef.value);
}

function handleSelectEvent(id: string): void {
	eventIdInput.value = id;
}

async function handleSync(): Promise<void> {
	await syncMessages(syncDirection.value);
}
</script>

<template>
	<div class="mx-auto flex h-screen max-w-4xl flex-col gap-4 p-4">
		<!-- Header with room name and status -->
		<header
			class="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-card p-4"
		>
			<div>
				<h1 class="text-xl font-bold tracking-tight text-foreground">
					{{ room?.name || "Room" }}
				</h1>
				<p class="text-xs text-muted-foreground">
					Room ID: {{ roomId }} | Messages loaded: {{ messages.length }}
				</p>
			</div>
			<div class="flex items-center gap-2">
				<span
					class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
					:class="{
						'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300':
							matrixStatus === 'SYNCING',
						'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300':
							matrixStatus === 'INITIALIZING' || matrixStatus === 'PREPARING',
						'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300':
							matrixStatus === 'ERROR' || matrixStatus === 'STOPPED',
					}"
				>
					Status: {{ matrixStatus }}
				</span>
			</div>
		</header>

		<!-- Control Bar: Jump Message and Manual Sync Controls -->
		<section
			class="grid grid-cols-1 gap-3 rounded-lg border bg-card p-4 sm:grid-cols-2"
		>
			<!-- Jump to Message Feature -->
			<div class="flex flex-col gap-2">
				<label class="text-xs font-semibold uppercase text-muted-foreground">
					Jump to Message by Event ID
				</label>
				<div class="flex gap-2">
					<Input
						v-model="eventIdInput"
						placeholder="Input Event ID (e.g. $event_id...)"
						:disabled="jumpLoading || matrixStatus === 'PREPARING'"
						@keydown.enter="handleJump"
					/>
					<Button
						variant="default"
						:disabled="
							!eventIdInput.trim() ||
							jumpLoading ||
							matrixStatus === 'PREPARING'
						"
						@click="handleJump"
					>
						{{ jumpLoading ? "Searching..." : "Jump" }}
					</Button>
				</div>
				<p
					v-if="jumpResult"
					class="text-xs"
					:class="
						jumpResult.success
							? 'text-green-600 dark:text-green-400'
							: 'text-destructive'
					"
				>
					{{ jumpResult.message }}
				</p>
			</div>

			<!-- Manual Sync Feature (Newest or Oldest) -->
			<div class="flex flex-col gap-2">
				<label class="text-xs font-semibold uppercase text-muted-foreground">
					Manual Timeline Sync
				</label>
				<div class="flex flex-wrap items-center gap-2">
					<!-- Direction selector (oldest or newest) -->
					<div class="inline-flex rounded-md border bg-muted/40 p-0.5">
						<button
							type="button"
							class="rounded px-2.5 py-1 text-xs font-medium transition-colors"
							:class="
								syncDirection === 'oldest'
									? 'bg-background text-foreground shadow-xs'
									: 'text-muted-foreground hover:text-foreground'
							"
							@click="syncDirection = 'oldest'"
						>
							Oldest (↑)
						</button>
						<button
							type="button"
							class="rounded px-2.5 py-1 text-xs font-medium transition-colors"
							:class="
								syncDirection === 'newest'
									? 'bg-background text-foreground shadow-xs'
									: 'text-muted-foreground hover:text-foreground'
							"
							@click="syncDirection = 'newest'"
						>
							Newest (↓)
						</button>
					</div>

					<!-- Main Sync Button -->
					<Button
						variant="outline"
						:disabled="loading || matrixStatus === 'PREPARING'"
						@click="handleSync"
					>
						{{
							loading
								? "Syncing..."
								: `Sync ${syncDirection === "oldest" ? "Oldest" : "Newest"}`
						}}
					</Button>

					<!-- Direct shortcuts -->
					<Button
						variant="ghost"
						size="sm"
						class="text-xs text-muted-foreground"
						:disabled="loading"
						@click="syncMessages('oldest')"
					>
						Sync Oldest
					</Button>
					<Button
						variant="ghost"
						size="sm"
						class="text-xs text-muted-foreground"
						:disabled="loading"
						@click="syncMessages('newest')"
					>
						Sync Newest
					</Button>
				</div>
				<p v-if="syncStatusMessage" class="text-xs text-muted-foreground">
					{{ syncStatusMessage }}
				</p>
			</div>
		</section>

		<!-- Message Feed -->
		<main
			class="relative min-h-0 flex-1 overflow-hidden rounded-lg border bg-card"
		>
			<div
				v-if="!messages.length"
				class="flex h-full items-center justify-center text-muted-foreground"
			>
				No messages loaded in this room.
			</div>
			<VirtualList
				v-else
				ref="virtualListRef"
				:items="messages"
				:get-item-key="(message: MatrixEvent) => message.getId() ?? ''"
				:estimate-size="() => 80"
				:overscan="5"
				:is-loading="loading"
			>
				<template
					#default="{
						item,
						highlighted,
					}: {
						item: MatrixEvent;
						highlighted?: boolean;
					}"
				>
					<article
						class="border-b p-3 transition-colors duration-300"
						:class="
							highlighted
								? 'bg-amber-100 ring-2 ring-inset ring-amber-500 dark:bg-amber-950/70'
								: 'hover:bg-muted/40'
						"
					>
						<div class="mb-1 flex items-center justify-between gap-2 text-xs">
							<button
								type="button"
								title="Click to copy Event ID into Jump input"
								class="font-mono text-muted-foreground hover:text-foreground hover:underline"
								@click="handleSelectEvent(item.getId() ?? '')"
							>
								{{ item.getId() }}
							</button>
							<span class="text-muted-foreground">
								{{ new Date(item.getTs()).toLocaleTimeString() }}
							</span>
						</div>
						<div class="text-sm wrap-break-word text-foreground">
							{{ item.getContent().body }}
						</div>
					</article>
				</template>
			</VirtualList>
		</main>
	</div>
</template>
