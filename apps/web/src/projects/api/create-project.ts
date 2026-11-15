import { fetchApi } from '@/auth/api/fetch-api'

type CreatedProject = {
  id: string
  floorId: string
}

export const createProject = (name: string) =>
  fetchApi<CreatedProject>('/projects', { method: 'POST', body: { name } })
