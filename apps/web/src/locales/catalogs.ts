import homePl from '@/home/locales/pl.json'

export const defaultLocale = 'pl'

const pl = {
  home: homePl,
}

export const catalogs = { pl }

export type Messages = (typeof catalogs)[typeof defaultLocale]
