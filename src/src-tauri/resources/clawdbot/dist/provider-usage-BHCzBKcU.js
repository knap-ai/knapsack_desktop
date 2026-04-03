import { n as ensureAuthProfileStore } from "./store-CY-e50gT.js";
import { t as resolveApiKeyForProfile } from "./auth-profiles-bVW1e9Dr.js";
import { r as normalizeProviderId } from "./provider-id-CTiEzT1T.js";
import "./model-selection-8a6zD_aX.js";
import { c as loadConfig } from "./io-DhtVmzAJ.js";
import "./config-CJQx-9zo.js";
import { n as resolveAuthProfileOrder } from "./order-CJ_D8C7W.js";
import { n as normalizeSecretInput } from "./normalize-secret-input-CRNbANMO.js";
import { n as listProfilesForProvider, t as dedupeProfileIds } from "./profiles-RmR8EAZC.js";
import { N as resolveProviderUsageAuthWithPlugin, P as resolveProviderUsageSnapshotWithPlugin } from "./provider-runtime-Dhor2yYF.js";
import { u as isNonSecretApiKeyMarker } from "./model-auth-markers-BjPX15EF.js";
import { l as resolveUsableCustomProviderApiKey } from "./model-auth-BxuwOp1l.js";
import { a as fetchClaudeUsage, d as clampPercent, f as ignoredErrors, g as withTimeout, h as usageProviders, i as fetchCodexUsage, n as fetchMinimaxUsage, p as resolveLegacyPiAgentAccessToken, r as fetchGeminiUsage, t as fetchZaiUsage, u as PROVIDER_LABELS } from "./provider-usage.fetch-M75Vjeyz.js";
import { t as resolveFetch } from "./fetch-DXie9oiC.js";
//#region src/infra/provider-usage.format.ts
function formatResetRemaining(targetMs, now) {
	if (!targetMs) return null;
	const diffMs = targetMs - (now ?? Date.now());
	if (diffMs <= 0) return "now";
	const diffMins = Math.floor(diffMs / 6e4);
	if (diffMins < 60) return `${diffMins}m`;
	const hours = Math.floor(diffMins / 60);
	const mins = diffMins % 60;
	if (hours < 24) return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
	const days = Math.floor(hours / 24);
	if (days < 7) return `${days}d ${hours % 24}h`;
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric"
	}).format(new Date(targetMs));
}
function formatWindowShort(window, now) {
	const remaining = clampPercent(100 - window.usedPercent);
	const reset = formatResetRemaining(window.resetAt, now);
	const resetSuffix = reset ? ` ⏱${reset}` : "";
	return `${remaining.toFixed(0)}% left (${window.label}${resetSuffix})`;
}
function formatUsageWindowSummary(snapshot, opts) {
	if (snapshot.error) return null;
	if (snapshot.windows.length === 0) return null;
	const now = opts?.now ?? Date.now();
	const maxWindows = typeof opts?.maxWindows === "number" && opts.maxWindows > 0 ? Math.min(opts.maxWindows, snapshot.windows.length) : snapshot.windows.length;
	const includeResets = opts?.includeResets ?? false;
	return snapshot.windows.slice(0, maxWindows).map((window) => {
		const remaining = clampPercent(100 - window.usedPercent);
		const reset = includeResets ? formatResetRemaining(window.resetAt, now) : null;
		const resetSuffix = reset ? ` ⏱${reset}` : "";
		return `${window.label} ${remaining.toFixed(0)}% left${resetSuffix}`;
	}).join(" · ");
}
function formatUsageSummaryLine(summary, opts) {
	const providers = summary.providers.filter((entry) => entry.windows.length > 0 && !entry.error).slice(0, opts?.maxProviders ?? summary.providers.length);
	if (providers.length === 0) return null;
	return `📊 Usage: ${providers.map((entry) => {
		const window = entry.windows.reduce((best, next) => next.usedPercent > best.usedPercent ? next : best);
		return `${entry.displayName} ${formatWindowShort(window, opts?.now)}`;
	}).join(" · ")}`;
}
function formatUsageReportLines(summary, opts) {
	if (summary.providers.length === 0) return ["Usage: no provider usage available."];
	const lines = ["Usage:"];
	for (const entry of summary.providers) {
		const planSuffix = entry.plan ? ` (${entry.plan})` : "";
		if (entry.error) {
			lines.push(`  ${entry.displayName}${planSuffix}: ${entry.error}`);
			continue;
		}
		if (entry.windows.length === 0) {
			lines.push(`  ${entry.displayName}${planSuffix}: no data`);
			continue;
		}
		lines.push(`  ${entry.displayName}${planSuffix}`);
		for (const window of entry.windows) {
			const remaining = clampPercent(100 - window.usedPercent);
			const reset = formatResetRemaining(window.resetAt, opts?.now);
			const resetSuffix = reset ? ` · resets ${reset}` : "";
			lines.push(`    ${window.label}: ${remaining.toFixed(0)}% left${resetSuffix}`);
		}
	}
	return lines;
}
//#endregion
//#region src/infra/provider-usage.auth.ts
function parseGoogleUsageToken(apiKey) {
	try {
		const parsed = JSON.parse(apiKey);
		if (typeof parsed?.token === "string") return parsed.token;
	} catch {}
	return apiKey;
}
function resolveProviderApiKeyFromConfigAndStore(params) {
	const envDirect = params.envDirect?.map(normalizeSecretInput).find(Boolean);
	if (envDirect) return envDirect;
	for (const providerId of params.providerIds) {
		const key = resolveUsableCustomProviderApiKey({
			cfg: params.state.cfg,
			provider: providerId
		})?.apiKey;
		if (key) return key;
	}
	const cred = [...new Set(params.providerIds.map((providerId) => normalizeProviderId(providerId)).filter(Boolean))].flatMap((providerId) => listProfilesForProvider(params.state.store, providerId)).map((id) => params.state.store.profiles[id]).find((profile) => profile?.type === "api_key" || profile?.type === "token");
	if (!cred) return;
	if (cred.type === "api_key") {
		const key = normalizeSecretInput(cred.key);
		if (key && !isNonSecretApiKeyMarker(key)) return key;
		return;
	}
	const token = normalizeSecretInput(cred.token);
	if (token && !isNonSecretApiKeyMarker(token)) return token;
}
async function resolveOAuthToken(params) {
	const deduped = dedupeProfileIds(resolveAuthProfileOrder({
		cfg: params.state.cfg,
		store: params.state.store,
		provider: params.provider
	}));
	for (const profileId of deduped) {
		const cred = params.state.store.profiles[profileId];
		if (!cred || cred.type !== "oauth" && cred.type !== "token") continue;
		try {
			const resolved = await resolveApiKeyForProfile({
				cfg: params.state.cfg,
				store: params.state.store,
				profileId,
				agentDir: params.state.agentDir
			});
			if (!resolved) continue;
			return {
				provider: params.provider,
				token: resolved.apiKey,
				accountId: cred.type === "oauth" && "accountId" in cred ? cred.accountId : void 0
			};
		} catch {}
	}
	return null;
}
async function resolveProviderUsageAuthViaPlugin(params) {
	const resolved = await resolveProviderUsageAuthWithPlugin({
		provider: params.provider,
		config: params.state.cfg,
		env: params.state.env,
		context: {
			config: params.state.cfg,
			agentDir: params.state.agentDir,
			env: params.state.env,
			provider: params.provider,
			resolveApiKeyFromConfigAndStore: (options) => resolveProviderApiKeyFromConfigAndStore({
				state: params.state,
				providerIds: options?.providerIds ?? [params.provider],
				envDirect: options?.envDirect
			}),
			resolveOAuthToken: async () => {
				const auth = await resolveOAuthToken({
					state: params.state,
					provider: params.provider
				});
				return auth ? {
					token: auth.token,
					...auth.accountId ? { accountId: auth.accountId } : {}
				} : null;
			}
		}
	});
	if (!resolved?.token) return null;
	return {
		provider: params.provider,
		token: resolved.token,
		...resolved.accountId ? { accountId: resolved.accountId } : {}
	};
}
async function resolveProviderUsageAuthFallback(params) {
	switch (params.provider) {
		case "anthropic":
		case "github-copilot":
		case "openai-codex": return await resolveOAuthToken(params);
		case "google-gemini-cli": {
			const auth = await resolveOAuthToken(params);
			return auth ? {
				...auth,
				token: parseGoogleUsageToken(auth.token)
			} : null;
		}
		case "zai": {
			const apiKey = resolveProviderApiKeyFromConfigAndStore({
				state: params.state,
				providerIds: ["zai", "z-ai"],
				envDirect: [params.state.env.ZAI_API_KEY, params.state.env.Z_AI_API_KEY]
			});
			if (apiKey) return {
				provider: "zai",
				token: apiKey
			};
			const legacyToken = resolveLegacyPiAgentAccessToken(params.state.env, ["z-ai", "zai"]);
			return legacyToken ? {
				provider: "zai",
				token: legacyToken
			} : null;
		}
		case "minimax": {
			const apiKey = resolveProviderApiKeyFromConfigAndStore({
				state: params.state,
				providerIds: ["minimax"],
				envDirect: [params.state.env.MINIMAX_CODE_PLAN_KEY, params.state.env.MINIMAX_API_KEY]
			});
			return apiKey ? {
				provider: "minimax",
				token: apiKey
			} : null;
		}
		case "xiaomi": {
			const apiKey = resolveProviderApiKeyFromConfigAndStore({
				state: params.state,
				providerIds: ["xiaomi"],
				envDirect: [params.state.env.XIAOMI_API_KEY]
			});
			return apiKey ? {
				provider: "xiaomi",
				token: apiKey
			} : null;
		}
		default: return null;
	}
}
async function resolveProviderAuths(params) {
	if (params.auth) return params.auth;
	const state = {
		cfg: params.config ?? loadConfig(),
		store: ensureAuthProfileStore(params.agentDir, { allowKeychainPrompt: false }),
		env: params.env ?? process.env,
		agentDir: params.agentDir
	};
	const auths = [];
	for (const provider of params.providers) {
		const pluginAuth = await resolveProviderUsageAuthViaPlugin({
			state,
			provider
		});
		if (pluginAuth) {
			auths.push(pluginAuth);
			continue;
		}
		const fallbackAuth = await resolveProviderUsageAuthFallback({
			state,
			provider
		});
		if (fallbackAuth) auths.push(fallbackAuth);
	}
	return auths;
}
//#endregion
//#region src/infra/provider-usage.load.ts
async function fetchCopilotUsageFallback(token, timeoutMs, fetchFn) {
	const res = await fetchFn("https://api.github.com/copilot_internal/user", {
		headers: {
			Authorization: `token ${token}`,
			"Editor-Version": "vscode/1.96.2",
			"User-Agent": "GitHubCopilotChat/0.26.7",
			"X-Github-Api-Version": "2025-04-01"
		},
		signal: AbortSignal.timeout(timeoutMs)
	});
	if (!res.ok) return {
		provider: "github-copilot",
		displayName: PROVIDER_LABELS["github-copilot"],
		windows: [],
		error: `HTTP ${res.status}`
	};
	const data = await res.json();
	const windows = [];
	const premiumRemaining = data.quota_snapshots?.premium_interactions?.percent_remaining;
	if (premiumRemaining !== void 0 && premiumRemaining !== null) windows.push({
		label: "Premium",
		usedPercent: Math.max(0, Math.min(100, 100 - premiumRemaining))
	});
	const chatRemaining = data.quota_snapshots?.chat?.percent_remaining;
	if (chatRemaining !== void 0 && chatRemaining !== null) windows.push({
		label: "Chat",
		usedPercent: Math.max(0, Math.min(100, 100 - chatRemaining))
	});
	return {
		provider: "github-copilot",
		displayName: PROVIDER_LABELS["github-copilot"],
		windows,
		plan: data.copilot_plan
	};
}
async function fetchProviderUsageSnapshotFallback(params) {
	switch (params.auth.provider) {
		case "anthropic": return await fetchClaudeUsage(params.auth.token, params.timeoutMs, params.fetchFn);
		case "github-copilot": return await fetchCopilotUsageFallback(params.auth.token, params.timeoutMs, params.fetchFn);
		case "google-gemini-cli": return await fetchGeminiUsage(params.auth.token, params.timeoutMs, params.fetchFn, "google-gemini-cli");
		case "openai-codex": return await fetchCodexUsage(params.auth.token, params.auth.accountId, params.timeoutMs, params.fetchFn);
		case "zai": return await fetchZaiUsage(params.auth.token, params.timeoutMs, params.fetchFn);
		case "minimax": return await fetchMinimaxUsage(params.auth.token, params.timeoutMs, params.fetchFn);
		case "xiaomi": return {
			provider: "xiaomi",
			displayName: PROVIDER_LABELS.xiaomi,
			windows: []
		};
		default: return {
			provider: params.auth.provider,
			displayName: PROVIDER_LABELS[params.auth.provider],
			windows: [],
			error: "Unsupported provider"
		};
	}
}
async function fetchProviderUsageSnapshot(params) {
	const pluginSnapshot = await resolveProviderUsageSnapshotWithPlugin({
		provider: params.auth.provider,
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env,
		context: {
			config: params.config,
			agentDir: params.agentDir,
			workspaceDir: params.workspaceDir,
			env: params.env,
			provider: params.auth.provider,
			token: params.auth.token,
			accountId: params.auth.accountId,
			timeoutMs: params.timeoutMs,
			fetchFn: params.fetchFn
		}
	});
	if (pluginSnapshot) return pluginSnapshot;
	return await fetchProviderUsageSnapshotFallback({
		auth: params.auth,
		timeoutMs: params.timeoutMs,
		fetchFn: params.fetchFn
	});
}
async function loadProviderUsageSummary(opts = {}) {
	const now = opts.now ?? Date.now();
	const timeoutMs = opts.timeoutMs ?? 5e3;
	const config = opts.config ?? loadConfig();
	const env = opts.env ?? process.env;
	const fetchFn = resolveFetch(opts.fetch);
	if (!fetchFn) throw new Error("fetch is not available");
	const auths = await resolveProviderAuths({
		providers: opts.providers ?? usageProviders,
		auth: opts.auth,
		agentDir: opts.agentDir,
		config,
		env
	});
	if (auths.length === 0) return {
		updatedAt: now,
		providers: []
	};
	const tasks = auths.map((auth) => withTimeout(fetchProviderUsageSnapshot({
		auth,
		config,
		env,
		agentDir: opts.agentDir,
		workspaceDir: opts.workspaceDir,
		timeoutMs,
		fetchFn
	}), timeoutMs + 1e3, {
		provider: auth.provider,
		displayName: PROVIDER_LABELS[auth.provider],
		windows: [],
		error: "Timeout"
	}));
	return {
		updatedAt: now,
		providers: (await Promise.all(tasks)).filter((entry) => {
			if (entry.windows.length > 0) return true;
			if (!entry.error) return true;
			return !ignoredErrors.has(entry.error);
		})
	};
}
//#endregion
export { formatUsageWindowSummary as i, formatUsageReportLines as n, formatUsageSummaryLine as r, loadProviderUsageSummary as t };
