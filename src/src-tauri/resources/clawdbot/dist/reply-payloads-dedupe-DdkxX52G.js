import { i as normalizeLowercaseStringOrEmpty, s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { r as normalizeOptionalAccountId } from "./account-id-j7GeQlaZ.js";
import { a as normalizeAnyChannelId } from "./registry-CENZffQG.js";
import { t as getChannelPlugin } from "./registry-Delpa74L.js";
import "./plugins-D4ODSIPT.js";
import { i as isMessagingToolDuplicate } from "./pi-embedded-helpers-6UMMUO8y.js";
import { a as normalizeTargetForProvider } from "./target-normalization-j5fHpTkf.js";
//#region src/auto-reply/reply/reply-payloads-dedupe.ts
function filterMessagingToolDuplicates(params) {
	const { payloads, sentTexts } = params;
	if (sentTexts.length === 0) return payloads;
	return payloads.filter((payload) => !isMessagingToolDuplicate(payload.text ?? "", sentTexts));
}
function filterMessagingToolMediaDuplicates(params) {
	const normalizeMediaForDedupe = (value) => {
		const trimmed = value.trim();
		if (!trimmed) return "";
		if (!normalizeLowercaseStringOrEmpty(trimmed).startsWith("file://")) return trimmed;
		try {
			const parsed = new URL(trimmed);
			if (parsed.protocol === "file:") return decodeURIComponent(parsed.pathname || "");
		} catch {}
		return trimmed.replace(/^file:\/\//i, "");
	};
	const { payloads, sentMediaUrls } = params;
	if (sentMediaUrls.length === 0) return payloads;
	const sentSet = new Set(sentMediaUrls.map(normalizeMediaForDedupe).filter(Boolean));
	return payloads.map((payload) => {
		const mediaUrl = payload.mediaUrl;
		const mediaUrls = payload.mediaUrls;
		const stripSingle = mediaUrl && sentSet.has(normalizeMediaForDedupe(mediaUrl));
		const filteredUrls = mediaUrls?.filter((u) => !sentSet.has(normalizeMediaForDedupe(u)));
		if (!stripSingle && (!mediaUrls || filteredUrls?.length === mediaUrls.length)) return payload;
		return {
			...payload,
			mediaUrl: stripSingle ? void 0 : mediaUrl,
			mediaUrls: filteredUrls?.length ? filteredUrls : void 0
		};
	});
}
function normalizeProviderForComparison(value) {
	const trimmed = normalizeOptionalString(value);
	if (!trimmed) return;
	const lowered = normalizeLowercaseStringOrEmpty(trimmed);
	const normalizedChannel = normalizeAnyChannelId(trimmed);
	if (normalizedChannel) return normalizedChannel;
	return lowered;
}
function normalizeThreadIdForComparison(value) {
	const trimmed = normalizeOptionalString(value);
	if (!trimmed) return;
	if (/^-?\d+$/.test(trimmed)) return String(Number.parseInt(trimmed, 10));
	return normalizeLowercaseStringOrEmpty(trimmed);
}
function resolveTargetProviderForComparison(params) {
	const targetProvider = normalizeProviderForComparison(params.targetProvider);
	if (!targetProvider || targetProvider === "message") return params.currentProvider;
	return targetProvider;
}
function targetsMatchForSuppression(params) {
	const pluginMatch = getChannelPlugin(params.provider)?.outbound?.targetsMatchForReplySuppression;
	if (pluginMatch) return pluginMatch({
		originTarget: params.originTarget,
		targetKey: params.targetKey,
		targetThreadId: normalizeThreadIdForComparison(params.targetThreadId)
	});
	return params.targetKey === params.originTarget;
}
function shouldSuppressMessagingToolReplies(params) {
	const provider = normalizeProviderForComparison(params.messageProvider);
	if (!provider) return false;
	const originRawTarget = normalizeOptionalString(params.originatingTo);
	const originAccount = normalizeOptionalAccountId(params.accountId);
	const sentTargets = params.messagingToolSentTargets ?? [];
	if (sentTargets.length === 0) return false;
	return sentTargets.some((target) => {
		const targetProvider = resolveTargetProviderForComparison({
			currentProvider: provider,
			targetProvider: target?.provider
		});
		if (targetProvider !== provider) return false;
		const targetAccount = normalizeOptionalAccountId(target.accountId);
		if (originAccount && targetAccount && originAccount !== targetAccount) return false;
		const targetRaw = normalizeOptionalString(target.to);
		if (originRawTarget && targetRaw === originRawTarget && !target.threadId) return true;
		const originTarget = normalizeTargetForProvider(provider, originRawTarget);
		if (!originTarget) return false;
		const targetKey = normalizeTargetForProvider(targetProvider, targetRaw);
		if (!targetKey) return false;
		return targetsMatchForSuppression({
			provider,
			originTarget,
			targetKey,
			targetThreadId: target.threadId
		});
	});
}
//#endregion
export { filterMessagingToolMediaDuplicates as n, shouldSuppressMessagingToolReplies as r, filterMessagingToolDuplicates as t };
