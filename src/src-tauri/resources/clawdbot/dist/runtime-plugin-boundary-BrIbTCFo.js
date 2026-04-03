import { c as loadConfig } from "./io-DhtVmzAJ.js";
import { d as buildPluginLoaderJitiOptions, g as shouldPreferNativeJiti, h as resolvePluginSdkScopedAliasMap, m as resolvePluginSdkAliasFile } from "./chat-meta-Cdrnv7R-.js";
import { n as loadPluginManifestRegistry } from "./manifest-registry-BSmqODu2.js";
import "./config-CJQx-9zo.js";
import fsSync from "node:fs";
import path from "node:path";
import { createJiti } from "jiti";
//#region src/plugins/runtime/runtime-plugin-boundary.ts
function readPluginBoundaryConfigSafely() {
	try {
		return loadConfig();
	} catch {
		return {};
	}
}
function resolvePluginRuntimeRecord(pluginId, onMissing) {
	const record = loadPluginManifestRegistry({
		config: readPluginBoundaryConfigSafely(),
		cache: true
	}).plugins.find((plugin) => plugin.id === pluginId);
	if (!record?.source) {
		if (onMissing) onMissing();
		return null;
	}
	return {
		...record.origin ? { origin: record.origin } : {},
		rootDir: record.rootDir,
		source: record.source
	};
}
function resolvePluginRuntimeModulePath(record, entryBaseName, onMissing) {
	const candidates = [
		path.join(path.dirname(record.source), `${entryBaseName}.js`),
		path.join(path.dirname(record.source), `${entryBaseName}.ts`),
		...record.rootDir ? [path.join(record.rootDir, `${entryBaseName}.js`), path.join(record.rootDir, `${entryBaseName}.ts`)] : []
	];
	for (const candidate of candidates) if (fsSync.existsSync(candidate)) return candidate;
	if (onMissing) onMissing();
	return null;
}
function getPluginBoundaryJiti(modulePath, loaders) {
	const tryNative = shouldPreferNativeJiti(modulePath);
	const cached = loaders.get(tryNative);
	if (cached) return cached;
	const pluginSdkAlias = resolvePluginSdkAliasFile({
		srcFile: "root-alias.cjs",
		distFile: "root-alias.cjs",
		modulePath
	});
	const aliasMap = {
		...pluginSdkAlias ? { "openclaw/plugin-sdk": pluginSdkAlias } : {},
		...resolvePluginSdkScopedAliasMap({ modulePath })
	};
	const loader = createJiti(import.meta.url, {
		...buildPluginLoaderJitiOptions(aliasMap),
		tryNative
	});
	loaders.set(tryNative, loader);
	return loader;
}
function loadPluginBoundaryModuleWithJiti(modulePath, loaders) {
	return getPluginBoundaryJiti(modulePath, loaders)(modulePath);
}
//#endregion
export { resolvePluginRuntimeModulePath as n, resolvePluginRuntimeRecord as r, loadPluginBoundaryModuleWithJiti as t };
