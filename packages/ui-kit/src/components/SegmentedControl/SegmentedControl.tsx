import { SegmentedControl as MantineSegmentedControl } from '@mantine/core'
import type { ReactNode } from 'react'
import classes from './SegmentedControl.module.css'

type Option<Value extends string> = {
  value: Value
  label: string
  icon?: ReactNode
}

export type Props<Value extends string> = {
  /** Names the group for assistive technology; the options carry the visible text. */
  label: string
  value: Value
  options: Option<Value>[]
  onChange: (value: Value) => void
}

/** A choice between a few modes that are all in view, one of them always on. */
export const SegmentedControl = <Value extends string>({
  label,
  value,
  options,
  onChange,
}: Props<Value>) => {
  const select = (next: string) => {
    const option = options.find((candidate) => candidate.value === next)

    if (option !== undefined) onChange(option.value)
  }

  return (
    <MantineSegmentedControl
      aria-label={label}
      value={value}
      data={options.map((option) => ({
        value: option.value,
        label: (
          <span className={classes.option}>
            {option.icon}
            {option.label}
          </span>
        ),
      }))}
      classNames={{ root: classes.root, indicator: classes.indicator, label: classes.label }}
      onChange={select}
    />
  )
}
