const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')
const vm = require('node:vm')

test('server recovery errors retain their cause in chat instead of asking for more API keys', () => {
  const path = `${__dirname}/../src/components/organisms/ClawdChat/index.tsx`
  const source = fs.readFileSync(path, 'utf8')
  const ast = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const fn = ast.statements.find(node => ts.isFunctionDeclaration(node) && node.name.text === 'friendlyError')
  const code = ts.transpileModule(fn.getText(ast), { compilerOptions: { target: ts.ScriptTarget.ES2020 } }).outputText
  const friendlyError = vm.runInNewContext(`${code}; friendlyError`)
  for (const raw of [
    'HTTP 500: Knapsack inference error: All Bedrock fallback models are waiting on recovery probes; try again shortly',
    'HTTP 503: Bedrock models are in cooldown or awaiting a recovery probe; try again shortly',
    'Knapsack inference is temporarily recovering after upstream model failures.',
  ]) {
    const result = friendlyError(raw, 'knapsack/auto')
    assert.match(result, /Knapsack is temporarily recovering/)
    assert.doesNotMatch(result, /All AI providers|Add a backup provider|credit\/rate limit/)
  }
  assert.match(friendlyError('All AI providers are currently unavailable', 'openai/test'), /All AI providers/)
})
