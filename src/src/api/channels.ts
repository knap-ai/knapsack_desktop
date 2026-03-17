/** API helpers for messaging channel endpoints (WhatsApp, iMessage). */

const API_BASE = 'http://127.0.0.1:8897'

export interface ChannelStatus {
  success: boolean
  enabled: boolean
  configured: boolean
  linked?: boolean
  provider?: string
  message?: string
  /** Account identifier: phone number (WhatsApp) or email (iMessage) */
  account?: string
}

interface GenericResponse {
  success: boolean
  message?: string
  configured?: boolean
  linked?: boolean
}

export interface WhatsAppLoginResponse {
  success: boolean
  message?: string
  qrDataUrl?: string
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`)
  if (!res.ok) {
    const t = await res.text().catch(() => '')
    throw new Error(t || `HTTP ${res.status}`)
  }
  return (await res.json()) as T
}

async function post<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  })
  if (!res.ok) {
    const t = await res.text().catch(() => '')
    throw new Error(t || `HTTP ${res.status}`)
  }
  return (await res.json()) as T
}

// ── WhatsApp ─────────────────────────────────────────────────

export const getWhatsAppStatus = () =>
  get<ChannelStatus>('/api/clawd/channels/whatsapp/status')

export const enableWhatsApp = (enabled: boolean) =>
  post<GenericResponse>('/api/clawd/channels/whatsapp/enable', { enabled })

export const startWhatsAppLogin = () =>
  post<WhatsAppLoginResponse>('/api/clawd/channels/whatsapp/login')

export interface WhatsAppLoginWaitResponse {
  success: boolean
  connected: boolean
  message?: string
}

/** Wait for the user to scan the WhatsApp QR code. Blocks until scan or timeout. */
export const waitWhatsAppLogin = () =>
  post<WhatsAppLoginWaitResponse>('/api/clawd/channels/whatsapp/login-wait')

/** Re-link WhatsApp: clear stale credentials and start fresh QR login. */
export const relinkWhatsApp = () =>
  post<WhatsAppLoginResponse>('/api/clawd/channels/whatsapp/relink', {})

export interface WhatsAppPhonePairResponse {
  success: boolean
  message?: string
  pairingCode?: string
}

/** Link WhatsApp via phone number pairing code (alternative to QR scan). */
export const loginWhatsAppPhone = (phoneNumber: string) =>
  post<WhatsAppPhonePairResponse>('/api/clawd/channels/whatsapp/login-phone', { phoneNumber })

/** Disconnect WhatsApp: logout from Baileys and remove channel config. */
export const disconnectWhatsApp = () =>
  post<GenericResponse>('/api/clawd/channels/whatsapp/disconnect', {})

// ── iMessage ─────────────────────────────────────────────────

export const getIMessageStatus = () =>
  get<ChannelStatus>('/api/clawd/channels/imessage/status')

export const enableIMessage = (enabled: boolean) =>
  post<GenericResponse>('/api/clawd/channels/imessage/enable', { enabled })

export const setupIMessage = () =>
  post<GenericResponse>('/api/clawd/channels/imessage/setup')

export const openFullDiskAccess = () =>
  post<GenericResponse>('/api/clawd/channels/open-full-disk-access')

/** Disconnect iMessage: remove channel config. */
export const disconnectIMessage = () =>
  post<GenericResponse>('/api/clawd/channels/imessage/disconnect', {})

// ── Telegram ────────────────────────────────────────────────

export const getTelegramStatus = () =>
  get<ChannelStatus>('/api/clawd/channels/telegram/status')

export const enableTelegram = (enabled: boolean) =>
  post<GenericResponse>('/api/clawd/channels/telegram/enable', { enabled })

export const configureTelegram = (botToken: string) =>
  post<GenericResponse>('/api/clawd/channels/telegram/configure', { bot_token: botToken })

/** Disconnect Telegram: logout the bot and remove channel config. */
export const disconnectTelegram = () =>
  post<GenericResponse>('/api/clawd/channels/telegram/disconnect', {})

// ── Generic Channels (Slack, Discord, Signal, IRC, Google Chat) ──

/** Get status for a generic channel. */
export const getGenericChannelStatus = (channel: string) =>
  get<ChannelStatus>(`/api/clawd/channels/generic/${channel}/status`)

/** Configure a generic channel with arbitrary config. */
export const configureGenericChannel = (channel: string, config: Record<string, unknown>) =>
  post<GenericResponse>(`/api/clawd/channels/generic/${channel}/configure`, { config })

/** Disconnect a generic channel. */
export const disconnectGenericChannel = (channel: string) =>
  post<GenericResponse>(`/api/clawd/channels/generic/${channel}/disconnect`, {})

// ── Signal CLI ──────────────────────────────────────────────

export interface SignalCliStatus {
  success: boolean
  installed: boolean
  cli_path?: string
  version?: string
  message?: string
}

/** Check if signal-cli is installed on this machine. */
export const checkSignalCli = () =>
  get<SignalCliStatus>('/api/clawd/channels/signal/check-cli')

/** Install signal-cli automatically (downloads binary or uses Homebrew). */
export const installSignalCli = () =>
  post<SignalCliStatus>('/api/clawd/channels/signal/install-cli')

export interface SignalRegResponse {
  success: boolean
  message?: string
  /** Device link URI (tsdevice://...) for QR code generation. */
  link_uri?: string
  /** Whether captcha is required for SMS registration. */
  captcha_required?: boolean
  /** Account phone number (after successful link/verify). */
  account?: string
}

/** Start the signal-cli link flow. Returns a device link URI for QR display. */
export const signalLink = (cliPath: string, deviceName?: string) =>
  post<SignalRegResponse>('/api/clawd/channels/signal/link', {
    cli_path: cliPath,
    device_name: deviceName,
  })

/** Register a phone number via SMS verification. */
export const signalRegister = (cliPath: string, phoneNumber: string, captcha?: string) =>
  post<SignalRegResponse>('/api/clawd/channels/signal/register', {
    cli_path: cliPath,
    phone_number: phoneNumber,
    captcha,
  })

/** Verify a phone number with the SMS code. */
export const signalVerify = (cliPath: string, phoneNumber: string, code: string) =>
  post<SignalRegResponse>('/api/clawd/channels/signal/verify', {
    cli_path: cliPath,
    phone_number: phoneNumber,
    code,
  })

// ── Send Message ────────────────────────────────────────────

export interface SendMessageResponse {
  success: boolean
  message?: string
}

/** Send a message to a user through a connected channel (WhatsApp, iMessage, or Telegram). */
export const sendChannelMessage = (channel: string, to: string, message: string) =>
  post<SendMessageResponse>('/api/clawd/channels/send', { channel, to, message })

// ── Allowlist Management ─────────────────────────────────────

export interface AllowlistResponse {
  success: boolean
  dmPolicy: string
  allowFrom: string[]
  message?: string
}

/** Get the current DM policy and allowlist for a channel. */
export const getChannelAllowlist = (channel: string) =>
  get<AllowlistResponse>(`/api/clawd/channels/${channel}/allowlist`)

/** Update the DM policy and/or allowlist for a channel. */
export const updateChannelAllowlist = (
  channel: string,
  update: { dmPolicy?: string; allowFrom?: string[] },
) => post<GenericResponse>(`/api/clawd/channels/${channel}/allowlist`, update)

// ── Diagnostics ─────────────────────────────────────────────

export interface ChannelDiagnostics {
  success: boolean
  channelSummary: string[]
  hasModel: boolean
  model: string | null
  hasApiKey: boolean
  apiKeyProvider: string | null
  configuredChannels: string[]
  issues: string[]
  repairs: string[]
}

/** Run channel diagnostics and auto-repair common issues. */
export const runChannelDiagnostics = () =>
  get<ChannelDiagnostics>('/api/clawd/channels/diagnostics')
