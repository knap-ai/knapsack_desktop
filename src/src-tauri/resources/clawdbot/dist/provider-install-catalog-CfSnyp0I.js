import { l as loadOpenClawProviderIndex } from "./manifest-DkU_xlZi.js";
import { o as normalizePluginsConfig, s as resolveEffectiveEnableState } from "./config-state-Bw_lAn0M.js";
import { t as describePluginInstallSource } from "./install-source-info-Dp75vUL7.js";
import { v as loadPluginRegistrySnapshot } from "./plugin-registry-CZ8QXP5l.js";
import { i as resolveManifestProviderAuthChoices } from "./provider-auth-choices-lXVgXQ-j.js";
//#region src/plugins/provider-install-catalog.ts
const INSTALL_ORIGIN_PRIORITY = {
	config: 0,
	bundled: 1,
	global: 2,
	workspace: 3
};
function isPreferredOrigin(candidate, current) {
	return !current || INSTALL_ORIGIN_PRIORITY[candidate] < INSTALL_ORIGIN_PRIORITY[current];
}
function normalizeDefaultChoice(value) {
	return value === "npm" || value === "local" ? value : void 0;
}
function resolveInstallInfoFromInstallRecord(record) {
	if (!record) return null;
	const npmSpec = (record.resolvedSpec ?? record.spec)?.trim();
	const localPath = (record.installPath ?? record.sourcePath)?.trim();
	if (record.source === "npm" && npmSpec) return {
		npmSpec,
		defaultChoice: "npm",
		...record.integrity ? { expectedIntegrity: record.integrity } : {}
	};
	if (record.source === "path" && localPath) return {
		localPath,
		defaultChoice: "local"
	};
	return null;
}
function resolveInstallInfoFromPackageSource(params) {
	const npmSpec = params.origin === "bundled" || params.origin === "config" ? params.source?.npm?.spec : void 0;
	const localPath = params.source?.local?.path;
	if (!npmSpec && !localPath) return null;
	const defaultChoice = normalizeDefaultChoice(params.source?.defaultChoice);
	return {
		...npmSpec ? { npmSpec } : {},
		...localPath ? { localPath } : {},
		...defaultChoice ? { defaultChoice } : npmSpec ? { defaultChoice: "npm" } : {},
		...npmSpec && params.source?.npm?.expectedIntegrity ? { expectedIntegrity: params.source.npm.expectedIntegrity } : {}
	};
}
function resolveInstallInfoFromRegistryRecord(params) {
	return resolveInstallInfoFromInstallRecord(params.installRecord) ?? resolveInstallInfoFromPackageSource({
		origin: params.record.origin,
		source: params.record.packageInstall
	});
}
function resolveInstallInfoFromProviderIndex(provider) {
	const install = provider.plugin.install;
	if (!install) return null;
	const npmSpec = install.npmSpec?.trim();
	if (!npmSpec) return null;
	return {
		npmSpec,
		defaultChoice: normalizeDefaultChoice(install.defaultChoice) ?? "npm",
		...install.minHostVersion ? { minHostVersion: install.minHostVersion } : {},
		...install.expectedIntegrity ? { expectedIntegrity: install.expectedIntegrity } : {}
	};
}
function resolvePreferredInstallsByPluginId(params) {
	const preferredByPluginId = /* @__PURE__ */ new Map();
	const index = loadPluginRegistrySnapshot({
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env
	});
	const installedPluginIds = new Set(index.plugins.map((record) => record.pluginId));
	const normalizedConfig = normalizePluginsConfig(params.config?.plugins);
	for (const record of index.plugins) {
		if (record.origin === "workspace" && params.includeUntrustedWorkspacePlugins === false && !resolveEffectiveEnableState({
			id: record.pluginId,
			origin: record.origin,
			config: normalizedConfig,
			rootConfig: params.config,
			enabledByDefault: record.enabledByDefault
		}).enabled) continue;
		const install = resolveInstallInfoFromRegistryRecord({
			record,
			installRecord: index.installRecords[record.pluginId]
		});
		if (!install) continue;
		const existing = preferredByPluginId.get(record.pluginId);
		if (!existing || isPreferredOrigin(record.origin, existing.origin)) preferredByPluginId.set(record.pluginId, {
			origin: record.origin,
			install,
			...record.packageName ? { packageName: record.packageName } : {}
		});
	}
	return {
		installedPluginIds,
		installsByPluginId: preferredByPluginId
	};
}
function resolveProviderIndexInstallCatalogEntries(params) {
	const entries = [];
	const index = loadOpenClawProviderIndex();
	for (const provider of Object.values(index.providers)) {
		if (params.installedPluginIds.has(provider.plugin.id)) continue;
		const install = resolveInstallInfoFromProviderIndex(provider);
		if (!install) continue;
		for (const choice of provider.authChoices ?? []) {
			if (params.seenChoiceIds.has(choice.choiceId)) continue;
			entries.push({
				pluginId: provider.plugin.id,
				providerId: provider.id,
				methodId: choice.method,
				choiceId: choice.choiceId,
				choiceLabel: choice.choiceLabel,
				...choice.choiceHint ? { choiceHint: choice.choiceHint } : {},
				...choice.assistantPriority !== void 0 ? { assistantPriority: choice.assistantPriority } : {},
				...choice.assistantVisibility ? { assistantVisibility: choice.assistantVisibility } : {},
				...choice.groupId ? { groupId: choice.groupId } : {},
				...choice.groupLabel ? { groupLabel: choice.groupLabel } : {},
				...choice.groupHint ? { groupHint: choice.groupHint } : {},
				...choice.optionKey ? { optionKey: choice.optionKey } : {},
				...choice.cliFlag ? { cliFlag: choice.cliFlag } : {},
				...choice.cliOption ? { cliOption: choice.cliOption } : {},
				...choice.cliDescription ? { cliDescription: choice.cliDescription } : {},
				...choice.onboardingScopes ? { onboardingScopes: [...choice.onboardingScopes] } : {},
				label: provider.name,
				origin: "bundled",
				install,
				installSource: describePluginInstallSource(install, { expectedPackageName: provider.plugin.package })
			});
		}
	}
	return entries;
}
function resolveProviderInstallCatalogEntries(params) {
	const { installedPluginIds, installsByPluginId } = resolvePreferredInstallsByPluginId(params ?? {});
	const manifestEntries = resolveManifestProviderAuthChoices(params).flatMap((choice) => {
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
	const indexEntries = resolveProviderIndexInstallCatalogEntries({
		installedPluginIds,
		seenChoiceIds: new Set(manifestEntries.map((entry) => entry.choiceId))
	});
	return [...manifestEntries, ...indexEntries].toSorted((left, right) => left.choiceLabel.localeCompare(right.choiceLabel));
}
function resolveProviderInstallCatalogEntry(choiceId, params) {
	const normalizedChoiceId = choiceId.trim();
	if (!normalizedChoiceId) return;
	return resolveProviderInstallCatalogEntries(params).find((entry) => entry.choiceId === normalizedChoiceId);
}
//#endregion
export { resolveProviderInstallCatalogEntry as n, resolveProviderInstallCatalogEntries as t };
