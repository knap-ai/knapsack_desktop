import { l as normalizeOptionalThreadValue, s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { t as getLoadedChannelPluginForRead } from "./registry-loaded-read-B9a4LkEi.js";
//#region src/channels/plugins/target-parsing-loaded.ts
function parseExplicitTargetForLoadedChannel(channel, rawTarget) {
	const resolvedChannel = normalizeOptionalString(channel);
	if (!resolvedChannel) return null;
	return getLoadedChannelPluginForRead(resolvedChannel)?.messaging?.parseExplicitTarget?.({ raw: rawTarget }) ?? null;
}
function resolveComparableTargetForLoadedChannel(params) {
	const rawTo = normalizeOptionalString(params.rawTarget);
	if (!rawTo) return null;
	const parsed = parseExplicitTargetForLoadedChannel(params.channel, rawTo);
	const fallbackThreadId = normalizeOptionalThreadValue(params.fallbackThreadId);
	return {
		rawTo,
		to: parsed?.to ?? rawTo,
		threadId: normalizeOptionalThreadValue(parsed?.threadId ?? fallbackThreadId),
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
export { parseExplicitTargetForLoadedChannel as n, resolveComparableTargetForLoadedChannel as r, comparableChannelTargetsShareRoute as t };
