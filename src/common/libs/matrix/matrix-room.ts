import type { MatrixClient, Room } from "matrix-js-sdk";
import { RoomMemberEvent } from "matrix-js-sdk";
import { ref } from "vue";

export const rooms = ref<Room[]>([]);

export async function autoJoinRoom(client: MatrixClient) {
	client.on(RoomMemberEvent.Membership, async (_, member) => {
		// Only care about invites for *me*
		if (member.userId !== client.getUserId()) return;
		if (member.membership !== "invite") return;

		try {
			await client.joinRoom(member.roomId);
			console.log("Joined", member.roomId);
		} catch (err) {
			console.error("Failed to join", member.roomId, err);
		}
	});
}

export function getRooms(client: MatrixClient): Room[] {
	try {
		return client?.getRooms?.() ?? [];
	} catch {
		return [];
	}
}

export function getRoomById(client: MatrixClient, roomId: string): Room | null {
	try {
		return client?.getRoom?.(roomId) ?? null;
	} catch {
		return null;
	}
}
