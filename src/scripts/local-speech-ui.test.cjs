const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const { transform } = require('esbuild')
async function getVoice(synth) {
  const source = await fs.readFile(`${__dirname}/../src/utils/localSpeech.ts`, 'utf8')
  const { code } = await transform(source.slice(source.indexOf('export async function localSystemVoice')).replace('export ', ''), { loader: 'ts', format: 'cjs' })
  return new Function('window', 'navigator', code + '\nreturn localSystemVoice();')({ speechSynthesis: synth }, { language: 'en-US' })
}
test('private spoken replies exclude network voices even when they match the language', async () => {
  const remote = { localService: false, lang: 'en-US' }
  const local = { localService: true, lang: 'es-MX' }
  assert.equal(await getVoice({ getVoices: () => [remote, local] }), local)
  assert.equal(await getVoice({ getVoices: () => [remote] }), undefined)
})
test('first voice use waits for the device voice list to load', async () => {
  const local = { localService: true, lang: 'en-US' }
  let voices = [], removed = false
  const synth = {
    getVoices: () => voices,
    addEventListener(name, cb) { assert.equal(name, 'voiceschanged'); setTimeout(() => { voices = [local]; cb() }, 5) },
    removeEventListener() { removed = true },
  }
  assert.equal(await getVoice(synth), local)
  assert.equal(removed, true)
})
