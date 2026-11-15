import { IconCheck } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import classes from './PagePicker.module.css'

type Props = {
  /** One image per page, in page order. */
  thumbnails: string[]
  /** The picked page's number, counted from 1. */
  page: number | null
  onSelect: (page: number) => void
}

export const PagePicker = ({ thumbnails, page, onSelect }: Props) => {
  const { t } = useTranslation()

  return (
    <ul aria-label={t('floorPlan.file.pages')} className={classes.root}>
      {thumbnails.map((thumbnail, index) => {
        const number = index + 1
        const picked = number === page

        return (
          <li key={number}>
            <button
              type="button"
              aria-pressed={picked}
              className={classes.page}
              onClick={() => onSelect(number)}
            >
              <span className={classes.sheet}>
                <img src={thumbnail} alt="" className={classes.thumbnail} />
                {picked ? (
                  <span className={classes.mark}>
                    <IconCheck aria-hidden className={classes.check} />
                  </span>
                ) : null}
              </span>
              {t('floorPlan.file.page', { number })}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
