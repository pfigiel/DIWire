import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import type { StorybookConfig } from '@storybook/react-vite'

const nodeRequire = createRequire(import.meta.url)

const mantineStyles = ['@mantine/core/styles.layer.css', '@mantine/dropzone/styles.layer.css']
  .map((stylesheet) => readFileSync(nodeRequire.resolve(stylesheet), 'utf8'))
  .join('')

const config: StorybookConfig = {
  framework: '@storybook/react-vite',
  stories: [{ directory: '../src/components', titlePrefix: 'Components' }],
  addons: ['@storybook/addon-a11y'],
  core: { disableTelemetry: true },
  previewHead: (head) => `${head}<style>${mantineStyles}</style>`,
}

export default config
