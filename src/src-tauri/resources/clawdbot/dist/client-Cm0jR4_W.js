import { a as parseMentionPrefixOrAtUserTarget, l as requireTargetKind, n as ensureTargetId, t as buildMessagingTarget } from "./targets-B_oqkqrL.js";
import "./channel-status-BM83XYut.js";
import "./slack-rW_sb443.js";
import "./slack-core-_m9aqB7f.js";
import { WebClient } from "@slack/web-api";
//#region extensions/slack/src/targets.ts
function parseSlackTarget(raw, options = {}) {
	const trimmed = raw.trim();
	if (!trimmed) return;
	const userTarget = parseMentionPrefixOrAtUserTarget({
		raw: trimmed,
		mentionPattern: /^<@([A-Z0-9]+)>$/i,
		prefixes: [
			{
				prefix: "user:",
				kind: "user"
			},
			{
				prefix: "channel:",
				kind: "channel"
			},
			{
				prefix: "slack:",
				kind: "user"
			}
		],
		atUserPattern: /^[A-Z0-9]+$/i,
		atUserErrorMessage: "Slack DMs require a user id (use user:<id> or <@id>)"
	});
	if (userTarget) return userTarget;
	if (trimmed.startsWith("#")) return buildMessagingTarget("channel", ensureTargetId({
		candidate: trimmed.slice(1).trim(),
		pattern: /^[A-Z0-9]+$/i,
		errorMessage: "Slack channels require a channel id (use channel:<id>)"
	}), trimmed);
	if (options.defaultKind) return buildMessagingTarget(options.defaultKind, trimmed, trimmed);
	return buildMessagingTarget("channel", trimmed, trimmed);
}
function resolveSlackChannelId(raw) {
	return requireTargetKind({
		platform: "Slack",
		target: parseSlackTarget(raw, { defaultKind: "channel" }),
		kind: "channel"
	});
}
function normalizeSlackMessagingTarget(raw) {
	return parseSlackTarget(raw, { defaultKind: "channel" })?.normalized;
}
function looksLikeSlackTargetId(raw) {
	const trimmed = raw.trim();
	if (!trimmed) return false;
	if (/^<@([A-Z0-9]+)>$/i.test(trimmed)) return true;
	if (/^(user|channel):/i.test(trimmed)) return true;
	if (/^slack:/i.test(trimmed)) return true;
	if (/^[@#]/.test(trimmed)) return true;
	return /^[CUWGD][A-Z0-9]{8,}$/i.test(trimmed);
}
//#endregion
//#region extensions/slack/src/client.ts
const SLACK_DEFAULT_RETRY_OPTIONS = {
	retries: 2,
	factor: 2,
	minTimeout: 500,
	maxTimeout: 3e3,
	randomize: true
};
const SLACK_WRITE_RETRY_OPTIONS = { retries: 0 };
function resolveSlackWebClientOptions(options = {}) {
	return {
		...options,
		retryConfig: options.retryConfig ?? SLACK_DEFAULT_RETRY_OPTIONS
	};
}
function resolveSlackWriteClientOptions(options = {}) {
	return {
		...options,
		retryConfig: options.retryConfig ?? SLACK_WRITE_RETRY_OPTIONS
	};
}
function createSlackWebClient(token, options = {}) {
	return new WebClient(token, resolveSlackWebClientOptions(options));
}
function createSlackWriteClient(token, options = {}) {
	return new WebClient(token, resolveSlackWriteClientOptions(options));
}
//#endregion
export { resolveSlackWebClientOptions as a, normalizeSlackMessagingTarget as c, createSlackWriteClient as i, parseSlackTarget as l, SLACK_WRITE_RETRY_OPTIONS as n, resolveSlackWriteClientOptions as o, createSlackWebClient as r, looksLikeSlackTargetId as s, SLACK_DEFAULT_RETRY_OPTIONS as t, resolveSlackChannelId as u };
