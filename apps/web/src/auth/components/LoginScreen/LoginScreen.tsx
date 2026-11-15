import { useTranslation } from 'react-i18next'
import { Button, Card, Heading, Logo } from '@diwire/ui-kit'
import { signInWithGoogle } from '@/auth/api/session'
import { GoogleIcon } from '../GoogleIcon'
import classes from './LoginScreen.module.css'

export const LoginScreen = () => {
  const { t } = useTranslation()

  return (
    <main className={classes.root}>
      <Logo size="lg" />
      <Card className={classes.card}>
        <Card.Body className={classes.body}>
          <Heading order={1} size="md" className={classes.title}>
            {t('auth.login.title')}
          </Heading>
          <Button variant="secondary" icon={<GoogleIcon />} onClick={() => void signInWithGoogle()}>
            {t('auth.login.google')}
          </Button>
        </Card.Body>
      </Card>
    </main>
  )
}
