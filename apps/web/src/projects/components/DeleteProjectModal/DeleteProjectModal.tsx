import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Button, Modal, Text } from '@diwire/ui-kit'
import { deleteProject } from '@/projects/api/delete-project'
import { projectQuery } from '@/projects/api/project-query'
import { projectsQuery, type ProjectSummary } from '@/projects/api/projects-query'
import classes from './DeleteProjectModal.module.css'

type Props = {
  project: ProjectSummary
  opened: boolean
  onClose: () => void
}

export const DeleteProjectModal = ({ project, opened, onClose }: Props) => {
  const { t } = useTranslation()
  const client = useQueryClient()

  const deletion = useMutation({
    mutationFn: () => deleteProject(client, project.id),
    onSuccess: async () => {
      client.removeQueries({ queryKey: projectQuery(project.id).queryKey })
      await client.invalidateQueries({ queryKey: projectsQuery.queryKey, exact: true })
    },
  })

  return (
    <Modal opened={opened} title={t('projects.delete.title')} onClose={onClose}>
      <div className={classes.root}>
        <Text>{t('projects.delete.warning', { name: project.name })}</Text>
        {deletion.isError ? <Text size="sm">{t('projects.delete.failed')}</Text> : null}
        <div className={classes.actions}>
          <Button variant="secondary" onClick={onClose}>
            {t('projects.delete.cancel')}
          </Button>
          <Button loading={deletion.isPending} onClick={() => deletion.mutate()}>
            {t('projects.delete.confirm')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
