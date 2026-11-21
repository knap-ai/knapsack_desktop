const test = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')
const fixture = import('./vitest-public-assets.mjs')
for (const [name, paths, root] of [['posix', path.posix, '/qa/public/assets'], ['windows', path.win32, 'C:\\qa\\public\\assets']]) {
  test(`public image fixture avoids root file URLs on ${name}`, async () => {
    const { publicAssetFixture } = await fixture
    const seen = []
    const plugin = publicAssetFixture({ paths, assetRoot: root, exists: file => { seen.push(file); return true } })
    for (const image of ['checkbox-checked.svg', 'knap-logo-medium.png', 'other-icon.webp']) {
      const source = '/assets/images/' + image
      const resolved = plugin.resolveId(source)
      assert.ok(resolved.id.startsWith('\0'))
      assert.ok(!resolved.id.startsWith('file:'))
      assert.equal(seen.at(-1), paths.resolve(root, 'images', image))
      assert.equal(plugin.load(resolved.id), `export default ${JSON.stringify(source)};`)
    }
  })
}
test('non-assets retain normal resolution; missing assets fail instead of masking an error', async () => {
  const { publicAssetFixture } = await fixture
  const plugin = publicAssetFixture({ exists: () => false })
  assert.equal(plugin.resolveId('src/components/organisms/TemplatesView'), null)
  assert.equal(plugin.resolveId('/assets/code.js'), null)
  assert.equal(plugin.load('/assets/images/icon.svg'), null)
  assert.throws(() => plugin.resolveId('/assets/images/missing.svg'), /Missing or invalid/)
  assert.throws(() => plugin.resolveId('/assets/../../private.svg'), /Missing or invalid/)
})
