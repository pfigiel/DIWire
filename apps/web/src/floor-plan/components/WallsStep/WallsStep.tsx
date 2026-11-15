import { useTranslation } from 'react-i18next'
import { Text } from '@diwire/ui-kit'
import { useFloorEditor } from '@/floor-plan/contexts/floor-editor'
import type { Plan, Rect } from '@/projects/api/project-query'
import { CroppedPlan } from '../CroppedPlan'
import { PlanCanvas } from '../PlanCanvas'
import { StepLayout } from '../StepLayout'

type Props = {
  plan: Plan
  crop: Rect
}

export const WallsStep = ({ plan, crop }: Props) => {
  const { t } = useTranslation()
  const { floor } = useFloorEditor()

  return (
    <StepLayout
      controls={
        <Text size="sm" tone="dimmed">
          {t('floorPlan.walls.hint')}
        </Text>
      }
    >
      <PlanCanvas label={t('floorPlan.walls.canvas')} bounds={crop}>
        {() => <CroppedPlan plan={plan} rotationDeg={floor.rotationDeg} crop={crop} />}
      </PlanCanvas>
    </StepLayout>
  )
}
