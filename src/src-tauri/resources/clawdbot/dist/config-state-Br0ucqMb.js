import { c as normalizeChatChannelId } from "./registry-C5UkPpaO.js";
//#region src/plugins/slots.ts
const SLOT_BY_KIND = {
	memory: "memory",
	"context-engine": "contextEngine"
};
const DEFAULT_SLOT_BY_KEY = {
	memory: "memory-core",
	contextEngine: "legacy"
};
function slotKeyForPluginKind(kind) {
	if (!kind) return null;
	return SLOT_BY_KIND[kind] ?? null;
}
function defaultSlotIdForKey(slotKey) {
	return DEFAULT_SLOT_BY_KEY[slotKey];
}
function applyExclusiveSlotSelection(params) {
	const slotKey = slotKeyForPluginKind(params.selectedKind);
	if (!slotKey) return {
		config: params.config,
		warnings: [],
		changed: false
	};
	const warnings = [];
	const pluginsConfig = params.config.plugins ?? {};
	const prevSlot = pluginsConfig.slots?.[slotKey];
	const slots = {
		...pluginsConfig.slots,
		[slotKey]: params.selectedId
	};
	const inferredPrevSlot = prevSlot ?? defaultSlotIdForKey(slotKey);
	if (inferredPrevSlot && inferredPrevSlot !== params.selectedId) warnings.push(`Exclusive slot "${slotKey}" switched from "${inferredPrevSlot}" to "${params.selectedId}".`);
	const entries = { ...pluginsConfig.entries };
	const disabledIds = [];
	if (params.registry) for (const plugin of params.registry.plugins) {
		if (plugin.id === params.selectedId) continue;
		if (plugin.kind !== params.selectedKind) continue;
		const entry = entries[plugin.id];
		if (!entry || entry.enabled !== false) {
			entries[plugin.id] = {
				...entry,
				enabled: false
			};
			disabledIds.push(plugin.id);
		}
	}
	if (disabledIds.length > 0) warnings.push(`Disabled other "${slotKey}" slot plugins: ${disabledIds.toSorted().join(", ")}.`);
	if (!(prevSlot !== params.selectedId || disabledIds.length > 0)) return {
		config: params.config,
		warnings: [],
		changed: false
	};
	return {
		config: {
			...params.config,
			plugins: {
				...pluginsConfig,
				slots,
				entries
			}
		},
		warnings,
		changed: true
	};
}
//#endregion
//#region src/plugins/config-state.ts
const BUNDLED_ENABLED_BY_DEFAULT = new Set([
	"amazon-bedrock",
	"anthropic",
	"byteplus",
	"cloudflare-ai-gateway",
	"deepseek",
	"device-pair",
	"github-copilot",
	"google",
	"huggingface",
	"kilocode",
	"kimi",
	"minimax",
	"mistral",
	"modelstudio",
	"moonshot",
	"nvidia",
	"ollama",
	"openai",
	"opencode",
	"opencode-go",
	"openrouter",
	"phone-control",
	"qianfan",
	"qwen-portal-auth",
	"sglang",
	"synthetic",
	"talk-voice",
	"together",
	"venice",
	"vercel-ai-gateway",
	"vllm",
	"volcengine",
	"xai",
	"xiaomi",
	"zai"
]);
const PLUGIN_ID_ALIASES = {
	"openai-codex": "openai",
	"kimi-coding": "kimi",
	"minimax-portal-auth": "minimax"
};
function normalizePluginId(id) {
	const trimmed = id.trim();
	return PLUGIN_ID_ALIASES[trimmed] ?? trimmed;
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
function resolveEnableState(id, origin, config, enabledByDefault) {
	if (!config.enabled) return {
		enabled: false,
		reason: "plugins disabled"
	};
	if (config.deny.includes(id)) return {
		enabled: false,
		reason: "blocked by denylist"
	};
	const entry = config.entries[id];
	if (entry?.enabled === false) return {
		enabled: false,
		reason: "disabled in config"
	};
	const explicitlyAllowed = config.allow.includes(id);
	if (origin === "workspace" && !explicitlyAllowed && entry?.enabled !== true) return {
		enabled: false,
		reason: "workspace plugin (disabled by default)"
	};
	if (config.slots.memory === id) return { enabled: true };
	if (config.allow.length > 0 && !explicitlyAllowed) return {
		enabled: false,
		reason: "not in allowlist"
	};
	if (entry?.enabled === true) return { enabled: true };
	if (origin === "bundled" && (enabledByDefault ?? BUNDLED_ENABLED_BY_DEFAULT.has(id))) return { enabled: true };
	if (origin === "bundled") return {
		enabled: false,
		reason: "bundled (disabled by default)"
	};
	return { enabled: true };
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
	const base = resolveEnableState(params.id, params.origin, params.config, params.enabledByDefault);
	if (!base.enabled && base.reason === "bundled (disabled by default)" && isBundledChannelEnabledByChannelConfig(params.rootConfig, params.id)) return { enabled: true };
	return base;
}
function resolveMemorySlotDecision(params) {
	if (params.kind !== "memory") return { enabled: true };
	if (params.slot === null) return {
		enabled: false,
		reason: "memory slot disabled"
	};
	if (typeof params.slot === "string") {
		if (params.slot === params.id) return {
			enabled: true,
			selected: true
		};
		return {
			enabled: false,
			reason: `memory slot set to "${params.slot}"`
		};
	}
	if (params.selectedId && params.selectedId !== params.id) return {
		enabled: false,
		reason: `memory slot already filled by "${params.selectedId}"`
	};
	return {
		enabled: true,
		selected: true
	};
}
//#endregion
export { normalizePluginsConfig as a, applyExclusiveSlotSelection as c, normalizePluginId as i, defaultSlotIdForKey as l, hasExplicitPluginConfig as n, resolveEffectiveEnableState as o, isTestDefaultMemorySlotDisabled as r, resolveMemorySlotDecision as s, applyTestPluginDefaults as t };
