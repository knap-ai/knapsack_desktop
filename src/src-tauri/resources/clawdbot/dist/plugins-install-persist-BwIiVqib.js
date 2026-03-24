import { r as theme } from "./theme-CdOoMzRk.js";
import { m as defaultRuntime } from "./subsystem-DISldKSB.js";
import { g as writeConfigFile } from "./io-y3Az_Onx.js";
import { c as applyExclusiveSlotSelection } from "./config-state-Br0ucqMb.js";
import { n as enablePluginInConfig } from "./provider-web-search-COZNygbd.js";
import { r as parseRegistryNpmSpec } from "./npm-registry-spec-BH5usJ-U.js";
import { t as buildNpmResolutionFields } from "./install-source-utils-C3NuFv6M.js";
import { n as recordPluginInstall } from "./installs-Qst5vOrV.js";
import { t as CLAWHUB_INSTALL_ERROR_CODE } from "./clawhub-DS9sebNq.js";
import { a as buildPluginStatusReport } from "./status-DI5hmNdJ.js";
//#region src/cli/npm-resolution.ts
function resolvePinnedNpmSpec(params) {
	const recordSpec = params.pin && params.resolvedSpec ? params.resolvedSpec : params.rawSpec;
	if (!params.pin) return { recordSpec };
	if (!params.resolvedSpec) return {
		recordSpec,
		pinWarning: "Could not resolve exact npm version for --pin; storing original npm spec."
	};
	return {
		recordSpec,
		pinNotice: `Pinned npm install record to ${params.resolvedSpec}.`
	};
}
function buildNpmInstallRecordFields(params) {
	return {
		source: "npm",
		spec: params.spec,
		installPath: params.installPath,
		version: params.version,
		...buildNpmResolutionFields(params.resolution)
	};
}
function resolvePinnedNpmInstallRecord(params) {
	const pinInfo = resolvePinnedNpmSpec({
		rawSpec: params.rawSpec,
		pin: params.pin,
		resolvedSpec: params.resolution?.resolvedSpec
	});
	logPinnedNpmSpecMessages(pinInfo, params.log, params.warn);
	return buildNpmInstallRecordFields({
		spec: pinInfo.recordSpec,
		installPath: params.installPath,
		version: params.version,
		resolution: params.resolution
	});
}
function resolvePinnedNpmInstallRecordForCli(rawSpec, pin, installPath, version, resolution, log, warnFormat) {
	return resolvePinnedNpmInstallRecord({
		rawSpec,
		pin,
		installPath,
		version,
		resolution,
		log,
		warn: (message) => log(warnFormat(message))
	});
}
function logPinnedNpmSpecMessages(pinInfo, log, logWarn) {
	if (pinInfo.pinWarning) logWarn(pinInfo.pinWarning);
	if (pinInfo.pinNotice) log(pinInfo.pinNotice);
}
//#endregion
//#region src/cli/plugins-command-helpers.ts
function resolveFileNpmSpecToLocalPath(raw) {
	const trimmed = raw.trim();
	if (!trimmed.toLowerCase().startsWith("file:")) return null;
	const rest = trimmed.slice(5);
	if (!rest) return {
		ok: false,
		error: "unsupported file: spec: missing path"
	};
	if (rest.startsWith("///")) return {
		ok: true,
		path: rest.slice(2)
	};
	if (rest.startsWith("//localhost/")) return {
		ok: true,
		path: rest.slice(11)
	};
	if (rest.startsWith("//")) return {
		ok: false,
		error: "unsupported file: URL host (expected \"file:<path>\" or \"file:///abs/path\")"
	};
	return {
		ok: true,
		path: rest
	};
}
function applySlotSelectionForPlugin(config, pluginId) {
	const report = buildPluginStatusReport({ config });
	const plugin = report.plugins.find((entry) => entry.id === pluginId);
	if (!plugin) return {
		config,
		warnings: []
	};
	const result = applyExclusiveSlotSelection({
		config,
		selectedId: plugin.id,
		selectedKind: plugin.kind,
		registry: report
	});
	return {
		config: result.config,
		warnings: result.warnings
	};
}
function createPluginInstallLogger() {
	return {
		info: (msg) => defaultRuntime.log(msg),
		warn: (msg) => defaultRuntime.log(theme.warn(msg))
	};
}
function createHookPackInstallLogger() {
	return {
		info: (msg) => defaultRuntime.log(msg),
		warn: (msg) => defaultRuntime.log(theme.warn(msg))
	};
}
function enableInternalHookEntries(config, hookNames) {
	const entries = { ...config.hooks?.internal?.entries };
	for (const hookName of hookNames) entries[hookName] = {
		...entries[hookName],
		enabled: true
	};
	return {
		...config,
		hooks: {
			...config.hooks,
			internal: {
				...config.hooks?.internal,
				enabled: true,
				entries
			}
		}
	};
}
function extractInstalledNpmPackageName(install) {
	if (install.source !== "npm") return;
	const resolvedName = install.resolvedName?.trim();
	if (resolvedName) return resolvedName;
	return (install.spec ? parseRegistryNpmSpec(install.spec)?.name : void 0) ?? (install.resolvedSpec ? parseRegistryNpmSpec(install.resolvedSpec)?.name : void 0);
}
function extractInstalledNpmHookPackageName(install) {
	const resolvedName = install.resolvedName?.trim();
	if (resolvedName) return resolvedName;
	return (install.spec ? parseRegistryNpmSpec(install.spec)?.name : void 0) ?? (install.resolvedSpec ? parseRegistryNpmSpec(install.resolvedSpec)?.name : void 0);
}
function formatPluginInstallWithHookFallbackError(pluginError, hookError) {
	return `${pluginError}\nAlso not a valid hook pack: ${hookError}`;
}
function logHookPackRestartHint() {
	defaultRuntime.log("Restart the gateway to load hooks.");
}
function logSlotWarnings(warnings) {
	if (warnings.length === 0) return;
	for (const warning of warnings) defaultRuntime.log(theme.warn(warning));
}
function buildPreferredClawHubSpec(raw) {
	const parsed = parseRegistryNpmSpec(raw);
	if (!parsed) return null;
	return `clawhub:${parsed.name}${parsed.selector ? `@${parsed.selector}` : ""}`;
}
const PREFERRED_CLAWHUB_FALLBACK_DECISION = {
	FALLBACK_TO_NPM: "fallback_to_npm",
	STOP: "stop"
};
function decidePreferredClawHubFallback(params) {
	if (params.code === CLAWHUB_INSTALL_ERROR_CODE.PACKAGE_NOT_FOUND || params.code === CLAWHUB_INSTALL_ERROR_CODE.VERSION_NOT_FOUND) return PREFERRED_CLAWHUB_FALLBACK_DECISION.FALLBACK_TO_NPM;
	return PREFERRED_CLAWHUB_FALLBACK_DECISION.STOP;
}
//#endregion
//#region src/hooks/installs.ts
function recordHookInstall(cfg, update) {
	const { hookId, ...record } = update;
	const installs = {
		...cfg.hooks?.internal?.installs,
		[hookId]: {
			...cfg.hooks?.internal?.installs?.[hookId],
			...record,
			installedAt: record.installedAt ?? (/* @__PURE__ */ new Date()).toISOString()
		}
	};
	return {
		...cfg,
		hooks: {
			...cfg.hooks,
			internal: {
				...cfg.hooks?.internal,
				installs: {
					...installs,
					[hookId]: installs[hookId]
				}
			}
		}
	};
}
//#endregion
//#region src/cli/plugins-install-persist.ts
async function persistPluginInstall(params) {
	let next = enablePluginInConfig(params.config, params.pluginId).config;
	next = recordPluginInstall(next, {
		pluginId: params.pluginId,
		...params.install
	});
	const slotResult = applySlotSelectionForPlugin(next, params.pluginId);
	next = slotResult.config;
	await writeConfigFile(next);
	logSlotWarnings(slotResult.warnings);
	if (params.warningMessage) defaultRuntime.log(theme.warn(params.warningMessage));
	defaultRuntime.log(params.successMessage ?? `Installed plugin: ${params.pluginId}`);
	defaultRuntime.log("Restart the gateway to load plugins.");
	return next;
}
async function persistHookPackInstall(params) {
	let next = enableInternalHookEntries(params.config, params.hooks);
	next = recordHookInstall(next, {
		hookId: params.hookPackId,
		hooks: params.hooks,
		...params.install
	});
	await writeConfigFile(next);
	defaultRuntime.log(params.successMessage ?? `Installed hook pack: ${params.hookPackId}`);
	logHookPackRestartHint();
	return next;
}
//#endregion
export { buildPreferredClawHubSpec as a, decidePreferredClawHubFallback as c, formatPluginInstallWithHookFallbackError as d, logSlotWarnings as f, resolvePinnedNpmInstallRecordForCli as h, applySlotSelectionForPlugin as i, extractInstalledNpmHookPackageName as l, buildNpmInstallRecordFields as m, persistPluginInstall as n, createHookPackInstallLogger as o, resolveFileNpmSpecToLocalPath as p, recordHookInstall as r, createPluginInstallLogger as s, persistHookPackInstall as t, extractInstalledNpmPackageName as u };
