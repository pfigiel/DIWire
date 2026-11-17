import { Hono } from 'hono'
import { z } from 'zod'
import { requireUser, type UserEnv } from '../auth'
import { databaseOf } from '../database'
import { floorColumns, floorOf } from './floor-of'
import { floorChangesSchema, idSchema, newProjectSchema } from './schemas'
import { idParams, jsonBody } from './validated'

const projectParams = idParams(z.object({ projectId: idSchema }))
const floorParams = idParams(z.object({ projectId: idSchema, floorId: idSchema }))

const notFound = { error: 'Not found' }

export const projects = new Hono<UserEnv>()
  .use(requireUser)
  .get('/', async (context) => {
    const { data, error } = await databaseOf(context)
      .from('projects')
      .select('id, name, floors(id, position, step)')
      .order('created_at', { ascending: false })
      .order('position', { referencedTable: 'floors' })

    if (error) throw new Error(error.message)

    return context.json(data)
  })
  .post('/', jsonBody(newProjectSchema), async (context) => {
    const { data, error } = await databaseOf(context)
      .rpc('create_project', context.req.valid('json'))
      .single()

    if (error) throw new Error(error.message)

    return context.json({ id: data.id, floorId: data.floor_id }, 201)
  })
  .get('/:projectId', projectParams, async (context) => {
    const { data, error } = await databaseOf(context)
      .from('projects')
      .select(`id, name, floors(${floorColumns})`)
      .eq('id', context.req.valid('param').projectId)
      .order('position', { referencedTable: 'floors' })
      .maybeSingle()

    if (error) throw new Error(error.message)
    if (data === null) return context.json(notFound, 404)

    return context.json({ ...data, floors: data.floors.map(floorOf) })
  })
  .delete('/:projectId', projectParams, async (context) => {
    const { data, error } = await databaseOf(context)
      .from('projects')
      .delete()
      .eq('id', context.req.valid('param').projectId)
      .select('id')
      .maybeSingle()

    if (error) throw new Error(error.message)
    if (data === null) return context.json(notFound, 404)

    return context.json(data)
  })
  .post('/:projectId/floors', projectParams, async (context) => {
    const database = databaseOf(context)
    const { projectId } = context.req.valid('param')

    const project = await database
      .from('projects')
      .select('floors(position)')
      .eq('id', projectId)
      .maybeSingle()

    if (project.error) throw new Error(project.error.message)
    if (project.data === null) return context.json(notFound, 404)

    const position = Math.max(-1, ...project.data.floors.map((floor) => floor.position)) + 1
    const { data, error } = await database
      .from('floors')
      .insert({ project_id: projectId, position })
      .select(floorColumns)
      .single()

    if (error) throw new Error(error.message)

    return context.json(floorOf(data), 201)
  })
  .patch(
    '/:projectId/floors/:floorId',
    floorParams,
    jsonBody(floorChangesSchema),
    async (context) => {
      const { projectId, floorId } = context.req.valid('param')
      const { rotationDeg, ...changes } = context.req.valid('json')

      const { data, error } = await databaseOf(context)
        .from('floors')
        .update({ ...changes, ...(rotationDeg !== undefined && { rotation_deg: rotationDeg }) })
        .eq('id', floorId)
        .eq('project_id', projectId)
        .select(floorColumns)
        .maybeSingle()

      if (error) throw new Error(error.message)
      if (data === null) return context.json(notFound, 404)

      return context.json(floorOf(data))
    },
  )
