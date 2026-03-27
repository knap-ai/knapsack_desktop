import { useCallback, useState } from 'react'

import { ComposedEmailDraft } from 'src/hooks/feed/useFeed'
import { sendComposedEmail } from 'src/utils/gmailService'

interface EmailComposeDrawerProps {
  draft: ComposedEmailDraft
  userEmail: string
  userName?: string
  onDismiss: () => void
}

const EmailComposeDrawer = ({ draft, userEmail, userName, onDismiss }: EmailComposeDrawerProps) => {
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSend = useCallback(async () => {
    setSending(true)
    setError('')
    try {
      await sendComposedEmail({
        to: draft.to,
        cc: draft.cc,
        subject: draft.subject,
        body: draft.body,
        threadId: draft.threadId,
        userEmail,
        userName,
      })
      setSent(true)
      setTimeout(() => onDismiss(), 1500)
    } catch (e: any) {
      setError(e?.message || 'Failed to send email')
    } finally {
      setSending(false)
    }
  }, [draft, userEmail, userName, onDismiss])

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 30,
        background: 'white',
        borderTop: '1px solid #e2e8f0',
        boxShadow: '0 -4px 16px rgba(0,0,0,0.10)',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '60vh',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px', borderBottom: '1px solid #e2e8f0', flexShrink: 0,
      }}>
        <span style={{ fontWeight: 600, fontSize: 13, color: '#1e293b' }}>
          ✉ Draft Email
        </span>
        <button
          onClick={onDismiss}
          style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#64748b', lineHeight: 1 }}
          title="Dismiss"
        >
          ×
        </button>
      </div>

      {/* Body */}
      <div style={{ overflowY: 'auto', flex: 1, padding: '12px 16px' }}>
        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>
          <strong style={{ color: '#1e293b' }}>To:</strong> {draft.to}
        </div>
        {draft.cc && (
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>
            <strong style={{ color: '#1e293b' }}>CC:</strong> {draft.cc}
          </div>
        )}
        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>
          <strong style={{ color: '#1e293b' }}>Subject:</strong> {draft.subject}
        </div>
        <div
          style={{
            fontSize: 13, color: '#1e293b', lineHeight: 1.55,
            background: '#f8fafc', borderRadius: 6, padding: '10px 12px',
            border: '1px solid #e2e8f0',
          }}
          dangerouslySetInnerHTML={{ __html: draft.body }}
        />
      </div>

      {/* Footer */}
      <div style={{
        padding: '10px 16px', borderTop: '1px solid #e2e8f0', flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        {sent ? (
          <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 600 }}>✓ Email sent!</span>
        ) : (
          <>
            <button
              onClick={handleSend}
              disabled={sending}
              style={{
                padding: '8px 18px', borderRadius: 8, border: 'none',
                background: '#c54841', color: 'white', fontSize: 13, fontWeight: 600,
                cursor: sending ? 'not-allowed' : 'pointer', opacity: sending ? 0.6 : 1,
              }}
            >
              {sending ? 'Sending…' : 'Send Email'}
            </button>
            <button
              onClick={onDismiss}
              disabled={sending}
              style={{
                padding: '8px 14px', borderRadius: 8, border: '1px solid #d4d4d8',
                background: 'white', fontSize: 13, fontWeight: 500, color: '#64748b',
                cursor: 'pointer',
              }}
            >
              Dismiss
            </button>
            {error && <span style={{ fontSize: 12, color: '#dc2626', flex: 1 }}>{error}</span>}
          </>
        )}
      </div>
    </div>
  )
}

export default EmailComposeDrawer
