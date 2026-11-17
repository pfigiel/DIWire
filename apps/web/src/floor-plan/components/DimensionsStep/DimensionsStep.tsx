import { IconLock } from '@tabler/icons-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Progress, Text } from '@diwire/ui-kit'
import { useDimensions } from '@/floor-plan/hooks/use-dimensions'
import type { Dimension } from '@/floor-plan/utils/dimensions-of'
import type { Point } from '@/floor-plan/utils/geometry'
import { namedRoomsOf } from '@/floor-plan/utils/named-rooms-of'
import type { Region } from '@/floor-plan/utils/regions-of'
import { hits, labelSizeOf, spanMarkOf } from '@/floor-plan/utils/span-mark-of'
import { spanLabelOf } from '@/formatting/labels'
import type { Outline } from '@/projects/api/project-query'
import { InlineField } from '../InlineField'
import { PlanCanvas } from '../PlanCanvas'
import { RoomLabels } from '../RoomLabels'
import { SpanMark } from '../SpanMark'
import { StepLayout } from '../StepLayout'
import { WallShapes } from '../WallShapes'
import classes from './DimensionsStep.module.css'

type Props = {
  outline: Outline
}

/** What is being typed in place on the plan. */
type Editing =
  { kind: 'dimension'; dimension: Dimension } | { kind: 'room'; room: Region; name: string } | null

const outlineOffsetPx = 36
const characterPx = 8
const roomLabelHeightPx = 24

const typedLengthOf = (text: string) => Number.parseFloat(text.replace(/\s/g, '').replace(',', '.'))

export const DimensionsStep = ({ outline }: Props) => {
  const { t } = useTranslation()
  const plan = useDimensions(outline)
  const [editing, setEditing] = useState<Editing>(null)
  const rooms = namedRoomsOf(t, plan.regions, plan.names)
  const verified = plan.unique.filter((dimension) => plan.lockOf(dimension) !== undefined).length
  const nextUnverified = plan.unique.find((dimension) => plan.lockOf(dimension) === undefined)

  const lengthOf = (dimension: Dimension) =>
    plan.lockOf(dimension)?.valueCm ?? Math.round(dimension.end - dimension.start)

  const stateOf = (dimension: Dimension) => {
    if (plan.refusal?.keys.includes(dimension.key) === true) return 'blocking'

    return plan.lockOf(dimension) === undefined ? 'unverified' : 'locked'
  }

  // A click on a locked dimension unlocks it; on a grey one, or on a room's name, it starts typing.
  const pick = (point: Point, scale: number) => {
    const dimension = plan.dimensions.find((candidate) => {
      const locked = plan.lockOf(candidate) !== undefined
      const size = labelSizeOf(spanLabelOf(lengthOf(candidate)), locked)

      return hits(point, spanMarkOf(candidate).labelAt, size, scale)
    })
    const room = rooms.find(({ at, name }) =>
      hits(point, at, { width: name.length * characterPx, height: roomLabelHeightPx }, scale),
    )

    if (dimension === undefined) {
      setEditing(room === undefined ? null : { kind: 'room', room: room.region, name: room.name })
    } else if (plan.lockOf(dimension) === undefined) {
      setEditing({ kind: 'dimension', dimension })
    } else {
      plan.unlock(dimension)
    }
  }

  const refusalText =
    plan.refusal?.fix === undefined
      ? t('floorPlan.dimensions.refused', { value: spanLabelOf(plan.refusal?.valueCm ?? 0) })
      : t('floorPlan.dimensions.refusedWithFix', {
          value: spanLabelOf(plan.refusal.valueCm),
          locked: spanLabelOf(plan.refusal.fix.lockedCm),
          needed: spanLabelOf(plan.refusal.fix.neededCm),
        })

  const stopEditing = () => setEditing(null)

  const submit = (text: string) => {
    if (editing?.kind === 'dimension') {
      const length = typedLengthOf(text)

      if (length > 0) plan.lock(editing.dimension, length)
    } else if (editing?.kind === 'room' && text.trim() !== '') {
      plan.rename(editing.room, text.trim())
    }

    stopEditing()
  }

  const field =
    editing === null
      ? undefined
      : {
          at:
            editing.kind === 'dimension'
              ? spanMarkOf(editing.dimension).labelAt
              : editing.room.label,
          side: 'over' as const,
          content:
            editing.kind === 'dimension' ? (
              <InlineField
                key={editing.dimension.key}
                label={t('floorPlan.dimensions.value')}
                initial={String(lengthOf(editing.dimension))}
                size={6}
                onSubmit={submit}
                onCancel={stopEditing}
              />
            ) : (
              <InlineField
                key={editing.name}
                label={t('floorPlan.rooms.name')}
                initial={editing.name}
                size={18}
                onSubmit={submit}
                onCancel={stopEditing}
              />
            ),
        }

  return (
    <StepLayout
      controls={
        <>
          <Progress
            label={t('floorPlan.dimensions.verified')}
            value={verified}
            max={plan.unique.length}
          />
          <Text size="sm" tone="dimmed">
            {t('floorPlan.dimensions.hint')}
          </Text>
          <ul className={classes.legend}>
            <li className={classes.entry}>
              <IconLock aria-hidden className={classes.lock} />
              {t('floorPlan.dimensions.locked')}
            </li>
            <li className={classes.entry}>
              <span className={classes.dashed} />
              {t('floorPlan.dimensions.unverified')}
            </li>
          </ul>
          {plan.refusal === null ? null : (
            <div role="alert">
              <Text size="sm">{refusalText}</Text>
            </div>
          )}
          {plan.unique.length === 0 ? (
            <Text size="sm">{t('floorPlan.dimensions.empty')}</Text>
          ) : null}
          {plan.unique.length > 0 && nextUnverified === undefined ? (
            <Text size="sm">{t('floorPlan.dimensions.done')}</Text>
          ) : null}
          {nextUnverified === undefined ? null : (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setEditing({ kind: 'dimension', dimension: nextUnverified })}
            >
              {t('floorPlan.dimensions.next')}
            </Button>
          )}
        </>
      }
      failed={plan.failed}
    >
      <PlanCanvas
        label={t('floorPlan.dimensions.canvas')}
        bounds={{ x: 0, y: 0, width: outline.widthCm, height: outline.heightCm }}
        callout={field}
        onClick={pick}
      >
        {({ scale }) => {
          const offset = outlineOffsetPx / scale
          const middle = { x: outline.widthCm / 2, y: outline.heightCm / 2 }

          return (
            <>
              <rect className={classes.paper} width={outline.widthCm} height={outline.heightCm} />
              <WallShapes
                walls={plan.walls}
                draft={null}
                start={null}
                selectedId={null}
                selectable={false}
                scale={scale}
              />
              <g className={classes.outline}>
                <SpanMark
                  mark={{
                    from: { x: 0, y: -offset },
                    to: { x: outline.widthCm, y: -offset },
                    labelAt: { x: middle.x, y: -offset },
                  }}
                  label={spanLabelOf(outline.widthCm)}
                  state="locked"
                  scale={scale}
                />
                <SpanMark
                  mark={{
                    from: { x: -offset, y: 0 },
                    to: { x: -offset, y: outline.heightCm },
                    labelAt: { x: -offset, y: middle.y },
                  }}
                  label={spanLabelOf(outline.heightCm)}
                  state="locked"
                  scale={scale}
                />
              </g>
              {plan.dimensions.map((dimension) => (
                <SpanMark
                  key={`${dimension.key}-${dimension.room}-${dimension.stripStart}`}
                  mark={spanMarkOf(dimension)}
                  label={spanLabelOf(lengthOf(dimension))}
                  state={stateOf(dimension)}
                  scale={scale}
                />
              ))}
              <RoomLabels rooms={rooms} renamable scale={scale} />
            </>
          )
        }}
      </PlanCanvas>
    </StepLayout>
  )
}
