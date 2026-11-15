import { IconRotate2, IconRotateClockwise2 } from '@tabler/icons-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Heading, Slider, Text } from '@diwire/ui-kit'
import { useFloorEditor } from '@/floor-plan/contexts/floor-editor'
import { usePlanImageUrl } from '@/floor-plan/hooks/use-plan-image-url'
import { useUpdateFloor } from '@/floor-plan/hooks/use-update-floor'
import {
  fineAngleOf,
  insetOf,
  normalizedAngleOf,
  quarterTurnedOf,
  sheetBoundsOf,
  withFineAngleOf,
} from '@/floor-plan/utils/geometry'
import { furthestStepOf } from '@/floor-plan/utils/steps'
import { degreesLabelOf } from '@/formatting/labels'
import type { Plan } from '@/projects/api/project-query'
import { CropFrame } from '../CropFrame'
import { PlanCanvas } from '../PlanCanvas'
import { PlanImage } from '../PlanImage'
import { StepLayout } from '../StepLayout'
import classes from './CropStep.module.css'

type Props = {
  plan: Plan
}

const fineLimit = 10
const fineStep = 0.1
const initialInset = 0.1

export const CropStep = ({ plan }: Props) => {
  const { t } = useTranslation()
  const { floor, selectStep } = useFloorEditor()
  const update = useUpdateFloor()
  const imageUrl = usePlanImageUrl(plan.imagePath)
  const [rotation, setRotation] = useState(floor.rotationDeg)
  const [crop, setCrop] = useState(
    () => floor.crop ?? insetOf(sheetBoundsOf(plan, floor.rotationDeg), initialInset),
  )
  const fine = fineAngleOf(rotation)

  const turn = (direction: 1 | -1) => {
    setRotation(normalizedAngleOf(rotation + direction * 90))
    setCrop(quarterTurnedOf(crop, direction))
  }

  const save = () => {
    update.mutate(
      { rotationDeg: rotation, crop, step: furthestStepOf(floor.step, 'scale') },
      { onSuccess: () => selectStep('scale') },
    )
  }

  return (
    <StepLayout
      controls={
        <>
          <div className={classes.section}>
            <Heading order={3}>{t('floorPlan.crop.frame')}</Heading>
            <Text size="sm" tone="dimmed">
              {t('floorPlan.crop.frameHint')}
            </Text>
          </div>
          <div className={classes.section}>
            <Heading order={3}>{t('floorPlan.crop.rotate')}</Heading>
            <div className={classes.turns}>
              <Button
                variant="secondary"
                size="sm"
                icon={<IconRotate2 aria-hidden className={classes.icon} />}
                onClick={() => turn(-1)}
              >
                {t('floorPlan.crop.left')}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={<IconRotateClockwise2 aria-hidden className={classes.icon} />}
                onClick={() => turn(1)}
              >
                {t('floorPlan.crop.right')}
              </Button>
            </div>
            <div className={classes.fine}>
              <Slider
                label={t('floorPlan.crop.fine')}
                value={Math.max(-fineLimit, Math.min(fineLimit, fine))}
                min={-fineLimit}
                max={fineLimit}
                step={fineStep}
                onChange={(value) => setRotation(withFineAngleOf(rotation, value))}
              />
              <span className={classes.angle}>{degreesLabelOf(fine)}</span>
            </div>
          </div>
        </>
      }
      action={
        <Button loading={update.isPending} onClick={save}>
          {t('floorPlan.crop.next')}
        </Button>
      }
      failed={update.isError}
    >
      <PlanCanvas label={t('floorPlan.crop.canvas')} bounds={sheetBoundsOf(plan, rotation)}>
        {(view) => (
          <>
            {imageUrl === undefined ? null : (
              <PlanImage
                href={imageUrl}
                width={plan.width}
                height={plan.height}
                rotationDeg={rotation}
              />
            )}
            <CropFrame crop={crop} view={view} onChange={setCrop} />
          </>
        )}
      </PlanCanvas>
    </StepLayout>
  )
}
