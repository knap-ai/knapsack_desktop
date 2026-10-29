// @vitest-environment jsdom
import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import ChatSelectionActions from './ChatSelectionActions'
import QuotedChatContext from './QuotedChatContext'
import { appendChatQuote, scopedChatAttachments, type ChatAttachment } from 'src/utils/selectedChatContext'

let rectTop = 100
beforeEach(() => {
  rectTop = 100
  Range.prototype.getBoundingClientRect = () => ({ left: 40, top: rectTop, bottom: rectTop + 20, right: 160, width: 120, height: 20, x: 40, y: rectTop, toJSON: () => ({}) })
})
afterEach(() => { cleanup(); window.getSelection()?.removeAllRanges(); vi.restoreAllMocks() })

function Harness({ conversation = 'a', markdown = '**First** [link](https://example.test)\n\n```js\nconst é = 1;\nline2();\n```', onSend = vi.fn(), onJump = vi.fn() }: {
  conversation?: string; markdown?: string; onSend?: (draft: string | undefined, files: ChatAttachment[]) => void; onJump?: (messageId: string) => void
}) {
  const root = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLTextAreaElement>(null)
  const scope = useRef(conversation); scope.current = conversation
  const [files, setFiles] = useState<ChatAttachment[]>([{ name: 'existing.txt', type: 'text/plain', content: 'existing file' }])
  useEffect(() => { setFiles(previous => scopedChatAttachments(previous, conversation)) }, [conversation])
  return <>
    <div ref={root}>
      <div data-testid="message" data-chat-quote-message-id="source-1"><ReactMarkdown>{markdown}</ReactMarkdown></div>
      <div data-testid="second" data-chat-quote-message-id="source-2">Second source</div>
      <button>Copy message</button>
    </div>
    <ChatSelectionActions rootRef={root} conversationId={conversation} onAdd={quote => {
      if (quote.conversationId !== scope.current) return
      setFiles(previous => appendChatQuote(previous, quote))
      input.current?.focus()
    }} />
    {scopedChatAttachments(files, conversation).map(file => file.chatQuote
      ? <QuotedChatContext key={file.chatQuote.id} quote={file.chatQuote} onJump={onJump} onRemove={() => setFiles(previous => previous.filter(f => f !== file))} />
      : <span key={file.name}>{file.name}</span>)}
    <textarea ref={input} aria-label="Composer" defaultValue="Existing draft" />
    <button onClick={() => onSend(input.current?.value, files)}>Send</button>
    <p data-testid="outside">Outside the conversation</p>
  </>
}
function select(element: HTMLElement) {
  fireEvent.pointerDown(element)
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
  const range = document.createRange(); range.selectNodeContents(element)
  const selection = window.getSelection()!; selection.removeAllRanges(); selection.addRange(range)
  const text = selection.toString()
  fireEvent(document, new Event('selectionchange'))
  return text
}

it('adds exact rendered Markdown/link/code text without sending or changing draft/files, and focuses composer', () => {
  const send = vi.fn(); const jump = vi.fn()
  render(<Harness onSend={send} onJump={jump} />)
  const text = select(screen.getByTestId('message'))
  fireEvent.click(screen.getByRole('button', { name: 'Add to chat' }))
  expect(screen.getByRole('blockquote').textContent).toBe(text)
  expect((screen.getByRole('textbox', { name: 'Composer' }) as HTMLTextAreaElement).value).toBe('Existing draft')
  expect(screen.getByText('existing.txt')).toBeTruthy()
  expect(document.activeElement).toBe(screen.getByRole('textbox'))
  expect(send).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: 'Quoted from message' }))
  expect(jump).toHaveBeenCalledWith('source-1')
  expect(screen.queryByText('Ask in side chat')).toBeNull()
})
it('keeps the snapshot when toolbar pointer interaction collapses the browser selection', () => {
  render(<Harness />)
  const text = select(screen.getByTestId('message'))
  const action = screen.getByRole('button', { name: 'Add to chat' })
  fireEvent.pointerDown(action)
  window.getSelection()!.removeAllRanges()
  fireEvent(document, new Event('selectionchange'))
  fireEvent.click(action)
  expect(screen.getByRole('blockquote').textContent).toBe(text)
})
it('supports keyboard Add, Escape dismissal, and preserves ordinary native copy', () => {
  render(<Harness />)
  const text = select(screen.getByTestId('message'))
  const copy = new KeyboardEvent('keydown', { key: 'c', ctrlKey: true, bubbles: true, cancelable: true })
  document.dispatchEvent(copy)
  expect(copy.defaultPrevented).toBe(false)
  const nativeCopy = new Event('copy', { bubbles: true, cancelable: true })
  document.dispatchEvent(nativeCopy)
  expect(nativeCopy.defaultPrevented).toBe(false)
  expect(window.getSelection()!.toString()).toBe(text)
  fireEvent.keyDown(document, { key: 'Escape' })
  expect(screen.queryByRole('button', { name: 'Add to chat' })).toBeNull()
  select(screen.getByTestId('message'))
  fireEvent.keyDown(document, { key: 'Enter', altKey: true })
  expect(screen.getByRole('blockquote').textContent).toBe(text)
})
it('deduplicates identical additions, preserves ordered distinct quotes, and removes only the chosen item', () => {
  render(<Harness />)
  for (let i = 0; i < 2; i++) { select(screen.getByTestId('message')); fireEvent.click(screen.getByRole('button', { name: 'Add to chat' })) }
  expect(screen.getAllByRole('blockquote')).toHaveLength(1)
  select(screen.getByTestId('second')); fireEvent.click(screen.getByRole('button', { name: 'Add to chat' }))
  expect(screen.getAllByRole('blockquote')[1].textContent).toBe('Second source')
  fireEvent.click(screen.getAllByRole('button', { name: 'Remove quoted context' })[0])
  expect(screen.getAllByRole('blockquote')).toHaveLength(1)
  expect(screen.getByText('existing.txt')).toBeTruthy()
  expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toBe('Existing draft')
})
it('drops pending selection and quote context on conversation switches, even with reused message nodes', () => {
  const { rerender } = render(<Harness conversation="a" />)
  select(screen.getByTestId('message')); fireEvent.click(screen.getByRole('button', { name: 'Add to chat' }))
  select(screen.getByTestId('second'))
  rerender(<Harness conversation="b" />)
  expect(screen.queryByRole('button', { name: 'Add to chat' })).toBeNull()
  expect(screen.queryByRole('blockquote')).toBeNull()
  fireEvent(document, new Event('selectionchange'))
  expect(screen.queryByRole('button', { name: 'Add to chat' })).toBeNull()
  rerender(<Harness conversation="a" />)
  expect(screen.queryByRole('blockquote')).toBeNull()
})
it('rejects stale streaming selections while preserving already added quote snapshots', async () => {
  const { rerender } = render(<Harness markdown="Original excerpt" />)
  select(screen.getByTestId('message')); fireEvent.click(screen.getByRole('button', { name: 'Add to chat' }))
  select(screen.getByTestId('message'))
  rerender(<Harness markdown="Streamed replacement" />)
  await waitFor(() => expect(screen.queryByRole('button', { name: 'Add to chat' })).toBeNull())
  expect(screen.getByRole('blockquote').textContent).toBe('Original excerpt')
})
it('reanchors on scroll and ignores empty, outside, and cross-message selections', () => {
  render(<Harness />)
  expect(screen.queryByRole('toolbar')).toBeNull()
  select(screen.getByTestId('outside'))
  expect(screen.queryByRole('toolbar')).toBeNull()
  select(screen.getByTestId('message'))
  expect(screen.getByRole('toolbar').style.top).toBe('62px')
  rectTop = 150; fireEvent.scroll(window)
  expect(screen.getByRole('toolbar').style.top).toBe('112px')
  const range = document.createRange()
  range.setStart(screen.getByTestId('message'), 0); range.setEnd(screen.getByTestId('second'), 1)
  const selection = window.getSelection()!; selection.removeAllRanges(); selection.addRange(range)
  fireEvent(document, new Event('selectionchange'))
  expect(screen.queryByRole('toolbar')).toBeNull()
  act(() => { selection.removeAllRanges(); fireEvent(document, new Event('selectionchange')) })
  expect(screen.queryByRole('toolbar')).toBeNull()
})

it('keeps keyboard focus on the action valid after selection loss, and hides old selection while editing the composer', () => {
  render(<Harness />)
  const text = select(screen.getByTestId('message'))
  const action = screen.getByRole('button', { name: 'Add to chat' })
  act(() => { action.focus(); window.getSelection()!.removeAllRanges() })
  fireEvent(document, new Event('selectionchange'))
  fireEvent.click(action)
  expect(screen.getByRole('blockquote').textContent).toBe(text)
  select(screen.getByTestId('second'))
  fireEvent.pointerDown(screen.getByRole('textbox'))
  act(() => { screen.getByRole('textbox').focus() })
  fireEvent.keyUp(screen.getByRole('textbox'), { key: 'x' })
  expect(screen.queryByRole('toolbar')).toBeNull()
})
it('dismisses an anchor that scrolls off screen without adding or sending', () => {
  const send = vi.fn()
  render(<Harness onSend={send} />)
  select(screen.getByTestId('message'))
  rectTop = window.innerHeight + 100
  fireEvent.scroll(window)
  expect(screen.queryByRole('toolbar')).toBeNull()
  expect(screen.queryByRole('blockquote')).toBeNull()
  expect(send).not.toHaveBeenCalled()
})
