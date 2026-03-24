import { t as resolveGlobalMap } from "./global-singleton-D9TlHTN5.js";
//#region src/infra/system-events.ts
const MAX_EVENTS = 20;
const queues = resolveGlobalMap(Symbol.for("openclaw.systemEvents.queues"));
function requireSessionKey(key) {
	const trimmed = typeof key === "string" ? key.trim() : "";
	if (!trimmed) throw new Error("system events require a sessionKey");
	return trimmed;
}
function normalizeContextKey(key) {
	if (!key) return null;
	const trimmed = key.trim();
	if (!trimmed) return null;
	return trimmed.toLowerCase();
}
function getSessionQueue(sessionKey) {
	return queues.get(requireSessionKey(sessionKey));
}
function getOrCreateSessionQueue(sessionKey) {
	const key = requireSessionKey(sessionKey);
	const existing = queues.get(key);
	if (existing) return existing;
	const created = {
		queue: [],
		lastText: null,
		lastContextKey: null
	};
	queues.set(key, created);
	return created;
}
function isSystemEventContextChanged(sessionKey, contextKey) {
	const existing = getSessionQueue(sessionKey);
	return normalizeContextKey(contextKey) !== (existing?.lastContextKey ?? null);
}
function enqueueSystemEvent(text, options) {
	const entry = getOrCreateSessionQueue(requireSessionKey(options?.sessionKey));
	const cleaned = text.trim();
	if (!cleaned) return false;
	const normalizedContextKey = normalizeContextKey(options?.contextKey);
	entry.lastContextKey = normalizedContextKey;
	if (entry.lastText === cleaned) return false;
	entry.lastText = cleaned;
	entry.queue.push({
		text: cleaned,
		ts: Date.now(),
		contextKey: normalizedContextKey
	});
	if (entry.queue.length > MAX_EVENTS) entry.queue.shift();
	return true;
}
function drainSystemEventEntries(sessionKey) {
	const key = requireSessionKey(sessionKey);
	const entry = getSessionQueue(key);
	if (!entry || entry.queue.length === 0) return [];
	const out = entry.queue.slice();
	entry.queue.length = 0;
	entry.lastText = null;
	entry.lastContextKey = null;
	queues.delete(key);
	return out;
}
function drainSystemEvents(sessionKey) {
	return drainSystemEventEntries(sessionKey).map((event) => event.text);
}
function peekSystemEventEntries(sessionKey) {
	return getSessionQueue(sessionKey)?.queue.map((event) => ({ ...event })) ?? [];
}
function peekSystemEvents(sessionKey) {
	return peekSystemEventEntries(sessionKey).map((event) => event.text);
}
function hasSystemEvents(sessionKey) {
	return (getSessionQueue(sessionKey)?.queue.length ?? 0) > 0;
}
function resetSystemEventsForTest() {
	queues.clear();
}
//#endregion
export { isSystemEventContextChanged as a, resetSystemEventsForTest as c, hasSystemEvents as i, drainSystemEvents as n, peekSystemEventEntries as o, enqueueSystemEvent as r, peekSystemEvents as s, drainSystemEventEntries as t };
