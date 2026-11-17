import { fetchApi } from '@/auth/api/fetch-api'
import type { Floor } from '@/projects/api/project-query'

export type FloorChanges = Partial<
  Pick<Floor, 'step' | 'plan' | 'rotationDeg' | 'crop' | 'outline' | 'walls' | 'locks' | 'rooms'>
>

export const updateFloor = (projectId: string, floorId: string, changes: FloorChanges) =>
  fetchApi<Floor>(`/projects/${projectId}/floors/${floorId}`, { method: 'PATCH', body: changes })
