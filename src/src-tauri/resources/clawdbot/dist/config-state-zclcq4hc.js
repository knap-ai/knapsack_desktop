import { r as normalizeChatChannelId } from "./chat-meta-Cdrnv7R-.js";
import "./registry-DTO_OK4F.js";
import { i as BUNDLED_PROVIDER_PLUGIN_ID_ALIASES, n as BUNDLED_LEGACY_PLUGIN_ID_ALIASES } from "./bundled-capability-metadata-D5qf8V45.js";
import { n as defaultSlotIdForKey, r as hasKind } from "./slots-u5aMXqtV.js";
//#region src/plugins/config-state.ts
function normalizePluginId(id) {
	const trimmed = id.trim();
	return BUNDLED_LEGACY_PLUGIN_ID_ALIASES[trimmed] ?? BUNDLED_PROVIDER_PLUGIN_ID_ALIASES[trimmed] ?? trimmed;
}
const normalizeList = (value) => {
	if (!Array.isArray(value)) return [];
	return value.map((entry) => typeof entry === "string" ? normalizePluginId(entry) : "").filter(Boolean);
};
const normalizeSlotValue = (value) => {
	if (typeof value !== "string") return;
	const trimmed = value.trim();
	if (!trimmed) return;
	if (trimmed.toLowerCase() === "none") return null;
	return trimmed;
};
const normalizePluginEntries = (entries) => {
	if (!entries || typeof entries !== "object" || Array.isArray(entries)) return {};
	const normalized = {};
	for (const [key, value] of Object.entries(entries)) {
		const normalizedKey = normalizePluginId(key);
		if (!normalizedKey) continue;
		if (!value || typeof value !== "object" || Array.isArray(value)) {
			normalized[normalizedKey] = {};
			continue;
		}
		const entry = value;
		const hooksRaw = entry.hooks;
		const hooks = hooksRaw && typeof hooksRaw === "object" && !Array.isArray(hooksRaw) ? { allowPromptInjection: hooksRaw.allowPromptInjection } : void 0;
		const normalizedHooks = hooks && typeof hooks.allowPromptInjection === "boolean" ? { allowPromptInjection: hooks.allowPromptInjection } : void 0;
		const subagentRaw = entry.subagent;
		const subagent = subagentRaw && typeof subagentRaw === "object" && !Array.isArray(subagentRaw) ? {
			allowModelOverride: subagentRaw.allowModelOverride,
			hasAllowedModelsConfig: Array.isArray(subagentRaw.allowedModels),
			allowedModels: Array.isArray(subagentRaw.allowedModels) ? subagentRaw.allowedModels.map((model) => typeof model === "string" ? model.trim() : "").filter(Boolean) : void 0
		} : void 0;
		const normalizedSubagent = subagent && (typeof subagent.allowModelOverride === "boolean" || subagent.hasAllowedModelsConfig || Array.isArray(subagent.allowedModels) && subagent.allowedModels.length > 0) ? {
			...typeof subagent.allowModelOverride === "boolean" ? { allowModelOverride: subagent.allowModelOverride } : {},
			...subagent.hasAllowedModelsConfig ? { hasAllowedModelsConfig: true } : {},
			...Array.isArray(subagent.allowedModels) && subagent.allowedModels.length > 0 ? { allowedModels: subagent.allowedModels } : {}
		} : void 0;
		normalized[normalizedKey] = {
			...normalized[normalizedKey],
			enabled: typeof entry.enabled === "boolean" ? entry.enabled : normalized[normalizedKey]?.enabled,
			hooks: normalizedHooks ?? normalized[normalizedKey]?.hooks,
			subagent: normalizedSubagent ?? normalized[normalizedKey]?.subagent,
			config: "config" in entry ? entry.config : normalized[normalizedKey]?.config
		};
	}
	return normalized;
};
const normalizePluginsConfig = (config) => {
	const memorySlot = normalizeSlotValue(config?.slots?.memory);
	return {
		enabled: config?.enabled !== false,
		allow: normalizeList(config?.allow),
		deny: normalizeList(config?.deny),
		loadPaths: normalizeList(config?.load?.paths),
		slots: { memory: memorySlot === void 0 ? defaultSlotIdForKey("memory") : memorySlot },
		entries: normalizePluginEntries(config?.entries)
	};
};
const hasExplicitMemorySlot = (plugins) => Boolean(plugins?.slots && Object.prototype.hasOwnProperty.call(plugins.slots, "memory"));
const hasExplicitMemoryEntry = (plugins) => Boolean(plugins?.entries && Object.prototype.hasOwnProperty.call(plugins.entries, "memory-core"));
const hasExplicitPluginConfig = (plugins) => {
	if (!plugins) return false;
	if (typeof plugins.enabled === "boolean") return true;
	if (Array.isArray(plugins.allow) && plugins.allow.length > 0) return true;
	if (Array.isArray(plugins.deny) && plugins.deny.length > 0) return true;
	if (plugins.load?.paths && Array.isArray(plugins.load.paths) && plugins.load.paths.length > 0) return true;
	if (plugins.slots && Object.keys(plugins.slots).length > 0) return true;
	if (plugins.entries && Object.keys(plugins.entries).length > 0) return true;
	return false;
};
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
		reason: "enabled in config"
	};
	if (params.origin === "bundled" && isBundledChannelEnabledByChannelConfig(params.rootConfig, params.id)) return {
		explicitlyEnabled: true,
		reason: "channel enabled in config"
	};
	if (params.config.slots.memory === params.id) return {
		explicitlyEnabled: true,
		reason: "selected memory slot"
	};
	if (params.origin !== "bundled" && params.config.allow.includes(params.id)) return {
		explicitlyEnabled: true,
		reason: "selected in allowlist"
	};
	return { explicitlyEnabled: false };
}
function resolvePluginActivationState(params) {
	const explicitSelection = resolveExplicitPluginSelection({
		id: params.id,
		origin: params.origin,
		config: params.sourceConfig ?? params.config,
		rootConfig: params.sourceRootConfig ?? params.rootConfig
	});
	if (!params.config.enabled) return {
		enabled: false,
		activated: false,
		explicitlyEnabled: explicitSelection.explicitlyEnabled,
		source: "disabled",
		reason: "plugins disabled"
	};
	if (params.config.deny.includes(params.id)) return {
		enabled: false,
		activated: false,
		explicitlyEnabled: explicitSelection.explicitlyEnabled,
		source: "disabled",
		reason: "blocked by denylist"
	};
	const entry = params.config.entries[params.id];
	if (entry?.enabled === false) return {
		enabled: false,
		activated: false,
		explicitlyEnabled: explicitSelection.explicitlyEnabled,
		source: "disabled",
		reason: "disabled in config"
	};
	const explicitlyAllowed = params.config.allow.includes(params.id);
	if (params.origin === "workspace" && !explicitlyAllowed && entry?.enabled !== true) return {
		enabled: false,
		activated: false,
		explicitlyEnabled: explicitSelection.explicitlyEnabled,
		source: "disabled",
		reason: "workspace plugin (disabled by default)"
	};
	if (params.config.slots.memory === params.id) return {
		enabled: true,
		activated: true,
		explicitlyEnabled: true,
		source: "explicit",
		reason: "selected memory slot"
	};
	if (params.config.allow.length > 0 && !explicitlyAllowed) return {
		enabled: false,
		activated: false,
		explicitlyEnabled: explicitSelection.explicitlyEnabled,
		source: "disabled",
		reason: "not in allowlist"
	};
	if (explicitSelection.explicitlyEnabled) return {
		enabled: true,
		activated: true,
		explicitlyEnabled: true,
		source: "explicit",
		reason: explicitSelection.reason
	};
	if (params.autoEnabledReason) return {
		enabled: true,
		activated: true,
		explicitlyEnabled: false,
		source: "auto",
		reason: params.autoEnabledReason
	};
	if (entry?.enabled === true) return {
		enabled: true,
		activated: true,
		explicitlyEnabled: false,
		source: "auto",
		reason: "enabled by effective config"
	};
	if (params.origin === "bundled" && isBundledChannelEnabledByChannelConfig(params.rootConfig, params.id)) return {
		enabled: true,
		activated: true,
		explicitlyEnabled: false,
		source: "auto",
		reason: "channel configured"
	};
	if (params.origin === "bundled" && params.enabledByDefault === true) return {
		enabled: true,
		activated: true,
		explicitlyEnabled: false,
		source: "default",
		reason: "bundled default enablement"
	};
	if (params.origin === "bundled") return {
		enabled: false,
		activated: false,
		explicitlyEnabled: false,
		source: "disabled",
		reason: "bundled (disabled by default)"
	};
	return {
		enabled: true,
		activated: true,
		explicitlyEnabled: explicitSelection.explicitlyEnabled,
		source: "default"
	};
}
function resolveEnableState(id, origin, config, enabledByDefault) {
	const state = resolvePluginActivationState({
		id,
		origin,
		config,
		enabledByDefault
	});
	return state.enabled ? { enabled: true } : {
		enabled: false,
		reason: state.reason
	};
}
function isBundledChannelEnabledByChannelConfig(cfg, pluginId) {
	if (!cfg) return false;
	const channelId = normalizeChatChannelId(pluginId);
	if (!channelId) return false;
	const entry = cfg.channels?.[channelId];
	if (!entry || typeof entry !== "object" || Array.isArray(entry)) return false;
	return entry.enabled === true;
}
function resolveEffectiveEnableState(params) {
	const state = resolveEffectivePluginActivationState(params);
	return state.enabled ? { enabled: true } : {
		enabled: false,
		reason: state.reason
	};
}
function resolveEffectivePluginActivationState(params) {
	return resolvePluginActivationState(params);
}
function resolveMemorySlotDecision(params) {
	if (!hasKind(params.kind, "memory")) return { enabled: true };
	const isMultiKind = Array.isArray(params.kind) && params.kind.length > 1;
	if (params.slot === null) return isMultiKind ? { enabled: true } : {
		enabled: false,
		reason: "memory slot disabled"
	};
	if (typeof params.slot === "string") {
		if (params.slot === params.id) return {
			enabled: true,
			selected: true
		};
		return isMultiKind ? { enabled: true } : {
			enabled: false,
			reason: `memory slot set to "${params.slot}"`
		};
	}
	if (params.selectedId && params.selectedId !== params.id) return isMultiKind ? { enabled: true } : {
		enabled: false,
		reason: `memory slot already filled by "${params.selectedId}"`
	};
	return {
		enabled: true,
		selected: true
	};
}
//#endregion
export { normalizePluginsConfig as a, resolveEnableState as c, normalizePluginId as i, resolveMemorySlotDecision as l, hasExplicitPluginConfig as n, resolveEffectiveEnableState as o, isTestDefaultMemorySlotDisabled as r, resolveEffectivePluginActivationState as s, applyTestPluginDefaults as t };
