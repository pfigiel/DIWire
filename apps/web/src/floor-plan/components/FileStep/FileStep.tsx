import { IconFile } from '@tabler/icons-react'
import { useMutation } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Dropzone, Text } from '@diwire/ui-kit'
import { removePlanImage, uploadPlanImage } from '@/floor-plan/api/plan-storage'
import { useFloorEditor } from '@/floor-plan/contexts/floor-editor'
import { usePlanImageUrl } from '@/floor-plan/hooks/use-plan-image-url'
import { useUpdateFloor } from '@/floor-plan/hooks/use-update-floor'
import { sheetBoundsOf } from '@/floor-plan/utils/geometry'
import {
  pageRasterOf,
  planSelectionOf,
  type PlanSelection,
} from '@/floor-plan/utils/plan-selection'
import { PagePicker } from '../PagePicker'
import { PlanCanvas } from '../PlanCanvas'
import { PlanImage } from '../PlanImage'
import { StepLayout } from '../StepLayout'
import classes from './FileStep.module.css'

type Choice = {
  selection: PlanSelection
  page: number | null
}

const accepted = ['application/pdf', 'image/jpeg', 'image/png']

export const FileStep = () => {
  const { t } = useTranslation()
  const { floor, selectStep } = useFloorEditor()
  const update = useUpdateFloor()
  const storedPlan = floor.plan
  const storedUrl = usePlanImageUrl(storedPlan?.imagePath)
  const [replacing, setReplacing] = useState(storedPlan === null)
  const [page, setPage] = useState<number | null>(null)
  const reading = useMutation({ mutationFn: planSelectionOf })
  const selection = reading.data

  const saving = useMutation({
    mutationFn: async (choice: Choice) => {
      const raster =
        choice.selection.kind === 'image'
          ? choice.selection.raster
          : await pageRasterOf(choice.selection.pdf, choice.page ?? 1)
      const imagePath = await uploadPlanImage(raster.blob)

      await update.mutateAsync({
        plan: {
          name: choice.selection.name,
          page: choice.selection.kind === 'pages' ? choice.page : null,
          imagePath,
          width: raster.width,
          height: raster.height,
        },
        rotationDeg: 0,
        crop: null,
        step: 'crop',
      })

      if (storedPlan !== null) await removePlanImage(storedPlan.imagePath).catch(() => undefined)
    },
    onSuccess: () => selectStep('crop'),
  })

  const previewUrl = selection?.kind === 'image' ? selection.previewUrl : undefined

  useEffect(
    () => () => {
      if (previewUrl !== undefined) URL.revokeObjectURL(previewUrl)
    },
    [previewUrl],
  )

  const read = (file: File) => {
    setPage(null)
    reading.mutate(file)
  }

  const replace = () => {
    reading.reset()
    setReplacing(true)
  }

  const proceed = () => {
    if (selection === undefined) selectStep('crop')
    else saving.mutate({ selection, page })
  }

  const kept = selection === undefined && !replacing ? storedPlan : null
  const fileName = selection?.name ?? kept?.name
  const ready =
    selection === undefined ? kept !== null : selection.kind === 'image' || page !== null

  const preview =
    selection?.kind === 'image'
      ? { href: selection.previewUrl, ...selection.raster }
      : kept !== null && storedUrl !== undefined
        ? { href: storedUrl, width: kept.width, height: kept.height }
        : null

  const workspace = () => {
    if (selection?.kind === 'pages') {
      return <PagePicker thumbnails={selection.thumbnails} page={page} onSelect={setPage} />
    }

    if (preview !== null) {
      return (
        <PlanCanvas label={t('floorPlan.file.preview')} bounds={sheetBoundsOf(preview, 0)}>
          {() => (
            <PlanImage
              href={preview.href}
              width={preview.width}
              height={preview.height}
              rotationDeg={0}
            />
          )}
        </PlanCanvas>
      )
    }

    if (kept !== null) return null

    return (
      <div className={classes.empty}>
        {reading.isPending ? (
          <Text tone="dimmed">{t('floorPlan.file.reading')}</Text>
        ) : (
          <Dropzone
            title={t('floorPlan.file.drop')}
            hint={t('floorPlan.file.formats')}
            action={t('floorPlan.file.choose')}
            accept={accepted}
            onDrop={read}
          />
        )}
      </div>
    )
  }

  return (
    <StepLayout
      controls={
        <>
          {fileName === undefined ? null : (
            <div className={classes.file}>
              <IconFile aria-hidden className={classes.icon} />
              <span className={classes.name}>{fileName}</span>
              <Button variant="secondary" size="sm" onClick={replace}>
                {t('floorPlan.file.change')}
              </Button>
            </div>
          )}
          <Text size="sm" tone="dimmed">
            {t(selection?.kind === 'pages' ? 'floorPlan.file.pickPage' : 'floorPlan.file.hint')}
          </Text>
          {reading.isError ? (
            <div role="alert">
              <Text size="sm">{t('floorPlan.file.unreadable')}</Text>
            </div>
          ) : null}
        </>
      }
      action={
        <Button disabled={!ready} loading={saving.isPending} onClick={proceed}>
          {t('floorPlan.file.next')}
        </Button>
      }
      failed={saving.isError}
    >
      {workspace()}
    </StepLayout>
  )
}
