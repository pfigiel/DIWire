import { createRequire } from 'node:module'
import { createPostcssConfig } from '@diwire/postcss-config'

const require = createRequire(import.meta.url)

export default createPostcssConfig({
  mixinsFiles: [require.resolve('@diwire/ui-kit/mixins.css')],
})
