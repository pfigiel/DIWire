import accountPl from '@/account/locales/pl.json'
import authPl from '@/auth/locales/pl.json'
import homePl from '@/home/locales/pl.json'

export const defaultLocale = 'pl'

const pl = {
  account: accountPl,
  auth: authPl,
  home: homePl,
}

export const catalogs = { pl }

export type Messages = (typeof catalogs)[typeof defaultLocale]
