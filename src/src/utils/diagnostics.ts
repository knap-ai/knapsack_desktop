// Bounded local memory only: console calls can become Sentry breadcrumbs.
let enabled = false
const events: string[] = []
export const diagnosticCaptureEnabled = () => enabled
export function setDiagnosticCapture(enabledValue: boolean): void { enabled = enabledValue === true; events.length = 0 }
export const diagnosticSnapshot = (): readonly string[] => [...events]
export type DiagnosticKind = 'notes' | 'completion'
export type Diagnostic = Readonly<{ id: string; kind: DiagnosticKind; queuedAt: number }>
type Phase = 'queue' | 'request' | 'completion'
type Outcome = 'started' | 'completed' | 'failed' | 'cancelled'
export const diagnosticNow = () => typeof performance === 'undefined' ? Date.now() : performance.now()
export function createDiagnostic(kind: DiagnosticKind = 'completion'): Diagnostic | undefined {
  try {
    if (!enabled) return undefined
    const bytes = crypto.getRandomValues(new Uint8Array(16))
    bytes[6] = (bytes[6] & 15) | 64
    bytes[8] = (bytes[8] & 63) | 128
    const hex = [...bytes].map(b => b.toString(16).padStart(2, '0')).join('')
    const id = `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`
    return Object.freeze({ id, kind: kind === 'notes' ? 'notes' : 'completion', queuedAt: diagnosticNow() })
  } catch { return undefined }
}
export function emitDiagnostic(trace: Diagnostic | undefined, phase: Phase, outcome: Outcome, startedAt: number): void {
  try {
    if (!enabled || !trace || !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(trace.id)) return
    if (!['queue','request','completion'].includes(phase) || !['started','completed','failed','cancelled'].includes(outcome)) return
    const elapsed = diagnosticNow() - startedAt
    if (!Number.isFinite(elapsed) || elapsed < 0) return
    events.push(JSON.stringify({ diagnostic_id: trace.id,
      kind: trace.kind === 'notes' ? 'notes' : 'completion', phase, outcome, elapsed_ms: Math.round(elapsed) }))
    if (events.length > 256) events.shift()
  } catch { /* Diagnostics must not change request behavior. */ }
}
