import {
  type IEvent,
  type MatrixClient,
  type MatrixEvent,
  type Room,
  Method,
} from "matrix-js-sdk";

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

export async function fetchRoomEventById(
  client: MatrixClient,
  room: Room,
  eventId: string,
): Promise<MatrixEvent | undefined> {
  try {
    const path = `/rooms/${decodeURIComponent(room.roomId)}/event/${decodeURIComponent(eventId)}`;
    const raw = (await client.http.authedRequest(
      Method.Get,
      path,
    )) as Partial<IEvent>;
    return client.getEventMapper()(raw);
  } catch (error) {
    console.error("Failed to fetch room event:", error);
    return undefined;
  }
}
