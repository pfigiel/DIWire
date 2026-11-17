import { IconPencil, IconPointer, IconTrash } from '@tabler/icons-react'
import { useEffect, useEffectEvent, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, IconButton, SegmentedControl, Switch, Text } from '@diwire/ui-kit'
import { useFloorEditor } from '@/floor-plan/contexts/floor-editor'
import { useUpdateFloor } from '@/floor-plan/hooks/use-update-floor'
import type { Point } from '@/floor-plan/utils/geometry'
import { namedRoomsOf } from '@/floor-plan/utils/named-rooms-of'
import { carriedOpeningsOf } from '@/floor-plan/utils/openings'
import { regionsOf } from '@/floor-plan/utils/regions-of'
import { furthestStepOf } from '@/floor-plan/utils/steps'
import { typesInto } from '@/floor-plan/utils/types-into'
import {
  draftWallOf,
  flushStartOf,
  joinedWallsOf,
  presetThicknessCm,
  remainingWallsOf,
  retypedWallsOf,
  startRectOf,
  strokeLengthOf,
  wallAtOf,
  wallRectOf,
} from '@/floor-plan/utils/walls'
import type { Outline, Plan, Rect, Wall, WallKind } from '@/projects/api/project-query'
import { PlanCanvas } from '../PlanCanvas'
import { PlanUnderlay } from '../PlanUnderlay'
import { RoomLabels } from '../RoomLabels'
import { StepLayout } from '../StepLayout'
import { WallShapes } from '../WallShapes'
import { WallTypePicker } from '../WallTypePicker'

type Props = {
  plan: Plan
  crop: Rect
  outline: Outline
}

type Tool = 'draw' | 'select'

const reachPx = 6
const flushPx = 4
const minLengthCm = 10
const defaultCustomThicknessCm = 20

export const WallsStep = ({ plan, crop, outline }: Props) => {
  const { t } = useTranslation()
  const { floor, selectStep } = useFloorEditor()
  const update = useUpdateFloor()
  const [walls, setWalls] = useState(floor.walls)
  const [openings, setOpenings] = useState(floor.openings)
  const [tool, setTool] = useState<Tool>('draw')
  const [kind, setKind] = useState<WallKind>('exterior')
  const [customThicknessCm, setCustomThicknessCm] = useState(defaultCustomThicknessCm)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  /** Where the wall being drawn starts; null until the first of its two clicks. */
  const [start, setStart] = useState<Point | null>(null)
  const [pointer, setPointer] = useState<{ point: Point; scale: number } | null>(null)
  const [underlayShown, setUnderlayShown] = useState(true)

  const selected = walls.find(({ id }) => id === selectedId)
  const rooms = useMemo(
    () => namedRoomsOf(t, regionsOf(walls, outline, { dividers: true }), floor.rooms),
    [t, walls, outline, floor.rooms],
  )

  const thicknessOf = (ofKind: WallKind, custom = customThicknessCm) => {
    if (ofKind === 'divider') return 0

    return ofKind === 'custom' ? custom : presetThicknessCm[ofKind]
  }

  const commit = (next: Wall[]) => {
    const carried = carriedOpeningsOf(openings, walls, next)

    setWalls(next)
    setOpenings(carried)
    // A verified dimension names wall faces, and says nothing reliable once those walls change.
    update.mutate({ walls: next, locks: [], openings: carried })
  }

  const retype = (id: string, toKind: WallKind, thicknessCm: number) =>
    commit(retypedWallsOf(walls, id, toKind, thicknessCm, outline))

  const selectTool = (next: Tool) => {
    setTool(next)
    setSelectedId(null)
    setStart(null)
  }

  // With a wall selected the type list speaks for that wall; otherwise for the next one drawn.
  const selectKind = (next: WallKind) => {
    if (selected === undefined) setKind(next)
    else retype(selected.id, next, next === 'custom' ? selected.thicknessCm : thicknessOf(next))
  }

  const changeCustomThickness = (thicknessCm: number) => {
    if (selected === undefined) setCustomThicknessCm(thicknessCm)
    else retype(selected.id, 'custom', thicknessCm)
  }

  const selectAt = (point: Point, scale: number) =>
    setSelectedId(wallAtOf(walls, point, reachPx / scale)?.id ?? null)

  const removeSelected = () => {
    if (selectedId === null) return

    commit(remainingWallsOf(walls, selectedId))
    setSelectedId(null)
  }

  const actOnKey = useEffectEvent((event: KeyboardEvent) => {
    const deletes = event.key === 'Delete' || event.key === 'Backspace'

    if (event.key === 'Escape') setStart(null)
    else if (deletes && !typesInto(event.target)) removeSelected()
  })

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => actOnKey(event)

    window.addEventListener('keydown', onKeyDown)

    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const thicknessCm = thicknessOf(kind)

  const wallTo = (id: string, to: Point, scale: number) =>
    start === null
      ? null
      : draftWallOf({
          id,
          stroke: { from: start, to },
          kind,
          thicknessCm,
          walls,
          outline,
          reach: reachPx / scale,
        })

  // The first click starts a wall and the second ends it; one too close to the first is ignored.
  const drawAt = (point: Point, scale: number) => {
    const wall = wallTo(crypto.randomUUID(), point, scale)

    if (wall === null) {
      setStart(flushStartOf(point, thicknessCm, walls, flushPx / scale))
    } else if (start !== null && strokeLengthOf({ from: start, to: point }) >= minLengthCm) {
      commit(joinedWallsOf(walls, wall))
      setStart(null)
    }
  }

  const hover = (point: Point | null, scale: number) =>
    setPointer(point === null ? null : { point, scale })

  const drawing = tool === 'draw' && pointer !== null
  const draft = drawing ? wallTo('draft', pointer.point, pointer.scale) : null
  const startRect =
    drawing && start === null
      ? startRectOf(
          flushStartOf(pointer.point, thicknessCm, walls, flushPx / pointer.scale),
          thicknessCm,
          outline,
        )
      : null

  const selectedRect = selected === undefined ? undefined : wallRectOf(selected, walls)

  // Beside the wall rather than on it: past its right face if it stands, under it if it lies.
  const deleteCallout =
    selected === undefined || selectedRect === undefined
      ? undefined
      : {
          at:
            selected.orientation === 'vertical'
              ? {
                  x: selectedRect.x + selectedRect.width,
                  y: selectedRect.y + selectedRect.height / 2,
                }
              : {
                  x: selectedRect.x + selectedRect.width / 2,
                  y: selectedRect.y + selectedRect.height,
                },
          side: selected.orientation === 'vertical' ? ('right' as const) : ('below' as const),
          content: (
            <IconButton label={t('floorPlan.walls.delete')} onClick={removeSelected}>
              <IconTrash aria-hidden />
            </IconButton>
          ),
        }

  return (
    <StepLayout
      controls={
        <>
          <Text size="sm" tone="dimmed">
            {t(tool === 'draw' ? 'floorPlan.walls.drawHint' : 'floorPlan.walls.selectHint')}
          </Text>
          {tool === 'select' && selected === undefined ? null : (
            <WallTypePicker
              key={selectedId}
              kind={selected?.kind ?? kind}
              customThicknessCm={selected?.thicknessCm ?? customThicknessCm}
              onSelect={selectKind}
              onCustomThicknessChange={changeCustomThickness}
            />
          )}
          <Switch
            label={t('floorPlan.underlay')}
            checked={underlayShown}
            onChange={setUnderlayShown}
          />
        </>
      }
      action={
        <Button
          disabled={rooms.length === 0}
          loading={update.isPending && update.variables.step !== undefined}
          onClick={() =>
            update.mutate(
              { step: furthestStepOf(floor.step, 'dimensions') },
              { onSuccess: () => selectStep('dimensions') },
            )
          }
        >
          {t('floorPlan.walls.next')}
        </Button>
      }
      failed={update.isError}
    >
      <PlanCanvas
        label={t('floorPlan.walls.canvas')}
        bounds={{ x: 0, y: 0, width: outline.widthCm, height: outline.heightCm }}
        toolbar={
          <SegmentedControl
            label={t('floorPlan.walls.tools.label')}
            value={tool}
            options={[
              {
                value: 'draw',
                label: t('floorPlan.walls.tools.draw'),
                icon: <IconPencil aria-hidden />,
              },
              {
                value: 'select',
                label: t('floorPlan.walls.tools.select'),
                icon: <IconPointer aria-hidden />,
              },
            ]}
            onChange={selectTool}
          />
        }
        callout={deleteCallout}
        onClick={tool === 'draw' ? drawAt : selectAt}
        onHover={tool === 'draw' ? hover : undefined}
      >
        {({ scale }) => (
          <>
            <PlanUnderlay plan={plan} crop={crop} outline={outline} shown={underlayShown} />
            <WallShapes
              walls={walls}
              draft={draft}
              start={startRect}
              selectedId={selectedId}
              selectable={tool === 'select'}
              scale={scale}
            />
            <RoomLabels rooms={rooms} renamable={false} scale={scale} />
          </>
        )}
      </PlanCanvas>
    </StepLayout>
  )
}
