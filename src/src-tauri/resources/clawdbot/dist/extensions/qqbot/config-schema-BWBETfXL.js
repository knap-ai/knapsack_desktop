import { n as normalizeLowercaseStringOrEmpty } from "./string-normalize-C6Z4K8Fh.js";
import { a as resolveQQBotAccount, c as describeAccount, i as resolveDefaultQQBotAccountId, l as formatAllowFrom, n as applyQQBotAccountConfig, r as listQQBotAccountIds, s as applyAccountConfig, u as isAccountConfigured } from "./config--Jdei9fe.js";
import { buildSecretInputSchema } from "openclaw/plugin-sdk/secret-input";
import { applyAccountNameToChannelSection, deleteAccountFromConfigSection, setAccountEnabledInConfigSection } from "openclaw/plugin-sdk/core";
import { DEFAULT_ACCOUNT_ID, createStandardChannelSetupStatus, setSetupChannelEnabled } from "openclaw/plugin-sdk/setup";
import { formatDocsLink } from "openclaw/plugin-sdk/setup-tools";
import { AllowFromListSchema, buildChannelConfigSchema } from "openclaw/plugin-sdk/channel-config-schema";
import { z } from "zod";
//#region extensions/qqbot/src/engine/config/setup-logic.ts
/**
* QQBot setup business logic (pure layer).
* QQBot setup 相关纯业务逻辑。
*
* Token parsing, input validation, and setup config application.
* All functions are framework-agnostic and operate on plain objects.
*/
/** Parse an inline "appId:clientSecret" token string. */
function parseInlineToken(token) {
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
/** Validate setup input for a QQBot account. Returns an error string or null. */
function validateSetupInput(accountId, input) {
	if (!input.token && !input.tokenFile && !input.useEnv) return "QQBot requires --token (format: appId:clientSecret) or --use-env";
	if (input.useEnv && accountId !== "default") return "QQBot --use-env only supports the default account";
	if (input.token && !parseInlineToken(input.token)) return "QQBot --token must be in appId:clientSecret format";
	return null;
}
/** Apply setup input to account config. Returns updated config. */
function applySetupAccountConfig(cfg, accountId, input) {
	if (input.useEnv && accountId !== "default") return cfg;
	let appId = "";
	let clientSecret = "";
	if (input.token) {
		const parsed = parseInlineToken(input.token);
		if (!parsed) return cfg;
		appId = parsed.appId;
		clientSecret = parsed.clientSecret;
	}
	if (!appId && !input.tokenFile && !input.useEnv) return cfg;
	return applyAccountConfig(cfg, accountId, {
		appId,
		clientSecret,
		clientSecretFile: input.tokenFile,
		name: input.name
	});
}
//#endregion
//#region extensions/qqbot/src/bridge/config-shared.ts
const qqbotMeta = {
	id: "qqbot",
	label: "QQ Bot",
	selectionLabel: "QQ Bot (Bot API)",
	docsPath: "/channels/qqbot",
	blurb: "Connect to QQ via official QQ Bot API",
	order: 50
};
function validateQQBotSetupInput(params) {
	return validateSetupInput(params.accountId, params.input);
}
function applyQQBotSetupAccountConfig(params) {
	return applySetupAccountConfig(params.cfg, params.accountId, params.input);
}
function isQQBotConfigured(account) {
	return isAccountConfigured(account);
}
function describeQQBotAccount(account) {
	return describeAccount(account);
}
function formatQQBotAllowFrom(params) {
	return formatAllowFrom(params.allowFrom);
}
const qqbotConfigAdapter = {
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
	isConfigured: isQQBotConfigured,
	describeAccount: describeQQBotAccount,
	resolveAllowFrom: ({ cfg, accountId }) => resolveQQBotAccount(cfg, accountId, { allowUnresolvedSecretRef: true }).config?.allowFrom,
	formatAllowFrom: ({ allowFrom }) => formatQQBotAllowFrom({ allowFrom })
};
const qqbotSetupAdapterShared = {
	resolveAccountId: ({ cfg, accountId }) => normalizeLowercaseStringOrEmpty(accountId) || resolveDefaultQQBotAccountId(cfg),
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
};
//#endregion
//#region extensions/qqbot/src/bridge/setup/finalize.ts
function isQQBotAccountConfigured(cfg, accountId) {
	const account = resolveQQBotAccount(cfg, accountId, { allowUnresolvedSecretRef: true });
	return Boolean(account.appId && account.clientSecret);
}
async function linkViaQrCode(params) {
	try {
		const { qrConnect } = await import("@tencent-connect/qqbot-connector");
		const accounts = await qrConnect({ source: "openclaw" });
		if (accounts.length === 0) {
			await params.prompter.note("未获取到任何 QQ Bot 账号信息。", "QQ Bot");
			return params.cfg;
		}
		let next = params.cfg;
		for (let i = 0; i < accounts.length; i++) {
			const { appId, appSecret } = accounts[i];
			const targetAccountId = i === 0 ? params.accountId : appId;
			next = applyQQBotAccountConfig(next, targetAccountId, {
				appId,
				clientSecret: appSecret
			});
		}
		if (accounts.length === 1) params.runtime.log(`✔ QQ Bot 绑定成功！(AppID: ${accounts[0].appId})`);
		else {
			const idList = accounts.map((a) => a.appId).join(", ");
			params.runtime.log(`✔ ${accounts.length} 个 QQ Bot 绑定成功！(AppID: ${idList})`);
		}
		return next;
	} catch (error) {
		params.runtime.error(`QQ Bot 绑定失败: ${String(error)}`);
		await params.prompter.note(["绑定失败，您可以稍后手动配置。", `文档: ${formatDocsLink("/channels/qqbot", "qqbot")}`].join("\n"), "QQ Bot");
		return params.cfg;
	}
}
async function linkViaManualInput(params) {
	const appId = await params.prompter.text({
		message: "请输入 QQ Bot AppID",
		validate: (value) => value.trim() ? void 0 : "AppID 不能为空"
	});
	const appSecret = await params.prompter.text({
		message: "请输入 QQ Bot AppSecret",
		validate: (value) => value.trim() ? void 0 : "AppSecret 不能为空"
	});
	const next = applyQQBotAccountConfig(params.cfg, params.accountId, {
		appId: appId.trim(),
		clientSecret: appSecret.trim()
	});
	await params.prompter.note("✔ QQ Bot 配置完成！", "QQ Bot");
	return next;
}
async function finalizeQQBotSetup(params) {
	const accountId = params.accountId.trim() || DEFAULT_ACCOUNT_ID;
	let next = params.cfg;
	const configured = isQQBotAccountConfigured(next, accountId);
	const mode = await params.prompter.select({
		message: configured ? "QQ 已绑定，选择操作" : "选择 QQ 绑定方式",
		options: [
			{
				value: "qr",
				label: "扫码绑定（推荐）",
				hint: "使用 QQ 扫描二维码自动完成绑定"
			},
			{
				value: "manual",
				label: "手动输入 QQ Bot AppID 和 AppSecret",
				hint: "需到 QQ 开放平台 q.qq.com 查看"
			},
			{
				value: "skip",
				label: configured ? "保持当前配置" : "稍后配置"
			}
		]
	});
	if (mode === "qr") next = await linkViaQrCode({
		cfg: next,
		accountId,
		prompter: params.prompter,
		runtime: params.runtime
	});
	else if (mode === "manual") next = await linkViaManualInput({
		cfg: next,
		accountId,
		prompter: params.prompter
	});
	else if (!configured) await params.prompter.note(["您可以稍后运行以下命令重新选择 QQ Bot 进行配置：", "  openclaw channels add"].join("\n"), "QQ Bot");
	return { cfg: next };
}
//#endregion
//#region extensions/qqbot/src/bridge/setup/surface.ts
const channel = "qqbot";
const qqbotSetupWizard = {
	channel,
	status: createStandardChannelSetupStatus({
		channelLabel: "QQ Bot",
		configuredLabel: "configured",
		unconfiguredLabel: "needs AppID + AppSercet",
		configuredHint: "configured",
		unconfiguredHint: "needs AppID + AppSercet",
		configuredScore: 1,
		unconfiguredScore: 6,
		resolveConfigured: ({ cfg, accountId }) => (accountId ? [accountId] : listQQBotAccountIds(cfg)).some((resolvedAccountId) => {
			return isAccountConfigured(resolveQQBotAccount(cfg, resolvedAccountId, { allowUnresolvedSecretRef: true }));
		})
	}),
	credentials: [],
	finalize: async ({ cfg, accountId, forceAllowFrom, prompter, runtime }) => await finalizeQQBotSetup({
		cfg,
		accountId,
		forceAllowFrom,
		prompter,
		runtime
	}),
	disable: (cfg) => setSetupChannelEnabled(cfg, channel, false)
};
//#endregion
//#region extensions/qqbot/src/config-schema.ts
const AudioFormatPolicySchema = z.object({
	sttDirectFormats: z.array(z.string()).optional(),
	uploadDirectFormats: z.array(z.string()).optional(),
	transcodeEnabled: z.boolean().optional()
}).optional();
const QQBotSttSchema = z.object({
	enabled: z.boolean().optional(),
	provider: z.string().optional(),
	baseUrl: z.string().optional(),
	apiKey: z.string().optional(),
	model: z.string().optional()
}).strict().optional();
const QQBotStreamingSchema = z.union([z.boolean(), z.object({ mode: z.enum(["off", "partial"]).default("partial") }).passthrough()]).optional();
const QQBotExecApprovalsSchema = z.object({
	enabled: z.union([z.boolean(), z.literal("auto")]).optional(),
	approvers: z.array(z.string()).optional(),
	agentFilter: z.array(z.string()).optional(),
	sessionFilter: z.array(z.string()).optional(),
	target: z.enum([
		"dm",
		"channel",
		"both"
	]).optional()
}).strict().optional();
const QQBotDmPolicySchema = z.enum([
	"open",
	"allowlist",
	"disabled"
]).optional();
const QQBotGroupPolicySchema = z.enum([
	"open",
	"allowlist",
	"disabled"
]).optional();
const QQBotAccountSchema = z.object({
	enabled: z.boolean().optional(),
	name: z.string().optional(),
	appId: z.string().optional(),
	clientSecret: buildSecretInputSchema().optional(),
	clientSecretFile: z.string().optional(),
	allowFrom: AllowFromListSchema,
	groupAllowFrom: AllowFromListSchema,
	dmPolicy: QQBotDmPolicySchema,
	groupPolicy: QQBotGroupPolicySchema,
	systemPrompt: z.string().optional(),
	markdownSupport: z.boolean().optional(),
	voiceDirectUploadFormats: z.array(z.string()).optional(),
	audioFormatPolicy: AudioFormatPolicySchema,
	urlDirectUpload: z.boolean().optional(),
	upgradeUrl: z.string().optional(),
	upgradeMode: z.enum(["doc", "hot-reload"]).optional(),
	streaming: QQBotStreamingSchema,
	execApprovals: QQBotExecApprovalsSchema
}).passthrough();
const qqbotChannelConfigSchema = buildChannelConfigSchema(QQBotAccountSchema.extend({
	stt: QQBotSttSchema,
	accounts: z.object({}).catchall(QQBotAccountSchema.passthrough()).optional(),
	defaultAccount: z.string().optional()
}).passthrough());
//#endregion
export { qqbotSetupAdapterShared as a, qqbotMeta as i, qqbotSetupWizard as n, qqbotConfigAdapter as r, qqbotChannelConfigSchema as t };
