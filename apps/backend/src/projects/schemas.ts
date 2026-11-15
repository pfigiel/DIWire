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
  })
  .partial()
