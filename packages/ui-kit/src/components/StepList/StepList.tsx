import { IconCheck } from '@tabler/icons-react'
import clsx from 'clsx'
import type { ReactNode } from 'react'
import classes from './StepList.module.css'

export type Step = {
  key: string
  label: string
  summary?: string
  state: 'done' | 'available' | 'current' | 'upcoming'
}

export type Props = {
  /** Names the list for assistive technology. */
  label: string
  steps: Step[]
  /** The controls of the current step. */
  children: ReactNode
  onSelect: (key: string) => void
}

type MarkerProps = {
  step: Step
  number: number
}

const Marker = ({ step, number }: MarkerProps) => (
  <span className={clsx(classes.marker, classes[step.state])}>
    {step.state === 'done' ? <IconCheck aria-hidden className={classes.check} /> : number}
  </span>
)

export const StepList = ({ label, steps, children, onSelect }: Props) => (
  <ol aria-label={label} className={classes.root}>
    {steps.map((step, index) => {
      const marker = <Marker step={step} number={index + 1} />

      if (step.state === 'current') {
        return (
          <li key={step.key} data-surface aria-current="step" className={classes.card}>
            <div className={classes.heading}>
              {marker}
              <span className={classes.title}>{step.label}</span>
            </div>
            {children}
          </li>
        )
      }

      if (step.state === 'upcoming') {
        return (
          <li key={step.key} className={clsx(classes.row, classes.dimmed)}>
            {marker}
            <span className={classes.label}>{step.label}</span>
          </li>
        )
      }

      return (
        <li key={step.key}>
          <button
            type="button"
            className={clsx(classes.row, classes.link)}
            onClick={() => onSelect(step.key)}
          >
            {marker}
            <span className={classes.label}>{step.label}</span>
            {step.summary === undefined ? null : (
              <span className={classes.summary}>{step.summary}</span>
            )}
          </button>
        </li>
      )
    })}
  </ol>
)
