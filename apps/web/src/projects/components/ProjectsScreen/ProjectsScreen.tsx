import { IconPlus } from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Button, Heading, Text, useDisclosure } from '@diwire/ui-kit'
import { projectsQuery } from '@/projects/api/projects-query'
import { Shell } from '@/shell/components/Shell'
import { NewProjectModal } from '../NewProjectModal'
import { ProjectCard } from '../ProjectCard'
import classes from './ProjectsScreen.module.css'

export const ProjectsScreen = () => {
  const { t } = useTranslation()
  const { data: projects } = useSuspenseQuery(projectsQuery)
  const [newProjectOpened, newProject] = useDisclosure(false)

  return (
    <Shell>
      <main className={classes.root}>
        <div className={classes.header}>
          <Heading order={1}>{t('projects.title')}</Heading>
          <Button
            icon={<IconPlus aria-hidden className={classes.icon} />}
            onClick={newProject.open}
          >
            {t('projects.new.open')}
          </Button>
        </div>
        {projects.length === 0 ? (
          <Text tone="dimmed">{t('projects.empty')}</Text>
        ) : (
          <ul className={classes.list}>
            {projects.map((project) => (
              <li key={project.id}>
                <ProjectCard project={project} />
              </li>
            ))}
          </ul>
        )}
      </main>
      <NewProjectModal opened={newProjectOpened} onClose={newProject.close} />
    </Shell>
  )
}
