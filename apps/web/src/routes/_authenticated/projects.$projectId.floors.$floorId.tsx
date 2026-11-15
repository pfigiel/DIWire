import { createFileRoute } from '@tanstack/react-router'
import { FloorPlanScreen } from '@/floor-plan/components/FloorPlanScreen'
import { projectQuery } from '@/projects/api/project-query'

const FloorRoute = () => {
  const { projectId, floorId } = Route.useParams()

  return <FloorPlanScreen projectId={projectId} floorId={floorId} />
}

export const Route = createFileRoute('/_authenticated/projects/$projectId/floors/$floorId')({
  loader: ({ context, params: { projectId } }) =>
    context.queryClient.ensureQueryData(projectQuery(projectId)),
  component: FloorRoute,
})
