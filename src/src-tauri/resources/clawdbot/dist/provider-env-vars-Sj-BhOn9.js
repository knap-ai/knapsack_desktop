import { o as normalizeOptionalLowercaseString } from "./string-coerce-BUSzWgUA.js";
import { t as loadPluginManifestRegistry } from "./manifest-registry-Bd3A4lqx.js";
import { r as hasKind } from "./slots-MFUVcT3n.js";
import { r as normalizeProviderId } from "./provider-id-KaStHhRz.js";
//#region src/agents/provider-auth-aliases.ts
const PROVIDER_AUTH_ALIAS_ORIGIN_PRIORITY = {
	config: 0,
	bundled: 1,
	global: 2,
	workspace: 3
};
function resolveProviderAuthAliasOriginPriority(origin) {
	if (!origin) return Number.MAX_SAFE_INTEGER;
	return PROVIDER_AUTH_ALIAS_ORIGIN_PRIORITY[origin] ?? Number.MAX_SAFE_INTEGER;
}
function normalizePluginConfigId$1(id) {
	return normalizeOptionalLowercaseString(id) ?? "";
}
function hasPluginId$1(list, pluginId) {
	return Array.isArray(list) && list.some((entry) => normalizePluginConfigId$1(entry) === pluginId);
}
function findPluginEntry$1(entries, pluginId) {
	if (!entries || typeof entries !== "object" || Array.isArray(entries)) return;
	for (const [key, value] of Object.entries(entries)) {
		if (normalizePluginConfigId$1(key) !== pluginId) continue;
		return value && typeof value === "object" && !Array.isArray(value) ? value : {};
	}
}
function isWorkspacePluginTrustedForAuthAliases(plugin, config) {
	const pluginsConfig = config?.plugins;
	if (pluginsConfig?.enabled === false) return false;
	const pluginId = normalizePluginConfigId$1(plugin.id);
	if (!pluginId || hasPluginId$1(pluginsConfig?.deny, pluginId)) return false;
	const entry = findPluginEntry$1(pluginsConfig?.entries, pluginId);
	if (entry?.enabled === false) return false;
	if (entry?.enabled === true || hasPluginId$1(pluginsConfig?.allow, pluginId)) return true;
	return normalizePluginConfigId$1(pluginsConfig?.slots?.contextEngine) === pluginId;
}
function shouldUsePluginAuthAliases(plugin, params) {
	if (plugin.origin !== "workspace" || params?.includeUntrustedWorkspacePlugins === true) return true;
	return isWorkspacePluginTrustedForAuthAliases(plugin, params?.config);
}
function resolveProviderAuthAliasMap(params) {
	const registry = loadPluginManifestRegistry({
		config: params?.config,
		workspaceDir: params?.workspaceDir,
		env: params?.env
	});
	const preferredAliases = /* @__PURE__ */ new Map();
	const aliases = Object.create(null);
	for (const plugin of registry.plugins) {
		if (!shouldUsePluginAuthAliases(plugin, params)) continue;
		for (const [alias, target] of Object.entries(plugin.providerAuthAliases ?? {}).toSorted(([left], [right]) => left.localeCompare(right))) {
			const normalizedAlias = normalizeProviderId(alias);
			const normalizedTarget = normalizeProviderId(target);
			if (normalizedAlias && normalizedTarget) {
				const existing = preferredAliases.get(normalizedAlias);
				if (!existing || resolveProviderAuthAliasOriginPriority(plugin.origin) < resolveProviderAuthAliasOriginPriority(existing.origin)) preferredAliases.set(normalizedAlias, {
					origin: plugin.origin,
					target: normalizedTarget
				});
			}
		}
	}
	for (const [alias, candidate] of preferredAliases) aliases[alias] = candidate.target;
	return aliases;
}
function resolveProviderIdForAuth(provider, params) {
	const normalized = normalizeProviderId(provider);
	if (!normalized) return normalized;
	return resolveProviderAuthAliasMap(params)[normalized] ?? normalized;
}
//#endregion
//#region src/secrets/provider-env-vars.ts
const CORE_PROVIDER_AUTH_ENV_VAR_CANDIDATES = {
	anthropic: ["ANTHROPIC_OAUTH_TOKEN", "ANTHROPIC_API_KEY"],
	openai: ["OPENAI_API_KEY"],
	voyage: ["VOYAGE_API_KEY"],
	cerebras: ["CEREBRAS_API_KEY"],
	"anthropic-openai": ["ANTHROPIC_API_KEY"],
	"qwen-dashscope": ["DASHSCOPE_API_KEY"]
};
const CORE_PROVIDER_SETUP_ENV_VAR_OVERRIDES = { "minimax-cn": ["MINIMAX_API_KEY"] };
function normalizePluginConfigId(id) {
	return normalizeOptionalLowercaseString(id) ?? "";
}
function hasPluginId(list, pluginId) {
	return Array.isArray(list) && list.some((entry) => normalizePluginConfigId(entry) === pluginId);
}
function findPluginEntry(entries, pluginId) {
	if (!entries || typeof entries !== "object" || Array.isArray(entries)) return;
	for (const [key, value] of Object.entries(entries)) {
		if (normalizePluginConfigId(key) !== pluginId) continue;
		return value && typeof value === "object" && !Array.isArray(value) ? value : {};
	}
}
function isWorkspacePluginTrustedForProviderEnvVars(plugin, config) {
	const pluginsConfig = config?.plugins;
	if (pluginsConfig?.enabled === false) return false;
	const pluginId = normalizePluginConfigId(plugin.id);
	if (!pluginId || hasPluginId(pluginsConfig?.deny, pluginId)) return false;
	const entry = findPluginEntry(pluginsConfig?.entries, pluginId);
	if (entry?.enabled === false) return false;
	if (entry?.enabled === true || hasPluginId(pluginsConfig?.allow, pluginId)) return true;
	return hasKind(plugin.kind, "context-engine") && normalizePluginConfigId(pluginsConfig?.slots?.contextEngine) === pluginId;
}
function shouldUsePluginProviderEnvVars(plugin, params) {
	if (plugin.origin !== "workspace" || params?.includeUntrustedWorkspacePlugins !== false) return true;
	return isWorkspacePluginTrustedForProviderEnvVars(plugin, params?.config);
}
function appendUniqueEnvVarCandidates(target, providerId, keys) {
	const normalizedProviderId = providerId.trim();
	if (!normalizedProviderId || keys.length === 0) return;
	const bucket = target[normalizedProviderId] ??= [];
	const seen = new Set(bucket);
	for (const key of keys) {
		const normalizedKey = key.trim();
		if (!normalizedKey || seen.has(normalizedKey)) continue;
		seen.add(normalizedKey);
		bucket.push(normalizedKey);
	}
}
function resolveManifestProviderAuthEnvVarCandidates(params) {
	const registry = loadPluginManifestRegistry({
		config: params?.config,
		workspaceDir: params?.workspaceDir,
		env: params?.env
	});
	const candidates = {};
	for (const plugin of registry.plugins) {
		if (!shouldUsePluginProviderEnvVars(plugin, params)) continue;
		if (!plugin.providerAuthEnvVars) continue;
		for (const [providerId, keys] of Object.entries(plugin.providerAuthEnvVars).toSorted(([left], [right]) => left.localeCompare(right))) appendUniqueEnvVarCandidates(candidates, providerId, keys);
	}
	const aliases = resolveProviderAuthAliasMap(params);
	for (const [alias, target] of Object.entries(aliases).toSorted(([left], [right]) => left.localeCompare(right))) {
		const keys = candidates[target];
		if (keys) appendUniqueEnvVarCandidates(candidates, alias, keys);
	}
	return candidates;
}
function resolveProviderAuthEnvVarCandidates(params) {
	return {
		...resolveManifestProviderAuthEnvVarCandidates(params),
		...CORE_PROVIDER_AUTH_ENV_VAR_CANDIDATES
	};
}
function resolveProviderEnvVars(params) {
	return {
		...resolveProviderAuthEnvVarCandidates(params),
		...CORE_PROVIDER_SETUP_ENV_VAR_OVERRIDES
	};
}
function createLazyReadonlyRecord(resolve) {
	let cached;
	const getResolved = () => {
		cached ??= resolve();
		return cached;
	};
	return new Proxy({}, {
		get(_target, prop) {
			if (typeof prop !== "string") return;
			return getResolved()[prop];
		},
		has(_target, prop) {
			return typeof prop === "string" && Object.hasOwn(getResolved(), prop);
		},
		ownKeys() {
			return Reflect.ownKeys(getResolved());
		},
		getOwnPropertyDescriptor(_target, prop) {
			if (typeof prop !== "string") return;
			const value = getResolved()[prop];
			if (value === void 0) return;
			return {
				configurable: true,
				enumerable: true,
				value,
				writable: false
			};
		}
	});
}
createLazyReadonlyRecord(() => resolveProviderAuthEnvVarCandidates());
createLazyReadonlyRecord(() => resolveProviderEnvVars());
function getProviderEnvVars(providerId, params) {
	const providerEnvVars = resolveProviderEnvVars(params);
	const envVars = Object.hasOwn(providerEnvVars, providerId) ? providerEnvVars[providerId] : void 0;
	return Array.isArray(envVars) ? [...envVars] : [];
}
const EXTRA_PROVIDER_AUTH_ENV_VARS = ["MINIMAX_CODE_PLAN_KEY", "MINIMAX_CODING_API_KEY"];
function listKnownProviderAuthEnvVarNames(params) {
	return [...new Set([
		...Object.values(resolveProviderAuthEnvVarCandidates(params)).flatMap((keys) => keys),
		...Object.values(resolveProviderEnvVars(params)).flatMap((keys) => keys),
		...EXTRA_PROVIDER_AUTH_ENV_VARS
	])];
}
function listKnownSecretEnvVarNames(params) {
	return [...new Set(Object.values(resolveProviderEnvVars(params)).flatMap((keys) => keys))];
}
function omitEnvKeysCaseInsensitive(baseEnv, keys) {
	const env = { ...baseEnv };
	const denied = /* @__PURE__ */ new Set();
	for (const key of keys) {
		const normalizedKey = key.trim();
		if (normalizedKey) denied.add(normalizedKey.toUpperCase());
	}
	if (denied.size === 0) return env;
	for (const actualKey of Object.keys(env)) if (denied.has(actualKey.toUpperCase())) delete env[actualKey];
	return env;
}
//#endregion
export { resolveProviderAuthEnvVarCandidates as a, omitEnvKeysCaseInsensitive as i, listKnownProviderAuthEnvVarNames as n, resolveProviderIdForAuth as o, listKnownSecretEnvVarNames as r, getProviderEnvVars as t };
