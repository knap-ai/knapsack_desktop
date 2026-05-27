import { useCallback, useEffect, useState, useRef } from 'react'
import { open as openExternalUrl } from '@tauri-apps/api/shell'
import { listen } from '@tauri-apps/api/event'

import {
  Typography,
  TypographyWeight,
} from 'src/components/atoms/typography'
import { Dialog } from 'src/components/molecules/Dialog'
import KNAnalytics from 'src/utils/KNAnalytics'

import styles from './styles.module.scss'

const API_BASE = 'http://127.0.0.1:8897'

type Provider = 'knapsack' | 'openai' | 'anthropic' | 'openrouter' | 'gemini'

type ProviderConfig = {
  id: Provider
  name: string
  description: string
  keyPrefix: string
  helpUrl: string
  helpLabel: string
  models: ModelOption[]
  defaultModel: string
}

type ModelOption = {
  id: string
  name: string
  description: string
}

const PROVIDER_CONFIGS: ProviderConfig[] = [
  {
    id: 'knapsack',
    name: 'Knapsack',
    description: 'Powered by Knapsack — no API key needed',
    keyPrefix: '',
    helpUrl: 'https://www.knapsack.ai',
    helpLabel: 'knapsack.ai',
    models: [
      { id: 'anthropic/claude-haiku-4-5', name: 'Standard', description: 'Fast, efficient — great for everyday tasks' },
      { id: 'anthropic/claude-sonnet-4-5', name: 'Plus', description: 'Balanced performance and capability' },
      { id: 'anthropic/claude-opus-4-7', name: 'Premium', description: 'Most powerful — best for complex work' },
    ],
    defaultModel: 'anthropic/claude-haiku-4-5',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-5.5, GPT-5.4, o3',
    keyPrefix: 'sk-',
    helpUrl: 'https://platform.openai.com/api-keys',
    helpLabel: 'platform.openai.com/api-keys',
    models: [
      { id: 'gpt-5.5', name: 'GPT-5.5', description: 'Newest frontier model, best for complex professional work' },
      { id: 'gpt-5.5-pro', name: 'GPT-5.5 Pro', description: 'Extended thinking for the hardest problems' },
      { id: 'gpt-5.4', name: 'GPT-5.4', description: 'Highly capable, great balance of performance and cost' },
      { id: 'o3', name: 'o3 (Reasoning)', description: 'Reasoning model for complex logic' },
      { id: 'gpt-5-mini', name: 'GPT-5 Mini', description: 'Fast and affordable' },
    ],
    defaultModel: 'gpt-5.5',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Claude Opus 4.7, Sonnet 4.6, Haiku 4.5',
    keyPrefix: 'sk-ant-',
    helpUrl: 'https://console.anthropic.com/settings/keys',
    helpLabel: 'console.anthropic.com/settings/keys',
    models: [
      { id: 'claude-opus-4-7', name: 'Claude Opus 4.7', description: 'Latest flagship, best coding and vision' },
      { id: 'claude-opus-4-6', name: 'Claude Opus 4.6', description: 'Previous flagship, excellent for complex tasks' },
      { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6', description: 'Fast and capable, good balance' },
      { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5', description: 'Fastest and most affordable' },
    ],
    defaultModel: 'claude-opus-4-7',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Access many models, including free ones',
    keyPrefix: 'sk-or-',
    helpUrl: 'https://openrouter.ai/keys',
    helpLabel: 'openrouter.ai/keys',
    models: [
      { id: 'openrouter/auto', name: 'Auto (Smart Routing)', description: 'Automatically picks the best model for each request' },
      { id: 'qwen/qwen3-coder-480b-a35b-instruct:free', name: 'Qwen3 Coder 480B (Free)', description: 'Free, best open-source coding model' },
      { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1 (Free)', description: 'Free, top open-source reasoning model' },
      { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B (Free)', description: 'Free, great for everyday questions' },
      { id: 'deepseek/deepseek-v4-pro', name: 'DeepSeek V4 Pro (Paid)', description: 'Paid, SOTA open-source, rivals GPT-5.5 at 10x lower cost' },
      { id: 'deepseek/deepseek-v4-flash', name: 'DeepSeek V4 Flash (Paid)', description: 'Paid, 1M context, fast MoE, excellent for agentic loops' },
    ],
    defaultModel: 'qwen/qwen3-coder-480b-a35b-instruct:free',
  },
  {
    id: 'gemini',
    name: 'Gemini',
    description: 'Gemini 3.1 Pro, 3.5 Flash — sign in with Google',
    keyPrefix: 'AIza',
    helpUrl: 'https://aistudio.google.com/apikey',
    helpLabel: 'aistudio.google.com/apikey',
    models: [
      { id: 'gemini/gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro', description: 'Most intelligent, state-of-the-art reasoning' },
      { id: 'gemini/gemini-3.5-flash', name: 'Gemini 3.5 Flash', description: 'Latest fast multimodal Gemini model' },
      { id: 'gemini/gemini-3-flash-preview', name: 'Gemini 3 Flash', description: 'Fast frontier-class performance' },
      { id: 'gemini/gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite', description: 'Cost-efficient for high-volume tasks' },
      { id: 'gemini/gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'Stable, excellent reasoning and coding' },
    ],
    defaultModel: 'gemini/gemini-3.5-flash',
  },
]

// Extra providers that OpenClaw supports via env vars.
// These don't need model selection — OpenClaw auto-discovers models.
type ExtraProviderConfig = {
  id: string
  name: string
  description: string
  envVar: string
  helpUrl: string
  helpLabel: string
}

const EXTRA_PROVIDER_CONFIGS: ExtraProviderConfig[] = [
  {
    id: 'minimax',
    name: 'MiniMax',
    description: 'M2.5 (SOTA coding + agents), M2.1',
    envVar: 'MINIMAX_API_KEY',
    helpUrl: 'https://platform.minimax.io',
    helpLabel: 'platform.minimax.io',
  },
  {
    id: 'zai',
    name: 'ZAI (GLM)',
    description: 'GLM-5 (745B, SOTA open-source), GLM-4.7',
    envVar: 'ZAI_API_KEY',
    helpUrl: 'https://open.bigmodel.cn',
    helpLabel: 'open.bigmodel.cn',
  },
  {
    id: 'huggingface',
    name: 'Hugging Face',
    description: '200K+ models via Inference API',
    envVar: 'HF_TOKEN',
    helpUrl: 'https://huggingface.co/settings/tokens',
    helpLabel: 'huggingface.co/settings/tokens',
  },
]

type ExtraProviderStatusItem = {
  id: string
  env_var: string
  has_key: boolean
  key_hint?: string
}

type ApiKeyStatusResponse = {
  success: boolean
  has_key: boolean
  active_provider?: string
  model?: string
  has_openai_key?: boolean
  has_anthropic_key?: boolean
  has_openrouter_key?: boolean
  has_gemini_key?: boolean
  has_gemini_cli_key?: boolean
  openai_key_hint?: string
  anthropic_key_hint?: string
  openrouter_key_hint?: string
  gemini_key_hint?: string
  gemini_cli_email?: string
  extra_providers?: ExtraProviderStatusItem[]
  has_knapsack?: boolean
  knapsack_email?: string
  knapsack_model?: string
}

type ValidationState = 'idle' | 'validating' | 'valid' | 'invalid'

type ProviderSignInDialogProps = {
  isOpen: boolean
  handleClose: () => void
  initialProvider?: Provider
  userEmail?: string
}

export const ProviderSignInDialog = ({
  isOpen,
  handleClose,
  initialProvider,
  userEmail,
}: ProviderSignInDialogProps) => {
  const [selectedProvider, setSelectedProvider] = useState<Provider>(initialProvider ?? 'knapsack')
  const [apiKey, setApiKey] = useState('')
  const [selectedModel, setSelectedModel] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [keyStatus, setKeyStatus] = useState<ApiKeyStatusResponse | null>(null)
  const [validation, setValidation] = useState<ValidationState>('idle')
  const [validationMsg, setValidationMsg] = useState('')
  const [oauthPending, setOauthPending] = useState(false)
  const [geminiOAuthPending, setGeminiOAuthPending] = useState(false)
  const geminiOAuthPendingRef = useRef(false)
  const oauthPollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const oauthTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const geminiUnlistenRef = useRef<(() => void) | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const validateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Extra provider inline editing state
  const [editingExtraId, setEditingExtraId] = useState<string | null>(null)
  const [extraKey, setExtraKey] = useState('')
  const [extraValidation, setExtraValidation] = useState<ValidationState>('idle')
  const [extraValidationMsg, setExtraValidationMsg] = useState('')
  const [extraSaving, setExtraSaving] = useState(false)
  const [extraSuccess, setExtraSuccess] = useState('')
  const [extraError, setExtraError] = useState('')
  const extraValidateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const providerConfig = PROVIDER_CONFIGS.find(p => p.id === selectedProvider)!

  // Get the masked key hint for the current provider
  const getKeyHint = (provider: Provider): string | undefined => {
    if (!keyStatus) return undefined
    if (provider === 'openai') return keyStatus.openai_key_hint
    if (provider === 'anthropic') return keyStatus.anthropic_key_hint
    if (provider === 'openrouter') return keyStatus.openrouter_key_hint
    if (provider === 'gemini') return keyStatus.gemini_key_hint
    return undefined
  }

  const fetchKeyStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/clawd/service/api-key-status`)
      const data = await res.json()
      setKeyStatus(data)
      return data as ApiKeyStatusResponse
    } catch {
      return null
    }
  }, [])

  // Validate API key with debounce
  const validateKey = useCallback(async (key: string, provider: string) => {
    if (!key.trim()) {
      setValidation('idle')
      setValidationMsg('')
      return
    }

    setValidation('validating')
    setValidationMsg('')

    try {
      const res = await fetch(`${API_BASE}/api/clawd/service/validate-api-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: key.trim(), provider }),
      })
      const data = await res.json()

      if (data.valid) {
        setValidation('valid')
        setValidationMsg('API key is valid')
      } else {
        setValidation('invalid')
        setValidationMsg(data.message || 'Invalid API key')
      }
    } catch {
      setValidation('idle')
      setValidationMsg('')
    }
  }, [])

  // Debounced validation when key changes
  const handleKeyChange = useCallback((value: string) => {
    setApiKey(value)
    setError('')
    setValidation('idle')
    setValidationMsg('')

    if (validateTimerRef.current) {
      clearTimeout(validateTimerRef.current)
    }

    if (value.trim().length >= 10) {
      validateTimerRef.current = setTimeout(() => {
        validateKey(value, selectedProvider)
      }, 800)
    }
  }, [selectedProvider, validateKey])

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (validateTimerRef.current) clearTimeout(validateTimerRef.current)
      if (extraValidateTimerRef.current) clearTimeout(extraValidateTimerRef.current)
      if (oauthPollRef.current) clearInterval(oauthPollRef.current)
      if (oauthTimeoutRef.current) clearTimeout(oauthTimeoutRef.current)
      if (geminiUnlistenRef.current) { geminiUnlistenRef.current(); geminiUnlistenRef.current = null }
    }
  }, [])

  const handleOAuthLogin = useCallback(async (provider: Provider) => {
    if (oauthPollRef.current) clearInterval(oauthPollRef.current)
    if (oauthTimeoutRef.current) clearTimeout(oauthTimeoutRef.current)

    setOauthPending(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch(`${API_BASE}/api/clawd/service/oauth-start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      })
      const data = await res.json()

      if (!data.url) {
        setError(data.error || 'Failed to start OAuth flow.')
        setOauthPending(false)
        return
      }

      await openExternalUrl(data.url)
      KNAnalytics.trackEvent('oauth_started', { provider, app_version: KNAnalytics.APP_VERSION })

      // Poll api-key-status until the key appears (max 5 min)
      oauthPollRef.current = setInterval(async () => {
        try {
          const statusRes = await fetch(`${API_BASE}/api/clawd/service/api-key-status`)
          const statusData: ApiKeyStatusResponse = await statusRes.json()
          const connected =
            provider === 'openrouter' ? statusData.has_openrouter_key :
            provider === 'openai' ? statusData.has_openai_key :
            provider === 'anthropic' ? statusData.has_anthropic_key : false

          if (connected) {
            clearInterval(oauthPollRef.current!)
            clearTimeout(oauthTimeoutRef.current!)
            oauthPollRef.current = null
            oauthTimeoutRef.current = null
            setOauthPending(false)
            setSuccess(`${PROVIDER_CONFIGS.find(p => p.id === provider)?.name} connected successfully!`)
            KNAnalytics.trackEvent('oauth_completed', { provider, app_version: KNAnalytics.APP_VERSION })
            await fetchKeyStatus()
            setTimeout(() => handleClose(), 1500)
          }
        } catch { /* ignore transient errors */ }
      }, 1500)

      oauthTimeoutRef.current = setTimeout(() => {
        clearInterval(oauthPollRef.current!)
        oauthPollRef.current = null
        oauthTimeoutRef.current = null
        setOauthPending(false)
        setError('OAuth timed out. Please try again.')
      }, 300_000)
    } catch (e: any) {
      setOauthPending(false)
      setError(e?.message || 'Failed to start OAuth flow.')
    }
  }, [fetchKeyStatus, handleClose])

  const handleGeminiOAuth = useCallback(async () => {
    if (geminiUnlistenRef.current) { geminiUnlistenRef.current(); geminiUnlistenRef.current = null }

    setGeminiOAuthPending(true)
    geminiOAuthPendingRef.current = true
    setError('')
    setSuccess('')

    try {
      const res = await fetch(`${API_BASE}/api/clawd/service/oauth-start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'google-gemini' }),
      })
      const data = await res.json()
      if (!data.url) {
        setError(data.error || 'Failed to start Google sign-in.')
        setGeminiOAuthPending(false)
        geminiOAuthPendingRef.current = false
        return
      }

      await openExternalUrl(data.url)
      KNAnalytics.trackEvent('oauth_started', { provider: 'google-gemini', app_version: KNAnalytics.APP_VERSION })

      // Listen for the signin_success event emitted by the existing Google callback handler
      const unlisten = await listen<{ code: string; raw_scopes: string }>('signin_success', async (event) => {
        if (!geminiOAuthPendingRef.current) return
        const { code, raw_scopes } = event.payload
        if (!raw_scopes.includes('cloud-platform')) return

        geminiOAuthPendingRef.current = false
        if (geminiUnlistenRef.current) { geminiUnlistenRef.current(); geminiUnlistenRef.current = null }

        try {
          const connectRes = await fetch(`${API_BASE}/api/clawd/service/gemini-connect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code }),
          })
          const connectData = await connectRes.json()
          if (connectData.success) {
            KNAnalytics.trackEvent('oauth_completed', { provider: 'google-gemini', app_version: KNAnalytics.APP_VERSION })
            setGeminiOAuthPending(false)
            const emailLabel = connectData.email ? ` (${connectData.email})` : ''
            setSuccess(`Google account${emailLabel} connected for Gemini!`)
            await fetchKeyStatus()
            setTimeout(() => handleClose(), 1500)
          } else {
            setGeminiOAuthPending(false)
            setError(connectData.error || 'Failed to complete Gemini sign-in.')
          }
        } catch (e: any) {
          setGeminiOAuthPending(false)
          setError(e?.message || 'Failed to complete Gemini sign-in.')
        }
      })
      geminiUnlistenRef.current = unlisten

      // 5-minute hard timeout
      oauthTimeoutRef.current = setTimeout(() => {
        if (!geminiOAuthPendingRef.current) return
        geminiOAuthPendingRef.current = false
        if (geminiUnlistenRef.current) { geminiUnlistenRef.current(); geminiUnlistenRef.current = null }
        setGeminiOAuthPending(false)
        setError('Sign-in timed out. Please try again.')
      }, 300_000)
    } catch (e: any) {
      setGeminiOAuthPending(false)
      geminiOAuthPendingRef.current = false
      setError(e?.message || 'Failed to start Google sign-in.')
    }
  }, [fetchKeyStatus, handleClose])

  // Fetch current status when dialog opens
  useEffect(() => {
    if (!isOpen) {
      // Cancel any in-flight OAuth when dialog closes
      if (oauthPollRef.current) { clearInterval(oauthPollRef.current); oauthPollRef.current = null }
      if (oauthTimeoutRef.current) { clearTimeout(oauthTimeoutRef.current); oauthTimeoutRef.current = null }
      if (geminiUnlistenRef.current) { geminiUnlistenRef.current(); geminiUnlistenRef.current = null }
      setOauthPending(false)
      setGeminiOAuthPending(false)
      geminiOAuthPendingRef.current = false
      return
    }
    setApiKey('')
    setError('')
    setSuccess('')
    setValidation('idle')
    setValidationMsg('')
    setOauthPending(false)
    setEditingExtraId(null)
    setExtraKey('')
    setExtraSuccess('')
    setExtraError('')

    fetchKeyStatus().then(data => {
      if (!data) {
        setSelectedModel(providerConfig.defaultModel)
        return
      }
      if (initialProvider) {
        setSelectedProvider(initialProvider)
        const config = PROVIDER_CONFIGS.find(p => p.id === initialProvider)!
        setSelectedModel(config.defaultModel)
      } else if (data.active_provider === 'google-gemini-cli') {
        setSelectedProvider('gemini')
        setSelectedModel('gemini/gemini-2.5-pro')
      } else if (data.active_provider === 'knapsack') {
        setSelectedProvider('knapsack')
        const config = PROVIDER_CONFIGS.find(p => p.id === 'knapsack')!
        setSelectedModel(data.knapsack_model || config.defaultModel)
      } else if (data.active_provider === 'openai' || data.active_provider === 'anthropic' || data.active_provider === 'openrouter' || data.active_provider === 'gemini') {
        setSelectedProvider(data.active_provider as Provider)
        const config = PROVIDER_CONFIGS.find(p => p.id === data.active_provider)!
        setSelectedModel(data.model || config.defaultModel)
      } else {
        setSelectedModel(providerConfig.defaultModel)
      }
    })
  }, [isOpen, initialProvider])

  // Update default model when provider changes
  useEffect(() => {
    const config = PROVIDER_CONFIGS.find(p => p.id === selectedProvider)!
    setSelectedModel(config.defaultModel)
    setApiKey('')
    setError('')
    setSuccess('')
    setValidation('idle')
    setValidationMsg('')
    if (oauthPollRef.current) { clearInterval(oauthPollRef.current); oauthPollRef.current = null }
    if (oauthTimeoutRef.current) { clearTimeout(oauthTimeoutRef.current); oauthTimeoutRef.current = null }
    if (geminiUnlistenRef.current) { geminiUnlistenRef.current(); geminiUnlistenRef.current = null }
    setOauthPending(false)
    setGeminiOAuthPending(false)
    geminiOAuthPendingRef.current = false
  }, [selectedProvider])

  const handleActivateKnapsack = useCallback(async () => {
    const email = userEmail || keyStatus?.knapsack_email || ''
    if (!email) {
      setError('Sign in to Knapsack first to use this option.')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch(`${API_BASE}/api/clawd/service/set-api-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'knapsack', key: email, model: selectedModel }),
      })
      const data = await res.json()
      if (data.success) {
        KNAnalytics.trackEvent('knapsack_provider_activated', { model: selectedModel, app_version: KNAnalytics.APP_VERSION })
        setSuccess('Knapsack AI activated!')
        await fetchKeyStatus()
        setTimeout(() => handleClose(), 1200)
      } else {
        setError(data.message || 'Failed to activate Knapsack.')
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to activate. Please try again.')
    } finally {
      setSaving(false)
    }
  }, [userEmail, keyStatus, selectedModel, fetchKeyStatus, handleClose])

  const handleSave = useCallback(async () => {
    if (!apiKey.trim()) {
      setError('Please enter your API key.')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    // Validate first if not already validated
    if (validation !== 'valid') {
      setValidation('validating')
      try {
        const valRes = await fetch(`${API_BASE}/api/clawd/service/validate-api-key`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: apiKey.trim(), provider: selectedProvider }),
        })
        const valData = await valRes.json()
        if (!valData.valid) {
          setValidation('invalid')
          setValidationMsg(valData.message || 'Invalid API key')
          setError(valData.message || 'Invalid API key. Please check and try again.')
          setSaving(false)
          return
        }
        setValidation('valid')
      } catch {
        // If validation endpoint is unreachable, proceed anyway
      }
    }

    try {
      const res = await fetch(`${API_BASE}/api/clawd/service/set-api-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: apiKey.trim(),
          provider: selectedProvider,
          model: selectedModel || undefined,
        }),
      })

      const data = await res.json()

      if (data.success) {
        KNAnalytics.trackEvent('api_key_saved', { provider: selectedProvider, model: selectedModel, app_version: KNAnalytics.APP_VERSION })
        setSuccess(`${providerConfig.name} connected successfully!`)
        setApiKey('')
        await fetchKeyStatus()
        // Auto-close after short delay
        setTimeout(() => handleClose(), 1200)
      } else {
        KNAnalytics.trackEvent('api_key_save_failed', { provider: selectedProvider, error: data.message, app_version: KNAnalytics.APP_VERSION })
        setError(data.message || 'Failed to save API key.')
      }
    } catch (e: any) {
      KNAnalytics.trackEvent('api_key_save_failed', { provider: selectedProvider, error: e?.message, app_version: KNAnalytics.APP_VERSION })
      setError(e?.message || 'Failed to connect. Please try again.')
    } finally {
      setSaving(false)
    }
  }, [apiKey, selectedProvider, selectedModel, providerConfig, handleClose, validation, fetchKeyStatus])

  const hasExistingKey = (provider: Provider): boolean => {
    if (!keyStatus) return false
    if (provider === 'knapsack') return !!keyStatus.has_knapsack
    if (provider === 'openai') return !!keyStatus.has_openai_key
    if (provider === 'anthropic') return !!keyStatus.has_anthropic_key
    if (provider === 'openrouter') return !!keyStatus.has_openrouter_key
    if (provider === 'gemini') return !!keyStatus.has_gemini_key || !!keyStatus.has_gemini_cli_key
    return false
  }

  const isActiveProvider = (provider: Provider): boolean => {
    if (provider === 'gemini') {
      return keyStatus?.active_provider === 'gemini' || keyStatus?.active_provider === 'google-gemini-cli'
    }
    return keyStatus?.active_provider === provider
  }

  const getExtraProviderStatus = (envVar: string): ExtraProviderStatusItem | undefined => {
    return keyStatus?.extra_providers?.find(ep => ep.env_var === envVar)
  }

  // Extra provider key handlers
  const handleExtraKeyChange = useCallback((value: string, providerId: string) => {
    setExtraKey(value)
    setExtraError('')
    setExtraValidation('idle')
    setExtraValidationMsg('')

    if (extraValidateTimerRef.current) {
      clearTimeout(extraValidateTimerRef.current)
    }

    if (value.trim().length >= 10) {
      extraValidateTimerRef.current = setTimeout(async () => {
        setExtraValidation('validating')
        try {
          const res = await fetch(`${API_BASE}/api/clawd/service/validate-api-key`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: value.trim(), provider: providerId }),
          })
          const data = await res.json()
          if (data.valid) {
            setExtraValidation('valid')
            setExtraValidationMsg('API key is valid')
          } else {
            setExtraValidation('invalid')
            setExtraValidationMsg(data.message || 'Invalid API key')
          }
        } catch {
          setExtraValidation('idle')
        }
      }, 800)
    }
  }, [])

  const handleExtraSave = useCallback(async (config: ExtraProviderConfig) => {
    if (!extraKey.trim()) return

    setExtraSaving(true)
    setExtraError('')
    setExtraSuccess('')

    try {
      const res = await fetch(`${API_BASE}/api/clawd/service/set-api-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: extraKey.trim(),
          provider: config.id,
          env_var: config.envVar,
        }),
      })
      const data = await res.json()

      if (data.success) {
        KNAnalytics.trackEvent('api_key_saved', { provider: config.id, extra: true, app_version: KNAnalytics.APP_VERSION })
        setExtraSuccess(`${config.name} connected!`)
        setExtraKey('')
        setEditingExtraId(null)
        await fetchKeyStatus()
        setTimeout(() => setExtraSuccess(''), 3000)
      } else {
        KNAnalytics.trackEvent('api_key_save_failed', { provider: config.id, extra: true, error: data.message, app_version: KNAnalytics.APP_VERSION })
        setExtraError(data.message || 'Failed to save.')
      }
    } catch (e: any) {
      KNAnalytics.trackEvent('api_key_save_failed', { provider: config.id, extra: true, error: e?.message, app_version: KNAnalytics.APP_VERSION })
      setExtraError(e?.message || 'Failed to connect.')
    } finally {
      setExtraSaving(false)
    }
  }, [extraKey, fetchKeyStatus])

  const handleExtraRemove = useCallback(async (config: ExtraProviderConfig) => {
    try {
      const res = await fetch(`${API_BASE}/api/clawd/service/delete-extra-provider-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ env_var: config.envVar }),
      })
      const data = await res.json()
      if (data.success) {
        await fetchKeyStatus()
      }
    } catch { /* ignore */ }
  }, [fetchKeyStatus])

  const keyHint = getKeyHint(selectedProvider)

  return (
    <Dialog
      onClose={handleClose}
      isOpen={isOpen}
      dismissable
      className="flex items-center justify-center my-[88px] h-[100vh]"
    >
      <div
        ref={containerRef}
        className={styles.providerSignInContainer}
      >
        <div className={styles.providerSignInHeader}>
          <Typography weight={TypographyWeight.medium} className="text-lg">
            Sign in with AI Provider
          </Typography>
          <p className={styles.providerSignInSubtitle}>
            Connect your AI provider accounts. API keys are stored locally and never shared.
          </p>
        </div>

        <div className={styles.providerTabs}>
          {PROVIDER_CONFIGS.map(config => (
            <button
              key={config.id}
              className={`${styles.providerTab} ${selectedProvider === config.id ? styles.providerTabActive : ''}`}
              onClick={() => setSelectedProvider(config.id)}
              disabled={saving}
            >
              <div className={styles.providerTabIcon}>
                {config.id === 'knapsack' && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="6" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <path d="M8 6V4a4 4 0 018 0v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="12" cy="13" r="2" fill="currentColor"/>
                  </svg>
                )}
                {config.id === 'openai' && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364l2.0201-1.1638a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.4091-.6813zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0974-2.3616l2.603-1.5018 2.6032 1.5018v3.0036l-2.6032 1.5018-2.603-1.5018z" fill="currentColor"/>
                  </svg>
                )}
                {config.id === 'anthropic' && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.827 3.52h3.603L24 20.48h-3.603l-6.57-16.96zm-7.258 0h3.767L16.906 20.48h-3.674l-1.47-4.004H5.69l-1.457 4.004H.673L6.57 3.52zm4.132 9.96L8.453 7.687 6.205 13.48h4.496z" fill="currentColor"/>
                  </svg>
                )}
                {config.id === 'openrouter' && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none"/>
                    <path d="M10 7h4M7 10v4M17 10v4M10 17h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                )}
                {config.id === 'gemini' && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" fill="currentColor" opacity="0.3"/>
                    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 100-16 8 8 0 000 16zm0-3l-4-4h2.5V7h3v6H16l-4 4z" fill="currentColor"/>
                  </svg>
                )}
              </div>
              <div className={styles.providerTabContent}>
                <span className={styles.providerTabName}>{config.name}</span>
                <span className={styles.providerTabDesc}>{config.description}</span>
              </div>
              {hasExistingKey(config.id) && (
                <span className={`${styles.providerTabBadge} ${isActiveProvider(config.id) ? styles.providerTabBadgeActive : ''}`}>
                  {isActiveProvider(config.id) ? 'Active' : 'Connected'}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className={styles.providerSignInForm}>
          {selectedProvider === 'knapsack' && (
            <div style={{ padding: '20px 24px' }}>
              <div style={{ marginBottom: 16, padding: '12px 16px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                {(userEmail || keyStatus?.knapsack_email) ? (
                  <p style={{ margin: 0, fontSize: 13, color: '#334155' }}>
                    Signed in as <strong>{userEmail || keyStatus?.knapsack_email}</strong>
                  </p>
                ) : (
                  <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
                    Sign in to Knapsack to use this option.
                  </p>
                )}
              </div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 8 }}>
                Model tier
              </label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {providerConfig.models.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedModel(m.id)}
                    disabled={saving}
                    style={{
                      flex: 1,
                      padding: '10px 8px',
                      border: selectedModel === m.id ? '2px solid #c54841' : '2px solid #e2e8f0',
                      borderRadius: 8,
                      background: selectedModel === m.id ? '#fff5f5' : 'white',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 600, color: selectedModel === m.id ? '#c54841' : '#374151' }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{m.description}</div>
                  </button>
                ))}
              </div>
              {error && <p style={{ margin: '0 0 12px', fontSize: 13, color: '#ef4444' }}>{error}</p>}
              {success && <p style={{ margin: '0 0 12px', fontSize: 13, color: '#4caf50' }}>{success}</p>}
              <button
                style={{
                  width: '100%',
                  padding: '10px 0',
                  background: (userEmail || keyStatus?.knapsack_email) ? '#c54841' : '#94a3b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: (userEmail || keyStatus?.knapsack_email) ? 'pointer' : 'not-allowed',
                }}
                onClick={handleActivateKnapsack}
                disabled={saving || !(userEmail || keyStatus?.knapsack_email)}
              >
                {saving ? 'Activating…' : isActiveProvider('knapsack') ? 'Update model' : 'Activate Knapsack'}
              </button>
              <p style={{ margin: '12px 0 0', fontSize: 12, color: '#64748b', textAlign: 'center' }}>
                Need credits?{' '}
                <a
                  href="https://studio.knapsack.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#c54841', textDecoration: 'underline' }}
                >
                  Sign up at studio.knapsack.ai
                </a>
              </p>
            </div>
          )}
          {selectedProvider === 'openrouter' && (
            <div className={styles.oauthSection}>
              <button
                className={styles.oauthButton}
                onClick={() => handleOAuthLogin('openrouter')}
                disabled={saving || oauthPending}
              >
                {oauthPending ? (
                  <><span className={styles.oauthSpinner} /> Waiting for authorization…</>
                ) : (
                  'Sign in with OpenRouter'
                )}
              </button>
              <div className={styles.oauthDivider}>
                <span>or paste your API key below</span>
              </div>
            </div>
          )}

          {selectedProvider === 'gemini' && (
            <div className={styles.oauthSection}>
              <button
                className={styles.oauthButton}
                onClick={handleGeminiOAuth}
                disabled={saving || geminiOAuthPending}
              >
                {geminiOAuthPending ? (
                  <><span className={styles.oauthSpinner} /> Waiting for Google sign-in…</>
                ) : keyStatus?.has_gemini_cli_key ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#4285F4"/><path d="M12 11.5v1h4.9c-.2 1.1-.9 2-1.9 2.6l1.5 1.2c.9-.8 1.5-2.1 1.5-3.7 0-.4 0-.7-.1-1H12z" fill="white"/><path d="M7.5 14.1l1.7-1.3c-.3-.8-.3-1.7 0-2.5L7.5 9c-.7 1.5-.7 3.2 0 5.1z" fill="white"/><path d="M12 7c1.3 0 2.5.5 3.4 1.3L17 6.7C15.6 5.4 13.9 4.5 12 4.5c-2.8 0-5.2 1.6-6.5 4L7.1 10c.8-1.7 2.6-3 4.9-3z" fill="white"/><path d="M12 17c-2.2 0-4.1-1.2-5-3l-1.6 1.2C6.7 17.4 9.2 19 12 19c1.9 0 3.7-.7 5-1.9l-1.5-1.2c-.9.7-2.1 1.1-3.5 1.1z" fill="white"/></svg>
                    Sign in with a different Google account
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#4285F4"/><path d="M12 11.5v1h4.9c-.2 1.1-.9 2-1.9 2.6l1.5 1.2c.9-.8 1.5-2.1 1.5-3.7 0-.4 0-.7-.1-1H12z" fill="white"/><path d="M7.5 14.1l1.7-1.3c-.3-.8-.3-1.7 0-2.5L7.5 9c-.7 1.5-.7 3.2 0 5.1z" fill="white"/><path d="M12 7c1.3 0 2.5.5 3.4 1.3L17 6.7C15.6 5.4 13.9 4.5 12 4.5c-2.8 0-5.2 1.6-6.5 4L7.1 10c.8-1.7 2.6-3 4.9-3z" fill="white"/><path d="M12 17c-2.2 0-4.1-1.2-5-3l-1.6 1.2C6.7 17.4 9.2 19 12 19c1.9 0 3.7-.7 5-1.9l-1.5-1.2c-.9.7-2.1 1.1-3.5 1.1z" fill="white"/></svg>
                    Sign in with Google
                  </>
                )}
              </button>
              {keyStatus?.gemini_cli_email && (
                <p style={{ margin: '6px 0 0', fontSize: 12, color: '#64748b', textAlign: 'center' }}>
                  Connected as {keyStatus.gemini_cli_email}
                </p>
              )}
              <div className={styles.oauthDivider}>
                <span>or use a Gemini API key</span>
              </div>
            </div>
          )}

          {selectedProvider !== 'knapsack' && <label className={styles.formLabel}>
            {providerConfig.name} API Key
          </label>}
          {selectedProvider !== 'knapsack' && <div className={styles.inputWrapper}>
            <input
              type="password"
              value={apiKey}
              onChange={e => handleKeyChange(e.target.value)}
              placeholder={keyHint || `${providerConfig.keyPrefix}...`}
              disabled={saving}
              className={`${styles.formInput} ${validation === 'valid' ? styles.formInputValid : ''} ${validation === 'invalid' ? styles.formInputInvalid : ''}`}
              onKeyDown={e => { if (e.key === 'Enter') handleSave() }}
            />
            <div className={styles.validationIcon}>
              {validation === 'validating' && (
                <span className={styles.spinner} title="Validating..." />
              )}
              {validation === 'valid' && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={styles.checkIcon}>
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="#4caf50"/>
                </svg>
              )}
              {validation === 'invalid' && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={styles.invalidIcon}>
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="#f44336"/>
                </svg>
              )}
            </div>
          </div>}
          {selectedProvider !== 'knapsack' && validationMsg && validation === 'valid' && (
            <p className={styles.validationSuccess}>{validationMsg}</p>
          )}
          {selectedProvider !== 'knapsack' && validationMsg && validation === 'invalid' && (
            <p className={styles.validationError}>{validationMsg}</p>
          )}

          {selectedProvider !== 'knapsack' && <label className={styles.formLabel}>Model</label>}
          {selectedProvider !== 'knapsack' && <div className={styles.modelSelector}>
            {providerConfig.models.map(model => (
              <button
                key={model.id}
                className={`${styles.modelOption} ${selectedModel === model.id ? styles.modelOptionSelected : ''}`}
                onClick={() => setSelectedModel(model.id)}
                disabled={saving}
              >
                <span className={`${styles.modelRadio} ${selectedModel === model.id ? styles.modelRadioSelected : ''}`} />
                <span className={styles.modelInfo}>
                  <span className={styles.modelName}>{model.name}</span>
                  <span className={styles.modelDesc}>{model.description}</span>
                </span>
              </button>
            ))}
          </div>}

          {selectedProvider !== 'knapsack' && error && (
            <p className={styles.errorMessage}>{error}</p>
          )}

          {selectedProvider !== 'knapsack' && success && (
            <p className={styles.successMessage}>{success}</p>
          )}

          {selectedProvider !== 'knapsack' && <button
            className={styles.saveButton}
            onClick={handleSave}
            disabled={saving || !apiKey.trim()}
          >
            {saving ? 'Connecting...' : `Sign in with ${providerConfig.name}`}
          </button>}

          {selectedProvider !== 'knapsack' && <p className={styles.helpText}>
            Get your API key at{' '}
            <a
              href={providerConfig.helpUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {providerConfig.helpLabel}
            </a>
          </p>}
        </div>

        {/* More Providers section */}
        <div className={styles.extraProvidersSection}>
          <div className={styles.extraProvidersHeader}>
            <Typography weight={TypographyWeight.medium} className="text-sm">
              More Providers
            </Typography>
            <span className={styles.extraProvidersSubtitle}>
              Models auto-selected by OpenClaw
            </span>
          </div>

          {extraSuccess && (
            <p className={styles.successMessage} style={{ margin: '0 24px 8px' }}>{extraSuccess}</p>
          )}

          <div className={styles.extraProvidersList}>
            {EXTRA_PROVIDER_CONFIGS.map(config => {
              const status = getExtraProviderStatus(config.envVar)
              const isEditing = editingExtraId === config.id
              const hasKey = status?.has_key ?? false

              return (
                <div key={config.id} className={styles.extraProviderItem}>
                  <div className={styles.extraProviderRow}>
                    <div className={styles.extraProviderInfo}>
                      <span className={styles.extraProviderName}>{config.name}</span>
                      <span className={styles.extraProviderDesc}>{config.description}</span>
                    </div>
                    <div className={styles.extraProviderActions}>
                      {hasKey && (
                        <span className={styles.providerTabBadge} style={{ marginRight: 8 }}>
                          Connected
                        </span>
                      )}
                      {hasKey && !isEditing && (
                        <button
                          className={styles.extraProviderLink}
                          onClick={() => handleExtraRemove(config)}
                        >
                          Remove
                        </button>
                      )}
                      {!isEditing && (
                        <button
                          className={styles.extraProviderLink}
                          onClick={() => {
                            setEditingExtraId(config.id)
                            setExtraKey('')
                            setExtraValidation('idle')
                            setExtraValidationMsg('')
                            setExtraError('')
                          }}
                        >
                          {hasKey ? 'Change' : 'Add key'}
                        </button>
                      )}
                      {isEditing && (
                        <button
                          className={styles.extraProviderLink}
                          onClick={() => setEditingExtraId(null)}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>

                  {isEditing && (
                    <div className={styles.extraProviderForm}>
                      <div className={styles.inputWrapper}>
                        <input
                          type="password"
                          value={extraKey}
                          onChange={e => handleExtraKeyChange(e.target.value, config.id)}
                          placeholder={status?.key_hint || 'Paste your API key...'}
                          disabled={extraSaving}
                          className={`${styles.formInput} ${extraValidation === 'valid' ? styles.formInputValid : ''} ${extraValidation === 'invalid' ? styles.formInputInvalid : ''}`}
                          onKeyDown={e => { if (e.key === 'Enter') handleExtraSave(config) }}
                          autoFocus
                        />
                        <div className={styles.validationIcon}>
                          {extraValidation === 'validating' && <span className={styles.spinner} />}
                          {extraValidation === 'valid' && (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={styles.checkIcon}>
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="#4caf50"/>
                            </svg>
                          )}
                          {extraValidation === 'invalid' && (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={styles.invalidIcon}>
                              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="#f44336"/>
                            </svg>
                          )}
                        </div>
                      </div>
                      {extraValidationMsg && extraValidation === 'valid' && (
                        <p className={styles.validationSuccess}>{extraValidationMsg}</p>
                      )}
                      {extraValidationMsg && extraValidation === 'invalid' && (
                        <p className={styles.validationError}>{extraValidationMsg}</p>
                      )}
                      {extraError && <p className={styles.validationError}>{extraError}</p>}
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <button
                          className={styles.saveButton}
                          style={{ flex: 1, marginBottom: 0 }}
                          onClick={() => handleExtraSave(config)}
                          disabled={extraSaving || !extraKey.trim()}
                        >
                          {extraSaving ? 'Saving...' : `Connect ${config.name}`}
                        </button>
                      </div>
                      <p className={styles.helpText} style={{ marginTop: 8 }}>
                        Get your key at{' '}
                        <a href={config.helpUrl} target="_blank" rel="noopener noreferrer">
                          {config.helpLabel}
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </Dialog>
  )
}
