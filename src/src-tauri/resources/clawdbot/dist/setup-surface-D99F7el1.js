import { t as formatDocsLink } from "./links-8xRhWBQL.js";
import { _ as normalizeAccountId, g as DEFAULT_ACCOUNT_ID } from "./session-key-DAhnzjyr.js";
import { o as isSecretRef } from "./types.secrets-DgX397vI.js";
import { t as resolveAccountEntry } from "./account-lookup-C4CvUou_.js";
import { o as resolveMergedAccountConfig, t as createAccountListHelpers } from "./account-helpers-BzkeDMfB.js";
import { a as migrateBaseNameToDefaultAccount, i as createPatchedAccountSetupAdapter, n as applySetupAccountConfigPatch } from "./setup-helpers-B2gYys18.js";
import { D as mergeAllowFromEntries, _ as createNestedChannelDmPolicy, st as splitSetupEntries, x as createStandardChannelSetupStatus, y as createNestedChannelParsedAllowFromPrompt } from "./setup-wizard-proxy-DoOpOF8S.js";
//#region extensions/googlechat/src/accounts.ts
const ENV_SERVICE_ACCOUNT$1 = "GOOGLE_CHAT_SERVICE_ACCOUNT";
const ENV_SERVICE_ACCOUNT_FILE$1 = "GOOGLE_CHAT_SERVICE_ACCOUNT_FILE";
const { listAccountIds: listGoogleChatAccountIds, resolveDefaultAccountId: resolveDefaultGoogleChatAccountId } = createAccountListHelpers("googlechat");
function mergeGoogleChatAccountConfig(cfg, accountId) {
	const raw = cfg.channels?.["googlechat"] ?? {};
	const base = resolveMergedAccountConfig({
		channelConfig: raw,
		accounts: raw.accounts,
		accountId,
		omitKeys: ["defaultAccount"]
	});
	const defaultAccountConfig = resolveAccountEntry(raw.accounts, "default") ?? {};
	if (accountId === "default") return base;
	const { enabled: _ignoredEnabled, dangerouslyAllowNameMatching: _ignoredDangerouslyAllowNameMatching, serviceAccount: _ignoredServiceAccount, serviceAccountRef: _ignoredServiceAccountRef, serviceAccountFile: _ignoredServiceAccountFile, ...defaultAccountShared } = defaultAccountConfig;
	return {
		...defaultAccountShared,
		...base
	};
}
function parseServiceAccount(value) {
	if (value && typeof value === "object") {
		if (isSecretRef(value)) return null;
		return value;
	}
	if (typeof value !== "string") return null;
	const trimmed = value.trim();
	if (!trimmed) return null;
	try {
		return JSON.parse(trimmed);
	} catch {
		return null;
	}
}
function resolveCredentialsFromConfig(params) {
	const { account, accountId } = params;
	const inline = parseServiceAccount(account.serviceAccount);
	if (inline) return {
		credentials: inline,
		source: "inline"
	};
	if (isSecretRef(account.serviceAccount)) throw new Error(`channels.googlechat.accounts.${accountId}.serviceAccount: unresolved SecretRef "${account.serviceAccount.source}:${account.serviceAccount.provider}:${account.serviceAccount.id}". Resolve this command against an active gateway runtime snapshot before reading it.`);
	if (isSecretRef(account.serviceAccountRef)) throw new Error(`channels.googlechat.accounts.${accountId}.serviceAccount: unresolved SecretRef "${account.serviceAccountRef.source}:${account.serviceAccountRef.provider}:${account.serviceAccountRef.id}". Resolve this command against an active gateway runtime snapshot before reading it.`);
	const file = account.serviceAccountFile?.trim();
	if (file) return {
		credentialsFile: file,
		source: "file"
	};
	if (accountId === "default") {
		const envJson = process.env[ENV_SERVICE_ACCOUNT$1];
		const envInline = parseServiceAccount(envJson);
		if (envInline) return {
			credentials: envInline,
			source: "env"
		};
		const envFile = process.env[ENV_SERVICE_ACCOUNT_FILE$1]?.trim();
		if (envFile) return {
			credentialsFile: envFile,
			source: "env"
		};
	}
	return { source: "none" };
}
function resolveGoogleChatAccount(params) {
	const accountId = normalizeAccountId(params.accountId);
	const baseEnabled = params.cfg.channels?.["googlechat"]?.enabled !== false;
	const merged = mergeGoogleChatAccountConfig(params.cfg, accountId);
	const accountEnabled = merged.enabled !== false;
	const enabled = baseEnabled && accountEnabled;
	const credentials = resolveCredentialsFromConfig({
		accountId,
		account: merged
	});
	return {
		accountId,
		name: merged.name?.trim() || void 0,
		enabled,
		config: merged,
		credentialSource: credentials.source,
		credentials: credentials.credentials,
		credentialsFile: credentials.credentialsFile
	};
}
function listEnabledGoogleChatAccounts(cfg) {
	return listGoogleChatAccountIds(cfg).map((accountId) => resolveGoogleChatAccount({
		cfg,
		accountId
	})).filter((account) => account.enabled);
}
const googlechatSetupAdapter = createPatchedAccountSetupAdapter({
	channelKey: "googlechat",
	validateInput: ({ accountId, input }) => {
		if (input.useEnv && accountId !== "default") return "GOOGLE_CHAT_SERVICE_ACCOUNT env vars can only be used for the default account.";
		if (!input.useEnv && !input.token && !input.tokenFile) return "Google Chat requires --token (service account JSON) or --token-file.";
		return null;
	},
	buildPatch: (input) => {
		const patch = input.useEnv ? {} : input.tokenFile ? { serviceAccountFile: input.tokenFile } : input.token ? { serviceAccount: input.token } : {};
		const audienceType = input.audienceType?.trim();
		const audience = input.audience?.trim();
		const webhookPath = input.webhookPath?.trim();
		const webhookUrl = input.webhookUrl?.trim();
		return {
			...patch,
			...audienceType ? { audienceType } : {},
			...audience ? { audience } : {},
			...webhookPath ? { webhookPath } : {},
			...webhookUrl ? { webhookUrl } : {}
		};
	}
});
//#endregion
//#region extensions/googlechat/src/setup-surface.ts
const channel = "googlechat";
const ENV_SERVICE_ACCOUNT = "GOOGLE_CHAT_SERVICE_ACCOUNT";
const ENV_SERVICE_ACCOUNT_FILE = "GOOGLE_CHAT_SERVICE_ACCOUNT_FILE";
const USE_ENV_FLAG = "__googlechatUseEnv";
const AUTH_METHOD_FLAG = "__googlechatAuthMethod";
const googlechatDmPolicy = createNestedChannelDmPolicy({
	label: "Google Chat",
	channel,
	section: "dm",
	policyKey: "channels.googlechat.dm.policy",
	allowFromKey: "channels.googlechat.dm.allowFrom",
	getCurrent: (cfg) => cfg.channels?.googlechat?.dm?.policy ?? "pairing",
	promptAllowFrom: createNestedChannelParsedAllowFromPrompt({
		channel,
		section: "dm",
		defaultAccountId: DEFAULT_ACCOUNT_ID,
		enabled: true,
		message: "Google Chat allowFrom (users/<id> or raw email; avoid users/<email>)",
		placeholder: "users/123456789, name@example.com",
		parseEntries: (raw) => ({ entries: mergeAllowFromEntries(void 0, splitSetupEntries(raw)) })
	}),
	enabled: true
});
const googlechatSetupWizard = {
	channel,
	status: createStandardChannelSetupStatus({
		channelLabel: "Google Chat",
		configuredLabel: "configured",
		unconfiguredLabel: "needs service account",
		configuredHint: "configured",
		unconfiguredHint: "needs auth",
		includeStatusLine: true,
		resolveConfigured: ({ cfg }) => listGoogleChatAccountIds(cfg).some((accountId) => resolveGoogleChatAccount({
			cfg,
			accountId
		}).credentialSource !== "none")
	}),
	introNote: {
		title: "Google Chat setup",
		lines: [
			"Google Chat apps use service-account auth and an HTTPS webhook.",
			"Set the Chat API scopes in your service account and configure the Chat app URL.",
			"Webhook verification requires audience type + audience value.",
			`Docs: ${formatDocsLink("/channels/googlechat", "googlechat")}`
		]
	},
	prepare: async ({ cfg, accountId, credentialValues, prompter }) => {
		if (accountId === "default" && (Boolean(process.env[ENV_SERVICE_ACCOUNT]) || Boolean(process.env[ENV_SERVICE_ACCOUNT_FILE]))) {
			if (await prompter.confirm({
				message: "Use GOOGLE_CHAT_SERVICE_ACCOUNT env vars?",
				initialValue: true
			})) return {
				cfg: applySetupAccountConfigPatch({
					cfg,
					channelKey: channel,
					accountId,
					patch: {}
				}),
				credentialValues: {
					...credentialValues,
					[USE_ENV_FLAG]: "1"
				}
			};
		}
		const method = await prompter.select({
			message: "Google Chat auth method",
			options: [{
				value: "file",
				label: "Service account JSON file"
			}, {
				value: "inline",
				label: "Paste service account JSON"
			}],
			initialValue: "file"
		});
		return { credentialValues: {
			...credentialValues,
			[USE_ENV_FLAG]: "0",
			[AUTH_METHOD_FLAG]: String(method)
		} };
	},
	credentials: [],
	textInputs: [{
		inputKey: "tokenFile",
		message: "Service account JSON path",
		placeholder: "/path/to/service-account.json",
		shouldPrompt: ({ credentialValues }) => credentialValues[USE_ENV_FLAG] !== "1" && credentialValues[AUTH_METHOD_FLAG] === "file",
		validate: ({ value }) => String(value ?? "").trim() ? void 0 : "Required",
		normalizeValue: ({ value }) => String(value).trim(),
		applySet: async ({ cfg, accountId, value }) => applySetupAccountConfigPatch({
			cfg,
			channelKey: channel,
			accountId,
			patch: { serviceAccountFile: value }
		})
	}, {
		inputKey: "token",
		message: "Service account JSON (single line)",
		placeholder: "{\"type\":\"service_account\", ... }",
		shouldPrompt: ({ credentialValues }) => credentialValues[USE_ENV_FLAG] !== "1" && credentialValues[AUTH_METHOD_FLAG] === "inline",
		validate: ({ value }) => String(value ?? "").trim() ? void 0 : "Required",
		normalizeValue: ({ value }) => String(value).trim(),
		applySet: async ({ cfg, accountId, value }) => applySetupAccountConfigPatch({
			cfg,
			channelKey: channel,
			accountId,
			patch: { serviceAccount: value }
		})
	}],
	finalize: async ({ cfg, accountId, prompter }) => {
		const account = resolveGoogleChatAccount({
			cfg,
			accountId
		});
		const audienceType = await prompter.select({
			message: "Webhook audience type",
			options: [{
				value: "app-url",
				label: "App URL (recommended)"
			}, {
				value: "project-number",
				label: "Project number"
			}],
			initialValue: account.config.audienceType === "project-number" ? "project-number" : "app-url"
		});
		const audience = await prompter.text({
			message: audienceType === "project-number" ? "Project number" : "App URL",
			placeholder: audienceType === "project-number" ? "1234567890" : "https://your.host/googlechat",
			initialValue: account.config.audience || void 0,
			validate: (value) => String(value ?? "").trim() ? void 0 : "Required"
		});
		return { cfg: migrateBaseNameToDefaultAccount({
			cfg: applySetupAccountConfigPatch({
				cfg,
				channelKey: channel,
				accountId,
				patch: {
					audienceType,
					audience: String(audience).trim()
				}
			}),
			channelKey: channel
		}) };
	},
	dmPolicy: googlechatDmPolicy
};
//#endregion
export { resolveDefaultGoogleChatAccountId as a, listGoogleChatAccountIds as i, googlechatSetupAdapter as n, resolveGoogleChatAccount as o, listEnabledGoogleChatAccounts as r, googlechatSetupWizard as t };
