// @vitest-environment jsdom
import { createHash, webcrypto } from 'node:crypto'

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import * as api from 'src/api/slackNotes'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import SlackNotesShare from './index'

vi.mock('src/api/slackNotes', async importOriginal => ({
  ...(await importOriginal<typeof api>()),
  slackNotesWorkspaces: vi.fn(),
  slackNotesChannels: vi.fn(),
  sendSlackNotes: vi.fn(),
}))
const signedIn = 'fictional@example.invalid'
const owner1 = createHash('sha256').update(signedIn).digest('hex')
vi.mock('src/utils/KNLocalStorage', () => ({
  KNLocalStorage: { getItem: async () => ({ email: signedIn, uuid: 'synthetic-profile' }) },
}))
const workspaces = [
  { accountId: 'work', teamId: 'T1', name: 'Same workspace' },
  { accountId: 'other', teamId: 'T2', name: 'Same workspace' },
]
const props = {
  threadId: 42,
  userEmail: signedIn,
  calendarAccountEmail: 'calendar@example.invalid',
  notes: async () => ({
    markdown: '| Owner | Task |\n| --- | --- |\n| Frida | Visa review |',
    title: 'Fictional meeting',
  }),
  onClose: vi.fn(),
}
beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
  vi.stubGlobal('crypto', webcrypto)
  vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } })
  vi.mocked(api.slackNotesWorkspaces).mockResolvedValue({ owner: owner1, accounts: workspaces })
  vi.mocked(api.slackNotesChannels).mockResolvedValue({
    channels: [
      { id: 'C1', name: 'same-channel', private: false },
      { id: 'C2', name: 'same-channel', private: true },
    ],
  })
  vi.mocked(api.sendSlackNotes).mockResolvedValue({
    state: 'sent',
    channelId: 'C1',
    teamId: 'T1',
    ts: 'fictional',
  })
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})
async function choose() {
  await screen.findByText('Same workspace · workspace T1')
  fireEvent.change(screen.getByLabelText('Slack workspace'), { target: { value: 'work' } })
  await screen.findByText('#same-channel · C1')
  fireEvent.change(screen.getByLabelText('Slack channel'), { target: { value: 'C1' } })
}
async function preview() {
  fireEvent.click(screen.getByText('Preview send to channel'))
  await screen.findByRole('region', { name: 'Slack send preview' })
}
describe('explicit Slack notes sharing', () => {
  it('lists authorized public channels with an honest private-channel permission warning', async () => {
    vi.mocked(api.slackNotesChannels).mockResolvedValue({
      channels: [{ id: 'C1', name: 'public-member', private: false }],
      warnings: ['Private channels cannot be listed with this connection’s existing permissions.'],
    })
    render(<SlackNotesShare {...props} />)
    await screen.findByText('Same workspace · workspace T1')
    fireEvent.change(screen.getByLabelText('Slack workspace'), { target: { value: 'work' } })
    await screen.findByText('#public-member')
    await screen.findByText(/Private channels cannot be listed/)
    expect(api.sendSlackNotes).not.toHaveBeenCalled()
  })
  it('disables the empty channel picker after a permission failure and keeps copy available', async () => {
    vi.mocked(api.slackNotesChannels).mockRejectedValue(
      new Error('Channel permissions unavailable'),
    )
    render(<SlackNotesShare {...props} />)
    await screen.findByText('Same workspace · workspace T1')
    fireEvent.change(screen.getByLabelText('Slack workspace'), {
      target: { value: 'work' },
    })
    await screen.findByRole('alert')
    expect(
      (screen.getByLabelText('Slack channel') as HTMLSelectElement).disabled,
    ).toBe(true)
    expect(screen.getByText('No channels available')).toBeTruthy()
    fireEvent.click(screen.getByText('Copy for Slack'))
    await screen.findByText(/Copied for Slack/)
    expect(api.sendSlackNotes).not.toHaveBeenCalled()
  })
  it('allows closing during delayed channel discovery and ignores its late result', async () => {
    let finish: (value: { channels: api.SlackNotesChannel[] }) => void = () => {}
    vi.mocked(api.slackNotesChannels).mockImplementation(
      () =>
        new Promise(resolve => {
          finish = resolve
        }),
    )
    const ui = render(<SlackNotesShare {...props} />)
    await screen.findByText('Same workspace · workspace T1')
    fireEvent.change(screen.getByLabelText('Slack workspace'), { target: { value: 'work' } })
    await waitFor(() => expect(api.slackNotesChannels).toHaveBeenCalledOnce())
    fireEvent.click(screen.getByRole('button', { name: /^Close$/ }))
    expect(props.onClose).toHaveBeenCalledOnce()
    ui.unmount()
    finish({ channels: [{ id: 'C1', name: 'late', private: false }] })
    expect(api.sendSlackNotes).not.toHaveBeenCalled()
  })
  it('does not hide a working connection when another workspace is unavailable', async () => {
    vi.mocked(api.slackNotesWorkspaces).mockResolvedValue({
      owner: owner1,
      accounts: [
        { accountId: 'bad', teamId: '', name: 'Unavailable', unavailable: true },
        ...workspaces,
      ],
    })
    render(<SlackNotesShare {...props} />)
    await choose()
    expect((screen.getByLabelText('Slack workspace') as HTMLSelectElement).value).toBe('work')
    expect(screen.getByText('Unavailable (unavailable)').hasAttribute('disabled')).toBe(true)
  })
  it('copies separately, with no send or automatic posting on opening/saving', async () => {
    render(<SlackNotesShare {...props} />)
    await screen.findByText('Same workspace · workspace T1')
    fireEvent.click(screen.getByText('Copy for Slack'))
    await screen.findByText(/Copied for Slack/)
    expect(navigator.clipboard.writeText).toHaveBeenCalledOnce()
    expect(api.sendSlackNotes).not.toHaveBeenCalled()
  })
  it('previews exact workspace/channel IDs and native tables before explicit send', async () => {
    render(<SlackNotesShare {...props} />)
    await choose()
    await preview()
    expect(screen.getByRole('table')).toBeTruthy()
    expect(api.sendSlackNotes).not.toHaveBeenCalled()
    fireEvent.click(screen.getByText('Send these notes to #same-channel'))
    await screen.findByText(/Sent to Same workspace/)
    expect(api.sendSlackNotes).toHaveBeenCalledOnce()
    expect(vi.mocked(api.sendSlackNotes).mock.calls[0][0]).toEqual({
      owner: owner1,
      accountId: 'work',
      teamId: 'T1',
      channelId: 'C1',
    })
    expect(
      vi.mocked(api.sendSlackNotes).mock.calls[0][1].blocks.some(b => b.type === 'table'),
    ).toBe(true)
  })
  it('restores the exact default for the same user, without sending; another user has no default', async () => {
    let ui = render(<SlackNotesShare {...props} />)
    await choose()
    expect(await api.confirmedSlackDestination(owner1, props.calendarAccountEmail)).toBeUndefined()
    await preview()
    fireEvent.click(screen.getByText('Send these notes to #same-channel'))
    await screen.findByText(/Sent to Same workspace/)
    await waitFor(async () => expect(await api.confirmedSlackDestination(owner1, props.calendarAccountEmail)).toBeTruthy())
    vi.mocked(api.sendSlackNotes).mockClear()
    ui.unmount()
    ui = render(<SlackNotesShare {...props} threadId={43} />)
    await screen.findByText('#same-channel · C1')
    expect((screen.getByLabelText('Slack workspace') as HTMLSelectElement).value).toBe('work')
    expect((screen.getByLabelText('Slack channel') as HTMLSelectElement).value).toBe('C1')
    expect(api.sendSlackNotes).not.toHaveBeenCalled()
    ui.unmount()
    vi.mocked(api.slackNotesWorkspaces).mockResolvedValue({ owner: 'owner2', accounts: workspaces })
    render(<SlackNotesShare {...props} />)
    await screen.findByText('Same workspace · workspace T1')
    expect((screen.getByLabelText('Slack workspace') as HTMLSelectElement).value).toBe('')
  })
  it('refuses deleted channels and re-bound workspaces rather than substituting duplicate names', async () => {
    await api.rememberConfirmedSlackDestination({
      owner: owner1,
      accountId: 'work',
      teamId: 'T1',
      channelId: 'deleted',
    }, props.calendarAccountEmail, { state: 'sent', teamId: 'T1', channelId: 'deleted', ts: 'synthetic' }, () => true)
    let ui = render(<SlackNotesShare {...props} />)
    await screen.findByText(/Previously used channel is unavailable/)
    expect((screen.getByLabelText('Slack channel') as HTMLSelectElement).value).toBe('')
    ui.unmount()
    vi.mocked(api.slackNotesWorkspaces).mockResolvedValue({
      owner: owner1,
      accounts: [{ accountId: 'work', teamId: 'T-new', name: 'Same workspace' }],
    })
    render(<SlackNotesShare {...props} />)
    await screen.findByText(/Saved Slack destination is unavailable/)
    expect((screen.getByLabelText('Slack workspace') as HTMLSelectElement).value).toBe('')
    expect(api.sendSlackNotes).not.toHaveBeenCalled()
  })
  it('keeps uncertain sends explicit and reuses the same idempotency identity', async () => {
    vi.mocked(api.sendSlackNotes).mockRejectedValue(new Error('Outcome uncertain; verify Slack.'))
    render(<SlackNotesShare {...props} />)
    await choose()
    await preview()
    fireEvent.click(screen.getByText('Send these notes to #same-channel'))
    await screen.findByRole('alert')
    expect(api.sendSlackNotes).toHaveBeenCalledOnce()
    fireEvent.click(screen.getByText('Send these notes to #same-channel'))
    await waitFor(() => expect(api.sendSlackNotes).toHaveBeenCalledTimes(2))
    expect(vi.mocked(api.sendSlackNotes).mock.calls[0][2]).toBe(
      vi.mocked(api.sendSlackNotes).mock.calls[1][2],
    )
  })
  it('ignores delayed notes after closing or switching meetings', async () => {
    let finish: (v: { markdown: string }) => void = () => {}
    const ui = render(
      <SlackNotesShare
        {...props}
        notes={() =>
          new Promise(r => {
            finish = r
          })
        }
      />,
    )
    await choose()
    fireEvent.click(screen.getByText('Preview send to channel'))
    ui.unmount()
    finish({ markdown: 'old meeting' })
    render(<SlackNotesShare {...props} threadId={43} />)
    await screen.findByText('Same workspace · workspace T1')
    expect(screen.queryByRole('region', { name: 'Slack send preview' })).toBeNull()
    expect(api.sendSlackNotes).not.toHaveBeenCalled()
  })
  it('dismisses with Escape and keeps native copy separate from keyboard focus', async () => {
    render(<SlackNotesShare {...props} />)
    await screen.findByText('Same workspace · workspace T1')
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    expect(props.onClose).toHaveBeenCalledOnce()
  })
  it('shows revoked-connection errors without selecting a replacement or sending', async () => {
    vi.mocked(api.slackNotesChannels).mockRejectedValue(
      new Error('Slack connection expired or was revoked.'),
    )
    render(<SlackNotesShare {...props} />)
    await screen.findByText('Same workspace · workspace T1')
    fireEvent.change(screen.getByLabelText('Slack workspace'), { target: { value: 'work' } })
    await screen.findByRole('alert')
    expect((screen.getByLabelText('Slack channel') as HTMLSelectElement).value).toBe('')
    expect(api.sendSlackNotes).not.toHaveBeenCalled()
  })
  it('does not post twice on repeated clicks while a send is pending', async () => {
    let finish: (v: {
      state: string
      channelId: string
      teamId: string
      ts: string
    }) => void = () => {}
    vi.mocked(api.sendSlackNotes).mockImplementation(
      () =>
        new Promise(r => {
          finish = r
        }),
    )
    render(<SlackNotesShare {...props} />)
    await choose()
    await preview()
    const send = screen.getByText('Send these notes to #same-channel')
    fireEvent.click(send)
    fireEvent.click(send)
    await waitFor(() => expect(api.sendSlackNotes).toHaveBeenCalledOnce())
    finish({ state: 'sent', channelId: 'C1', teamId: 'T1', ts: 'fictional' })
    await screen.findByText(/Sent to Same workspace/)
  })
})

it('identifies an exact Studio OAuth source and never replaces a mismatched saved grant', async () => {
  vi.mocked(api.slackNotesWorkspaces).mockResolvedValue({
    owner: owner1,
    accounts: [
      { accountId: 'studio:slack:42', teamId: 'T1', name: 'Workspace', source: 'studio' },
      { accountId: 'work', teamId: 'T1', name: 'Workspace', source: 'gateway' },
    ],
    warnings: ['Studio send support is not deployed.'],
  })
  await api.rememberConfirmedSlackDestination({
    owner: owner1,
    accountId: 'studio:slack:99',
    teamId: 'T1',
    channelId: 'C1',
  }, props.calendarAccountEmail, { state: 'sent', teamId: 'T1', channelId: 'C1', ts: 'synthetic' }, () => true)
  render(<SlackNotesShare {...props} />)
  await screen.findByText('Workspace · Studio T1')
  expect(screen.getByText('Workspace · Scout T1')).toBeTruthy()
  expect((screen.getByLabelText('Slack workspace') as HTMLSelectElement).value).toBe('')
  expect(api.slackNotesChannels).not.toHaveBeenCalled()
  fireEvent.change(screen.getByLabelText('Slack workspace'), {
    target: { value: 'studio:slack:42' },
  })
  await screen.findByText('#same-channel · C1')
  expect(api.slackNotesChannels).toHaveBeenCalledWith({
    owner: owner1,
    accountId: 'studio:slack:42',
    teamId: 'T1',
  }, expect.any(AbortSignal))
  expect(api.sendSlackNotes).not.toHaveBeenCalled()
  expect(screen.getByText('Studio send support is not deployed.')).toBeTruthy()
})

it('shows connected-workspace discovery instead of falsely offering reconnect while pending', async () => {
  let finish!: (value: Awaited<ReturnType<typeof api.slackNotesWorkspaces>>) => void
  vi.mocked(api.slackNotesWorkspaces).mockImplementationOnce(() => new Promise(resolve => { finish = resolve }))
  render(<SlackNotesShare {...props} />)
  expect(screen.getByRole('option', {name:'Loading connected workspaces…'})).toBeTruthy()
  expect(screen.queryByRole('button', {name:'Connect Slack'})).toBeNull()
  finish({owner:owner1,accounts:workspaces})
  await waitFor(() => expect(screen.getByRole('option', {name:'Choose workspace'})).toBeTruthy())
})

it('copies during a pending channel request without previewing or sending', async () => {
  let finish!: (value: { channels: api.SlackNotesChannel[] }) => void
  vi.mocked(api.slackNotesChannels).mockImplementationOnce(() => new Promise(resolve => { finish = resolve }))
  render(<SlackNotesShare {...props} />)
  await screen.findByText('Same workspace · workspace T1')
  fireEvent.change(screen.getByLabelText('Slack workspace'), { target: { value: 'work' } })
  await screen.findByText(/Checking available Slack channels/)
  const copy = screen.getByRole('button', { name: 'Copy for Slack' }) as HTMLButtonElement
  expect(copy.disabled).toBe(false)
  expect((screen.getByRole('button', { name: 'Preview send to channel' }) as HTMLButtonElement).disabled).toBe(true)
  fireEvent.click(copy)
  await screen.findByText(/Copied for Slack/)
  expect(api.sendSlackNotes).not.toHaveBeenCalled()
  finish({ channels: [] })
  await screen.findByText('No joined channels are available with this connection.')
})

it('opens with already validated exact workspace and channel and does not post', async () => {
  const destination = { owner: owner1, accountId: 'work', teamId: 'T1', channelId: 'C1' }
  const channel = { id: 'C1', name: 'confirmed', private: false }
  render(<SlackNotesShare {...props} warmSuggestion={{
    scope: api.slackSuggestionScope(props.threadId, props.userEmail, props.calendarAccountEmail),
    destination,
    workspace: workspaces[0],
    channel,
    inventory: { owner: owner1, accounts: workspaces },
    listed: { channels: [channel] },
    validatedAt: Date.now(),
  }} />)
  await screen.findByText('#confirmed')
  expect((screen.getByLabelText('Slack workspace') as HTMLSelectElement).value).toBe('work')
  expect((screen.getByLabelText('Slack channel') as HTMLSelectElement).value).toBe('C1')
  expect(api.slackNotesWorkspaces).not.toHaveBeenCalled()
  expect(api.slackNotesChannels).not.toHaveBeenCalled()
  expect(api.sendSlackNotes).not.toHaveBeenCalled()
})
