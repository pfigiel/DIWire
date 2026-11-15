import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Modal, Text, TextInput } from '@diwire/ui-kit'
import { createProject } from '@/projects/api/create-project'
import { projectsQuery } from '@/projects/api/projects-query'
import classes from './NewProjectModal.module.css'

type Props = {
  opened: boolean
  onClose: () => void
}

export const NewProjectModal = ({ opened, onClose }: Props) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [name, setName] = useState('')

  const creation = useMutation({
    mutationFn: createProject,
    onSuccess: async ({ id, floorId }, _name, _result, { client }) => {
      void client.invalidateQueries({ queryKey: projectsQuery.queryKey, exact: true })
      await navigate({
        to: '/projects/$projectId/floors/$floorId',
        params: { projectId: id, floorId },
      })
    },
  })

  const blank = name.trim() === ''

  const create = () => {
    if (!blank) creation.mutate(name)
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    create()
  }

  return (
    <Modal opened={opened} title={t('projects.new.title')} onClose={onClose}>
      <form className={classes.root} onSubmit={submit}>
        <TextInput label={t('projects.new.name')} value={name} initialFocus onChange={setName} />
        {creation.isError ? <Text size="sm">{t('projects.new.failed')}</Text> : null}
        <Button disabled={blank} loading={creation.isPending} onClick={create}>
          {t('projects.new.create')}
        </Button>
      </form>
    </Modal>
  )
}
