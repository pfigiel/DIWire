import { createFileRoute } from '@tanstack/react-router'
import { projectsQuery } from '@/projects/api/projects-query'
import { ProjectsScreen } from '@/projects/components/ProjectsScreen'

export const Route = createFileRoute('/_authenticated/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(projectsQuery),
  component: ProjectsScreen,
})
