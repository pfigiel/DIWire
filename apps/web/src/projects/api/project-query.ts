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

export type WallKind = 'exterior' | 'loadBearing' | 'partition' | 'custom'

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
