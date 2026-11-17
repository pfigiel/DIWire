import type { ProjectShareRow } from '../database'

type Row = Pick<ProjectShareRow, 'status' | 'invited_by'>

/** Row level security shows a caller only their own share, so no row means the project is theirs. */
export const shareOf = ([share]: Row[]) =>
  share === undefined ? null : { status: share.status, invitedBy: share.invited_by }
