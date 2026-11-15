import { useQuery } from '@tanstack/react-query'
import { planImageQuery } from '@/floor-plan/api/plan-storage'

export const usePlanImageUrl = (path: string | undefined) =>
  useQuery({ ...planImageQuery(path ?? ''), enabled: path !== undefined }).data
