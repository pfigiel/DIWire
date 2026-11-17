import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Button, Modal, Text } from '@diwire/ui-kit'
import { deleteFloor } from '@/floor-plan/api/delete-floor'
import { useFloorEditor } from '@/floor-plan/contexts/floor-editor'
import { projectQuery } from '@/projects/api/project-query'
import { projectsQuery } from '@/projects/api/projects-query'
import { floorNameOf } from '@/projects/utils/floor-name-of'
import classes from './DeleteFloorModal.module.css'

type Props = {
  opened: boolean
  onClose: () => void
}

export const DeleteFloorModal = ({ opened, onClose }: Props) => {
  const { t } = useTranslation()
  const { project, floor } = useFloorEditor()

  const deletion = useMutation({
    mutationFn: () => deleteFloor(project.id, floor),
    onSuccess: async (_deleted, _variables, _result, { client }) => {
      void client.invalidateQueries({ queryKey: projectsQuery.queryKey, exact: true })
      // Refetched rather than patched, since the floors above were renumbered; the screen then
      // finds this floor gone and leaves for the project's first one.
      await client.invalidateQueries({ queryKey: projectQuery(project.id).queryKey })
    },
  })

  return (
    <Modal opened={opened} title={t('floorPlan.floors.delete.title')} onClose={onClose}>
      <div className={classes.root}>
        <Text>
          {t('floorPlan.floors.delete.warning', { name: floorNameOf(t, floor.position) })}
        </Text>
        {deletion.isError ? <Text size="sm">{t('floorPlan.floors.delete.failed')}</Text> : null}
        <div className={classes.actions}>
          <Button variant="secondary" onClick={onClose}>
            {t('floorPlan.floors.delete.cancel')}
          </Button>
          <Button loading={deletion.isPending} onClick={() => deletion.mutate()}>
            {t('floorPlan.floors.delete.confirm')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
