import { t as formatDocsLink } from "./links-Ce33eXq9.js";
import { _ as normalizeAccountId } from "./session-key-D7XpmyVq.js";
import { a as hasConfiguredSecretInput, l as normalizeSecretInputString } from "./types.secrets-DTXJhyWe.js";
import { a as createSetupInputPresenceValidator, l as patchScopedAccountConfig, u as prepareScopedSetupConfig } from "./setup-helpers-CjYO5YkF.js";
import { r as describeWebhookAccountSnapshot } from "./account-helpers-DqNwQN08.js";
import { c as createScopedChannelConfigAdapter, t as adaptScopedAccountAccessor } from "./channel-config-helpers-B0S2z66F.js";
import { a as createAllowFromSection, d as createPromptParsedAllowFromForAccount, f as createStandardChannelSetupStatus, h as createTopLevelChannelDmPolicySetter } from "./setup-wizard-helpers-BfrhuTOh.js";
import { n as formatNormalizedAllowFromEntries } from "./allow-from-BJ5FBYvV.js";
import "./setup-CPpe7OZc.js";
import "./secret-input-B35x6hdb.js";
import { d as parseBlueBubblesAllowTarget, h as resolveDefaultBlueBubblesAccountId, l as normalizeBlueBubblesHandle, m as resolveBlueBubblesAccount, p as listBlueBubblesAccountIds, t as DEFAULT_WEBHOOK_PATH, v as normalizeBlueBubblesServerUrl } from "./webhook-shared-Ccc9UQT3.js";
import { t as BlueBubblesChannelConfigSchema } from "./config-schema-wwD-T6Iq.js";
//#region extensions/bluebubbles/src/channel-shared.ts
const bluebubblesMeta = {
	id: "bluebubbles",
	label: "BlueBubbles",
	selectionLabel: "BlueBubbles (macOS app)",
	detailLabel: "BlueBubbles",
	docsPath: "/channels/bluebubbles",
	docsLabel: "bluebubbles",
	blurb: "iMessage via the BlueBubbles mac app + REST API.",
	systemImage: "bubble.left.and.text.bubble.right",
	aliases: ["bb"],
	order: 75,
	preferOver: ["imessage"]
};
const bluebubblesCapabilities = {
	chatTypes: ["direct", "group"],
	media: true,
	reactions: true,
	edit: true,
	unsend: true,
	reply: true,
	effects: true,
	groupManagement: true
};
const bluebubblesReload = { configPrefixes: ["channels.bluebubbles"] };
const bluebubblesConfigSchema = BlueBubblesChannelConfigSchema;
const bluebubblesConfigAdapter = createScopedChannelConfigAdapter({
	sectionKey: "bluebubbles",
	listAccountIds: listBlueBubblesAccountIds,
	resolveAccount: adaptScopedAccountAccessor(resolveBlueBubblesAccount),
	defaultAccountId: resolveDefaultBlueBubblesAccountId,
	clearBaseFields: [
		"serverUrl",
		"password",
		"name",
		"webhookPath"
	],
	resolveAllowFrom: (account) => account.config.allowFrom,
	formatAllowFrom: (allowFrom) => formatNormalizedAllowFromEntries({
		allowFrom,
		normalizeEntry: (entry) => normalizeBlueBubblesHandle(entry.replace(/^bluebubbles:/i, ""))
	})
});
function describeBlueBubblesAccount(account) {
	return describeWebhookAccountSnapshot({
		account,
		configured: account.configured,
		extra: { baseUrl: account.baseUrl }
	});
}
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
	validateInput: createSetupInputPresenceValidator({ validate: ({ input }) => {
		if (!input.httpUrl && !input.password) return "BlueBubbles requires --http-url and --password.";
		if (!input.httpUrl) return "BlueBubbles requires --http-url.";
		if (!input.password) return "BlueBubbles requires --password.";
		return null;
	} }),
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
export { bluebubblesConfigSchema as a, describeBlueBubblesAccount as c, bluebubblesConfigAdapter as i, blueBubblesSetupAdapter as n, bluebubblesMeta as o, bluebubblesCapabilities as r, bluebubblesReload as s, blueBubblesSetupWizard as t };
