import {
	Method,
	type IEvent,
	type MatrixClient,
	type MatrixEvent,
	type Room,
} from "matrix-js-sdk";

export function getRoomTimeLineEvents(room: Room): MatrixEvent[] {
	try {
		return room?.getLiveTimeline().getEvents() ?? [];
	} catch {
		return [];
	}
}

export async function getNextRoomTimeLineEvents(
	client: MatrixClient,
	room: Room,
): Promise<boolean> {
	try {
		const timeline = room.getLiveTimeline();
		return (
			(await client.paginateEventTimeline(timeline, {
				backwards: true,
				limit: 30,
			})) ?? []
		);
	} catch (e) {
		console.log(e);
		throw e;
	}
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
