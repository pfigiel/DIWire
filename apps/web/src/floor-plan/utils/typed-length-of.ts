/** A length as the user typed it, with a comma or a point and any spaces; NaN when it is no number. */
export const typedLengthOf = (text: string) =>
  Number.parseFloat(text.replace(/\s/g, '').replace(',', '.'))
