import { useId } from 'react'
import { usePlanImageUrl } from '@/floor-plan/hooks/use-plan-image-url'
import type { Plan, Rect } from '@/projects/api/project-query'
import { PlanImage } from '../PlanImage'
import classes from './CroppedPlan.module.css'

type Props = {
  plan: Plan
  rotationDeg: number
  crop: Rect
}

export const CroppedPlan = ({ plan, rotationDeg, crop }: Props) => {
  const clipId = useId()
  const url = usePlanImageUrl(plan.imagePath)

  return (
    <>
      <clipPath id={clipId}>
        <rect {...crop} />
      </clipPath>
      <rect {...crop} className={classes.paper} />
      {url === undefined ? null : (
        <g clipPath={`url(#${clipId})`}>
          <PlanImage href={url} width={plan.width} height={plan.height} rotationDeg={rotationDeg} />
        </g>
      )}
    </>
  )
}
