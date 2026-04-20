import { normalizeResolvedSecretInputString } from "openclaw/plugin-sdk/secret-input";
import { DEFAULT_ACCOUNT_ID, normalizeAccountId, resolveAccountEntry } from "openclaw/plugin-sdk/routing";
//#region extensions/discord/src/token.ts
function normalizeDiscordToken(raw, path) {
	const trimmed = normalizeResolvedSecretInputString({
		value: raw,
		path
	});
	if (!trimmed) return;
	return trimmed.replace(/^Bot\s+/i, "");
}
function resolveDiscordToken(cfg, opts = {}) {
	const accountId = normalizeAccountId(opts.accountId);
	const discordCfg = cfg?.channels?.discord;
	const accountCfg = resolveAccountEntry(discordCfg?.accounts, accountId);
	const hasAccountToken = Boolean(accountCfg && Object.prototype.hasOwnProperty.call(accountCfg, "token"));
	const accountToken = normalizeDiscordToken(accountCfg?.token ?? void 0, `channels.discord.accounts.${accountId}.token`);
	if (accountToken) return {
		token: accountToken,
		source: "config"
	};
	if (hasAccountToken) return {
		token: "",
		source: "none"
	};
	const configToken = normalizeDiscordToken(discordCfg?.token ?? void 0, "channels.discord.token");
	if (configToken) return {
		token: configToken,
		source: "config"
	};
	const envToken = accountId === DEFAULT_ACCOUNT_ID ? normalizeDiscordToken(opts.envToken ?? process.env.DISCORD_BOT_TOKEN, "DISCORD_BOT_TOKEN") : void 0;
	if (envToken) return {
		token: envToken,
		source: "env"
	};
	return {
		token: "",
		source: "none"
	};
}
//#endregion
export { resolveDiscordToken as n, normalizeDiscordToken as t };
