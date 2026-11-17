import { useMutation } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Modal, Text, TextInput } from '@diwire/ui-kit'
import type { ProjectSummary } from '@/projects/api/projects-query'
import { shareProject } from '@/projects/api/share-project'
import classes from './ShareProjectModal.module.css'

type Props = {
  project: ProjectSummary
  opened: boolean
  onClose: () => void
}

const emailPattern = /^\S+@\S+\.\S+$/

export const ShareProjectModal = ({ project, opened, onClose }: Props) => {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')

  const sharing = useMutation({ mutationFn: () => shareProject(project.id, email.trim()) })

  const valid = emailPattern.test(email.trim())

  const share = () => {
    if (valid) sharing.mutate()
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    share()
  }

  const close = () => {
    onClose()

    if (sharing.isSuccess) {
      setEmail('')
      sharing.reset()
    }
  }

  return (
    <Modal opened={opened} title={t('projects.share.title')} onClose={close}>
      {sharing.isSuccess ? (
        <div className={classes.root}>
          <Text>{t('projects.share.sent', { email: email.trim() })}</Text>
          <Button onClick={close}>{t('projects.share.close')}</Button>
        </div>
      ) : (
        <form className={classes.root} onSubmit={submit}>
          <TextInput
            label={t('projects.share.email')}
            value={email}
            type="email"
            initialFocus
            onChange={setEmail}
          />
          <Text size="sm" tone="dimmed">
            {t('projects.share.hint', { name: project.name })}
          </Text>
          {sharing.isError ? <Text size="sm">{t('projects.share.failed')}</Text> : null}
          <Button disabled={!valid} loading={sharing.isPending} onClick={share}>
            {t('projects.share.send')}
          </Button>
        </form>
      )}
    </Modal>
  )
}
