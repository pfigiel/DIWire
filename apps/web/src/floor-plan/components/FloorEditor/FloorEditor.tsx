import { useState } from 'react'
import { FloorEditorContext } from '@/floor-plan/contexts/floor-editor'
import { furthestStepOf } from '@/floor-plan/utils/steps'
import type { Floor, Project, Step } from '@/projects/api/project-query'
import { CropStep } from '../CropStep'
import { DimensionsStep } from '../DimensionsStep'
import { FileStep } from '../FileStep'
import { ScaleStep } from '../ScaleStep'
import { WallsStep } from '../WallsStep'

type Props = {
  project: Project
  floor: Floor
}

const stepScreenOf = (floor: Floor, activeStep: Step) => {
  if (activeStep === 'file' || floor.plan === null) return <FileStep />

  if (activeStep === 'crop' || floor.crop === null) return <CropStep plan={floor.plan} />

  if (activeStep === 'scale' || floor.outline === null) {
    return <ScaleStep plan={floor.plan} crop={floor.crop} />
  }

  if (activeStep === 'walls') {
    return <WallsStep plan={floor.plan} crop={floor.crop} outline={floor.outline} />
  }

  return <DimensionsStep outline={floor.outline} />
}

export const FloorEditor = ({ project, floor }: Props) => {
  // Dimensions is the last step built, so a floor further along still opens there.
  const [activeStep, setActiveStep] = useState<Step>(() =>
    furthestStepOf(floor.step, 'dimensions') === floor.step ? 'dimensions' : floor.step,
  )

  return (
    <FloorEditorContext value={{ project, floor, activeStep, selectStep: setActiveStep }}>
      {stepScreenOf(floor, activeStep)}
    </FloorEditorContext>
  )
}
