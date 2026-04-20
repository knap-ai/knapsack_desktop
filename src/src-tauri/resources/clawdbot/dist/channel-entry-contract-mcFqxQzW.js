import { i as normalizeLowercaseStringOrEmpty } from "./string-coerce-BUSzWgUA.js";
import { i as openBoundaryFileSync } from "./boundary-file-read-DXLy_w6L.js";
import { a as emptyChannelConfigSchema } from "./config-schema-sgVTuroC.js";
import { l as resolveLoaderPackageRoot } from "./sdk-alias-w29OTN9p.js";
import { t as getCachedPluginJitiLoader } from "./jiti-loader-cache-D_0TILck.js";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import path from "node:path";
//#region src/plugin-sdk/channel-entry-contract.ts
const nodeRequire = createRequire(import.meta.url);
const jitiLoaders = /* @__PURE__ */ new Map();
const loadedModuleExports = /* @__PURE__ */ new Map();
const disableBundledEntrySourceFallbackEnv = "OPENCLAW_DISABLE_BUNDLED_ENTRY_SOURCE_FALLBACK";
function isTruthyEnvFlag(value) {
	return value !== void 0 && !/^(?:0|false)$/iu.test(value.trim());
}
function resolveSpecifierCandidates(modulePath) {
	const ext = normalizeLowercaseStringOrEmpty(path.extname(modulePath));
	if (ext === ".js") return [modulePath, modulePath.slice(0, -3) + ".ts"];
	if (ext === ".mjs") return [modulePath, modulePath.slice(0, -4) + ".mts"];
	if (ext === ".cjs") return [modulePath, modulePath.slice(0, -4) + ".cts"];
	return [modulePath];
}
function resolveEntryBoundaryRoot(importMetaUrl) {
	return path.dirname(fileURLToPath(importMetaUrl));
}
function addBundledEntryCandidates(candidates, basePath, boundaryRoot) {
	for (const candidate of resolveSpecifierCandidates(basePath)) {
		if (candidates.some((entry) => entry.path === candidate && entry.boundaryRoot === boundaryRoot)) continue;
		candidates.push({
			path: candidate,
			boundaryRoot
		});
	}
}
function resolveBundledEntryModuleCandidates(importMetaUrl, specifier) {
	const importerPath = fileURLToPath(importMetaUrl);
	const importerDir = path.dirname(importerPath);
	const boundaryRoot = resolveEntryBoundaryRoot(importMetaUrl);
	const candidates = [];
	addBundledEntryCandidates(candidates, path.resolve(importerDir, specifier), boundaryRoot);
	const sourceRelativeSpecifier = specifier.replace(/^\.\/src\//u, "./");
	if (sourceRelativeSpecifier !== specifier) addBundledEntryCandidates(candidates, path.resolve(importerDir, sourceRelativeSpecifier), boundaryRoot);
	const packageRoot = resolveLoaderPackageRoot({
		modulePath: importerPath,
		moduleUrl: importMetaUrl,
		cwd: importerDir,
		argv1: process.argv[1]
	});
	if (!packageRoot) return candidates;
	const distExtensionsRoot = path.join(packageRoot, "dist", "extensions") + path.sep;
	if (!importerPath.startsWith(distExtensionsRoot)) return candidates;
	if (isTruthyEnvFlag(process.env[disableBundledEntrySourceFallbackEnv])) return candidates;
	const pluginDirName = path.basename(importerDir);
	const sourcePluginRoot = path.join(packageRoot, "extensions", pluginDirName);
	if (sourcePluginRoot === boundaryRoot) return candidates;
	addBundledEntryCandidates(candidates, path.resolve(sourcePluginRoot, specifier), sourcePluginRoot);
	if (sourceRelativeSpecifier !== specifier) addBundledEntryCandidates(candidates, path.resolve(sourcePluginRoot, sourceRelativeSpecifier), sourcePluginRoot);
	return candidates;
}
function formatBundledEntryUnknownError(error) {
	if (typeof error === "string") return error;
	if (error === void 0) return "boundary validation failed";
	try {
		return JSON.stringify(error);
	} catch {
		return "non-serializable error";
	}
}
function formatBundledEntryModuleOpenFailure(params) {
	const importerPath = fileURLToPath(params.importMetaUrl);
	const errorDetail = params.failure.error instanceof Error ? params.failure.error.message : formatBundledEntryUnknownError(params.failure.error);
	return [
		`bundled plugin entry "${params.specifier}" failed to open`,
		`from "${importerPath}"`,
		`(resolved "${params.resolvedPath}", plugin root "${params.boundaryRoot}",`,
		`reason "${params.failure.reason}"): ${errorDetail}`
	].join(" ");
}
function resolveBundledEntryModulePath(importMetaUrl, specifier) {
	const candidates = resolveBundledEntryModuleCandidates(importMetaUrl, specifier);
	const fallbackCandidate = candidates[0] ?? {
		path: path.resolve(path.dirname(fileURLToPath(importMetaUrl)), specifier),
		boundaryRoot: resolveEntryBoundaryRoot(importMetaUrl)
	};
	let firstFailure = null;
	for (const candidate of candidates) {
		const opened = openBoundaryFileSync({
			absolutePath: candidate.path,
			rootPath: candidate.boundaryRoot,
			boundaryLabel: "plugin root",
			rejectHardlinks: false,
			skipLexicalRootCheck: true
		});
		if (opened.ok) {
			fs.closeSync(opened.fd);
			return opened.path;
		}
		firstFailure ??= {
			candidate,
			failure: opened
		};
	}
	const failure = firstFailure;
	if (!failure) throw new Error(formatBundledEntryModuleOpenFailure({
		importMetaUrl,
		specifier,
		resolvedPath: fallbackCandidate.path,
		boundaryRoot: fallbackCandidate.boundaryRoot,
		failure: {
			ok: false,
			reason: "path",
			error: /* @__PURE__ */ new Error(`ENOENT: no such file or directory, lstat '${fallbackCandidate.path}'`)
		}
	}));
	throw new Error(formatBundledEntryModuleOpenFailure({
		importMetaUrl,
		specifier,
		resolvedPath: failure.candidate.path,
		boundaryRoot: failure.candidate.boundaryRoot,
		failure: failure.failure
	}));
}
function getJiti(modulePath) {
	return getCachedPluginJitiLoader({
		cache: jitiLoaders,
		modulePath,
		importerUrl: import.meta.url,
		preferBuiltDist: true,
		jitiFilename: import.meta.url
	});
}
function loadBundledEntryModuleSync(importMetaUrl, specifier) {
	const modulePath = resolveBundledEntryModulePath(importMetaUrl, specifier);
	const cached = loadedModuleExports.get(modulePath);
	if (cached !== void 0) return cached;
	let loaded;
	if (process.platform === "win32" && modulePath.includes(`${path.sep}dist${path.sep}`) && [
		".js",
		".mjs",
		".cjs"
	].includes(normalizeLowercaseStringOrEmpty(path.extname(modulePath)))) try {
		loaded = nodeRequire(modulePath);
	} catch {
		loaded = getJiti(modulePath)(modulePath);
	}
	else loaded = getJiti(modulePath)(modulePath);
	loadedModuleExports.set(modulePath, loaded);
	return loaded;
}
function loadBundledEntryExportSync(importMetaUrl, reference) {
	const loaded = loadBundledEntryModuleSync(importMetaUrl, reference.specifier);
	const resolved = loaded && typeof loaded === "object" && "default" in loaded ? loaded.default : loaded;
	if (!reference.exportName) return resolved;
	const record = resolved ?? loaded;
	if (!record || !(reference.exportName in record)) throw new Error(`missing export "${reference.exportName}" from bundled entry module ${reference.specifier}`);
	return record[reference.exportName];
}
function defineBundledChannelEntry({ id, name, description, importMetaUrl, plugin, secrets, configSchema, runtime, accountInspect, features, registerCliMetadata, registerFull }) {
	const resolvedConfigSchema = typeof configSchema === "function" ? configSchema() : configSchema ?? emptyChannelConfigSchema();
	const loadChannelPlugin = () => loadBundledEntryExportSync(importMetaUrl, plugin);
	const loadChannelSecrets = secrets ? () => loadBundledEntryExportSync(importMetaUrl, secrets) : void 0;
	const loadChannelAccountInspector = accountInspect ? () => loadBundledEntryExportSync(importMetaUrl, accountInspect) : void 0;
	const setChannelRuntime = runtime ? (pluginRuntime) => {
		loadBundledEntryExportSync(importMetaUrl, runtime)(pluginRuntime);
	} : void 0;
	return {
		kind: "bundled-channel-entry",
		id,
		name,
		description,
		configSchema: resolvedConfigSchema,
		...features || accountInspect ? { features: {
			...features,
			...accountInspect ? { accountInspect: true } : {}
		} } : {},
		register(api) {
			if (api.registrationMode === "cli-metadata") {
				registerCliMetadata?.(api);
				return;
			}
			setChannelRuntime?.(api.runtime);
			api.registerChannel({ plugin: loadChannelPlugin() });
			if (api.registrationMode !== "full") return;
			registerCliMetadata?.(api);
			registerFull?.(api);
		},
		loadChannelPlugin,
		...loadChannelSecrets ? { loadChannelSecrets } : {},
		...loadChannelAccountInspector ? { loadChannelAccountInspector } : {},
		...setChannelRuntime ? { setChannelRuntime } : {}
	};
}
function defineBundledChannelSetupEntry({ importMetaUrl, plugin, secrets, runtime, features }) {
	const setChannelRuntime = runtime ? (pluginRuntime) => {
		loadBundledEntryExportSync(importMetaUrl, runtime)(pluginRuntime);
	} : void 0;
	return {
		kind: "bundled-channel-setup-entry",
		loadSetupPlugin: () => loadBundledEntryExportSync(importMetaUrl, plugin),
		...secrets ? { loadSetupSecrets: () => loadBundledEntryExportSync(importMetaUrl, secrets) } : {},
		...setChannelRuntime ? { setChannelRuntime } : {},
		...features ? { features } : {}
	};
}
//#endregion
export { defineBundledChannelSetupEntry as n, loadBundledEntryExportSync as r, defineBundledChannelEntry as t };
