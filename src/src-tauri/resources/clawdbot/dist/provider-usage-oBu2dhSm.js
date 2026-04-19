import { a as loadConfig } from "./io-5pxHCi7V.js";
import { r as normalizeProviderId } from "./provider-id-KaStHhRz.js";
import "./config-Q9XZc_2I.js";
import { n as ensureAuthProfileStore } from "./store-C1I9Mkh8.js";
import { R as resolveProviderUsageAuthWithPlugin, z as resolveProviderUsageSnapshotWithPlugin } from "./provider-runtime-khVgWetm.js";
import { u as isNonSecretApiKeyMarker } from "./model-auth-markers-ve-OgG6R.js";
import "./model-selection-CTdyYoio.js";
import { n as normalizeSecretInput } from "./normalize-secret-input-DqcJmob1.js";
import { t as resolveApiKeyForProfile } from "./auth-profiles-BQEgLpFI.js";
import { n as resolveAuthProfileOrder } from "./order-t2w38pFY.js";
import { n as listProfilesForProvider, t as dedupeProfileIds } from "./profiles-CVErLX2C.js";
import { l as resolveUsableCustomProviderApiKey } from "./model-auth-KKLbMBGv.js";
import { t as resolveFetch } from "./fetch-DByu7Ja3.js";
import { c as withTimeout, i as ignoredErrors, n as PROVIDER_LABELS, r as clampPercent, s as usageProviders } from "./provider-usage.shared-B28ujaJI.js";
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
function resolveUsageAuthStore(state) {
	state.store ??= ensureAuthProfileStore(state.agentDir, { allowKeychainPrompt: false });
	return state.store;
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
	const cred = [...new Set(params.providerIds.map((providerId) => normalizeProviderId(providerId)).filter(Boolean))].flatMap((providerId) => listProfilesForProvider(resolveUsageAuthStore(params.state), providerId)).map((id) => resolveUsageAuthStore(params.state).profiles[id]).find((profile) => profile?.type === "api_key" || profile?.type === "token");
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
	const store = resolveUsageAuthStore(params.state);
	const deduped = dedupeProfileIds(resolveAuthProfileOrder({
		cfg: params.state.cfg,
		store,
		provider: params.provider
	}));
	for (const profileId of deduped) {
		const cred = store.profiles[profileId];
		if (!cred || cred.type !== "oauth" && cred.type !== "token") continue;
		try {
			const resolved = await resolveApiKeyForProfile({
				cfg: params.state.cfg,
				store,
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
			resolveOAuthToken: async (options) => {
				const auth = await resolveOAuthToken({
					state: params.state,
					provider: options?.provider ?? params.provider
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
	const oauthToken = await resolveOAuthToken({
		state: params.state,
		provider: params.provider
	});
	if (oauthToken) return oauthToken;
	const apiKey = resolveProviderApiKeyFromConfigAndStore({
		state: params.state,
		providerIds: [params.provider]
	});
	if (apiKey) return {
		provider: params.provider,
		token: apiKey
	};
	return null;
}
async function resolveProviderAuths(params) {
	if (params.auth) return params.auth;
	const state = {
		cfg: params.config ?? loadConfig(),
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
async function fetchProviderUsageSnapshotFallback(params) {
	params.timeoutMs;
	params.fetchFn;
	return {
		provider: params.auth.provider,
		displayName: PROVIDER_LABELS[params.auth.provider] ?? params.auth.provider,
		windows: [],
		error: "Unsupported provider"
	};
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
