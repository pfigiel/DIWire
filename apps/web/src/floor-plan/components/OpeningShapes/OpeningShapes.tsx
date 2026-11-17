import { lies, openingPlaceOf } from '@/floor-plan/utils/openings'
import type { Opening, Wall } from '@/projects/api/project-query'
import classes from './OpeningShapes.module.css'

type Props = {
  openings: Opening[]
  walls: Wall[]
  /** Where an opening would land if the user clicked now. */
  ghost: Opening | undefined
  selectedId: string | null
}

type ShapeProps = {
  opening: Opening
  walls: Wall[]
  state: 'selected' | 'ghost' | undefined
}

const Shape = ({ opening, walls, state }: ShapeProps) => {
  const place = openingPlaceOf(opening, walls)

  if (place === undefined) return null

  const { host, span, across } = place
  const pointOf = (along: number, level: number) =>
    lies(host) ? { x: along, y: level } : { x: level, y: along }
  const corner = pointOf(span.start, across.start)
  const opposite = pointOf(span.end, across.end)
  const width = span.end - span.start

  // One line along the middle of the wall: a window's glass, or a garage door standing shut.
  const panel = () => {
    const level = (across.start + across.end) / 2
    const from = pointOf(span.start, level)
    const to = pointOf(span.end, level)

    return `M${from.x} ${from.y}L${to.x} ${to.y}`
  }

  // The leaf sits centred in its frame and stands open at a right angle; the arc is the path its
  // edge takes back to the frame.
  const swing = () => {
    const leaf = opening.leafWidthCm ?? width
    const frame = (width - leaf) / 2
    const face = opening.opensTo === 'min' ? across.start : across.end
    const outwards = opening.opensTo === 'min' ? -1 : 1
    const [hinged, free] =
      opening.hinge === 'from'
        ? [span.start + frame, span.end - frame]
        : [span.end - frame, span.start + frame]
    const hinge = pointOf(hinged, face)
    const tip = pointOf(hinged, face + outwards * leaf)
    const jamb = pointOf(free, face)
    const turn = (tip.x - hinge.x) * (jamb.y - hinge.y) - (tip.y - hinge.y) * (jamb.x - hinge.x)

    return `M${hinge.x} ${hinge.y}L${tip.x} ${tip.y}A${leaf} ${leaf} 0 0 ${turn > 0 ? 1 : 0} ${jamb.x} ${jamb.y}`
  }

  return (
    <g className={classes.root} data-state={state}>
      <rect
        className={classes.gap}
        x={corner.x}
        y={corner.y}
        width={opposite.x - corner.x}
        height={opposite.y - corner.y}
      />
      <path
        className={classes.line}
        data-kind={opening.kind}
        d={opening.kind === 'door' ? swing() : panel()}
      />
    </g>
  )
}

export const OpeningShapes = ({ openings, walls, ghost, selectedId }: Props) => (
  <g>
    {openings.map((opening) => (
      <Shape
        key={opening.id}
        opening={opening}
        walls={walls}
        state={opening.id === selectedId ? 'selected' : undefined}
      />
    ))}
    {ghost === undefined ? null : <Shape opening={ghost} walls={walls} state="ghost" />}
  </g>
)
