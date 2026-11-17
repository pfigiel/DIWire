import { queryOptions } from '@tanstack/react-query'
import { fetchApi } from '@/auth/api/fetch-api'
import type { Floor } from './project-query'

export type ProjectShare = {
  status: 'pending' | 'accepted'
  /** The owner's email. */
  invitedBy: string
}

export type ProjectSummary = {
  id: string
  name: string
  /** Empty until a share is accepted: an invitation shows the project, not what is in it. */
  floors: Pick<Floor, 'id' | 'position' | 'step'>[]
  /** How a project that is someone else's reached this user; null for their own. */
  share: ProjectShare | null
}

export const projectsQuery = queryOptions({
  queryKey: ['projects'],
  queryFn: () => fetchApi<ProjectSummary[]>('/projects'),
})
