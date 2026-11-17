import type { Outline, Rect, Wall, WallEnd, WallKind } from '@/projects/api/project-query'
import type { Point, Stroke } from './geometry'

type Preset = Exclude<WallKind, 'custom' | 'divider'>

export const presetKinds = ['exterior', 'loadBearing', 'partition'] as const satisfies Preset[]

export const presetThicknessCm = {
  exterior: 45,
  loadBearing: 25,
  partition: 12,
} as const satisfies Record<Preset, number>

export const isDivider = ({ kind }: Wall) => kind === 'divider'

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
  const targetAt = (along: number) => {
    const spot = horizontal ? { x: along, y: center } : { x: center, y: along }

    return walls.find(
      (wall) =>
        wall.orientation !== orientation &&
        // A wall cannot hang off a divider, which is no wall; a divider can end on either.
        (kind === 'divider' || !isDivider(wall)) &&
        contains(wallRectOf(wall, walls), spot, reach),
    )
  }

  const targets = [targetAt(first ?? 0), targetAt(last ?? 0)]
  // Both ends on one wall means the points straddle it: a wall across it, not one hanging off it.
  const straddles = targets[0] !== undefined && targets[0] === targets[1]

  const endOf = (along: number, outward: -1 | 1, target: Wall | undefined): WallEnd =>
    target === undefined || straddles
      ? { position: fittedCenterOf(along, thicknessCm, extent.along) + (outward * thicknessCm) / 2 }
      : { wallId: target.id }

  return {
    id,
    orientation,
    center,
    thicknessCm,
    kind,
    from: endOf(first ?? 0, -1, targets[0]),
    to: endOf(last ?? 0, 1, targets[1]),
  }
}

/**
 * A start point moved onto the free end of a wall it is aimed at, so that a wall begun there lines
 * up with the first: its outer side on the line of the end, and one of its sides on a side of the
 * first wall. Two walls of one thickness have a single such place; of different thicknesses, one on
 * each side, and the nearer is taken. Drawn by hand, a corner is always a few centimetres off.
 */
export const flushStartOf = (
  point: Point,
  thicknessCm: number,
  walls: Wall[],
  reach: number,
): Point => {
  const corners = walls
    .filter((wall) => !isDivider(wall))
    .flatMap((wall) => {
      const lies = wall.orientation === 'horizontal'
      const rect = wallRectOf(wall, walls)
      const start = lies ? rect.x : rect.y
      const length = lies ? rect.width : rect.height
      const pointer = lies
        ? { along: point.x, across: point.y }
        : { along: point.y, across: point.x }
      // Inside the wall's own end: half a thickness in from the free end it has there.
      const insets = [
        ...('position' in wall.from ? [start + thicknessCm / 2] : []),
        ...('position' in wall.to ? [start + length - thicknessCm / 2] : []),
      ]
      // Flush with one side of the wall or with the other; the same place when both are as thick.
      const inward = (wall.thicknessCm - thicknessCm) / 2
      const sides = [wall.center - inward, wall.center + inward]
      const aimed =
        Math.abs(pointer.across - wall.center) <= wall.thicknessCm / 2 + reach &&
        insets.some((along) => Math.abs(pointer.along - along) <= thicknessCm / 3 + reach)

      return aimed
        ? insets.flatMap((along) =>
            sides.map((across) => (lies ? { x: along, y: across } : { x: across, y: along })),
          )
        : []
    })
    .map((corner) => ({ corner, distance: Math.hypot(corner.x - point.x, corner.y - point.y) }))
    .sort((a, b) => a.distance - b.distance)

  return corners[0]?.corner ?? point
}

/** The footprint a wall of this thickness would start with at a point, kept inside the outline. */
export const startRectOf = ({ x, y }: Point, thicknessCm: number, outline: Outline): Rect => ({
  x: fittedCenterOf(x, thicknessCm, outline.widthCm) - thicknessCm / 2,
  y: fittedCenterOf(y, thicknessCm, outline.heightCm) - thicknessCm / 2,
  width: thicknessCm,
  height: thicknessCm,
})

/** A free end this close to a wall drawn across it was meant to stop at that wall, not short of it or past it. */
const cornerToleranceCm = 15

/**
 * The walls with a new one added, and the corners it makes tidied: where the new wall attaches to
 * another right at that wall's free end, the end is moved onto the new wall's outer side. Walls drawn
 * earlier are never quite where the last one needs them, so the corner that closes a room would
 * otherwise show a step or an overhang.
 */
export const joinedWallsOf = (walls: Wall[], added: Wall): Wall[] => {
  if (isDivider(added)) return [...walls, added]

  const near = added.center - added.thicknessCm / 2
  const far = added.center + added.thicknessCm / 2
  const attachedTo = new Set(jointsOf(added, walls).map(({ wallId }) => wallId))

  const tidied = (end: WallEnd, flush: number): WallEnd =>
    'position' in end &&
    end.position >= near - cornerToleranceCm &&
    end.position <= far + cornerToleranceCm
      ? { position: flush }
      : end

  return [
    ...walls.map((wall) =>
      attachedTo.has(wall.id) && !isDivider(wall)
        ? { ...wall, from: tidied(wall.from, near), to: tidied(wall.to, far) }
        : wall,
    ),
    added,
  ]
}

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
