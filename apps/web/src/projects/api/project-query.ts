import { queryOptions } from '@tanstack/react-query'
import { fetchApi } from '@/auth/api/fetch-api'

export type Step = 'file' | 'crop' | 'scale' | 'walls' | 'dimensions' | 'openings'

export type Rect = {
  x: number
  y: number
  width: number
  height: number
}

export type Plan = {
  name: string
  /** The page of a multi-page PDF the image was taken from; null for an image or a one-page PDF. */
  page: number | null
  imagePath: string
  width: number
  height: number
}

export type Outline = {
  widthCm: number
  heightCm: number
}

/** Where a wall stops: on another wall, which it then follows, or at a point of its own along its run. */
export type WallEnd = { wallId: string } | { position: number }

/** A divider is not a wall: it has no thickness and only splits an open space into rooms. */
export type WallKind = 'exterior' | 'loadBearing' | 'partition' | 'custom' | 'divider'

/** In centimetres, from the outline's top-left corner. */
export type Wall = {
  id: string
  orientation: 'horizontal' | 'vertical'
  /** The centre line's place across the wall's run: y for a horizontal wall, x for a vertical one. */
  center: number
  thicknessCm: number
  kind: WallKind
  from: WallEnd
  to: WallEnd
}

/** A verified dimension: the distance from one wall face to another, each named "<wall id>:<min|max|from|to>". */
export type Lock = {
  a: string
  b: string
  valueCm: number
}

/** A name the user gave a room. Rooms are derived from the walls, so it belongs to whichever room holds its point. */
export type RoomName = {
  name: string
  x: number
  y: number
}

export type Floor = {
  id: string
  position: number
  /** The furthest step the floor has reached, not the one on screen. */
  step: Step
  plan: Plan | null
  rotationDeg: number
  /** In image pixels, in the rotated image's space with the origin at the image's centre. */
  crop: Rect | null
  outline: Outline | null
  walls: Wall[]
  locks: Lock[]
  rooms: RoomName[]
}

export type Project = {
  id: string
  name: string
  floors: Floor[]
}

export const projectQuery = (projectId: string) =>
  queryOptions({
    queryKey: ['projects', projectId],
    queryFn: () => fetchApi<Project>(`/projects/${projectId}`),
  })
