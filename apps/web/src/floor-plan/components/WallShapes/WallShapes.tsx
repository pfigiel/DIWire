import { useId, useMemo } from 'react'
import { outlinePathOf } from '@/floor-plan/utils/outline-path-of'
import { isDivider, jointsOf, wallRectOf } from '@/floor-plan/utils/walls'
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
const startPx = 5

const pathOf = (rects: Rect[]) =>
  rects.map(({ x, y, width, height }) => `M${x} ${y}h${width}v${height}h${-width}z`).join('')

/** A divider has no thickness, so its rectangle is the line it runs along. */
const lineOf = ({ x, y, width, height }: Rect) => ({ x1: x, y1: y, x2: x + width, y2: y + height })

export const WallShapes = ({ walls, draft, start, selectedId, selectable, scale }: Props) => {
  const clipId = useId()
  const rectOf = (wall: Wall) => wallRectOf(wall, walls)
  const joints = draft === null ? [] : jointsOf(draft, walls)

  const { shape, outline } = useMemo(() => {
    const rects = walls.filter((wall) => !isDivider(wall)).map((wall) => wallRectOf(wall, walls))

    return { shape: pathOf(rects), outline: outlinePathOf(rects) }
  }, [walls])

  const stateOf = ({ id }: Wall) => {
    if (joints.some(({ wallId }) => wallId === id)) return 'target'

    return id === selectedId ? 'selected' : undefined
  }

  return (
    <g data-selectable={selectable || undefined}>
      <clipPath id={clipId}>
        <path d={shape} />
      </clipPath>
      <g className={classes.walls}>
        <path className={classes.fill} d={shape} />
        {/* Clipped to the shape, so the border lies inside the wall and adds nothing to its thickness. */}
        <path className={classes.outline} d={outline} clipPath={`url(#${clipId})`} />
      </g>
      {walls.map((wall) =>
        isDivider(wall) ? (
          <g key={wall.id} className={classes.divider} data-state={stateOf(wall)}>
            <line {...lineOf(rectOf(wall))} className={classes.dividerLine} />
            {/* Wide and unseen, so a line a pixel or two across can still be hovered. */}
            <line {...lineOf(rectOf(wall))} className={classes.dividerReach} />
          </g>
        ) : (
          <rect
            key={wall.id}
            {...rectOf(wall)}
            className={classes.wall}
            data-state={stateOf(wall)}
          />
        ),
      )}
      {start === null ? null : start.width === 0 ? (
        <circle className={classes.draft} cx={start.x} cy={start.y} r={startPx / scale} />
      ) : (
        <rect {...start} className={classes.draft} />
      )}
      {draft === null ? null : isDivider(draft) ? (
        <line {...lineOf(rectOf(draft))} className={classes.dividerDraft} />
      ) : (
        <rect {...rectOf(draft)} className={classes.draft} />
      )}
      {joints.map(({ wallId, point }, index) => (
        <circle
          key={`${wallId}-${index}`}
          className={classes.joint}
          cx={point.x}
          cy={point.y}
          r={jointPx / scale}
        />
      ))}
    </g>
  )
}
