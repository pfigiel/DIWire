import { labelSizeOf, type SpanMark as Mark } from '@/floor-plan/utils/span-mark-of'
import classes from './SpanMark.module.css'

type Props = {
  mark: Mark
  label: string
  /** Unverified is traced and still adjusts; locked was typed by the user; blocking is a lock in the way of an edit. */
  state: 'unverified' | 'locked' | 'blocking'
  /** Screen pixels per centimetre, so ticks and the label keep their size at any zoom. */
  scale: number
}

const tickPx = 7

export const SpanMark = ({ mark: { from, to, labelAt }, label, state, scale }: Props) => {
  // A span of no length still gets its label; it has no direction to draw ticks across.
  const length = Math.hypot(to.x - from.x, to.y - from.y) || 1
  const tick = {
    x: ((from.y - to.y) / length) * (tickPx / scale),
    y: ((to.x - from.x) / length) * (tickPx / scale),
  }
  const locked = state !== 'unverified'
  const { width, height } = labelSizeOf(label, locked)

  return (
    <g className={classes.root} data-state={state}>
      <path className={classes.line} d={`M${from.x} ${from.y}L${to.x} ${to.y}`} />
      <path
        className={classes.ticks}
        d={[from, to]
          .map(({ x, y }) => `M${x - tick.x} ${y - tick.y}L${x + tick.x} ${y + tick.y}`)
          .join('')}
      />
      <g transform={`translate(${labelAt.x} ${labelAt.y}) scale(${1 / scale})`}>
        <rect
          className={classes.pill}
          x={-width / 2}
          y={-height / 2}
          width={width}
          height={height}
          rx={6}
        />
        {locked ? (
          <g className={classes.lock} transform={`translate(${-width / 2 + 8} -7)`}>
            <rect x="0" y="6" width="10" height="7" rx="1.5" />
            <path d="M2.5 6V4a2.5 2.5 0 015 0v2" />
          </g>
        ) : null}
        <text
          className={classes.label}
          x={locked ? 8 : 0}
          textAnchor="middle"
          dominantBaseline="central"
        >
          {label}
        </text>
      </g>
    </g>
  )
}
