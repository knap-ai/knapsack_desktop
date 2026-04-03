import { _ as normalizeAccountId } from "./session-key-D7XpmyVq.js";
import { a as hasConfiguredSecretInput, l as normalizeSecretInputString } from "./types.secrets-DTXJhyWe.js";
import "./secret-input-C8U7qpTM.js";
import { a as resolveDefaultDiscordAccountId, i as mergeDiscordAccountConfig, s as resolveDiscordAccountConfig } from "./accounts-7Ym6HIvs.js";
//#region extensions/discord/src/account-inspect.ts
function inspectDiscordTokenValue(value) {
	const normalized = normalizeSecretInputString(value);
	if (normalized) return {
		token: normalized.replace(/^Bot\s+/i, ""),
		tokenSource: "config",
		tokenStatus: "available"
	};
	if (hasConfiguredSecretInput(value)) return {
		token: "",
		tokenSource: "config",
		tokenStatus: "configured_unavailable"
	};
	return null;
}
function inspectDiscordAccount(params) {
	const accountId = normalizeAccountId(params.accountId ?? resolveDefaultDiscordAccountId(params.cfg));
	const merged = mergeDiscordAccountConfig(params.cfg, accountId);
	const enabled = params.cfg.channels?.discord?.enabled !== false && merged.enabled !== false;
	const accountConfig = resolveDiscordAccountConfig(params.cfg, accountId);
	const hasAccountToken = Boolean(accountConfig && Object.prototype.hasOwnProperty.call(accountConfig, "token"));
	const accountToken = inspectDiscordTokenValue(accountConfig?.token);
	if (accountToken) return {
		accountId,
		enabled,
		name: merged.name?.trim() || void 0,
		token: accountToken.token,
		tokenSource: accountToken.tokenSource,
		tokenStatus: accountToken.tokenStatus,
		configured: true,
		config: merged
	};
	if (hasAccountToken) return {
		accountId,
		enabled,
		name: merged.name?.trim() || void 0,
		token: "",
		tokenSource: "none",
		tokenStatus: "missing",
		configured: false,
		config: merged
	};
	const channelToken = inspectDiscordTokenValue(params.cfg.channels?.discord?.token);
	if (channelToken) return {
		accountId,
		enabled,
		name: merged.name?.trim() || void 0,
		token: channelToken.token,
		tokenSource: channelToken.tokenSource,
		tokenStatus: channelToken.tokenStatus,
		configured: true,
		config: merged
	};
	const envToken = accountId === "default" ? normalizeSecretInputString(params.envToken ?? process.env.DISCORD_BOT_TOKEN) : void 0;
	if (envToken) return {
		accountId,
		enabled,
		name: merged.name?.trim() || void 0,
		token: envToken.replace(/^Bot\s+/i, ""),
		tokenSource: "env",
		tokenStatus: "available",
		configured: true,
		config: merged
	};
	return {
		accountId,
		enabled,
		name: merged.name?.trim() || void 0,
		token: "",
		tokenSource: "none",
		tokenStatus: "missing",
		configured: false,
		config: merged
	};
}
//#endregion
export { inspectDiscordAccount as t };
