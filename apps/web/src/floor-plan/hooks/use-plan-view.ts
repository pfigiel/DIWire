import { useEffect, useEffectEvent, useRef, useState, type PointerEvent } from 'react'
import type { Point } from '@/floor-plan/utils/geometry'
import type { Rect } from '@/projects/api/project-query'

type Transform = {
  scale: number
  x: number
  y: number
}

type Size = {
  width: number
  height: number
}

type ClientPoint = Pick<MouseEvent, 'clientX' | 'clientY'>

export type PlanView = {
  /** Screen pixels per unit of the sheet; dividing by it keeps a handle or a stroke the same size at any zoom. */
  scale: number
  sheetPointOf: (event: ClientPoint) => Point
}

/** What the pointer does on the sheet besides panning it. Points are on the sheet, and `scale` is the view's at that moment, for a tolerance meant in screen pixels. */
type Pointing = {
  /** A press that did not turn into a drag. */
  onClick?: (point: Point, scale: number) => void
  /** Where the pointer rests, or null once it has left the sheet. */
  onHover?: (point: Point | null, scale: number) => void
}

const fitMarginPx = 80
const dragThresholdPx = 4
const zoomStep = 1.25
const wheelZoomRate = 0.01

const fittedOf = (bounds: Rect, size: Size): Transform => {
  const scale = Math.min(
    (size.width - 2 * fitMarginPx) / bounds.width,
    (size.height - 2 * fitMarginPx) / bounds.height,
  )

  return {
    scale,
    x: size.width / 2 - (bounds.x + bounds.width / 2) * scale,
    y: size.height / 2 - (bounds.y + bounds.height / 2) * scale,
  }
}

const zoomedOf = (transform: Transform, factor: number, anchor: Point): Transform => ({
  scale: transform.scale * factor,
  x: anchor.x - (anchor.x - transform.x) * factor,
  y: anchor.y - (anchor.y - transform.y) * factor,
})

/** Pan and zoom over a sheet: the view fits `bounds` until the user moves it, and again once they ask to fit. */
export const usePlanView = (bounds: Rect, { onClick, onHover }: Pointing) => {
  const [element, setElement] = useState<SVGSVGElement | null>(null)
  const [size, setSize] = useState<Size | null>(null)
  const [moved, setMoved] = useState<Transform | null>(null)
  const drag = useRef<{ origin: Point; last: Point; travelled: number } | null>(null)

  const fitted = size === null || size.width === 0 ? null : fittedOf(bounds, size)
  const transform = moved ?? fitted
  const scale = transform?.scale ?? 1

  const change = (next: (current: Transform) => Transform) => {
    setMoved((current) => {
      const from = current ?? fitted

      return from === null ? current : next(from)
    })
  }

  const screenPointOf = ({ clientX, clientY }: ClientPoint): Point => {
    const box = element?.getBoundingClientRect()

    return { x: clientX - (box?.left ?? 0), y: clientY - (box?.top ?? 0) }
  }

  const sheetPointOf = (event: ClientPoint): Point => {
    const point = screenPointOf(event)

    return transform === null
      ? point
      : {
          x: (point.x - transform.x) / transform.scale,
          y: (point.y - transform.y) / transform.scale,
        }
  }

  const zoomBy = (factor: number) => {
    if (size !== null)
      change((current) => zoomedOf(current, factor, { x: size.width / 2, y: size.height / 2 }))
  }

  const scroll = useEffectEvent((event: WheelEvent) => {
    event.preventDefault()

    if (event.ctrlKey || event.metaKey) {
      const factor = Math.exp(-event.deltaY * wheelZoomRate)
      change((current) => zoomedOf(current, factor, screenPointOf(event)))
    } else {
      change((current) => ({
        ...current,
        x: current.x - event.deltaX,
        y: current.y - event.deltaY,
      }))
    }
  })

  useEffect(() => {
    if (element === null) return undefined

    const observer = new ResizeObserver(([entry]) => {
      if (entry !== undefined)
        setSize({ width: entry.contentRect.width, height: entry.contentRect.height })
    })
    const onWheel = (event: WheelEvent) => scroll(event)

    observer.observe(element)
    // React attaches wheel listeners as passive, and a passive one cannot stop the page from zooming.
    element.addEventListener('wheel', onWheel, { passive: false })

    return () => {
      observer.disconnect()
      element.removeEventListener('wheel', onWheel)
    }
  }, [element])

  const startDrag = (event: PointerEvent) => {
    if (event.button !== 0) return

    const last = { x: event.clientX, y: event.clientY }
    drag.current = { origin: sheetPointOf(event), last, travelled: 0 }
  }

  const move = (event: PointerEvent<SVGSVGElement>) => {
    const dragged = drag.current

    if (dragged === null) {
      onHover?.(sheetPointOf(event), scale)

      return
    }

    const step = { x: event.clientX - dragged.last.x, y: event.clientY - dragged.last.y }
    dragged.travelled += Math.hypot(step.x, step.y)

    if (dragged.travelled < dragThresholdPx) return

    event.currentTarget.setPointerCapture(event.pointerId)
    dragged.last = { x: event.clientX, y: event.clientY }
    change((current) => ({ ...current, x: current.x + step.x, y: current.y + step.y }))
  }

  const endDrag = () => {
    const dragged = drag.current
    drag.current = null

    if (dragged !== null && dragged.travelled < dragThresholdPx) onClick?.(dragged.origin, scale)
  }

  const cancelDrag = () => {
    drag.current = null
  }

  return {
    ref: setElement,
    transform,
    view: { scale, sheetPointOf } satisfies PlanView,
    zoomIn: () => zoomBy(zoomStep),
    zoomOut: () => zoomBy(1 / zoomStep),
    fit: () => setMoved(null),
    pointerHandlers: {
      onPointerDown: startDrag,
      onPointerMove: move,
      onPointerUp: endDrag,
      onPointerCancel: cancelDrag,
      onPointerLeave: () => onHover?.(null, scale),
    },
  }
}
