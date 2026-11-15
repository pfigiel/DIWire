import { useRef, type PointerEvent } from 'react'
import type { PlanView } from '@/floor-plan/hooks/use-plan-view'
import { resizedOf, type Edges, type Point } from '@/floor-plan/utils/geometry'
import type { Rect } from '@/projects/api/project-query'
import classes from './CropFrame.module.css'

type Props = {
  crop: Rect
  view: PlanView
  onChange: (crop: Rect) => void
}

const gridColumns = 15
const gridRows = 12
const handlePx = 14
const minSizePx = 24
/** Far enough past any sheet that the dimmed area never ends on screen. */
const dimReach = 1e6

const handles: Edges[] = [
  { x: 'min', y: 'min' },
  { y: 'min' },
  { x: 'max', y: 'min' },
  { x: 'max' },
  { x: 'max', y: 'max' },
  { y: 'max' },
  { x: 'min', y: 'max' },
  { x: 'min' },
]

const anchorOf = (start: number, size: number, edge: 'min' | 'max' | undefined) =>
  start + (edge === undefined ? size / 2 : edge === 'min' ? 0 : size)

const handlePointOf = (crop: Rect, edges: Edges): Point => ({
  x: anchorOf(crop.x, crop.width, edges.x),
  y: anchorOf(crop.y, crop.height, edges.y),
})

const gridPathOf = ({ x, y, width, height }: Rect) => {
  const columns = Array.from(
    { length: gridColumns - 1 },
    (_, index) => `M${x + ((index + 1) * width) / gridColumns} ${y}v${height}`,
  )
  const rows = Array.from(
    { length: gridRows - 1 },
    (_, index) => `M${x} ${y + ((index + 1) * height) / gridRows}h${width}`,
  )

  return [...columns, ...rows].join('')
}

export const CropFrame = ({ crop, view, onChange }: Props) => {
  /** Where on the handle it was grabbed, so the edge does not jump to the pointer. */
  const grip = useRef<Point>({ x: 0, y: 0 })
  const handleSize = handlePx / view.scale

  const grab = (event: PointerEvent<SVGRectElement>, edges: Edges) => {
    const point = view.sheetPointOf(event)
    const handle = handlePointOf(crop, edges)

    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    grip.current = { x: point.x - handle.x, y: point.y - handle.y }
  }

  const drag = (event: PointerEvent<SVGRectElement>, edges: Edges) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return

    const point = view.sheetPointOf(event)
    const edge = { x: point.x - grip.current.x, y: point.y - grip.current.y }

    onChange(resizedOf(crop, edges, edge, minSizePx / view.scale))
  }

  return (
    <g>
      <path
        className={classes.dim}
        fillRule="evenodd"
        d={`M${-dimReach} ${-dimReach}h${2 * dimReach}v${2 * dimReach}h${-2 * dimReach}zM${crop.x} ${crop.y}h${crop.width}v${crop.height}h${-crop.width}z`}
      />
      <path className={classes.grid} d={gridPathOf(crop)} />
      <rect {...crop} className={classes.frame} />
      {handles.map((edges) => {
        const { x, y } = handlePointOf(crop, edges)

        return (
          <rect
            key={`${edges.x ?? 'mid'}-${edges.y ?? 'mid'}`}
            className={classes.handle}
            data-edge-x={edges.x}
            data-edge-y={edges.y}
            x={x - handleSize / 2}
            y={y - handleSize / 2}
            width={handleSize}
            height={handleSize}
            rx={handleSize / 4}
            onPointerDown={(event) => grab(event, edges)}
            onPointerMove={(event) => drag(event, edges)}
          />
        )
      })}
    </g>
  )
}
