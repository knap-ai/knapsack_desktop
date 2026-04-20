import { normalizeOptionalLowercaseString } from "openclaw/plugin-sdk/text-runtime";
import { compileAllowlist, resolveCompiledAllowlistMatch } from "openclaw/plugin-sdk/allow-from";
import { normalizeHyphenSlug, normalizeStringEntries as normalizeStringEntries$1, normalizeStringEntriesLower } from "openclaw/plugin-sdk/string-normalization-runtime";
//#region extensions/slack/src/monitor/allow-list.ts
const SLACK_SLUG_CACHE_MAX = 512;
const slackSlugCache = /* @__PURE__ */ new Map();
function normalizeSlackSlug(raw) {
	const key = raw ?? "";
	const cached = slackSlugCache.get(key);
	if (cached !== void 0) return cached;
	const normalized = normalizeHyphenSlug(raw);
	slackSlugCache.set(key, normalized);
	if (slackSlugCache.size > SLACK_SLUG_CACHE_MAX) {
		const oldest = slackSlugCache.keys().next();
		if (!oldest.done) slackSlugCache.delete(oldest.value);
	}
	return normalized;
}
function normalizeAllowList(list) {
	return normalizeStringEntries$1(list);
}
function normalizeAllowListLower(list) {
	return normalizeStringEntriesLower(list);
}
function normalizeSlackAllowOwnerEntry(entry) {
	const trimmed = normalizeOptionalLowercaseString(entry);
	if (!trimmed || trimmed === "*") return;
	const withoutPrefix = trimmed.replace(/^(slack:|user:)/, "");
	return /^u[a-z0-9]+$/.test(withoutPrefix) ? withoutPrefix : void 0;
}
function resolveSlackAllowListMatch(params) {
	const compiledAllowList = compileAllowlist(params.allowList);
	const id = normalizeOptionalLowercaseString(params.id);
	const name = normalizeOptionalLowercaseString(params.name);
	const slug = normalizeSlackSlug(name);
	return resolveCompiledAllowlistMatch({
		compiledAllowlist: compiledAllowList,
		candidates: [
			{
				value: id,
				source: "id"
			},
			{
				value: id ? `slack:${id}` : void 0,
				source: "prefixed-id"
			},
			{
				value: id ? `user:${id}` : void 0,
				source: "prefixed-user"
			},
			...params.allowNameMatching === true ? [
				{
					value: name,
					source: "name"
				},
				{
					value: name ? `slack:${name}` : void 0,
					source: "prefixed-name"
				},
				{
					value: slug,
					source: "slug"
				}
			] : []
		]
	});
}
function allowListMatches(params) {
	return resolveSlackAllowListMatch(params).allowed;
}
function resolveSlackUserAllowed(params) {
	const allowList = normalizeAllowListLower(params.allowList);
	if (allowList.length === 0) return true;
	return allowListMatches({
		allowList,
		id: params.userId,
		name: params.userName,
		allowNameMatching: params.allowNameMatching
	});
}
//#endregion
export { normalizeSlackSlug as a, normalizeSlackAllowOwnerEntry as i, normalizeAllowList as n, resolveSlackAllowListMatch as o, normalizeAllowListLower as r, resolveSlackUserAllowed as s, allowListMatches as t };
