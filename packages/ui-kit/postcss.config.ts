import { fileURLToPath } from 'node:url'
import { createPostcssConfig } from '@diwire/postcss-config'

export default createPostcssConfig({
  mixinsFiles: [fileURLToPath(new URL('src/mixins.css', import.meta.url))],
})
