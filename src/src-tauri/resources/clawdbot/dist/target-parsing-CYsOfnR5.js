import { r as normalizeChatChannelId } from "./chat-meta-Cdrnv7R-.js";
import "./registry-DTO_OK4F.js";
import { r as normalizeChannelId, t as getChannelPlugin } from "./registry-fiJfPVib.js";
import "./plugins-DF32jmMU.js";
//#region src/channels/plugins/target-parsing.ts
function normalizeComparableThreadId(threadId) {
	if (typeof threadId === "number") return Number.isFinite(threadId) ? Math.trunc(threadId) : void 0;
	if (typeof threadId !== "string") return;
	const trimmed = threadId.trim();
	return trimmed ? trimmed : void 0;
}
function parseWithPlugin(rawChannel, rawTarget) {
	const channel = normalizeChatChannelId(rawChannel) ?? normalizeChannelId(rawChannel);
	if (!channel) return null;
	return getChannelPlugin(channel)?.messaging?.parseExplicitTarget?.({ raw: rawTarget }) ?? null;
}
function parseExplicitTargetForChannel(channel, rawTarget) {
	return parseWithPlugin(channel, rawTarget);
}
function resolveComparableTargetForChannel(params) {
	const rawTo = params.rawTarget?.trim();
	if (!rawTo) return null;
	const parsed = parseExplicitTargetForChannel(params.channel, rawTo);
	const fallbackThreadId = normalizeComparableThreadId(params.fallbackThreadId);
	return {
		rawTo,
		to: parsed?.to ?? rawTo,
		threadId: normalizeComparableThreadId(parsed?.threadId ?? fallbackThreadId),
		chatType: parsed?.chatType
	};
}
function comparableChannelTargetsShareRoute(params) {
	const left = params.left;
	const right = params.right;
	if (!left || !right) return false;
	if (left.to !== right.to) return false;
	if (left.threadId == null || right.threadId == null) return true;
	return left.threadId === right.threadId;
}
//#endregion
export { parseExplicitTargetForChannel as n, resolveComparableTargetForChannel as r, comparableChannelTargetsShareRoute as t };
