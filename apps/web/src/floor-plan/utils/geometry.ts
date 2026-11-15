import type { Plan, Rect } from '@/projects/api/project-query'

export type Point = {
  x: number
  y: number
}

/** A drag across the sheet, from where it was pressed to where it is now. */
export type Stroke = {
  from: Point
  to: Point
}

/** Which of a rectangle's edges a handle moves; a corner names one on each axis. */
export type Edges = {
  x?: 'min' | 'max'
  y?: 'min' | 'max'
}

const quarterTurnsOf = (angle: number) => Math.round(angle / 90)

/** The sheet as it lies after its quarter turns, centred on the origin; the fine angle is left out so the view holds still while it changes. */
export const sheetBoundsOf = ({ width, height }: Pick<Plan, 'width' | 'height'>, angle: number) => {
  const sideways = Math.abs(quarterTurnsOf(angle)) % 2 === 1
  const size = sideways ? { width: height, height: width } : { width, height }

  return { x: -size.width / 2, y: -size.height / 2, ...size }
}

export const insetOf = (rect: Rect, ratio: number): Rect => ({
  x: rect.x + rect.width * ratio,
  y: rect.y + rect.height * ratio,
  width: rect.width * (1 - 2 * ratio),
  height: rect.height * (1 - 2 * ratio),
})

/** The rectangle after a quarter turn about the origin: 1 is clockwise on screen, -1 the other way. */
export const quarterTurnedOf = (rect: Rect, direction: 1 | -1): Rect =>
  direction === 1
    ? { x: -(rect.y + rect.height), y: rect.x, width: rect.height, height: rect.width }
    : { x: rect.y, y: -(rect.x + rect.width), width: rect.height, height: rect.width }

export const resizedOf = (rect: Rect, edges: Edges, point: Point, minSize: number): Rect => {
  const right = rect.x + rect.width
  const bottom = rect.y + rect.height
  const left = edges.x === 'min' ? Math.min(point.x, right - minSize) : rect.x
  const top = edges.y === 'min' ? Math.min(point.y, bottom - minSize) : rect.y

  return {
    x: left,
    y: top,
    width: (edges.x === 'max' ? Math.max(point.x, left + minSize) : right) - left,
    height: (edges.y === 'max' ? Math.max(point.y, top + minSize) : bottom) - top,
  }
}

/** The same angle within (-180, 180]. */
export const normalizedAngleOf = (angle: number) => {
  const wrapped = ((((angle + 180) % 360) + 360) % 360) - 180

  return wrapped === -180 ? 180 : wrapped
}

/** How far an angle is from the nearest quarter turn. */
export const fineAngleOf = (angle: number) => angle - quarterTurnsOf(angle) * 90

export const withFineAngleOf = (angle: number, fine: number) =>
  normalizedAngleOf(quarterTurnsOf(angle) * 90 + fine)
