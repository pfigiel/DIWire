import type { ESLint } from 'eslint'
import noRepeatedPathSegment from './no-repeated-path-segment'
import propsTypeName from './props-type-name'

export const diwire: ESLint.Plugin = {
  meta: { name: 'diwire' },
  rules: {
    'no-repeated-path-segment': noRepeatedPathSegment,
    'props-type-name': propsTypeName,
  },
}
