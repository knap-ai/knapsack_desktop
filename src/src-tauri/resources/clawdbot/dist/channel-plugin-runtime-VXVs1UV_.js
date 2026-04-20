import { i as normalizeLowercaseStringOrEmpty, s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { t as formatDocsLink } from "./links-Dp5-Wbn2.js";
import { a as hasConfiguredSecretInput } from "./types.secrets-CeL3gSMO.js";
import { I as requireOpenAllowFrom, h as MarkdownConfigSchema, l as GroupPolicySchema, n as BlockStreamingCoalesceSchema, o as DmPolicySchema } from "./zod-schema.core-CYrn8zgQ.js";
import { r as buildChannelConfigSchema } from "./config-schema-sgVTuroC.js";
import { d as resolveThreadSessionKeys } from "./session-key-Bh1lMwK5.js";
import { n as normalizeAccountId, t as DEFAULT_ACCOUNT_ID } from "./account-id-j7GeQlaZ.js";
import { r as createLazyRuntimeModule } from "./lazy-runtime-DQGYmUDC.js";
import { n as resolveChannelGroupRequireMention } from "./group-policy-BtMLH9Qc.js";
import { c as createScopedChannelConfigAdapter, t as adaptScopedAccountAccessor } from "./channel-config-helpers-9F9ZxFrZ.js";
import "./text-runtime-DTMxvodz.js";
import { n as describeAccountSnapshot } from "./account-helpers-BWbrvOLB.js";
import { a as createSetupInputPresenceValidator, n as applySetupAccountConfigPatch, s as migrateBaseNameToDefaultAccount, t as applyAccountNameToChannelSection } from "./setup-helpers-NxWLbAbV.js";
import { c as stripTargetKindPrefix, r as createChatChannelPlugin, s as stripChannelTargetPrefix, t as buildChannelOutboundSessionRoute } from "./core-Dh0sB0kj.js";
import "./channel-core-3hub9E3l.js";
import { t as normalizeOutboundThreadId } from "./routing-BI8_fMua.js";
import { r as buildSecretInputSchema } from "./secret-input-BEMaS7ol.js";
import { t as createAccountStatusSink } from "./channel-lifecycle.core-E2kK8n55.js";
import { n as formatNormalizedAllowFromEntries } from "./allow-from-3zjA49Rt.js";
import { n as createDangerousNameMatchingMutableAllowlistWarningCollector, r as createRestrictSendersChannelSecurity } from "./channel-policy-G84s3mXs.js";
import { t as createChannelDirectoryAdapter } from "./directory-runtime-DNbenseh.js";
import { f as createStandardChannelSetupStatus } from "./setup-wizard-helpers-C8R_wm_7.js";
import { r as createLoggedPairingApprovalNotifier } from "./channel-pairing-DMzs787S.js";
import { d as createDefaultChannelRuntimeState, u as createComputedAccountStatusAdapter } from "./status-helpers-BEDVo_4L.js";
import "./setup-Ben3xLZg.js";
import "./setup-runtime-QeiuPA9p.js";
import { t as resolveApprovalApprovers } from "./approval-approvers-DSMmMQzI.js";
import { t as createResolvedApproverActionAuthAdapter } from "./approval-auth-helpers-CMPTk8Vz.js";
import "./config-runtime-Bh8MKSv2.js";
import { o as isPrivateNetworkOptInEnabled } from "./ssrf-policy-CChtVzhj.js";
import "./ssrf-runtime-CmuKDV7X.js";
import { t as chunkTextForOutbound } from "./text-chunking-CtENq2zv.js";
import { n as buildPassiveProbedChannelStatusSummary } from "./extension-shared-l-Yv-HWo.js";
import "./channel-config-primitives-Uzl-J-Mr.js";
import { t as createMessageToolButtonsSchema } from "./channel-actions-CkAP8jIY.js";
import "./channel-lifecycle-D1c7td96.js";
import { t as zod_exports } from "./zod-BUbl8seT.js";
import "./runtime-api-XbuNumM4.js";
import { h as normalizeMattermostBaseUrl, i as resolveMattermostReplyToMode, n as resolveDefaultMattermostAccountId, r as resolveMattermostAccount, t as listMattermostAccountIds } from "./accounts-BbdzHHCB.js";
import { n as normalizeCompatibilityConfig, t as legacyConfigRules } from "./doctor-contract-CFGlZqkl.js";
import { n as collectRuntimeConfigAssignments, r as secretTargetRegistryEntries } from "./secret-contract-DkomS5QH.js";
import { Type } from "@sinclair/typebox";
//#region extensions/mattermost/src/approval-auth.ts
const MATTERMOST_USER_ID_RE = /^[a-z0-9]{26}$/;
function normalizeMattermostApproverId(value) {
	const lowered = normalizeLowercaseStringOrEmpty(String(value).trim().replace(/^(mattermost|user):/i, "").replace(/^@/, "").trim());
	return MATTERMOST_USER_ID_RE.test(lowered) ? lowered : void 0;
}
const mattermostApprovalAuth = createResolvedApproverActionAuthAdapter({
	channelLabel: "Mattermost",
	resolveApprovers: ({ cfg, accountId }) => {
		const account = resolveMattermostAccount({
			cfg,
			accountId
		}).config;
		return resolveApprovalApprovers({
			allowFrom: account.allowFrom,
			normalizeApprover: normalizeMattermostApproverId
		});
	},
	normalizeSenderId: (value) => normalizeMattermostApproverId(value)
});
//#endregion
//#region extensions/mattermost/src/channel-config-shared.ts
const mattermostMeta = {
	id: "mattermost",
	label: "Mattermost",
	selectionLabel: "Mattermost (plugin)",
	detailLabel: "Mattermost Bot",
	docsPath: "/channels/mattermost",
	docsLabel: "mattermost",
	blurb: "self-hosted Slack-style chat; install the plugin to enable.",
	systemImage: "bubble.left.and.bubble.right",
	order: 65,
	quickstartAllowFrom: true
};
const DEFAULT_SLASH_CALLBACK_PATH = "/api/channels/mattermost/command";
function normalizeMattermostAllowEntry(entry) {
	return normalizeLowercaseStringOrEmpty(entry.trim().replace(/^(mattermost|user):/i, "").replace(/^@/, ""));
}
function formatMattermostAllowEntry(entry) {
	const trimmed = entry.trim();
	if (!trimmed) return "";
	if (trimmed.startsWith("@")) {
		const username = trimmed.slice(1).trim();
		return username ? `@${normalizeLowercaseStringOrEmpty(username)}` : "";
	}
	return normalizeLowercaseStringOrEmpty(trimmed.replace(/^(mattermost|user):/i, ""));
}
function collectMattermostSlashCallbackPaths(raw) {
	const callbackPath = (() => {
		const trimmed = raw?.callbackPath?.trim();
		if (!trimmed) return DEFAULT_SLASH_CALLBACK_PATH;
		return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
	})();
	const callbackUrl = raw?.callbackUrl?.trim();
	const paths = new Set([callbackPath]);
	if (callbackUrl) try {
		const pathname = new URL(callbackUrl).pathname;
		if (pathname) paths.add(pathname);
	} catch {}
	return [...paths];
}
function resolveMattermostGatewayAuthBypassPaths(cfg) {
	const base = cfg.channels?.mattermost;
	const callbackPaths = new Set(collectMattermostSlashCallbackPaths(base?.commands).filter((path) => path === "/api/channels/mattermost/command" || path.startsWith("/api/channels/mattermost/")));
	const accounts = base?.accounts ?? {};
	for (const account of Object.values(accounts)) {
		const accountConfig = account && typeof account === "object" && !Array.isArray(account) ? account : void 0;
		for (const path of collectMattermostSlashCallbackPaths(accountConfig?.commands)) if (path === "/api/channels/mattermost/command" || path.startsWith("/api/channels/mattermost/")) callbackPaths.add(path);
	}
	return [...callbackPaths];
}
const mattermostConfigAdapter = createScopedChannelConfigAdapter({
	sectionKey: "mattermost",
	listAccountIds: listMattermostAccountIds,
	resolveAccount: adaptScopedAccountAccessor(resolveMattermostAccount),
	defaultAccountId: resolveDefaultMattermostAccountId,
	clearBaseFields: [
		"botToken",
		"baseUrl",
		"name"
	],
	resolveAllowFrom: (account) => account.config.allowFrom,
	formatAllowFrom: (allowFrom) => formatNormalizedAllowFromEntries({
		allowFrom,
		normalizeEntry: formatMattermostAllowEntry
	})
});
function isMattermostConfigured$1(account) {
	return Boolean(account.botToken && account.baseUrl);
}
function describeMattermostAccount(account) {
	return describeAccountSnapshot({
		account,
		configured: isMattermostConfigured$1(account),
		extra: {
			botTokenSource: account.botTokenSource,
			baseUrl: account.baseUrl
		}
	});
}
//#endregion
//#region extensions/mattermost/src/config-schema-core.ts
const MattermostGroupSchema = zod_exports.z.object({ requireMention: zod_exports.z.boolean().optional() }).strict();
function requireMattermostOpenAllowFrom(params) {
	requireOpenAllowFrom({
		policy: params.policy,
		allowFrom: params.allowFrom,
		ctx: params.ctx,
		path: ["allowFrom"],
		message: "channels.mattermost.dmPolicy=\"open\" requires channels.mattermost.allowFrom to include \"*\""
	});
}
const DmChannelRetrySchema = zod_exports.z.object({
	maxRetries: zod_exports.z.number().int().min(0).max(10).optional(),
	initialDelayMs: zod_exports.z.number().int().min(100).max(6e4).optional(),
	maxDelayMs: zod_exports.z.number().int().min(1e3).max(6e4).optional(),
	timeoutMs: zod_exports.z.number().int().min(5e3).max(12e4).optional()
}).strict().refine((data) => {
	if (data.initialDelayMs !== void 0 && data.maxDelayMs !== void 0) return data.initialDelayMs <= data.maxDelayMs;
	return true;
}, {
	message: "initialDelayMs must be less than or equal to maxDelayMs",
	path: ["initialDelayMs"]
}).optional();
const MattermostSlashCommandsSchema = zod_exports.z.object({
	native: zod_exports.z.union([zod_exports.z.boolean(), zod_exports.z.literal("auto")]).optional(),
	nativeSkills: zod_exports.z.union([zod_exports.z.boolean(), zod_exports.z.literal("auto")]).optional(),
	callbackPath: zod_exports.z.string().optional(),
	callbackUrl: zod_exports.z.string().optional()
}).strict().optional();
const MattermostNetworkSchema = zod_exports.z.object({ dangerouslyAllowPrivateNetwork: zod_exports.z.boolean().optional() }).strict().optional();
const MattermostAccountSchemaBase = zod_exports.z.object({
	name: zod_exports.z.string().optional(),
	capabilities: zod_exports.z.array(zod_exports.z.string()).optional(),
	dangerouslyAllowNameMatching: zod_exports.z.boolean().optional(),
	markdown: MarkdownConfigSchema,
	enabled: zod_exports.z.boolean().optional(),
	configWrites: zod_exports.z.boolean().optional(),
	botToken: buildSecretInputSchema().optional(),
	baseUrl: zod_exports.z.string().optional(),
	chatmode: zod_exports.z.enum([
		"oncall",
		"onmessage",
		"onchar"
	]).optional(),
	oncharPrefixes: zod_exports.z.array(zod_exports.z.string()).optional(),
	requireMention: zod_exports.z.boolean().optional(),
	dmPolicy: DmPolicySchema.optional().default("pairing"),
	allowFrom: zod_exports.z.array(zod_exports.z.union([zod_exports.z.string(), zod_exports.z.number()])).optional(),
	groupAllowFrom: zod_exports.z.array(zod_exports.z.union([zod_exports.z.string(), zod_exports.z.number()])).optional(),
	groupPolicy: GroupPolicySchema.optional().default("allowlist"),
	textChunkLimit: zod_exports.z.number().int().positive().optional(),
	chunkMode: zod_exports.z.enum(["length", "newline"]).optional(),
	blockStreaming: zod_exports.z.boolean().optional(),
	blockStreamingCoalesce: BlockStreamingCoalesceSchema.optional(),
	replyToMode: zod_exports.z.enum([
		"off",
		"first",
		"all",
		"batched"
	]).optional(),
	responsePrefix: zod_exports.z.string().optional(),
	actions: zod_exports.z.object({ reactions: zod_exports.z.boolean().optional() }).optional(),
	commands: MattermostSlashCommandsSchema,
	interactions: zod_exports.z.object({
		callbackBaseUrl: zod_exports.z.string().optional(),
		allowedSourceIps: zod_exports.z.array(zod_exports.z.string()).optional()
	}).optional(),
	groups: zod_exports.z.record(zod_exports.z.string(), MattermostGroupSchema.optional()).optional(),
	network: MattermostNetworkSchema,
	dmChannelRetry: DmChannelRetrySchema
}).strict();
const MattermostAccountSchema = MattermostAccountSchemaBase.superRefine((value, ctx) => {
	requireMattermostOpenAllowFrom({
		policy: value.dmPolicy,
		allowFrom: value.allowFrom,
		ctx
	});
});
//#endregion
//#region extensions/mattermost/src/config-surface.ts
const MattermostChannelConfigSchema = buildChannelConfigSchema(MattermostAccountSchemaBase.extend({
	accounts: zod_exports.z.record(zod_exports.z.string(), MattermostAccountSchema.optional()).optional(),
	defaultAccount: zod_exports.z.string().optional()
}).superRefine((value, ctx) => {
	requireMattermostOpenAllowFrom({
		policy: value.dmPolicy,
		allowFrom: value.allowFrom,
		ctx
	});
}));
//#endregion
//#region extensions/mattermost/src/doctor.ts
function isMattermostMutableAllowEntry(raw) {
	const text = raw.trim();
	if (!text || text === "*") return false;
	const lowered = normalizeLowercaseStringOrEmpty(text.replace(/^(mattermost|user):/i, "").replace(/^@/, "").trim());
	if (/^[a-z0-9]{26}$/.test(lowered)) return false;
	return true;
}
const mattermostDoctor = {
	legacyConfigRules,
	normalizeCompatibilityConfig,
	collectMutableAllowlistWarnings: createDangerousNameMatchingMutableAllowlistWarningCollector({
		channel: "mattermost",
		detector: isMattermostMutableAllowEntry,
		collectLists: (scope) => [{
			pathLabel: `${scope.prefix}.allowFrom`,
			list: scope.account.allowFrom
		}, {
			pathLabel: `${scope.prefix}.groupAllowFrom`,
			list: scope.account.groupAllowFrom
		}]
	})
};
//#endregion
//#region extensions/mattermost/src/group-mentions.ts
function resolveMattermostGroupRequireMention(params) {
	const account = resolveMattermostAccount({
		cfg: params.cfg,
		accountId: params.accountId
	});
	const requireMentionOverride = typeof params.requireMentionOverride === "boolean" ? params.requireMentionOverride : account.requireMention;
	return resolveChannelGroupRequireMention({
		cfg: params.cfg,
		channel: "mattermost",
		groupId: params.groupId,
		accountId: params.accountId,
		requireMentionOverride
	});
}
//#endregion
//#region extensions/mattermost/src/normalize.ts
function normalizeMattermostMessagingTarget(raw) {
	const trimmed = raw.trim();
	if (!trimmed) return;
	const lower = normalizeLowercaseStringOrEmpty(trimmed);
	if (lower.startsWith("channel:")) {
		const id = trimmed.slice(8).trim();
		return id ? `channel:${id}` : void 0;
	}
	if (lower.startsWith("group:")) {
		const id = trimmed.slice(6).trim();
		return id ? `channel:${id}` : void 0;
	}
	if (lower.startsWith("user:")) {
		const id = trimmed.slice(5).trim();
		return id ? `user:${id}` : void 0;
	}
	if (lower.startsWith("mattermost:")) {
		const id = trimmed.slice(11).trim();
		return id ? `user:${id}` : void 0;
	}
	if (trimmed.startsWith("@")) {
		const id = trimmed.slice(1).trim();
		return id ? `@${id}` : void 0;
	}
	if (trimmed.startsWith("#")) return;
}
function looksLikeMattermostTargetId(raw, _normalized) {
	const trimmed = raw.trim();
	if (!trimmed) return false;
	if (/^(user|channel|group|mattermost):/i.test(trimmed)) return true;
	if (trimmed.startsWith("@")) return true;
	return /^[a-z0-9]{26}$/i.test(trimmed) || /^[a-z0-9]{26}__[a-z0-9]{26}$/i.test(trimmed);
}
//#endregion
//#region extensions/mattermost/src/session-route.ts
function resolveMattermostOutboundSessionRoute(params) {
	let trimmed = stripChannelTargetPrefix(params.target, "mattermost");
	if (!trimmed) return null;
	const lower = normalizeLowercaseStringOrEmpty(trimmed);
	const resolvedKind = params.resolvedTarget?.kind;
	const isUser = resolvedKind === "user" || resolvedKind !== "channel" && resolvedKind !== "group" && (lower.startsWith("user:") || trimmed.startsWith("@"));
	if (trimmed.startsWith("@")) trimmed = trimmed.slice(1).trim();
	const rawId = stripTargetKindPrefix(trimmed);
	if (!rawId) return null;
	const baseRoute = buildChannelOutboundSessionRoute({
		cfg: params.cfg,
		agentId: params.agentId,
		channel: "mattermost",
		accountId: params.accountId,
		peer: {
			kind: isUser ? "direct" : "channel",
			id: rawId
		},
		chatType: isUser ? "direct" : "channel",
		from: isUser ? `mattermost:${rawId}` : `mattermost:channel:${rawId}`,
		to: isUser ? `user:${rawId}` : `channel:${rawId}`
	});
	const threadId = normalizeOutboundThreadId(params.replyToId ?? params.threadId);
	const threadKeys = resolveThreadSessionKeys({
		baseSessionKey: baseRoute.baseSessionKey,
		threadId
	});
	return {
		...baseRoute,
		sessionKey: threadKeys.sessionKey,
		...threadId !== void 0 ? { threadId } : {}
	};
}
//#endregion
//#region extensions/mattermost/src/setup-core.ts
const channel$1 = "mattermost";
function isMattermostConfigured(account) {
	return (Boolean(account.botToken?.trim()) || hasConfiguredSecretInput(account.config.botToken)) && Boolean(account.baseUrl);
}
function resolveMattermostAccountWithSecrets(cfg, accountId) {
	return resolveMattermostAccount({
		cfg,
		accountId,
		allowUnresolvedSecretRef: true
	});
}
const mattermostSetupAdapter = {
	resolveAccountId: ({ accountId }) => normalizeAccountId(accountId),
	applyAccountName: ({ cfg, accountId, name }) => applyAccountNameToChannelSection({
		cfg,
		channelKey: channel$1,
		accountId,
		name
	}),
	validateInput: createSetupInputPresenceValidator({
		defaultAccountOnlyEnvError: "Mattermost env vars can only be used for the default account.",
		whenNotUseEnv: [{
			someOf: ["botToken", "token"],
			message: "Mattermost requires --bot-token and --http-url (or --use-env)."
		}, {
			someOf: ["httpUrl"],
			message: "Mattermost requires --bot-token and --http-url (or --use-env)."
		}],
		validate: ({ input }) => {
			const token = input.botToken ?? input.token;
			const baseUrl = normalizeMattermostBaseUrl(input.httpUrl);
			if (!input.useEnv && (!token || !baseUrl)) return "Mattermost requires --bot-token and --http-url (or --use-env).";
			if (input.httpUrl && !baseUrl) return "Mattermost --http-url must include a valid base URL.";
			return null;
		}
	}),
	applyAccountConfig: ({ cfg, accountId, input }) => {
		const token = input.botToken ?? input.token;
		const baseUrl = normalizeMattermostBaseUrl(input.httpUrl);
		const namedConfig = applyAccountNameToChannelSection({
			cfg,
			channelKey: channel$1,
			accountId,
			name: input.name
		});
		return applySetupAccountConfigPatch({
			cfg: accountId !== "default" ? migrateBaseNameToDefaultAccount({
				cfg: namedConfig,
				channelKey: channel$1
			}) : namedConfig,
			channelKey: channel$1,
			accountId,
			patch: input.useEnv ? {} : {
				...token ? { botToken: token } : {},
				...baseUrl ? { baseUrl } : {}
			}
		});
	}
};
//#endregion
//#region extensions/mattermost/src/setup-surface.ts
const channel = "mattermost";
const mattermostSetupWizard = {
	channel,
	status: createStandardChannelSetupStatus({
		channelLabel: "Mattermost",
		configuredLabel: "configured",
		unconfiguredLabel: "needs token + url",
		configuredHint: "configured",
		unconfiguredHint: "needs setup",
		configuredScore: 2,
		unconfiguredScore: 1,
		resolveConfigured: ({ cfg, accountId }) => isMattermostConfigured(resolveMattermostAccountWithSecrets(cfg, accountId ?? "default"))
	}),
	introNote: {
		title: "Mattermost bot token",
		lines: [
			"1) Mattermost System Console -> Integrations -> Bot Accounts",
			"2) Create a bot + copy its token",
			"3) Use your server base URL (e.g., https://chat.example.com)",
			"Tip: the bot must be a member of any channel you want it to monitor.",
			`Docs: ${formatDocsLink("/mattermost", "mattermost")}`
		],
		shouldShow: ({ cfg, accountId }) => !isMattermostConfigured(resolveMattermostAccountWithSecrets(cfg, accountId))
	},
	envShortcut: {
		prompt: "MATTERMOST_BOT_TOKEN + MATTERMOST_URL detected. Use env vars?",
		preferredEnvVar: "MATTERMOST_BOT_TOKEN",
		isAvailable: ({ cfg, accountId }) => {
			if (accountId !== "default") return false;
			const resolvedAccount = resolveMattermostAccountWithSecrets(cfg, accountId);
			const hasConfigValues = hasConfiguredSecretInput(resolvedAccount.config.botToken) || Boolean(resolvedAccount.config.baseUrl?.trim());
			return Boolean(process.env.MATTERMOST_BOT_TOKEN?.trim() && process.env.MATTERMOST_URL?.trim() && !hasConfigValues);
		},
		apply: ({ cfg, accountId }) => applySetupAccountConfigPatch({
			cfg,
			channelKey: channel,
			accountId,
			patch: {}
		})
	},
	credentials: [{
		inputKey: "botToken",
		providerHint: channel,
		credentialLabel: "bot token",
		preferredEnvVar: "MATTERMOST_BOT_TOKEN",
		envPrompt: "MATTERMOST_BOT_TOKEN + MATTERMOST_URL detected. Use env vars?",
		keepPrompt: "Mattermost bot token already configured. Keep it?",
		inputPrompt: "Enter Mattermost bot token",
		inspect: ({ cfg, accountId }) => {
			const resolvedAccount = resolveMattermostAccountWithSecrets(cfg, accountId);
			return {
				accountConfigured: isMattermostConfigured(resolvedAccount),
				hasConfiguredValue: hasConfiguredSecretInput(resolvedAccount.config.botToken)
			};
		}
	}],
	textInputs: [{
		inputKey: "httpUrl",
		message: "Enter Mattermost base URL",
		confirmCurrentValue: false,
		currentValue: ({ cfg, accountId }) => resolveMattermostAccountWithSecrets(cfg, accountId).baseUrl ?? process.env.MATTERMOST_URL?.trim(),
		initialValue: ({ cfg, accountId }) => resolveMattermostAccountWithSecrets(cfg, accountId).baseUrl ?? process.env.MATTERMOST_URL?.trim(),
		shouldPrompt: ({ cfg, accountId, credentialValues, currentValue }) => {
			const resolvedAccount = resolveMattermostAccountWithSecrets(cfg, accountId);
			const tokenConfigured = Boolean(resolvedAccount.botToken?.trim()) || hasConfiguredSecretInput(resolvedAccount.config.botToken);
			return Boolean(credentialValues.botToken) || !tokenConfigured || !currentValue;
		},
		validate: ({ value }) => normalizeMattermostBaseUrl(value) ? void 0 : "Mattermost base URL must include a valid base URL.",
		normalizeValue: ({ value }) => normalizeMattermostBaseUrl(value) ?? value.trim()
	}],
	disable: (cfg) => ({
		...cfg,
		channels: {
			...cfg.channels,
			mattermost: {
				...cfg.channels?.mattermost,
				enabled: false
			}
		}
	})
};
//#endregion
//#region extensions/mattermost/src/channel.ts
const loadMattermostChannelRuntime = createLazyRuntimeModule(() => import("./channel.runtime-npJJOIyc.js"));
const mattermostSecurityAdapter = createRestrictSendersChannelSecurity({
	channelKey: "mattermost",
	resolveDmPolicy: (account) => account.config.dmPolicy,
	resolveDmAllowFrom: (account) => account.config.allowFrom,
	resolveGroupPolicy: (account) => account.config.groupPolicy,
	surface: "Mattermost channels",
	openScope: "any member",
	groupPolicyPath: "channels.mattermost.groupPolicy",
	groupAllowFromPath: "channels.mattermost.groupAllowFrom",
	policyPathSuffix: "dmPolicy",
	normalizeDmEntry: (raw) => normalizeMattermostAllowEntry(raw)
});
function describeMattermostMessageTool({ cfg, accountId }) {
	const enabledAccounts = (accountId ? [resolveMattermostAccount({
		cfg,
		accountId
	})] : listMattermostAccountIds(cfg).map((listedAccountId) => resolveMattermostAccount({
		cfg,
		accountId: listedAccountId
	}))).filter((account) => account.enabled).filter((account) => Boolean(account.botToken?.trim() && account.baseUrl?.trim()));
	const actions = [];
	if (enabledAccounts.length > 0) actions.push("send");
	const baseReactions = (cfg.channels?.mattermost?.actions)?.reactions;
	if (enabledAccounts.some((account) => {
		return account.config.actions?.reactions ?? baseReactions ?? true;
	})) actions.push("react");
	return {
		actions,
		capabilities: enabledAccounts.length > 0 ? ["buttons"] : [],
		schema: enabledAccounts.length > 0 ? { properties: { buttons: Type.Optional(createMessageToolButtonsSchema()) } } : null
	};
}
const mattermostMessageActions = {
	describeMessageTool: describeMattermostMessageTool,
	supportsAction: ({ action }) => {
		return action === "send" || action === "react";
	},
	handleAction: async ({ action, params, cfg, accountId }) => {
		if (action === "react") {
			const resolvedAccountId = accountId ?? resolveDefaultMattermostAccountId(cfg);
			const mattermostConfig = cfg.channels?.mattermost;
			if (!(resolveMattermostAccount({
				cfg,
				accountId: resolvedAccountId
			}).config.actions?.reactions ?? mattermostConfig?.actions?.reactions ?? true)) throw new Error("Mattermost reactions are disabled in config");
			const { postId, emojiName, remove } = parseMattermostReactActionParams(params);
			if (remove) {
				const result = await (await loadMattermostChannelRuntime()).removeMattermostReaction({
					cfg,
					postId,
					emojiName,
					accountId: resolvedAccountId
				});
				if (!result.ok) throw new Error(result.error);
				return {
					content: [{
						type: "text",
						text: `Removed reaction :${emojiName}: from ${postId}`
					}],
					details: {}
				};
			}
			const result = await (await loadMattermostChannelRuntime()).addMattermostReaction({
				cfg,
				postId,
				emojiName,
				accountId: resolvedAccountId
			});
			if (!result.ok) throw new Error(result.error);
			return {
				content: [{
					type: "text",
					text: `Reacted with :${emojiName}: on ${postId}`
				}],
				details: {}
			};
		}
		if (action !== "send") throw new Error(`Unsupported Mattermost action: ${action}`);
		const to = typeof params.to === "string" ? params.to.trim() : typeof params.target === "string" ? params.target.trim() : "";
		if (!to) throw new Error("Mattermost send requires a target (to).");
		const message = typeof params.message === "string" ? params.message : "";
		const replyToId = normalizeOptionalString(params.replyToId) ?? normalizeOptionalString(params.replyTo);
		const resolvedAccountId = accountId || void 0;
		const mediaUrl = typeof params.media === "string" ? params.media.trim() || void 0 : void 0;
		const result = await (await loadMattermostChannelRuntime()).sendMessageMattermost(to, message, {
			accountId: resolvedAccountId,
			replyToId,
			buttons: Array.isArray(params.buttons) ? params.buttons : void 0,
			attachmentText: typeof params.attachmentText === "string" ? params.attachmentText : void 0,
			mediaUrl
		});
		return {
			content: [{
				type: "text",
				text: JSON.stringify({
					ok: true,
					channel: "mattermost",
					messageId: result.messageId,
					channelId: result.channelId
				})
			}],
			details: {}
		};
	}
};
function parseMattermostReactActionParams(params) {
	const postId = normalizeOptionalString(params.messageId) ?? normalizeOptionalString(params.postId);
	if (!postId) throw new Error("Mattermost react requires messageId (post id)");
	const emojiName = normalizeOptionalString(params.emoji)?.replace(/^:+|:+$/g, "");
	if (!emojiName) throw new Error("Mattermost react requires emoji");
	return {
		postId,
		emojiName,
		remove: params.remove === true
	};
}
const mattermostPlugin = createChatChannelPlugin({
	base: {
		id: "mattermost",
		meta: { ...mattermostMeta },
		setup: mattermostSetupAdapter,
		setupWizard: mattermostSetupWizard,
		capabilities: {
			chatTypes: [
				"direct",
				"channel",
				"group",
				"thread"
			],
			reactions: true,
			threads: true,
			media: true,
			nativeCommands: true
		},
		streaming: { blockStreamingCoalesceDefaults: {
			minChars: 1500,
			idleMs: 1e3
		} },
		reload: { configPrefixes: ["channels.mattermost"] },
		configSchema: MattermostChannelConfigSchema,
		config: {
			...mattermostConfigAdapter,
			isConfigured: isMattermostConfigured$1,
			describeAccount: describeMattermostAccount
		},
		approvalCapability: mattermostApprovalAuth,
		doctor: mattermostDoctor,
		groups: { resolveRequireMention: resolveMattermostGroupRequireMention },
		actions: mattermostMessageActions,
		secrets: {
			secretTargetRegistryEntries,
			collectRuntimeConfigAssignments
		},
		directory: createChannelDirectoryAdapter({
			listGroups: async (params) => (await loadMattermostChannelRuntime()).listMattermostDirectoryGroups(params),
			listGroupsLive: async (params) => (await loadMattermostChannelRuntime()).listMattermostDirectoryGroups(params),
			listPeers: async (params) => (await loadMattermostChannelRuntime()).listMattermostDirectoryPeers(params),
			listPeersLive: async (params) => (await loadMattermostChannelRuntime()).listMattermostDirectoryPeers(params)
		}),
		messaging: {
			defaultMarkdownTableMode: "off",
			normalizeTarget: normalizeMattermostMessagingTarget,
			resolveOutboundSessionRoute: (params) => resolveMattermostOutboundSessionRoute(params),
			targetResolver: {
				looksLikeId: looksLikeMattermostTargetId,
				hint: "<channelId|user:ID|channel:ID>",
				resolveTarget: async ({ cfg, accountId, input }) => {
					const resolved = await (await loadMattermostChannelRuntime()).resolveMattermostOpaqueTarget({
						input,
						cfg,
						accountId
					});
					if (!resolved) return null;
					return {
						to: resolved.to,
						kind: resolved.kind,
						source: "directory"
					};
				}
			}
		},
		status: createComputedAccountStatusAdapter({
			defaultRuntime: createDefaultChannelRuntimeState(DEFAULT_ACCOUNT_ID, {
				connected: false,
				lastConnectedAt: null,
				lastDisconnect: null
			}),
			buildChannelSummary: ({ snapshot }) => buildPassiveProbedChannelStatusSummary(snapshot, {
				botTokenSource: snapshot.botTokenSource ?? "none",
				connected: snapshot.connected ?? false,
				baseUrl: snapshot.baseUrl ?? null
			}),
			probeAccount: async ({ account, timeoutMs }) => {
				const token = account.botToken?.trim();
				const baseUrl = account.baseUrl?.trim();
				if (!token || !baseUrl) return {
					ok: false,
					error: "bot token or baseUrl missing"
				};
				return await (await loadMattermostChannelRuntime()).probeMattermost(baseUrl, token, timeoutMs, isPrivateNetworkOptInEnabled(account.config));
			},
			resolveAccountSnapshot: ({ account, runtime }) => ({
				accountId: account.accountId,
				name: account.name,
				enabled: account.enabled,
				configured: Boolean(account.botToken && account.baseUrl),
				extra: {
					botTokenSource: account.botTokenSource,
					baseUrl: account.baseUrl,
					connected: runtime?.connected ?? false,
					lastConnectedAt: runtime?.lastConnectedAt ?? null,
					lastDisconnect: runtime?.lastDisconnect ?? null
				}
			})
		}),
		gateway: {
			resolveGatewayAuthBypassPaths: ({ cfg }) => resolveMattermostGatewayAuthBypassPaths(cfg),
			startAccount: async (ctx) => {
				const account = ctx.account;
				const statusSink = createAccountStatusSink({
					accountId: ctx.accountId,
					setStatus: ctx.setStatus
				});
				statusSink({
					baseUrl: account.baseUrl,
					botTokenSource: account.botTokenSource
				});
				ctx.log?.info(`[${account.accountId}] starting channel`);
				return (await loadMattermostChannelRuntime()).monitorMattermostProvider({
					botToken: account.botToken ?? void 0,
					baseUrl: account.baseUrl ?? void 0,
					accountId: account.accountId,
					config: ctx.cfg,
					runtime: ctx.runtime,
					abortSignal: ctx.abortSignal,
					statusSink
				});
			}
		}
	},
	pairing: { text: {
		idLabel: "mattermostUserId",
		message: "OpenClaw: your access has been approved.",
		normalizeAllowEntry: (entry) => normalizeMattermostAllowEntry(entry),
		notify: createLoggedPairingApprovalNotifier(({ id }) => `[mattermost] User ${id} approved for pairing`)
	} },
	threading: {
		scopedAccountReplyToMode: {
			resolveAccount: (cfg, accountId) => resolveMattermostAccount({
				cfg,
				accountId: accountId ?? resolveDefaultMattermostAccountId(cfg)
			}),
			resolveReplyToMode: (account, chatType) => resolveMattermostReplyToMode(account, chatType === "direct" || chatType === "group" || chatType === "channel" ? chatType : "channel")
		},
		resolveReplyTransport: ({ threadId, replyToId }) => ({
			replyToId: replyToId ?? (threadId != null ? String(threadId) : void 0),
			threadId
		})
	},
	security: mattermostSecurityAdapter,
	outbound: {
		base: {
			deliveryMode: "direct",
			chunker: chunkTextForOutbound,
			chunkerMode: "markdown",
			textChunkLimit: 4e3,
			resolveTarget: ({ to }) => {
				const trimmed = to?.trim();
				if (!trimmed) return {
					ok: false,
					error: /* @__PURE__ */ new Error("Delivering to Mattermost requires --to <channelId|@username|user:ID|channel:ID>")
				};
				return {
					ok: true,
					to: trimmed
				};
			}
		},
		attachedResults: {
			channel: "mattermost",
			sendText: async ({ cfg, to, text, accountId, replyToId, threadId }) => await (await loadMattermostChannelRuntime()).sendMessageMattermost(to, text, {
				cfg,
				accountId: accountId ?? void 0,
				replyToId: replyToId ?? (threadId != null ? String(threadId) : void 0)
			}),
			sendMedia: async ({ cfg, to, text, mediaUrl, mediaLocalRoots, accountId, replyToId, threadId }) => await (await loadMattermostChannelRuntime()).sendMessageMattermost(to, text, {
				cfg,
				accountId: accountId ?? void 0,
				mediaUrl,
				mediaLocalRoots,
				replyToId: replyToId ?? (threadId != null ? String(threadId) : void 0)
			})
		}
	}
});
//#endregion
export { describeMattermostAccount as a, mattermostMeta as c, MattermostChannelConfigSchema as i, resolveMattermostGatewayAuthBypassPaths as l, mattermostSetupWizard as n, isMattermostConfigured$1 as o, mattermostSetupAdapter as r, mattermostConfigAdapter as s, mattermostPlugin as t };
