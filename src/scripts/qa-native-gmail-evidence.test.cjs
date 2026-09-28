const { test } = require('node:test');
const assert = require('node:assert/strict');
const { verifyNativeGmailEvidence } = require('./qa-native-gmail-evidence.cjs');
function invocation(id, args, value, isError = false) {
  return [
    { message: { role: 'assistant', content: [{ type: 'toolCall', id, name: 'studio__gmail_read', arguments: args }] } },
    { message: { role: 'toolResult', toolCallId: id, toolName: 'studio__gmail_read', isError,
      content: [{ type: 'text', text: JSON.stringify(value) }] } },
  ];
}
test('prose and unsuccessful calls cannot pass native Gmail QA', () => {
  assert.equal(verifyNativeGmailEvidence([{ message: { role: 'assistant', content: [{ type: 'text', text: 'All calls succeeded' }] } }]).ok, false);
  assert.equal(verifyNativeGmailEvidence(invocation('1', { action: 'accounts' }, { provider: 'native_google', accounts: [] }, true)).ok, false);
  assert.equal(verifyNativeGmailEvidence(invocation('1', { action: 'accounts' }, { provider: 'composio', accounts: [] })).ok, false);
});
test('each discovered account needs a successful matching native list result', () => {
  const events = invocation('1', { action: 'accounts' }, { provider: 'native_google', accounts: ['a@example.com', 'b@example.com'] });
  events.push(...invocation('2', { action: 'list', account_email: 'a@example.com' }, { provider: 'native_google', account_email: 'a@example.com', result: { messages: [] } }));
  assert.equal(verifyNativeGmailEvidence(events).ok, false);
  events.push(...invocation('3', { action: 'list', account_email: 'b@example.com' }, { provider: 'native_google', account_email: 'b@example.com', result: { messages: [] } }));
  assert.equal(verifyNativeGmailEvidence(events).ok, true);
});
test('a successful native empty account list is valid evidence', () => {
  assert.equal(verifyNativeGmailEvidence(invocation('1', { action: 'accounts' }, { provider: 'native_google', accounts: [] })).ok, true);
});
