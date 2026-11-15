import { IconMaximize, IconZoomIn, IconZoomOut } from '@tabler/icons-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, IconButton } from '@diwire/ui-kit'
import { usePlanView, type PlanView } from '@/floor-plan/hooks/use-plan-view'
import type { Rect } from '@/projects/api/project-query'
import classes from './PlanCanvas.module.css'

type Props = {
  label: string
  /** The part of the sheet the view fits. */
  bounds: Rect
  children: (view: PlanView) => ReactNode
}

export const PlanCanvas = ({ label, bounds, children }: Props) => {
  const { t } = useTranslation()
  const { ref, transform, view, zoomIn, zoomOut, fit, pointerHandlers } = usePlanView(bounds)

  return (
    <div className={classes.root}>
      <svg ref={ref} aria-label={label} className={classes.sheet} {...pointerHandlers}>
        {transform === null ? null : (
          <g transform={`translate(${transform.x} ${transform.y}) scale(${transform.scale})`}>
            {children(view)}
          </g>
        )}
      </svg>
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
