import { useState } from 'react'
import { FloorEditorContext } from '@/floor-plan/contexts/floor-editor'
import type { Floor, Project, Step } from '@/projects/api/project-query'
import { CropStep } from '../CropStep'
import { DimensionsStep } from '../DimensionsStep'
import { FileStep } from '../FileStep'
import { OpeningsStep } from '../OpeningsStep'
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

  if (activeStep === 'dimensions') return <DimensionsStep outline={floor.outline} />

  return <OpeningsStep plan={floor.plan} crop={floor.crop} outline={floor.outline} />
}

export const FloorEditor = ({ project, floor }: Props) => {
  const [activeStep, setActiveStep] = useState<Step>(floor.step)

  return (
    <FloorEditorContext value={{ project, floor, activeStep, selectStep: setActiveStep }}>
      {stepScreenOf(floor, activeStep)}
    </FloorEditorContext>
  )
}
