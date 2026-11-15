import { Hono } from 'hono'
import { requireUser, type UserEnv } from '../auth'

export const account = new Hono<UserEnv>().use(requireUser).get('/', (context) => {
  const { sub, email } = context.get('jwtPayload')

  return context.json({ id: sub, email })
})
