import { cors } from 'hono/cors'

export const webCors = cors({
  origin: ['https://diwire.vercel.app', 'http://localhost:5173'],
  allowHeaders: ['Authorization', 'Content-Type'],
})
