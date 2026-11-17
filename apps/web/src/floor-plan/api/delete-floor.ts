import { fetchApi } from '@/auth/api/fetch-api'
import type { Floor } from '@/projects/api/project-query'
import { removePlanImage } from './plan-storage'

export const deleteFloor = async (projectId: string, { id, plan }: Pick<Floor, 'id' | 'plan'>) => {
  await fetchApi(`/projects/${projectId}/floors/${id}`, { method: 'DELETE' })

  // The floor is gone either way; an image left behind is unreachable, not a failed delete.
  if (plan !== null) await removePlanImage(plan.imagePath).catch(() => undefined)
}
