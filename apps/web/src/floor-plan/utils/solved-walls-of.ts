import type { Lock, Outline, Wall, WallEnd } from '@/projects/api/project-query'
import { dimensionsOf, type Dimension } from './dimensions-of'
import { planLinesOf, type Axis, type PlanLines } from './plan-lines'
import { regionsOf } from './regions-of'
import { solveAxis, type Span } from './solve-axis'
import { isDivider } from './walls'

/** A room narrower than this between two faces is no room; an edit that would make one is refused. */
const minSpanCm = 30

const axes: Axis[] = ['x', 'y']

/** Everything dimensions are worked out from: the lines faces stand in, and the spans between them. */
export type Plan = {
  lines: PlanLines
  dimensions: Dimension[]
}

export const planOf = (walls: Wall[], outline: Outline): Plan => {
  const lines = planLinesOf(walls, outline)

  return { lines, dimensions: dimensionsOf(regionsOf(walls, outline, { dividers: false }), lines) }
}

/** The lock as a span between two of the plan's lines, or nothing once either face is gone. */
export const lockSpanOf = ({ a, b, valueCm }: Lock, { indexOf }: PlanLines): Span | undefined => {
  const from = indexOf.get(a)
  const to = indexOf.get(b)

  return from === undefined || to === undefined ? undefined : { from, to, value: valueCm }
}

/** The locks that still stand for a dimension the plan has; one whose room is gone is dropped. */
export const standingLocksOf = (locks: Lock[], { lines, dimensions }: Plan) =>
  locks.filter((lock) => {
    const span = lockSpanOf(lock, lines)

    return (
      span !== undefined && dimensions.some(({ from, to }) => from === span.from && to === span.to)
    )
  })

/**
 * Where a value between the plan's lines ends up once those lines have moved: it keeps its relative
 * place between the two lines on either side of it. Dividers move this way, having no faces.
 */
const carriedOf = (value: number, moves: { from: number; to: number }[]) => {
  const sorted = [...moves].sort((a, b) => a.from - b.from)
  const after = sorted.findIndex(({ from }) => from >= value)
  const next = sorted[after]
  const previous = sorted[after - 1]

  if (next === undefined)
    return value + ((sorted.at(-1)?.to ?? value) - (sorted.at(-1)?.from ?? value))
  if (previous === undefined || next.from === previous.from) return value + next.to - next.from

  const share = (value - previous.from) / (next.from - previous.from)

  return previous.to + share * (next.to - previous.to)
}

const movedWallsOf = (walls: Wall[], { lines, indexOf }: PlanLines, positions: number[]) => {
  const positionOf = (key: string) => positions[indexOf.get(key) ?? -1]
  const movesOf = (axis: Axis) =>
    lines.flatMap((line, index) =>
      line.axis === axis ? [{ from: line.position, to: positions[index] ?? line.position }] : [],
    )
  const moves = { x: movesOf('x'), y: movesOf('y') }

  return walls.map((wall): Wall => {
    // A standing wall sits at an x and runs along y; a lying one the other way round.
    const [across, along] =
      wall.orientation === 'vertical' ? (['x', 'y'] as const) : (['y', 'x'] as const)

    if (isDivider(wall)) {
      const carried = (end: WallEnd): WallEnd =>
        'position' in end ? { position: carriedOf(end.position, moves[along]) } : end

      return {
        ...wall,
        center: carriedOf(wall.center, moves[across]),
        from: carried(wall.from),
        to: carried(wall.to),
      }
    }

    const min = positionOf(`${wall.id}:min`)
    const max = positionOf(`${wall.id}:max`)
    const placed = (end: WallEnd, side: 'from' | 'to'): WallEnd =>
      'position' in end ? { position: positionOf(`${wall.id}:${side}`) ?? end.position } : end

    return {
      ...wall,
      center: min === undefined || max === undefined ? wall.center : (min + max) / 2,
      from: placed(wall.from, 'from'),
      to: placed(wall.to, 'to'),
    }
  })
}

/**
 * The walls moved so that every lock holds exactly, faces a few centimetres off each other stand in
 * one line, and every dimension that is not locked changes as little as it can. Null when the locks
 * cannot all hold, or holding them would squeeze a room to nothing.
 */
export const solvedWallsOf = (walls: Wall[], outline: Outline, locks: Lock[]): Wall[] | null => {
  const plan = planOf(walls, outline)
  const { lines, indexOf } = plan.lines
  const positions = lines.map(({ position }) => position)
  const lockSpans = locks.flatMap((lock) => lockSpanOf(lock, plan.lines) ?? [])

  const thicknesses = walls.flatMap((wall): Span[] => {
    const from = indexOf.get(`${wall.id}:min`)
    const to = indexOf.get(`${wall.id}:max`)

    return from === undefined || to === undefined ? [] : [{ from, to, value: wall.thicknessCm }]
  })

  for (const axis of axes) {
    const onAxis = ({ from }: Span) => lines[from]?.axis === axis
    const hard = [...thicknesses, ...lockSpans].filter(onAxis)
    const locked = new Set(lockSpans.map(({ from, to }) => `${from}:${to}`))
    const soft = [
      ...new Map(
        plan.dimensions
          .filter((dimension) => dimension.axis === axis)
          .filter(({ from, to }) => !locked.has(`${from}:${to}`))
          .map(({ key, from, to }) => [
            key,
            { from, to, value: (positions[to] ?? 0) - (positions[from] ?? 0) },
          ]),
      ).values(),
    ]

    const solved = solveAxis({
      // Lines of the other axis are held still, which leaves them out of this solve.
      positions,
      fixed: lines.map((line) => line.fixed || line.axis !== axis),
      hard,
      soft,
    })

    if (solved === null) return null

    solved.forEach((position, index) => (positions[index] = position))
  }

  const squeezed = plan.dimensions.some(
    ({ from, to }) => (positions[to] ?? 0) - (positions[from] ?? 0) < minSpanCm - 1e-6,
  )

  return squeezed ? null : movedWallsOf(walls, plan.lines, positions)
}
