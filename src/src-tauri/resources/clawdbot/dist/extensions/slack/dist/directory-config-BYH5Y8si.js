import { t as __exportAll } from "./rolldown-runtime-D7D4PA-g.js";
import { i as resolveDefaultSlackAccountId, o as resolveSlackAccountAllowFrom, r as mergeSlackAccountConfig } from "./accounts-BnLQ3fe2.js";
import { r as parseSlackTarget } from "./target-parsing-CugsYhBQ.js";
import "./targets-C5NeqQJr.js";
import { normalizeAccountId } from "openclaw/plugin-sdk/account-resolution";
import { normalizeLowercaseStringOrEmpty } from "openclaw/plugin-sdk/string-coerce-runtime";
import { createResolvedDirectoryEntriesLister } from "openclaw/plugin-sdk/directory-config-runtime";
//#region extensions/slack/src/directory-config.ts
var directory_config_exports = /* @__PURE__ */ __exportAll({
	listSlackDirectoryGroupsFromConfig: () => listSlackDirectoryGroupsFromConfig,
	listSlackDirectoryPeersFromConfig: () => listSlackDirectoryPeersFromConfig
});
function resolveSlackDirectoryConfigAccount(cfg, accountId) {
	const resolvedAccountId = normalizeAccountId(accountId ?? resolveDefaultSlackAccountId(cfg));
	const config = mergeSlackAccountConfig(cfg, resolvedAccountId);
	return {
		accountId: resolvedAccountId,
		config,
		dm: config.dm,
		allowFrom: resolveSlackAccountAllowFrom({
			cfg,
			accountId: resolvedAccountId
		}) ?? []
	};
}
const listSlackDirectoryPeersFromConfig = createResolvedDirectoryEntriesLister({
	kind: "user",
	resolveAccount: (cfg, accountId) => resolveSlackDirectoryConfigAccount(cfg, accountId),
	resolveSources: (account) => {
		const channelUsers = Object.values(account.config.channels ?? {}).flatMap((channel) => channel.users ?? []);
		return [
			account.allowFrom,
			Object.keys(account.config.dms ?? {}),
			channelUsers
		];
	},
	normalizeId: (raw) => {
		const normalizedUserId = (raw.match(/^<@([A-Z0-9]+)>$/i)?.[1] ?? raw).replace(/^(slack|user):/i, "").trim();
		if (!normalizedUserId) return null;
		const normalized = parseSlackTarget(`user:${normalizedUserId}`, { defaultKind: "user" });
		return normalized?.kind === "user" ? `user:${normalizeLowercaseStringOrEmpty(normalized.id)}` : null;
	}
});
const listSlackDirectoryGroupsFromConfig = createResolvedDirectoryEntriesLister({
	kind: "group",
	resolveAccount: (cfg, accountId) => resolveSlackDirectoryConfigAccount(cfg, accountId),
	resolveSources: (account) => [Object.keys(account.config.channels ?? {})],
	normalizeId: (raw) => {
		const normalized = parseSlackTarget(raw, { defaultKind: "channel" });
		return normalized?.kind === "channel" ? `channel:${normalizeLowercaseStringOrEmpty(normalized.id)}` : null;
	}
});
//#endregion
export { listSlackDirectoryGroupsFromConfig as n, listSlackDirectoryPeersFromConfig as r, directory_config_exports as t };
