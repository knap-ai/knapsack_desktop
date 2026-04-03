import { u as isRecord } from "./utils-CE3P21nG.js";
import { i as openBoundaryFileSync } from "./boundary-file-read-LPHTYrMX.js";
import { d as mergeBundlePathLists, f as normalizeBundlePathList, o as CLAUDE_BUNDLE_MANIFEST_RELATIVE_PATH } from "./min-host-version-B_bhUtXS.js";
import { t as applyMergePatch } from "./merge-patch-B__RZvcw.js";
import { d as readBundleJsonObject, l as inspectBundleServerRuntimeSupport, u as loadEnabledBundleConfig } from "./loader-BkOjign1.js";
import fsSync from "node:fs";
import path from "node:path";
//#region src/plugins/bundle-lsp.ts
const MANIFEST_PATH_BY_FORMAT = { claude: CLAUDE_BUNDLE_MANIFEST_RELATIVE_PATH };
function extractLspServerMap(raw) {
	if (!isRecord(raw)) return {};
	const nested = isRecord(raw.lspServers) ? raw.lspServers : raw;
	if (!isRecord(nested)) return {};
	const result = {};
	for (const [serverName, serverRaw] of Object.entries(nested)) {
		if (!isRecord(serverRaw)) continue;
		result[serverName] = { ...serverRaw };
	}
	return result;
}
function resolveBundleLspConfigPaths(params) {
	const declared = normalizeBundlePathList(params.raw.lspServers);
	return mergeBundlePathLists(fsSync.existsSync(path.join(params.rootDir, ".lsp.json")) ? [".lsp.json"] : [], declared);
}
function loadBundleLspConfigFile(params) {
	const opened = openBoundaryFileSync({
		absolutePath: path.resolve(params.rootDir, params.relativePath),
		rootPath: params.rootDir,
		boundaryLabel: "plugin root",
		rejectHardlinks: true
	});
	if (!opened.ok) return { lspServers: {} };
	try {
		if (!fsSync.fstatSync(opened.fd).isFile()) return { lspServers: {} };
		return { lspServers: extractLspServerMap(JSON.parse(fsSync.readFileSync(opened.fd, "utf-8"))) };
	} finally {
		fsSync.closeSync(opened.fd);
	}
}
function loadBundleLspConfig(params) {
	const manifestRelativePath = MANIFEST_PATH_BY_FORMAT[params.bundleFormat];
	if (!manifestRelativePath) return {
		config: { lspServers: {} },
		diagnostics: []
	};
	const manifestLoaded = readBundleJsonObject({
		rootDir: params.rootDir,
		relativePath: manifestRelativePath
	});
	if (!manifestLoaded.ok) return {
		config: { lspServers: {} },
		diagnostics: [manifestLoaded.error]
	};
	let merged = { lspServers: {} };
	const filePaths = resolveBundleLspConfigPaths({
		raw: manifestLoaded.raw,
		rootDir: params.rootDir
	});
	for (const relativePath of filePaths) merged = applyMergePatch(merged, loadBundleLspConfigFile({
		rootDir: params.rootDir,
		relativePath
	}));
	return {
		config: merged,
		diagnostics: []
	};
}
function inspectBundleLspRuntimeSupport(params) {
	const support = inspectBundleServerRuntimeSupport({
		loaded: loadBundleLspConfig(params),
		resolveServers: (config) => config.lspServers
	});
	return {
		hasStdioServer: support.hasSupportedServer,
		supportedServerNames: support.supportedServerNames,
		unsupportedServerNames: support.unsupportedServerNames,
		diagnostics: support.diagnostics
	};
}
function loadEnabledBundleLspConfig(params) {
	return loadEnabledBundleConfig({
		workspaceDir: params.workspaceDir,
		cfg: params.cfg,
		createEmptyConfig: () => ({ lspServers: {} }),
		loadBundleConfig: loadBundleLspConfig,
		createDiagnostic: (pluginId, message) => ({
			pluginId,
			message
		})
	});
}
//#endregion
export { loadEnabledBundleLspConfig as n, inspectBundleLspRuntimeSupport as t };
