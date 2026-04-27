import { i as loadPluginManifest } from "./manifest-UasFm2SQ.js";
import { n as discoverOpenClawPlugins } from "./discovery-DmIzxmAL.js";
import { o as normalizePluginsConfig, s as resolveEffectiveEnableState } from "./config-state-UvzNc3si.js";
import { r as parseRegistryNpmSpec } from "./npm-registry-spec-BCwYhlTW.js";
import { t as describePluginInstallSource } from "./install-source-info-Mugj-1Cr.js";
import { r as resolveManifestProviderAuthChoices } from "./provider-auth-choices-DUlXFm-t.js";
import path from "node:path";
//#region src/plugins/provider-install-catalog.ts
const INSTALL_ORIGIN_PRIORITY = {
	config: 0,
	bundled: 1,
	global: 2,
	workspace: 3
};
function isPreferredOrigin(candidate, current) {
	if (!current) return true;
	return INSTALL_ORIGIN_PRIORITY[candidate] < INSTALL_ORIGIN_PRIORITY[current];
}
function resolvePluginManifest(rootDir, rejectHardlinks) {
	const manifest = loadPluginManifest(rootDir, rejectHardlinks);
	return manifest.ok ? manifest : null;
}
function resolveTrustedNpmSpec(params) {
	if (params.origin !== "bundled" && params.origin !== "config") return;
	const npmSpec = params.install?.npmSpec?.trim();
	if (!npmSpec) return;
	return parseRegistryNpmSpec(npmSpec) ? npmSpec : void 0;
}
function resolveInstallInfo(params) {
	const npmSpec = resolveTrustedNpmSpec({
		origin: params.origin,
		install: params.install
	});
	let localPath = params.install?.localPath?.trim();
	if (!localPath && params.workspaceDir && params.packageDir) localPath = path.relative(params.workspaceDir, params.packageDir) || void 0;
	if (!npmSpec && !localPath) return null;
	const defaultChoice = params.install?.defaultChoice ?? (localPath ? "local" : npmSpec ? "npm" : void 0);
	return {
		...npmSpec ? { npmSpec } : {},
		...localPath ? { localPath } : {},
		...defaultChoice ? { defaultChoice } : {},
		...params.install?.minHostVersion ? { minHostVersion: params.install.minHostVersion } : {},
		...npmSpec && params.install?.expectedIntegrity ? { expectedIntegrity: params.install.expectedIntegrity } : {},
		...params.install?.allowInvalidConfigRecovery === true ? { allowInvalidConfigRecovery: true } : {}
	};
}
function resolvePreferredInstallsByPluginId(params) {
	const preferredByPluginId = /* @__PURE__ */ new Map();
	const normalizedConfig = normalizePluginsConfig(params.config?.plugins);
	for (const candidate of discoverOpenClawPlugins({
		workspaceDir: params.workspaceDir,
		env: params.env
	}).candidates) {
		const idHint = candidate.idHint.trim();
		if (candidate.origin === "workspace" && params.includeUntrustedWorkspacePlugins === false) {
			if (!idHint) continue;
			if (!resolveEffectiveEnableState({
				id: idHint,
				origin: candidate.origin,
				config: normalizedConfig,
				rootConfig: params.config
			}).enabled) continue;
		}
		const manifest = resolvePluginManifest(candidate.rootDir, candidate.origin !== "bundled");
		if (!manifest) continue;
		if (candidate.origin === "workspace" && params.includeUntrustedWorkspacePlugins === false && !resolveEffectiveEnableState({
			id: manifest.manifest.id,
			origin: candidate.origin,
			config: normalizedConfig,
			rootConfig: params.config
		}).enabled) continue;
		const install = resolveInstallInfo({
			origin: candidate.origin,
			install: candidate.packageManifest?.install,
			packageDir: candidate.packageDir,
			workspaceDir: candidate.workspaceDir
		});
		if (!install) continue;
		const existing = preferredByPluginId.get(manifest.manifest.id);
		if (!existing || isPreferredOrigin(candidate.origin, existing.origin)) preferredByPluginId.set(manifest.manifest.id, {
			origin: candidate.origin,
			install,
			...candidate.packageName ? { packageName: candidate.packageName } : {}
		});
	}
	return preferredByPluginId;
}
function resolveProviderInstallCatalogEntries(params) {
	const installsByPluginId = resolvePreferredInstallsByPluginId(params ?? {});
	return resolveManifestProviderAuthChoices(params).flatMap((choice) => {
		const install = installsByPluginId.get(choice.pluginId);
		if (!install) return [];
		return [{
			...choice,
			label: choice.groupLabel ?? choice.choiceLabel,
			origin: install.origin,
			install: install.install,
			installSource: describePluginInstallSource(install.install, { expectedPackageName: install.packageName })
		}];
	}).toSorted((left, right) => left.choiceLabel.localeCompare(right.choiceLabel));
}
function resolveProviderInstallCatalogEntry(choiceId, params) {
	const normalizedChoiceId = choiceId.trim();
	if (!normalizedChoiceId) return;
	return resolveProviderInstallCatalogEntries(params).find((entry) => entry.choiceId === normalizedChoiceId);
}
//#endregion
export { resolveProviderInstallCatalogEntry as n, resolveProviderInstallCatalogEntries as t };
