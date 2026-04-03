import { u as isRecord } from "./utils-CE3P21nG.js";
import { n as defaultSlotIdForKey } from "./slots-u5aMXqtV.js";
import { t as formatCliCommand } from "./command-format-CkCGNdQh.js";
import { a as detectLegacyMatrixState, i as autoMigrateLegacyMatrixState, n as hasPendingMatrixMigration, o as autoPrepareLegacyMatrixCrypto, r as maybeCreateMatrixMigrationSnapshot, s as detectLegacyMatrixCrypto, t as hasActionableMatrixMigration } from "./matrix-migration-snapshot-DkdZAARe.js";
import { r as resolveBundledPluginInstallCommandHint } from "./bundled-sources-B9i5z3_o.js";
import { a as resolvePluginInstallDir } from "./install-V93VXjQN.js";
import { n as formatPluginInstallPathIssue, t as detectPluginInstallPathIssue } from "./plugin-install-path-warnings-C7V28uRc.js";
import path from "node:path";
import fs from "node:fs/promises";
//#region src/plugins/uninstall.ts
function resolveUninstallDirectoryTarget(params) {
	if (!params.hasInstall) return null;
	if (params.installRecord?.source === "path") return null;
	let defaultPath;
	try {
		defaultPath = resolvePluginInstallDir(params.pluginId, params.extensionsDir);
	} catch {
		return null;
	}
	const configuredPath = params.installRecord?.installPath;
	if (!configuredPath) return defaultPath;
	if (path.resolve(configuredPath) === path.resolve(defaultPath)) return configuredPath;
	return defaultPath;
}
const SHARED_CHANNEL_CONFIG_KEYS = new Set(["defaults", "modelByChannel"]);
/**
* Resolve the channel config keys owned by a plugin during uninstall.
* - `channelIds === undefined`: fall back to the plugin id for backward compatibility.
* - `channelIds === []`: explicit "owns no channels" signal; remove nothing.
*/
function resolveUninstallChannelConfigKeys(pluginId, opts) {
	const rawKeys = opts?.channelIds ?? [pluginId];
	const seen = /* @__PURE__ */ new Set();
	const keys = [];
	for (const key of rawKeys) {
		if (SHARED_CHANNEL_CONFIG_KEYS.has(key) || seen.has(key)) continue;
		seen.add(key);
		keys.push(key);
	}
	return keys;
}
/**
* Remove plugin references from config (pure config mutation).
* Returns a new config with the plugin removed from entries, installs, allow, load.paths, slots,
* and owned channel config.
*/
function removePluginFromConfig(cfg, pluginId, opts) {
	const actions = {
		entry: false,
		install: false,
		allowlist: false,
		loadPath: false,
		memorySlot: false,
		channelConfig: false
	};
	const pluginsConfig = cfg.plugins ?? {};
	let entries = pluginsConfig.entries;
	if (entries && pluginId in entries) {
		const { [pluginId]: _, ...rest } = entries;
		entries = Object.keys(rest).length > 0 ? rest : void 0;
		actions.entry = true;
	}
	let installs = pluginsConfig.installs;
	const installRecord = installs?.[pluginId];
	if (installs && pluginId in installs) {
		const { [pluginId]: _, ...rest } = installs;
		installs = Object.keys(rest).length > 0 ? rest : void 0;
		actions.install = true;
	}
	let allow = pluginsConfig.allow;
	if (Array.isArray(allow) && allow.includes(pluginId)) {
		allow = allow.filter((id) => id !== pluginId);
		if (allow.length === 0) allow = void 0;
		actions.allowlist = true;
	}
	let load = pluginsConfig.load;
	if (installRecord?.source === "path" && installRecord.sourcePath) {
		const sourcePath = installRecord.sourcePath;
		const loadPaths = load?.paths;
		if (Array.isArray(loadPaths) && loadPaths.includes(sourcePath)) {
			const nextLoadPaths = loadPaths.filter((p) => p !== sourcePath);
			load = nextLoadPaths.length > 0 ? {
				...load,
				paths: nextLoadPaths
			} : void 0;
			actions.loadPath = true;
		}
	}
	let slots = pluginsConfig.slots;
	if (slots?.memory === pluginId) {
		slots = {
			...slots,
			memory: defaultSlotIdForKey("memory")
		};
		actions.memorySlot = true;
	}
	if (slots && Object.keys(slots).length === 0) slots = void 0;
	const cleanedPlugins = {
		...pluginsConfig,
		entries,
		installs,
		allow,
		load,
		slots
	};
	if (cleanedPlugins.entries === void 0) delete cleanedPlugins.entries;
	if (cleanedPlugins.installs === void 0) delete cleanedPlugins.installs;
	if (cleanedPlugins.allow === void 0) delete cleanedPlugins.allow;
	if (cleanedPlugins.load === void 0) delete cleanedPlugins.load;
	if (cleanedPlugins.slots === void 0) delete cleanedPlugins.slots;
	const hasInstallRecord = Object.hasOwn(cfg.plugins?.installs ?? {}, pluginId);
	let channels = cfg.channels;
	if (hasInstallRecord && channels) for (const key of resolveUninstallChannelConfigKeys(pluginId, opts)) {
		if (!Object.hasOwn(channels, key)) continue;
		const { [key]: _removed, ...rest } = channels;
		channels = Object.keys(rest).length > 0 ? rest : void 0;
		actions.channelConfig = true;
		if (!channels) break;
	}
	return {
		config: {
			...cfg,
			plugins: Object.keys(cleanedPlugins).length > 0 ? cleanedPlugins : void 0,
			channels
		},
		actions
	};
}
/**
* Uninstall a plugin by removing it from config and optionally deleting installed files.
* Linked plugins (source === "path") never have their source directory deleted.
*/
async function uninstallPlugin(params) {
	const { config, pluginId, channelIds, deleteFiles = true, extensionsDir } = params;
	const hasEntry = pluginId in (config.plugins?.entries ?? {});
	const hasInstall = pluginId in (config.plugins?.installs ?? {});
	if (!hasEntry && !hasInstall) return {
		ok: false,
		error: `Plugin not found: ${pluginId}`
	};
	const installRecord = config.plugins?.installs?.[pluginId];
	const isLinked = installRecord?.source === "path";
	const { config: newConfig, actions: configActions } = removePluginFromConfig(config, pluginId, { channelIds });
	const actions = {
		...configActions,
		directory: false
	};
	const warnings = [];
	const deleteTarget = deleteFiles && !isLinked ? resolveUninstallDirectoryTarget({
		pluginId,
		hasInstall,
		installRecord,
		extensionsDir
	}) : null;
	if (deleteTarget) {
		const existed = await fs.access(deleteTarget).then(() => true).catch(() => false) ?? false;
		try {
			await fs.rm(deleteTarget, {
				recursive: true,
				force: true
			});
			actions.directory = existed;
		} catch (error) {
			warnings.push(`Failed to remove plugin directory ${deleteTarget}: ${error instanceof Error ? error.message : String(error)}`);
		}
	}
	return {
		ok: true,
		config: newConfig,
		pluginId,
		actions,
		warnings
	};
}
//#endregion
//#region src/commands/doctor/providers/matrix.ts
function formatMatrixLegacyStatePreview(detection) {
	return [
		"- Matrix plugin upgraded in place.",
		`- Legacy sync store: ${detection.legacyStoragePath} -> ${detection.targetStoragePath}`,
		`- Legacy crypto store: ${detection.legacyCryptoPath} -> ${detection.targetCryptoPath}`,
		...detection.selectionNote ? [`- ${detection.selectionNote}`] : [],
		"- Run \"openclaw doctor --fix\" to migrate this Matrix state now."
	].join("\n");
}
function formatMatrixLegacyCryptoPreview(detection) {
	const notes = [];
	for (const warning of detection.warnings) notes.push(`- ${warning}`);
	for (const plan of detection.plans) notes.push([
		`- Matrix encrypted-state migration is pending for account "${plan.accountId}".`,
		`- Legacy crypto store: ${plan.legacyCryptoPath}`,
		`- New recovery key file: ${plan.recoveryKeyPath}`,
		`- Migration state file: ${plan.statePath}`,
		"- Run \"openclaw doctor --fix\" to extract any saved backup key now. Backed-up room keys will restore automatically on next gateway start."
	].join("\n"));
	return notes;
}
async function collectMatrixInstallPathWarnings(cfg) {
	const issue = await detectPluginInstallPathIssue({
		pluginId: "matrix",
		install: cfg.plugins?.installs?.matrix
	});
	if (!issue) return [];
	return formatPluginInstallPathIssue({
		issue,
		pluginLabel: "Matrix",
		defaultInstallCommand: "openclaw plugins install @openclaw/matrix",
		repoInstallCommand: resolveBundledPluginInstallCommandHint({
			pluginId: "matrix",
			workspaceDir: process.cwd()
		}),
		formatCommand: formatCliCommand
	}).map((entry) => `- ${entry}`);
}
function hasConfiguredMatrixChannel(cfg) {
	const channels = cfg.channels;
	return isRecord(channels?.matrix);
}
function hasConfiguredMatrixPluginSurface(cfg) {
	return Boolean(cfg.plugins?.installs?.matrix || cfg.plugins?.entries?.matrix || cfg.plugins?.allow?.includes("matrix") || cfg.plugins?.deny?.includes("matrix"));
}
function hasConfiguredMatrixEnv(env) {
	return Object.entries(env).some(([key, value]) => key.startsWith("MATRIX_") && typeof value === "string" && value.trim());
}
function configMayNeedMatrixDoctorSequence(cfg, env) {
	return hasConfiguredMatrixChannel(cfg) || hasConfiguredMatrixPluginSurface(cfg) || hasConfiguredMatrixEnv(env);
}
/**
* Produces a config mutation that removes stale Matrix plugin install/load-path
* references left behind by the old bundled-plugin layout.  When the install
* record points to a path that no longer exists on disk the config entry blocks
* validation, so removing it lets reinstall proceed cleanly.
*/
async function cleanStaleMatrixPluginConfig(cfg) {
	const issue = await detectPluginInstallPathIssue({
		pluginId: "matrix",
		install: cfg.plugins?.installs?.matrix
	});
	if (!issue || issue.kind !== "missing-path") return {
		config: cfg,
		changes: []
	};
	const { config, actions } = removePluginFromConfig(cfg, "matrix");
	const removed = [];
	if (actions.install) removed.push("install record");
	if (actions.loadPath) removed.push("load path");
	if (actions.entry) removed.push("plugin entry");
	if (actions.allowlist) removed.push("allowlist entry");
	if (removed.length === 0) return {
		config: cfg,
		changes: []
	};
	return {
		config,
		changes: [`Removed stale Matrix plugin references (${removed.join(", ")}). The previous install path no longer exists: ${issue.path}`]
	};
}
async function applyMatrixDoctorRepair(params) {
	const changes = [];
	const warnings = [];
	const pendingMatrixMigration = hasPendingMatrixMigration({
		cfg: params.cfg,
		env: params.env
	});
	const actionableMatrixMigration = hasActionableMatrixMigration({
		cfg: params.cfg,
		env: params.env
	});
	let matrixSnapshotReady = true;
	if (actionableMatrixMigration) try {
		const snapshot = await maybeCreateMatrixMigrationSnapshot({
			trigger: "doctor-fix",
			env: params.env
		});
		changes.push(`Matrix migration snapshot ${snapshot.created ? "created" : "reused"} before applying Matrix upgrades.\n- ${snapshot.archivePath}`);
	} catch (err) {
		matrixSnapshotReady = false;
		warnings.push(`- Failed creating a Matrix migration snapshot before repair: ${String(err)}`);
		warnings.push("- Skipping Matrix migration changes for now. Resolve the snapshot failure, then rerun \"openclaw doctor --fix\".");
	}
	else if (pendingMatrixMigration) warnings.push("- Matrix migration warnings are present, but no on-disk Matrix mutation is actionable yet. No pre-migration snapshot was needed.");
	if (!matrixSnapshotReady) return {
		changes,
		warnings
	};
	const matrixStateRepair = await autoMigrateLegacyMatrixState({
		cfg: params.cfg,
		env: params.env
	});
	if (matrixStateRepair.changes.length > 0) changes.push([
		"Matrix plugin upgraded in place.",
		...matrixStateRepair.changes.map((entry) => `- ${entry}`),
		"- No user action required."
	].join("\n"));
	if (matrixStateRepair.warnings.length > 0) warnings.push(matrixStateRepair.warnings.map((entry) => `- ${entry}`).join("\n"));
	const matrixCryptoRepair = await autoPrepareLegacyMatrixCrypto({
		cfg: params.cfg,
		env: params.env
	});
	if (matrixCryptoRepair.changes.length > 0) changes.push(["Matrix encrypted-state migration prepared.", ...matrixCryptoRepair.changes.map((entry) => `- ${entry}`)].join("\n"));
	if (matrixCryptoRepair.warnings.length > 0) warnings.push(matrixCryptoRepair.warnings.map((entry) => `- ${entry}`).join("\n"));
	return {
		changes,
		warnings
	};
}
async function runMatrixDoctorSequence(params) {
	const warningNotes = [];
	const changeNotes = [];
	const matrixInstallWarnings = await collectMatrixInstallPathWarnings(params.cfg);
	if (matrixInstallWarnings.length > 0) warningNotes.push(matrixInstallWarnings.join("\n"));
	if (!configMayNeedMatrixDoctorSequence(params.cfg, params.env)) return {
		changeNotes,
		warningNotes
	};
	const matrixLegacyState = detectLegacyMatrixState({
		cfg: params.cfg,
		env: params.env
	});
	const matrixLegacyCrypto = detectLegacyMatrixCrypto({
		cfg: params.cfg,
		env: params.env
	});
	if (params.shouldRepair) {
		const matrixRepair = await applyMatrixDoctorRepair({
			cfg: params.cfg,
			env: params.env
		});
		changeNotes.push(...matrixRepair.changes);
		warningNotes.push(...matrixRepair.warnings);
	} else if (matrixLegacyState) if ("warning" in matrixLegacyState) warningNotes.push(`- ${matrixLegacyState.warning}`);
	else warningNotes.push(formatMatrixLegacyStatePreview(matrixLegacyState));
	if (!params.shouldRepair && (matrixLegacyCrypto.warnings.length > 0 || matrixLegacyCrypto.plans.length > 0)) warningNotes.push(...formatMatrixLegacyCryptoPreview(matrixLegacyCrypto));
	return {
		changeNotes,
		warningNotes
	};
}
//#endregion
export { uninstallPlugin as a, resolveUninstallDirectoryTarget as i, runMatrixDoctorSequence as n, resolveUninstallChannelConfigKeys as r, cleanStaleMatrixPluginConfig as t };
