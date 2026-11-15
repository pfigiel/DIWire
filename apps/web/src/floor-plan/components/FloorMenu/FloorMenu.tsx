import { IconPlus, IconStack2 } from '@tabler/icons-react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { SelectMenu } from '@diwire/ui-kit'
import { addFloor } from '@/floor-plan/api/add-floor'
import { useFloorEditor } from '@/floor-plan/contexts/floor-editor'
import { projectQuery } from '@/projects/api/project-query'
import { projectsQuery } from '@/projects/api/projects-query'
import { floorNameOf } from '@/projects/utils/floor-name-of'

export const FloorMenu = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { project, floor } = useFloorEditor()

  const open = (floorId: string) =>
    navigate({
      to: '/projects/$projectId/floors/$floorId',
      params: { projectId: project.id, floorId },
    })

  const addition = useMutation({
    mutationFn: () => addFloor(project.id),
    onSuccess: async (added, _variables, _result, { client }) => {
      client.setQueryData(
        projectQuery(project.id).queryKey,
        (current) => current && { ...current, floors: [...current.floors, added] },
      )
      void client.invalidateQueries({ queryKey: projectsQuery.queryKey, exact: true })
      await open(added.id)
    },
  })

  return (
    <SelectMenu label={floorNameOf(t, floor.position)} icon={<IconStack2 aria-hidden />}>
      {project.floors.map((other) => (
        <SelectMenu.Item
          key={other.id}
          selected={other.id === floor.id}
          onClick={() => void open(other.id)}
        >
          {floorNameOf(t, other.position)}
        </SelectMenu.Item>
      ))}
      <SelectMenu.Divider />
      <SelectMenu.Item icon={<IconPlus aria-hidden />} onClick={() => addition.mutate()}>
        {t('floorPlan.floors.add')}
      </SelectMenu.Item>
    </SelectMenu>
  )
}
