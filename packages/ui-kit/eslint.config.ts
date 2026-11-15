import { defineConfig } from 'eslint/config'
import { react } from '@diwire/eslint-config'

export default defineConfig({ ignores: ['storybook-static/**'] }, react(import.meta.dirname))
