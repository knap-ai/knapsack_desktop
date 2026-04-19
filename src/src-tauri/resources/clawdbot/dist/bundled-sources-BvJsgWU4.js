import { s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { i as loadPluginManifest } from "./manifest-DKZWfJEu.js";
import { n as discoverOpenClawPlugins } from "./discovery-DGQFjH8F.js";
//#region src/plugins/bundled-sources.ts
function findBundledPluginSourceInMap(params) {
	const targetValue = params.lookup.value.trim();
	if (!targetValue) return;
	if (params.lookup.kind === "pluginId") return params.bundled.get(targetValue);
	for (const source of params.bundled.values()) if (source.npmSpec === targetValue) return source;
}
function resolveBundledPluginSources(params) {
	const discovery = discoverOpenClawPlugins({
		workspaceDir: params.workspaceDir,
		env: params.env
	});
	const bundled = /* @__PURE__ */ new Map();
	for (const candidate of discovery.candidates) {
		if (candidate.origin !== "bundled") continue;
		const manifest = loadPluginManifest(candidate.rootDir, false);
		if (!manifest.ok) continue;
		const pluginId = manifest.manifest.id;
		if (bundled.has(pluginId)) continue;
		const npmSpec = normalizeOptionalString(candidate.packageManifest?.install?.npmSpec) || normalizeOptionalString(candidate.packageName) || void 0;
		bundled.set(pluginId, {
			pluginId,
			localPath: candidate.rootDir,
			npmSpec
		});
	}
	return bundled;
}
function findBundledPluginSource(params) {
	return findBundledPluginSourceInMap({
		bundled: resolveBundledPluginSources({
			workspaceDir: params.workspaceDir,
			env: params.env
		}),
		lookup: params.lookup
	});
}
function resolveBundledPluginInstallCommandHint(params) {
	const bundledSource = findBundledPluginSource({
		lookup: {
			kind: "pluginId",
			value: params.pluginId
		},
		workspaceDir: params.workspaceDir,
		env: params.env
	});
	if (!bundledSource?.localPath) return null;
	return `openclaw plugins install ${bundledSource.localPath}`;
}
//#endregion
export { resolveBundledPluginSources as i, findBundledPluginSourceInMap as n, resolveBundledPluginInstallCommandHint as r, findBundledPluginSource as t };
