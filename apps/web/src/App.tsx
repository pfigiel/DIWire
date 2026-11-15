import { QueryClientProvider, type QueryClient } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { I18nextProvider } from 'react-i18next'
import { UiProvider } from '@diwire/ui-kit'
import type { AppRouter } from '@/routing/router'
import { i18n } from './i18n'

type Props = {
  queryClient: QueryClient
  router: AppRouter
}

export const App = ({ queryClient, router }: Props) => (
  <I18nextProvider i18n={i18n}>
    <UiProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </UiProvider>
  </I18nextProvider>
)
