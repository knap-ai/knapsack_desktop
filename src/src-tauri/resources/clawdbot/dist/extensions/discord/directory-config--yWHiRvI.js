import { t as __exportAll } from "./rolldown-runtime-DUslC3ob.js";
import { a as resolveDefaultDiscordAccountId, i as mergeDiscordAccountConfig } from "./accounts-zcI4mtzH.js";
import { normalizeAccountId } from "openclaw/plugin-sdk/account-id";
import { createResolvedDirectoryEntriesLister } from "openclaw/plugin-sdk/directory-runtime";
//#region extensions/discord/src/directory-config.ts
var directory_config_exports = /* @__PURE__ */ __exportAll({
	listDiscordDirectoryGroupsFromConfig: () => listDiscordDirectoryGroupsFromConfig,
	listDiscordDirectoryPeersFromConfig: () => listDiscordDirectoryPeersFromConfig
});
function resolveDiscordDirectoryConfigAccount(cfg, accountId) {
	const resolvedAccountId = normalizeAccountId(accountId ?? resolveDefaultDiscordAccountId(cfg));
	const config = mergeDiscordAccountConfig(cfg, resolvedAccountId);
	return {
		accountId: resolvedAccountId,
		config,
		dm: config.dm
	};
}
const listDiscordDirectoryPeersFromConfig = createResolvedDirectoryEntriesLister({
	kind: "user",
	resolveAccount: (cfg, accountId) => resolveDiscordDirectoryConfigAccount(cfg, accountId),
	resolveSources: (account) => {
		const allowFrom = account.config.allowFrom ?? account.config.dm?.allowFrom ?? [];
		const guildUsers = Object.values(account.config.guilds ?? {}).flatMap((guild) => [...guild.users ?? [], ...Object.values(guild.channels ?? {}).flatMap((channel) => channel.users ?? [])]);
		return [
			allowFrom,
			Object.keys(account.config.dms ?? {}),
			guildUsers
		];
	},
	normalizeId: (raw) => {
		const cleaned = (raw.match(/^<@!?(\d+)>$/)?.[1] ?? raw).replace(/^(discord|user):/i, "").trim();
		return /^\d+$/.test(cleaned) ? `user:${cleaned}` : null;
	}
});
const listDiscordDirectoryGroupsFromConfig = createResolvedDirectoryEntriesLister({
	kind: "group",
	resolveAccount: (cfg, accountId) => resolveDiscordDirectoryConfigAccount(cfg, accountId),
	resolveSources: (account) => Object.values(account.config.guilds ?? {}).map((guild) => Object.keys(guild.channels ?? {})),
	normalizeId: (raw) => {
		const cleaned = (raw.match(/^<#(\d+)>$/)?.[1] ?? raw).replace(/^(discord|channel|group):/i, "").trim();
		return /^\d+$/.test(cleaned) ? `channel:${cleaned}` : null;
	}
});
//#endregion
export { listDiscordDirectoryGroupsFromConfig as n, listDiscordDirectoryPeersFromConfig as r, directory_config_exports as t };
