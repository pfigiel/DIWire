import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import type { StorybookConfig } from '@storybook/react-vite'

const nodeRequire = createRequire(import.meta.url)

const mantineStyles = readFileSync(nodeRequire.resolve('@mantine/core/styles.layer.css'), 'utf8')

const config: StorybookConfig = {
  framework: '@storybook/react-vite',
  stories: [{ directory: '../src/components', titlePrefix: 'Components' }],
  addons: ['@storybook/addon-a11y'],
  core: { disableTelemetry: true },
  previewHead: (head) => `${head}<style>${mantineStyles}</style>`,
}

export default config
