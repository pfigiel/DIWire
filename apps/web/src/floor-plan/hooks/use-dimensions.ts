import { useEffect, useEffectEvent, useMemo, useState } from 'react'
import { useFloorEditor } from '@/floor-plan/contexts/floor-editor'
import type { Dimension } from '@/floor-plan/utils/dimensions-of'
import { regionsOf, type Region } from '@/floor-plan/utils/regions-of'
import { renamedRoomsOf, settledRoomsOf } from '@/floor-plan/utils/room-names'
import {
  lockSpanOf,
  planOf,
  solvedWallsOf,
  standingLocksOf,
} from '@/floor-plan/utils/solved-walls-of'
import type { Lock, Outline, Wall } from '@/projects/api/project-query'
import { useUpdateFloor } from './use-update-floor'

/** An edit that was refused: the value asked for, and the dimensions whose locks stood in its way. */
type Refusal = {
  valueCm: number
  keys: string[]
  /** When a single lock is in the way: what it holds, and what it would have to be for the edit to fit. */
  fix?: { lockedCm: number; neededCm: number }
}

const tolerance = 1e-6

const moved = (before: Wall[], after: Wall[]) =>
  after.some((wall, index) => {
    const other = before[index]
    const shift = (a: Wall['from'], b: Wall['from'] | undefined) =>
      'position' in a && b !== undefined && 'position' in b ? Math.abs(a.position - b.position) : 0

    return (
      Math.abs(wall.center - (other?.center ?? wall.center)) > tolerance ||
      shift(wall.from, other?.from) > tolerance ||
      shift(wall.to, other?.to) > tolerance
    )
  })

/**
 * The walls as the step starts from them: faces a few centimetres apart brought into line, every
 * surviving lock holding again. Walls may have changed since the locks were made, so locks that no
 * longer fit are dropped rather than left to make the plan unsolvable.
 */
const startOf = (walls: Wall[], locks: Lock[], outline: Outline) => {
  const standing = standingLocksOf(locks, planOf(walls, outline))
  const kept = solvedWallsOf(walls, outline, standing)

  if (kept !== null) return { walls: kept, locks: standing }

  return { walls: solvedWallsOf(walls, outline, []) ?? walls, locks: [] }
}

export const useDimensions = (outline: Outline) => {
  const { floor } = useFloorEditor()
  const update = useUpdateFloor()
  const [{ walls, locks }, setPlan] = useState(() => startOf(floor.walls, floor.locks, outline))
  const [names, setNames] = useState(floor.rooms)
  const [refusal, setRefusal] = useState<Refusal | null>(null)

  const plan = useMemo(() => planOf(walls, outline), [walls, outline])
  const regions = useMemo(() => regionsOf(walls, outline, { dividers: true }), [walls, outline])
  /** One of each dimension: a span two rooms share is drawn in both but is a single value. */
  const unique = useMemo(
    () => [...new Map(plan.dimensions.map((dimension) => [dimension.key, dimension])).values()],
    [plan],
  )

  const saveStart = useEffectEvent(() => {
    if (moved(floor.walls, walls) || locks.length !== floor.locks.length) {
      update.mutate({ walls, locks })
    }
  })

  useEffect(() => saveStart(), [])

  const lockOf = ({ from, to }: Dimension) =>
    locks.find((lock) => {
      const span = lockSpanOf(lock, plan.lines)

      return span?.from === from && span.to === to
    })

  const faceKeyOf = (line: number) => plan.lines.lines[line]?.faces[0]?.key

  // With the one lock in the way lifted the edit goes through; where that lock's span ends up is
  // what it would have to be changed to.
  const fixOf = (inTheWay: Lock[], wanted: Lock[]) => {
    const [blocker, ...more] = inTheWay

    if (blocker === undefined || more.length > 0) return undefined

    const solved = solvedWallsOf(
      walls,
      outline,
      wanted.filter((candidate) => candidate !== blocker),
    )

    if (solved === null) return undefined

    const { lines } = planOf(solved, outline)
    const span = lockSpanOf(blocker, lines)
    const positionOf = (line: number) => lines.lines[line]?.position ?? 0

    return span === undefined
      ? undefined
      : { lockedCm: blocker.valueCm, neededCm: positionOf(span.to) - positionOf(span.from) }
  }

  const lock = (dimension: Dimension, valueCm: number) => {
    const a = faceKeyOf(dimension.from)
    const b = faceKeyOf(dimension.to)

    if (a === undefined || b === undefined) return

    const others = locks.filter((other) => other !== lockOf(dimension))
    const next = [...others, { a, b, valueCm }]
    const solved = solvedWallsOf(walls, outline, next)

    if (solved === null) {
      // A lock is in the way if the edit goes through once that lock alone is lifted.
      const inTheWay = others.filter(
        (other) =>
          solvedWallsOf(
            walls,
            outline,
            next.filter((candidate) => candidate !== other),
          ) !== null,
      )
      const blocking = inTheWay.length > 0 ? inTheWay : others
      const keys = unique
        .filter((other) => other.axis === dimension.axis)
        .filter((other) => blocking.some((blocker) => blocker === lockOf(other)))
        .map(({ key }) => key)

      setRefusal({ valueCm, keys, fix: fixOf(inTheWay, next) })

      return
    }

    const settled = settledRoomsOf(names, regionsOf(solved, outline, { dividers: true }))

    setPlan({ walls: solved, locks: next })
    setNames(settled)
    setRefusal(null)
    update.mutate({ walls: solved, locks: next, rooms: settled })
  }

  const unlock = (dimension: Dimension) => {
    const next = locks.filter((other) => other !== lockOf(dimension))

    setPlan({ walls, locks: next })
    setRefusal(null)
    update.mutate({ locks: next })
  }

  const rename = (room: Region, name: string) => {
    const next = renamedRoomsOf(names, room, regions, name)

    setNames(next)
    update.mutate({ rooms: next })
  }

  return {
    walls,
    dimensions: plan.dimensions,
    unique,
    regions,
    names,
    refusal,
    failed: update.isError,
    lockOf,
    lock,
    unlock,
    rename,
  }
}
