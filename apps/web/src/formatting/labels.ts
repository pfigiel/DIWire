const locale = 'pl-PL'

const centimeters = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 })

const degrees = new Intl.NumberFormat(locale, {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

const spans = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 })

/** A length in centimetres as a bare number, for a plan where every figure is in centimetres. */
export const spanLabelOf = (length: number) => spans.format(length)

export const centimetersLabelOf = (length: number) => `${centimeters.format(length)} cm`

export const degreesLabelOf = (angle: number) => `${degrees.format(angle)}°`
