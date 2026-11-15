import type { TFunction } from 'i18next'
import { centimetersLabelOf, degreesLabelOf } from '@/formatting/labels'
import type { Floor, Step } from '@/projects/api/project-query'

export const stepSummaryOf = (t: TFunction, floor: Floor, step: Step) => {
  if (step === 'file' && floor.plan !== null) {
    const { name, page } = floor.plan

    return page === null ? name : t('floorPlan.file.summary', { name, number: page })
  }

  if (step === 'crop' && floor.rotationDeg !== 0) {
    return t('floorPlan.crop.summary', { angle: degreesLabelOf(floor.rotationDeg) })
  }

  if (step === 'scale' && floor.outline !== null) {
    return t('floorPlan.scale.summary', {
      width: centimetersLabelOf(floor.outline.widthCm),
      height: centimetersLabelOf(floor.outline.heightCm),
    })
  }

  return undefined
}
