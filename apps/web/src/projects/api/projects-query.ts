import { queryOptions } from '@tanstack/react-query'
import { fetchApi } from '@/auth/api/fetch-api'
import type { Floor } from './project-query'

export type ProjectSummary = {
  id: string
  name: string
  floors: Pick<Floor, 'id' | 'position' | 'step'>[]
}

export const projectsQuery = queryOptions({
  queryKey: ['projects'],
  queryFn: () => fetchApi<ProjectSummary[]>('/projects'),
})
