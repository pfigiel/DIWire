import { useTranslation } from 'react-i18next'
import { Heading, NumberInput, OptionButton } from '@diwire/ui-kit'
import { presetKinds, presetThicknessCm } from '@/floor-plan/utils/walls'
import { centimetersLabelOf } from '@/formatting/labels'
import type { WallKind } from '@/projects/api/project-query'
import classes from './WallTypePicker.module.css'

type Props = {
  kind: WallKind
  customThicknessCm: number
  onSelect: (kind: WallKind) => void
  onCustomThicknessChange: (thicknessCm: number) => void
}

export const WallTypePicker = ({
  kind,
  customThicknessCm,
  onSelect,
  onCustomThicknessChange,
}: Props) => {
  const { t } = useTranslation()

  const changeCustomThickness = (thicknessCm: number | null) => {
    if (thicknessCm !== null && thicknessCm > 0) onCustomThicknessChange(thicknessCm)
  }

  return (
    <div className={classes.root}>
      <Heading order={3}>{t('floorPlan.walls.type')}</Heading>
      {presetKinds.map((preset) => (
        <OptionButton
          key={preset}
          selected={kind === preset}
          icon={<span className={classes[preset]} />}
          detail={centimetersLabelOf(presetThicknessCm[preset])}
          onClick={() => onSelect(preset)}
        >
          {t(`floorPlan.walls.kinds.${preset}`)}
        </OptionButton>
      ))}
      <OptionButton selected={kind === 'custom'} onClick={() => onSelect('custom')}>
        {t('floorPlan.walls.kinds.custom')}
      </OptionButton>
      {kind === 'custom' ? (
        <NumberInput
          label={t('floorPlan.walls.thickness')}
          unit={t('floorPlan.walls.unit')}
          defaultValue={customThicknessCm}
          onChange={changeCustomThickness}
        />
      ) : null}
    </div>
  )
}
