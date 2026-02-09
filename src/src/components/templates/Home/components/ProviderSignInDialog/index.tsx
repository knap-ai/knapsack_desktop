import { useCallback, useEffect, useState, useRef } from 'react'

import {
  Typography,
  TypographyWeight,
} from 'src/components/atoms/typography'
import { Dialog } from 'src/components/molecules/Dialog'

import styles from './styles.module.scss'

const API_BASE = 'http://localhost:8897'

type Provider = 'openai' | 'anthropic'

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
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-5.2, GPT-4o, o3',
    keyPrefix: 'sk-',
    helpUrl: 'https://platform.openai.com/api-keys',
    helpLabel: 'platform.openai.com/api-keys',
    models: [
      { id: 'gpt-5.2', name: 'GPT-5.2', description: 'Most intelligent, best for complex tasks' },
      { id: 'gpt-5.2-pro', name: 'GPT-5.2 Pro', description: 'Extended thinking for harder problems' },
      { id: 'gpt-4o', name: 'GPT-4o', description: 'Fast and capable, good for most tasks' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Fastest and most affordable' },
      { id: 'o3', name: 'o3 (Reasoning)', description: 'Reasoning model for complex logic' },
      { id: 'o3-mini', name: 'o3 Mini', description: 'Fast reasoning model' },
    ],
    defaultModel: 'gpt-4o',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Claude Opus 4.6, Sonnet 4.5, Haiku 4.5',
    keyPrefix: 'sk-ant-',
    helpUrl: 'https://console.anthropic.com/settings/keys',
    helpLabel: 'console.anthropic.com/settings/keys',
    models: [
      { id: 'claude-opus-4-6', name: 'Claude Opus 4.6', description: 'Most intelligent, best for complex tasks' },
      { id: 'claude-sonnet-4-5-20250929', name: 'Claude Sonnet 4.5', description: 'Fast and capable, good balance' },
      { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5', description: 'Fastest and most affordable' },
    ],
    defaultModel: 'claude-sonnet-4-5-20250929',
  },
]

type ApiKeyStatusResponse = {
  success: boolean
  has_key: boolean
  active_provider?: string
  model?: string
  has_openai_key?: boolean
  has_anthropic_key?: boolean
}

type ProviderSignInDialogProps = {
  isOpen: boolean
  handleClose: () => void
  initialProvider?: Provider
}

export const ProviderSignInDialog = ({
  isOpen,
  handleClose,
  initialProvider,
}: ProviderSignInDialogProps) => {
  const [selectedProvider, setSelectedProvider] = useState<Provider>(initialProvider ?? 'openai')
  const [apiKey, setApiKey] = useState('')
  const [selectedModel, setSelectedModel] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [keyStatus, setKeyStatus] = useState<ApiKeyStatusResponse | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const providerConfig = PROVIDER_CONFIGS.find(p => p.id === selectedProvider)!

  // Fetch current status when dialog opens
  useEffect(() => {
    if (!isOpen) return
    setApiKey('')
    setError('')
    setSuccess('')

    fetch(`${API_BASE}/api/clawd/service/api-key-status`)
      .then(r => r.json())
      .then((data: ApiKeyStatusResponse) => {
        setKeyStatus(data)
        if (initialProvider) {
          setSelectedProvider(initialProvider)
          const config = PROVIDER_CONFIGS.find(p => p.id === initialProvider)!
          setSelectedModel(config.defaultModel)
        } else if (data.active_provider === 'openai' || data.active_provider === 'anthropic') {
          setSelectedProvider(data.active_provider as Provider)
          const config = PROVIDER_CONFIGS.find(p => p.id === data.active_provider)!
          setSelectedModel(data.model || config.defaultModel)
        } else {
          setSelectedModel(providerConfig.defaultModel)
        }
      })
      .catch(() => {
        setSelectedModel(providerConfig.defaultModel)
      })
  }, [isOpen, initialProvider])

  // Update default model when provider changes
  useEffect(() => {
    const config = PROVIDER_CONFIGS.find(p => p.id === selectedProvider)!
    setSelectedModel(config.defaultModel)
    setApiKey('')
    setError('')
    setSuccess('')
  }, [selectedProvider])

  const handleSave = useCallback(async () => {
    if (!apiKey.trim()) {
      setError('Please enter your API key.')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

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
        setSuccess(`${providerConfig.name} connected successfully!`)
        setApiKey('')
        // Refresh status
        try {
          const statusRes = await fetch(`${API_BASE}/api/clawd/service/api-key-status`)
          const statusData = await statusRes.json()
          setKeyStatus(statusData)
        } catch { /* ignore */ }
        // Auto-close after short delay
        setTimeout(() => handleClose(), 1200)
      } else {
        setError(data.message || 'Failed to save API key.')
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to connect. Please try again.')
    } finally {
      setSaving(false)
    }
  }, [apiKey, selectedProvider, selectedModel, providerConfig, handleClose])

  const hasExistingKey = (provider: Provider): boolean => {
    if (!keyStatus) return false
    if (provider === 'openai') return !!keyStatus.has_openai_key
    if (provider === 'anthropic') return !!keyStatus.has_anthropic_key
    return false
  }

  const isActiveProvider = (provider: Provider): boolean => {
    return keyStatus?.active_provider === provider
  }

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
            Connect your Anthropic or OpenAI account to use their models. Your API key is stored locally and never shared.
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
          <label className={styles.formLabel}>
            {providerConfig.name} API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={e => { setApiKey(e.target.value); setError('') }}
            placeholder={`${providerConfig.keyPrefix}...`}
            disabled={saving}
            className={styles.formInput}
            onKeyDown={e => { if (e.key === 'Enter') handleSave() }}
          />

          <label className={styles.formLabel}>Model</label>
          <div className={styles.modelSelector}>
            {providerConfig.models.map(model => (
              <button
                key={model.id}
                className={`${styles.modelOption} ${selectedModel === model.id ? styles.modelOptionSelected : ''}`}
                onClick={() => setSelectedModel(model.id)}
                disabled={saving}
              >
                <span className={styles.modelName}>{model.name}</span>
                <span className={styles.modelDesc}>{model.description}</span>
              </button>
            ))}
          </div>

          {error && (
            <p className={styles.errorMessage}>{error}</p>
          )}

          {success && (
            <p className={styles.successMessage}>{success}</p>
          )}

          <button
            className={styles.saveButton}
            onClick={handleSave}
            disabled={saving || !apiKey.trim()}
          >
            {saving ? 'Connecting...' : `Sign in with ${providerConfig.name}`}
          </button>

          <p className={styles.helpText}>
            Get your API key at{' '}
            <a
              href={providerConfig.helpUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {providerConfig.helpLabel}
            </a>
          </p>
        </div>
      </div>
    </Dialog>
  )
}
