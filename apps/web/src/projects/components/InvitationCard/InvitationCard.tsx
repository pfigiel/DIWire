import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Button, Card, Heading, Text } from '@diwire/ui-kit'
import { acceptInvitation, rejectInvitation } from '@/projects/api/invitations'
import {
  projectsQuery,
  type ProjectShare,
  type ProjectSummary,
} from '@/projects/api/projects-query'
import classes from './InvitationCard.module.css'

type Props = {
  project: ProjectSummary
  share: ProjectShare
}

export const InvitationCard = ({ project, share }: Props) => {
  const { t } = useTranslation()

  const answer = useMutation({
    mutationFn: (accepted: boolean) =>
      accepted ? acceptInvitation(project.id) : rejectInvitation(project.id),
    onSuccess: (_answered, _accepted, _result, { client }) =>
      client.invalidateQueries({ queryKey: projectsQuery.queryKey, exact: true }),
  })

  return (
    <Card className={classes.root}>
      <Card.Body className={classes.body}>
        <span className={classes.pending}>{t('projects.invitation.pending')}</span>
        <div>
          <Heading order={2}>{project.name}</Heading>
          <Text size="sm" tone="dimmed">
            {t('projects.invitation.from', { email: share.invitedBy })}
          </Text>
        </div>
        {answer.isError ? <Text size="sm">{t('projects.invitation.failed')}</Text> : null}
        <div className={classes.actions}>
          <Button
            size="sm"
            loading={answer.isPending && answer.variables}
            disabled={answer.isPending}
            onClick={() => answer.mutate(true)}
          >
            {t('projects.invitation.accept')}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            loading={answer.isPending && !answer.variables}
            disabled={answer.isPending}
            onClick={() => answer.mutate(false)}
          >
            {t('projects.invitation.reject')}
          </Button>
        </div>
      </Card.Body>
    </Card>
  )
}
