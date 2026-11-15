import { fetchApi } from '@/auth/api/fetch-api'
import type { Floor } from '@/projects/api/project-query'

export const addFloor = (projectId: string) =>
  fetchApi<Floor>(`/projects/${projectId}/floors`, { method: 'POST' })
