import { t as formatDocsLink } from "./links-Ce33eXq9.js";
import { a as hasConfiguredSecretInput } from "./types.secrets-DTXJhyWe.js";
import { r as buildChannelConfigSchema, t as AllowFromListSchema } from "./config-schema-BoSEJoAt.js";
import { t as applyAccountNameToChannelSection } from "./setup-helpers-CjYO5YkF.js";
import { n as deleteAccountFromConfigSection, r as setAccountEnabledInConfigSection } from "./config-helpers-DtQuLuCR.js";
import "./core-BghMcc08.js";
import { r as buildSecretInputSchema } from "./secret-input-C8U7qpTM.js";
import { J as setSetupChannelEnabled, f as createStandardChannelSetupStatus } from "./setup-wizard-helpers-BfrhuTOh.js";
import "./channel-config-schema-BAlK8Vas.js";
import "./setup-CPpe7OZc.js";
import "./setup-tools-D_0XhK0N.js";
import { a as resolveQQBotAccount, i as resolveDefaultQQBotAccountId, n as applyQQBotAccountConfig, r as listQQBotAccountIds, t as DEFAULT_ACCOUNT_ID } from "./config-DODp7r-t.js";
import { z } from "zod";
//#region extensions/qqbot/src/config-schema.ts
const AudioFormatPolicySchema = z.object({
	sttDirectFormats: z.array(z.string()).optional(),
	uploadDirectFormats: z.array(z.string()).optional(),
	transcodeEnabled: z.boolean().optional()
}).optional();
const QQBotSpeechQueryParamsSchema = z.record(z.string(), z.string()).optional();
const QQBotTtsSchema = z.object({
	enabled: z.boolean().optional(),
	provider: z.string().optional(),
	baseUrl: z.string().optional(),
	apiKey: z.string().optional(),
	model: z.string().optional(),
	voice: z.string().optional(),
	authStyle: z.enum(["bearer", "api-key"]).optional(),
	queryParams: QQBotSpeechQueryParamsSchema,
	speed: z.number().optional()
}).strict().optional();
const QQBotSttSchema = z.object({
	enabled: z.boolean().optional(),
	provider: z.string().optional(),
	baseUrl: z.string().optional(),
	apiKey: z.string().optional(),
	model: z.string().optional()
}).strict().optional();
const QQBotAccountSchema = z.object({
	enabled: z.boolean().optional(),
	name: z.string().optional(),
	appId: z.string().optional(),
	clientSecret: buildSecretInputSchema().optional(),
	clientSecretFile: z.string().optional(),
	allowFrom: AllowFromListSchema,
	systemPrompt: z.string().optional(),
	markdownSupport: z.boolean().optional(),
	voiceDirectUploadFormats: z.array(z.string()).optional(),
	audioFormatPolicy: AudioFormatPolicySchema,
	urlDirectUpload: z.boolean().optional(),
	upgradeUrl: z.string().optional(),
	upgradeMode: z.enum(["doc", "hot-reload"]).optional()
}).strict();
const qqbotChannelConfigSchema = buildChannelConfigSchema(QQBotAccountSchema.extend({
	tts: QQBotTtsSchema,
	stt: QQBotSttSchema,
	accounts: z.object({}).catchall(QQBotAccountSchema).optional(),
	defaultAccount: z.string().optional()
}));
//#endregion
//#region extensions/qqbot/src/setup-surface.ts
const channel = "qqbot";
/**
* Clear only the credential fields owned by the setup prompt that switched to
* env-backed resolution. This preserves mixed-source setups such as config
* AppID + env AppSecret.
*/
function clearQQBotCredentialField(cfg, accountId, field) {
	const next = { ...cfg };
	const qqbot = { ...next.channels?.qqbot || {} };
	const clearField = (entry) => {
		if (field === "appId") {
			delete entry.appId;
			return;
		}
		delete entry.clientSecret;
		delete entry.clientSecretFile;
	};
	if (accountId === "default") clearField(qqbot);
	else {
		const accounts = { ...qqbot.accounts || {} };
		if (accounts[accountId]) {
			const entry = { ...accounts[accountId] };
			clearField(entry);
			accounts[accountId] = entry;
			qqbot.accounts = accounts;
		}
	}
	next.channels = {
		...next.channels,
		qqbot
	};
	return next;
}
const QQBOT_SETUP_HELP_LINES = [
	"To create a QQ Bot, visit the QQ Open Platform:",
	`  ${formatDocsLink("https://q.qq.com", "q.qq.com")}`,
	"",
	"1. Create an application and note the AppID.",
	"2. Go to development settings to find the AppSecret."
];
const qqbotSetupWizard = {
	channel,
	status: createStandardChannelSetupStatus({
		channelLabel: "QQ Bot",
		configuredLabel: "configured",
		unconfiguredLabel: "needs AppID + AppSecret",
		configuredHint: "configured",
		unconfiguredHint: "needs AppID + AppSecret",
		configuredScore: 1,
		unconfiguredScore: 6,
		resolveConfigured: ({ cfg }) => listQQBotAccountIds(cfg).some((accountId) => {
			const account = resolveQQBotAccount(cfg, accountId, { allowUnresolvedSecretRef: true });
			return Boolean(account.appId && (Boolean(account.clientSecret) || hasConfiguredSecretInput(account.config.clientSecret) || Boolean(account.config.clientSecretFile?.trim())));
		})
	}),
	credentials: [{
		inputKey: "token",
		providerHint: channel,
		credentialLabel: "AppID",
		preferredEnvVar: "QQBOT_APP_ID",
		helpTitle: "QQ Bot AppID",
		helpLines: QQBOT_SETUP_HELP_LINES,
		envPrompt: "QQBOT_APP_ID detected. Use env var?",
		keepPrompt: "QQ Bot AppID already configured. Keep it?",
		inputPrompt: "Enter QQ Bot AppID",
		allowEnv: ({ accountId }) => accountId === DEFAULT_ACCOUNT_ID,
		inspect: ({ cfg, accountId }) => {
			const resolved = resolveQQBotAccount(cfg, accountId, { allowUnresolvedSecretRef: true });
			const hasConfiguredValue = Boolean(hasConfiguredSecretInput(resolved.config.clientSecret) || resolved.config.clientSecretFile?.trim() || resolved.clientSecret);
			return {
				accountConfigured: Boolean(resolved.appId && hasConfiguredValue),
				hasConfiguredValue: Boolean(resolved.appId),
				resolvedValue: resolved.appId || void 0,
				envValue: accountId === "default" ? process.env.QQBOT_APP_ID?.trim() || void 0 : void 0
			};
		},
		applyUseEnv: ({ cfg, accountId }) => clearQQBotCredentialField(applyQQBotAccountConfig(cfg, accountId, {}), accountId, "appId"),
		applySet: ({ cfg, accountId, resolvedValue }) => applyQQBotAccountConfig(cfg, accountId, { appId: resolvedValue })
	}, {
		inputKey: "password",
		providerHint: "qqbot-secret",
		credentialLabel: "AppSecret",
		preferredEnvVar: "QQBOT_CLIENT_SECRET",
		helpTitle: "QQ Bot AppSecret",
		helpLines: QQBOT_SETUP_HELP_LINES,
		envPrompt: "QQBOT_CLIENT_SECRET detected. Use env var?",
		keepPrompt: "QQ Bot AppSecret already configured. Keep it?",
		inputPrompt: "Enter QQ Bot AppSecret",
		allowEnv: ({ accountId }) => accountId === DEFAULT_ACCOUNT_ID,
		inspect: ({ cfg, accountId }) => {
			const resolved = resolveQQBotAccount(cfg, accountId, { allowUnresolvedSecretRef: true });
			const hasConfiguredValue = Boolean(hasConfiguredSecretInput(resolved.config.clientSecret) || resolved.config.clientSecretFile?.trim() || resolved.clientSecret);
			return {
				accountConfigured: Boolean(resolved.appId && hasConfiguredValue),
				hasConfiguredValue,
				resolvedValue: resolved.clientSecret || void 0,
				envValue: accountId === "default" ? process.env.QQBOT_CLIENT_SECRET?.trim() || void 0 : void 0
			};
		},
		applyUseEnv: ({ cfg, accountId }) => clearQQBotCredentialField(applyQQBotAccountConfig(cfg, accountId, {}), accountId, "clientSecret"),
		applySet: ({ cfg, accountId, resolvedValue }) => applyQQBotAccountConfig(cfg, accountId, { clientSecret: resolvedValue })
	}],
	disable: (cfg) => setSetupChannelEnabled(cfg, channel, false)
};
//#endregion
//#region extensions/qqbot/src/channel.setup.ts
function parseQQBotInlineToken(token) {
	const colonIdx = token.indexOf(":");
	if (colonIdx <= 0 || colonIdx === token.length - 1) return null;
	const appId = token.slice(0, colonIdx).trim();
	const clientSecret = token.slice(colonIdx + 1).trim();
	if (!appId || !clientSecret) return null;
	return {
		appId,
		clientSecret
	};
}
function validateQQBotSetupInput(params) {
	const { accountId, input } = params;
	if (!input.token && !input.tokenFile && !input.useEnv) return "QQBot requires --token (format: appId:clientSecret) or --use-env";
	if (input.useEnv && accountId !== "default") return "QQBot --use-env only supports the default account";
	if (input.token && !parseQQBotInlineToken(input.token)) return "QQBot --token must be in appId:clientSecret format";
	return null;
}
function applyQQBotSetupAccountConfig(params) {
	if (params.input.useEnv && params.accountId !== "default") return params.cfg;
	let appId = "";
	let clientSecret = "";
	if (params.input.token) {
		const parsed = parseQQBotInlineToken(params.input.token);
		if (!parsed) return params.cfg;
		appId = parsed.appId;
		clientSecret = parsed.clientSecret;
	}
	if (!appId && !params.input.tokenFile && !params.input.useEnv) return params.cfg;
	return applyQQBotAccountConfig(params.cfg, params.accountId, {
		appId,
		clientSecret,
		clientSecretFile: params.input.tokenFile,
		name: params.input.name
	});
}
/**
* Setup-only QQBot plugin — lightweight subset used during `openclaw onboard`
* and `openclaw configure` without pulling the full runtime dependencies.
*/
const qqbotSetupPlugin = {
	id: "qqbot",
	setupWizard: qqbotSetupWizard,
	meta: {
		id: "qqbot",
		label: "QQ Bot",
		selectionLabel: "QQ Bot",
		docsPath: "/channels/qqbot",
		blurb: "Connect to QQ via official QQ Bot API",
		order: 50
	},
	capabilities: {
		chatTypes: ["direct", "group"],
		media: true,
		reactions: false,
		threads: false,
		blockStreaming: true
	},
	reload: { configPrefixes: ["channels.qqbot"] },
	configSchema: qqbotChannelConfigSchema,
	config: {
		listAccountIds: (cfg) => listQQBotAccountIds(cfg),
		resolveAccount: (cfg, accountId) => resolveQQBotAccount(cfg, accountId, { allowUnresolvedSecretRef: true }),
		defaultAccountId: (cfg) => resolveDefaultQQBotAccountId(cfg),
		setAccountEnabled: ({ cfg, accountId, enabled }) => setAccountEnabledInConfigSection({
			cfg,
			sectionKey: "qqbot",
			accountId,
			enabled,
			allowTopLevel: true
		}),
		deleteAccount: ({ cfg, accountId }) => deleteAccountFromConfigSection({
			cfg,
			sectionKey: "qqbot",
			accountId,
			clearBaseFields: [
				"appId",
				"clientSecret",
				"clientSecretFile",
				"name"
			]
		}),
		isConfigured: (account) => Boolean(account?.appId && (Boolean(account?.clientSecret) || hasConfiguredSecretInput(account?.config?.clientSecret) || Boolean(account?.config?.clientSecretFile?.trim()))),
		describeAccount: (account) => ({
			accountId: account?.accountId ?? "default",
			name: account?.name,
			enabled: account?.enabled ?? false,
			configured: Boolean(account?.appId && (Boolean(account?.clientSecret) || hasConfiguredSecretInput(account?.config?.clientSecret) || Boolean(account?.config?.clientSecretFile?.trim()))),
			tokenSource: account?.secretSource
		})
	},
	setup: {
		resolveAccountId: ({ accountId }) => accountId?.trim().toLowerCase() || "default",
		applyAccountName: ({ cfg, accountId, name }) => applyAccountNameToChannelSection({
			cfg,
			channelKey: "qqbot",
			accountId,
			name
		}),
		validateInput: ({ accountId, input }) => validateQQBotSetupInput({
			accountId,
			input
		}),
		applyAccountConfig: ({ cfg, accountId, input }) => applyQQBotSetupAccountConfig({
			cfg,
			accountId,
			input
		})
	}
};
//#endregion
export { qqbotChannelConfigSchema as a, qqbotSetupWizard as i, qqbotSetupPlugin as n, validateQQBotSetupInput as r, applyQQBotSetupAccountConfig as t };
