import { IconShare, IconTrash } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { ActionMenu, Card, Heading, Text, useDisclosure } from '@diwire/ui-kit'
import type { ProjectSummary } from '@/projects/api/projects-query'
import { floorNameOf } from '@/projects/utils/floor-name-of'
import { DeleteProjectModal } from '../DeleteProjectModal'
import { ShareProjectModal } from '../ShareProjectModal'
import classes from './ProjectCard.module.css'

type Props = {
  project: ProjectSummary
}

export const ProjectCard = ({ project }: Props) => {
  const { t } = useTranslation()
  const [sharingOpened, sharing] = useDisclosure(false)
  const [deletionOpened, deletion] = useDisclosure(false)

  return (
    <div className={classes.root}>
      <Link to="/projects/$projectId" params={{ projectId: project.id }} className={classes.link}>
        <Card>
          <Card.Body className={classes.body}>
            <div>
              <Heading order={2}>{project.name}</Heading>
              <Text size="sm" tone="dimmed">
                {t('projects.floors', { count: project.floors.length })}
              </Text>
              {project.share === null ? null : (
                <Text size="sm" tone="dimmed">
                  {t('projects.share.sharedBy', { email: project.share.invitedBy })}
                </Text>
              )}
            </div>
            <ul className={classes.floors}>
              {project.floors.map((floor) => (
                <li key={floor.id} className={classes.floor}>
                  <Text size="sm">{floorNameOf(t, floor.position)}</Text>
                  <Text size="sm" tone="dimmed">
                    {t(`floorPlan.steps.${floor.step}`)}
                  </Text>
                </li>
              ))}
            </ul>
          </Card.Body>
        </Card>
      </Link>
      {project.share === null ? (
        <>
          <div className={classes.menu}>
            <ActionMenu label={t('projects.menu.label', { name: project.name })}>
              <ActionMenu.Item icon={<IconShare aria-hidden />} onClick={sharing.open}>
                {t('projects.menu.share')}
              </ActionMenu.Item>
              <ActionMenu.Item icon={<IconTrash aria-hidden />} onClick={deletion.open}>
                {t('projects.menu.delete')}
              </ActionMenu.Item>
            </ActionMenu>
          </div>
          <ShareProjectModal project={project} opened={sharingOpened} onClose={sharing.close} />
          <DeleteProjectModal project={project} opened={deletionOpened} onClose={deletion.close} />
        </>
      ) : null}
    </div>
  )
}
