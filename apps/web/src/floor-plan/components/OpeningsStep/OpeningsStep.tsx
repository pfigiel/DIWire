import { IconCarGarage, IconDoor, IconPointer, IconWindow } from '@tabler/icons-react'
import { useEffect, useEffectEvent, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SegmentedControl, Switch, Text } from '@diwire/ui-kit'
import { useFloorEditor } from '@/floor-plan/contexts/floor-editor'
import { useUpdateFloor } from '@/floor-plan/hooks/use-update-floor'
import type { Point } from '@/floor-plan/utils/geometry'
import { namedRoomsOf } from '@/floor-plan/utils/named-rooms-of'
import { openingMarksOf } from '@/floor-plan/utils/opening-marks-of'
import {
  distancedOpeningOf,
  fits,
  openingAtOf,
  openingPlaceOf,
  placedOpeningOf,
  standingOpeningsOf,
} from '@/floor-plan/utils/openings'
import { regionsOf } from '@/floor-plan/utils/regions-of'
import { hits, labelSizeOf } from '@/floor-plan/utils/span-mark-of'
import { typedLengthOf } from '@/floor-plan/utils/typed-length-of'
import { typesInto } from '@/floor-plan/utils/types-into'
import { isDivider, wallAtOf } from '@/floor-plan/utils/walls'
import type { Opening, Outline, Plan, Rect } from '@/projects/api/project-query'
import { InlineField } from '../InlineField'
import { OpeningForm } from '../OpeningForm'
import { OpeningShapes } from '../OpeningShapes'
import { PlanCanvas } from '../PlanCanvas'
import { PlanUnderlay } from '../PlanUnderlay'
import { RoomLabels } from '../RoomLabels'
import { SpanMark } from '../SpanMark'
import { StepLayout } from '../StepLayout'
import { WallShapes } from '../WallShapes'

type Props = {
  plan: Plan
  crop: Rect
  outline: Outline
}

type Tool = 'select' | Opening['kind']

/** The distance to a corner being typed on the plan: which side's, and the label it stands in for. */
type Editing = {
  side: Opening['anchor']
  at: Point
  label: string
}

const reachPx = 6

export const OpeningsStep = ({ plan, crop, outline }: Props) => {
  const { t } = useTranslation()
  const { floor } = useFloorEditor()
  const update = useUpdateFloor()
  const { walls } = floor
  const [openings, setOpenings] = useState(() => standingOpeningsOf(floor.openings, walls))
  const [tool, setTool] = useState<Tool>('door')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editing, setEditing] = useState<Editing | null>(null)
  const [refused, setRefused] = useState(false)
  const [underlayShown, setUnderlayShown] = useState(true)
  const [pointer, setPointer] = useState<{ point: Point; scale: number } | null>(null)

  const solidWalls = useMemo(() => walls.filter((wall) => !isDivider(wall)), [walls])
  const rooms = useMemo(
    () => namedRoomsOf(t, regionsOf(walls, outline, { dividers: true }), floor.rooms),
    [t, walls, outline, floor.rooms],
  )
  const selected = openings.find(({ id }) => id === selectedId)
  const selectedPlace = selected === undefined ? undefined : openingPlaceOf(selected, walls)

  const marksAt = (scale: number) =>
    selected === undefined || selectedPlace === undefined
      ? []
      : openingMarksOf(selected, selectedPlace, outline, scale)

  const commit = (next: Opening[]) => {
    setOpenings(next)
    setRefused(false)
    update.mutate({ openings: next })
  }

  const select = (id: string | null) => {
    setSelectedId(id)
    setEditing(null)
    setRefused(false)
  }

  const selectTool = (next: Tool) => {
    setTool(next)
    select(null)
  }

  // A change that would push the opening past a corner or into another is refused, not trimmed.
  const change = (opening: Opening | undefined) => {
    if (opening === undefined || !fits(opening, openings, walls)) {
      setRefused(true)

      return
    }

    commit(openings.map((other) => (other.id === opening.id ? opening : other)))
  }

  const changeSelected = (changes: Partial<Opening>) => {
    if (selected !== undefined) change({ ...selected, ...changes })
  }

  const removeSelected = () => {
    if (selectedId === null) return

    commit(openings.filter(({ id }) => id !== selectedId))
    select(null)
  }

  const placedAt = (id: string, kind: Opening['kind'], point: Point, scale: number) => {
    const host = wallAtOf(solidWalls, point, reachPx / scale)

    return host === undefined
      ? undefined
      : placedOpeningOf({ id, kind, host, point, walls, openings })
  }

  // A distance label of the selected opening starts typing; an opening is selected; a bare wall takes a new one.
  const pick = (point: Point, scale: number) => {
    const mark = marksAt(scale).find(({ mark: { labelAt }, label, locked }) =>
      hits(point, labelAt, labelSizeOf(label, locked), scale),
    )
    const opening = openingAtOf(openings, walls, point, reachPx / scale)

    if (mark !== undefined) {
      setEditing({ side: mark.side, at: mark.mark.labelAt, label: mark.label })
    } else if (opening !== undefined || tool === 'select') {
      select(opening?.id ?? null)
    } else {
      const placed = placedAt(crypto.randomUUID(), tool, point, scale)

      if (placed !== undefined) commit([...openings, placed])

      select(placed?.id ?? null)
    }
  }

  const hover = (point: Point | null, scale: number) =>
    setPointer(point === null ? null : { point, scale })

  const actOnKey = useEffectEvent((event: KeyboardEvent) => {
    const deletes = event.key === 'Delete' || event.key === 'Backspace'

    if (event.key === 'Escape') select(null)
    else if (deletes && !typesInto(event.target)) removeSelected()
  })

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => actOnKey(event)

    window.addEventListener('keydown', onKeyDown)

    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const stopEditing = () => setEditing(null)

  const submitDistance = (text: string) => {
    const distanceCm = typedLengthOf(text)

    if (selected !== undefined && editing !== null && distanceCm >= 0) {
      change(distancedOpeningOf(selected, editing.side, distanceCm, walls))
    }

    stopEditing()
  }

  const ghost =
    tool === 'select' ||
    pointer === null ||
    openingAtOf(openings, walls, pointer.point, reachPx / pointer.scale) !== undefined
      ? undefined
      : placedAt('ghost', tool, pointer.point, pointer.scale)

  return (
    <StepLayout
      controls={
        <>
          <Text size="sm" tone="dimmed">
            {t(`floorPlan.openings.hints.${tool}`)}
          </Text>
          {selected === undefined ? null : (
            <>
              <OpeningForm
                key={selected.id}
                opening={selected}
                onChange={changeSelected}
                onDelete={removeSelected}
              />
              <Text size="sm" tone="dimmed">
                {t('floorPlan.openings.position')}
              </Text>
            </>
          )}
          <Switch
            label={t('floorPlan.underlay')}
            checked={underlayShown}
            onChange={setUnderlayShown}
          />
          {refused ? (
            <div role="alert">
              <Text size="sm">{t('floorPlan.openings.refused')}</Text>
            </div>
          ) : null}
        </>
      }
      failed={update.isError}
    >
      <PlanCanvas
        label={t('floorPlan.openings.canvas')}
        bounds={{ x: 0, y: 0, width: outline.widthCm, height: outline.heightCm }}
        toolbar={
          <SegmentedControl
            label={t('floorPlan.openings.tools.label')}
            value={tool}
            options={[
              {
                value: 'select',
                label: t('floorPlan.openings.tools.select'),
                icon: <IconPointer aria-hidden />,
              },
              {
                value: 'door',
                label: t('floorPlan.openings.tools.door'),
                icon: <IconDoor aria-hidden />,
              },
              {
                value: 'window',
                label: t('floorPlan.openings.tools.window'),
                icon: <IconWindow aria-hidden />,
              },
              {
                value: 'garage',
                label: t('floorPlan.openings.tools.garage'),
                icon: <IconCarGarage aria-hidden />,
              },
            ]}
            onChange={selectTool}
          />
        }
        callout={
          editing === null
            ? undefined
            : {
                at: editing.at,
                side: 'over',
                content: (
                  <InlineField
                    key={`${selectedId}-${editing.side}`}
                    label={t('floorPlan.openings.distance')}
                    initial={editing.label}
                    size={6}
                    onSubmit={submitDistance}
                    onCancel={stopEditing}
                  />
                ),
              }
        }
        onClick={pick}
        onHover={tool === 'select' ? undefined : hover}
      >
        {({ scale }) => (
          <>
            <PlanUnderlay plan={plan} crop={crop} outline={outline} shown={underlayShown} />
            <WallShapes
              walls={walls}
              draft={null}
              start={null}
              selectedId={null}
              selectable={false}
              scale={scale}
            />
            <RoomLabels rooms={rooms} renamable={false} scale={scale} />
            <OpeningShapes
              openings={openings}
              walls={walls}
              ghost={ghost}
              selectedId={selectedId}
            />
            {marksAt(scale).map(({ side, mark, label, locked }) => (
              <SpanMark
                key={side}
                mark={mark}
                label={label}
                state={locked ? 'locked' : 'unverified'}
                scale={scale}
              />
            ))}
          </>
        )}
      </PlanCanvas>
    </StepLayout>
  )
}
