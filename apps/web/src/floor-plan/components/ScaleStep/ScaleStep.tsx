import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, NumberInput, Text } from '@diwire/ui-kit'
import { useFloorEditor } from '@/floor-plan/contexts/floor-editor'
import { useUpdateFloor } from '@/floor-plan/hooks/use-update-floor'
import { furthestStepOf } from '@/floor-plan/utils/steps'
import { centimetersLabelOf } from '@/formatting/labels'
import type { Plan, Rect } from '@/projects/api/project-query'
import { CroppedPlan } from '../CroppedPlan'
import { DimensionLine } from '../DimensionLine'
import { PlanCanvas } from '../PlanCanvas'
import { StepLayout } from '../StepLayout'
import classes from './ScaleStep.module.css'

type Props = {
  plan: Plan
  crop: Rect
}

const dimensionOffsetPx = 36
const unset = '—'

const labelOf = (centimeters: number | null) =>
  centimeters === null ? unset : centimetersLabelOf(centimeters)

export const ScaleStep = ({ plan, crop }: Props) => {
  const { t } = useTranslation()
  const { floor, selectStep } = useFloorEditor()
  const update = useUpdateFloor()
  const [width, setWidth] = useState(floor.outline?.widthCm ?? null)
  const [height, setHeight] = useState(floor.outline?.heightCm ?? null)

  const save = () => {
    if (width === null || height === null) return

    update.mutate(
      {
        outline: { widthCm: width, heightCm: height },
        step: furthestStepOf(floor.step, 'walls'),
      },
      { onSuccess: () => selectStep('walls') },
    )
  }

  return (
    <StepLayout
      controls={
        <>
          <Text size="sm" tone="dimmed">
            {t('floorPlan.scale.hint')}
          </Text>
          <div className={classes.fields}>
            <NumberInput
              label={t('floorPlan.scale.width')}
              unit={t('floorPlan.scale.unit')}
              defaultValue={width}
              onChange={setWidth}
            />
            <NumberInput
              label={t('floorPlan.scale.height')}
              unit={t('floorPlan.scale.unit')}
              defaultValue={height}
              onChange={setHeight}
            />
          </div>
        </>
      }
      action={
        <Button disabled={!width || !height} loading={update.isPending} onClick={save}>
          {t('floorPlan.scale.next')}
        </Button>
      }
      failed={update.isError}
    >
      <PlanCanvas label={t('floorPlan.scale.canvas')} bounds={crop}>
        {({ scale }) => {
          const offset = dimensionOffsetPx / scale
          const right = crop.x + crop.width
          const bottom = crop.y + crop.height

          return (
            <>
              <CroppedPlan plan={plan} rotationDeg={floor.rotationDeg} crop={crop} />
              <DimensionLine
                from={{ x: crop.x, y: crop.y - offset }}
                to={{ x: right, y: crop.y - offset }}
                label={labelOf(width)}
                scale={scale}
              />
              <DimensionLine
                from={{ x: crop.x - offset, y: crop.y }}
                to={{ x: crop.x - offset, y: bottom }}
                label={labelOf(height)}
                scale={scale}
              />
            </>
          )
        }}
      </PlanCanvas>
    </StepLayout>
  )
}
