import { createContext, use } from 'react'
import type { Floor, Project, Step } from '@/projects/api/project-query'

type FloorEditor = {
  project: Project
  floor: Floor
  /** The step on screen, which may be an earlier one than the floor has reached. */
  activeStep: Step
  selectStep: (step: Step) => void
}

export const FloorEditorContext = createContext<FloorEditor | null>(null)

export const useFloorEditor = () => {
  const editor = use(FloorEditorContext)

  if (editor === null) throw new Error('useFloorEditor needs a FloorEditorContext above it')

  return editor
}
