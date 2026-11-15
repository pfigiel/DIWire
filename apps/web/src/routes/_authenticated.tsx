import { createFileRoute, redirect } from '@tanstack/react-router'
import { accountQuery } from '@/account/api/account-query'
import { getSession } from '@/auth/api/session'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async () => {
    if ((await getSession()) === null) throw redirect({ to: '/login' })
  },
  loader: ({ context }) => context.queryClient.ensureQueryData(accountQuery),
})
