import { h as resolveConfigDir, u as isRecord, v as resolveUserPath } from "./utils-CE3P21nG.js";
import { r as normalizeProviderId } from "./provider-id-CTiEzT1T.js";
import "./model-selection-8a6zD_aX.js";
import { t as isBlockedObjectKey } from "./prototype-keys-C9Ot198c.js";
import { r as normalizeChatChannelId, t as getChatChannelMeta } from "./chat-meta-Cdrnv7R-.js";
import "./registry-DTO_OK4F.js";
import { r as BUNDLED_PLUGIN_CONTRACT_SNAPSHOTS, t as BUNDLED_AUTO_ENABLE_PROVIDER_PLUGIN_IDS } from "./bundled-capability-metadata-D5qf8V45.js";
import { n as loadPluginManifestRegistry } from "./manifest-registry-BSmqODu2.js";
import { n as hasPotentialConfiguredChannels, r as listPotentialConfiguredChannelIds } from "./config-presence-C3S8ml6i.js";
import { t as isChannelConfigured } from "./channel-configured-xOWKXdGR.js";
import { t as ensurePluginAllowlisted } from "./plugins-allowlist-B53tw460.js";
import fsSync from "node:fs";
import path from "node:path";
//#region src/plugins/bundled-web-fetch-provider-ids.ts
const bundledWebFetchProviderPluginIds = Object.fromEntries(BUNDLED_PLUGIN_CONTRACT_SNAPSHOTS.flatMap((entry) => entry.webFetchProviderIds.map((providerId) => [providerId, entry.pluginId])).toSorted(([left], [right]) => left.localeCompare(right)));
function resolveBundledWebFetchPluginId(providerId) {
	if (!providerId) return;
	const normalizedProviderId = providerId.trim().toLowerCase();
	if (!(normalizedProviderId in bundledWebFetchProviderPluginIds)) return;
	return bundledWebFetchProviderPluginIds[normalizedProviderId];
}
//#endregion
//#region src/config/plugin-auto-enable.ts
const EMPTY_PLUGIN_MANIFEST_REGISTRY = {
	plugins: [],
	diagnostics: []
};
const ENV_CATALOG_PATHS = ["OPENCLAW_PLUGIN_CATALOG_PATHS", "OPENCLAW_MPM_CATALOG_PATHS"];
function resolveAutoEnableProviderPluginIds(registry) {
	const entries = new Map(Object.entries(BUNDLED_AUTO_ENABLE_PROVIDER_PLUGIN_IDS));
	for (const plugin of registry.plugins) for (const providerId of plugin.autoEnableWhenConfiguredProviders ?? []) if (!entries.has(providerId)) entries.set(providerId, plugin.id);
	return Object.fromEntries(entries);
}
function collectModelRefs(cfg) {
	const refs = [];
	const pushModelRef = (value) => {
		if (typeof value === "string" && value.trim()) refs.push(value.trim());
	};
	const collectFromAgent = (agent) => {
		if (!agent) return;
		const model = agent.model;
		if (typeof model === "string") pushModelRef(model);
		else if (isRecord(model)) {
			pushModelRef(model.primary);
			const fallbacks = model.fallbacks;
			if (Array.isArray(fallbacks)) for (const entry of fallbacks) pushModelRef(entry);
		}
		const models = agent.models;
		if (isRecord(models)) for (const key of Object.keys(models)) pushModelRef(key);
	};
	const defaults = cfg.agents?.defaults;
	collectFromAgent(defaults);
	const list = cfg.agents?.list;
	if (Array.isArray(list)) {
		for (const entry of list) if (isRecord(entry)) collectFromAgent(entry);
	}
	return refs;
}
function extractProviderFromModelRef(value) {
	const trimmed = value.trim();
	const slash = trimmed.indexOf("/");
	if (slash <= 0) return null;
	return normalizeProviderId(trimmed.slice(0, slash));
}
function isProviderConfigured(cfg, providerId) {
	const normalized = normalizeProviderId(providerId);
	const profiles = cfg.auth?.profiles;
	if (profiles && typeof profiles === "object") for (const profile of Object.values(profiles)) {
		if (!isRecord(profile)) continue;
		if (normalizeProviderId(String(profile.provider ?? "")) === normalized) return true;
	}
	const providerConfig = cfg.models?.providers;
	if (providerConfig && typeof providerConfig === "object") {
		for (const key of Object.keys(providerConfig)) if (normalizeProviderId(key) === normalized) return true;
	}
	const modelRefs = collectModelRefs(cfg);
	for (const ref of modelRefs) {
		const provider = extractProviderFromModelRef(ref);
		if (provider && provider === normalized) return true;
	}
	return false;
}
function hasPluginOwnedWebSearchConfig(cfg, pluginId) {
	const pluginConfig = cfg.plugins?.entries?.[pluginId]?.config;
	if (!isRecord(pluginConfig)) return false;
	return isRecord(pluginConfig.webSearch);
}
function hasPluginOwnedWebFetchConfig(cfg, pluginId) {
	const pluginConfig = cfg.plugins?.entries?.[pluginId]?.config;
	if (!isRecord(pluginConfig)) return false;
	return isRecord(pluginConfig.webFetch);
}
function hasPluginOwnedToolConfig(cfg, pluginId) {
	if (pluginId === "xai") {
		const pluginConfig = cfg.plugins?.entries?.xai?.config;
		const web = cfg.tools?.web;
		return Boolean(isRecord(web?.x_search) || isRecord(pluginConfig) && (isRecord(pluginConfig.xSearch) || isRecord(pluginConfig.codeExecution)));
	}
	return false;
}
function resolveProviderPluginsWithOwnedWebSearch(registry) {
	const pluginIds = new Set(BUNDLED_PLUGIN_CONTRACT_SNAPSHOTS.filter((entry) => entry.providerIds.length > 0 && entry.webSearchProviderIds.length > 0).map((entry) => entry.pluginId));
	for (const plugin of registry.plugins) if (plugin.providers.length > 0 && (plugin.contracts?.webSearchProviders?.length ?? 0) > 0) pluginIds.add(plugin.id);
	return pluginIds;
}
const BUNDLED_WEB_FETCH_OWNER_PLUGIN_IDS = new Set(BUNDLED_PLUGIN_CONTRACT_SNAPSHOTS.filter((entry) => entry.webFetchProviderIds.length > 0).map((entry) => entry.pluginId));
function resolveProviderPluginsWithOwnedWebFetch() {
	return new Set(BUNDLED_PLUGIN_CONTRACT_SNAPSHOTS.filter((entry) => entry.webFetchProviderIds.length > 0).map((entry) => entry.pluginId));
}
function resolvePluginIdForConfiguredWebFetchProvider(providerId) {
	return resolveBundledWebFetchPluginId(typeof providerId === "string" ? providerId.trim().toLowerCase() : "");
}
function buildChannelToPluginIdMap(registry) {
	const map = /* @__PURE__ */ new Map();
	for (const record of registry.plugins) for (const channelId of record.channels) if (channelId && !map.has(channelId)) map.set(channelId, record.id);
	return map;
}
function splitEnvPaths(value) {
	const trimmed = value.trim();
	if (!trimmed) return [];
	return trimmed.split(/[;,]/g).flatMap((chunk) => chunk.split(path.delimiter)).map((entry) => entry.trim()).filter(Boolean);
}
function resolveExternalCatalogPaths(env) {
	for (const key of ENV_CATALOG_PATHS) {
		const raw = env[key];
		if (raw && raw.trim()) return splitEnvPaths(raw);
	}
	const configDir = resolveConfigDir(env);
	return [
		path.join(configDir, "mpm", "plugins.json"),
		path.join(configDir, "mpm", "catalog.json"),
		path.join(configDir, "plugins", "catalog.json")
	];
}
function parseExternalCatalogChannelEntries(raw) {
	const list = (() => {
		if (Array.isArray(raw)) return raw;
		if (!isRecord(raw)) return [];
		const entries = raw.entries ?? raw.packages ?? raw.plugins;
		return Array.isArray(entries) ? entries : [];
	})();
	const channels = [];
	for (const entry of list) {
		if (!isRecord(entry) || !isRecord(entry.openclaw) || !isRecord(entry.openclaw.channel)) continue;
		const channel = entry.openclaw.channel;
		const id = typeof channel.id === "string" ? channel.id.trim() : "";
		if (!id) continue;
		const preferOver = Array.isArray(channel.preferOver) ? channel.preferOver.filter((value) => typeof value === "string") : [];
		channels.push({
			id,
			preferOver
		});
	}
	return channels;
}
function resolveExternalCatalogPreferOver(channelId, env) {
	for (const rawPath of resolveExternalCatalogPaths(env)) {
		const resolved = resolveUserPath(rawPath, env);
		if (!fsSync.existsSync(resolved)) continue;
		try {
			const channel = parseExternalCatalogChannelEntries(JSON.parse(fsSync.readFileSync(resolved, "utf-8"))).find((entry) => entry.id === channelId);
			if (channel) return channel.preferOver;
		} catch {}
	}
	return [];
}
function resolvePluginIdForChannel(channelId, channelToPluginId) {
	const builtInId = normalizeChatChannelId(channelId);
	if (builtInId) return builtInId;
	return channelToPluginId.get(channelId) ?? channelId;
}
function collectCandidateChannelIds(cfg, env) {
	return listPotentialConfiguredChannelIds(cfg, env).map((channelId) => normalizeChatChannelId(channelId) ?? channelId);
}
function hasConfiguredWebSearchPluginEntry(cfg) {
	const entries = cfg.plugins?.entries;
	if (!entries || typeof entries !== "object") return false;
	return Object.values(entries).some((entry) => isRecord(entry) && isRecord(entry.config) && isRecord(entry.config.webSearch));
}
function hasConfiguredWebFetchPluginEntry(cfg) {
	const entries = cfg.plugins?.entries;
	if (!entries || typeof entries !== "object") return false;
	return Object.entries(entries).some(([pluginId, entry]) => BUNDLED_WEB_FETCH_OWNER_PLUGIN_IDS.has(pluginId) && isRecord(entry) && isRecord(entry.config) && isRecord(entry.config.webFetch));
}
function configMayNeedPluginManifestRegistry(cfg) {
	const configuredChannels = cfg.channels;
	if (!configuredChannels || typeof configuredChannels !== "object") return false;
	for (const key of Object.keys(configuredChannels)) {
		if (key === "defaults" || key === "modelByChannel") continue;
		if (!normalizeChatChannelId(key)) return true;
	}
	return false;
}
function configMayNeedPluginAutoEnable(cfg, env) {
	if (hasPotentialConfiguredChannels(cfg, env)) return true;
	if (resolveBrowserAutoEnableReason(cfg)) return true;
	if (cfg.acp?.enabled === true || cfg.acp?.dispatch?.enabled === true) return true;
	if (typeof cfg.acp?.backend === "string" && cfg.acp.backend.trim().length > 0) return true;
	if (cfg.auth?.profiles && Object.keys(cfg.auth.profiles).length > 0) return true;
	if (cfg.models?.providers && Object.keys(cfg.models.providers).length > 0) return true;
	if (collectModelRefs(cfg).length > 0) return true;
	const web = cfg.tools?.web;
	if (isRecord(web?.x_search)) return true;
	if (isRecord(cfg.plugins?.entries?.xai?.config) || hasConfiguredWebSearchPluginEntry(cfg) || hasConfiguredWebFetchPluginEntry(cfg)) return true;
	return false;
}
function listContainsBrowser(value) {
	return Array.isArray(value) && value.some((entry) => typeof entry === "string" && entry.trim().toLowerCase() === "browser");
}
function toolPolicyReferencesBrowser(value) {
	if (!isRecord(value)) return false;
	return listContainsBrowser(value.allow) || listContainsBrowser(value.alsoAllow);
}
function hasBrowserToolReference(cfg) {
	if (toolPolicyReferencesBrowser(cfg.tools)) return true;
	const agentList = cfg.agents?.list;
	if (!Array.isArray(agentList)) return false;
	return agentList.some((entry) => isRecord(entry) && toolPolicyReferencesBrowser(entry.tools));
}
function hasExplicitBrowserPluginEntry(cfg) {
	return Boolean(cfg.plugins?.entries && Object.prototype.hasOwnProperty.call(cfg.plugins.entries, "browser"));
}
function resolveBrowserAutoEnableReason(cfg) {
	if (cfg.browser?.enabled === false || cfg.plugins?.entries?.browser?.enabled === false) return null;
	if (Object.prototype.hasOwnProperty.call(cfg, "browser")) return "browser configured";
	if (hasExplicitBrowserPluginEntry(cfg)) return "browser plugin configured";
	if (hasBrowserToolReference(cfg)) return "browser tool referenced";
	return null;
}
function resolveConfiguredPlugins(cfg, env, registry) {
	const changes = [];
	const channelToPluginId = buildChannelToPluginIdMap(registry);
	for (const channelId of collectCandidateChannelIds(cfg, env)) {
		const pluginId = resolvePluginIdForChannel(channelId, channelToPluginId);
		if (isChannelConfigured(cfg, channelId, env)) changes.push({
			pluginId,
			reason: `${channelId} configured`
		});
	}
	const browserReason = resolveBrowserAutoEnableReason(cfg);
	if (browserReason) changes.push({
		pluginId: "browser",
		reason: browserReason
	});
	for (const [providerId, pluginId] of Object.entries(resolveAutoEnableProviderPluginIds(registry))) if (isProviderConfigured(cfg, providerId)) changes.push({
		pluginId,
		reason: `${providerId} auth configured`
	});
	const webFetchProvider = typeof cfg.tools?.web?.fetch?.provider === "string" ? cfg.tools.web.fetch.provider : void 0;
	const webFetchPluginId = resolvePluginIdForConfiguredWebFetchProvider(webFetchProvider);
	if (webFetchPluginId) changes.push({
		pluginId: webFetchPluginId,
		reason: `${String(webFetchProvider).trim().toLowerCase()} web fetch provider selected`
	});
	for (const pluginId of resolveProviderPluginsWithOwnedWebSearch(registry)) if (hasPluginOwnedWebSearchConfig(cfg, pluginId)) changes.push({
		pluginId,
		reason: `${pluginId} web search configured`
	});
	for (const pluginId of resolveProviderPluginsWithOwnedWebFetch()) if (hasPluginOwnedWebFetchConfig(cfg, pluginId)) changes.push({
		pluginId,
		reason: `${pluginId} web fetch configured`
	});
	for (const pluginId of resolveProviderPluginsWithOwnedWebSearch(registry)) if (hasPluginOwnedToolConfig(cfg, pluginId)) changes.push({
		pluginId,
		reason: `${pluginId} tool configured`
	});
	const backendRaw = typeof cfg.acp?.backend === "string" ? cfg.acp.backend.trim().toLowerCase() : "";
	if ((cfg.acp?.enabled === true || cfg.acp?.dispatch?.enabled === true || backendRaw === "acpx") && (!backendRaw || backendRaw === "acpx")) changes.push({
		pluginId: "acpx",
		reason: "ACP runtime configured"
	});
	return changes;
}
function isPluginExplicitlyDisabled(cfg, pluginId) {
	const builtInChannelId = normalizeChatChannelId(pluginId);
	if (builtInChannelId) {
		const channelConfig = cfg.channels?.[builtInChannelId];
		if (channelConfig && typeof channelConfig === "object" && !Array.isArray(channelConfig) && channelConfig.enabled === false) return true;
	}
	return (cfg.plugins?.entries?.[pluginId])?.enabled === false;
}
function isPluginDenied(cfg, pluginId) {
	const deny = cfg.plugins?.deny;
	return Array.isArray(deny) && deny.includes(pluginId);
}
function resolvePreferredOverIds(pluginId, env, registry) {
	const normalized = normalizeChatChannelId(pluginId);
	if (normalized) return [...getChatChannelMeta(normalized).preferOver ?? []];
	const installedPlugin = registry.plugins.find((record) => record.id === pluginId);
	const manifestChannelPreferOver = installedPlugin?.channelConfigs?.[pluginId]?.preferOver;
	if (manifestChannelPreferOver?.length) return [...manifestChannelPreferOver];
	const installedChannelMeta = installedPlugin?.channelCatalogMeta;
	if (installedChannelMeta?.preferOver?.length) return [...installedChannelMeta.preferOver];
	return resolveExternalCatalogPreferOver(pluginId, env);
}
function shouldSkipPreferredPluginAutoEnable(cfg, entry, configured, env, registry) {
	for (const other of configured) {
		if (other.pluginId === entry.pluginId) continue;
		if (isPluginDenied(cfg, other.pluginId)) continue;
		if (isPluginExplicitlyDisabled(cfg, other.pluginId)) continue;
		if (resolvePreferredOverIds(other.pluginId, env, registry).includes(entry.pluginId)) return true;
	}
	return false;
}
function registerPluginEntry(cfg, pluginId) {
	const builtInChannelId = normalizeChatChannelId(pluginId);
	if (builtInChannelId) {
		const existing = cfg.channels?.[builtInChannelId];
		const existingRecord = existing && typeof existing === "object" && !Array.isArray(existing) ? existing : {};
		return {
			...cfg,
			channels: {
				...cfg.channels,
				[builtInChannelId]: {
					...existingRecord,
					enabled: true
				}
			}
		};
	}
	const entries = {
		...cfg.plugins?.entries,
		[pluginId]: {
			...cfg.plugins?.entries?.[pluginId],
			enabled: true
		}
	};
	return {
		...cfg,
		plugins: {
			...cfg.plugins,
			entries
		}
	};
}
function formatAutoEnableChange(entry) {
	let reason = entry.reason.trim();
	const channelId = normalizeChatChannelId(entry.pluginId);
	if (channelId) {
		const label = getChatChannelMeta(channelId).label;
		reason = reason.replace(new RegExp(`^${channelId}\\b`, "i"), label);
	}
	return `${reason}, enabled automatically.`;
}
function applyPluginAutoEnable(params) {
	const env = params.env ?? process.env;
	const config = params.config ?? {};
	if (!configMayNeedPluginAutoEnable(config, env)) return {
		config,
		changes: [],
		autoEnabledReasons: {}
	};
	const registry = params.manifestRegistry ?? (configMayNeedPluginManifestRegistry(config) ? loadPluginManifestRegistry({
		config,
		env
	}) : EMPTY_PLUGIN_MANIFEST_REGISTRY);
	const configured = resolveConfiguredPlugins(config, env, registry);
	if (configured.length === 0) return {
		config,
		changes: [],
		autoEnabledReasons: {}
	};
	let next = config;
	const changes = [];
	const autoEnabledReasons = /* @__PURE__ */ new Map();
	if (next.plugins?.enabled === false) return {
		config: next,
		changes,
		autoEnabledReasons: {}
	};
	for (const entry of configured) {
		const builtInChannelId = normalizeChatChannelId(entry.pluginId);
		if (isPluginDenied(next, entry.pluginId)) continue;
		if (isPluginExplicitlyDisabled(next, entry.pluginId)) continue;
		if (shouldSkipPreferredPluginAutoEnable(next, entry, configured, env, registry)) continue;
		const allow = next.plugins?.allow;
		const allowMissing = builtInChannelId == null && Array.isArray(allow) && !allow.includes(entry.pluginId);
		if ((builtInChannelId != null ? (() => {
			const channelConfig = next.channels?.[builtInChannelId];
			if (!channelConfig || typeof channelConfig !== "object" || Array.isArray(channelConfig)) return false;
			return channelConfig.enabled === true;
		})() : next.plugins?.entries?.[entry.pluginId]?.enabled === true) && !allowMissing) continue;
		next = registerPluginEntry(next, entry.pluginId);
		if (!builtInChannelId) next = ensurePluginAllowlisted(next, entry.pluginId);
		autoEnabledReasons.set(entry.pluginId, [...autoEnabledReasons.get(entry.pluginId) ?? [], entry.reason]);
		changes.push(formatAutoEnableChange(entry));
	}
	const autoEnabledReasonRecord = Object.create(null);
	for (const [pluginId, reasons] of autoEnabledReasons) {
		if (isBlockedObjectKey(pluginId)) continue;
		autoEnabledReasonRecord[pluginId] = [...reasons];
	}
	return {
		config: next,
		changes,
		autoEnabledReasons: autoEnabledReasonRecord
	};
}
//#endregion
export { resolveBundledWebFetchPluginId as n, applyPluginAutoEnable as t };
