import { Hono } from 'hono'
import { account } from './account'
import { webCors } from './cors'
import { health } from './health'
import { projects } from './projects'

// Supabase routes a request to the `api` function with its name still on the path.
export const app = new Hono()
  .basePath('/api')
  .use(webCors)
  .route('/health', health)
  .route('/account', account)
  .route('/projects', projects)
