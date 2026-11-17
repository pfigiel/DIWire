import type { Outline, Rect, Wall } from '@/projects/api/project-query'
import type { Point } from './geometry'
import { isDivider, wallRectOf } from './walls'

/** An area closed on every side, as the grid cells that make it up. */
export type Region = {
  cells: Rect[]
  /** A point well inside it, for a label. */
  label: Point
}

type Options = {
  /** Whether dividers split an area as walls do. They split rooms, but not the space dimensions measure. */
  dividers: boolean
}

/** Narrower than this and an enclosed gap is a slip of the hand between two walls, not a room. */
const minSpanCm = 30
const tolerance = 1e-6

const cutsOf = (values: number[], max: number) =>
  [...new Set([0, max, ...values.filter((value) => value > 0 && value < max)])].sort(
    (a, b) => a - b,
  )

/**
 * The closed areas of a floor, top-left first. The outline's own edge closes nothing, so an area
 * reaching it is still open and is left out.
 */
export const regionsOf = (walls: Wall[], outline: Outline, { dividers }: Options): Region[] => {
  const rectOf = (wall: Wall) => wallRectOf(wall, walls)
  const solids = walls.filter((wall) => !isDivider(wall)).map(rectOf)
  const lines = dividers ? walls.filter(isDivider).map(rectOf) : []
  const edges = [...solids, ...lines]
  const xs = cutsOf(
    edges.flatMap(({ x, width }) => [x, x + width]),
    outline.widthCm,
  )
  const ys = cutsOf(
    edges.flatMap(({ y, height }) => [y, y + height]),
    outline.heightCm,
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

  // Whether a divider lies on the line at `position`, where a step across it passes at `along`.
  const dividedAt = (vertical: boolean, position: number, along: number) =>
    lines.some((line) =>
      vertical
        ? line.width === 0 &&
          Math.abs(line.x - position) < tolerance &&
          along > line.y &&
          along < line.y + line.height
        : line.height === 0 &&
          Math.abs(line.y - position) < tolerance &&
          along > line.x &&
          along < line.x + line.width,
    )

  // Between two neighbouring cuts a cell is wholly wall or wholly floor, so its centre decides.
  const visited = Array.from({ length: columns * rows }, (_, index) => {
    const { x, y, width, height } = cellOf(index)
    const center = { x: x + width / 2, y: y + height / 2 }

    return solids.some(
      (rect) =>
        center.x > rect.x &&
        center.x < rect.x + rect.width &&
        center.y > rect.y &&
        center.y < rect.y + rect.height,
    )
  })

  const regions: Region[] = []

  visited.forEach((seen, start) => {
    if (seen) return

    const pending = [start]
    const cells: Rect[] = []
    const bounds = { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity }
    let closed = true
    let largest = cellOf(start)
    visited[start] = true

    for (let index = pending.pop(); index !== undefined; index = pending.pop()) {
      const cell = cellOf(index)
      const { column, row, x, y, width, height } = cell
      const middle = { x: x + width / 2, y: y + height / 2 }

      if (column === 0 || row === 0 || column === columns - 1 || row === rows - 1) closed = false
      if (width * height > largest.width * largest.height) largest = cell

      cells.push({ x, y, width, height })
      bounds.left = Math.min(bounds.left, x)
      bounds.top = Math.min(bounds.top, y)
      bounds.right = Math.max(bounds.right, x + width)
      bounds.bottom = Math.max(bounds.bottom, y + height)

      const neighbours = [
        column > 0 && !dividedAt(true, x, middle.y) ? index - 1 : -1,
        column < columns - 1 && !dividedAt(true, x + width, middle.y) ? index + 1 : -1,
        row > 0 && !dividedAt(false, y, middle.x) ? index - columns : -1,
        row < rows - 1 && !dividedAt(false, y + height, middle.x) ? index + columns : -1,
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
      const label = { x: largest.x + largest.width / 2, y: largest.y + largest.height / 2 }
      regions.push({ cells, label })
    }
  })

  return regions.sort((a, b) => a.label.y - b.label.y || a.label.x - b.label.x)
}

export const regionAtOf = (regions: Region[], { x, y }: Point) =>
  regions.find(({ cells }) =>
    cells.some(
      (cell) => x >= cell.x && x <= cell.x + cell.width && y >= cell.y && y <= cell.y + cell.height,
    ),
  )
