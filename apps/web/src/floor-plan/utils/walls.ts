import type { Outline, Rect, Wall, WallEnd, WallKind } from '@/projects/api/project-query'
import type { Point, Stroke } from './geometry'

type Preset = Exclude<WallKind, 'custom'>

export const presetKinds = ['exterior', 'loadBearing', 'partition'] as const satisfies Preset[]

export const presetThicknessCm = {
  exterior: 44,
  loadBearing: 25,
  partition: 12,
} as const satisfies Record<Preset, number>

const clamped = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

/** How far the outline reaches along a wall of this orientation, and across it. */
const extentOf = ({ widthCm, heightCm }: Outline, orientation: Wall['orientation']) =>
  orientation === 'horizontal'
    ? { along: widthCm, across: heightCm }
    : { along: heightCm, across: widthCm }

/** The centre line kept far enough inside the outline that the wall's whole thickness fits. */
const fittedCenterOf = (center: number, thicknessCm: number, across: number) =>
  clamped(center, thicknessCm / 2, across - thicknessCm / 2)

const wallOf = (walls: Wall[], id: string) => {
  const wall = walls.find((candidate) => candidate.id === id)

  if (wall === undefined) throw new Error(`No wall ${id} to attach to`)

  return wall
}

// An attached end runs to the far face of its wall, so two walls meeting at a corner fill it.
const endPositionOf = (end: WallEnd, side: 'from' | 'to', walls: Wall[]) => {
  if ('position' in end) return end.position

  const { center, thicknessCm } = wallOf(walls, end.wallId)

  return side === 'from' ? center - thicknessCm / 2 : center + thicknessCm / 2
}

export const wallRectOf = (wall: Wall, walls: Wall[]): Rect => {
  const from = endPositionOf(wall.from, 'from', walls)
  const length = endPositionOf(wall.to, 'to', walls) - from
  const edge = wall.center - wall.thicknessCm / 2

  return wall.orientation === 'horizontal'
    ? { x: from, y: edge, width: length, height: wall.thicknessCm }
    : { x: edge, y: from, width: wall.thicknessCm, height: length }
}

const contains = (rect: Rect, { x, y }: Point, reach: number) =>
  x >= rect.x - reach &&
  x <= rect.x + rect.width + reach &&
  y >= rect.y - reach &&
  y <= rect.y + rect.height + reach

export const wallAtOf = (walls: Wall[], point: Point, reach: number) =>
  walls.find((wall) => contains(wallRectOf(wall, walls), point, reach))

type Draft = {
  id: string
  stroke: Stroke
  kind: WallKind
  thicknessCm: number
  walls: Wall[]
  outline: Outline
  /** How far outside a wall an end may land and still attach to it. */
  reach: number
}

/** The wall between two picked points: along their dominant axis, through the first of them. */
export const draftWallOf = ({
  id,
  stroke,
  kind,
  thicknessCm,
  walls,
  outline,
  reach,
}: Draft): Wall => {
  const horizontal = Math.abs(stroke.to.x - stroke.from.x) >= Math.abs(stroke.to.y - stroke.from.y)
  const orientation = horizontal ? 'horizontal' : 'vertical'
  const extent = extentOf(outline, orientation)
  const alongOf = ({ x, y }: Point) => (horizontal ? x : y)
  const center = fittedCenterOf(
    horizontal ? stroke.from.y : stroke.from.x,
    thicknessCm,
    extent.across,
  )
  const [first, last] = [alongOf(stroke.from), alongOf(stroke.to)].sort((a, b) => a - b)

  // A free end reaches half a thickness past its point, so the wall covers the square shown there.
  const endOf = (along: number, outward: -1 | 1): WallEnd => {
    const spot = horizontal ? { x: along, y: center } : { x: center, y: along }
    const target = walls.find(
      (wall) => wall.orientation !== orientation && contains(wallRectOf(wall, walls), spot, reach),
    )

    return target === undefined
      ? { position: fittedCenterOf(along, thicknessCm, extent.along) + (outward * thicknessCm) / 2 }
      : { wallId: target.id }
  }

  return {
    id,
    orientation,
    center,
    thicknessCm,
    kind,
    from: endOf(first ?? 0, -1),
    to: endOf(last ?? 0, 1),
  }
}

/** The footprint a wall of this thickness would start with at a point, kept inside the outline. */
export const startRectOf = ({ x, y }: Point, thicknessCm: number, outline: Outline): Rect => ({
  x: fittedCenterOf(x, thicknessCm, outline.widthCm) - thicknessCm / 2,
  y: fittedCenterOf(y, thicknessCm, outline.heightCm) - thicknessCm / 2,
  width: thicknessCm,
  height: thicknessCm,
})

/** How far apart two picked points are along the axis a wall between them would take. */
export const strokeLengthOf = ({ from, to }: Stroke) =>
  Math.max(Math.abs(to.x - from.x), Math.abs(to.y - from.y))

/** Each wall this one's ends are attached to, with the point where the two centre lines cross. */
export const jointsOf = (wall: Wall, walls: Wall[]) =>
  [wall.from, wall.to].flatMap((end) => {
    if (!('wallId' in end)) return []

    const target = wallOf(walls, end.wallId)
    const point =
      wall.orientation === 'horizontal'
        ? { x: target.center, y: wall.center }
        : { x: wall.center, y: target.center }

    return [{ wallId: target.id, point }]
  })

export const retypedWallsOf = (
  walls: Wall[],
  id: string,
  kind: WallKind,
  thicknessCm: number,
  outline: Outline,
) =>
  walls.map((wall) =>
    wall.id === id
      ? {
          ...wall,
          kind,
          thicknessCm,
          center: fittedCenterOf(
            wall.center,
            thicknessCm,
            extentOf(outline, wall.orientation).across,
          ),
        }
      : wall,
  )

/** The walls without one of them; an end that was attached to it stays where it stood. */
export const remainingWallsOf = (walls: Wall[], id: string) => {
  const freedOf = (end: WallEnd, side: 'from' | 'to'): WallEnd =>
    'wallId' in end && end.wallId === id ? { position: endPositionOf(end, side, walls) } : end

  return walls
    .filter((wall) => wall.id !== id)
    .map((wall) => ({ ...wall, from: freedOf(wall.from, 'from'), to: freedOf(wall.to, 'to') }))
}
