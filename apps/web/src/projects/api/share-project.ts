import { fetchApi } from '@/auth/api/fetch-api'

export const shareProject = (projectId: string, email: string) =>
  fetchApi(`/projects/${projectId}/shares`, { method: 'POST', body: { email } })
