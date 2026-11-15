import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { AppShell, StepList, Text, type StepListStep } from '@diwire/ui-kit'
import { useFloorEditor } from '@/floor-plan/contexts/floor-editor'
import { stepSummaryOf } from '@/floor-plan/utils/step-summary-of'
import { steps } from '@/floor-plan/utils/steps'
import { EditorHeader } from '../EditorHeader'
import { FloorMenu } from '../FloorMenu'
import classes from './StepLayout.module.css'

type Props = {
  /** The active step's controls, shown inside its entry on the step list. */
  controls: ReactNode
  /** The button that finishes the step. */
  action?: ReactNode
  failed?: boolean
  /** What the step shows in the workspace. */
  children: ReactNode
}

const stateOf = (index: number, active: number, reached: number): StepListStep['state'] => {
  if (index === active) return 'current'

  if (index < reached) return 'done'

  return index === reached ? 'available' : 'upcoming'
}

export const StepLayout = ({ controls, action, failed = false, children }: Props) => {
  const { t } = useTranslation()
  const { project, floor, activeStep, selectStep } = useFloorEditor()
  const active = steps.indexOf(activeStep)
  const reached = steps.indexOf(floor.step)

  const entries = steps.map((step, index) => ({
    key: step,
    label: t(`floorPlan.steps.${step}`),
    summary: stepSummaryOf(t, floor, step),
    state: stateOf(index, active, reached),
  }))

  const select = (key: string) => {
    const step = steps.find((candidate) => candidate === key)

    if (step !== undefined) selectStep(step)
  }

  return (
    <AppShell
      header={<EditorHeader projectName={project.name} />}
      sidebar={
        <>
          <FloorMenu />
          <hr className={classes.divider} />
          <StepList label={t('floorPlan.steps.label')} steps={entries} onSelect={select}>
            {controls}
          </StepList>
          <div className={classes.footer}>
            {failed ? (
              <div role="alert">
                <Text size="sm">{t('floorPlan.failed')}</Text>
              </div>
            ) : null}
            {action}
          </div>
        </>
      }
    >
      {children}
    </AppShell>
  )
}
