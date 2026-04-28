import { c as normalizeOptionalString } from "./string-coerce-Bje8XVt9.js";
import { t as listChannelCatalogEntries } from "./channel-catalog-registry-DOnze0PB.js";
import { a as getBundledChannelSetupSecrets, g as resolveBundledChannelRootScope, i as getBundledChannelSetupPlugin, n as getBundledChannelPlugin, r as getBundledChannelSecrets } from "./bundled-CAfVQCWF.js";
//#region src/channels/plugins/bundled-ids.ts
const bundledChannelPluginIdsByRoot = /* @__PURE__ */ new Map();
function listBundledChannelPluginIdsForRoot(packageRoot, env = process.env) {
	const cached = bundledChannelPluginIdsByRoot.get(packageRoot);
	if (cached) return [...cached];
	const loaded = listChannelCatalogEntries({
		origin: "bundled",
		env
	}).map((entry) => entry.pluginId).toSorted((left, right) => left.localeCompare(right));
	bundledChannelPluginIdsByRoot.set(packageRoot, loaded);
	return [...loaded];
}
function listBundledChannelPluginIds() {
	return listBundledChannelPluginIdsForRoot(resolveBundledChannelRootScope().cacheKey);
}
//#endregion
//#region src/channels/plugins/bootstrap-registry.ts
const cachedBootstrapPluginsByRoot = /* @__PURE__ */ new Map();
function resolveBootstrapChannelId(id) {
	return normalizeOptionalString(id) ?? "";
}
function mergePluginSection(runtimeValue, setupValue) {
	if (runtimeValue && setupValue && typeof runtimeValue === "object" && typeof setupValue === "object") {
		const merged = { ...runtimeValue };
		for (const [key, value] of Object.entries(setupValue)) if (value !== void 0) merged[key] = value;
		return { ...merged };
	}
	return setupValue ?? runtimeValue;
}
function mergeBootstrapPlugin(runtimePlugin, setupPlugin) {
	return {
		...runtimePlugin,
		...setupPlugin,
		meta: mergePluginSection(runtimePlugin.meta, setupPlugin.meta),
		capabilities: mergePluginSection(runtimePlugin.capabilities, setupPlugin.capabilities),
		commands: mergePluginSection(runtimePlugin.commands, setupPlugin.commands),
		doctor: mergePluginSection(runtimePlugin.doctor, setupPlugin.doctor),
		reload: mergePluginSection(runtimePlugin.reload, setupPlugin.reload),
		config: mergePluginSection(runtimePlugin.config, setupPlugin.config),
		setup: mergePluginSection(runtimePlugin.setup, setupPlugin.setup),
		messaging: mergePluginSection(runtimePlugin.messaging, setupPlugin.messaging),
		actions: mergePluginSection(runtimePlugin.actions, setupPlugin.actions),
		secrets: mergePluginSection(runtimePlugin.secrets, setupPlugin.secrets)
	};
}
function buildBootstrapPlugins(cacheKey, env = process.env) {
	return {
		sortedIds: listBundledChannelPluginIdsForRoot(cacheKey, env),
		byId: /* @__PURE__ */ new Map(),
		secretsById: /* @__PURE__ */ new Map(),
		missingIds: /* @__PURE__ */ new Set()
	};
}
function getBootstrapPlugins(cacheKey = resolveBundledChannelRootScope().cacheKey, env = process.env) {
	const cached = cachedBootstrapPluginsByRoot.get(cacheKey);
	if (cached) return cached;
	const created = buildBootstrapPlugins(cacheKey, env);
	cachedBootstrapPluginsByRoot.set(cacheKey, created);
	return created;
}
function resolveActiveBootstrapPlugins() {
	return getBootstrapPlugins(resolveBundledChannelRootScope().cacheKey);
}
function listBootstrapChannelPluginIds() {
	return resolveActiveBootstrapPlugins().sortedIds;
}
function* iterateBootstrapChannelPlugins() {
	for (const id of listBootstrapChannelPluginIds()) {
		const plugin = getBootstrapChannelPlugin(id);
		if (plugin) yield plugin;
	}
}
function getBootstrapChannelPlugin(id) {
	const resolvedId = resolveBootstrapChannelId(id);
	if (!resolvedId) return;
	const registry = resolveActiveBootstrapPlugins();
	const cached = registry.byId.get(resolvedId);
	if (cached) return cached;
	if (registry.missingIds.has(resolvedId)) return;
	let runtimePlugin;
	let setupPlugin;
	try {
		runtimePlugin = getBundledChannelPlugin(resolvedId);
		setupPlugin = getBundledChannelSetupPlugin(resolvedId);
	} catch {
		registry.missingIds.add(resolvedId);
		return;
	}
	const merged = runtimePlugin && setupPlugin ? mergeBootstrapPlugin(runtimePlugin, setupPlugin) : setupPlugin ?? runtimePlugin;
	if (!merged) {
		registry.missingIds.add(resolvedId);
		return;
	}
	registry.byId.set(resolvedId, merged);
	return merged;
}
function getBootstrapChannelSecrets(id) {
	const resolvedId = resolveBootstrapChannelId(id);
	if (!resolvedId) return;
	const registry = resolveActiveBootstrapPlugins();
	const cached = registry.secretsById.get(resolvedId);
	if (cached) return cached;
	if (registry.secretsById.has(resolvedId)) return;
	if (registry.missingIds.has(resolvedId)) {
		registry.secretsById.set(resolvedId, null);
		return;
	}
	try {
		const merged = mergePluginSection(getBundledChannelSecrets(resolvedId), getBundledChannelSetupSecrets(resolvedId));
		registry.secretsById.set(resolvedId, merged ?? null);
		return merged;
	} catch {
		registry.missingIds.add(resolvedId);
		registry.secretsById.set(resolvedId, null);
		return;
	}
}
//#endregion
export { listBundledChannelPluginIds as i, getBootstrapChannelSecrets as n, iterateBootstrapChannelPlugins as r, getBootstrapChannelPlugin as t };
