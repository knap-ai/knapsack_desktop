// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import EmailComposeDrawer from './index'
import { sendComposedEmail } from 'src/utils/gmailService'
vi.mock('src/utils/gmailService', () => ({ sendComposedEmail: vi.fn() }))
afterEach(() => { cleanup(); vi.clearAllMocks() })
const draft = { to: 'recipient@example.invalid', subject: 'Fictional follow-up', body: '<p>Fictional notes to review.</p>', senderEmail: 'owner@example.invalid' }
const outlook = { id: 'outlook|mailbox@example.invalid', provider: 'outlook' as const, accountEmail: 'mailbox@example.invalid', ownerEmail: 'owner@example.invalid' }
describe('reviewed meeting follow-up drafts', () => {
  it('preserves editable draft without a mail connection and disables sending', () => {
    render(<EmailComposeDrawer draft={draft} userEmail="owner@example.invalid" senders={[]} onDismiss={() => {}} />)
    expect(screen.getByDisplayValue('Fictional follow-up')).toBeTruthy()
    expect(screen.getByText('Connect Gmail or Outlook to send. You can keep editing this draft.')).toBeTruthy()
    expect((screen.getByText('Send Email') as HTMLButtonElement).disabled).toBe(true)
    fireEvent.change(screen.getByDisplayValue('Fictional follow-up'), { target: { value: 'Edited fictional subject' } })
    expect(screen.getByDisplayValue('Edited fictional subject')).toBeTruthy()
    expect(sendComposedEmail).not.toHaveBeenCalled()
  })
  it('uses the explicitly connected Outlook mailbox and keeps edits on rejection', async () => {
    vi.mocked(sendComposedEmail).mockRejectedValueOnce(new Error('Outlook refused this send.'))
    render(<EmailComposeDrawer draft={draft} userEmail="owner@example.invalid" senders={[outlook]} onDismiss={() => {}} />)
    expect((screen.getByRole('combobox', { name: 'Sender mailbox' }) as HTMLSelectElement).value).toBe(outlook.id)
    fireEvent.change(screen.getByDisplayValue('Fictional follow-up'), { target: { value: 'Edited fictional subject' } })
    fireEvent.click(screen.getByText('Send Email'))
    await waitFor(() => expect(sendComposedEmail).toHaveBeenCalledWith(expect.objectContaining({ provider: 'outlook', accountEmail: 'mailbox@example.invalid', userEmail: 'owner@example.invalid', subject: 'Edited fictional subject' })))
    await waitFor(() => expect(screen.getByText('Outlook refused this send.')).toBeTruthy())
    expect(screen.getByDisplayValue('Edited fictional subject')).toBeTruthy()
    expect(screen.getByText('Fictional notes to review.')).toBeTruthy()
    expect(screen.queryByText('✓ Email sent!')).toBeNull()
  })
  it('requires a choice instead of assuming Gmail when both providers are connected', () => {
    const gmail = { ...outlook, id: 'gmail|owner@example.invalid', provider: 'gmail' as const, accountEmail: 'owner@example.invalid' }
    const matchingOutlook = { ...outlook, accountEmail: 'owner@example.invalid' }
    render(<EmailComposeDrawer draft={draft} userEmail="owner@example.invalid" senders={[gmail, matchingOutlook]} onDismiss={() => {}} />)
    expect((screen.getByText('Send Email') as HTMLButtonElement).disabled).toBe(true)
    fireEvent.change(screen.getByRole('combobox', { name: 'Sender mailbox' }), { target: { value: matchingOutlook.id } })
    expect((screen.getByText('Send Email') as HTMLButtonElement).disabled).toBe(false)
    expect(sendComposedEmail).not.toHaveBeenCalled()
  })
  it('loads and selects a single mailbox that arrives after the draft opens', async () => {
    const view = render(<EmailComposeDrawer draft={draft} userEmail="owner@example.invalid" senders={[]} onDismiss={() => {}} />)
    expect((screen.getByRole('combobox', { name: 'Sender mailbox' }) as HTMLSelectElement).value).toBe('')

    view.rerender(<EmailComposeDrawer draft={draft} userEmail="owner@example.invalid" senders={[outlook]} onDismiss={() => {}} />)

    await waitFor(() => expect((screen.getByRole('combobox', { name: 'Sender mailbox' }) as HTMLSelectElement).value).toBe(outlook.id))
    expect((screen.getByText('Send Email') as HTMLButtonElement).disabled).toBe(false)
  })
  it('clears a selected mailbox that disappears instead of switching identities', async () => {
    const workGmail = { id: 'gmail|owner@example.invalid', provider: 'gmail' as const, accountEmail: 'owner@example.invalid', ownerEmail: 'owner@example.invalid' }
    const personalOutlook = { ...outlook, id: 'outlook|personal@example.invalid', accountEmail: 'personal@example.invalid' }
    const view = render(<EmailComposeDrawer draft={draft} userEmail="owner@example.invalid" senders={[workGmail, personalOutlook]} onDismiss={() => {}} />)
    expect((screen.getByRole('combobox', { name: 'Sender mailbox' }) as HTMLSelectElement).value).toBe(workGmail.id)

    view.rerender(<EmailComposeDrawer draft={draft} userEmail="owner@example.invalid" senders={[personalOutlook]} onDismiss={() => {}} />)

    await waitFor(() => expect((screen.getByRole('combobox', { name: 'Sender mailbox' }) as HTMLSelectElement).value).toBe(''))
    expect((screen.getByText('Send Email') as HTMLButtonElement).disabled).toBe(true)
    expect(sendComposedEmail).not.toHaveBeenCalled()

    fireEvent.change(screen.getByRole('combobox', { name: 'Sender mailbox' }), { target: { value: personalOutlook.id } })
    fireEvent.click(screen.getByText('Send Email'))
    await waitFor(() => expect(sendComposedEmail).toHaveBeenCalledWith(expect.objectContaining({
      provider: 'outlook',
      accountEmail: 'personal@example.invalid',
      userEmail: 'owner@example.invalid',
    })))
  })
  it('stacks above meeting chat and moves focus into the draft dialog', async () => {
    render(<EmailComposeDrawer draft={draft} userEmail="owner@example.invalid" senders={[outlook]} onDismiss={() => {}} />)
    const dialog = screen.getByRole('dialog', { name: 'Email draft' })
    await waitFor(() => expect(document.activeElement).toBe(dialog))
    expect((dialog as HTMLElement).style.zIndex).toBe('200')
  })
})
