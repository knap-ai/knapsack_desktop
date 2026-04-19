import { i as normalizeLowercaseStringOrEmpty } from "./string-coerce-BUSzWgUA.js";
import { n as defaultRuntime } from "./runtime-Dx7oeLYq.js";
import { r as theme } from "./theme-D5sxSdHD.js";
import { t as applyExclusiveSlotSelection } from "./slots-MFUVcT3n.js";
import { r as parseRegistryNpmSpec } from "./npm-registry-spec-DAd5Xcsy.js";
import { t as CLAWHUB_INSTALL_ERROR_CODE } from "./clawhub-DAOMs4kO.js";
import { i as buildPluginDiagnosticsReport } from "./status-Cm4w2zCk.js";
//#region src/cli/plugins-install-records.ts
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
//#endregion
//#region src/cli/plugins-command-helpers.ts
function resolveFileNpmSpecToLocalPath(raw) {
	const trimmed = raw.trim();
	if (!normalizeLowercaseStringOrEmpty(trimmed).startsWith("file:")) return null;
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
	const report = buildPluginDiagnosticsReport({ config });
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
export { decidePreferredClawHubFallback as a, logHookPackRestartHint as c, extractInstalledNpmHookPackageName as d, extractInstalledNpmPackageName as f, createPluginInstallLogger as i, logSlotWarnings as l, buildPreferredClawHubSpec as n, enableInternalHookEntries as o, createHookPackInstallLogger as r, formatPluginInstallWithHookFallbackError as s, applySlotSelectionForPlugin as t, resolveFileNpmSpecToLocalPath as u };
