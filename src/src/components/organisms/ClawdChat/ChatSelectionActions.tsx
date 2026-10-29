import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { snapshotChatQuote, type ChatQuote } from 'src/utils/selectedChatContext'

type Candidate = { quote: ChatQuote; range: Range; rangeText: string; left: number; top: number }
const owner = (node: Node | null) => (node?.nodeType === Node.ELEMENT_NODE ? node as Element : node?.parentElement)
  ?.closest<HTMLElement>('[data-chat-quote-message-id]')

export default function ChatSelectionActions({ rootRef, conversationId, active = true, onAdd }: {
  rootRef: RefObject<HTMLElement>; conversationId: string; active?: boolean; onAdd: (quote: ChatQuote) => void
}) {
  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const current = useRef<Candidate | null>(null)
  const button = useRef<HTMLButtonElement>(null)
  const interacting = useRef(false)
  const callback = useRef(onAdd)
  const scope = useRef(conversationId)
  callback.current = onAdd
  scope.current = conversationId
  const dismissed = useRef('')
  const update = (value: Candidate | null) => { current.current = value; setCandidate(value) }
  const fingerprint = (quote: ChatQuote) => JSON.stringify([quote.conversationId, quote.messageId, quote.text])
  const valid = (value: Candidate) => value.quote.conversationId === scope.current
    && value.range.startContainer.isConnected && value.range.endContainer.isConnected
    && rootRef.current?.contains(value.range.commonAncestorContainer)
    && owner(value.range.startContainer)?.dataset.chatQuoteMessageId === value.quote.messageId
    && owner(value.range.endContainer)?.dataset.chatQuoteMessageId === value.quote.messageId
    && value.range.toString() === value.rangeText
  const add = () => {
    const value = current.current
    if (!active || !value || !valid(value)) { update(null); return }
    dismissed.current = fingerprint(value.quote)
    interacting.current = false
    update(null)
    callback.current(value.quote)
  }
  const addRef = useRef(add)
  addRef.current = add

  useLayoutEffect(() => {
    update(null)
    const selection = window.getSelection()
    if (selection?.anchorNode && rootRef.current?.contains(selection.anchorNode)) selection.removeAllRanges()
  }, [conversationId, active, rootRef])

  useEffect(() => {
    update(null)
    dismissed.current = ''
    if (!active) return
    const position = (range: Range) => {
      const rect = range.getBoundingClientRect()
      if (rect.bottom < 0 || rect.top > window.innerHeight) return null
      return { left: Math.max(8, Math.min(rect.left, window.innerWidth - 140)), top: Math.max(8, rect.top - 38) }
    }
    const read = () => {
      if (interacting.current || document.activeElement === button.current) return
      if (document.activeElement?.matches('input,textarea,[contenteditable="true"]')) { update(null); return }
      const selection = window.getSelection()
      if (!selection || selection.isCollapsed || selection.rangeCount !== 1 || !selection.toString().trim()) { dismissed.current = ''; update(null); return }
      const range = selection.getRangeAt(0)
      const first = owner(range.startContainer)
      if (!first || first !== owner(range.endContainer) || !rootRef.current?.contains(first)) { update(null); return }
      const element = selection.anchorNode?.parentElement
      if (element?.closest('button,input,textarea,[contenteditable="true"]')) { update(null); return }
      const quote = snapshotChatQuote(conversationId, first.dataset.chatQuoteMessageId!, selection.toString())
      if (fingerprint(quote) === dismissed.current) return
      const anchor = position(range)
      if (!anchor) { update(null); return }
      update({ quote, range: range.cloneRange(), rangeText: range.toString(), ...anchor })
    }
    const pointer = (event: PointerEvent) => {
      if (button.current?.contains(event.target as Node)) return
      interacting.current = false
      dismissed.current = ''
      update(null)
    }
    const key = (event: KeyboardEvent) => {
      if (!current.current) return
      if (event.key === 'Escape') {
        event.preventDefault(); event.stopPropagation()
        dismissed.current = fingerprint(current.current.quote)
        interacting.current = false
        update(null)
      } else if (event.altKey && event.key === 'Enter') {
        event.preventDefault(); event.stopPropagation(); addRef.current()
      }
    }
    const scroll = () => {
      const value = current.current
      if (!value) return
      if (!valid(value)) { update(null); return }
      const anchor = position(value.range)
      if (!anchor) { update(null); return }
      update({ ...value, ...anchor })
    }
    const observer = new MutationObserver(() => { if (current.current && !valid(current.current)) update(null) })
    if (rootRef.current) observer.observe(rootRef.current, { childList: true, characterData: true, subtree: true })
    document.addEventListener('selectionchange', read)
    document.addEventListener('pointerdown', pointer, true)
    document.addEventListener('pointerup', read)
    document.addEventListener('keyup', read)
    document.addEventListener('keydown', key, true)
    window.addEventListener('scroll', scroll, true)
    window.addEventListener('resize', scroll)
    return () => {
      observer.disconnect()
      document.removeEventListener('selectionchange', read)
      document.removeEventListener('pointerdown', pointer, true)
      document.removeEventListener('pointerup', read)
      document.removeEventListener('keyup', read)
      document.removeEventListener('keydown', key, true)
      window.removeEventListener('scroll', scroll, true)
      window.removeEventListener('resize', scroll)
    }
  }, [conversationId, active, rootRef])

  if (!active || !candidate || candidate.quote.conversationId !== conversationId) return null
  return createPortal(<div className="ClawdSelectionActions" role="toolbar" aria-label="Selected text actions"
    style={{ position: 'fixed', left: candidate.left, top: candidate.top, zIndex: 10000 }}>
    <button ref={button} type="button" aria-keyshortcuts="Alt+Enter" title="Add selected text to chat (Alt+Enter)"
      onPointerDown={event => { interacting.current = true; event.preventDefault() }}
      onClick={add}>Add to chat</button>
  </div>, document.body)
}
