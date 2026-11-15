import { ref, shallowRef } from "vue";

import {
	ClientEvent,
	createClient,
	IndexedDBStore,
	SyncState,
	type MatrixClient,
} from "matrix-js-sdk";

interface IMatrixConfig {
	baseUrl: string;
	accessToken: string;
	userId: string;
	deviceId: string;
}

export const MatrixStatus = {
	INITIALIZING: "INITIALIZING",
	PREPARING: "PREPARING",
	SYNCING: "SYNCING",
	RECONNECTING: "RECONNECTING",
	ERROR: "ERROR",
	STOPPED: "STOPPED",
} as const;

export type MatrixStatus = (typeof MatrixStatus)[keyof typeof MatrixStatus];

export const matrixClient = shallowRef<MatrixClient | null>(null);
export const matrixStatus = ref<MatrixStatus>("STOPPED");
const error = shallowRef<Error | null>(null);
const cryptoReady = ref(false);

let cancelled = false;
let currentClient: MatrixClient | null = null;

export async function initialize(config: IMatrixConfig) {
	try {
		cancelled = false;
		matrixStatus.value = "INITIALIZING";
		error.value = null;
		cryptoReady.value = false;

		// 1. Create persistent event store
		const store = new IndexedDBStore({
			indexedDB: window.indexedDB,
			localStorage: window.localStorage,
			dbName: `matrix-${config.userId}`,
		});

		// 2. Create Matrix client
		const client = createClient({
			baseUrl: config.baseUrl,
			accessToken: config.accessToken,
			userId: config.userId,
			deviceId: config.deviceId,
			store,
		});

		currentClient = client;

		// 3. Restore cached rooms and events
		await store.startup();

		if (cancelled) {
			client.stopClient();
			return;
		}

		// 4. Initialize Rust crypto (E2EE) (skip)
		// Uses persistent IndexedDB crypto storage by default
		// await client.initRustCrypto();

		if (cancelled) {
			client.stopClient();
			return;
		}

		cryptoReady.value = true;

		// 5. Listen for synchronization
		client.on(ClientEvent.Sync, (state) => {
			switch (state) {
				case SyncState.Prepared:
				case SyncState.Syncing:
					matrixStatus.value = "SYNCING";
					break;

				case SyncState.Reconnecting:
					matrixStatus.value = "RECONNECTING";
					break;

				case SyncState.Error:
					matrixStatus.value = "ERROR";
					break;

				case SyncState.Stopped:
					matrixStatus.value = "STOPPED";
					break;
			}
		});

		// 6. Make client available to components
		matrixClient.value = client;
		matrixStatus.value = "PREPARING";

		// 7. Start Matrix synchronization
		await matrixClient.value.startClient({
			initialSyncLimit: 20,
		});
	} catch (err) {
		if (cancelled) return;

		error.value =
			err instanceof Error ? err : new Error("Matrix initialization failed");

		matrixStatus.value = "ERROR";
	}
}

export function stop() {
	cancelled = true;

	if (currentClient) {
		currentClient.stopClient();
		currentClient.removeAllListeners();
		currentClient = null;
	}

	matrixClient.value = null;
	cryptoReady.value = false;
	matrixStatus.value = "STOPPED";
}
