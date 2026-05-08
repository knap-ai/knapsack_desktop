import { a as normalizeLowercaseStringOrEmpty } from "./string-coerce-Bje8XVt9.js";
import { t as HEARTBEAT_TOKEN } from "./tokens-D3yEVrkk.js";
//#region src/infra/heartbeat-events-filter.ts
const MAX_EXEC_EVENT_PROMPT_CHARS = 8e3;
function buildCronEventPrompt(pendingEvents, opts) {
	const deliverToUser = opts?.deliverToUser ?? true;
	const eventText = pendingEvents.join("\n").trim();
	if (!eventText) {
		if (!deliverToUser) return "A scheduled cron event was triggered, but no event content was found. Handle this internally and reply HEARTBEAT_OK when nothing needs user-facing follow-up.";
		return "A scheduled cron event was triggered, but no event content was found. Reply HEARTBEAT_OK.";
	}
	if (!deliverToUser) return "A scheduled reminder has been triggered. The reminder content is:\n\n" + eventText + "\n\nHandle this reminder internally. Do not relay it to the user unless explicitly requested.";
	return "A scheduled reminder has been triggered. The reminder content is:\n\n" + eventText + "\n\nPlease relay this reminder to the user in a helpful and friendly way.";
}
function buildExecEventPrompt(pendingEvents, opts) {
	const deliverToUser = opts?.deliverToUser ?? true;
	const rawEventText = pendingEvents.join("\n").trim();
	const eventText = rawEventText.length > MAX_EXEC_EVENT_PROMPT_CHARS ? `${rawEventText.slice(0, MAX_EXEC_EVENT_PROMPT_CHARS)}\n\n[truncated]` : rawEventText;
	if (!eventText) return "An async command completion event was triggered, but no command output was found. Reply HEARTBEAT_OK only. Do not mention, summarize, or reuse output from any earlier run.";
	if (!deliverToUser) return "An async command completion event was triggered, but user delivery is disabled for this run. Handle the result internally and reply HEARTBEAT_OK only. Do not mention, summarize, or reuse command output.";
	return "An async command you ran earlier has completed. The command completion details are:\n\n" + eventText + "\n\nPlease relay the command output to the user in a helpful way. If the command succeeded, share the relevant output. If it failed, explain what went wrong.";
}
const HEARTBEAT_OK_PREFIX = normalizeLowercaseStringOrEmpty(HEARTBEAT_TOKEN);
function isHeartbeatAckEvent(evt) {
	const trimmed = evt.trim();
	if (!trimmed) return false;
	const lower = normalizeLowercaseStringOrEmpty(trimmed);
	if (!lower.startsWith(HEARTBEAT_OK_PREFIX)) return false;
	const suffix = lower.slice(HEARTBEAT_OK_PREFIX.length);
	if (suffix.length === 0) return true;
	return !/[a-z0-9_]/.test(suffix[0]);
}
function isHeartbeatNoiseEvent(evt) {
	const lower = normalizeLowercaseStringOrEmpty(evt);
	if (!lower) return false;
	return isHeartbeatAckEvent(lower) || lower.includes("heartbeat poll") || lower.includes("heartbeat wake");
}
function isExecCompletionEvent(evt) {
	const normalized = normalizeLowercaseStringOrEmpty(evt).trimStart();
	return /^exec finished(?::|\s*\()/.test(normalized) || /^exec (completed|failed) \([a-z0-9_-]{1,64}, (code -?\d+|signal [^)]+)\)( :: .*)?$/.test(normalized);
}
function isCronSystemEvent(evt) {
	if (!evt.trim()) return false;
	return !isHeartbeatNoiseEvent(evt) && !isExecCompletionEvent(evt);
}
//#endregion
export { isExecCompletionEvent as i, buildExecEventPrompt as n, isCronSystemEvent as r, buildCronEventPrompt as t };
