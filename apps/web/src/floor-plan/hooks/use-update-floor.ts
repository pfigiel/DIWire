import { useMutation } from '@tanstack/react-query'
import { updateFloor, type FloorChanges } from '@/floor-plan/api/update-floor'
import { useFloorEditor } from '@/floor-plan/contexts/floor-editor'
import { projectQuery } from '@/projects/api/project-query'
import { projectsQuery } from '@/projects/api/projects-query'

export const useUpdateFloor = () => {
  const { project, floor } = useFloorEditor()

  return useMutation({
    // One at a time per floor, so an earlier save can never land after a later one.
    scope: { id: floor.id },
    mutationFn: (changes: FloorChanges) => updateFloor(project.id, floor.id, changes),
    onSuccess: (updated, _changes, _result, { client }) => {
      client.setQueryData(
        projectQuery(project.id).queryKey,
        (current) =>
          current && {
            ...current,
            floors: current.floors.map((other) => (other.id === updated.id ? updated : other)),
          },
      )
      void client.invalidateQueries({ queryKey: projectsQuery.queryKey, exact: true })
    },
  })
}
