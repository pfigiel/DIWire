import { jointsOf, wallRectOf } from '@/floor-plan/utils/walls'
import type { Rect, Wall } from '@/projects/api/project-query'
import classes from './WallShapes.module.css'

type Props = {
  walls: Wall[]
  /** The wall being drawn, not yet among `walls`. */
  draft: Wall | null
  /** Where a wall would start if the user clicked now. */
  start: Rect | null
  selectedId: string | null
  /** Whether walls answer to the pointer, which they do only while the select tool is on. */
  selectable: boolean
  /** Screen pixels per centimetre, so a joint's marker keeps its size at any zoom. */
  scale: number
}

const jointPx = 7

const pathOf = (rects: Rect[]) =>
  rects.map(({ x, y, width, height }) => `M${x} ${y}h${width}v${height}h${-width}z`).join('')

export const WallShapes = ({ walls, draft, start, selectedId, selectable, scale }: Props) => {
  const rectOf = (wall: Wall) => wallRectOf(wall, walls)
  const shape = pathOf(walls.map(rectOf))
  const joints = draft === null ? [] : jointsOf(draft, walls)

  const stateOf = ({ id }: Wall) => {
    if (joints.some(({ wallId }) => wallId === id)) return 'target'

    return id === selectedId ? 'selected' : undefined
  }

  return (
    <g data-selectable={selectable || undefined}>
      {/* The fill lies over the outline and hides every edge inside the shape, so walls that overlap at a join read as one. */}
      <g className={classes.walls}>
        <path className={classes.outline} d={shape} />
        <path className={classes.fill} d={shape} />
      </g>
      {walls.map((wall) => (
        <rect key={wall.id} {...rectOf(wall)} className={classes.wall} data-state={stateOf(wall)} />
      ))}
      {start === null ? null : <rect {...start} className={classes.draft} />}
      {draft === null ? null : <rect {...rectOf(draft)} className={classes.draft} />}
      {joints.map(({ wallId, point }) => (
        <circle
          key={wallId}
          className={classes.joint}
          cx={point.x}
          cy={point.y}
          r={jointPx / scale}
        />
      ))}
    </g>
  )
}
