import accountPl from '@/account/locales/pl.json'
import authPl from '@/auth/locales/pl.json'
import floorPlanPl from '@/floor-plan/locales/pl.json'
import projectsPl from '@/projects/locales/pl.json'

export const defaultLocale = 'pl'

const pl = {
  account: accountPl,
  auth: authPl,
  floorPlan: floorPlanPl,
  projects: projectsPl,
}

export const catalogs = { pl }

export type Messages = (typeof catalogs)[typeof defaultLocale]
