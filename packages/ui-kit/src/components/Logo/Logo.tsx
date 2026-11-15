import clsx from 'clsx'
import classes from './Logo.module.css'

type Size = 'md' | 'lg'

export type Props = {
  size?: Size
}

export const Logo = ({ size = 'md' }: Props) => (
  <span className={clsx(classes.root, classes[size])}>
    <svg viewBox="0 0 64 64" aria-hidden="true" className={classes.mark}>
      <rect width="64" height="64" rx="15" fill="#2456D3" />
      <path
        d="M14 50V29L32 15l18 14v21H32V38"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="32" cy="36" r="5" fill="#FDBA74" />
    </svg>
    DIWire
  </span>
)
