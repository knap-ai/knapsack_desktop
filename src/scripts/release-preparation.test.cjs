const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const crypto = require('node:crypto')
const { spawnSync } = require('node:child_process')
const yaml = require('../node_modules/yaml')

const workflow = yaml.parse(fs.readFileSync(process.env.RELEASE_TEST_WORKFLOW || path.join(__dirname, '../../.github/workflows/release.yml'), 'utf8'))
const reviewed = 'a'.repeat(40), released = 'b'.repeat(40)
const step = (job, name) => {
  const found = workflow.jobs[job]?.steps.find(item => item.name === name)
  assert.ok(found, name)
  return found
}

function fixture(overrides = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'kn-release-fixture-'))
  const bin = path.join(root, 'bin'), log = path.join(root, 'calls.jsonl')
  fs.mkdirSync(bin)
  for (const tool of ['git', 'gh']) {
    fs.writeFileSync(path.join(bin, tool), `#!/usr/bin/env node
const fs=require('node:fs'),a=process.argv.slice(2),tool=${JSON.stringify(tool)};
fs.appendFileSync(process.env.MOCK_LOG,JSON.stringify({tool,args:a})+'\\n');
if(tool==='git') {
  if(a[0]==='rev-parse') console.log(a[1]==='HEAD'?process.env.MOCK_HEAD:a[1]==='origin/main'?process.env.MOCK_MAIN:process.env.MOCK_TAG);
  else if(a[0]==='diff') process.exit(1);
  else if(a[0]==='ls-remote') process.exit(2);
  else if(!['fetch','config','add','commit','push','tag'].includes(a[0])) process.exit(93);
} else {
  if(a[0]!=='release') process.exit(94);
  if(a[1]==='view') {
    if(process.env.MOCK_RELEASE==='missing') process.exit(1);
    console.log(a.includes('--json')?String(process.env.MOCK_RELEASE==='draft'):'fixture');
  } else if(a[1]==='create') {if(!a.includes('--draft')) process.exit(95);}
  else if(a[1]!=='upload') process.exit(96);
}
`, { mode: 0o700 })
  }
  const env = {
    PATH: [bin, path.dirname(process.execPath), process.env.PATH].join(path.delimiter),
    HOME: root, TMPDIR: root, MOCK_LOG: log,
    EXPECTED_SHA: reviewed, DISPATCH_SHA: reviewed, REVIEWED_SHA: reviewed,
    RELEASE_SHA: released, MOCK_HEAD: reviewed, MOCK_MAIN: reviewed, MOCK_TAG: released,
    MOCK_RELEASE: 'missing', GITHUB_REF: 'refs/heads/main', TAG: 'v3.4.6',
    GITHUB_RUN_ID: '123', GITHUB_RUN_ATTEMPT: '1', GITHUB_OUTPUT: path.join(root, 'output'),
    ...overrides,
  }
  return {
    root,
    run(source) {
      source = source.replaceAll('${{ steps.bump.outputs.tag }}', 'v3.4.6')
      return spawnSync('bash', ['-c', source], { cwd: root, env, encoding: 'utf8', timeout: 10000 })
    },
    calls: () => fs.existsSync(log) ? fs.readFileSync(log, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse) : [],
    cleanup: () => fs.rmSync(root, { recursive: true, force: true }),
  }
}
function runStep(job, name, env, inspect) {
  const f = fixture(env)
  try { inspect(f.run(step(job, name).run), f) } finally { f.cleanup() }
}

test('release preparation pins all builds and draft staging to the release commit', () => {
  assert.equal(workflow.on.workflow_dispatch.inputs.expected_sha.required, true)
  assert.equal(workflow.jobs['bump-version'].steps[0].with.ref, '${{ inputs.expected_sha }}')
  assert.equal(workflow.jobs['bump-version'].outputs.sha, '${{ steps.commit.outputs.sha }}')
  for (const job of ['build-macos', 'build-windows', 'stage-release']) {
    assert.equal(workflow.jobs[job].steps[0].with.ref, '${{ needs.bump-version.outputs.sha }}')
  }
  assert.deepEqual(workflow.jobs['stage-release'].needs, ['bump-version', 'build-macos', 'build-windows'])
  assert.match(step('build-macos', 'Sign and notarize').run, /--notarize/)
  assert.match(step('build-macos', 'Verify signed app passes Gatekeeper as a user would see it').run, /spctl --assess/)
  assert.match(step('build-windows', 'Verify Windows installer artifacts').run, /verify-windows-installer/)
})

test('matching reviewed main passes source preflight without mutations', () => {
  runStep('bump-version', 'Verify reviewed main source', {}, (result, f) => {
    assert.equal(result.status, 0, result.stderr)
    assert.ok(f.calls().some(call => call.args[0] === 'fetch'))
    assert.ok(f.calls().every(call => ['fetch', 'rev-parse'].includes(call.args[0])))
  })
})
for (const [name, override] of Object.entries({
  'invalid SHA': { EXPECTED_SHA: 'not-a-commit' },
  'wrong dispatch branch': { GITHUB_REF: 'refs/heads/unreviewed' },
  'wrong dispatch commit': { DISPATCH_SHA: released },
  'wrong checkout': { MOCK_HEAD: released },
  'main advanced': { MOCK_MAIN: released },
})) test(`source preflight rejects ${name} before writes`, () => {
  runStep('bump-version', 'Verify reviewed main source', override, (result, f) => {
    assert.notEqual(result.status, 0)
    assert.ok(f.calls().every(call => ['fetch', 'rev-parse'].includes(call.args[0])))
  })
})

test('main advancing after preflight stops version commit and tag writes', () => {
  runStep('bump-version', 'Commit and tag', { MOCK_MAIN: released }, (result, f) => {
    assert.notEqual(result.status, 0)
    assert.ok(!f.calls().some(call => ['add', 'commit', 'push', 'tag', 'rebase'].includes(call.args[0])))
  })
})

for (const state of ['missing', 'draft']) test(`staging a ${state} release never publishes`, () => {
  runStep('stage-release', 'Stage draft GitHub Release for artifact acceptance', { MOCK_RELEASE: state }, (result, f) => {
    assert.equal(result.status, 0, result.stderr)
    const calls = f.calls().filter(call => call.tool === 'gh')
    assert.ok(calls.some(call => call.args[1] === 'upload'))
    assert.ok(!calls.some(call => call.args[1] === 'edit' || call.args.includes('--draft=false')))
    if (state === 'missing') assert.ok(calls.find(call => call.args[1] === 'create').args.includes('--draft'))
  })
})
test('staging refuses an already published release without changing its assets', () => {
  runStep('stage-release', 'Stage draft GitHub Release for artifact acceptance', { MOCK_RELEASE: 'published' }, (result, f) => {
    assert.notEqual(result.status, 0)
    assert.ok(!f.calls().some(call => ['upload', 'create', 'edit'].includes(call.args[1])))
  })
})

test('provenance binds the reviewed source, release commit, run and exact asset bytes', () => {
  const f = fixture({ MOCK_HEAD: released })
  try {
    const assets = path.join(f.root, 'release-files'); fs.mkdirSync(assets)
    fs.writeFileSync(path.join(assets, 'synthetic bundle.zip'), Buffer.from([1, 2, 3]))
    const result = f.run(step('stage-release', 'Record release provenance and checksums').run)
    assert.equal(result.status, 0, result.stderr)
    const provenance = JSON.parse(fs.readFileSync(path.join(assets, 'provenance.json')))
    assert.deepEqual(provenance, { reviewed_sha: reviewed, release_sha: released, tag: 'v3.4.6', workflow_run: '123', workflow_attempt: '1' })
    const checksums = fs.readFileSync(path.join(assets, 'SHA256SUMS'), 'utf8').trim().split('\n')
    assert.equal(checksums.length, 2)
    for (const line of checksums) {
      const [hash, name] = line.split('  ')
      assert.equal(hash, crypto.createHash('sha256').update(fs.readFileSync(path.join(assets, name))).digest('hex'))
    }
    const expected = checksums.find(line => line.endsWith('  synthetic bundle.zip')).split('  ')[0]
    fs.writeFileSync(path.join(assets, 'synthetic bundle.zip'), 'changed')
    assert.notEqual(expected, crypto.createHash('sha256').update(fs.readFileSync(path.join(assets, 'synthetic bundle.zip'))).digest('hex'))
  } finally { f.cleanup() }
})
test('provenance refuses a tag pointing to a different release commit', () => {
  runStep('stage-release', 'Record release provenance and checksums', { MOCK_HEAD: released, MOCK_TAG: reviewed }, (result, f) => {
    assert.notEqual(result.status, 0)
    assert.equal(fs.existsSync(path.join(f.root, 'release-files/provenance.json')), false)
  })
})

test('existing version helper prepares v3.4.6 from the v3.4.5 fixture without touching repository files', () => {
  const f = fixture()
  try {
    fs.mkdirSync(path.join(f.root, 'scripts'))
    fs.mkdirSync(path.join(f.root, 'src-tauri'))
    fs.copyFileSync(path.join(__dirname, 'bump-version.cjs'), path.join(f.root, 'scripts/bump-version.cjs'))
    fs.writeFileSync(path.join(f.root, 'package.json'), JSON.stringify({version:'3.4.5'}))
    fs.writeFileSync(path.join(f.root, 'package-lock.json'), JSON.stringify({version:'3.4.5',packages:{'':{version:'3.4.5'}}}))
    fs.writeFileSync(path.join(f.root, 'src-tauri/tauri.conf.json'), JSON.stringify({package:{version:'3.4.5'}}))
    const result = f.run('node scripts/bump-version.cjs')
    assert.equal(result.status, 0, result.stderr)
    assert.equal(JSON.parse(fs.readFileSync(path.join(f.root, 'package.json'))).version, '3.4.6')
    const lock = JSON.parse(fs.readFileSync(path.join(f.root, 'package-lock.json')))
    assert.equal(lock.version, '3.4.6'); assert.equal(lock.packages[''].version, '3.4.6')
    assert.equal(JSON.parse(fs.readFileSync(path.join(f.root, 'src-tauri/tauri.conf.json'))).package.version, '3.4.6')
    assert.match(fs.readFileSync(path.join(f.root, 'output'), 'utf8'), /tag=v3\.4\.6/)
  } finally { f.cleanup() }
})
