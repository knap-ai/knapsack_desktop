// Desktop steering is acknowledged only after the active runner accepts it.
// Never fall back to starting a separate turn: the desktop still owns the queue.
export function createDesktopSteerHandler(resolveActiveSession, enqueue) {
  const attempts = new Map();
  return async ({ params, respond }) => {
    if (!params || typeof params.sessionKey !== 'string' || !params.sessionKey.startsWith('agent:main:webchat:dm:') || typeof params.message !== 'string' || !params.message.trim() || params.message.length > 16000 || typeof params.idempotencyKey !== 'string' || !params.idempotencyKey.trim() || params.idempotencyKey.length > 200) {
      respond(false, undefined, { code: 'INVALID_REQUEST', message: 'Invalid desktop steering request' }); return;
    }
    const key = `${params.sessionKey}:${params.idempotencyKey}`;
    let attempt = attempts.get(key);
    if (!attempt) {
      attempt = (async () => {
        const sessionId = resolveActiveSession(params.sessionKey);
        if (!sessionId) return { queued: false, reason: 'No active turn. Your prompt is still queued.' };
        return enqueue(sessionId, params.message, { steeringMode: 'all', debounceMs: 0 });
      })().catch(() => ({ queued: false, reason: 'The active turn could not accept steering. Your prompt is still queued.' }));
      attempts.set(key, attempt);
      if (attempts.size > 256) attempts.delete(attempts.keys().next().value);
    }
    const result = await attempt;
    if (!result.queued && attempts.get(key) === attempt) attempts.delete(key);
    respond(true, { accepted: result.queued === true, message: result.queued ? 'Applied to the current turn.' : (result.reason || 'Keep this prompt queued for the next turn.') });
  };
}
