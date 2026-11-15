import { IconMaximize, IconZoomIn, IconZoomOut } from '@tabler/icons-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, IconButton } from '@diwire/ui-kit'
import { usePlanView, type PlanView } from '@/floor-plan/hooks/use-plan-view'
import type { Point } from '@/floor-plan/utils/geometry'
import type { Rect } from '@/projects/api/project-query'
import classes from './PlanCanvas.module.css'

/** Something shown beside a point of the sheet, following it as the view moves. */
type Callout = {
  at: Point
  /** Which way from the point it sits, so it does not cover what it belongs to. */
  side: 'right' | 'below'
  content: ReactNode
}

type Props = {
  label: string
  /** The part of the sheet the view fits. */
  bounds: Rect
  children: (view: PlanView) => ReactNode
  /** The step's tools for working on the sheet, shown above it. */
  toolbar?: ReactNode
  callout?: Callout
  /** A press that did not turn into a drag, as a point on the sheet. */
  onClick?: (point: Point, scale: number) => void
  /** Where the pointer rests on the sheet, or null once it has left; a step that listens is placing something, so the cursor aims. */
  onHover?: (point: Point | null, scale: number) => void
}

export const PlanCanvas = ({
  label,
  bounds,
  children,
  toolbar,
  callout,
  onClick,
  onHover,
}: Props) => {
  const { t } = useTranslation()
  const { ref, transform, view, zoomIn, zoomOut, fit, pointerHandlers } = usePlanView(bounds, {
    onClick,
    onHover,
  })

  return (
    <div className={classes.root}>
      <svg
        ref={ref}
        aria-label={label}
        className={classes.sheet}
        data-aiming={onHover !== undefined || undefined}
        {...pointerHandlers}
      >
        {transform === null ? null : (
          <g transform={`translate(${transform.x} ${transform.y}) scale(${transform.scale})`}>
            {children(view)}
          </g>
        )}
      </svg>
      {toolbar === undefined ? null : (
        <div data-surface className={classes.toolbar}>
          {toolbar}
        </div>
      )}
      {callout === undefined || transform === null ? null : (
        <div
          className={classes.callout}
          data-side={callout.side}
          style={{
            left: callout.at.x * transform.scale + transform.x,
            top: callout.at.y * transform.scale + transform.y,
          }}
        >
          {callout.content}
        </div>
      )}
      <div data-surface className={classes.zoom}>
        <IconButton label={t('floorPlan.zoom.out')} onClick={zoomOut}>
          <IconZoomOut aria-hidden />
        </IconButton>
        <IconButton label={t('floorPlan.zoom.in')} onClick={zoomIn}>
          <IconZoomIn aria-hidden />
        </IconButton>
        <Button
          variant="secondary"
          size="sm"
          icon={<IconMaximize aria-hidden className={classes.icon} />}
          onClick={fit}
        >
          {t('floorPlan.zoom.fit')}
        </Button>
      </div>
    </div>
  )
}
