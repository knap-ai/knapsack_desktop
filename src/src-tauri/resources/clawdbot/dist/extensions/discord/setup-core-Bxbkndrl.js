import { n as resolveDiscordToken } from "./token-D-w3Rigl.js";
import { a as resolveDefaultDiscordAccountId, i as mergeDiscordAccountConfig, s as resolveDiscordAccountConfig } from "./accounts-zcI4mtzH.js";
import { DEFAULT_ACCOUNT_ID, normalizeAccountId } from "openclaw/plugin-sdk/account-id";
import { hasConfiguredSecretInput, normalizeSecretInputString } from "openclaw/plugin-sdk/secret-input";
import { normalizeOptionalString } from "openclaw/plugin-sdk/text-runtime";
import { createAccountScopedAllowFromSection, createAccountScopedGroupAccessSection, createAllowlistSetupWizardProxy, createLegacyCompatChannelDmPolicy, createStandardChannelSetupStatus, parseMentionOrPrefixedId, patchChannelConfigForAccount, promptLegacyChannelAllowFromForAccount, resolveEntriesWithOptionalToken, setSetupChannelEnabled } from "openclaw/plugin-sdk/setup-runtime";
import { formatDocsLink } from "openclaw/plugin-sdk/setup-tools";
import "openclaw/plugin-sdk/account-resolution";
//#region extensions/discord/src/setup-account-state.ts
function inspectConfiguredToken(value) {
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
function resolveDefaultDiscordSetupAccountId(cfg) {
	return resolveDefaultDiscordAccountId(cfg);
}
function resolveDiscordSetupAccountConfig(params) {
	const accountId = normalizeAccountId(params.accountId ?? resolveDefaultDiscordSetupAccountId(params.cfg));
	return {
		accountId,
		config: mergeDiscordAccountConfig(params.cfg, accountId)
	};
}
function inspectDiscordSetupAccount(params) {
	const { accountId, config } = resolveDiscordSetupAccountConfig(params);
	const enabled = params.cfg.channels?.discord?.enabled !== false && config.enabled !== false;
	const accountConfig = resolveDiscordAccountConfig(params.cfg, accountId);
	const hasAccountToken = Boolean(accountConfig && Object.prototype.hasOwnProperty.call(accountConfig, "token"));
	const accountToken = inspectConfiguredToken(accountConfig?.token);
	if (accountToken) return {
		accountId,
		enabled,
		token: accountToken.token,
		tokenSource: accountToken.tokenSource,
		tokenStatus: accountToken.tokenStatus,
		configured: true,
		config
	};
	if (hasAccountToken) return {
		accountId,
		enabled,
		token: "",
		tokenSource: "none",
		tokenStatus: "missing",
		configured: false,
		config
	};
	const channelToken = inspectConfiguredToken(params.cfg.channels?.discord?.token);
	if (channelToken) return {
		accountId,
		enabled,
		token: channelToken.token,
		tokenSource: channelToken.tokenSource,
		tokenStatus: channelToken.tokenStatus,
		configured: true,
		config
	};
	const tokenResolution = resolveDiscordToken(params.cfg, { accountId });
	if (tokenResolution.token) return {
		accountId,
		enabled,
		token: tokenResolution.token,
		tokenSource: tokenResolution.source,
		tokenStatus: "available",
		configured: true,
		config
	};
	return {
		accountId,
		enabled,
		token: "",
		tokenSource: "none",
		tokenStatus: "missing",
		configured: false,
		config
	};
}
//#endregion
//#region extensions/discord/src/setup-core.ts
const channel = "discord";
const DISCORD_TOKEN_HELP_LINES = [
	"1) Discord Developer Portal -> Applications -> New Application",
	"2) Bot -> Add Bot -> Reset Token -> copy token",
	"3) OAuth2 -> URL Generator -> scope 'bot' -> invite to your server",
	"Tip: enable Message Content Intent if you need message text. (Bot -> Privileged Gateway Intents -> Message Content Intent)",
	`Docs: ${formatDocsLink("/discord", "discord")}`
];
function setDiscordGuildChannelAllowlist(cfg, accountId, entries) {
	const guilds = { ...accountId === DEFAULT_ACCOUNT_ID ? cfg.channels?.discord?.guilds ?? {} : cfg.channels?.discord?.accounts?.[accountId]?.guilds ?? {} };
	for (const entry of entries) {
		const guildKey = entry.guildKey || "*";
		const existing = guilds[guildKey] ?? {};
		if (entry.channelKey) {
			const channels = { ...existing.channels };
			channels[entry.channelKey] = { enabled: true };
			guilds[guildKey] = {
				...existing,
				channels
			};
		} else guilds[guildKey] = existing;
	}
	return patchChannelConfigForAccount({
		cfg,
		channel,
		accountId,
		patch: { guilds }
	});
}
function parseDiscordAllowFromId(value) {
	return parseMentionOrPrefixedId({
		value,
		mentionPattern: /^<@!?(\d+)>$/,
		prefixPattern: /^(user:|discord:)/i,
		idPattern: /^\d+$/
	});
}
function createDiscordSetupWizardBase(handlers) {
	const discordDmPolicy = createLegacyCompatChannelDmPolicy({
		label: "Discord",
		channel,
		promptAllowFrom: handlers.promptAllowFrom
	});
	return {
		channel,
		status: createStandardChannelSetupStatus({
			channelLabel: "Discord",
			configuredLabel: "configured",
			unconfiguredLabel: "needs token",
			configuredHint: "configured",
			unconfiguredHint: "needs token",
			configuredScore: 2,
			unconfiguredScore: 1,
			resolveConfigured: ({ cfg, accountId }) => inspectDiscordSetupAccount({
				cfg,
				accountId
			}).configured
		}),
		credentials: [{
			inputKey: "token",
			providerHint: channel,
			credentialLabel: "Discord bot token",
			preferredEnvVar: "DISCORD_BOT_TOKEN",
			helpTitle: "Discord bot token",
			helpLines: DISCORD_TOKEN_HELP_LINES,
			envPrompt: "DISCORD_BOT_TOKEN detected. Use env var?",
			keepPrompt: "Discord token already configured. Keep it?",
			inputPrompt: "Enter Discord bot token",
			allowEnv: ({ accountId }) => accountId === DEFAULT_ACCOUNT_ID,
			inspect: ({ cfg, accountId }) => {
				const account = inspectDiscordSetupAccount({
					cfg,
					accountId
				});
				return {
					accountConfigured: account.configured,
					hasConfiguredValue: account.tokenStatus !== "missing",
					resolvedValue: normalizeOptionalString(account.token),
					envValue: accountId === DEFAULT_ACCOUNT_ID ? normalizeOptionalString(process.env.DISCORD_BOT_TOKEN) : void 0
				};
			}
		}],
		groupAccess: createAccountScopedGroupAccessSection({
			channel,
			label: "Discord channels",
			placeholder: "My Server/#general, guildId/channelId, #support",
			currentPolicy: ({ cfg, accountId }) => resolveDiscordSetupAccountConfig({
				cfg,
				accountId
			}).config.groupPolicy ?? "allowlist",
			currentEntries: ({ cfg, accountId }) => Object.entries(resolveDiscordSetupAccountConfig({
				cfg,
				accountId
			}).config.guilds ?? {}).flatMap(([guildKey, value]) => {
				const channels = value?.channels ?? {};
				const channelKeys = Object.keys(channels);
				if (channelKeys.length === 0) return [/^\d+$/.test(guildKey) ? `guild:${guildKey}` : guildKey];
				return channelKeys.map((channelKey) => `${guildKey}/${channelKey}`);
			}),
			updatePrompt: ({ cfg, accountId }) => Boolean(resolveDiscordSetupAccountConfig({
				cfg,
				accountId
			}).config.guilds),
			resolveAllowlist: handlers.resolveGroupAllowlist,
			fallbackResolved: (entries) => entries.map((input) => ({
				input,
				resolved: false
			})),
			applyAllowlist: ({ cfg, accountId, resolved }) => setDiscordGuildChannelAllowlist(cfg, accountId, resolved)
		}),
		allowFrom: createAccountScopedAllowFromSection({
			channel,
			credentialInputKey: "token",
			helpTitle: "Discord allowlist",
			helpLines: [
				"Allowlist Discord DMs by username (we resolve to user ids).",
				"Examples:",
				"- 123456789012345678",
				"- @alice",
				"- alice#1234",
				"Multiple entries: comma-separated.",
				`Docs: ${formatDocsLink("/discord", "discord")}`
			],
			message: "Discord allowFrom (usernames or ids)",
			placeholder: "@alice, 123456789012345678",
			invalidWithoutCredentialNote: "Bot token missing; use numeric user ids (or mention form) only.",
			parseId: parseDiscordAllowFromId,
			resolveEntries: handlers.resolveAllowFromEntries
		}),
		dmPolicy: discordDmPolicy,
		disable: (cfg) => setSetupChannelEnabled(cfg, channel, false)
	};
}
function createDiscordSetupWizardProxy(loadWizard) {
	return createAllowlistSetupWizardProxy({
		loadWizard,
		createBase: createDiscordSetupWizardBase,
		fallbackResolvedGroupAllowlist: (entries) => entries.map((input) => ({
			input,
			resolved: false
		}))
	});
}
//#endregion
export { resolveEntriesWithOptionalToken as a, promptLegacyChannelAllowFromForAccount as i, createDiscordSetupWizardProxy as n, resolveDefaultDiscordSetupAccountId as o, parseDiscordAllowFromId as r, resolveDiscordSetupAccountConfig as s, createDiscordSetupWizardBase as t };
