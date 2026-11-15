const locale = 'pl-PL'

const centimeters = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 })

const degrees = new Intl.NumberFormat(locale, {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

export const centimetersLabelOf = (length: number) => `${centimeters.format(length)} cm`

export const degreesLabelOf = (angle: number) => `${degrees.format(angle)}°`
