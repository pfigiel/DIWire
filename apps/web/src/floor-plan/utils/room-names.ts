import type { RoomName } from '@/projects/api/project-query'
import { regionAtOf, type Region } from './regions-of'

/** The name the user gave a room, if any of the stored names has its point inside it. */
export const roomNameOf = (room: Region, regions: Region[], names: RoomName[]) =>
  names.find((name) => regionAtOf(regions, name) === room)?.name

export const renamedRoomsOf = (
  names: RoomName[],
  room: Region,
  regions: Region[],
  name: string,
) => [...names.filter((other) => regionAtOf(regions, other) !== room), { name, ...room.label }]

/** Each name moved to the label point of the room it now belongs to, so it stays well inside as walls shift. */
export const settledRoomsOf = (names: RoomName[], regions: Region[]) =>
  names.map((name) => ({ ...name, ...(regionAtOf(regions, name)?.label ?? {}) }))
