# Matrix JS SDK Integration Guide

**Project**: Matrix Customer Service (`matrix-customer-service-vite`)  
**Package**: `matrix-js-sdk` v45+ (Client Consumption)

---

## 1. Architectural Role of Matrix SDK

In this project, `matrix-js-sdk` is consumed as a client library to communicate with the Matrix homeserver. The SDK lifecycle is strictly partitioned to prevent leaking Matrix protocol dependencies into presentation templates:

```
src/common/libs/matrix/
├── matrix.ts            # Client singleton, status lifecycle (INITIALIZING, PREPARING, SYNCING, etc.)
├── matrix-room.ts       # Room getters (getRoomById, getRooms, autoJoinRoom)
└── matrix-message.ts    # Timeline queries & pagination (getRoomTimelineEvents, paginateRoomTimeline)
         │
         ▼ Consumed by
src/common/composables/
└── useChatRoom.ts       # Reactive room & message stream, listener lifecycle
         │
         ▼ Consumed by
src/pages/
└── ChatPage.vue         # Pure presentation template
```

---

## 2. Core Matrix Client Module (`src/common/libs/matrix/matrix.ts`)

- **State Management**:
  - `matrixClient`: `shallowRef<MatrixClient | null>(null)` - Singleton client instance.
  - `matrixStatus`: `ref<MatrixStatus>("STOPPED")` - Tracks connection state: `INITIALIZING`, `PREPARING`, `SYNCING`, `RECONNECTING`, `ERROR`, `STOPPED`.
- **Initialization**:
  - `initialize(config: IMatrixConfig): Promise<void>` creates persistent event storage using `IndexedDBStore`, listens for `ClientEvent.Sync`, and starts syncing with `startClient({ initialSyncLimit: 20 })`.
- **Lifecycle Teardown**:
  - `stop(): void` stops the client, cleans up event listeners, and resets status to `STOPPED`.

---

## 3. Room & Timeline Utilities

### 3.1 Room Queries (`src/common/libs/matrix/matrix-room.ts`)
```ts
export function getRoomById(client: MatrixClient, roomId: string): Room | null {
  try {
    return client?.getRoom?.(roomId) ?? null;
  } catch {
    return null;
  }
}
```

### 3.2 Timeline & Pagination (`src/common/libs/matrix/matrix-message.ts`)
```ts
export function getRoomTimelineEvents(room: Room): MatrixEvent[] {
  try {
    return room?.getLiveTimeline().getEvents() ?? [];
  } catch {
    return [];
  }
}

export async function paginateRoomTimeline(
  client: MatrixClient,
  room: Room,
  limit = 30,
): Promise<boolean> {
  const timeline = room.getLiveTimeline();
  return (
    (await client.paginateEventTimeline(timeline, {
      backwards: true,
      limit,
    })) ?? false
  );
}
```

---

## 4. Reactive Consumption in Composables

Never attach Matrix SDK listeners directly in `.vue` files. Wrap them in a composable that registers listeners and handles unmounting cleanly:

```ts
// src/common/composables/useChatRoom.ts
import { computed, onUnmounted, ref, toValue, watch, type MaybeRefOrGetter } from "vue";
import { RoomEvent, type MatrixEvent, type Room } from "matrix-js-sdk";
import { matrixClient, matrixStatus, MatrixStatus } from "@/common/libs/matrix/matrix";
import { getRoomTimelineEvents } from "@/common/libs/matrix/matrix-message";
import { getRoomById } from "@/common/libs/matrix/matrix-room";

export function useChatRoom(roomIdSource: MaybeRefOrGetter<string>) {
  const refresh = ref(0);

  const room = computed(() => {
    void refresh.value;
    void matrixStatus.value;
    const client = matrixClient.value;
    if (!client) return null;
    return getRoomById(client, decodeURIComponent(toValue(roomIdSource)));
  });

  const messages = computed(() => {
    void refresh.value;
    void matrixStatus.value;
    if (!room.value) return [];
    return getRoomTimelineEvents(room.value);
  });

  const handleTimeline = (_event: MatrixEvent, targetRoom?: Room, toStart?: boolean) => {
    if (toStart || !targetRoom) return;
    refresh.value++;
  };

  watch(
    [matrixClient, matrixStatus],
    ([client, status]) => {
      if (!client || status !== MatrixStatus.SYNCING) return;
      client.on(RoomEvent.Timeline, handleTimeline);
    },
    { immediate: true },
  );

  onUnmounted(() => {
    matrixClient.value?.off(RoomEvent.Timeline, handleTimeline);
  });

  return { room, messages, matrixStatus };
}
```

---

## 5. Security & Credentials Rule

- **NEVER** hardcode Matrix access tokens, user IDs, or device IDs in source code or Vue providers.
- Source all test tokens from environment variables (`VITE_MATRIX_ACCESS_TOKEN`, `VITE_MATRIX_USER_ID`, etc.) and ensure `.env` remains in `.gitignore`.
