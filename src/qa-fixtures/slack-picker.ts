// Internal synthetic diagnostic only; never a production build entry.
const status = document.getElementById('qa-status')!
const timings: Record<string, number> = { entry: Math.round(performance.now()) }
async function run() {
  try {
    const { createProbeHarness } = await import('../src/qa/nativeDomProbes')
    timings.graph = Math.round(performance.now())
    status.textContent = 'Creating sealed synthetic harness'
    const harness = await createProbeHarness(document.getElementById('qa-root')!, () => {
      throw new Error('Native IPC is unavailable in this fixed Slack scenario')
    })
    timings.harness = Math.round(performance.now())
    status.textContent = 'Running fixed Slack picker assertions'
    await harness.run('slack_share')
    timings.finished = Math.round(performance.now())
    status.textContent = 'Passed: picker, preview, synthetic send dedupe, revoked connection, disabled empty picker, copy fallback and Close. Navigation milliseconds: ' + JSON.stringify(timings)
  } catch (error) {
    status.textContent = `Failed: ${error instanceof Error ? error.message : 'unknown error'}`
  }
}
void run()
export {}
