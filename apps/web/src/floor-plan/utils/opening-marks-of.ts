import { spanLabelOf } from '@/formatting/labels'
import type { Opening, Outline } from '@/projects/api/project-query'
import { lies, type openingPlaceOf } from './openings'
import { labelSizeOf, type SpanMark } from './span-mark-of'

type Place = NonNullable<ReturnType<typeof openingPlaceOf>>

const offsetPx = 26
const gapPx = 4

/**
 * The opening's distance to the corner on either side, drawn beside its wall: away from a door's
 * swing, and towards the middle of the plan for anything that has none. The side it is measured from is locked;
 * the other follows from it.
 */
export const openingMarksOf = (
  opening: Opening,
  { host, span, across, segment, distances }: Place,
  outline: Outline,
  scale: number,
) => {
  const lying = lies(host)
  const middle = (lying ? outline.heightCm : outline.widthCm) / 2
  const inwards = (across.start + across.end) / 2 < middle ? 'max' : 'min'
  const side = opening.kind === 'door' ? (opening.opensTo === 'max' ? 'min' : 'max') : inwards
  const level = side === 'max' ? across.end + offsetPx / scale : across.start - offsetPx / scale
  const pointOf = (along: number) => (lying ? { x: along, y: level } : { x: level, y: along })

  const markOf = (at: 'from' | 'to') => {
    const locked = opening.anchor === at
    const label = spanLabelOf(distances[at])
    const size = labelSizeOf(label, locked)
    // Clear of the opening's own stretch, so the two labels never meet over a narrow one.
    const reach = Math.max(
      distances[at] / 2,
      ((lying ? size.width : size.height) / 2 + gapPx) / scale,
    )
    const mark: SpanMark =
      at === 'from'
        ? {
            from: pointOf(segment.start),
            to: pointOf(span.start),
            labelAt: pointOf(span.start - reach),
          }
        : { from: pointOf(span.end), to: pointOf(segment.end), labelAt: pointOf(span.end + reach) }

    return { side: at, mark, label, locked }
  }

  return [markOf('from'), markOf('to')]
}
