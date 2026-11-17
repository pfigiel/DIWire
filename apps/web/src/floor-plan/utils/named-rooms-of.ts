import type { TFunction } from 'i18next'
import type { RoomName } from '@/projects/api/project-query'
import type { Region } from './regions-of'
import { roomNameOf } from './room-names'

/** Each room with the name to show for it: the user's, or its number until they give one. */
export const namedRoomsOf = (t: TFunction, regions: Region[], names: RoomName[]) =>
  regions.map((region, index) => ({
    region,
    at: region.label,
    name: roomNameOf(region, regions, names) ?? t('floorPlan.rooms.unnamed', { number: index + 1 }),
  }))
