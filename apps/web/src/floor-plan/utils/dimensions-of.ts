import type { Axis, PlanLines } from './plan-lines'
import type { Region } from './regions-of'

/** The clear distance between two lines across one stretch of a room. */
export type Dimension = {
  /** The same for every stretch measured between the same two lines, so one value serves them all. */
  key: string
  axis: Axis
  /** Indexes of the two lines, into the plan's lines. */
  from: number
  to: number
  start: number
  end: number
  /** The stretch of the room, across the dimension, where these two lines face each other. */
  stripStart: number
  stripEnd: number
  /** Index of the region it was measured in. */
  room: number
}

const tolerance = 0.01

const lineAtOf = ({ lines }: PlanLines, axis: Axis, position: number, along: number) =>
  lines.findIndex(
    (line) =>
      line.axis === axis &&
      line.faces.some(
        (face) =>
          Math.abs(face.position - position) < tolerance &&
          along > face.min - tolerance &&
          along < face.max + tolerance,
      ),
  )

/**
 * A room cut into strips at every corner; each strip is measured between the lines at its two ends,
 * and neighbouring strips between the same two lines count once. A rectangle gets one dimension per
 * axis, an L-shape two on the axis where it steps.
 */
const axisDimensionsOf = (region: Region, room: number, axis: Axis, lines: PlanLines) => {
  // Along the axis being measured each cell runs from `start` for `size`; `strip` is its place across.
  const cells = region.cells
    .map(({ x, y, width, height }) =>
      axis === 'x'
        ? { start: x, size: width, strip: y, stripSize: height }
        : { start: y, size: height, strip: x, stripSize: width },
    )
    .sort((a, b) => a.strip - b.strip || a.start - b.start)

  // Cells side by side in one strip make a run: the room's full reach there, wall to wall.
  const runs: { start: number; end: number; strip: number; stripSize: number }[] = []

  cells.forEach(({ start, size, strip, stripSize }) => {
    const last = runs.at(-1)

    if (last?.strip === strip && Math.abs(last.end - start) < tolerance) last.end = start + size
    else runs.push({ start, end: start + size, strip, stripSize })
  })

  const dimensions: Dimension[] = []
  const open = new Map<string, Dimension>()

  runs.forEach(({ start, end, strip, stripSize }) => {
    const middle = strip + stripSize / 2
    const from = lineAtOf(lines, axis, start, middle)
    const to = lineAtOf(lines, axis, end, middle)

    if (from === -1 || to === -1) return

    const key = `${axis}:${from}:${to}`
    const running = open.get(key)

    if (running !== undefined && Math.abs(running.stripEnd - strip) < tolerance) {
      running.stripEnd = strip + stripSize
    } else {
      const dimension = {
        key,
        axis,
        from,
        to,
        start,
        end,
        stripStart: strip,
        stripEnd: strip + stripSize,
        room,
      }
      open.set(key, dimension)
      dimensions.push(dimension)
    }
  })

  return dimensions
}

export const dimensionsOf = (regions: Region[], lines: PlanLines): Dimension[] =>
  regions.flatMap((region, room) => [
    ...axisDimensionsOf(region, room, 'x', lines),
    ...axisDimensionsOf(region, room, 'y', lines),
  ])
