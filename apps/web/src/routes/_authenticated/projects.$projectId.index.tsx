import { createFileRoute, notFound, redirect } from '@tanstack/react-router'
import { projectQuery } from '@/projects/api/project-query'

export const Route = createFileRoute('/_authenticated/projects/$projectId/')({
  loader: async ({ context, params: { projectId } }) => {
    const project = await context.queryClient.ensureQueryData(projectQuery(projectId))
    const [floor] = project.floors

    if (floor === undefined) throw notFound()

    throw redirect({
      to: '/projects/$projectId/floors/$floorId',
      params: { projectId, floorId: floor.id },
      replace: true,
    })
  },
})
