import type { FloorRow } from '../database'

export const floorColumns = 'id, position, step, plan, rotation_deg, crop, outline, walls'

type Row = Pick<
  FloorRow,
  'id' | 'position' | 'step' | 'plan' | 'rotation_deg' | 'crop' | 'outline' | 'walls'
>

export const floorOf = ({ rotation_deg: rotationDeg, ...row }: Row) => ({ ...row, rotationDeg })
