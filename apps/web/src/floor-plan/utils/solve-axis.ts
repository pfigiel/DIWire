/** A distance to keep between two variables: `to` minus `from`. */
export type Span = {
  from: number
  to: number
  value: number
}

type Problem = {
  /** Where each variable stands now. */
  positions: number[]
  /** Variables that may not move. */
  fixed: boolean[]
  /** Distances that must hold exactly. */
  hard: Span[]
  /** Distances to keep as near as the hard ones allow. */
  soft: Span[]
}

const tolerance = 1e-6
/** Holds a variable no distance mentions where it is, and keeps the system solvable. */
const anchorWeight = 1e-6

/** Gaussian elimination with partial pivoting; null when the rows contradict each other. */
const reducedOf = (rows: number[][], unknowns: number) => {
  const kept: number[][] = []
  const work = rows.map((row) => [...row])

  for (let column = 0; column < unknowns; column += 1) {
    let pivot = -1

    work.forEach((row, index) => {
      const size = Math.abs(row[column] ?? 0)

      if (size > tolerance && (pivot === -1 || size > Math.abs(work[pivot]?.[column] ?? 0))) {
        pivot = index
      }
    })

    if (pivot === -1) continue

    const [row] = work.splice(pivot, 1)

    if (row === undefined) continue

    const lead = row[column] ?? 1
    const scaled = row.map((value) => value / lead)

    work.forEach((other) => {
      const factor = other[column] ?? 0

      if (factor !== 0)
        scaled.forEach((value, index) => (other[index] = (other[index] ?? 0) - factor * value))
    })
    kept.forEach((other) => {
      const factor = other[column] ?? 0

      if (factor !== 0)
        scaled.forEach((value, index) => (other[index] = (other[index] ?? 0) - factor * value))
    })
    kept.push(scaled)
  }

  // What is left has no unknowns in it: a row still demanding something cannot be met.
  return work.some((row) => Math.abs(row[unknowns] ?? 0) > tolerance) ? null : kept
}

/**
 * New positions that meet every hard distance exactly and change the soft ones as little as possible,
 * each in proportion to its size: a 5 m span gives way far more readily than a 1 m one. Null when the
 * hard distances cannot all hold.
 */
export const solveAxis = ({ positions, fixed, hard, soft }: Problem): number[] | null => {
  const free = positions.flatMap((_, index) => (fixed[index] === true ? [] : [index]))
  const columnOf = new Map(free.map((variable, column) => [variable, column]))
  const count = free.length

  // A distance as a row over the free variables, with whatever fixed ones contribute moved to the right.
  const rowOf = ({ from, to, value }: Span) => {
    const row = Array.from({ length: count + 1 }, () => 0)
    let rest = value

    const add = (variable: number, sign: number) => {
      const column = columnOf.get(variable)

      if (column === undefined) rest -= sign * (positions[variable] ?? 0)
      else row[column] = (row[column] ?? 0) + sign
    }

    add(to, 1)
    add(from, -1)
    row[count] = rest

    return row
  }

  const constraints = reducedOf(hard.map(rowOf), count)

  if (constraints === null) return null

  // Least squares under equalities, as one system: [H Aᵀ; A 0] · [x; λ] = [g; c].
  const size = count + constraints.length
  const system = Array.from({ length: size }, () => Array.from({ length: size + 1 }, () => 0))
  const cell = (row: number, column: number, value: number) => {
    const line = system[row]

    if (line !== undefined) line[column] = (line[column] ?? 0) + value
  }

  free.forEach((variable, column) => {
    cell(column, column, anchorWeight)
    cell(column, size, anchorWeight * (positions[variable] ?? 0))
  })

  soft.forEach((span) => {
    const row = rowOf(span)
    const weight = 1 / Math.max(span.value, 1) ** 2

    row.slice(0, count).forEach((a, i) => {
      if (a === 0) return

      row.slice(0, count).forEach((b, j) => cell(i, j, weight * a * b))
      cell(i, size, weight * a * (row[count] ?? 0))
    })
  })

  constraints.forEach((row, index) => {
    row.slice(0, count).forEach((value, column) => {
      cell(count + index, column, value)
      cell(column, count + index, value)
    })
    cell(count + index, size, row[count] ?? 0)
  })

  const solved = reducedOf(system, size)

  if (solved === null || solved.length < size) return null

  const answer = Array.from({ length: size }, () => 0)

  solved.forEach((row) => {
    const column = row.findIndex((value) => Math.abs(value - 1) < tolerance)

    if (column !== -1) answer[column] = row[size] ?? 0
  })

  return positions.map((position, variable) => {
    const column = columnOf.get(variable)

    return column === undefined ? position : (answer[column] ?? position)
  })
}
