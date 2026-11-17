import { fetchApi } from '@/auth/api/fetch-api'

export const acceptInvitation = (projectId: string) =>
  fetchApi(`/projects/${projectId}/invitation/accept`, { method: 'POST' })

export const rejectInvitation = (projectId: string) =>
  fetchApi(`/projects/${projectId}/invitation`, { method: 'DELETE' })
