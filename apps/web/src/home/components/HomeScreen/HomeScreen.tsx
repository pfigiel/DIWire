import { useTranslation } from 'react-i18next'
import { Heading, Text } from '@diwire/ui-kit'
import classes from './HomeScreen.module.css'

export const HomeScreen = () => {
  const { t } = useTranslation()

  return (
    <main className={classes.root}>
      <Heading order={1}>{t('home.title')}</Heading>
      <Text tone="dimmed">{t('home.subtitle')}</Text>
    </main>
  )
}
