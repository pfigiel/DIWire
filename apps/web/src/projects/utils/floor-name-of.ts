import type { TFunction } from 'i18next'

export const floorNameOf = (t: TFunction, position: number) =>
  position === 0 ? t('projects.floor.ground') : t('projects.floor.upper', { number: position })
