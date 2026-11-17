import { Progress as MantineProgress } from '@mantine/core'
import classes from './Progress.module.css'

export type Props = {
  label: string
  value: number
  max: number
}

/** How much of a countable job is done, as a bar with the count beside its label. */
export const Progress = ({ label, value, max }: Props) => (
  <div className={classes.root}>
    <div className={classes.heading}>
      <span className={classes.label}>{label}</span>
      <span className={classes.count}>
        {value} <span className={classes.max}>/ {max}</span>
      </span>
    </div>
    <MantineProgress
      aria-label={label}
      value={max === 0 ? 0 : (value / max) * 100}
      classNames={{ root: classes.track, section: classes.bar }}
    />
  </div>
)
