import { i as mergeTelegramAccountConfig, o as resolveDefaultTelegramAccountId, r as listTelegramAccountIds, s as resolveTelegramAccount } from "./accounts-CoskdHdZ.js";
import { t as inspectTelegramAccount } from "./account-inspect-C9xPCRmJ.js";
import { t as isNumericTelegramSenderUserId } from "./allow-from-BSf89MjI.js";
import { o as lookupTelegramChatId, t as createTelegramPluginBase } from "./shared-B0aXBwuj.js";
import { normalizeOptionalString } from "openclaw/plugin-sdk/text-runtime";
import { resolveChannelAllowFromPath } from "openclaw/plugin-sdk/channel-pairing";
import { createEnvPatchedAccountSetupAdapter, patchChannelConfigForAccount, promptResolvedAllowFrom, splitSetupEntries } from "openclaw/plugin-sdk/setup-runtime";
import { formatCliCommand, formatDocsLink } from "openclaw/plugin-sdk/setup-tools";
import { DEFAULT_ACCOUNT_ID, addWildcardAllowFrom, applySetupAccountConfigPatch, createAllowFromSection, createStandardChannelSetupStatus, hasConfiguredSecretInput, patchChannelConfigForAccount as patchChannelConfigForAccount$1, setSetupChannelEnabled, splitSetupEntries as splitSetupEntries$1 } from "openclaw/plugin-sdk/setup";
import fs from "node:fs";
//#region extensions/telegram/src/setup-core.ts
const channel$2 = "telegram";
const TELEGRAM_TOKEN_HELP_LINES = [
	"1) Open Telegram and chat with @BotFather",
	"2) Run /newbot (or /mybots)",
	"3) Copy the token (looks like 123456:ABC...)",
	"Tip: you can also set TELEGRAM_BOT_TOKEN in your env.",
	`Docs: ${formatDocsLink("/telegram")}`,
	"Website: https://openclaw.ai"
];
const TELEGRAM_USER_ID_HELP_LINES = [
	`1) DM your bot, then read from.id in \`${formatCliCommand("openclaw logs --follow")}\` (safest)`,
	"2) Or call https://api.telegram.org/bot<bot_token>/getUpdates and read message.from.id",
	"3) Third-party: DM @userinfobot or @getidsbot",
	`Docs: ${formatDocsLink("/telegram")}`,
	"Website: https://openclaw.ai"
];
function normalizeTelegramAllowFromInput(raw) {
	return raw.trim().replace(/^(telegram|tg):/i, "").trim();
}
function parseTelegramAllowFromId(raw) {
	const stripped = normalizeTelegramAllowFromInput(raw);
	return isNumericTelegramSenderUserId(stripped) ? stripped : null;
}
async function resolveTelegramAllowFromEntries(params) {
	return await Promise.all(params.entries.map(async (entry) => {
		const numericId = parseTelegramAllowFromId(entry);
		if (numericId) return {
			input: entry,
			resolved: true,
			id: numericId
		};
		const stripped = normalizeTelegramAllowFromInput(entry);
		if (!stripped || !params.credentialValue?.trim()) return {
			input: entry,
			resolved: false,
			id: null
		};
		const username = stripped.startsWith("@") ? stripped : `@${stripped}`;
		const id = await lookupTelegramChatId({
			token: params.credentialValue,
			chatId: username,
			apiRoot: params.apiRoot,
			proxyUrl: params.proxyUrl,
			network: params.network
		});
		return {
			input: entry,
			resolved: Boolean(id),
			id
		};
	}));
}
async function promptTelegramAllowFromForAccount(params) {
	const accountId = params.accountId ?? resolveDefaultTelegramAccountId(params.cfg);
	const resolved = resolveTelegramAccount({
		cfg: params.cfg,
		accountId
	});
	await params.prompter.note(TELEGRAM_USER_ID_HELP_LINES.join("\n"), "Telegram user id");
	if (!resolved.token?.trim()) await params.prompter.note("Telegram token missing; username lookup is unavailable.", "Telegram");
	const unique = await promptResolvedAllowFrom({
		prompter: params.prompter,
		existing: resolved.config.allowFrom ?? [],
		token: resolved.token,
		message: "Telegram allowFrom (numeric sender id; @username resolves to id)",
		placeholder: "@username",
		label: "Telegram allowlist",
		parseInputs: splitSetupEntries,
		parseId: parseTelegramAllowFromId,
		invalidWithoutTokenNote: "Telegram token missing; use numeric sender ids (usernames require a bot token).",
		resolveEntries: async ({ entries, token }) => resolveTelegramAllowFromEntries({
			credentialValue: token,
			entries,
			apiRoot: resolved.config.apiRoot,
			proxyUrl: resolved.config.proxy,
			network: resolved.config.network
		})
	});
	return patchChannelConfigForAccount({
		cfg: params.cfg,
		channel: channel$2,
		accountId,
		patch: {
			dmPolicy: "allowlist",
			allowFrom: unique
		}
	});
}
const telegramSetupAdapter = createEnvPatchedAccountSetupAdapter({
	channelKey: channel$2,
	defaultAccountOnlyEnvError: "TELEGRAM_BOT_TOKEN can only be used for the default account.",
	missingCredentialError: "Telegram requires token or --token-file (or --use-env).",
	hasCredentials: (input) => Boolean(input.token || input.tokenFile),
	buildPatch: (input) => input.tokenFile ? { tokenFile: input.tokenFile } : input.token ? { botToken: input.token } : {}
});
//#endregion
//#region extensions/telegram/src/setup-surface.helpers.ts
const channel$1 = "telegram";
function ensureTelegramDefaultGroupMentionGate(cfg, accountId) {
	const resolved = resolveTelegramAccount({
		cfg,
		accountId
	});
	const wildcardGroup = resolved.config.groups?.["*"];
	if (wildcardGroup?.requireMention !== void 0) return cfg;
	return patchChannelConfigForAccount$1({
		cfg,
		channel: channel$1,
		accountId,
		patch: { groups: {
			...resolved.config.groups,
			"*": {
				...wildcardGroup,
				requireMention: true
			}
		} }
	});
}
function shouldShowTelegramDmAccessWarning(cfg, accountId) {
	const merged = mergeTelegramAccountConfig(cfg, accountId);
	const policy = merged.dmPolicy ?? "pairing";
	const hasAllowFrom = Array.isArray(merged.allowFrom) && merged.allowFrom.some((entry) => normalizeOptionalString(String(entry)));
	return policy === "pairing" && !hasAllowFrom;
}
function buildTelegramDmAccessWarningLines(accountId) {
	const configBase = accountId === DEFAULT_ACCOUNT_ID ? "channels.telegram" : `channels.telegram.accounts.${accountId}`;
	return [
		"Your bot is using DM policy: pairing.",
		"Any Telegram user who discovers the bot can send pairing requests.",
		"For private use, configure an allowlist with your Telegram user id:",
		"  " + formatCliCommand(`openclaw config set ${configBase}.dmPolicy "allowlist"`),
		"  " + formatCliCommand(`openclaw config set ${configBase}.allowFrom '["YOUR_USER_ID"]'`),
		`Docs: ${formatDocsLink("/channels/pairing", "channels/pairing")}`
	];
}
const telegramSetupDmPolicy = {
	label: "Telegram",
	channel: channel$1,
	policyKey: "channels.telegram.dmPolicy",
	allowFromKey: "channels.telegram.allowFrom",
	resolveConfigKeys: (cfg, accountId) => (accountId ?? resolveDefaultTelegramAccountId(cfg)) !== DEFAULT_ACCOUNT_ID ? {
		policyKey: `channels.telegram.accounts.${accountId ?? resolveDefaultTelegramAccountId(cfg)}.dmPolicy`,
		allowFromKey: `channels.telegram.accounts.${accountId ?? resolveDefaultTelegramAccountId(cfg)}.allowFrom`
	} : {
		policyKey: "channels.telegram.dmPolicy",
		allowFromKey: "channels.telegram.allowFrom"
	},
	getCurrent: (cfg, accountId) => mergeTelegramAccountConfig(cfg, accountId ?? resolveDefaultTelegramAccountId(cfg)).dmPolicy ?? "pairing",
	setPolicy: (cfg, policy, accountId) => {
		const resolvedAccountId = accountId ?? resolveDefaultTelegramAccountId(cfg);
		const merged = mergeTelegramAccountConfig(cfg, resolvedAccountId);
		const patch = {
			dmPolicy: policy,
			...policy === "open" ? { allowFrom: addWildcardAllowFrom(merged.allowFrom) } : {}
		};
		return accountId == null && resolvedAccountId !== DEFAULT_ACCOUNT_ID ? applySetupAccountConfigPatch({
			cfg,
			channelKey: channel$1,
			accountId: resolvedAccountId,
			patch
		}) : patchChannelConfigForAccount$1({
			cfg,
			channel: channel$1,
			accountId: resolvedAccountId,
			patch
		});
	},
	promptAllowFrom: promptTelegramAllowFromForAccount
};
//#endregion
//#region extensions/telegram/src/setup-surface.ts
const channel = "telegram";
const telegramSetupWizard = {
	channel,
	status: createStandardChannelSetupStatus({
		channelLabel: "Telegram",
		configuredLabel: "configured",
		unconfiguredLabel: "needs token",
		configuredHint: "recommended · configured",
		unconfiguredHint: "recommended · newcomer-friendly",
		configuredScore: 1,
		unconfiguredScore: 10,
		resolveConfigured: ({ cfg, accountId }) => (accountId ? [accountId] : listTelegramAccountIds(cfg)).some((resolvedAccountId) => {
			return inspectTelegramAccount({
				cfg,
				accountId: resolvedAccountId
			}).configured;
		})
	}),
	prepare: async ({ cfg, accountId, credentialValues }) => ({
		cfg: ensureTelegramDefaultGroupMentionGate(cfg, accountId),
		credentialValues
	}),
	credentials: [{
		inputKey: "token",
		providerHint: channel,
		credentialLabel: "Telegram bot token",
		preferredEnvVar: "TELEGRAM_BOT_TOKEN",
		helpTitle: "Telegram bot token",
		helpLines: TELEGRAM_TOKEN_HELP_LINES,
		envPrompt: "TELEGRAM_BOT_TOKEN detected. Use env var?",
		keepPrompt: "Telegram token already configured. Keep it?",
		inputPrompt: "Enter Telegram bot token",
		allowEnv: ({ accountId }) => accountId === DEFAULT_ACCOUNT_ID,
		inspect: ({ cfg, accountId }) => {
			const resolved = resolveTelegramAccount({
				cfg,
				accountId
			});
			const hasConfiguredValue = hasConfiguredSecretInput(resolved.config.botToken) || Boolean(resolved.config.tokenFile?.trim());
			return {
				accountConfigured: Boolean(resolved.token) || hasConfiguredValue,
				hasConfiguredValue,
				resolvedValue: normalizeOptionalString(resolved.token),
				envValue: accountId === DEFAULT_ACCOUNT_ID ? normalizeOptionalString(process.env.TELEGRAM_BOT_TOKEN) : void 0
			};
		}
	}],
	allowFrom: createAllowFromSection({
		helpTitle: "Telegram user id",
		helpLines: TELEGRAM_USER_ID_HELP_LINES,
		credentialInputKey: "token",
		message: "Telegram allowFrom (numeric sender id; @username resolves to id)",
		placeholder: "@username",
		invalidWithoutCredentialNote: "Telegram token missing; use numeric sender ids (usernames require a bot token).",
		parseInputs: splitSetupEntries$1,
		parseId: parseTelegramAllowFromId,
		resolveEntries: async ({ cfg, accountId, credentialValues, entries }) => resolveTelegramAllowFromEntries({
			credentialValue: credentialValues.token,
			entries,
			apiRoot: resolveTelegramAccount({
				cfg,
				accountId
			}).config.apiRoot
		}),
		apply: async ({ cfg, accountId, allowFrom }) => patchChannelConfigForAccount$1({
			cfg,
			channel,
			accountId,
			patch: {
				dmPolicy: "allowlist",
				allowFrom
			}
		})
	}),
	finalize: async ({ cfg, accountId, prompter }) => {
		if (!shouldShowTelegramDmAccessWarning(cfg, accountId)) return;
		await prompter.note(buildTelegramDmAccessWarningLines(accountId).join("\n"), "Telegram DM access warning");
	},
	dmPolicy: telegramSetupDmPolicy,
	disable: (cfg) => setSetupChannelEnabled(cfg, channel, false)
};
//#endregion
//#region extensions/telegram/src/state-migrations.ts
function fileExists(pathValue) {
	try {
		return fs.existsSync(pathValue) && fs.statSync(pathValue).isFile();
	} catch {
		return false;
	}
}
function detectTelegramLegacyStateMigrations(params) {
	const legacyPath = resolveChannelAllowFromPath("telegram", params.env);
	if (!fileExists(legacyPath)) return [];
	const accountId = resolveDefaultTelegramAccountId(params.cfg);
	const targetPath = resolveChannelAllowFromPath("telegram", params.env, accountId);
	if (fileExists(targetPath)) return [];
	return [{
		kind: "copy",
		label: "Telegram pairing allowFrom",
		sourcePath: legacyPath,
		targetPath
	}];
}
//#endregion
//#region extensions/telegram/src/channel.setup.ts
const telegramSetupPlugin = {
	...createTelegramPluginBase({
		setupWizard: telegramSetupWizard,
		setup: telegramSetupAdapter
	}),
	lifecycle: { detectLegacyStateMigrations: ({ cfg, env }) => detectTelegramLegacyStateMigrations({
		cfg,
		env
	}) }
};
//#endregion
export { telegramSetupAdapter as i, detectTelegramLegacyStateMigrations as n, telegramSetupWizard as r, telegramSetupPlugin as t };
