import type { Outline, Wall } from '@/projects/api/project-query'
import { isDivider, wallRectOf } from './walls'

/** The axis a position is measured along: x for a line that runs up and down, y for one that runs across. */
export type Axis = 'x' | 'y'

/** One flat side of a wall, or one edge of the outline. */
type Face = {
  /** "<wall id>:<min|max|from|to>": min and max are a wall's two sides, from and to its free ends. */
  key: string
  axis: Axis
  position: number
  /** How far the face reaches along its own length. */
  min: number
  max: number
  wallId: string | null
}

/** Faces that stand in one line and so move together; the unit dimensions are measured between. */
type Line = {
  axis: Axis
  position: number
  /** The outline's edges stay where the scale put them. */
  fixed: boolean
  faces: Face[]
}

export type PlanLines = {
  lines: Line[]
  /** The line each face belongs to, by the face's key. */
  indexOf: Map<string, number>
}

/** Hand tracing puts faces meant to be flush a few centimetres apart; within this they count as one line. */
const alignToleranceCm = 3

const facesOf = (walls: Wall[], { widthCm, heightCm }: Outline): Face[] => {
  const outline: Face[] = [
    { key: 'outline:left', axis: 'x', position: 0, min: 0, max: heightCm, wallId: null },
    { key: 'outline:right', axis: 'x', position: widthCm, min: 0, max: heightCm, wallId: null },
    { key: 'outline:top', axis: 'y', position: 0, min: 0, max: widthCm, wallId: null },
    { key: 'outline:bottom', axis: 'y', position: heightCm, min: 0, max: widthCm, wallId: null },
  ]

  const ofWalls = walls
    .filter((wall) => !isDivider(wall))
    .flatMap((wall): Face[] => {
      const { x, y, width, height } = wallRectOf(wall, walls)
      const stands = wall.orientation === 'vertical'
      // A standing wall's sides are x-lines as long as the wall; its ends are y-lines as wide as it.
      const across = stands
        ? { axis: 'x' as const, start: x, size: width }
        : { axis: 'y' as const, start: y, size: height }
      const along = stands
        ? { axis: 'y' as const, start: y, size: height }
        : { axis: 'x' as const, start: x, size: width }
      const side = {
        axis: across.axis,
        min: along.start,
        max: along.start + along.size,
        wallId: wall.id,
      }
      const end = {
        axis: along.axis,
        min: across.start,
        max: across.start + across.size,
        wallId: wall.id,
      }

      return [
        { ...side, key: `${wall.id}:min`, position: across.start },
        { ...side, key: `${wall.id}:max`, position: across.start + across.size },
        ...('position' in wall.from
          ? [{ ...end, key: `${wall.id}:from`, position: along.start }]
          : []),
        ...('position' in wall.to
          ? [{ ...end, key: `${wall.id}:to`, position: along.start + along.size }]
          : []),
      ]
    })

  return [...outline, ...ofWalls]
}

const flush = (a: Face, b: Face) =>
  a.axis === b.axis &&
  (a.wallId === null || a.wallId !== b.wallId) &&
  Math.abs(a.position - b.position) <= alignToleranceCm &&
  a.min <= b.max + alignToleranceCm &&
  b.min <= a.max + alignToleranceCm

/** Every face of the plan, gathered into the lines they stand in. */
export const planLinesOf = (walls: Wall[], outline: Outline): PlanLines => {
  const faces = facesOf(walls, outline)
  const parents = faces.map((_, index) => index)

  const rootOf = (index: number): number => {
    const parent = parents[index] ?? index

    return parent === index ? index : rootOf(parent)
  }

  faces.forEach((face, index) => {
    faces.slice(0, index).forEach((other, otherIndex) => {
      if (flush(face, other)) parents[rootOf(index)] = rootOf(otherIndex)
    })
  })

  const grouped = new Map<number, Face[]>()

  faces.forEach((face, index) => {
    const root = rootOf(index)
    grouped.set(root, [...(grouped.get(root) ?? []), face])
  })

  const lines = [...grouped.values()].map((members): Line => {
    const edge = members.find(({ wallId }) => wallId === null)
    const mean = members.reduce((sum, { position }) => sum + position, 0) / members.length

    return {
      axis: members[0]?.axis ?? 'x',
      position: edge?.position ?? mean,
      fixed: edge !== undefined,
      faces: members,
    }
  })

  return {
    lines,
    indexOf: new Map(lines.flatMap((line, index) => line.faces.map(({ key }) => [key, index]))),
  }
}
