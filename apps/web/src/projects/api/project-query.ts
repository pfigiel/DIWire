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

type Outline = {
  widthCm: number
  heightCm: number
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
