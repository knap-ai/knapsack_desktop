import { t as inspectTelegramAccount } from "./account-inspect-C9xPCRmJ.js";
import { createInspectedDirectoryEntriesLister } from "openclaw/plugin-sdk/directory-runtime";
import { mapAllowFromEntries } from "openclaw/plugin-sdk/channel-config-helpers";
//#region extensions/telegram/src/directory-config.ts
const listTelegramDirectoryPeersFromConfig = createInspectedDirectoryEntriesLister({
	kind: "user",
	inspectAccount: (cfg, accountId) => inspectTelegramAccount({
		cfg,
		accountId
	}),
	resolveSources: (account) => [mapAllowFromEntries(account.config.allowFrom), Object.keys(account.config.dms ?? {})],
	normalizeId: (entry) => {
		const trimmed = entry.replace(/^(telegram|tg):/i, "").trim();
		if (!trimmed) return null;
		if (/^-?\d+$/.test(trimmed)) return trimmed;
		return trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
	}
});
const listTelegramDirectoryGroupsFromConfig = createInspectedDirectoryEntriesLister({
	kind: "group",
	inspectAccount: (cfg, accountId) => inspectTelegramAccount({
		cfg,
		accountId
	}),
	resolveSources: (account) => [Object.keys(account.config.groups ?? {})],
	normalizeId: (entry) => entry.trim() || null
});
//#endregion
export { listTelegramDirectoryPeersFromConfig as n, listTelegramDirectoryGroupsFromConfig as t };
