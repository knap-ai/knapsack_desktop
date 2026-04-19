import { o as normalizeOptionalLowercaseString, s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { d as isBundledChannelEnabledByChannelConfig$1, f as normalizePluginsConfigWithResolver, h as resolveMemorySlotDecisionShared, m as resolveEnableStateShared, p as resolveEnableStateResult, t as loadPluginManifestRegistry, u as hasExplicitPluginConfig$1 } from "./manifest-registry-Bd3A4lqx.js";
//#region src/plugins/config-state.ts
let bundledPluginAliasLookupCache;
function getBundledPluginAliasLookup() {
	if (bundledPluginAliasLookupCache) return bundledPluginAliasLookupCache;
	const lookup = /* @__PURE__ */ new Map();
	for (const plugin of loadPluginManifestRegistry({ cache: true }).plugins) {
		if (plugin.origin !== "bundled") continue;
		const pluginId = normalizeOptionalLowercaseString(plugin.id);
		if (pluginId) lookup.set(pluginId, plugin.id);
		for (const providerId of plugin.providers) {
			const normalizedProviderId = normalizeOptionalLowercaseString(providerId);
			if (normalizedProviderId) lookup.set(normalizedProviderId, plugin.id);
		}
		for (const legacyPluginId of plugin.legacyPluginIds ?? []) {
			const normalizedLegacyPluginId = normalizeOptionalLowercaseString(legacyPluginId);
			if (normalizedLegacyPluginId) lookup.set(normalizedLegacyPluginId, plugin.id);
		}
	}
	bundledPluginAliasLookupCache = lookup;
	return lookup;
}
function normalizePluginId(id) {
	const trimmed = normalizeOptionalString(id) ?? "";
	const normalized = normalizeOptionalLowercaseString(trimmed) ?? "";
	return getBundledPluginAliasLookup().get(normalized) ?? trimmed;
}
const PLUGIN_ACTIVATION_REASON_BY_CAUSE = {
	"enabled-in-config": "enabled in config",
	"bundled-channel-enabled-in-config": "channel enabled in config",
	"selected-memory-slot": "selected memory slot",
	"selected-context-engine-slot": "selected context engine slot",
	"selected-in-allowlist": "selected in allowlist",
	"plugins-disabled": "plugins disabled",
	"blocked-by-denylist": "blocked by denylist",
	"disabled-in-config": "disabled in config",
	"workspace-disabled-by-default": "workspace plugin (disabled by default)",
	"not-in-allowlist": "not in allowlist",
	"enabled-by-effective-config": "enabled by effective config",
	"bundled-channel-configured": "channel configured",
	"bundled-default-enablement": "bundled default enablement",
	"bundled-disabled-by-default": "bundled (disabled by default)"
};
function resolvePluginActivationReason(cause, reason) {
	if (reason) return reason;
	return cause ? PLUGIN_ACTIVATION_REASON_BY_CAUSE[cause] : void 0;
}
function toPluginActivationState(decision) {
	return {
		enabled: decision.enabled,
		activated: decision.activated,
		explicitlyEnabled: decision.explicitlyEnabled,
		source: decision.source,
		reason: resolvePluginActivationReason(decision.cause, decision.reason)
	};
}
const normalizePluginsConfig = (config) => {
	return normalizePluginsConfigWithResolver(config, normalizePluginId);
};
function createPluginActivationSource(params) {
	return {
		plugins: params.plugins ?? normalizePluginsConfig(params.config?.plugins),
		rootConfig: params.config
	};
}
const hasExplicitMemorySlot = (plugins) => Boolean(plugins?.slots && Object.prototype.hasOwnProperty.call(plugins.slots, "memory"));
const hasExplicitMemoryEntry = (plugins) => Boolean(plugins?.entries && Object.prototype.hasOwnProperty.call(plugins.entries, "memory-core"));
const hasExplicitPluginConfig = (plugins) => hasExplicitPluginConfig$1(plugins);
function applyTestPluginDefaults(cfg, env = process.env) {
	if (!env.VITEST) return cfg;
	const plugins = cfg.plugins;
	if (hasExplicitPluginConfig(plugins)) {
		if (hasExplicitMemorySlot(plugins) || hasExplicitMemoryEntry(plugins)) return cfg;
		return {
			...cfg,
			plugins: {
				...plugins,
				slots: {
					...plugins?.slots,
					memory: "none"
				}
			}
		};
	}
	return {
		...cfg,
		plugins: {
			...plugins,
			enabled: false,
			slots: {
				...plugins?.slots,
				memory: "none"
			}
		}
	};
}
function isTestDefaultMemorySlotDisabled(cfg, env = process.env) {
	if (!env.VITEST) return false;
	const plugins = cfg.plugins;
	if (hasExplicitMemorySlot(plugins) || hasExplicitMemoryEntry(plugins)) return false;
	return true;
}
function resolveExplicitPluginSelection(params) {
	if (params.config.entries[params.id]?.enabled === true) return {
		explicitlyEnabled: true,
		cause: "enabled-in-config"
	};
	if (params.origin === "bundled" && isBundledChannelEnabledByChannelConfig(params.rootConfig, params.id)) return {
		explicitlyEnabled: true,
		cause: "bundled-channel-enabled-in-config"
	};
	if (params.config.slots.memory === params.id) return {
		explicitlyEnabled: true,
		cause: "selected-memory-slot"
	};
	if (params.config.slots.contextEngine === params.id) return {
		explicitlyEnabled: true,
		cause: "selected-context-engine-slot"
	};
	if (params.origin !== "bundled" && params.config.allow.includes(params.id)) return {
		explicitlyEnabled: true,
		cause: "selected-in-allowlist"
	};
	return { explicitlyEnabled: false };
}
function resolvePluginActivationState(params) {
	const activationSource = params.activationSource ?? createPluginActivationSource({
		config: params.rootConfig,
		plugins: params.config
	});
	const explicitSelection = resolveExplicitPluginSelection({
		id: params.id,
		origin: params.origin,
		config: activationSource.plugins,
		rootConfig: activationSource.rootConfig
	});
	if (!params.config.enabled) return toPluginActivationState({
		enabled: false,
		activated: false,
		explicitlyEnabled: explicitSelection.explicitlyEnabled,
		source: "disabled",
		cause: "plugins-disabled"
	});
	if (params.config.deny.includes(params.id)) return toPluginActivationState({
		enabled: false,
		activated: false,
		explicitlyEnabled: explicitSelection.explicitlyEnabled,
		source: "disabled",
		cause: "blocked-by-denylist"
	});
	const entry = params.config.entries[params.id];
	if (entry?.enabled === false) return toPluginActivationState({
		enabled: false,
		activated: false,
		explicitlyEnabled: explicitSelection.explicitlyEnabled,
		source: "disabled",
		cause: "disabled-in-config"
	});
	const explicitlyAllowed = params.config.allow.includes(params.id);
	if (params.origin === "workspace" && !explicitlyAllowed && entry?.enabled !== true && explicitSelection.cause !== "selected-context-engine-slot") return toPluginActivationState({
		enabled: false,
		activated: false,
		explicitlyEnabled: explicitSelection.explicitlyEnabled,
		source: "disabled",
		cause: "workspace-disabled-by-default"
	});
	if (params.config.slots.memory === params.id) return toPluginActivationState({
		enabled: true,
		activated: true,
		explicitlyEnabled: true,
		source: "explicit",
		cause: "selected-memory-slot"
	});
	if (params.config.slots.contextEngine === params.id) return toPluginActivationState({
		enabled: true,
		activated: true,
		explicitlyEnabled: true,
		source: "explicit",
		cause: "selected-context-engine-slot"
	});
	if (explicitSelection.cause === "bundled-channel-enabled-in-config") return toPluginActivationState({
		enabled: true,
		activated: true,
		explicitlyEnabled: true,
		source: "explicit",
		cause: explicitSelection.cause
	});
	if (params.config.allow.length > 0 && !explicitlyAllowed) return toPluginActivationState({
		enabled: false,
		activated: false,
		explicitlyEnabled: explicitSelection.explicitlyEnabled,
		source: "disabled",
		cause: "not-in-allowlist"
	});
	if (explicitSelection.explicitlyEnabled) return toPluginActivationState({
		enabled: true,
		activated: true,
		explicitlyEnabled: true,
		source: "explicit",
		cause: explicitSelection.cause
	});
	if (params.autoEnabledReason) return toPluginActivationState({
		enabled: true,
		activated: true,
		explicitlyEnabled: false,
		source: "auto",
		reason: params.autoEnabledReason
	});
	if (entry?.enabled === true) return toPluginActivationState({
		enabled: true,
		activated: true,
		explicitlyEnabled: false,
		source: "auto",
		cause: "enabled-by-effective-config"
	});
	if (params.origin === "bundled" && isBundledChannelEnabledByChannelConfig(params.rootConfig, params.id)) return toPluginActivationState({
		enabled: true,
		activated: true,
		explicitlyEnabled: false,
		source: "auto",
		cause: "bundled-channel-configured"
	});
	if (params.origin === "bundled" && params.enabledByDefault === true) return toPluginActivationState({
		enabled: true,
		activated: true,
		explicitlyEnabled: false,
		source: "default",
		cause: "bundled-default-enablement"
	});
	if (params.origin === "bundled") return toPluginActivationState({
		enabled: false,
		activated: false,
		explicitlyEnabled: false,
		source: "disabled",
		cause: "bundled-disabled-by-default"
	});
	return toPluginActivationState({
		enabled: true,
		activated: true,
		explicitlyEnabled: explicitSelection.explicitlyEnabled,
		source: "default"
	});
}
function resolveEnableState(id, origin, config, enabledByDefault) {
	return resolveEnableStateShared({
		id,
		origin,
		config,
		enabledByDefault
	}, resolvePluginActivationState);
}
function isBundledChannelEnabledByChannelConfig(cfg, pluginId) {
	return isBundledChannelEnabledByChannelConfig$1(cfg, pluginId);
}
function resolveEffectiveEnableState(params) {
	return resolveEnableStateResult(params, resolveEffectivePluginActivationState);
}
function resolveEffectivePluginActivationState(params) {
	return resolvePluginActivationState(params);
}
function resolveMemorySlotDecision(params) {
	return resolveMemorySlotDecisionShared(params);
}
//#endregion
export { normalizePluginsConfig as a, resolveEnableState as c, normalizePluginId as i, resolveMemorySlotDecision as l, createPluginActivationSource as n, resolveEffectiveEnableState as o, isTestDefaultMemorySlotDisabled as r, resolveEffectivePluginActivationState as s, applyTestPluginDefaults as t };
