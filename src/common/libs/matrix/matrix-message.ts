import {
	Method,
	type IEvent,
	type MatrixClient,
	type MatrixEvent,
	type Room,
} from "matrix-js-sdk";

export type TimelinePaginationDirection = "oldest" | "newest";

export function getRoomTimeLineEvents(room: Room): MatrixEvent[] {
	try {
		return room?.getLiveTimeline().getEvents() ?? [];
	} catch {
		return [];
	}
}

export async function paginateRoomTimeline(
	client: MatrixClient,
	room: Room,
	direction: TimelinePaginationDirection = "oldest",
	limit = 30,
): Promise<boolean> {
	const timeline = room.getLiveTimeline();
	const backwards = direction === "oldest";
	try {
		return (
			(await client.paginateEventTimeline(timeline, {
				backwards,
				limit,
			})) ?? false
		);
	} catch (error) {
		console.error(`Failed to paginate room timeline (${direction}):`, error);
		return false;
	}
}

export async function getNextRoomTimeLineEvents(
	client: MatrixClient,
	room: Room,
	limit = 30,
): Promise<boolean> {
	return paginateRoomTimeline(client, room, "oldest", limit);
}

export async function getRoomEventByIdFromServer(
	client: MatrixClient,
	room: Room,
	eventId: string,
	options?: {
		AbortSignal: AbortSignal;
	},
): Promise<MatrixEvent | undefined> {
	try {
		const path = `/rooms/${decodeURIComponent(room.roomId)}/event/${decodeURIComponent(eventId)}`;
		const raw = (await client.http.authedRequest(
			Method.Get,
			path,
			undefined,
			undefined,
			{
				abortSignal: options?.AbortSignal,
			},
		)) as Partial<IEvent>;
		const event = client.getEventMapper()(raw);
		return event;
	} catch (e) {
		console.error(e);
		return undefined;
	}
}

export function getRoomEventById(
	room: Room,
	eventId: string,
): MatrixEvent | undefined {
	return room?.findEventById(eventId);
}
