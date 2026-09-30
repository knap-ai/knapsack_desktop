import { useEffect, useState } from 'react'
import { getSlackAccounts, getSlackAdmins, nominateSlackAdmin, SlackAdminNomination } from 'src/api/channels'

export default function SlackAdminSettings() {
  const [admins, setAdmins] = useState<SlackAdminNomination[]>([])
  const [accounts, setAccounts] = useState<string[]>([])
  const [account, setAccount] = useState('')
  const [workspace, setWorkspace] = useState('')
  const [member, setMember] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  useEffect(() => {
    Promise.all([getSlackAccounts(), getSlackAdmins()]).then(([a, n]) => {
      setAccounts(a.accounts.map(row => row.id))
      setAccount(a.accounts[0]?.id || '')
      setAdmins(n.admins || [])
    }).catch(e => setMessage(e.message || 'Could not load Slack admin settings'))
  }, [])
  const save = async (account_id: string, workspace_id: string, user_id: string | null) => {
    setBusy(true)
    setMessage('')
    try {
      const result = await nominateSlackAdmin({ account_id, workspace_id, user_id })
      if (!result.success) throw new Error(result.message || 'Could not save admin')
      setAdmins((await getSlackAdmins()).admins)
      setMessage(user_id ? 'Admin verified with Slack and saved. Make sure this person is already on the DM allow list.' : 'Admin access revoked.')
      setMember('')
    } catch (e: any) { setMessage(e.message || 'Could not save admin') }
    finally { setBusy(false) }
  }
  return <section style={{ marginTop: 16 }} aria-label="Slack allow-list admin">
    <h4>Slack allow-list admin</h4>
    <p>Nominate one admin per workspace. They can ask Scout in Slack to add a member to the DM allow list. Only you can nominate or revoke admins here.</p>
    {admins.map(a => <div key={`${a.account_id}:${a.workspace_id}`}>
      {a.email} · {a.workspace_id} · {a.user_id}{' '}
      <button disabled={busy} onClick={() => save(a.account_id, a.workspace_id, null)}>Revoke admin</button>
    </div>)}
    <label>Slack account <select disabled={busy} value={account} onChange={e => setAccount(e.target.value)}>
      {accounts.map(id => <option key={id} value={id}>{id}</option>)}
    </select></label>{' '}
    <label>Workspace ID <input disabled={busy} value={workspace} onChange={e => setWorkspace(e.target.value.trim())} placeholder="T…" /></label>{' '}
    <label>Admin member ID <input disabled={busy} value={member} onChange={e => setMember(e.target.value.trim())} placeholder="U…" /></label>{' '}
    <button disabled={busy || !account || !workspace || !member} onClick={() => save(account, workspace, member)}>Verify and nominate admin</button>
    <p>Slack verifies the member belongs to the selected workspace. This grants allow-list management only, not Slack workspace administration.</p>
    {message && <p role="status">{message}</p>}
  </section>
}
