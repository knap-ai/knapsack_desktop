import { t as createSubsystemLogger } from "./subsystem-Cgmckbux.js";
import { t as clearPluginDiscoveryCache } from "./discovery-DGQFjH8F.js";
import { b as resolveAgentWorkspaceDir, x as resolveDefaultAgentId } from "./agent-scope-KFH9bkHi.js";
import { a as normalizePluginsConfig, c as resolveEnableState } from "./config-state-CcN3bZ9D.js";
import { t as applyPluginAutoEnable } from "./plugin-auto-enable-BbVfCcz-.js";
import { r as loadOpenClawPlugins } from "./loader-DYW2PvbF.js";
import "./runtime-BB1a2aCy.js";
import { r as installPluginFromNpmSpec } from "./install-CFYMfNJH.js";
import { t as enablePluginInConfig } from "./enable-CYwosJmY.js";
import { i as resolveBundledPluginSources, n as findBundledPluginSourceInMap } from "./bundled-sources-BvJsgWU4.js";
import { n as recordPluginInstall, t as buildNpmResolutionInstallFields } from "./installs-CQWxEew_.js";
import { n as getChannelPluginCatalogEntry, r as listChannelPluginCatalogEntries } from "./catalog-DZDl9vtb.js";
import { n as resolveBundledInstallPlanForCatalogEntry } from "./plugin-install-plan-BGiWDXK8.js";
import { i as resolveDiscoverableScopedChannelPluginIds } from "./channel-plugin-ids-BcTtylrM.js";
import fs from "node:fs";
import path from "node:path";
//#region src/plugins/logger.ts
function createPluginLoaderLogger(logger) {
	return {
		info: (msg) => logger.info(msg),
		warn: (msg) => logger.warn(msg),
		error: (msg) => logger.error(msg),
		debug: (msg) => logger.debug?.(msg)
	};
}
//#endregion
//#region src/commands/channel-setup/trusted-catalog.ts
function resolveEffectiveTrustConfig(cfg, env) {
	return applyPluginAutoEnable({
		config: cfg,
		env: env ?? process.env
	}).config;
}
function isTrustedWorkspaceChannelCatalogEntry(entry, cfg, env) {
	if (entry?.origin !== "workspace") return true;
	if (!entry.pluginId) return false;
	const effectiveConfig = resolveEffectiveTrustConfig(cfg, env);
	return resolveEnableState(entry.pluginId, "workspace", normalizePluginsConfig(effectiveConfig.plugins)).enabled;
}
function getTrustedChannelPluginCatalogEntry(channelId, params) {
	const candidate = getChannelPluginCatalogEntry(channelId, { workspaceDir: params.workspaceDir });
	if (isTrustedWorkspaceChannelCatalogEntry(candidate, params.cfg, params.env)) return candidate;
	return getChannelPluginCatalogEntry(channelId, {
		workspaceDir: params.workspaceDir,
		excludeWorkspace: true
	});
}
function listTrustedChannelPluginCatalogEntries(params) {
	const unfiltered = listChannelPluginCatalogEntries({ workspaceDir: params.workspaceDir });
	const fallbackById = new Map(listChannelPluginCatalogEntries({
		workspaceDir: params.workspaceDir,
		excludeWorkspace: true
	}).map((entry) => [entry.id, entry]));
	return unfiltered.flatMap((entry) => {
		if (isTrustedWorkspaceChannelCatalogEntry(entry, params.cfg, params.env)) return [entry];
		const fallback = fallbackById.get(entry.id);
		return fallback ? [fallback] : [];
	});
}
function listSetupDiscoveryChannelPluginCatalogEntries(params) {
	const unfiltered = listChannelPluginCatalogEntries({ workspaceDir: params.workspaceDir });
	const fallbackById = new Map(listChannelPluginCatalogEntries({
		workspaceDir: params.workspaceDir,
		excludeWorkspace: true
	}).map((entry) => [entry.id, entry]));
	return unfiltered.flatMap((entry) => {
		if (isTrustedWorkspaceChannelCatalogEntry(entry, params.cfg, params.env)) return [entry];
		const fallback = fallbackById.get(entry.id);
		return fallback ? [fallback] : [entry];
	});
}
//#endregion
//#region src/commands/channel-setup/plugin-install.ts
function hasGitWorkspace(workspaceDir) {
	const candidates = /* @__PURE__ */ new Set();
	candidates.add(path.join(process.cwd(), ".git"));
	if (workspaceDir && workspaceDir !== process.cwd()) candidates.add(path.join(workspaceDir, ".git"));
	for (const candidate of candidates) if (fs.existsSync(candidate)) return true;
	return false;
}
function resolveLocalPath(entry, workspaceDir, allowLocal) {
	if (!allowLocal) return null;
	const raw = entry.install.localPath?.trim();
	if (!raw) return null;
	const candidates = /* @__PURE__ */ new Set();
	candidates.add(path.resolve(process.cwd(), raw));
	if (workspaceDir && workspaceDir !== process.cwd()) candidates.add(path.resolve(workspaceDir, raw));
	for (const candidate of candidates) if (fs.existsSync(candidate)) return candidate;
	return null;
}
function addPluginLoadPath(cfg, pluginPath) {
	const existing = cfg.plugins?.load?.paths ?? [];
	const merged = Array.from(new Set([...existing, pluginPath]));
	return {
		...cfg,
		plugins: {
			...cfg.plugins,
			load: {
				...cfg.plugins?.load,
				paths: merged
			}
		}
	};
}
async function promptInstallChoice(params) {
	const { entry, localPath, prompter, defaultChoice } = params;
	const localOptions = localPath ? [{
		value: "local",
		label: "Use local plugin path",
		hint: localPath
	}] : [];
	const options = [
		{
			value: "npm",
			label: `Download from npm (${entry.install.npmSpec})`
		},
		...localOptions,
		{
			value: "skip",
			label: "Skip for now"
		}
	];
	const initialValue = defaultChoice === "local" && !localPath ? "npm" : defaultChoice;
	return await prompter.select({
		message: `Install ${entry.meta.label} plugin?`,
		options,
		initialValue
	});
}
function resolveInstallDefaultChoice(params) {
	const { cfg, entry, localPath, bundledLocalPath } = params;
	if (bundledLocalPath) return "local";
	const updateChannel = cfg.update?.channel;
	if (updateChannel === "dev") return localPath ? "local" : "npm";
	if (updateChannel === "stable" || updateChannel === "beta") return "npm";
	const entryDefault = entry.install.defaultChoice;
	if (entryDefault === "local") return localPath ? "local" : "npm";
	if (entryDefault === "npm") return "npm";
	return localPath ? "local" : "npm";
}
async function ensureChannelSetupPluginInstalled(params) {
	const { entry, prompter, runtime, workspaceDir } = params;
	let next = params.cfg;
	const allowLocal = hasGitWorkspace(workspaceDir);
	const bundledSources = resolveBundledPluginSources({ workspaceDir });
	const bundledLocalPath = resolveBundledInstallPlanForCatalogEntry({
		pluginId: entry.id,
		npmSpec: entry.install.npmSpec,
		findBundledSource: (lookup) => findBundledPluginSourceInMap({
			bundled: bundledSources,
			lookup
		})
	})?.bundledSource.localPath ?? null;
	const localPath = bundledLocalPath ?? resolveLocalPath(entry, workspaceDir, allowLocal);
	const choice = await promptInstallChoice({
		entry,
		localPath,
		defaultChoice: resolveInstallDefaultChoice({
			cfg: next,
			entry,
			localPath,
			bundledLocalPath
		}),
		prompter
	});
	if (choice === "skip") return {
		cfg: next,
		installed: false
	};
	if (choice === "local" && localPath) {
		next = addPluginLoadPath(next, localPath);
		const pluginId = entry.pluginId ?? entry.id;
		next = enablePluginInConfig(next, pluginId).config;
		return {
			cfg: next,
			installed: true,
			pluginId
		};
	}
	const result = await installPluginFromNpmSpec({
		spec: entry.install.npmSpec,
		logger: {
			info: (msg) => runtime.log?.(msg),
			warn: (msg) => runtime.log?.(msg)
		}
	});
	if (result.ok) {
		next = enablePluginInConfig(next, result.pluginId).config;
		next = recordPluginInstall(next, {
			pluginId: result.pluginId,
			source: "npm",
			spec: entry.install.npmSpec,
			installPath: result.targetDir,
			version: result.version,
			...buildNpmResolutionInstallFields(result.npmResolution)
		});
		return {
			cfg: next,
			installed: true,
			pluginId: result.pluginId
		};
	}
	await prompter.note(`Failed to install ${entry.install.npmSpec}: ${result.error}`, "Plugin install");
	if (localPath) {
		if (await prompter.confirm({
			message: `Use local plugin path instead? (${localPath})`,
			initialValue: true
		})) {
			next = addPluginLoadPath(next, localPath);
			const pluginId = entry.pluginId ?? entry.id;
			next = enablePluginInConfig(next, pluginId).config;
			return {
				cfg: next,
				installed: true,
				pluginId
			};
		}
	}
	runtime.error?.(`Plugin install failed: ${result.error}`);
	return {
		cfg: next,
		installed: false
	};
}
function loadChannelSetupPluginRegistry(params) {
	clearPluginDiscoveryCache();
	const autoEnabled = applyPluginAutoEnable({
		config: params.cfg,
		env: process.env
	});
	const resolvedConfig = autoEnabled.config;
	const workspaceDir = params.workspaceDir ?? resolveAgentWorkspaceDir(resolvedConfig, resolveDefaultAgentId(resolvedConfig));
	const log = createSubsystemLogger("plugins");
	return loadOpenClawPlugins({
		config: resolvedConfig,
		activationSourceConfig: params.cfg,
		autoEnabledReasons: autoEnabled.autoEnabledReasons,
		workspaceDir,
		cache: false,
		logger: createPluginLoaderLogger(log),
		onlyPluginIds: params.onlyPluginIds,
		includeSetupOnlyChannelPlugins: true,
		activate: params.activate
	});
}
function resolveScopedChannelPluginId(params) {
	const explicitPluginId = params.pluginId?.trim();
	if (explicitPluginId) return explicitPluginId;
	return getTrustedChannelPluginCatalogEntry(params.channel, {
		cfg: params.cfg,
		workspaceDir: params.workspaceDir
	})?.pluginId ?? resolveUniqueManifestScopedChannelPluginId(params);
}
function resolveUniqueManifestScopedChannelPluginId(params) {
	const matches = resolveDiscoverableScopedChannelPluginIds({
		config: params.cfg,
		channelIds: [params.channel],
		workspaceDir: params.workspaceDir,
		env: process.env,
		cache: false
	});
	return matches.length === 1 ? matches[0] : void 0;
}
function loadChannelSetupPluginRegistrySnapshotForChannel(params) {
	const scopedPluginId = resolveScopedChannelPluginId({
		cfg: params.cfg,
		channel: params.channel,
		pluginId: params.pluginId,
		workspaceDir: params.workspaceDir
	});
	return loadChannelSetupPluginRegistry({
		...params,
		...scopedPluginId ? { onlyPluginIds: [scopedPluginId] } : {},
		activate: false
	});
}
//#endregion
export { listTrustedChannelPluginCatalogEntries as i, loadChannelSetupPluginRegistrySnapshotForChannel as n, listSetupDiscoveryChannelPluginCatalogEntries as r, ensureChannelSetupPluginInstalled as t };
