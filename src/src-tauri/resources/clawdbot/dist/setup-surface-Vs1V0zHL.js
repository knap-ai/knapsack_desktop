import { t as formatDocsLink } from "./links-Ce33eXq9.js";
import { g as DEFAULT_ACCOUNT_ID } from "./session-key-D7XpmyVq.js";
import { a as hasConfiguredSecretInput } from "./types.secrets-DTXJhyWe.js";
import { D as patchTopLevelChannelConfigSection, P as promptSingleChannelSecretInput, Q as splitSetupEntries, _ as createTopLevelChannelParsedAllowFromPrompt, g as createTopLevelChannelGroupPolicySetter, m as createTopLevelChannelDmPolicy, n as buildSingleChannelSecretPromptState, p as createTopLevelChannelAllowFromSetter, v as mergeAllowFromEntries } from "./setup-wizard-helpers-BfrhuTOh.js";
import "./setup-CPpe7OZc.js";
import { s as inspectFeishuCredentials, t as probeFeishu } from "./probe-Sr6ZihvE.js";
//#region extensions/feishu/src/setup-core.ts
function setFeishuNamedAccountEnabled(cfg, accountId, enabled) {
	const feishuCfg = cfg.channels?.feishu;
	return {
		...cfg,
		channels: {
			...cfg.channels,
			feishu: {
				...feishuCfg,
				accounts: {
					...feishuCfg?.accounts,
					[accountId]: {
						...feishuCfg?.accounts?.[accountId],
						enabled
					}
				}
			}
		}
	};
}
const feishuSetupAdapter = {
	resolveAccountId: () => DEFAULT_ACCOUNT_ID,
	applyAccountConfig: ({ cfg, accountId }) => {
		if (!accountId || accountId === "default") return {
			...cfg,
			channels: {
				...cfg.channels,
				feishu: {
					...cfg.channels?.feishu,
					enabled: true
				}
			}
		};
		return setFeishuNamedAccountEnabled(cfg, accountId, true);
	}
};
//#endregion
//#region extensions/feishu/src/setup-surface.ts
const channel = "feishu";
createTopLevelChannelAllowFromSetter({ channel });
const setFeishuGroupPolicy = createTopLevelChannelGroupPolicySetter({
	channel,
	enabled: true
});
function normalizeString(value) {
	if (typeof value !== "string") return;
	return value.trim() || void 0;
}
function setFeishuGroupAllowFrom(cfg, groupAllowFrom) {
	return {
		...cfg,
		channels: {
			...cfg.channels,
			feishu: {
				...cfg.channels?.feishu,
				groupAllowFrom
			}
		}
	};
}
function isFeishuConfigured(cfg) {
	const feishuCfg = cfg.channels?.feishu;
	const isAppIdConfigured = (value) => {
		if (normalizeString(value)) return true;
		if (!value || typeof value !== "object") return false;
		const rec = value;
		const source = normalizeString(rec.source)?.toLowerCase();
		const id = normalizeString(rec.id);
		if (source === "env" && id) return Boolean(normalizeString(process.env[id]));
		return hasConfiguredSecretInput(value);
	};
	const topLevelConfigured = Boolean(isAppIdConfigured(feishuCfg?.appId) && hasConfiguredSecretInput(feishuCfg?.appSecret));
	const accountConfigured = Object.values(feishuCfg?.accounts ?? {}).some((account) => {
		if (!account || typeof account !== "object") return false;
		const hasOwnAppId = Object.prototype.hasOwnProperty.call(account, "appId");
		const hasOwnAppSecret = Object.prototype.hasOwnProperty.call(account, "appSecret");
		const accountAppIdConfigured = hasOwnAppId ? isAppIdConfigured(account.appId) : isAppIdConfigured(feishuCfg?.appId);
		const accountSecretConfigured = hasOwnAppSecret ? hasConfiguredSecretInput(account.appSecret) : hasConfiguredSecretInput(feishuCfg?.appSecret);
		return Boolean(accountAppIdConfigured && accountSecretConfigured);
	});
	return topLevelConfigured || accountConfigured;
}
const promptFeishuAllowFrom = createTopLevelChannelParsedAllowFromPrompt({
	channel,
	defaultAccountId: DEFAULT_ACCOUNT_ID,
	noteTitle: "Feishu allowlist",
	noteLines: [
		"Allowlist Feishu DMs by open_id or user_id.",
		"You can find user open_id in Feishu admin console or via API.",
		"Examples:",
		"- ou_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
		"- on_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
	],
	message: "Feishu allowFrom (user open_ids)",
	placeholder: "ou_xxxxx, ou_yyyyy",
	parseEntries: (raw) => ({ entries: splitSetupEntries(raw) }),
	mergeEntries: ({ existing, parsed }) => mergeAllowFromEntries(existing, parsed)
});
async function noteFeishuCredentialHelp(prompter) {
	await prompter.note([
		"1) Go to Feishu Open Platform (open.feishu.cn)",
		"2) Create a self-built app",
		"3) Get App ID and App Secret from Credentials page",
		"4) Enable required permissions: im:message, im:chat, contact:user.base:readonly",
		"5) Publish the app or add it to a test group",
		"Tip: you can also set FEISHU_APP_ID / FEISHU_APP_SECRET env vars.",
		`Docs: ${formatDocsLink("/channels/feishu", "feishu")}`
	].join("\n"), "Feishu credentials");
}
async function promptFeishuAppId(params) {
	return String(await params.prompter.text({
		message: "Enter Feishu App ID",
		initialValue: params.initialValue,
		validate: (value) => value?.trim() ? void 0 : "Required"
	})).trim();
}
const feishuSetupWizard = {
	channel,
	resolveAccountIdForConfigure: () => DEFAULT_ACCOUNT_ID,
	resolveShouldPromptAccountIds: () => false,
	status: {
		configuredLabel: "configured",
		unconfiguredLabel: "needs app credentials",
		configuredHint: "configured",
		unconfiguredHint: "needs app creds",
		configuredScore: 2,
		unconfiguredScore: 0,
		resolveConfigured: ({ cfg }) => isFeishuConfigured(cfg),
		resolveStatusLines: async ({ cfg, configured }) => {
			const feishuCfg = cfg.channels?.feishu;
			const resolvedCredentials = inspectFeishuCredentials(feishuCfg);
			let probeResult = null;
			if (configured && resolvedCredentials) try {
				probeResult = await probeFeishu(resolvedCredentials);
			} catch {}
			if (!configured) return ["Feishu: needs app credentials"];
			if (probeResult?.ok) return [`Feishu: connected as ${probeResult.botName ?? probeResult.botOpenId ?? "bot"}`];
			return ["Feishu: configured (connection not verified)"];
		}
	},
	credentials: [],
	finalize: async ({ cfg, prompter, options }) => {
		const feishuCfg = cfg.channels?.feishu;
		const resolved = inspectFeishuCredentials(feishuCfg);
		const hasConfigSecret = hasConfiguredSecretInput(feishuCfg?.appSecret);
		const hasConfigCreds = Boolean(typeof feishuCfg?.appId === "string" && feishuCfg.appId.trim() && hasConfigSecret);
		const appSecretPromptState = buildSingleChannelSecretPromptState({
			accountConfigured: Boolean(resolved),
			hasConfigToken: hasConfigSecret,
			allowEnv: !hasConfigCreds && Boolean(process.env.FEISHU_APP_ID?.trim()),
			envValue: process.env.FEISHU_APP_SECRET
		});
		let next = cfg;
		let appId = null;
		let appSecret = null;
		let appSecretProbeValue = null;
		if (!resolved) await noteFeishuCredentialHelp(prompter);
		const appSecretResult = await promptSingleChannelSecretInput({
			cfg: next,
			prompter,
			providerHint: "feishu",
			credentialLabel: "App Secret",
			secretInputMode: options?.secretInputMode,
			accountConfigured: appSecretPromptState.accountConfigured,
			canUseEnv: appSecretPromptState.canUseEnv,
			hasConfigToken: appSecretPromptState.hasConfigToken,
			envPrompt: "FEISHU_APP_ID + FEISHU_APP_SECRET detected. Use env vars?",
			keepPrompt: "Feishu App Secret already configured. Keep it?",
			inputPrompt: "Enter Feishu App Secret",
			preferredEnvVar: "FEISHU_APP_SECRET"
		});
		if (appSecretResult.action === "use-env") next = patchTopLevelChannelConfigSection({
			cfg: next,
			channel,
			enabled: true,
			patch: {}
		});
		else if (appSecretResult.action === "set") {
			appSecret = appSecretResult.value;
			appSecretProbeValue = appSecretResult.resolvedValue;
			appId = await promptFeishuAppId({
				prompter,
				initialValue: normalizeString(feishuCfg?.appId) ?? normalizeString(process.env.FEISHU_APP_ID)
			});
		}
		if (appId && appSecret) {
			next = patchTopLevelChannelConfigSection({
				cfg: next,
				channel,
				enabled: true,
				patch: {
					appId,
					appSecret
				}
			});
			try {
				const probe = await probeFeishu({
					appId,
					appSecret: appSecretProbeValue ?? void 0,
					domain: (next.channels?.feishu)?.domain
				});
				if (probe.ok) await prompter.note(`Connected as ${probe.botName ?? probe.botOpenId ?? "bot"}`, "Feishu connection test");
				else await prompter.note(`Connection failed: ${probe.error ?? "unknown error"}`, "Feishu connection test");
			} catch (err) {
				await prompter.note(`Connection test failed: ${String(err)}`, "Feishu connection test");
			}
		}
		const currentMode = (next.channels?.feishu)?.connectionMode ?? "websocket";
		const connectionMode = await prompter.select({
			message: "Feishu connection mode",
			options: [{
				value: "websocket",
				label: "WebSocket (default)"
			}, {
				value: "webhook",
				label: "Webhook"
			}],
			initialValue: currentMode
		});
		next = patchTopLevelChannelConfigSection({
			cfg: next,
			channel,
			patch: { connectionMode }
		});
		if (connectionMode === "webhook") {
			const currentVerificationToken = (next.channels?.feishu)?.verificationToken;
			const verificationTokenResult = await promptSingleChannelSecretInput({
				cfg: next,
				prompter,
				providerHint: "feishu-webhook",
				credentialLabel: "verification token",
				secretInputMode: options?.secretInputMode,
				...buildSingleChannelSecretPromptState({
					accountConfigured: hasConfiguredSecretInput(currentVerificationToken),
					hasConfigToken: hasConfiguredSecretInput(currentVerificationToken),
					allowEnv: false
				}),
				envPrompt: "",
				keepPrompt: "Feishu verification token already configured. Keep it?",
				inputPrompt: "Enter Feishu verification token",
				preferredEnvVar: "FEISHU_VERIFICATION_TOKEN"
			});
			if (verificationTokenResult.action === "set") next = patchTopLevelChannelConfigSection({
				cfg: next,
				channel,
				patch: { verificationToken: verificationTokenResult.value }
			});
			const currentEncryptKey = (next.channels?.feishu)?.encryptKey;
			const encryptKeyResult = await promptSingleChannelSecretInput({
				cfg: next,
				prompter,
				providerHint: "feishu-webhook",
				credentialLabel: "encrypt key",
				secretInputMode: options?.secretInputMode,
				...buildSingleChannelSecretPromptState({
					accountConfigured: hasConfiguredSecretInput(currentEncryptKey),
					hasConfigToken: hasConfiguredSecretInput(currentEncryptKey),
					allowEnv: false
				}),
				envPrompt: "",
				keepPrompt: "Feishu encrypt key already configured. Keep it?",
				inputPrompt: "Enter Feishu encrypt key",
				preferredEnvVar: "FEISHU_ENCRYPT_KEY"
			});
			if (encryptKeyResult.action === "set") next = patchTopLevelChannelConfigSection({
				cfg: next,
				channel,
				patch: { encryptKey: encryptKeyResult.value }
			});
			const currentWebhookPath = (next.channels?.feishu)?.webhookPath;
			const webhookPath = String(await prompter.text({
				message: "Feishu webhook path",
				initialValue: currentWebhookPath ?? "/feishu/events",
				validate: (value) => String(value ?? "").trim() ? void 0 : "Required"
			})).trim();
			next = patchTopLevelChannelConfigSection({
				cfg: next,
				channel,
				patch: { webhookPath }
			});
		}
		const currentDomain = (next.channels?.feishu)?.domain ?? "feishu";
		const domain = await prompter.select({
			message: "Which Feishu domain?",
			options: [{
				value: "feishu",
				label: "Feishu (feishu.cn) - China"
			}, {
				value: "lark",
				label: "Lark (larksuite.com) - International"
			}],
			initialValue: currentDomain
		});
		next = patchTopLevelChannelConfigSection({
			cfg: next,
			channel,
			patch: { domain }
		});
		const groupPolicy = await prompter.select({
			message: "Group chat policy",
			options: [
				{
					value: "allowlist",
					label: "Allowlist - only respond in specific groups"
				},
				{
					value: "open",
					label: "Open - respond in all groups (requires mention)"
				},
				{
					value: "disabled",
					label: "Disabled - don't respond in groups"
				}
			],
			initialValue: (next.channels?.feishu)?.groupPolicy ?? "allowlist"
		});
		next = setFeishuGroupPolicy(next, groupPolicy);
		if (groupPolicy === "allowlist") {
			const existing = (next.channels?.feishu)?.groupAllowFrom ?? [];
			const entry = await prompter.text({
				message: "Group chat allowlist (chat_ids)",
				placeholder: "oc_xxxxx, oc_yyyyy",
				initialValue: existing.length > 0 ? existing.map(String).join(", ") : void 0
			});
			if (entry) {
				const parts = splitSetupEntries(String(entry));
				if (parts.length > 0) next = setFeishuGroupAllowFrom(next, parts);
			}
		}
		return { cfg: next };
	},
	dmPolicy: createTopLevelChannelDmPolicy({
		label: "Feishu",
		channel,
		policyKey: "channels.feishu.dmPolicy",
		allowFromKey: "channels.feishu.allowFrom",
		getCurrent: (cfg) => (cfg.channels?.feishu)?.dmPolicy ?? "pairing",
		promptAllowFrom: promptFeishuAllowFrom
	}),
	disable: (cfg) => patchTopLevelChannelConfigSection({
		cfg,
		channel,
		patch: { enabled: false }
	})
};
//#endregion
export { feishuSetupAdapter as n, setFeishuNamedAccountEnabled as r, feishuSetupWizard as t };
