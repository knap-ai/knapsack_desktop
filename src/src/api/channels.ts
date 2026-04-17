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

async function post<T>(path: string, body?: unknown, timeoutMs = 30_000): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body ?? {}),
      signal: controller.signal,
    })
    if (!res.ok) {
      const t = await res.text().catch(() => '')
      throw new Error(t || `HTTP ${res.status}`)
    }
    return (await res.json()) as T
  } catch (e: any) {
    if (e.name === 'AbortError') throw new Error('Request timed out — gateway may be down')
    throw e
  } finally {
    clearTimeout(timer)
  }
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

export interface TelegramValidateResponse {
  success: boolean
  message?: string
  /** Bot username returned by getMe, e.g. "mybot" (no @). */
  bot_username?: string
  bot_name?: string
}

/**
 * Validate a Telegram bot token by calling the Telegram Bot API getMe.
 * Returns the bot username so the UI can display "Connected as @botname".
 * Does NOT save anything — call after configureTelegram succeeds.
 */
export const validateTelegramToken = (botToken: string) =>
  post<TelegramValidateResponse>('/api/clawd/channels/telegram/validate', { bot_token: botToken })

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

// ── Telegram User Accounts (MTProto, non-bot) ────────────────

export interface TelegramUserCodeResponse {
  success: boolean
  message?: string
  /** Opaque hash required for the verify step. */
  phone_code_hash?: string
  /** Whether this phone number is already registered on Telegram. */
  is_registered?: boolean
}

export interface TelegramUserVerifyResponse {
  success: boolean
  message?: string
  /** Session string saved for this agent (opaque). */
  session?: string
  /** Whether the account was newly created (vs. existing login). */
  is_new?: boolean
  /** Telegram display name after sign-in. */
  display_name?: string
  /** Telegram username (without @) after sign-in, if set. */
  username?: string
}

export interface TelegramUserStatusResponse {
  success: boolean
  configured: boolean
  /** Telegram user ID, if session exists. */
  user_id?: number
  display_name?: string
  username?: string
  phone?: string
  message?: string
}

export interface TelegramChiefOfStaffStatusResponse {
  success: boolean
  configured: boolean
  display_name?: string
  username?: string
  phone?: string
  message?: string
}

/** Request a Telegram OTP for a phone number to create/link a user account. */
export const requestTelegramUserCode = (phoneNumber: string, agentId?: string) =>
  post<TelegramUserCodeResponse>('/api/clawd/telegram/user/request-code', {
    phone_number: phoneNumber,
    agent_id: agentId,
  })

/** Verify the OTP and sign in (or sign up) to the Telegram user account. */
export const verifyTelegramUserCode = (
  phoneNumber: string,
  code: string,
  phoneCodeHash: string,
  agentId?: string,
) =>
  post<TelegramUserVerifyResponse>('/api/clawd/telegram/user/verify-code', {
    phone_number: phoneNumber,
    code,
    phone_code_hash: phoneCodeHash,
    agent_id: agentId,
  })

/** Complete registration for a brand-new Telegram account (called when is_registered was false). */
export const signUpTelegramUser = (
  phoneNumber: string,
  phoneCodeHash: string,
  firstName: string,
  lastName: string,
  agentId?: string,
) =>
  post<TelegramUserVerifyResponse>('/api/clawd/telegram/user/sign-up', {
    phone_number: phoneNumber,
    phone_code_hash: phoneCodeHash,
    first_name: firstName,
    last_name: lastName,
    agent_id: agentId,
  })

/** Get the Telegram user account status for an agent (or the default account). */
export const getTelegramUserStatus = (agentId?: string) =>
  get<TelegramUserStatusResponse>(
    agentId
      ? `/api/clawd/telegram/user/status?agent_id=${encodeURIComponent(agentId)}`
      : '/api/clawd/telegram/user/status',
  )

/** Get the status of the Knapsack Chief-of-Staff Telegram user account. */
export const getTelegramChiefOfStaffStatus = () =>
  get<TelegramChiefOfStaffStatusResponse>('/api/clawd/telegram/chief-of-staff/status')

/** Trigger automatic creation of the Knapsack Chief-of-Staff Telegram user account. */
export const setupTelegramChiefOfStaff = (phoneNumber: string) =>
  post<TelegramUserCodeResponse>('/api/clawd/telegram/chief-of-staff/setup', { phone_number: phoneNumber })

export interface TelegramProvisionBotResponse {
  success: boolean
  message?: string
  /** Bot API token for the provisioned Chief-of-Staff bot. */
  bot_token?: string
  /** Bot username (without @), if available. */
  bot_username?: string
}

/**
 * Auto-provision the Chief-of-Staff bot token.
 * Returns `success: false` when no pre-configured token exists,
 * in which case the UI should fall back to manual token entry.
 */
export const provisionChiefOfStaffBot = () =>
  post<TelegramProvisionBotResponse>('/api/clawd/telegram/chief-of-staff/provision-bot', {})

// ── Managed Bots (Bot API 9.6) ──────────────────────────────

export interface TelegramManagedBotDeeplinkResponse {
  success: boolean
  deeplink?: string
  message?: string
}

export interface TelegramManagedBotTokenResponse {
  success: boolean
  token?: string
  username?: string
  bot_id?: number
  message?: string
}

export interface TelegramManagedBotStatusResponse {
  success: boolean
  configured: boolean
  username?: string
  display_name?: string
  message?: string
}

/**
 * Generate a Managed Bot creation deeplink (Bot API 9.6).
 * Opens `https://t.me/newbot/{manager}/{suggested}` in Telegram so the user
 * can create a child bot under the manager bot.
 */
export const getTelegramManagedBotDeeplink = (
  managerUsername: string,
  suggestedUsername: string,
  suggestedName?: string,
) =>
  post<TelegramManagedBotDeeplinkResponse>('/api/clawd/telegram/managed-bot/deeplink', {
    manager_username: managerUsername,
    suggested_username: suggestedUsername,
    suggested_name: suggestedName,
  })

/**
 * Retrieve a managed bot's token via the manager bot.
 * Resolves @botUsername → user_id → calls getManagedBotToken.
 * The manager bot must have `can_manage_bots: true`.
 */
export const fetchTelegramManagedBotToken = (
  agentId: string,
  managerToken: string,
  botUsername: string,
) =>
  post<TelegramManagedBotTokenResponse>('/api/clawd/telegram/managed-bot/get-token', {
    agent_id: agentId,
    manager_token: managerToken,
    bot_username: botUsername,
  })

/** Get the per-agent managed bot status from the OpenClaw gateway. */
export const getTelegramManagedBotStatus = (agentId: string) =>
  get<TelegramManagedBotStatusResponse>(
    `/api/clawd/telegram/managed-bot/status?agent_id=${encodeURIComponent(agentId)}`,
  )

// ── Per-Agent Child Bot Provisioning ────────────────────────

export interface AgentBotDeepLinkResponse {
  success: boolean
  deeplink?: string      // tg:// URL — opens native Telegram app
  web_deeplink?: string  // https://t.me/ URL — fallback when app not installed
  message?: string
}

export interface AgentBotProvisionResponse {
  success: boolean
  username?: string
  bot_id?: number
  message?: string
}

export interface AgentBotStatusEntry {
  agent_id: string
  username: string
  configured: boolean
}

/** Build the t.me/newbot/… deep link for creating a child bot. */
export const getAgentBotDeepLink = (suggestedUsername: string, agentName: string) =>
  post<AgentBotDeepLinkResponse>('/api/clawd/telegram/agent-bot/deep-link', {
    suggested_username: suggestedUsername,
    agent_name: agentName,
  })

/**
 * Single-attempt provision: tries getManagedBotToken once.
 * Returns success:false immediately if the child bot hasn't been created yet.
 * The frontend polls this every ~3 s after opening the deep link.
 */
export const provisionAgentBot = (agentId: string, agentName: string, suggestedUsername: string) =>
  post<AgentBotProvisionResponse>('/api/clawd/telegram/agent-bot/provision', {
    agent_id: agentId,
    agent_name: agentName,
    suggested_username: suggestedUsername,
  }, 15_000)

/** Rotate a provisioned bot's token silently (no user action required). */
export const rotateAgentBotToken = (agentId: string) =>
  post<{ success: boolean; message?: string }>('/api/clawd/telegram/agent-bot/rotate', {
    agent_id: agentId,
  })

/** Return provisioning status for all agent bots from openclaw.json. */
export const getAgentBotStatuses = () =>
  get<AgentBotStatusEntry[]>('/api/clawd/telegram/agent-bot/statuses')

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
