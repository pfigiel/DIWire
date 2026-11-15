import { useSuspenseQuery } from '@tanstack/react-query'
import { Navigate } from '@tanstack/react-router'
import { projectQuery } from '@/projects/api/project-query'
import { FloorEditor } from '../FloorEditor'

type Props = {
  projectId: string
  floorId: string
}

export const FloorPlanScreen = ({ projectId, floorId }: Props) => {
  const { data: project } = useSuspenseQuery(projectQuery(projectId))
  const floor = project.floors.find(({ id }) => id === floorId)

  if (floor === undefined) {
    return <Navigate to="/projects/$projectId" params={{ projectId }} replace />
  }

  return <FloorEditor key={floor.id} project={project} floor={floor} />
}
