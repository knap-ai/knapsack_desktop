import { invoke } from '@tauri-apps/api/tauri'

import { getAppVersion, getOSInfoString } from 'src/utils/app'
import { KN_SERVER_HOST } from 'src/utils/constants'
import type { ComposedEmailAttachment, ComposedEmailDraft } from 'src/hooks/feed/useFeed'

type DiagnosticJson = Record<string, unknown> | null

function redactSensitiveText(input: string): string {
  return input
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[redacted-email]')
    .replace(/(authorization["'=:\s]+bearer\s+)[A-Za-z0-9._\-+/=]+/gi, '$1[redacted-token]')
    .replace(/((?:api[-_ ]?key|access[-_ ]?token|refresh[-_ ]?token|id[-_ ]?token)["'=:\s]+)([^"',\s}]+)/gi, '$1[redacted-secret]')
    .replace(/\b(sk|rk|pk|ghp|xoxb|xoxp|xoxa|xapp)-[A-Za-z0-9._\-]{8,}\b/g, '[redacted-secret]')
}

function sanitizeLines(lines: string[]): string[] {
  return lines
    .map(line => redactSensitiveText(line))
    .map(line => (line.length > 600 ? `${line.slice(0, 600)}…` : line))
}

async function safeJsonFetch(path: string, timeoutMs = 5000): Promise<DiagnosticJson> {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(`${KN_SERVER_HOST}${path}`, { signal: controller.signal })
    if (!res.ok) {
      return { ok: false, status: res.status, statusText: res.statusText }
    }
    const data = await res.json()
    return JSON.parse(redactSensitiveText(JSON.stringify(data, null, 2)))
  } catch (error: any) {
    return { ok: false, error: error?.message || String(error) }
  } finally {
    window.clearTimeout(timer)
  }
}

function buildDiagnosticText(params: {
  issueSummary: string
  activeModel: string
  appVersion: string
  osInfo: string
  openclawVersion: string
  generatedAt: string
  errorLines: string[]
  gatewayErrLines: string[]
  gatewayOutLines: string[]
  health: DiagnosticJson
  status: DiagnosticJson
  channels: DiagnosticJson
}): string {
  const {
    issueSummary,
    activeModel,
    appVersion,
    osInfo,
    openclawVersion,
    generatedAt,
    errorLines,
    gatewayErrLines,
    gatewayOutLines,
    health,
    status,
    channels,
  } = params

  return [
    'Knapsack sanitized diagnostics bundle',
    `Generated at: ${generatedAt}`,
    `App version: ${appVersion}`,
    `OpenClaw version: ${openclawVersion}`,
    `OS: ${osInfo}`,
    `Active model: ${activeModel || 'unknown'}`,
    '',
    'Issue summary:',
    issueSummary,
    '',
    'Service health:',
    JSON.stringify(health, null, 2),
    '',
    'Service status:',
    JSON.stringify(status, null, 2),
    '',
    'Channel diagnostics:',
    JSON.stringify(channels, null, 2),
    '',
    'Recent app error log lines:',
    ...(errorLines.length > 0 ? errorLines : ['<none>']),
    '',
    'Recent gateway stderr log lines:',
    ...(gatewayErrLines.length > 0 ? gatewayErrLines : ['<none>']),
    '',
    'Recent gateway stdout log lines:',
    ...(gatewayOutLines.length > 0 ? gatewayOutLines : ['<none>']),
    '',
    'Privacy note:',
    'This bundle is sanitized to exclude chat bodies, email bodies, document content, transcripts, and obvious secrets/tokens.',
  ].join('\n')
}

export async function buildSupportDiagnosticsDraft(params: {
  issueSummary: string
  activeModel: string
  senderEmail?: string
  senderName?: string
}): Promise<ComposedEmailDraft> {
  const generatedAt = new Date().toISOString()
  const [
    appVersion,
    osInfo,
    openclawVersion,
    errorLines,
    gatewayErrLines,
    gatewayOutLines,
    health,
    status,
    channels,
  ] = await Promise.all([
    getAppVersion(),
    getOSInfoString(),
    invoke<string>('kn_get_openclaw_version').catch(() => 'unknown'),
    invoke<string[]>('kn_read_logs', { logType: 'error', maxLines: 120 }).catch(() => []),
    invoke<string[]>('kn_read_logs', { logType: 'clawdbot_err', maxLines: 120 }).catch(() => []),
    invoke<string[]>('kn_read_logs', { logType: 'clawdbot_out', maxLines: 80 }).catch(() => []),
    safeJsonFetch('/api/clawd/service/health'),
    safeJsonFetch('/api/clawd/service/status'),
    safeJsonFetch('/api/clawd/channels/diagnostics'),
  ])

  const sanitizedIssueSummary = redactSensitiveText(
    params.issueSummary.replace(/\[Share diagnostics with Knapsack Support\]\(knapsack:\/\/prompt\/__share_support_diagnostics__\)/g, ''),
  ).slice(0, 1200)
  const attachmentText = buildDiagnosticText({
    issueSummary: sanitizedIssueSummary,
    activeModel: params.activeModel,
    appVersion,
    osInfo,
    openclawVersion,
    generatedAt,
    errorLines: sanitizeLines(errorLines),
    gatewayErrLines: sanitizeLines(gatewayErrLines),
    gatewayOutLines: sanitizeLines(gatewayOutLines),
    health,
    status,
    channels,
  })

  const attachment: ComposedEmailAttachment = {
    filename: `knapsack-diagnostics-${generatedAt.replace(/:/g, '-')}.txt`,
    mimeType: 'text/plain',
    content: attachmentText,
    encoding: 'utf8',
  }

  return {
    to: 'support@knap.ai',
    subject: `Knapsack diagnostics: ${params.activeModel || 'unknown-model'} - ${generatedAt.slice(0, 10)}`,
    body: [
      '<p>Hi Knapsack Support,</p>',
      '<p>I ran into an issue in Knapsack and am sharing the attached sanitized diagnostics bundle for troubleshooting.</p>',
      `<p><strong>Issue summary:</strong> ${sanitizedIssueSummary}</p>`,
      '<p>Thank you.</p>',
    ].join(''),
    senderEmail: params.senderEmail?.trim() || undefined,
    userEmail: params.senderEmail?.trim() || undefined,
    userName: params.senderName?.trim() || undefined,
    attachments: [attachment],
  }
}
