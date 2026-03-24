import { t as formatDocsLink } from "./links-8xRhWBQL.js";
import { _ as normalizeAccountId } from "./session-key-DAhnzjyr.js";
import { a as hasConfiguredSecretInput, l as normalizeSecretInputString } from "./types.secrets-DgX397vI.js";
import { o as ToolPolicySchema } from "./zod-schema.agent-runtime-Dtg4Jy6G.js";
import { a as DmPolicySchema, c as GroupPolicySchema, m as MarkdownConfigSchema } from "./zod-schema.core-BuVz8Rk7.js";
import { r as buildSecretInputSchema } from "./secret-input-DXoOLNgb.js";
import { c as prepareScopedSetupConfig, s as patchScopedAccountConfig } from "./setup-helpers-B2gYys18.js";
import { n as buildCatchallMultiAccountChannelSchema, t as AllowFromListSchema } from "./config-schema-CPzP2Ds6.js";
import { b as createPromptParsedAllowFromForAccount, m as createAllowFromSection, w as createTopLevelChannelDmPolicySetter, x as createStandardChannelSetupStatus } from "./setup-wizard-proxy-DoOpOF8S.js";
import { d as parseBlueBubblesAllowTarget, h as resolveDefaultBlueBubblesAccountId, m as resolveBlueBubblesAccount, p as listBlueBubblesAccountIds, t as DEFAULT_WEBHOOK_PATH, v as normalizeBlueBubblesServerUrl } from "./webhook-shared-wpLr3n4O.js";
import { z } from "zod";
//#region extensions/bluebubbles/src/config-schema.ts
const bluebubblesActionSchema = z.object({
	reactions: z.boolean().default(true),
	edit: z.boolean().default(true),
	unsend: z.boolean().default(true),
	reply: z.boolean().default(true),
	sendWithEffect: z.boolean().default(true),
	renameGroup: z.boolean().default(true),
	setGroupIcon: z.boolean().default(true),
	addParticipant: z.boolean().default(true),
	removeParticipant: z.boolean().default(true),
	leaveGroup: z.boolean().default(true),
	sendAttachment: z.boolean().default(true)
}).optional();
const bluebubblesGroupConfigSchema = z.object({
	requireMention: z.boolean().optional(),
	tools: ToolPolicySchema
});
const BlueBubblesConfigSchema = buildCatchallMultiAccountChannelSchema(z.object({
	name: z.string().optional(),
	enabled: z.boolean().optional(),
	markdown: MarkdownConfigSchema,
	serverUrl: z.string().optional(),
	password: buildSecretInputSchema().optional(),
	webhookPath: z.string().optional(),
	dmPolicy: DmPolicySchema.optional(),
	allowFrom: AllowFromListSchema,
	groupAllowFrom: AllowFromListSchema,
	groupPolicy: GroupPolicySchema.optional(),
	historyLimit: z.number().int().min(0).optional(),
	dmHistoryLimit: z.number().int().min(0).optional(),
	textChunkLimit: z.number().int().positive().optional(),
	chunkMode: z.enum(["length", "newline"]).optional(),
	mediaMaxMb: z.number().int().positive().optional(),
	mediaLocalRoots: z.array(z.string()).optional(),
	sendReadReceipts: z.boolean().optional(),
	allowPrivateNetwork: z.boolean().optional(),
	blockStreaming: z.boolean().optional(),
	groups: z.object({}).catchall(bluebubblesGroupConfigSchema).optional()
}).superRefine((value, ctx) => {
	const serverUrl = value.serverUrl?.trim() ?? "";
	const passwordConfigured = hasConfiguredSecretInput(value.password);
	if (serverUrl && !passwordConfigured) ctx.addIssue({
		code: z.ZodIssueCode.custom,
		path: ["password"],
		message: "password is required when serverUrl is configured"
	});
})).extend({ actions: bluebubblesActionSchema });
//#endregion
//#region extensions/bluebubbles/src/config-apply.ts
function normalizePatch(patch, onlyDefinedFields) {
	if (!onlyDefinedFields) return patch;
	const next = {};
	if (patch.serverUrl !== void 0) next.serverUrl = patch.serverUrl;
	if (patch.password !== void 0) next.password = patch.password;
	if (patch.webhookPath !== void 0) next.webhookPath = patch.webhookPath;
	return next;
}
function applyBlueBubblesConnectionConfig(params) {
	const patch = normalizePatch(params.patch, params.onlyDefinedFields === true);
	if (params.accountId === "default") return {
		...params.cfg,
		channels: {
			...params.cfg.channels,
			bluebubbles: {
				...params.cfg.channels?.bluebubbles,
				enabled: true,
				...patch
			}
		}
	};
	const currentAccount = params.cfg.channels?.bluebubbles?.accounts?.[params.accountId];
	const enabled = params.accountEnabled === "preserve-or-true" ? currentAccount?.enabled ?? true : params.accountEnabled ?? true;
	return {
		...params.cfg,
		channels: {
			...params.cfg.channels,
			bluebubbles: {
				...params.cfg.channels?.bluebubbles,
				enabled: true,
				accounts: {
					...params.cfg.channels?.bluebubbles?.accounts,
					[params.accountId]: {
						...currentAccount,
						enabled,
						...patch
					}
				}
			}
		}
	};
}
//#endregion
//#region extensions/bluebubbles/src/setup-core.ts
const channel$1 = "bluebubbles";
const setBlueBubblesTopLevelDmPolicy = createTopLevelChannelDmPolicySetter({ channel: channel$1 });
function setBlueBubblesDmPolicy(cfg, dmPolicy) {
	return setBlueBubblesTopLevelDmPolicy(cfg, dmPolicy);
}
function setBlueBubblesAllowFrom(cfg, accountId, allowFrom) {
	return patchScopedAccountConfig({
		cfg,
		channelKey: channel$1,
		accountId,
		patch: { allowFrom },
		ensureChannelEnabled: false,
		ensureAccountEnabled: false
	});
}
const blueBubblesSetupAdapter = {
	resolveAccountId: ({ accountId }) => normalizeAccountId(accountId),
	applyAccountName: ({ cfg, accountId, name }) => prepareScopedSetupConfig({
		cfg,
		channelKey: channel$1,
		accountId,
		name
	}),
	validateInput: ({ input }) => {
		if (!input.httpUrl && !input.password) return "BlueBubbles requires --http-url and --password.";
		if (!input.httpUrl) return "BlueBubbles requires --http-url.";
		if (!input.password) return "BlueBubbles requires --password.";
		return null;
	},
	applyAccountConfig: ({ cfg, accountId, input }) => {
		return applyBlueBubblesConnectionConfig({
			cfg: prepareScopedSetupConfig({
				cfg,
				channelKey: channel$1,
				accountId,
				name: input.name,
				migrateBaseName: true
			}),
			accountId,
			patch: {
				serverUrl: input.httpUrl,
				password: input.password,
				webhookPath: input.webhookPath
			},
			onlyDefinedFields: true
		});
	}
};
//#endregion
//#region extensions/bluebubbles/src/setup-surface.ts
const channel = "bluebubbles";
const CONFIGURE_CUSTOM_WEBHOOK_FLAG = "__bluebubblesConfigureCustomWebhookPath";
function parseBlueBubblesAllowFromInput(raw) {
	return raw.split(/[\n,]+/g).map((entry) => entry.trim()).filter(Boolean);
}
function validateBlueBubblesAllowFromEntry(value) {
	try {
		if (value === "*") return value;
		const parsed = parseBlueBubblesAllowTarget(value);
		if (parsed.kind === "handle" && !parsed.handle) return null;
		return value.trim() || null;
	} catch {
		return null;
	}
}
const promptBlueBubblesAllowFrom = createPromptParsedAllowFromForAccount({
	defaultAccountId: (cfg) => resolveDefaultBlueBubblesAccountId(cfg),
	noteTitle: "BlueBubbles allowlist",
	noteLines: [
		"Allowlist BlueBubbles DMs by handle or chat target.",
		"Examples:",
		"- +15555550123",
		"- user@example.com",
		"- chat_id:123",
		"- chat_guid:iMessage;-;+15555550123",
		"Multiple entries: comma- or newline-separated.",
		`Docs: ${formatDocsLink("/channels/bluebubbles", "bluebubbles")}`
	],
	message: "BlueBubbles allowFrom (handle or chat_id)",
	placeholder: "+15555550123, user@example.com, chat_id:123",
	parseEntries: (raw) => {
		const entries = parseBlueBubblesAllowFromInput(raw);
		for (const entry of entries) if (!validateBlueBubblesAllowFromEntry(entry)) return {
			entries: [],
			error: `Invalid entry: ${entry}`
		};
		return { entries };
	},
	getExistingAllowFrom: ({ cfg, accountId }) => resolveBlueBubblesAccount({
		cfg,
		accountId
	}).config.allowFrom ?? [],
	applyAllowFrom: ({ cfg, accountId, allowFrom }) => setBlueBubblesAllowFrom(cfg, accountId, allowFrom)
});
function validateBlueBubblesServerUrlInput(value) {
	const trimmed = String(value ?? "").trim();
	if (!trimmed) return "Required";
	try {
		const normalized = normalizeBlueBubblesServerUrl(trimmed);
		new URL(normalized);
		return;
	} catch {
		return "Invalid URL format";
	}
}
function applyBlueBubblesSetupPatch(cfg, accountId, patch) {
	return applyBlueBubblesConnectionConfig({
		cfg,
		accountId,
		patch,
		onlyDefinedFields: true,
		accountEnabled: "preserve-or-true"
	});
}
function resolveBlueBubblesServerUrl(cfg, accountId) {
	return resolveBlueBubblesAccount({
		cfg,
		accountId
	}).config.serverUrl?.trim() || void 0;
}
function resolveBlueBubblesWebhookPath(cfg, accountId) {
	return resolveBlueBubblesAccount({
		cfg,
		accountId
	}).config.webhookPath?.trim() || void 0;
}
function validateBlueBubblesWebhookPath(value) {
	const trimmed = String(value ?? "").trim();
	if (!trimmed) return "Required";
	if (!trimmed.startsWith("/")) return "Path must start with /";
}
const dmPolicy = {
	label: "BlueBubbles",
	channel,
	policyKey: "channels.bluebubbles.dmPolicy",
	allowFromKey: "channels.bluebubbles.allowFrom",
	getCurrent: (cfg) => cfg.channels?.bluebubbles?.dmPolicy ?? "pairing",
	setPolicy: (cfg, policy) => setBlueBubblesDmPolicy(cfg, policy),
	promptAllowFrom: promptBlueBubblesAllowFrom
};
const blueBubblesSetupWizard = {
	channel,
	stepOrder: "text-first",
	status: {
		...createStandardChannelSetupStatus({
			channelLabel: "BlueBubbles",
			configuredLabel: "configured",
			unconfiguredLabel: "needs setup",
			configuredHint: "configured",
			unconfiguredHint: "iMessage via BlueBubbles app",
			configuredScore: 1,
			unconfiguredScore: 0,
			includeStatusLine: true,
			resolveConfigured: ({ cfg }) => listBlueBubblesAccountIds(cfg).some((accountId) => {
				return resolveBlueBubblesAccount({
					cfg,
					accountId
				}).configured;
			})
		}),
		resolveSelectionHint: ({ configured }) => configured ? "configured" : "iMessage via BlueBubbles app"
	},
	prepare: async ({ cfg, accountId, prompter, credentialValues }) => {
		const existingWebhookPath = resolveBlueBubblesWebhookPath(cfg, accountId);
		const wantsCustomWebhook = await prompter.confirm({
			message: `Configure a custom webhook path? (default: ${DEFAULT_WEBHOOK_PATH})`,
			initialValue: Boolean(existingWebhookPath && existingWebhookPath !== "/bluebubbles-webhook")
		});
		return {
			cfg: wantsCustomWebhook ? cfg : applyBlueBubblesSetupPatch(cfg, accountId, { webhookPath: DEFAULT_WEBHOOK_PATH }),
			credentialValues: {
				...credentialValues,
				[CONFIGURE_CUSTOM_WEBHOOK_FLAG]: wantsCustomWebhook ? "1" : "0"
			}
		};
	},
	credentials: [{
		inputKey: "password",
		providerHint: channel,
		credentialLabel: "server password",
		helpTitle: "BlueBubbles password",
		helpLines: ["Enter the BlueBubbles server password.", "Find this in the BlueBubbles Server app under Settings."],
		envPrompt: "",
		keepPrompt: "BlueBubbles password already set. Keep it?",
		inputPrompt: "BlueBubbles password",
		inspect: ({ cfg, accountId }) => {
			const existingPassword = resolveBlueBubblesAccount({
				cfg,
				accountId
			}).config.password;
			return {
				accountConfigured: resolveBlueBubblesAccount({
					cfg,
					accountId
				}).configured,
				hasConfiguredValue: hasConfiguredSecretInput(existingPassword),
				resolvedValue: normalizeSecretInputString(existingPassword) ?? void 0
			};
		},
		applySet: async ({ cfg, accountId, value }) => applyBlueBubblesSetupPatch(cfg, accountId, { password: value })
	}],
	textInputs: [{
		inputKey: "httpUrl",
		message: "BlueBubbles server URL",
		placeholder: "http://192.168.1.100:1234",
		helpTitle: "BlueBubbles server URL",
		helpLines: [
			"Enter the BlueBubbles server URL (e.g., http://192.168.1.100:1234).",
			"Find this in the BlueBubbles Server app under Connection.",
			`Docs: ${formatDocsLink("/channels/bluebubbles", "bluebubbles")}`
		],
		currentValue: ({ cfg, accountId }) => resolveBlueBubblesServerUrl(cfg, accountId),
		validate: ({ value }) => validateBlueBubblesServerUrlInput(value),
		normalizeValue: ({ value }) => String(value).trim(),
		applySet: async ({ cfg, accountId, value }) => applyBlueBubblesSetupPatch(cfg, accountId, { serverUrl: value })
	}, {
		inputKey: "webhookPath",
		message: "Webhook path",
		placeholder: DEFAULT_WEBHOOK_PATH,
		currentValue: ({ cfg, accountId }) => {
			const value = resolveBlueBubblesWebhookPath(cfg, accountId);
			return value && value !== "/bluebubbles-webhook" ? value : void 0;
		},
		shouldPrompt: ({ credentialValues }) => credentialValues[CONFIGURE_CUSTOM_WEBHOOK_FLAG] === "1",
		validate: ({ value }) => validateBlueBubblesWebhookPath(value),
		normalizeValue: ({ value }) => String(value).trim(),
		applySet: async ({ cfg, accountId, value }) => applyBlueBubblesSetupPatch(cfg, accountId, { webhookPath: value })
	}],
	completionNote: {
		title: "BlueBubbles next steps",
		lines: [
			"Configure the webhook URL in BlueBubbles Server:",
			"1. Open BlueBubbles Server -> Settings -> Webhooks",
			"2. Add your OpenClaw gateway URL + webhook path",
			`   Example: https://your-gateway-host:3000${DEFAULT_WEBHOOK_PATH}`,
			"3. Enable the webhook and save",
			"",
			`Docs: ${formatDocsLink("/channels/bluebubbles", "bluebubbles")}`
		]
	},
	dmPolicy,
	allowFrom: createAllowFromSection({
		helpTitle: "BlueBubbles allowlist",
		helpLines: [
			"Allowlist BlueBubbles DMs by handle or chat target.",
			"Examples:",
			"- +15555550123",
			"- user@example.com",
			"- chat_id:123",
			"- chat_guid:iMessage;-;+15555550123",
			"Multiple entries: comma- or newline-separated.",
			`Docs: ${formatDocsLink("/channels/bluebubbles", "bluebubbles")}`
		],
		message: "BlueBubbles allowFrom (handle or chat_id)",
		placeholder: "+15555550123, user@example.com, chat_id:123",
		invalidWithoutCredentialNote: "Use a BlueBubbles handle or chat target like +15555550123 or chat_id:123.",
		parseInputs: parseBlueBubblesAllowFromInput,
		parseId: (raw) => validateBlueBubblesAllowFromEntry(raw),
		apply: async ({ cfg, accountId, allowFrom }) => setBlueBubblesAllowFrom(cfg, accountId, allowFrom)
	}),
	disable: (cfg) => ({
		...cfg,
		channels: {
			...cfg.channels,
			bluebubbles: {
				...cfg.channels?.bluebubbles,
				enabled: false
			}
		}
	})
};
//#endregion
export { blueBubblesSetupAdapter as n, BlueBubblesConfigSchema as r, blueBubblesSetupWizard as t };
