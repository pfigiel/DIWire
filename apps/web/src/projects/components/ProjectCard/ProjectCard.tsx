import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Card, Heading, Text } from '@diwire/ui-kit'
import type { ProjectSummary } from '@/projects/api/projects-query'
import { floorNameOf } from '@/projects/utils/floor-name-of'
import classes from './ProjectCard.module.css'

type Props = {
  project: ProjectSummary
}

export const ProjectCard = ({ project }: Props) => {
  const { t } = useTranslation()

  return (
    <Link to="/projects/$projectId" params={{ projectId: project.id }} className={classes.root}>
      <Card>
        <Card.Body className={classes.body}>
          <div>
            <Heading order={2}>{project.name}</Heading>
            <Text size="sm" tone="dimmed">
              {t('projects.floors', { count: project.floors.length })}
            </Text>
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
  )
}
