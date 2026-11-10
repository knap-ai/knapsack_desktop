// @vitest-environment jsdom
import { beforeEach, expect, it, vi } from 'vitest'

import { createNotesAutosave } from './notesAutosave'
import { bindNotesSave, NotesSaveProfile } from './notesSave'
import { PROFILE_CHANGED_EVENT } from './profileScope'

const json = (data: unknown) => ({ ok: true, json: async () => data }) as Response
const deferred = <T>() => {
  let resolve!: (value: T) => void
  const promise = new Promise<T>(r => {
    resolve = r
  })
  return { promise, resolve }
}
let thread = 910000
function fixture() {
  let profile: NotesSaveProfile | null = {
    uuid: 'A',
    email: 'a@example.invalid',
    sharing_permission: 1,
  }
  const local: RequestInit[] = [],
    cloud: RequestInit[] = [],
    metadata: RequestInit[] = []
  const f = {
    local,
    cloud,
    metadata,
    readProfile: vi.fn(async () => profile),
    token: vi.fn(async (email: string) => `token:${email}`),
    localResponse: async (_i: RequestInit) => json({ success: true }),
    metadataResponse: async (_i: RequestInit) =>
      json({ success: true, data: { filename: 'synthetic', participants: '[]' } }),
    cloudResponse: async (_i: RequestInit) => json({ success: true }),
  }
  const fetcher = vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
    if (String(url) === 'local') {
      local.push(init!)
      return f.localResponse(init!)
    }
    if (String(url).startsWith('metadata/')) {
      metadata.push(init!)
      return f.metadataResponse(init!)
    }
    if (String(url) === 'server/api/files/notes') {
      cloud.push(init!)
      return f.cloudResponse(init!)
    }
    throw Error('Unexpected synthetic network boundary')
  })
  return Object.assign(f, {
    fetcher,
    thread: ++thread,
    setProfile: (next: NotesSaveProfile | null, event = true) => {
      profile = next
      if (event) window.dispatchEvent(new Event(PROFILE_CHANGED_EVENT))
    },
    current: () => profile,
    bind: (expectedEmail = profile?.email) =>
      bindNotesSave({
        readProfile: f.readProfile,
        tokenForEmail: email => f.token(email),
        canShare: permission => permission === 1,
        fetcher,
        localUrl: 'local',
        metadataUrl: 'metadata',
        serverUrl: 'server',
        bindingCurrent: () => true,
        expectedEmail,
      }),
  })
}
beforeEach(() => vi.restoreAllMocks())
it('reproduces the A local-save race without ever uploading A notes using B identity or credentials', async () => {
  const f = fixture(),
    ack = deferred<Response>()
  f.localResponse = () => ack.promise
  const save = f.bind(),
    work = save(f.thread, 'Synthetic A note')
  void work.catch(() => {})
  await vi.waitFor(() => expect(f.local).toHaveLength(1))
  f.setProfile({ uuid: 'B', email: 'b@example.invalid', sharing_permission: 1 }, false)
  ack.resolve(json({ success: true }))
  await expect(work).rejects.toThrow('Account changed')
  expect(f.cloud).toEqual([])
  expect(f.metadata).toEqual([])
  expect(f.token).not.toHaveBeenCalled()
  expect(save.isCurrent()).toBe(false)
})
it('invalidates an admitted binding through A→B→A and sign-out before any queued local write', async () => {
  const f = fixture(),
    save = f.bind()
  f.setProfile({ uuid: 'B', email: 'b@example.invalid', sharing_permission: 1 })
  f.setProfile({ uuid: 'A', email: 'a@example.invalid', sharing_permission: 1 })
  await expect(save(f.thread, 'A old draft')).rejects.toThrow('Account changed')
  expect(f.local).toEqual([])
  const active = f.bind()
  f.setProfile(null)
  await expect(active(f.thread, 'A signed-out draft')).rejects.toThrow('Account changed')
  expect(f.local).toEqual([])
  expect(f.cloud).toEqual([])
})
it('carries the originating binding through the real debounce instead of reading a replacement save callback', async () => {
  const f = fixture(),
    saved = vi.fn(),
    failed = vi.fn(),
    autosave = createNotesAutosave({ saved, failed })
  autosave(f.thread, 'A draft', f.bind())
  f.setProfile({ uuid: 'B', email: 'b@example.invalid', sharing_permission: 1 })
  await autosave.flush()
  expect(f.local).toEqual([])
  expect(saved).not.toHaveBeenCalled()
  expect(failed).not.toHaveBeenCalled()
  autosave(f.thread, 'B draft', f.bind())
  await autosave.flush()
  autosave.cancel()
  expect(JSON.parse(String(f.cloud[0].body))).toMatchObject({ notes: 'B draft', uuid: 'B' })
  expect(f.cloud[0].headers).toMatchObject({ Authorization: 'Bearer token:b@example.invalid' })
  expect(f.token).toHaveBeenCalledExactlyOnceWith('b@example.invalid')
  expect(saved).toHaveBeenCalledExactlyOnceWith(f.thread, 'B draft')
})
it('does not release local ordering before A acknowledgement and rejects an old queued save before submitting it', async () => {
  const f = fixture(),
    ack = deferred<Response>()
  let first = true
  f.localResponse = async () => {
    if (first) {
      first = false
      return ack.promise
    }
    return json({ success: true })
  }
  const a = f.bind(),
    one = a(f.thread, 'A1')
  void one.catch(() => {})
  await vi.waitFor(() => expect(f.local).toHaveLength(1))
  const two = a(f.thread, 'A2')
  void two.catch(() => {})
  f.setProfile({ uuid: 'B', email: 'b@example.invalid', sharing_permission: 1 })
  const three = f.bind()(f.thread, 'B1')
  await Promise.resolve()
  expect(f.local).toHaveLength(1)
  ack.resolve(json({ success: true }))
  const results = await Promise.allSettled([one, two, three])
  expect(results.map(v => v.status)).toEqual(['rejected', 'rejected', 'fulfilled'])
  expect(f.local.map(v => JSON.parse(String(v.body)).notes)).toEqual(['A1', 'B1'])
  expect(f.cloud.map(v => JSON.parse(String(v.body)).uuid)).toEqual(['B'])
})
it('preserves outbound ordering without holding newer local autosaves behind cloud latency', async () => {
  const f = fixture(),
    cloudAck = deferred<Response>()
  let first = true
  f.cloudResponse = async () => {
    if (first) {
      first = false
      return cloudAck.promise
    }
    return json({ success: true })
  }
  const save = f.bind(),
    one = save(f.thread, 'first')
  await vi.waitFor(() => expect(f.cloud).toHaveLength(1))
  const two = save(f.thread, 'second')
  await vi.waitFor(() => expect(f.local).toHaveLength(2))
  expect(f.cloud).toHaveLength(1)
  cloudAck.resolve(json({ success: true }))
  await Promise.all([one, two])
  expect(f.cloud.map(v => JSON.parse(String(v.body)).notes)).toEqual(['first', 'second'])
  expect(f.token.mock.calls.map(v => v[0])).toEqual(['a@example.invalid', 'a@example.invalid'])
})
it.each(['metadata', 'token'])(
  'drops pending %s work on identity change and ignores stale completion',
  async stage => {
    const f = fixture(),
      pending = deferred<Response>(),
      token = deferred<string>()
    if (stage === 'metadata') f.metadataResponse = () => pending.promise
    else f.token.mockImplementation(() => token.promise)
    const work = f.bind()(f.thread, 'A pending outbound')
    void work.catch(() => {})
    await vi.waitFor(() =>
      expect(stage === 'metadata' ? f.metadata.length : f.token.mock.calls.length).toBe(1),
    )
    f.setProfile({ uuid: 'B', email: 'b@example.invalid', sharing_permission: 1 })
    await expect(work).rejects.toThrow('Account changed')
    pending.resolve(json({ success: true, data: { filename: 'late' } }))
    token.resolve('late-A-token')
    await Promise.resolve()
    expect(f.cloud).toEqual([])
    expect(f.token.mock.calls.every(v => v[0] === 'a@example.invalid')).toBe(true)
  },
)
it('aborts an already-dispatched A upload and does not acknowledge it into B even when its response arrives late', async () => {
  const f = fixture(),
    late = deferred<Response>()
  let first = true
  f.cloudResponse = async () => {
    if (first) {
      first = false
      return late.promise
    }
    return json({ success: true })
  }
  const saved = vi.fn(),
    failed = vi.fn(),
    autosave = createNotesAutosave({ saved, failed })
  autosave(f.thread, 'identical note', f.bind())
  const old = autosave.flush()
  await vi.waitFor(() => expect(f.cloud).toHaveLength(1))
  const request = f.cloud[0]
  f.setProfile({ uuid: 'B', email: 'b@example.invalid', sharing_permission: 1 })
  await old
  expect(request.signal?.aborted).toBe(true)
  expect(JSON.parse(String(request.body)).uuid).toBe('A')
  expect(request.headers).toMatchObject({ Authorization: 'Bearer token:a@example.invalid' })
  autosave(f.thread, 'identical note', f.bind())
  await autosave.flush()
  late.resolve(json({ success: true }))
  await Promise.resolve()
  autosave.cancel()
  expect(saved).toHaveBeenCalledExactlyOnceWith(f.thread, 'identical note')
  expect(failed).not.toHaveBeenCalled()
  expect(f.cloud.map(v => JSON.parse(String(v.body)).uuid)).toEqual(['A', 'B'])
})
it('checks the current sharing permission again after token resolution', async () => {
  const f = fixture(),
    token = deferred<string>()
  f.token.mockImplementation(() => token.promise)
  const work = f.bind()(f.thread, 'local only')
  await vi.waitFor(() => expect(f.token).toHaveBeenCalledOnce())
  f.setProfile({ uuid: 'A', email: 'a@example.invalid', sharing_permission: 0 }, false)
  token.resolve('A-token')
  await work
  expect(f.local).toHaveLength(1)
  expect(f.cloud).toEqual([])
})
it('refuses a signed-out binding with stale cached A profile data', async () => {
  const f = fixture()
  await expect(f.bind('')(f.thread, 'stale')).rejects.toThrow('originating account')
  expect(f.fetcher).not.toHaveBeenCalled()
  expect(f.token).not.toHaveBeenCalled()
})
it('does not retroactively upload a private-origin save when sharing becomes enabled later', async () => {
  const f = fixture()
  f.setProfile({ uuid: 'A', email: 'a@example.invalid', sharing_permission: 0 }, false)
  const ack = deferred<Response>()
  f.localResponse = () => ack.promise
  const work = f.bind()(f.thread, 'Private-origin note')
  await vi.waitFor(() => expect(f.local).toHaveLength(1))
  f.setProfile({ uuid: 'A', email: 'a@example.invalid', sharing_permission: 1 }, false)
  ack.resolve(json({ success: true }))
  await work
  expect(f.cloud).toEqual([])
  expect(f.metadata).toEqual([])
  expect(f.token).not.toHaveBeenCalled()
})
it('preserves local-success semantics when the optional cloud endpoint returns an HTTP failure', async () => {
  const f = fixture()
  f.cloudResponse = async () =>
    ({ ok: false, json: async () => ({ error: 'Synthetic unavailable' }) }) as Response
  await expect(f.bind()(f.thread, 'Durable local note')).resolves.toBeUndefined()
  expect(f.local).toHaveLength(1)
  expect(f.cloud).toHaveLength(1)
})
