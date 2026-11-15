import type { Outline, Rect } from '@/projects/api/project-query'
import type { Point } from './geometry'

/** Narrower than this and an enclosed gap is a slip of the hand between two walls, not a room. */
const minSpanCm = 30

const cutsOf = (values: number[], max: number) =>
  [...new Set([0, max, ...values.filter((value) => value > 0 && value < max)])].sort(
    (a, b) => a - b,
  )

/**
 * Where to label each room, top-left first. A room is an area walls close on every side: the
 * outline's own edge closes nothing, so an area reaching it is still open.
 */
export const roomsOf = (wallRects: Rect[], { widthCm, heightCm }: Outline): Point[] => {
  const xs = cutsOf(
    wallRects.flatMap(({ x, width }) => [x, x + width]),
    widthCm,
  )
  const ys = cutsOf(
    wallRects.flatMap(({ y, height }) => [y, y + height]),
    heightCm,
  )
  const columns = xs.length - 1
  const rows = ys.length - 1

  const cellOf = (index: number) => {
    const column = index % columns
    const row = Math.floor(index / columns)
    const x = xs[column] ?? 0
    const y = ys[row] ?? 0

    return { column, row, x, y, width: (xs[column + 1] ?? x) - x, height: (ys[row + 1] ?? y) - y }
  }

  // Between two neighbouring cuts a cell is wholly wall or wholly floor, so its centre decides.
  const visited = Array.from({ length: columns * rows }, (_, index) => {
    const { x, y, width, height } = cellOf(index)
    const center = { x: x + width / 2, y: y + height / 2 }

    return wallRects.some(
      (rect) =>
        center.x > rect.x &&
        center.x < rect.x + rect.width &&
        center.y > rect.y &&
        center.y < rect.y + rect.height,
    )
  })

  const rooms: Point[] = []

  visited.forEach((seen, start) => {
    if (seen) return

    const pending = [start]
    const bounds = { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity }
    let closed = true
    let largest = cellOf(start)
    visited[start] = true

    for (let index = pending.pop(); index !== undefined; index = pending.pop()) {
      const cell = cellOf(index)
      const { column, row } = cell

      if (column === 0 || row === 0 || column === columns - 1 || row === rows - 1) closed = false
      if (cell.width * cell.height > largest.width * largest.height) largest = cell

      bounds.left = Math.min(bounds.left, cell.x)
      bounds.top = Math.min(bounds.top, cell.y)
      bounds.right = Math.max(bounds.right, cell.x + cell.width)
      bounds.bottom = Math.max(bounds.bottom, cell.y + cell.height)

      const neighbours = [
        column > 0 ? index - 1 : -1,
        column < columns - 1 ? index + 1 : -1,
        index - columns,
        index + columns,
      ]

      neighbours.forEach((neighbour) => {
        if (visited[neighbour] === false) {
          visited[neighbour] = true
          pending.push(neighbour)
        }
      })
    }

    const roomy = bounds.right - bounds.left >= minSpanCm && bounds.bottom - bounds.top >= minSpanCm

    if (closed && roomy) {
      rooms.push({ x: largest.x + largest.width / 2, y: largest.y + largest.height / 2 })
    }
  })

  return rooms.sort((a, b) => a.y - b.y || a.x - b.x)
}
