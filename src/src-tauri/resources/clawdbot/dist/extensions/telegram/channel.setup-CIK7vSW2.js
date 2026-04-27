import { t as mergeTelegramAccountConfig } from "./account-config-Cifs-fXF.js";
import { a as resolveDefaultTelegramAccountId, o as resolveTelegramAccount, r as listTelegramAccountIds } from "./accounts-q2NkR7D9.js";
import { t as inspectTelegramAccount } from "./account-inspect-BpeovZkl.js";
import { t as isNumericTelegramSenderUserId } from "./allow-from-DDSIFusT.js";
import { t as createTelegramPluginBase } from "./shared-OkW04SMA.js";
import { t as detectTelegramLegacyStateMigrations } from "./state-migrations-BI1fLPW6.js";
import { normalizeOptionalString } from "openclaw/plugin-sdk/text-runtime";
import { createEnvPatchedAccountSetupAdapter, patchChannelConfigForAccount, promptResolvedAllowFrom, splitSetupEntries } from "openclaw/plugin-sdk/setup-runtime";
import { formatCliCommand, formatDocsLink } from "openclaw/plugin-sdk/setup-tools";
import { DEFAULT_ACCOUNT_ID, addWildcardAllowFrom, applySetupAccountConfigPatch, createAllowFromSection, createStandardChannelSetupStatus, hasConfiguredSecretInput, patchChannelConfigForAccount as patchChannelConfigForAccount$1, setSetupChannelEnabled, splitSetupEntries as splitSetupEntries$1 } from "openclaw/plugin-sdk/setup";
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
async function promptTelegramAllowFromForAccount(params) {
	const accountId = params.accountId ?? resolveDefaultTelegramAccountId(params.cfg);
	const resolved = resolveTelegramAccount({
		cfg: params.cfg,
		accountId
	});
	await params.prompter.note(TELEGRAM_USER_ID_HELP_LINES.join("\n"), "Telegram user id");
	const unique = await promptResolvedAllowFrom({
		prompter: params.prompter,
		existing: resolved.config.allowFrom ?? [],
		message: "Telegram allowFrom (numeric sender id)",
		placeholder: "123456789",
		label: "Telegram allowlist",
		parseInputs: splitSetupEntries,
		parseId: parseTelegramAllowFromId,
		invalidWithoutTokenNote: "Telegram allowFrom requires numeric sender ids. DM your bot first, then copy from.id from logs or getUpdates.",
		resolveEntries: async ({ entries }) => entries.map((entry) => {
			const id = parseTelegramAllowFromId(entry);
			return {
				input: entry,
				resolved: Boolean(id),
				id
			};
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
		message: "Telegram allowFrom (numeric sender id)",
		placeholder: "123456789",
		invalidWithoutCredentialNote: "Telegram allowFrom requires numeric sender ids. DM your bot first, then copy from.id from logs or getUpdates.",
		parseInputs: splitSetupEntries$1,
		parseId: parseTelegramAllowFromId,
		resolveEntries: async ({ entries }) => entries.map((entry) => {
			const id = parseTelegramAllowFromId(entry);
			return {
				input: entry,
				resolved: Boolean(id),
				id
			};
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
export { telegramSetupWizard as n, telegramSetupAdapter as r, telegramSetupPlugin as t };
