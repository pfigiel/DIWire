import type { Point } from '@/floor-plan/utils/geometry'
import classes from './RoomLabels.module.css'

type Props = {
  rooms: { name: string; at: Point }[]
  /** Whether a name can be clicked to change it. */
  renamable: boolean
  /** Screen pixels per centimetre, so names keep their size at any zoom. */
  scale: number
}

export const RoomLabels = ({ rooms, renamable, scale }: Props) => (
  <g data-renamable={renamable || undefined}>
    {rooms.map(({ name, at }) => (
      <text
        key={`${at.x}-${at.y}`}
        className={classes.name}
        textAnchor="middle"
        dominantBaseline="central"
        transform={`translate(${at.x} ${at.y}) scale(${1 / scale})`}
      >
        {name}
      </text>
    ))}
  </g>
)
