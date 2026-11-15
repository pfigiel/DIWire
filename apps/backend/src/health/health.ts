import { Hono } from 'hono'

export const health = new Hono().get('/', (context) => context.json({ status: 'ok' }))
