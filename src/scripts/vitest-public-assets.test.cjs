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
test('desktop template persistence uses the reviewed public-asset fixture config', () => {
  const pkg = require('../package.json')
  assert.match(pkg.scripts['test:desktop-usability'], /vitest run --config scripts\/meeting-notes-vitest\.config\.mjs /)
  assert.match(pkg.scripts['test:desktop-usability'], /MeetingsTabView\/templatePersistence\.test\.tsx/)
})
test('focused Vite resolution returns a virtual module for the failing image; production stays unchanged', async () => {
  const { resolveConfig } = await import('vite')
  const config = await resolveConfig({ configFile: path.resolve('scripts/meeting-notes-vitest.config.mjs'), logLevel: 'silent' }, 'serve', 'test')
  const plugin = config.plugins.find(p => p.name === 'knapsack-test-public-assets')
  assert.ok(plugin)
  const resolved = plugin.resolveId('/assets/images/knap-logo-medium.png')
  assert.ok(resolved.id.startsWith('\0'))
  assert.equal(plugin.load(resolved.id), 'export default "/assets/images/knap-logo-medium.png";')
  const prod = await resolveConfig({ configFile: path.resolve('vite.config.ts'), logLevel: 'silent' }, 'build')
  assert.equal(prod.plugins.some(p => p.name === 'knapsack-test-public-assets'), false)
})
