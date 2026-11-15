import type { Point } from '@/floor-plan/utils/geometry'
import classes from './DimensionLine.module.css'

type Props = {
  from: Point
  to: Point
  label: string
  /** Screen pixels per sheet unit, so the ticks and the label keep their size at any zoom. */
  scale: number
}

const tickPx = 10
const labelHeightPx = 32
const labelPaddingPx = 14
const characterWidthPx = 8.5

export const DimensionLine = ({ from, to, label, scale }: Props) => {
  const length = Math.hypot(to.x - from.x, to.y - from.y)
  const tick = {
    x: ((from.y - to.y) / length) * (tickPx / scale),
    y: ((to.x - from.x) / length) * (tickPx / scale),
  }
  const labelWidthPx = label.length * characterWidthPx + 2 * labelPaddingPx

  return (
    <g>
      <path
        className={classes.line}
        d={[from, to]
          .map(({ x, y }) => `M${x - tick.x} ${y - tick.y}L${x + tick.x} ${y + tick.y}`)
          .join('')
          .concat(`M${from.x} ${from.y}L${to.x} ${to.y}`)}
      />
      <g transform={`translate(${(from.x + to.x) / 2} ${(from.y + to.y) / 2}) scale(${1 / scale})`}>
        <rect
          className={classes.pill}
          x={-labelWidthPx / 2}
          y={-labelHeightPx / 2}
          width={labelWidthPx}
          height={labelHeightPx}
          rx={labelHeightPx / 4}
        />
        <text className={classes.label} textAnchor="middle" dominantBaseline="central">
          {label}
        </text>
      </g>
    </g>
  )
}
