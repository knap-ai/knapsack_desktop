import { useCallback, useEffect, useRef, useState } from 'react'

import { ComposedEmailDraft } from 'src/hooks/feed/useFeed'
import { sendComposedEmail } from 'src/utils/gmailService'

interface EmailComposeDrawerProps {
  draft: ComposedEmailDraft
  userEmail: string
  userName?: string
  onDismiss: () => void
}

const EmailComposeDrawer = ({ draft, userEmail, userName, onDismiss }: EmailComposeDrawerProps) => {
  const [to, setTo] = useState(draft.to)
  const [subject, setSubject] = useState(draft.subject)
  const [ccList, setCcList] = useState<string[]>(() =>
    draft.cc ? draft.cc.split(',').map(c => c.trim()).filter(Boolean) : []
  )
  const [ccInput, setCcInput] = useState('')
  const [showCcInput, setShowCcInput] = useState(!!draft.cc && draft.cc.trim().length > 0)
  const ccInputRef = useRef<HTMLInputElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const attachments = draft.attachments ?? []
  const senderEmail = draft.senderEmail?.trim() || draft.userEmail?.trim() || userEmail.trim()

  // Set initial body HTML (can't combine contentEditable + dangerouslySetInnerHTML)
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.innerHTML = draft.body
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleRemoveCc = useCallback((index: number) => {
    setCcList(prev => prev.filter((_, i) => i !== index))
  }, [])

  const handleAddCc = useCallback((value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return
    setCcList(prev => prev.includes(trimmed) ? prev : [...prev, trimmed])
    setCcInput('')
  }, [])

  const handleCcKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === 'Tab' || e.key === ',') {
      e.preventDefault()
      handleAddCc(ccInput)
    } else if (e.key === 'Backspace' && ccInput === '' && ccList.length > 0) {
      handleRemoveCc(ccList.length - 1)
    }
  }, [ccInput, ccList, handleAddCc, handleRemoveCc])

  const handleSend = useCallback(async () => {
    if (!senderEmail) {
      setError('No connected sender email was found for this draft. Reconnect Gmail and try again.')
      return
    }
    setSending(true)
    setError('')
    try {
      const senderName = userName || draft.userName

      await sendComposedEmail({
        to,
        cc: ccList.length > 0 ? ccList.join(', ') : undefined,
        subject,
        body: bodyRef.current?.innerHTML || draft.body,
        threadId: draft.threadId,
        ownerEmail: userEmail,
        userEmail: senderEmail,
        userName: senderName,
        attachments: draft.attachments,
      })
      setSent(true)
      setTimeout(() => onDismiss(), 1500)
    } catch (e: any) {
      setError(e?.message || 'Failed to send email')
    } finally {
      setSending(false)
    }
  }, [to, subject, ccList, draft, senderEmail, userName, onDismiss])

  const fieldRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 6,
    padding: '6px 0',
    borderBottom: '1px solid #f1f5f9',
  }
  const labelStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, color: '#64748b',
    width: 52, flexShrink: 0, paddingTop: 2,
  }
  const inputStyle: React.CSSProperties = {
    flex: 1, fontSize: 12, color: '#1e293b', border: 'none', outline: 'none',
    background: 'transparent', padding: 0,
  }

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        zIndex: 30,
        background: 'white',
        borderTop: '1px solid #e2e8f0',
        boxShadow: '0 -4px 16px rgba(0,0,0,0.10)',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '65vh',
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

      {/* Fields */}
      <div style={{ padding: '4px 16px 0', flexShrink: 0, borderBottom: '1px solid #e2e8f0' }}>
        {/* To */}
        <div style={fieldRowStyle}>
          <span style={labelStyle}>To</span>
          <input
            style={inputStyle}
            value={to}
            onChange={e => setTo(e.target.value)}
            placeholder="recipient@example.com"
          />
        </div>

        {/* CC */}
        <div style={{ ...fieldRowStyle, borderBottom: showCcInput ? '1px solid #f1f5f9' : 'none' }}>
          <span style={labelStyle}>CC</span>
          {showCcInput ? (
            <div
              style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center', cursor: 'text' }}
              onClick={() => ccInputRef.current?.focus()}
            >
              {ccList.map((cc, i) => (
                <span
                  key={`${cc}-${i}`}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 2,
                    padding: '1px 6px', borderRadius: 4,
                    background: '#f1f5f9', color: '#475569', fontSize: 11,
                  }}
                >
                  {cc}
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); handleRemoveCc(i) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '0 1px', lineHeight: 1, fontSize: 13 }}
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                ref={ccInputRef}
                type="text"
                value={ccInput}
                onChange={e => setCcInput(e.target.value)}
                onKeyDown={handleCcKeyDown}
                onBlur={() => handleAddCc(ccInput)}
                placeholder={ccList.length === 0 ? 'Add CC...' : ''}
                style={{ ...inputStyle, minWidth: 80, flex: 1 }}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => { setShowCcInput(true); setTimeout(() => ccInputRef.current?.focus(), 0) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#94a3b8', padding: 0 }}
            >
              + Add CC
            </button>
          )}
        </div>

        {/* Subject */}
        <div style={{ ...fieldRowStyle, borderBottom: 'none' }}>
          <span style={labelStyle}>Subject</span>
          <input
            style={inputStyle}
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="Subject"
          />
        </div>
      </div>

      {/* Body — contentEditable for rich-text editing */}
      <div style={{ overflowY: 'auto', flex: 1, padding: '10px 16px' }}>
        {attachments.length > 0 && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>
              Attachments
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {attachments.map((attachment, index) => (
                <span
                  key={`${attachment.filename}-${index}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 8px',
                    borderRadius: 999,
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    color: '#475569',
                    fontSize: 12,
                  }}
                >
                  📎 {attachment.filename}
                </span>
              ))}
            </div>
          </div>
        )}
        <div
          ref={bodyRef}
          contentEditable
          suppressContentEditableWarning
          style={{
            fontSize: 13, color: '#1e293b', lineHeight: 1.55,
            background: '#f8fafc', borderRadius: 6, padding: '10px 12px',
            border: '1px solid #e2e8f0', minHeight: 80, outline: 'none',
            wordBreak: 'break-word',
          }}
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
