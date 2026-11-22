import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const assetRootDefault = fileURLToPath(new URL('../public/assets', import.meta.url))
const PREFIX = '\0knapsack-test-public-asset:'
const SUFFIX = '.mjs'
/** Test imports retain their public URL without converting /assets into a host file URL. */
function publicAssetFixture({ assetRoot = assetRootDefault, paths = path, exists = fs.existsSync } = {}) {
  return {
    name: 'knapsack-test-public-assets', enforce: 'pre',
    resolveId(source) {
      if (!source.startsWith('/assets/') || !/\.(svg|png|jpe?g|gif|webp|avif|ico)(?:\?.*)?$/i.test(source)) return null
      const file = paths.resolve(assetRoot, source.slice('/assets/'.length).split('?')[0])
      const relative = paths.relative(assetRoot, file)
      if (relative.startsWith('..') || paths.isAbsolute(relative) || !exists(file)) throw new Error(`Missing or invalid fixture asset: ${source}`)
      return { id: PREFIX + encodeURIComponent(source) + SUFFIX, moduleSideEffects: false }
    },
    load(id) {
      if (!id.startsWith(PREFIX) || !id.endsWith(SUFFIX)) return null
      const url = decodeURIComponent(id.slice(PREFIX.length, -SUFFIX.length))
      return `export default ${JSON.stringify(url)};`
    },
  }
}
export { publicAssetFixture }
