import { Hono } from 'hono'
import { health } from './health'

// Supabase routes a request to the `api` function with its name still on the path.
export const app = new Hono().basePath('/api').route('/health', health)
