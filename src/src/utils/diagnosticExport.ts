import { diagnosticCaptureEnabled, diagnosticSnapshot } from './diagnostics'
type ExportDependencies = { snapshot: () => Promise<unknown[]>; save: () => Promise<string | null>; write: (path: string, content: string) => Promise<void> }
export function exportMetadata(value: unknown): object | undefined {
  if (!value || typeof value !== 'object') return undefined
  const e = value as Record<string, unknown>
  if (typeof e.diagnostic_id !== 'string' || !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(e.diagnostic_id)) return undefined
  if (typeof e.empty_email === 'boolean' && e.match_count === 0 && typeof e.database_category === 'string' && ['default','configured','unknown'].includes(e.database_category)) {
    return { diagnostic_id: e.diagnostic_id, empty_email: e.empty_email, match_count: 0, database_category: e.database_category }
  }
  if (typeof e.kind !== 'string' || typeof e.phase !== 'string' || typeof e.outcome !== 'string' ||
      !['notes','completion','transcription'].includes(e.kind) ||
      !['queue','request','completion','total','preparation','auth','provider','retry_wait','local_inference'].includes(e.phase) ||
      !['started','completed','failed','cancelled','timeout','transport','http_error'].includes(e.outcome) ||
      typeof e.elapsed_ms !== 'number' || !Number.isSafeInteger(e.elapsed_ms) || e.elapsed_ms < 0) return undefined
  const result: Record<string, unknown> = { diagnostic_id: e.diagnostic_id, kind: e.kind, phase: e.phase, outcome: e.outcome, elapsed_ms: e.elapsed_ms }
  if (typeof e.http_status === 'number' && Number.isInteger(e.http_status) && e.http_status >= 100 && e.http_status <= 599) result.http_status = e.http_status
  return result
}
export async function exportDiagnosticCapture(deps: ExportDependencies): Promise<'saved' | 'cancelled'> {
  if (!diagnosticCaptureEnabled()) return 'cancelled'
  const native = (await deps.snapshot()).slice(-1024).map(exportMetadata).filter(Boolean)
  const frontend = diagnosticSnapshot().slice(-256).map(event => exportMetadata(JSON.parse(event))).filter(Boolean)
  const path = await deps.save()
  if (!path || !diagnosticCaptureEnabled()) return 'cancelled'
  await deps.write(path, JSON.stringify({ schema_version: 1, frontend, native }, null, 2))
  return 'saved'
}
