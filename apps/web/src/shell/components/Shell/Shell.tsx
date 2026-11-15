import type { ReactNode } from 'react'
import { AppShell, Logo } from '@diwire/ui-kit'
import { AccountMenu } from '@/account/components/AccountMenu'

type Props = {
  children: ReactNode
}

export const Shell = ({ children }: Props) => (
  <AppShell
    header={
      <>
        <Logo />
        <AccountMenu />
      </>
    }
  >
    {children}
  </AppShell>
)
