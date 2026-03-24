import { m as normalizeE164 } from "./utils-CS0Ikux6.js";
import { g as DEFAULT_ACCOUNT_ID } from "./session-key-DAhnzjyr.js";
import { n as resolveOpenClawPackageRootSync } from "./openclaw-root-DqTSxvim.js";
import { s as loadConfig } from "./io-y3Az_Onx.js";
import { c as normalizeChatChannelId } from "./registry-C5UkPpaO.js";
import { n as loadPluginManifestRegistry } from "./manifest-registry-B5JNQdOM.js";
import { l as resolveStorePath } from "./paths-rhN9LKM_.js";
import { o as readChannelAllowFromStoreSync } from "./pairing-store-BGKLrjo6.js";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import path from "node:path";
import { createJiti } from "jiti";
//#region src/config/sessions/store-summary.ts
function isSummaryRecord(value) {
	return !!value && typeof value === "object" && !Array.isArray(value);
}
function loadSessionStoreSummary(storePath) {
	try {
		const raw = fs.readFileSync(storePath, "utf8");
		if (!raw) return {};
		const parsed = JSON.parse(raw);
		if (!isSummaryRecord(parsed)) return {};
		return parsed;
	} catch {
		return {};
	}
}
//#endregion
//#region src/channels/plugins/whatsapp-heartbeat.ts
function getSessionRecipients(cfg) {
	if ((cfg.session?.scope ?? "per-sender") === "global") return [];
	const store = loadSessionStoreSummary(resolveStorePath(cfg.session?.store));
	const isGroupKey = (key) => key.includes(":group:") || key.includes(":channel:") || key.includes("@g.us");
	const isCronKey = (key) => key.startsWith("cron:");
	const recipients = Object.entries(store).filter(([key]) => key !== "global" && key !== "unknown").filter(([key]) => !isGroupKey(key) && !isCronKey(key)).map(([_, entry]) => ({
		to: normalizeChatChannelId(entry?.lastChannel) === "whatsapp" && entry?.lastTo ? normalizeE164(entry.lastTo) : "",
		updatedAt: entry?.updatedAt ?? 0
	})).filter(({ to }) => to.length > 1).toSorted((a, b) => b.updatedAt - a.updatedAt);
	const seen = /* @__PURE__ */ new Set();
	return recipients.filter((r) => {
		if (seen.has(r.to)) return false;
		seen.add(r.to);
		return true;
	});
}
function resolveWhatsAppHeartbeatRecipients(cfg, opts = {}) {
	if (opts.to) return {
		recipients: [normalizeE164(opts.to)],
		source: "flag"
	};
	const sessionRecipients = getSessionRecipients(cfg);
	const configuredAllowFrom = Array.isArray(cfg.channels?.whatsapp?.allowFrom) && cfg.channels.whatsapp.allowFrom.length > 0 ? cfg.channels.whatsapp.allowFrom.filter((v) => v !== "*").map(normalizeE164) : [];
	const storeAllowFrom = readChannelAllowFromStoreSync("whatsapp", process.env, DEFAULT_ACCOUNT_ID).map(normalizeE164);
	const unique = (list) => [...new Set(list.filter(Boolean))];
	const allowFrom = unique([...configuredAllowFrom, ...storeAllowFrom]);
	if (opts.all) return {
		recipients: unique([...sessionRecipients.map((s) => s.to), ...allowFrom]),
		source: "all"
	};
	if (allowFrom.length > 0) {
		const allowSet = new Set(allowFrom);
		const authorizedSessionRecipients = sessionRecipients.map((entry) => entry.to).filter((recipient) => allowSet.has(recipient));
		if (authorizedSessionRecipients.length === 1) return {
			recipients: [authorizedSessionRecipients[0]],
			source: "session-single"
		};
		if (authorizedSessionRecipients.length > 1) return {
			recipients: authorizedSessionRecipients,
			source: "session-ambiguous"
		};
		return {
			recipients: allowFrom,
			source: "allowFrom"
		};
	}
	if (sessionRecipients.length === 1) return {
		recipients: [sessionRecipients[0].to],
		source: "session-single"
	};
	if (sessionRecipients.length > 1) return {
		recipients: sessionRecipients.map((s) => s.to),
		source: "session-ambiguous"
	};
	return {
		recipients: allowFrom,
		source: "allowFrom"
	};
}
//#endregion
//#region src/plugins/sdk-alias.ts
function resolveLoaderModulePath(params = {}) {
	return params.modulePath ?? fileURLToPath(params.moduleUrl ?? import.meta.url);
}
function readPluginSdkPackageJson(packageRoot) {
	try {
		const pkgRaw = fs.readFileSync(path.join(packageRoot, "package.json"), "utf-8");
		return JSON.parse(pkgRaw);
	} catch {
		return null;
	}
}
function listPluginSdkSubpathsFromPackageJson(pkg) {
	return Object.keys(pkg.exports ?? {}).filter((key) => key.startsWith("./plugin-sdk/")).map((key) => key.slice(13)).filter((subpath) => Boolean(subpath) && !subpath.includes("/")).toSorted();
}
function hasTrustedOpenClawRootIndicator(params) {
	const packageExports = params.packageJson.exports ?? {};
	if (!Object.prototype.hasOwnProperty.call(packageExports, "./plugin-sdk")) return false;
	const hasCliEntryExport = Object.prototype.hasOwnProperty.call(packageExports, "./cli-entry");
	const hasOpenClawBin = typeof params.packageJson.bin === "string" && params.packageJson.bin.toLowerCase().includes("openclaw") || typeof params.packageJson.bin === "object" && params.packageJson.bin !== null && typeof params.packageJson.bin.openclaw === "string";
	const hasOpenClawEntrypoint = fs.existsSync(path.join(params.packageRoot, "openclaw.mjs"));
	return hasCliEntryExport || hasOpenClawBin || hasOpenClawEntrypoint;
}
function readPluginSdkSubpathsFromPackageRoot(packageRoot) {
	const pkg = readPluginSdkPackageJson(packageRoot);
	if (!pkg) return null;
	if (!hasTrustedOpenClawRootIndicator({
		packageRoot,
		packageJson: pkg
	})) return null;
	const subpaths = listPluginSdkSubpathsFromPackageJson(pkg);
	return subpaths.length > 0 ? subpaths : null;
}
function findNearestPluginSdkPackageRoot(startDir, maxDepth = 12) {
	let cursor = path.resolve(startDir);
	for (let i = 0; i < maxDepth; i += 1) {
		if (readPluginSdkSubpathsFromPackageRoot(cursor)) return cursor;
		const parent = path.dirname(cursor);
		if (parent === cursor) break;
		cursor = parent;
	}
	return null;
}
function resolveLoaderPackageRoot(params) {
	const cwd = params.cwd ?? path.dirname(params.modulePath);
	const fromModulePath = resolveOpenClawPackageRootSync({ cwd });
	if (fromModulePath) return fromModulePath;
	const argv1 = params.argv1 ?? process.argv[1];
	const moduleUrl = params.moduleUrl ?? (params.modulePath ? void 0 : import.meta.url);
	return resolveOpenClawPackageRootSync({
		cwd,
		...argv1 ? { argv1 } : {},
		...moduleUrl ? { moduleUrl } : {}
	});
}
function resolveLoaderPluginSdkPackageRoot(params) {
	const cwd = params.cwd ?? path.dirname(params.modulePath);
	const fromCwd = resolveOpenClawPackageRootSync({ cwd });
	const fromExplicitHints = params.argv1 || params.moduleUrl ? resolveOpenClawPackageRootSync({
		cwd,
		...params.argv1 ? { argv1: params.argv1 } : {},
		...params.moduleUrl ? { moduleUrl: params.moduleUrl } : {}
	}) : null;
	return fromCwd ?? fromExplicitHints ?? findNearestPluginSdkPackageRoot(path.dirname(params.modulePath)) ?? (params.cwd ? findNearestPluginSdkPackageRoot(params.cwd) : null) ?? findNearestPluginSdkPackageRoot(process.cwd());
}
function resolvePluginSdkAliasCandidateOrder(params) {
	return params.modulePath.replace(/\\/g, "/").includes("/dist/") || params.isProduction ? ["dist", "src"] : ["src", "dist"];
}
function listPluginSdkAliasCandidates(params) {
	const orderedKinds = resolvePluginSdkAliasCandidateOrder({
		modulePath: params.modulePath,
		isProduction: true
	});
	const packageRoot = resolveLoaderPluginSdkPackageRoot(params);
	if (packageRoot) {
		const candidateMap = {
			src: path.join(packageRoot, "src", "plugin-sdk", params.srcFile),
			dist: path.join(packageRoot, "dist", "plugin-sdk", params.distFile)
		};
		return orderedKinds.map((kind) => candidateMap[kind]);
	}
	let cursor = path.dirname(params.modulePath);
	const candidates = [];
	for (let i = 0; i < 6; i += 1) {
		const candidateMap = {
			src: path.join(cursor, "src", "plugin-sdk", params.srcFile),
			dist: path.join(cursor, "dist", "plugin-sdk", params.distFile)
		};
		for (const kind of orderedKinds) candidates.push(candidateMap[kind]);
		const parent = path.dirname(cursor);
		if (parent === cursor) break;
		cursor = parent;
	}
	return candidates;
}
function resolvePluginSdkAliasFile(params) {
	try {
		const modulePath = resolveLoaderModulePath(params);
		for (const candidate of listPluginSdkAliasCandidates({
			srcFile: params.srcFile,
			distFile: params.distFile,
			modulePath,
			argv1: params.argv1,
			cwd: params.cwd,
			moduleUrl: params.moduleUrl
		})) if (fs.existsSync(candidate)) return candidate;
	} catch {}
	return null;
}
const cachedPluginSdkExportedSubpaths = /* @__PURE__ */ new Map();
const cachedPluginSdkScopedAliasMaps = /* @__PURE__ */ new Map();
function listPluginSdkExportedSubpaths(params = {}) {
	const packageRoot = resolveLoaderPluginSdkPackageRoot({ modulePath: params.modulePath ?? fileURLToPath(import.meta.url) });
	if (!packageRoot) return [];
	const cached = cachedPluginSdkExportedSubpaths.get(packageRoot);
	if (cached) return cached;
	const subpaths = readPluginSdkSubpathsFromPackageRoot(packageRoot) ?? [];
	cachedPluginSdkExportedSubpaths.set(packageRoot, subpaths);
	return subpaths;
}
function resolvePluginSdkScopedAliasMap(params = {}) {
	const modulePath = params.modulePath ?? fileURLToPath(import.meta.url);
	const packageRoot = resolveLoaderPluginSdkPackageRoot({ modulePath });
	if (!packageRoot) return {};
	const orderedKinds = resolvePluginSdkAliasCandidateOrder({
		modulePath,
		isProduction: true
	});
	const cacheKey = `${packageRoot}::${orderedKinds.join(",")}`;
	const cached = cachedPluginSdkScopedAliasMaps.get(cacheKey);
	if (cached) return cached;
	const aliasMap = {};
	for (const subpath of listPluginSdkExportedSubpaths({ modulePath })) {
		const candidateMap = {
			src: path.join(packageRoot, "src", "plugin-sdk", `${subpath}.ts`),
			dist: path.join(packageRoot, "dist", "plugin-sdk", `${subpath}.js`)
		};
		for (const kind of orderedKinds) {
			const candidate = candidateMap[kind];
			if (fs.existsSync(candidate)) {
				aliasMap[`openclaw/plugin-sdk/${subpath}`] = candidate;
				break;
			}
		}
	}
	cachedPluginSdkScopedAliasMaps.set(cacheKey, aliasMap);
	return aliasMap;
}
function resolveExtensionApiAlias(params = {}) {
	try {
		const modulePath = resolveLoaderModulePath(params);
		const packageRoot = resolveLoaderPackageRoot({
			...params,
			modulePath
		});
		if (!packageRoot) return null;
		const orderedKinds = resolvePluginSdkAliasCandidateOrder({
			modulePath,
			isProduction: true
		});
		const candidateMap = {
			src: path.join(packageRoot, "src", "extensionAPI.ts"),
			dist: path.join(packageRoot, "dist", "extensionAPI.js")
		};
		for (const kind of orderedKinds) {
			const candidate = candidateMap[kind];
			if (fs.existsSync(candidate)) return candidate;
		}
	} catch {}
	return null;
}
function buildPluginLoaderAliasMap(modulePath) {
	const pluginSdkAlias = resolvePluginSdkAliasFile({
		srcFile: "root-alias.cjs",
		distFile: "root-alias.cjs",
		modulePath
	});
	const extensionApiAlias = resolveExtensionApiAlias({ modulePath });
	return {
		...extensionApiAlias ? { "openclaw/extension-api": extensionApiAlias } : {},
		...pluginSdkAlias ? { "openclaw/plugin-sdk": pluginSdkAlias } : {},
		...resolvePluginSdkScopedAliasMap({ modulePath })
	};
}
function resolvePluginRuntimeModulePath(params = {}) {
	try {
		const modulePath = resolveLoaderModulePath(params);
		const orderedKinds = resolvePluginSdkAliasCandidateOrder({
			modulePath,
			isProduction: true
		});
		const packageRoot = resolveLoaderPackageRoot({
			...params,
			modulePath
		});
		const candidates = packageRoot ? orderedKinds.map((kind) => kind === "src" ? path.join(packageRoot, "src", "plugins", "runtime", "index.ts") : path.join(packageRoot, "dist", "plugins", "runtime", "index.js")) : [path.join(path.dirname(modulePath), "runtime", "index.ts"), path.join(path.dirname(modulePath), "runtime", "index.js")];
		for (const candidate of candidates) if (fs.existsSync(candidate)) return candidate;
	} catch {}
	return null;
}
function buildPluginLoaderJitiOptions(aliasMap) {
	return {
		interopDefault: true,
		tryNative: true,
		extensions: [
			".ts",
			".tsx",
			".mts",
			".cts",
			".mtsx",
			".ctsx",
			".js",
			".mjs",
			".cjs",
			".json"
		],
		...Object.keys(aliasMap).length > 0 ? { alias: aliasMap } : {}
	};
}
function shouldPreferNativeJiti(modulePath) {
	switch (path.extname(modulePath).toLowerCase()) {
		case ".js":
		case ".mjs":
		case ".cjs":
		case ".json": return true;
		default: return false;
	}
}
//#endregion
//#region src/plugins/runtime/runtime-whatsapp-boundary.ts
const WHATSAPP_PLUGIN_ID = "whatsapp";
let cachedHeavyModulePath = null;
let cachedHeavyModule = null;
let cachedLightModulePath = null;
let cachedLightModule = null;
const jitiLoaders = /* @__PURE__ */ new Map();
function readConfigSafely() {
	try {
		return loadConfig();
	} catch {
		return {};
	}
}
function resolveWhatsAppPluginRecord() {
	const record = loadPluginManifestRegistry({
		config: readConfigSafely(),
		cache: true
	}).plugins.find((plugin) => plugin.id === WHATSAPP_PLUGIN_ID);
	if (!record?.source) throw new Error(`WhatsApp plugin runtime is unavailable: missing plugin '${WHATSAPP_PLUGIN_ID}'`);
	return {
		origin: record.origin,
		rootDir: record.rootDir,
		source: record.source
	};
}
function resolveWhatsAppRuntimeModulePath(record, entryBaseName) {
	const candidates = [
		path.join(path.dirname(record.source), `${entryBaseName}.js`),
		path.join(path.dirname(record.source), `${entryBaseName}.ts`),
		...record.rootDir ? [path.join(record.rootDir, `${entryBaseName}.js`), path.join(record.rootDir, `${entryBaseName}.ts`)] : []
	];
	for (const candidate of candidates) if (fs.existsSync(candidate)) return candidate;
	throw new Error(`WhatsApp plugin runtime is unavailable: missing ${entryBaseName} for plugin '${WHATSAPP_PLUGIN_ID}'`);
}
function getJiti(modulePath) {
	const tryNative = shouldPreferNativeJiti(modulePath);
	const cached = jitiLoaders.get(tryNative);
	if (cached) return cached;
	const pluginSdkAlias = resolvePluginSdkAliasFile({
		srcFile: "root-alias.cjs",
		distFile: "root-alias.cjs",
		modulePath
	});
	const aliasMap = {
		...pluginSdkAlias ? { "openclaw/plugin-sdk": pluginSdkAlias } : {},
		...resolvePluginSdkScopedAliasMap({ modulePath })
	};
	const loader = createJiti(import.meta.url, {
		...buildPluginLoaderJitiOptions(aliasMap),
		tryNative
	});
	jitiLoaders.set(tryNative, loader);
	return loader;
}
function loadWithJiti(modulePath) {
	return getJiti(modulePath)(modulePath);
}
function loadWhatsAppLightModule() {
	const modulePath = resolveWhatsAppRuntimeModulePath(resolveWhatsAppPluginRecord(), "light-runtime-api");
	if (cachedLightModule && cachedLightModulePath === modulePath) return cachedLightModule;
	const loaded = loadWithJiti(modulePath);
	cachedLightModulePath = modulePath;
	cachedLightModule = loaded;
	return loaded;
}
async function loadWhatsAppHeavyModule() {
	const modulePath = resolveWhatsAppRuntimeModulePath(resolveWhatsAppPluginRecord(), "runtime-api");
	if (cachedHeavyModule && cachedHeavyModulePath === modulePath) return cachedHeavyModule;
	const loaded = loadWithJiti(modulePath);
	cachedHeavyModulePath = modulePath;
	cachedHeavyModule = loaded;
	return loaded;
}
function getLightExport(exportName) {
	const value = loadWhatsAppLightModule()[exportName];
	if (value == null) throw new Error(`WhatsApp plugin runtime is missing export '${String(exportName)}'`);
	return value;
}
async function getHeavyExport(exportName) {
	const value = (await loadWhatsAppHeavyModule())[exportName];
	if (value == null) throw new Error(`WhatsApp plugin runtime is missing export '${String(exportName)}'`);
	return value;
}
function getActiveWebListener(...args) {
	return getLightExport("getActiveWebListener")(...args);
}
function getWebAuthAgeMs(...args) {
	return getLightExport("getWebAuthAgeMs")(...args);
}
function logWebSelfId(...args) {
	return getLightExport("logWebSelfId")(...args);
}
function loginWeb(...args) {
	return loadWhatsAppHeavyModule().then((loaded) => loaded.loginWeb(...args));
}
function logoutWeb(...args) {
	return getLightExport("logoutWeb")(...args);
}
function readWebSelfId(...args) {
	return getLightExport("readWebSelfId")(...args);
}
function webAuthExists(...args) {
	return getLightExport("webAuthExists")(...args);
}
function sendMessageWhatsApp(...args) {
	return loadWhatsAppHeavyModule().then((loaded) => loaded.sendMessageWhatsApp(...args));
}
function sendPollWhatsApp(...args) {
	return loadWhatsAppHeavyModule().then((loaded) => loaded.sendPollWhatsApp(...args));
}
function createRuntimeWhatsAppLoginTool(...args) {
	return getLightExport("createWhatsAppLoginTool")(...args);
}
async function handleWhatsAppAction(...args) {
	return (await getHeavyExport("handleWhatsAppAction"))(...args);
}
function monitorWebChannel(...args) {
	return loadWhatsAppHeavyModule().then((loaded) => loaded.monitorWebChannel(...args));
}
async function startWebLoginWithQr(...args) {
	return (await getHeavyExport("startWebLoginWithQr"))(...args);
}
async function waitForWebLogin(...args) {
	return (await getHeavyExport("waitForWebLogin"))(...args);
}
//#endregion
export { resolvePluginRuntimeModulePath as _, logWebSelfId as a, shouldPreferNativeJiti as b, monitorWebChannel as c, sendPollWhatsApp as d, startWebLoginWithQr as f, buildPluginLoaderJitiOptions as g, buildPluginLoaderAliasMap as h, handleWhatsAppAction as i, readWebSelfId as l, webAuthExists as m, getActiveWebListener as n, loginWeb as o, waitForWebLogin as p, getWebAuthAgeMs as r, logoutWeb as s, createRuntimeWhatsAppLoginTool as t, sendMessageWhatsApp as u, resolvePluginSdkAliasFile as v, resolveWhatsAppHeartbeatRecipients as x, resolvePluginSdkScopedAliasMap as y };
