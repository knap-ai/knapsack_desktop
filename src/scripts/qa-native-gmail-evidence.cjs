const fs = require('node:fs');
const path = require('node:path');

function verifyNativeGmailEvidence(events) {
  const calls = new Map();
  const successes = [];
  for (const event of events) {
    const message = event.message || {};
    for (const block of Array.isArray(message.content) ? message.content : []) {
      if (message.role === 'assistant' && block.type === 'toolCall'
        && block.name === 'studio__gmail_read') calls.set(block.id, block.arguments);
    }
    if (message.role !== 'toolResult' || message.toolName !== 'studio__gmail_read'
      || message.isError || !calls.has(message.toolCallId)) continue;
    for (const block of message.content || []) {
      try {
        const value = JSON.parse(block.text);
        if (value.provider === 'native_google' && !value.error) {
          successes.push({ arguments: calls.get(message.toolCallId), value });
        }
      } catch { /* Non-JSON prose is not native API evidence. */ }
    }
  }
  const accounts = successes.find(item => item.arguments.action === 'accounts'
    && Array.isArray(item.value.accounts));
  if (!accounts) return { ok: false, detail: 'No successful native Gmail accounts invocation in this session' };
  const missing = accounts.value.accounts.filter(email => !successes.some(item =>
    item.arguments.action === 'list' && item.arguments.account_email === email
    && item.value.account_email === email && item.value.result));
  return { ok: missing.length === 0,
    detail: missing.length ? `${missing.length} native mailbox reads lack successful tool evidence`
      : `Verified native Gmail account discovery and ${accounts.value.accounts.length} mailbox reads` };
}

function readNativeGmailEvidence(stateDir, sessionId) {
  try {
    const directory = path.join(stateDir, 'agents', 'main', 'sessions');
    const index = JSON.parse(fs.readFileSync(path.join(directory, 'sessions.json'), 'utf8'));
    const session = index[`agent:main:webchat:dm:${sessionId}`];
    if (!session) throw new Error('session missing');
    const file = session.sessionFile || path.join(directory, `${session.sessionId}.jsonl`);
    const events = fs.readFileSync(file, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse);
    return verifyNativeGmailEvidence(events);
  } catch {
    return { ok: false, detail: 'Native Gmail invocation trace unavailable' };
  }
}

module.exports = { verifyNativeGmailEvidence, readNativeGmailEvidence };
