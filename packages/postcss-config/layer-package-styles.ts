import type { Plugin } from 'postcss'

/* Every layer here is one `@diwire/ui-kit`'s globals.css declares an order for. */
const layers = ['ui-kit']

const packageStylesheet = new RegExp(
  String.raw`[\\/]packages[\\/](${layers.join('|')})[\\/].*\.module\.css$`,
)
const storyStylesheet = /\.stories\.module\.css$/

export const layerPackageStyles = (): Plugin => ({
  postcssPlugin: 'diwire-layer-package-styles',
  Once: (root, { AtRule }) => {
    const file = root.source?.input.file

    if (!file || storyStylesheet.test(file)) {
      return
    }

    const [, layerName] = packageStylesheet.exec(file) ?? []

    if (!layerName) {
      return
    }

    const layer = new AtRule({ name: 'layer', params: layerName })
    const styles = root.nodes

    root.removeAll()
    layer.append(styles)
    root.append(layer)
  },
})
