import { z } from 'zod'
import type { Step } from '../database'

const steps = [
  'file',
  'crop',
  'scale',
  'walls',
  'dimensions',
  'openings',
] as const satisfies readonly Step[]

const size = z.number().positive()

export const idSchema = z.uuid()

export const newProjectSchema = z.object({ name: z.string().trim().min(1).max(80) })

const wallEnd = z.union([
  z.strictObject({ wallId: z.uuid() }),
  z.strictObject({ position: z.number() }),
])

const wall = z.object({
  id: z.uuid(),
  orientation: z.enum(['horizontal', 'vertical']),
  center: z.number(),
  // A divider splits a room without being a wall, so it alone has no thickness.
  thicknessCm: z.number().nonnegative(),
  kind: z.enum(['exterior', 'loadBearing', 'partition', 'custom', 'divider']),
  from: wallEnd,
  to: wallEnd,
})

type Wall = z.infer<typeof wall>

/** An attached end has no position of its own, so it must name a wall that is there to give it one. */
const endsAttachToWalls = (walls: Wall[]) => {
  const ids = new Set(walls.map(({ id }) => id))

  return walls.every(({ from, to }) =>
    [from, to].every((end) => !('wallId' in end) || ids.has(end.wallId)),
  )
}

const opening = z.object({
  id: z.uuid(),
  wallId: z.uuid(),
  kind: z.enum(['door', 'window', 'garage']),
  widthCm: size,
  leafWidthCm: size.nullable(),
  sillCm: z.number().nonnegative().nullable(),
  anchor: z.enum(['from', 'to']),
  anchorWallId: z.uuid().nullable(),
  offsetCm: z.number().nonnegative(),
  hinge: z.enum(['from', 'to']),
  opensTo: z.enum(['min', 'max']),
})

export const floorChangesSchema = z
  .object({
    step: z.enum(steps),
    plan: z
      .object({
        name: z.string().min(1),
        page: z.number().int().positive().nullable(),
        imagePath: z.string().min(1),
        width: size,
        height: size,
      })
      .nullable(),
    rotationDeg: z.number(),
    crop: z.object({ x: z.number(), y: z.number(), width: size, height: size }).nullable(),
    outline: z.object({ widthCm: size, heightCm: size }).nullable(),
    walls: z.array(wall).max(1000).refine(endsAttachToWalls),
    locks: z
      .array(z.object({ a: z.string().min(1), b: z.string().min(1), valueCm: size }))
      .max(2000),
    rooms: z
      .array(z.object({ name: z.string().trim().min(1).max(60), x: z.number(), y: z.number() }))
      .max(500),
    openings: z.array(opening).max(1000),
  })
  .partial()
