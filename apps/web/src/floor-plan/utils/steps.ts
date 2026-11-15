import type { Step } from '@/projects/api/project-query'

export const steps = [
  'file',
  'crop',
  'scale',
  'walls',
  'dimensions',
  'openings',
] as const satisfies Step[]

export const furthestStepOf = (first: Step, second: Step) =>
  steps.indexOf(first) > steps.indexOf(second) ? first : second
