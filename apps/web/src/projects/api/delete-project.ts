import type { QueryClient } from '@tanstack/react-query'
import { fetchApi } from '@/auth/api/fetch-api'
import { removePlanImage } from '@/floor-plan/api/plan-storage'
import { projectQuery } from './project-query'

export const deleteProject = async (client: QueryClient, projectId: string) => {
  const { floors } = await client.fetchQuery(projectQuery(projectId))

  await fetchApi(`/projects/${projectId}`, { method: 'DELETE' })

  // The project is gone either way; an image left behind is unreachable, not a failed delete.
  await Promise.allSettled(
    floors.flatMap(({ plan }) => (plan === null ? [] : [removePlanImage(plan.imagePath)])),
  )
}
