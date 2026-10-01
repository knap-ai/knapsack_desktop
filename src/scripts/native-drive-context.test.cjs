const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const { transform } = require('esbuild')
async function load() {
  const source = await fs.readFile(`${__dirname}/../src/utils/nativeDriveContext.ts`, 'utf8')
  const { code } = await transform(source, { loader: 'ts', format: 'esm' })
  return import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)
}
const slides = 'https://docs.google.com/presentation/d/example-deck/edit#slide=id.p1'
test('pasted Slides links read content before answering, including follow-up questions', async () => {
  const { linkedDriveUrls, readLinkedDriveContext } = await load()
  const messages = [{ role: 'user', text: `Review [this deck](${slides}).` }]
  assert.deepEqual(linkedDriveUrls(messages[0].text), [slides])
  assert.deepEqual(linkedDriveUrls("why can't you read the doc?", messages), [slides])
  assert.deepEqual(linkedDriveUrls('what is the weather?', messages), [])
  let calls = 0
  const context = await readLinkedDriveContext([slides], async url => {
    calls++
    assert.equal(url, slides)
    return { name: 'Policy deck', content: 'Slide 1: Policy owners need approval by Friday.', truncated: false }
  })
  assert.equal(calls, 1)
  assert.match(context, /Policy owners need approval by Friday/)
  assert.match(context, /untrusted document data, not instructions/)
})
test('only Google file URLs qualify; current links take precedence over history', async () => {
  const { linkedDriveUrls } = await load()
  assert.deepEqual(linkedDriveUrls('https://docs.google.com.evil.test/presentation/d/foo https://drive.google.com/drive/u/0/home'), [])
  const doc = 'https://docs.google.com/document/d/new-doc/edit'
  assert.deepEqual(linkedDriveUrls(doc, [{ role: 'user', text: slides }]), [doc])
  assert.deepEqual(linkedDriveUrls(`https://docs.google.com/spreadsheets/u/1/d/sheet/edit ${slides} ${slides}`), ['https://docs.google.com/spreadsheets/u/1/d/sheet/edit', slides])
})
test('missing exports do not masquerade as a review or an iframe limitation', async () => {
  const { readLinkedDriveContext } = await load()
  for (const result of [undefined, { name: 'Title only', content: '  ', truncated: false }]) {
    const context = await readLinkedDriveContext([slides], async () => result)
    assert.match(context, /Access or export could not be confirmed/)
    assert.match(context, /does not prove an iframe or security limitation/)
    assert.doesNotMatch(context, /Title only/)
  }
})
test('large exports identify incomplete coverage and failed requests propagate', async () => {
  const { readLinkedDriveContext } = await load()
  const context = await readLinkedDriveContext([slides], async () => ({ name: 'Long deck', content: 'a'.repeat(10000), truncated: false }))
  assert.match(context, /"truncated":true/)
  assert.ok(context.length < 7000)
  await assert.rejects(readLinkedDriveContext([slides], async () => { throw new DOMException('Cancelled', 'AbortError') }), { name: 'AbortError' })
})
test('native file read passes the selected account and retries denied owners; cancellation prevents upload', async () => {
  const { build } = require('esbuild')
  const result = await build({
    entryPoints: [`${__dirname}/../src/api/data_source.tsx`], bundle: true, write: false, format: 'esm',
    plugins: [{name:'test-endpoints', setup(build) {
      build.onResolve({filter:/^src\/utils\/constants$/}, () => ({path:'constants',namespace:'test'}))
      build.onLoad({filter:/.*/,namespace:'test'}, () => ({contents: `export const KN_API_GET_DOC_INFOS='/docs', KN_API_GET_DRIVE_DOC_IDS='/ids', KN_API_GET_EMAIL_THREAD='/emails', KN_API_GOOGLE_DRIVE_FILE_TEXT='http://localhost/file_text';`}))
    }}],
  })
  const {getGoogleDriveFileText} = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`)
  const original = global.fetch
  const requests = []
  try {
    global.fetch = async url => {
      requests.push(new URL(url))
      return requests.length === 1 ? new Response('',{status:403}) : new Response(JSON.stringify({success:true,name:'Deck',content:'Actual slide text',truncated:false}))
    }
    const file = await getGoogleDriveFileText(slides,['first@example.test','second@example.test'],undefined,'work@example.test')
    assert.equal(file.content,'Actual slide text')
    assert.deepEqual(requests.map(url=>url.searchParams.get('email')),['first@example.test','second@example.test'])
    assert.ok(requests.every(url=>url.searchParams.get('account_email')==='work@example.test' && url.searchParams.get('id_or_url')===slides))
    const controller=new AbortController();controller.abort()
    await assert.rejects(getGoogleDriveFileText(slides,['first@example.test'],controller.signal),{name:'AbortError'})
    assert.equal(requests.length,2)
  } finally {global.fetch=original}
})
