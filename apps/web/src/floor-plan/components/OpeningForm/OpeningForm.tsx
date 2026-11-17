import { useTranslation } from 'react-i18next'
import { Button, Heading, NumberInput } from '@diwire/ui-kit'
import type { Opening } from '@/projects/api/project-query'
import classes from './OpeningForm.module.css'

type Props = {
  opening: Opening
  onChange: (changes: Partial<Opening>) => void
  onDelete: () => void
}

export const OpeningForm = ({ opening, onChange, onDelete }: Props) => {
  const { t } = useTranslation()
  const unit = t('floorPlan.openings.unit')

  const changeWidth = (widthCm: number | null) => {
    if (widthCm !== null && widthCm > 0) onChange({ widthCm })
  }

  const changeLeafWidth = (leafWidthCm: number | null) => {
    if (leafWidthCm !== null && leafWidthCm > 0) onChange({ leafWidthCm })
  }

  const changeSill = (sillCm: number | null) => {
    if (sillCm !== null) onChange({ sillCm })
  }

  return (
    <div className={classes.root}>
      <Heading order={3}>{t(`floorPlan.openings.kinds.${opening.kind}`)}</Heading>
      <NumberInput
        label={t(`floorPlan.openings.widths.${opening.kind}`)}
        unit={unit}
        defaultValue={opening.widthCm}
        onChange={changeWidth}
      />
      {opening.kind === 'window' ? (
        <NumberInput
          label={t('floorPlan.openings.sill')}
          unit={unit}
          defaultValue={opening.sillCm}
          onChange={changeSill}
        />
      ) : null}
      {opening.kind === 'door' ? (
        <>
          <NumberInput
            label={t('floorPlan.openings.leafWidth')}
            unit={unit}
            defaultValue={opening.leafWidthCm}
            onChange={changeLeafWidth}
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onChange({ hinge: opening.hinge === 'from' ? 'to' : 'from' })}
          >
            {t('floorPlan.openings.flipHinge')}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onChange({ opensTo: opening.opensTo === 'min' ? 'max' : 'min' })}
          >
            {t('floorPlan.openings.flipSwing')}
          </Button>
        </>
      ) : null}
      <Button variant="secondary" size="sm" onClick={onDelete}>
        {t('floorPlan.openings.delete')}
      </Button>
    </div>
  )
}
