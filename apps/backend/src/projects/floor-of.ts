import type { FloorRow } from '../database'

export const floorColumns =
  'id, position, step, plan, rotation_deg, crop, outline, walls, locks, rooms, openings'

type Row = Pick<
  FloorRow,
  | 'id'
  | 'position'
  | 'step'
  | 'plan'
  | 'rotation_deg'
  | 'crop'
  | 'outline'
  | 'walls'
  | 'locks'
  | 'rooms'
  | 'openings'
>

export const floorOf = ({ rotation_deg: rotationDeg, ...row }: Row) => ({ ...row, rotationDeg })
