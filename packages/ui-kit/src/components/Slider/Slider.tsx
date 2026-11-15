import { Slider as MantineSlider } from '@mantine/core'
import classes from './Slider.module.css'

export type Props = {
  /** Names the thumb for assistive technology; the slider shows no label of its own. */
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
}

export const Slider = ({ label, value, min, max, step, onChange }: Props) => (
  <MantineSlider
    label={null}
    thumbLabel={label}
    value={value}
    min={min}
    max={max}
    step={step}
    className={classes.root}
    onChange={onChange}
  />
)
