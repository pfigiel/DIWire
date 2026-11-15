import { getSession } from './session'

export const fetchApi = async <Body>(path: string): Promise<Body> => {
  const session = await getSession()

  if (session === null) throw new Error(`${path} needs a signed-in user`)

  const response = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
    headers: { Authorization: `Bearer ${session.access_token}` },
  })

  if (!response.ok) throw new Error(`${path} failed with ${response.status}`)

  return (await response.json()) as Body
}
