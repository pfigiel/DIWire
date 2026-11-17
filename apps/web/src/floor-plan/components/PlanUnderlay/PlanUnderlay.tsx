import { useFloorEditor } from '@/floor-plan/contexts/floor-editor'
import type { Outline, Plan, Rect } from '@/projects/api/project-query'
import { CroppedPlan } from '../CroppedPlan'
import classes from './PlanUnderlay.module.css'

type Props = {
  plan: Plan
  crop: Rect
  outline: Outline
  shown: boolean
}

/** The cropped plan at half strength, stretched to the outline so it lies under what is drawn in centimetres. */
export const PlanUnderlay = ({ plan, crop, outline, shown }: Props) => {
  const { floor } = useFloorEditor()

  return (
    <g
      className={classes.root}
      data-hidden={!shown || undefined}
      transform={`scale(${outline.widthCm / crop.width} ${outline.heightCm / crop.height}) translate(${-crop.x} ${-crop.y})`}
    >
      <CroppedPlan plan={plan} rotationDeg={floor.rotationDeg} crop={crop} />
    </g>
  )
}
