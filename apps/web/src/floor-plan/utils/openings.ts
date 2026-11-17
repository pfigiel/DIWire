import type { Opening, Rect, Wall } from '@/projects/api/project-query'
import type { Point } from './geometry'
import { isDivider, wallRectOf } from './walls'

type Range = {
  start: number
  end: number
}

type Side = Opening['anchor']

/** A clear stretch of a wall between two corners; a corner is a crossing wall, or null for the wall's own end. */
export type Segment = Range & {
  fromWallId: string | null
  toWallId: string | null
}

const epsilon = 0.01
/** A wall this close to another's side stands against it, so no opening fits where it does. */
const touchToleranceCm = 1

const defaults = {
  door: { widthCm: 90, leafWidthCm: 80, sillCm: null },
  window: { widthCm: 120, leafWidthCm: null, sillCm: 85 },
  garage: { widthCm: 250, leafWidthCm: null, sillCm: null },
} as const satisfies Record<Opening['kind'], Pick<Opening, 'widthCm' | 'leafWidthCm' | 'sillCm'>>

export const lies = ({ orientation }: Wall) => orientation === 'horizontal'

/** A rectangle as a run along a wall's direction and a band across it. */
const runOf = ({ x, y, width, height }: Rect, lying: boolean) =>
  lying
    ? { along: { start: x, end: x + width }, across: { start: y, end: y + height } }
    : { along: { start: y, end: y + height }, across: { start: x, end: x + width } }

const hostOf = (walls: Wall[], id: string) => {
  const wall = walls.find((candidate) => candidate.id === id)

  return wall === undefined || isDivider(wall) ? undefined : wall
}

const holds = (outer: Range, inner: Range) =>
  inner.start >= outer.start - epsilon && inner.end <= outer.end + epsilon

/** The stretches of a wall an opening can sit in: what is left once every wall standing against it is taken out. */
const segmentsOf = (host: Wall, walls: Wall[]): Segment[] => {
  const lying = lies(host)
  const own = runOf(wallRectOf(host, walls), lying)
  const crossings = walls
    .filter((wall) => wall.orientation !== host.orientation && !isDivider(wall))
    .map((wall) => ({ id: wall.id, ...runOf(wallRectOf(wall, walls), lying) }))
    .filter(
      ({ along, across }) =>
        across.start <= own.across.end + touchToleranceCm &&
        across.end >= own.across.start - touchToleranceCm &&
        along.end > own.along.start + epsilon &&
        along.start < own.along.end - epsilon,
    )
    .sort((a, b) => a.along.start - b.along.start)

  const segments: Segment[] = []
  let start = own.along.start
  let fromWallId: string | null = null

  for (const { id, along } of crossings) {
    if (along.start > start + epsilon) {
      segments.push({ start, end: along.start, fromWallId, toWallId: id })
    }

    if (along.end > start) {
      start = along.end
      fromWallId = id
    }
  }

  if (own.along.end > start + epsilon) {
    segments.push({ start, end: own.along.end, fromWallId, toWallId: null })
  }

  return segments
}

const cornerOf = ({ anchor, anchorWallId }: Opening, host: Wall, walls: Wall[]) => {
  const wall = anchorWallId === null ? host : walls.find(({ id }) => id === anchorWallId)

  if (wall === undefined) return undefined

  const { along } = runOf(wallRectOf(wall, walls), lies(host))

  // Its own end faces outwards and a crossing wall's face inwards, so the two read opposite ways.
  return (anchor === 'from') === (anchorWallId === null) ? along.start : along.end
}

/** Where the opening lies along its wall, or nothing once the wall or its corner is gone. */
const spanOf = (opening: Opening, walls: Wall[]): Range | undefined => {
  const host = hostOf(walls, opening.wallId)
  const corner = host === undefined ? undefined : cornerOf(opening, host, walls)

  if (corner === undefined) return undefined

  return opening.anchor === 'from'
    ? { start: corner + opening.offsetCm, end: corner + opening.offsetCm + opening.widthCm }
    : { start: corner - opening.offsetCm - opening.widthCm, end: corner - opening.offsetCm }
}

const placeOf = (opening: Opening, walls: Wall[]) => {
  const host = hostOf(walls, opening.wallId)
  const span = spanOf(opening, walls)
  const segment =
    host === undefined || span === undefined
      ? undefined
      : segmentsOf(host, walls).find((candidate) => holds(candidate, span))

  return host === undefined || span === undefined || segment === undefined
    ? undefined
    : { host, span, segment }
}

/** Whether the opening lies wholly between two corners of its wall and clear of the others in it, and a door's leaf within its frame. */
export const fits = (opening: Opening, others: Opening[], walls: Wall[]) => {
  const place = placeOf(opening, walls)

  if (place === undefined || opening.widthCm <= 0) return false
  if ((opening.leafWidthCm ?? 0) > opening.widthCm) return false

  return others
    .filter(({ id, wallId }) => id !== opening.id && wallId === opening.wallId)
    .every((other) => {
      const span = spanOf(other, walls)

      return (
        span === undefined ||
        span.end <= place.span.start + epsilon ||
        span.start >= place.span.end - epsilon
      )
    })
}

const anchoredOf = (opening: Opening, span: Range, segment: Segment, side: Side): Opening => ({
  ...opening,
  anchor: side,
  anchorWallId: side === 'from' ? segment.fromWallId : segment.toWallId,
  offsetCm: side === 'from' ? span.start - segment.start : segment.end - span.end,
})

/** The opening's footprint in its wall, with how far it is from the corner on either side. */
export const openingPlaceOf = (opening: Opening, walls: Wall[]) => {
  const place = placeOf(opening, walls)

  if (place === undefined) return undefined

  const { host, span, segment } = place
  const { across } = runOf(wallRectOf(host, walls), lies(host))

  return {
    host,
    span,
    across,
    segment,
    distances: { from: span.start - segment.start, to: segment.end - span.end },
  }
}

/** The opening measured from the corner on one side instead, that distance away. */
export const distancedOpeningOf = (
  opening: Opening,
  side: Side,
  distanceCm: number,
  walls: Wall[],
): Opening | undefined => {
  const place = placeOf(opening, walls)

  return place === undefined
    ? undefined
    : {
        ...opening,
        anchor: side,
        anchorWallId: side === 'from' ? place.segment.fromWallId : place.segment.toWallId,
        offsetCm: distanceCm,
      }
}

type Placement = {
  id: string
  kind: Opening['kind']
  host: Wall
  point: Point
  walls: Wall[]
  openings: Opening[]
}

/** A new opening of the usual size centred on a picked point of a wall, or nothing where it does not fit. */
export const placedOpeningOf = ({
  id,
  kind,
  host,
  point,
  walls,
  openings,
}: Placement): Opening | undefined => {
  const along = lies(host) ? point.x : point.y
  const { widthCm } = defaults[kind]
  const segment = segmentsOf(host, walls).find(
    ({ start, end }) => along >= start && along <= end && end - start >= widthCm,
  )

  if (segment === undefined) return undefined

  const start = Math.min(Math.max(along - widthCm / 2, segment.start), segment.end - widthCm)
  const side = along - segment.start <= segment.end - along ? 'from' : 'to'
  const measured = anchoredOf(
    {
      id,
      wallId: host.id,
      kind,
      ...defaults[kind],
      anchor: side,
      anchorWallId: null,
      offsetCm: 0,
      hinge: 'from',
      opensTo: 'max',
    },
    { start, end: start + widthCm },
    segment,
    side,
  )
  // Whole centimetres, as a plan gives them; rounding down keeps the opening inside its stretch.
  const opening = { ...measured, offsetCm: Math.floor(measured.offsetCm) }

  return fits(opening, openings, walls) ? opening : undefined
}

/** The openings that still have a wall to sit in and room in it; walls change under them. */
export const standingOpeningsOf = (openings: Opening[], walls: Wall[]) =>
  openings.reduce<Opening[]>(
    (kept, opening) => (fits(opening, kept, walls) ? [...kept, opening] : kept),
    [],
  )

/**
 * The openings after their walls were redrawn: each stays where it stood and is measured from the
 * corner now nearest on its side, since the wall it was measured from may be gone or a new one may
 * stand between. One whose wall is gone, or that a wall now runs into, is dropped.
 */
export const carriedOpeningsOf = (openings: Opening[], before: Wall[], after: Wall[]) =>
  standingOpeningsOf(
    openings.flatMap((opening) => {
      const span = spanOf(opening, before)
      const host = hostOf(after, opening.wallId)
      const segment =
        span === undefined || host === undefined
          ? undefined
          : segmentsOf(host, after).find((candidate) => holds(candidate, span))

      return span === undefined || segment === undefined
        ? []
        : [anchoredOf(opening, span, segment, opening.anchor)]
    }),
    after,
  )

const openingRectOf = (opening: Opening, walls: Wall[]): Rect | undefined => {
  const place = openingPlaceOf(opening, walls)

  if (place === undefined) return undefined

  const { host, span, across } = place

  return lies(host)
    ? {
        x: span.start,
        y: across.start,
        width: span.end - span.start,
        height: across.end - across.start,
      }
    : {
        x: across.start,
        y: span.start,
        width: across.end - across.start,
        height: span.end - span.start,
      }
}

export const openingAtOf = (openings: Opening[], walls: Wall[], { x, y }: Point, reach: number) =>
  openings.find((opening) => {
    const rect = openingRectOf(opening, walls)

    return (
      rect !== undefined &&
      x >= rect.x - reach &&
      x <= rect.x + rect.width + reach &&
      y >= rect.y - reach &&
      y <= rect.y + rect.height + reach
    )
  })
