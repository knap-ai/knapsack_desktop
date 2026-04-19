import { c as inspectFeishuCredentials, d as resolveDefaultFeishuAccountId, t as probeFeishu } from "./probe-DftphXPF.js";
import "node:module";
import { DEFAULT_ACCOUNT_ID, formatDocsLink, hasConfiguredSecretInput, mergeAllowFromEntries, patchTopLevelChannelConfigSection, promptSingleChannelSecretInput, splitSetupEntries } from "openclaw/plugin-sdk/setup";
import { fetchWithSsrFGuard } from "openclaw/plugin-sdk/ssrf-runtime";
//#region \0rolldown/runtime.js
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
//#endregion
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
	resolveAccountId: ({ cfg, accountId }) => accountId?.trim() || resolveDefaultFeishuAccountId(cfg),
	applyAccountConfig: ({ cfg, accountId }) => {
		if (!accountId || accountId === DEFAULT_ACCOUNT_ID) return {
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
//#region extensions/feishu/src/app-registration.ts
/**
* Feishu app registration via OAuth device-code flow.
*
* Migrated from feishu-plugin-cli's `feishu-auth.ts` and `install-prompts.ts`.
* Replaces axios with native fetch, removes inquirer/ora/chalk in favor of
* the openclaw WizardPrompter surface.
*/
const FEISHU_ACCOUNTS_URL = "https://accounts.feishu.cn";
const LARK_ACCOUNTS_URL = "https://accounts.larksuite.com";
const REGISTRATION_PATH = "/oauth/v1/app/registration";
const REQUEST_TIMEOUT_MS = 1e4;
function accountsBaseUrl(domain) {
	return domain === "lark" ? LARK_ACCOUNTS_URL : FEISHU_ACCOUNTS_URL;
}
async function postRegistration(baseUrl, body) {
	return await fetchFeishuJson({
		url: `${baseUrl}${REGISTRATION_PATH}`,
		init: {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: new URLSearchParams(body).toString(),
			signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
		},
		auditContext: "feishu.app-registration.post"
	});
}
async function fetchFeishuJson(params) {
	const { response, release } = await fetchWithSsrFGuard({
		url: params.url,
		init: params.init,
		policy: { allowedHostnames: [new URL(params.url).hostname] },
		auditContext: params.auditContext
	});
	try {
		return await response.json();
	} finally {
		await release();
	}
}
/**
* Step 1: Initialize registration and verify the environment supports
* `client_secret` auth.
*
* @throws If the environment does not support `client_secret`.
*/
async function initAppRegistration(domain = "feishu") {
	if (!(await postRegistration(accountsBaseUrl(domain), { action: "init" })).supported_auth_methods?.includes("client_secret")) throw new Error("Current environment does not support client_secret auth method");
}
/**
* Step 2: Begin the device-code flow. Returns a device code and a QR URL
* that the user should scan with Feishu/Lark mobile app.
*/
async function beginAppRegistration(domain = "feishu") {
	const res = await postRegistration(accountsBaseUrl(domain), {
		action: "begin",
		archetype: "PersonalAgent",
		auth_method: "client_secret",
		request_user_info: "open_id"
	});
	const qrUrl = new URL(res.verification_uri_complete);
	qrUrl.searchParams.set("from", "oc_onboard");
	qrUrl.searchParams.set("tp", "ob_cli_app");
	return {
		deviceCode: res.device_code,
		qrUrl: qrUrl.toString(),
		userCode: res.user_code,
		interval: res.interval || 5,
		expireIn: res.expire_in || 600
	};
}
/**
* Step 3: Poll for authorization result until success, denial, expiry, or
* timeout. Automatically handles domain switching when `tenant_brand` is
* detected as "lark".
*/
async function pollAppRegistration(params) {
	const { deviceCode, expireIn, initialDomain = "feishu", abortSignal, tp } = params;
	let currentInterval = params.interval;
	let domain = initialDomain;
	let domainSwitched = false;
	const deadline = Date.now() + expireIn * 1e3;
	while (Date.now() < deadline) {
		if (abortSignal?.aborted) return { status: "timeout" };
		const baseUrl = accountsBaseUrl(domain);
		let pollRes;
		try {
			pollRes = await postRegistration(baseUrl, {
				action: "poll",
				device_code: deviceCode,
				...tp ? { tp } : {}
			});
		} catch {
			await sleep(currentInterval * 1e3);
			continue;
		}
		if (pollRes.user_info?.tenant_brand) {
			const isLark = pollRes.user_info.tenant_brand === "lark";
			if (!domainSwitched && isLark) {
				domain = "lark";
				domainSwitched = true;
				continue;
			}
		}
		if (pollRes.client_id && pollRes.client_secret) return {
			status: "success",
			result: {
				appId: pollRes.client_id,
				appSecret: pollRes.client_secret,
				domain,
				openId: pollRes.user_info?.open_id
			}
		};
		if (pollRes.error) if (pollRes.error === "authorization_pending") {} else if (pollRes.error === "slow_down") currentInterval += 5;
		else if (pollRes.error === "access_denied") return { status: "access_denied" };
		else if (pollRes.error === "expired_token") return { status: "expired" };
		else return {
			status: "error",
			message: `${pollRes.error}: ${pollRes.error_description ?? "unknown"}`
		};
		await sleep(currentInterval * 1e3);
	}
	return { status: "timeout" };
}
/**
* Print QR code directly to stdout.
*
* QR codes must be printed without any surrounding box/border decoration,
* otherwise the pattern is corrupted and cannot be scanned.
*/
async function printQrCode(url) {
	const mod = await import("qrcode-terminal");
	(mod.default ?? mod).generate(url, { small: true });
}
/**
* Fetch the app owner's open_id using the application.v6.application.get API.
*
* Used during setup to auto-populate security policy allowlists.
* Returns undefined on any failure (fail-open).
*/
async function getAppOwnerOpenId(params) {
	const baseUrl = params.domain === "lark" ? "https://open.larksuite.com" : "https://open.feishu.cn";
	try {
		const tokenData = await fetchFeishuJson({
			url: `${baseUrl}/open-apis/auth/v3/tenant_access_token/internal`,
			init: {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					app_id: params.appId,
					app_secret: params.appSecret
				}),
				signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
			},
			auditContext: "feishu.app-registration.owner-token"
		});
		if (!tokenData.tenant_access_token) return;
		const appData = await fetchFeishuJson({
			url: `${baseUrl}/open-apis/application/v6/applications/${params.appId}?user_id_type=open_id`,
			init: {
				method: "GET",
				headers: {
					Authorization: `Bearer ${tokenData.tenant_access_token}`,
					"Content-Type": "application/json"
				},
				signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
			},
			auditContext: "feishu.app-registration.owner-app"
		});
		if (appData.code !== 0) return;
		const app = appData.data?.app;
		const owner = app?.owner;
		return (owner?.owner_type ?? owner?.type) === 2 && owner?.owner_id ? owner.owner_id : app?.creator_id ?? owner?.owner_id;
	} catch {
		return;
	}
}
function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
//#endregion
//#region extensions/feishu/src/setup-surface.ts
var setup_surface_exports = /* @__PURE__ */ __exportAll({
	feishuSetupWizard: () => feishuSetupWizard,
	runFeishuLogin: () => runFeishuLogin
});
const channel = "feishu";
function normalizeString(value) {
	if (typeof value !== "string") return;
	return value.trim() || void 0;
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
	const topLevelConfigured = isAppIdConfigured(feishuCfg?.appId) && hasConfiguredSecretInput(feishuCfg?.appSecret);
	const accountConfigured = Object.values(feishuCfg?.accounts ?? {}).some((account) => {
		if (!account || typeof account !== "object") return false;
		const hasOwnAppId = Object.prototype.hasOwnProperty.call(account, "appId");
		const hasOwnAppSecret = Object.prototype.hasOwnProperty.call(account, "appSecret");
		const accountAppIdConfigured = hasOwnAppId ? isAppIdConfigured(account.appId) : isAppIdConfigured(feishuCfg?.appId);
		const accountSecretConfigured = hasOwnAppSecret ? hasConfiguredSecretInput(account.appSecret) : hasConfiguredSecretInput(feishuCfg?.appSecret);
		return accountAppIdConfigured && accountSecretConfigured;
	});
	return topLevelConfigured || accountConfigured;
}
/**
* Patch feishu config at the correct location based on accountId.
* - DEFAULT_ACCOUNT_ID → writes to top-level channels.feishu
* - named account → writes to channels.feishu.accounts[accountId]
*/
function patchFeishuConfig(cfg, accountId, patch) {
	const feishuCfg = cfg.channels?.feishu;
	if (accountId === DEFAULT_ACCOUNT_ID) return patchTopLevelChannelConfigSection({
		cfg,
		channel,
		enabled: true,
		patch
	});
	const nextAccountPatch = {
		...feishuCfg?.accounts?.[accountId],
		enabled: true,
		...patch
	};
	return patchTopLevelChannelConfigSection({
		cfg,
		channel,
		enabled: true,
		patch: { accounts: {
			...feishuCfg?.accounts,
			[accountId]: nextAccountPatch
		} }
	});
}
async function promptFeishuAllowFrom(params) {
	const feishuCfg = params.cfg.channels?.feishu;
	const resolvedAccountId = params.accountId ?? resolveDefaultFeishuAccountId(params.cfg);
	const existingAllowFrom = (resolvedAccountId !== DEFAULT_ACCOUNT_ID ? feishuCfg?.accounts?.[resolvedAccountId] : void 0)?.allowFrom ?? feishuCfg?.allowFrom ?? [];
	await params.prompter.note([
		"Allowlist Feishu DMs by open_id or user_id.",
		"You can find user open_id in Feishu admin console or via API.",
		"Examples:",
		"- ou_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
		"- on_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
	].join("\n"), "Feishu allowlist");
	const mergedAllowFrom = mergeAllowFromEntries(existingAllowFrom, splitSetupEntries(await params.prompter.text({
		message: "Feishu allowFrom (user open_ids)",
		placeholder: "ou_xxxxx, ou_yyyyy",
		initialValue: existingAllowFrom.length > 0 ? existingAllowFrom.map(String).join(", ") : void 0
	})));
	return patchFeishuConfig(params.cfg, resolvedAccountId, { allowFrom: mergedAllowFrom });
}
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
	return (await params.prompter.text({
		message: "Enter Feishu App ID",
		initialValue: params.initialValue,
		validate: (value) => value?.trim() ? void 0 : "Required"
	})).trim();
}
const feishuDmPolicy = {
	label: "Feishu",
	channel,
	policyKey: "channels.feishu.dmPolicy",
	allowFromKey: "channels.feishu.allowFrom",
	resolveConfigKeys: (_cfg, accountId) => {
		const resolvedAccountId = accountId ?? resolveDefaultFeishuAccountId(_cfg);
		return resolvedAccountId !== DEFAULT_ACCOUNT_ID ? {
			policyKey: `channels.feishu.accounts.${resolvedAccountId}.dmPolicy`,
			allowFromKey: `channels.feishu.accounts.${resolvedAccountId}.allowFrom`
		} : {
			policyKey: "channels.feishu.dmPolicy",
			allowFromKey: "channels.feishu.allowFrom"
		};
	},
	getCurrent: (cfg, accountId) => {
		const feishuCfg = cfg.channels?.feishu;
		const resolvedAccountId = accountId ?? resolveDefaultFeishuAccountId(cfg);
		if (resolvedAccountId !== DEFAULT_ACCOUNT_ID) {
			const account = feishuCfg?.accounts?.[resolvedAccountId];
			if (account?.dmPolicy) return account.dmPolicy;
		}
		return feishuCfg?.dmPolicy ?? "pairing";
	},
	setPolicy: (cfg, policy, accountId) => {
		return patchFeishuConfig(cfg, accountId ?? resolveDefaultFeishuAccountId(cfg), {
			dmPolicy: policy,
			...policy === "open" ? { allowFrom: mergeAllowFromEntries([], ["*"]) } : {}
		});
	},
	promptAllowFrom: promptFeishuAllowFrom
};
function applyNewAppSecurityPolicy(cfg, accountId, openId, groupPolicy) {
	let next = cfg;
	if (openId) next = patchFeishuConfig(next, accountId, {
		dmPolicy: "allowlist",
		allowFrom: [openId]
	});
	const groupPatch = { groupPolicy };
	if (groupPolicy === "open") groupPatch.requireMention = true;
	next = patchFeishuConfig(next, accountId, groupPatch);
	return next;
}
async function runScanToCreate(prompter) {
	try {
		await initAppRegistration("feishu");
	} catch {
		await prompter.note("Scan-to-create is not available in this environment. Falling back to manual input.", "Feishu setup");
		return null;
	}
	const begin = await beginAppRegistration("feishu");
	await prompter.note("Scan the QR with Lark/Feishu on your phone.", "Feishu scan-to-create");
	await printQrCode(begin.qrUrl);
	const progress = prompter.progress("Fetching configuration results...");
	const outcome = await pollAppRegistration({
		deviceCode: begin.deviceCode,
		interval: begin.interval,
		expireIn: begin.expireIn,
		initialDomain: "feishu",
		tp: "ob_app"
	});
	switch (outcome.status) {
		case "success":
			progress.stop("Scan completed.");
			return outcome.result;
		case "access_denied":
			progress.stop("User denied authorization. Falling back to manual input.");
			return null;
		case "expired":
			progress.stop("Session expired. Falling back to manual input.");
			return null;
		case "timeout":
			progress.stop("Scan timed out. Falling back to manual input.");
			return null;
		case "error":
			progress.stop(`Registration error: ${outcome.message}. Falling back to manual input.`);
			return null;
	}
	return null;
}
async function runNewAppFlow(params) {
	const { prompter, options } = params;
	let next = params.cfg;
	const targetAccountId = resolveDefaultFeishuAccountId(next);
	let appId = null;
	let appSecret = null;
	let appSecretProbeValue = null;
	let scanDomain;
	let scanOpenId;
	const scanResult = await runScanToCreate(prompter);
	if (scanResult) {
		appId = scanResult.appId;
		appSecret = scanResult.appSecret;
		appSecretProbeValue = scanResult.appSecret;
		scanDomain = scanResult.domain;
		scanOpenId = scanResult.openId;
	} else {
		const feishuCfg = next.channels?.feishu;
		await noteFeishuCredentialHelp(prompter);
		const currentDomain = feishuCfg?.domain ?? "feishu";
		scanDomain = await prompter.select({
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
		appId = await promptFeishuAppId({
			prompter,
			initialValue: normalizeString(process.env.FEISHU_APP_ID)
		});
		const appSecretResult = await promptSingleChannelSecretInput({
			cfg: next,
			prompter,
			providerHint: "feishu",
			credentialLabel: "App Secret",
			secretInputMode: options?.secretInputMode,
			accountConfigured: false,
			canUseEnv: false,
			hasConfigToken: false,
			envPrompt: "",
			keepPrompt: "Feishu App Secret already configured. Keep it?",
			inputPrompt: "Enter Feishu App Secret",
			preferredEnvVar: "FEISHU_APP_SECRET"
		});
		if (appSecretResult.action === "set") {
			appSecret = appSecretResult.value;
			appSecretProbeValue = appSecretResult.resolvedValue;
		}
		if (appId && appSecretProbeValue) scanOpenId = await getAppOwnerOpenId({
			appId,
			appSecret: appSecretProbeValue,
			domain: scanDomain
		});
	}
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
		initialValue: "allowlist"
	});
	const configProgress = prompter.progress("Configuring...");
	await new Promise((resolve) => setTimeout(resolve, 50));
	if (appId && appSecret) next = patchFeishuConfig(next, targetAccountId, {
		appId,
		appSecret,
		connectionMode: "websocket",
		...scanDomain ? { domain: scanDomain } : {}
	});
	else if (scanDomain) next = patchFeishuConfig(next, targetAccountId, { domain: scanDomain });
	next = applyNewAppSecurityPolicy(next, targetAccountId, scanOpenId, groupPolicy);
	configProgress.stop("Bot configured.");
	return { cfg: next };
}
async function runEditFlow(params) {
	const { prompter, options } = params;
	const next = params.cfg;
	const feishuCfg = next.channels?.feishu;
	const resolveAppIdLabel = (value) => {
		const asString = normalizeString(value);
		if (asString) return asString;
		if (value && typeof value === "object") {
			const rec = value;
			if (normalizeString(rec.source) && normalizeString(rec.id)) return normalizeString(process.env[rec.id]) ?? `env:${String(rec.id)}`;
			if (hasConfiguredSecretInput(value)) return "(configured)";
		}
	};
	const existingAppId = resolveAppIdLabel(feishuCfg?.appId) ?? Object.values(feishuCfg?.accounts ?? {}).reduce((found, account) => {
		if (found) return found;
		if (account && typeof account === "object") return resolveAppIdLabel(account.appId);
	}, void 0);
	if (existingAppId) {
		if (!await prompter.confirm({
			message: `We found an existing bot (App ID: ${existingAppId}). Use it for this setup?`,
			initialValue: true
		})) return runNewAppFlow({
			cfg: next,
			prompter,
			options
		});
	} else return runNewAppFlow({
		cfg: next,
		prompter,
		options
	});
	await prompter.note("Bot configured.", "");
	return { cfg: next };
}
async function runFeishuLogin(params) {
	const { cfg, prompter } = params;
	const options = {};
	if (isFeishuConfigured(cfg)) {
		const result = await runEditFlow({
			cfg,
			prompter,
			options
		});
		if (result === null) return cfg;
		return result.cfg;
	}
	return (await runNewAppFlow({
		cfg,
		prompter,
		options
	})).cfg;
}
const feishuSetupWizard = {
	channel,
	resolveAccountIdForConfigure: ({ accountOverride, defaultAccountId, cfg }) => (typeof accountOverride === "string" && accountOverride.trim() ? accountOverride.trim() : void 0) ?? resolveDefaultFeishuAccountId(cfg) ?? defaultAccountId,
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
	prepare: async ({ cfg, credentialValues }) => {
		if (isFeishuConfigured(cfg)) return { credentialValues: {
			...credentialValues,
			_flow: "edit"
		} };
		return { credentialValues: {
			...credentialValues,
			_flow: "new"
		} };
	},
	credentials: [],
	finalize: async ({ cfg, prompter, options, credentialValues }) => {
		if ((credentialValues._flow ?? "new") === "edit") {
			const result = await runEditFlow({
				cfg,
				prompter,
				options
			});
			if (result === null) return { cfg };
			return result;
		}
		return runNewAppFlow({
			cfg,
			prompter,
			options
		});
	},
	dmPolicy: feishuDmPolicy,
	disable: (cfg) => patchTopLevelChannelConfigSection({
		cfg,
		channel,
		patch: { enabled: false }
	})
};
//#endregion
export { setFeishuNamedAccountEnabled as a, feishuSetupAdapter as i, runFeishuLogin as n, setup_surface_exports as r, feishuSetupWizard as t };
