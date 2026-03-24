import { t as formatDocsLink } from "./links-8xRhWBQL.js";
import { _ as normalizeAccountId, g as DEFAULT_ACCOUNT_ID } from "./session-key-DAhnzjyr.js";
import { a as hasConfiguredSecretInput } from "./types.secrets-DgX397vI.js";
import { l as TelegramConfigSchema } from "./zod-schema.providers-core-COy5nBQ0.js";
import { r as getChatChannelMeta } from "./registry-C5UkPpaO.js";
import { t as formatCliCommand } from "./command-format-DBQUhADm.js";
import { Bb as createChannelPluginBase, Db as formatAllowFromLowercase, G_ as listTelegramAccountIds, H_ as inspectTelegramAccount, J_ as resolveDefaultTelegramAccountId, Jb as adaptScopedAccountAccessor, K_ as mergeTelegramAccountConfig, Qb as createScopedChannelConfigAdapter, R_ as lookupTelegramChatId, Y_ as resolveTelegramAccount } from "./pi-embedded-CbCYZxIb.js";
import { r as createEnvPatchedAccountSetupAdapter } from "./setup-helpers-B2gYys18.js";
import { r as buildChannelConfigSchema } from "./config-schema-CPzP2Ds6.js";
import { $ as setChannelDmPolicyWithAllowFrom, H as promptResolvedAllowFrom, P as patchChannelConfigForAccount, m as createAllowFromSection, rt as setSetupChannelEnabled, st as splitSetupEntries, x as createStandardChannelSetupStatus } from "./setup-wizard-proxy-DoOpOF8S.js";
//#region extensions/telegram/src/setup-core.ts
const channel$1 = "telegram";
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
	return /^\d+$/.test(stripped) ? stripped : null;
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
		channel: channel$1,
		accountId,
		patch: {
			dmPolicy: "allowlist",
			allowFrom: unique
		}
	});
}
const telegramSetupAdapter = createEnvPatchedAccountSetupAdapter({
	channelKey: channel$1,
	defaultAccountOnlyEnvError: "TELEGRAM_BOT_TOKEN can only be used for the default account.",
	missingCredentialError: "Telegram requires token or --token-file (or --use-env).",
	hasCredentials: (input) => Boolean(input.token || input.tokenFile),
	buildPatch: (input) => input.tokenFile ? { tokenFile: input.tokenFile } : input.token ? { botToken: input.token } : {}
});
//#endregion
//#region extensions/telegram/src/setup-surface.ts
const channel = "telegram";
function ensureTelegramDefaultGroupMentionGate(cfg, accountId) {
	const resolved = resolveTelegramAccount({
		cfg,
		accountId
	});
	const wildcardGroup = resolved.config.groups?.["*"];
	if (wildcardGroup?.requireMention !== void 0) return cfg;
	return patchChannelConfigForAccount({
		cfg,
		channel,
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
	const hasAllowFrom = Array.isArray(merged.allowFrom) && merged.allowFrom.some((e) => String(e).trim());
	return policy === "pairing" && !hasAllowFrom;
}
function buildTelegramDmAccessWarningLines(accountId) {
	const configBase = accountId === "default" ? "channels.telegram" : `channels.telegram.accounts.${accountId}`;
	return [
		"Your bot is using DM policy: pairing.",
		"Any Telegram user who discovers the bot can send pairing requests.",
		"For private use, configure an allowlist with your Telegram user id:",
		"  " + formatCliCommand(`openclaw config set ${configBase}.dmPolicy "allowlist"`),
		"  " + formatCliCommand(`openclaw config set ${configBase}.allowFrom '["YOUR_USER_ID"]'`),
		`Docs: ${formatDocsLink("/channels/pairing", "channels/pairing")}`
	];
}
const dmPolicy = {
	label: "Telegram",
	channel,
	policyKey: "channels.telegram.dmPolicy",
	allowFromKey: "channels.telegram.allowFrom",
	getCurrent: (cfg) => cfg.channels?.telegram?.dmPolicy ?? "pairing",
	setPolicy: (cfg, policy) => setChannelDmPolicyWithAllowFrom({
		cfg,
		channel,
		dmPolicy: policy
	}),
	promptAllowFrom: promptTelegramAllowFromForAccount
};
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
		resolveConfigured: ({ cfg }) => listTelegramAccountIds(cfg).some((accountId) => {
			return inspectTelegramAccount({
				cfg,
				accountId
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
				resolvedValue: resolved.token?.trim() || void 0,
				envValue: accountId === "default" ? process.env.TELEGRAM_BOT_TOKEN?.trim() || void 0 : void 0
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
		parseInputs: splitSetupEntries,
		parseId: parseTelegramAllowFromId,
		resolveEntries: async ({ cfg, accountId, credentialValues, entries }) => resolveTelegramAllowFromEntries({
			credentialValue: credentialValues.token,
			entries,
			apiRoot: resolveTelegramAccount({
				cfg,
				accountId
			}).config.apiRoot
		}),
		apply: async ({ cfg, accountId, allowFrom }) => patchChannelConfigForAccount({
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
	dmPolicy,
	disable: (cfg) => setSetupChannelEnabled(cfg, channel, false)
};
//#endregion
//#region extensions/telegram/src/shared.ts
const TELEGRAM_CHANNEL = "telegram";
function findTelegramTokenOwnerAccountId(params) {
	const normalizedAccountId = normalizeAccountId(params.accountId);
	const tokenOwners = /* @__PURE__ */ new Map();
	for (const id of listTelegramAccountIds(params.cfg)) {
		const account = inspectTelegramAccount({
			cfg: params.cfg,
			accountId: id
		});
		const token = (account.token ?? "").trim();
		if (!token) continue;
		const ownerAccountId = tokenOwners.get(token);
		if (!ownerAccountId) {
			tokenOwners.set(token, account.accountId);
			continue;
		}
		if (account.accountId === normalizedAccountId) return ownerAccountId;
	}
	return null;
}
function formatDuplicateTelegramTokenReason(params) {
	return `Duplicate Telegram bot token: account "${params.accountId}" shares a token with account "${params.ownerAccountId}". Keep one owner account per bot token.`;
}
const telegramConfigAdapter = createScopedChannelConfigAdapter({
	sectionKey: TELEGRAM_CHANNEL,
	listAccountIds: listTelegramAccountIds,
	resolveAccount: adaptScopedAccountAccessor(resolveTelegramAccount),
	inspectAccount: adaptScopedAccountAccessor(inspectTelegramAccount),
	defaultAccountId: resolveDefaultTelegramAccountId,
	clearBaseFields: [
		"botToken",
		"tokenFile",
		"name"
	],
	resolveAllowFrom: (account) => account.config.allowFrom,
	formatAllowFrom: (allowFrom) => formatAllowFromLowercase({
		allowFrom,
		stripPrefixRe: /^(telegram|tg):/i
	}),
	resolveDefaultTo: (account) => account.config.defaultTo
});
function createTelegramPluginBase(params) {
	return createChannelPluginBase({
		id: TELEGRAM_CHANNEL,
		meta: {
			...getChatChannelMeta(TELEGRAM_CHANNEL),
			quickstartAllowFrom: true
		},
		setupWizard: params.setupWizard,
		capabilities: {
			chatTypes: [
				"direct",
				"group",
				"channel",
				"thread"
			],
			reactions: true,
			threads: true,
			media: true,
			polls: true,
			nativeCommands: true,
			blockStreaming: true
		},
		reload: { configPrefixes: ["channels.telegram"] },
		configSchema: buildChannelConfigSchema(TelegramConfigSchema),
		config: {
			...telegramConfigAdapter,
			isConfigured: (account, cfg) => {
				if (!account.token?.trim()) return false;
				return !findTelegramTokenOwnerAccountId({
					cfg,
					accountId: account.accountId
				});
			},
			unconfiguredReason: (account, cfg) => {
				if (!account.token?.trim()) return "not configured";
				const ownerAccountId = findTelegramTokenOwnerAccountId({
					cfg,
					accountId: account.accountId
				});
				if (!ownerAccountId) return "not configured";
				return formatDuplicateTelegramTokenReason({
					accountId: account.accountId,
					ownerAccountId
				});
			},
			describeAccount: (account, cfg) => ({
				accountId: account.accountId,
				name: account.name,
				enabled: account.enabled,
				configured: Boolean(account.token?.trim()) && !findTelegramTokenOwnerAccountId({
					cfg,
					accountId: account.accountId
				}),
				tokenSource: account.tokenSource
			})
		},
		setup: params.setup
	});
}
//#endregion
export { telegramSetupWizard as a, telegramConfigAdapter as i, findTelegramTokenOwnerAccountId as n, telegramSetupAdapter as o, formatDuplicateTelegramTokenReason as r, createTelegramPluginBase as t };
