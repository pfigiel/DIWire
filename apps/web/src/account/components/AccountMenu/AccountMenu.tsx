import { useSuspenseQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { AvatarMenu } from '@diwire/ui-kit'
import { accountQuery } from '@/account/api/account-query'
import { signOut } from '@/auth/api/session'

export const AccountMenu = () => {
  const { t } = useTranslation()
  const { data: account } = useSuspenseQuery(accountQuery)

  return (
    <AvatarMenu label={t('account.menu.label')} initial={account.email.charAt(0)}>
      <AvatarMenu.Label>{account.email}</AvatarMenu.Label>
      <AvatarMenu.Item onClick={() => void signOut()}>{t('account.menu.signOut')}</AvatarMenu.Item>
    </AvatarMenu>
  )
}
