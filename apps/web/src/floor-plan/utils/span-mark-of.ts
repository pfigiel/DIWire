import type { Dimension } from './dimensions-of'
import type { Point } from './geometry'

/** Where a dimension is drawn: its line across the room, and the point its label sits on. */
export type SpanMark = {
  from: Point
  to: Point
  labelAt: Point
}

/** Off the strip's middle, so the two dimensions of a room cross away from its name. */
const lineShare = 0.68
/** A standing dimension carries its label a third of the way down, clear of the lying one's. */
const standingLabelShare = 1 / 3

export const spanMarkOf = ({ axis, start, end, stripStart, stripEnd }: Dimension): SpanMark => {
  const across = stripStart + (stripEnd - stripStart) * lineShare

  return axis === 'x'
    ? {
        from: { x: start, y: across },
        to: { x: end, y: across },
        labelAt: { x: (start + end) / 2, y: across },
      }
    : {
        from: { x: across, y: start },
        to: { x: across, y: end },
        labelAt: { x: across, y: start + (end - start) * standingLabelShare },
      }
}

const characterPx = 8
const paddingPx = 10
const lockPx = 16

/** The label's size on screen; the same figures draw it and decide whether a click landed on it. */
export const labelSizeOf = (label: string, locked: boolean) => ({
  width: label.length * characterPx + 2 * paddingPx + (locked ? lockPx : 0),
  height: 26,
})

/** Whether a click on the sheet landed on a label of this size centred on a point. */
export const hits = (
  point: Point,
  center: Point,
  { width, height }: { width: number; height: number },
  scale: number,
) =>
  Math.abs(point.x - center.x) * scale <= width / 2 &&
  Math.abs(point.y - center.y) * scale <= height / 2
