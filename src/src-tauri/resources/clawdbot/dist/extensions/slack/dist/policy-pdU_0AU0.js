import { a as normalizeSlackSlug } from "./allow-list-ChDz7vQO.js";
import { normalizeLowercaseStringOrEmpty } from "openclaw/plugin-sdk/string-coerce-runtime";
import { applyChannelMatchMeta, buildChannelKeyCandidates, resolveChannelEntryMatchWithFallback } from "openclaw/plugin-sdk/channel-targets";
import { mergePairLoopGuardConfig } from "openclaw/plugin-sdk/pair-loop-guard-runtime";
//#region extensions/slack/src/monitor/channel-config.ts
function firstDefined(...values) {
	for (const value of values) if (value !== void 0) return value;
}
function resolveSlackChannelLabel(params) {
	const channelName = params.channelName?.trim();
	if (channelName) return `#${normalizeSlackSlug(channelName) || channelName}`;
	const channelId = params.channelId?.trim();
	return channelId ? `#${channelId}` : "unknown channel";
}
function resolveSlackChannelConfig(params) {
	const { channelId, channelName, channels, channelKeys, defaultRequireMention, allowNameMatching } = params;
	const entries = channels ?? {};
	const keys = channelKeys ?? Object.keys(entries);
	const normalizedName = channelName ? normalizeSlackSlug(channelName) : "";
	const directName = channelName ? channelName.trim() : "";
	const channelIdLower = normalizeLowercaseStringOrEmpty(channelId);
	const channelIdUpper = channelId.toUpperCase();
	const channelTarget = `channel:${channelId}`;
	const channelTargetLower = `channel:${channelIdLower}`;
	const channelTargetUpper = `channel:${channelIdUpper}`;
	const match = resolveChannelEntryMatchWithFallback({
		entries,
		keys: buildChannelKeyCandidates(channelId, channelIdLower !== channelId ? channelIdLower : void 0, channelIdUpper !== channelId ? channelIdUpper : void 0, channelTarget, channelTargetLower !== channelTarget ? channelTargetLower : void 0, channelTargetUpper !== channelTarget ? channelTargetUpper : void 0, allowNameMatching ? channelName ? `#${directName}` : void 0 : void 0, allowNameMatching ? directName : void 0, allowNameMatching ? normalizedName : void 0),
		wildcardKey: "*"
	});
	const { entry: matched, wildcardEntry: fallback } = match;
	const requireMentionDefault = defaultRequireMention ?? true;
	if (keys.length === 0) return {
		allowed: true,
		requireMention: requireMentionDefault
	};
	if (!matched && !fallback) return {
		allowed: false,
		requireMention: requireMentionDefault
	};
	const resolved = matched ?? fallback ?? {};
	return applyChannelMatchMeta({
		allowed: firstDefined(resolved.enabled, fallback?.enabled, true) ?? true,
		requireMention: firstDefined(resolved.requireMention, fallback?.requireMention, requireMentionDefault) ?? requireMentionDefault,
		allowBots: firstDefined(resolved.allowBots, fallback?.allowBots),
		botLoopProtection: mergePairLoopGuardConfig(fallback?.botLoopProtection, matched?.botLoopProtection),
		users: firstDefined(resolved.users, fallback?.users),
		skills: firstDefined(resolved.skills, fallback?.skills),
		systemPrompt: firstDefined(resolved.systemPrompt, fallback?.systemPrompt)
	}, match);
}
//#endregion
//#region extensions/slack/src/monitor/policy.ts
function isSlackChannelAllowedByPolicy(params) {
	if (params.groupPolicy === "disabled") return false;
	return params.groupPolicy !== "allowlist" || params.channelAllowlistConfigured && params.channelAllowed;
}
//#endregion
export { resolveSlackChannelConfig as n, resolveSlackChannelLabel as r, isSlackChannelAllowedByPolicy as t };
