import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Logo, Tabs } from '@diwire/ui-kit'
import classes from './EditorHeader.module.css'

type Props = {
  projectName: string
}

export const EditorHeader = ({ projectName }: Props) => {
  const { t } = useTranslation()

  return (
    <div className={classes.root}>
      <Link to="/" aria-label={t('floorPlan.home')} className={classes.home}>
        <Logo />
      </Link>
      <span className={classes.project}>{projectName}</span>
      <Tabs value="floorPlan" label={t('floorPlan.modules.label')}>
        <Tabs.Tab value="floorPlan">{t('floorPlan.modules.floorPlan')}</Tabs.Tab>
        <Tabs.Tab value="electrical" disabled>
          {t('floorPlan.modules.electrical')}
        </Tabs.Tab>
      </Tabs>
    </div>
  )
}
