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
  thicknessCm: size,
  kind: z.enum(['exterior', 'loadBearing', 'partition', 'custom']),
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
  })
  .partial()
