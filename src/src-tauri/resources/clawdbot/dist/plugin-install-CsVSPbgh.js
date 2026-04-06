import { t as createSubsystemLogger } from "./subsystem-CJEvHE2o.js";
import { m as resolveDefaultAgentId, p as resolveAgentWorkspaceDir } from "./agent-scope-CYXg_wTS.js";
import "./runtime-DZz1f0_h.js";
import { n as loadPluginManifestRegistry, r as clearPluginDiscoveryCache } from "./manifest-registry-BSmqODu2.js";
import { t as applyPluginAutoEnable } from "./plugin-auto-enable-CqpAn9Qh.js";
import { n as loadOpenClawPlugins } from "./loader-BkOjign1.js";
import { t as createPluginLoaderLogger } from "./logger-D1mGp2bM.js";
import { t as enablePluginInConfig } from "./enable-CpDMTfhy.js";
import { i as resolveBundledPluginSources, n as findBundledPluginSourceInMap } from "./bundled-sources-B9i5z3_o.js";
import { r as installPluginFromNpmSpec } from "./install-V93VXjQN.js";
import { n as recordPluginInstall, t as buildNpmResolutionInstallFields } from "./installs-CroOEF35.js";
import { n as getChannelPluginCatalogEntry } from "./catalog-CAEFn2QM.js";
import { n as resolveBundledInstallPlanForCatalogEntry } from "./plugin-install-plan-CMVAuqHP.js";
import fsSync from "node:fs";
import path from "node:path";
//#region src/commands/channel-setup/plugin-install.ts
function hasGitWorkspace(workspaceDir) {
	const candidates = /* @__PURE__ */ new Set();
	candidates.add(path.join(process.cwd(), ".git"));
	if (workspaceDir && workspaceDir !== process.cwd()) candidates.add(path.join(workspaceDir, ".git"));
	for (const candidate of candidates) if (fsSync.existsSync(candidate)) return true;
	return false;
}
function resolveLocalPath(entry, workspaceDir, allowLocal) {
	if (!allowLocal) return null;
	const raw = entry.install.localPath?.trim();
	if (!raw) return null;
	const candidates = /* @__PURE__ */ new Set();
	candidates.add(path.resolve(process.cwd(), raw));
	if (workspaceDir && workspaceDir !== process.cwd()) candidates.add(path.resolve(workspaceDir, raw));
	for (const candidate of candidates) if (fsSync.existsSync(candidate)) return candidate;
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
	return getChannelPluginCatalogEntry(params.channel, { workspaceDir: params.workspaceDir })?.pluginId ?? resolveUniqueManifestScopedChannelPluginId(params);
}
function resolveUniqueManifestScopedChannelPluginId(params) {
	const matches = loadPluginManifestRegistry({
		config: params.cfg,
		workspaceDir: params.workspaceDir,
		cache: false,
		env: process.env
	}).plugins.filter((plugin) => plugin.channels.includes(params.channel));
	return matches.length === 1 ? matches[0]?.id : void 0;
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
export { loadChannelSetupPluginRegistrySnapshotForChannel as n, ensureChannelSetupPluginInstalled as t };
