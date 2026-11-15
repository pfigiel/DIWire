import type { Rect } from '@/projects/api/project-query'

const cutsOf = (values: number[]) => [...new Set(values)].sort((a, b) => a - b)

/**
 * The edge of the shape a set of overlapping rectangles makes together, as an SVG path of loose
 * segments: only the sides where the shape meets what is outside it, none of the edges inside.
 */
export const outlinePathOf = (rects: Rect[]) => {
  const xs = cutsOf(rects.flatMap(({ x, width }) => [x, x + width]))
  const ys = cutsOf(rects.flatMap(({ y, height }) => [y, y + height]))

  // Between two neighbouring cuts a cell is wholly inside the shape or wholly outside it.
  const covered = (column: number, row: number) => {
    const [left, right, top, bottom] = [xs[column], xs[column + 1], ys[row], ys[row + 1]]

    if (left === undefined || right === undefined || top === undefined || bottom === undefined) {
      return false
    }

    const center = { x: (left + right) / 2, y: (top + bottom) / 2 }

    return rects.some(
      ({ x, y, width, height }) =>
        center.x > x && center.x < x + width && center.y > y && center.y < y + height,
    )
  }

  const segments: string[] = []

  for (let row = 0; row < ys.length - 1; row += 1) {
    for (let column = 0; column < xs.length - 1; column += 1) {
      if (!covered(column, row)) continue

      const [left, right, top, bottom] = [xs[column], xs[column + 1], ys[row], ys[row + 1]]

      if (!covered(column, row - 1)) segments.push(`M${left} ${top}H${right}`)
      if (!covered(column, row + 1)) segments.push(`M${left} ${bottom}H${right}`)
      if (!covered(column - 1, row)) segments.push(`M${left} ${top}V${bottom}`)
      if (!covered(column + 1, row)) segments.push(`M${right} ${top}V${bottom}`)
    }
  }

  return segments.join('')
}
