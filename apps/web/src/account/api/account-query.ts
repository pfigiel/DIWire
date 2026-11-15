import { queryOptions } from '@tanstack/react-query'
import { fetchApi } from '@/auth/api/fetch-api'

type Account = {
  id: string
  email: string
}

export const accountQuery = queryOptions({
  queryKey: ['account'],
  queryFn: () => fetchApi<Account>('/account'),
})
