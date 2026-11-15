import { defineConfig } from 'eslint/config'
import { react } from '@diwire/eslint-config'

export default defineConfig(
  { ignores: ['dist/**', 'src/routing/routeTree.gen.ts'] },
  react(import.meta.dirname),
  {
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@mantine/*'],
              message:
                'Import from @diwire/ui-kit instead. If something is missing, add a narrowed wrapper there.',
            },
          ],
        },
      ],
    },
  },
)
