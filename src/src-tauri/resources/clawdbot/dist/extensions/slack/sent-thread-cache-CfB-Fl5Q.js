import { resolveGlobalDedupeCache } from "openclaw/plugin-sdk/infra-runtime";
//#region extensions/slack/src/sent-thread-cache.ts
const threadParticipation = resolveGlobalDedupeCache(Symbol.for("openclaw.slackThreadParticipation"), {
	ttlMs: 1440 * 60 * 1e3,
	maxSize: 5e3
});
function makeKey(accountId, channelId, threadTs) {
	return `${accountId}:${channelId}:${threadTs}`;
}
function recordSlackThreadParticipation(accountId, channelId, threadTs) {
	if (!accountId || !channelId || !threadTs) return;
	threadParticipation.check(makeKey(accountId, channelId, threadTs));
}
function hasSlackThreadParticipation(accountId, channelId, threadTs) {
	if (!accountId || !channelId || !threadTs) return false;
	return threadParticipation.peek(makeKey(accountId, channelId, threadTs));
}
function clearSlackThreadParticipationCache() {
	threadParticipation.clear();
}
//#endregion
export { hasSlackThreadParticipation as n, recordSlackThreadParticipation as r, clearSlackThreadParticipationCache as t };
