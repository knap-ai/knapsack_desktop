import { g as shouldPreferNativeJiti, t as buildPluginLoaderAliasMap } from "./sdk-alias-w29OTN9p.js";
import { t as getCachedPluginJitiLoader } from "./jiti-loader-cache-D_0TILck.js";
import { a as loadConfig } from "./io-5pxHCi7V.js";
import { t as loadPluginManifestRegistry } from "./manifest-registry-Bd3A4lqx.js";
import "./config-Q9XZc_2I.js";
import { n as loadWebMediaRaw$1, r as optimizeImageToJpeg$1, t as loadWebMedia$1 } from "./web-media-B2LIgj-X.js";
import { r as getDefaultLocalRoots$1 } from "./local-media-access-BjcJKJws.js";
import fs from "node:fs";
import path from "node:path";
//#region src/plugins/runtime/runtime-plugin-boundary.ts
function readPluginBoundaryConfigSafely() {
	try {
		return loadConfig();
	} catch {
		return {};
	}
}
function resolvePluginRuntimeRecordByEntryBaseNames(entryBaseNames, onMissing) {
	const matches = loadPluginManifestRegistry({
		config: readPluginBoundaryConfigSafely(),
		cache: true
	}).plugins.filter((plugin) => {
		if (!plugin?.source) return false;
		const record = {
			rootDir: plugin.rootDir,
			source: plugin.source
		};
		return entryBaseNames.every((entryBaseName) => resolvePluginRuntimeModulePath(record, entryBaseName) !== null);
	});
	if (matches.length === 0) {
		if (onMissing) onMissing();
		return null;
	}
	if (matches.length > 1) {
		const pluginIds = matches.map((plugin) => plugin.id).join(", ");
		throw new Error(`plugin runtime boundary is ambiguous for entries [${entryBaseNames.join(", ")}]: ${pluginIds}`);
	}
	const record = matches[0];
	return {
		...record.origin ? { origin: record.origin } : {},
		rootDir: record.rootDir,
		source: record.source
	};
}
function resolvePluginRuntimeModulePath(record, entryBaseName, onMissing) {
	const candidates = [
		path.join(path.dirname(record.source), `${entryBaseName}.js`),
		path.join(path.dirname(record.source), `${entryBaseName}.ts`),
		...record.rootDir ? [path.join(record.rootDir, `${entryBaseName}.js`), path.join(record.rootDir, `${entryBaseName}.ts`)] : []
	];
	for (const candidate of candidates) if (fs.existsSync(candidate)) return candidate;
	if (onMissing) onMissing();
	return null;
}
function getPluginBoundaryJiti(modulePath, loaders) {
	const tryNative = shouldPreferNativeJiti(modulePath);
	const aliasMap = buildPluginLoaderAliasMap(modulePath);
	return getCachedPluginJitiLoader({
		cache: loaders,
		modulePath,
		importerUrl: import.meta.url,
		jitiFilename: import.meta.url,
		aliasMap,
		tryNative
	});
}
function loadPluginBoundaryModuleWithJiti(modulePath, loaders) {
	return getPluginBoundaryJiti(modulePath, loaders)(modulePath);
}
//#endregion
//#region src/plugins/runtime/runtime-web-channel-plugin.ts
let cachedHeavyModulePath = null;
let cachedHeavyModule = null;
let cachedLightModulePath = null;
let cachedLightModule = null;
const jitiLoaders = /* @__PURE__ */ new Map();
function resolveWebChannelPluginRecord() {
	return resolvePluginRuntimeRecordByEntryBaseNames(["light-runtime-api", "runtime-api"], () => {
		throw new Error("web channel plugin runtime is unavailable: missing plugin that provides light-runtime-api and runtime-api");
	});
}
function resolveWebChannelRuntimeModulePath(record, entryBaseName) {
	const modulePath = resolvePluginRuntimeModulePath(record, entryBaseName, () => {
		throw new Error(`web channel plugin runtime is unavailable: missing ${entryBaseName}`);
	});
	if (!modulePath) throw new Error(`web channel plugin runtime is unavailable: missing ${entryBaseName}`);
	return modulePath;
}
function loadCurrentHeavyModuleSync() {
	return loadPluginBoundaryModuleWithJiti(resolveWebChannelRuntimeModulePath(resolveWebChannelPluginRecord(), "runtime-api"), jitiLoaders);
}
function loadWebChannelLightModule() {
	const modulePath = resolveWebChannelRuntimeModulePath(resolveWebChannelPluginRecord(), "light-runtime-api");
	if (cachedLightModule && cachedLightModulePath === modulePath) return cachedLightModule;
	const loaded = loadPluginBoundaryModuleWithJiti(modulePath, jitiLoaders);
	cachedLightModulePath = modulePath;
	cachedLightModule = loaded;
	return loaded;
}
async function loadWebChannelHeavyModule() {
	const modulePath = resolveWebChannelRuntimeModulePath(resolveWebChannelPluginRecord(), "runtime-api");
	if (cachedHeavyModule && cachedHeavyModulePath === modulePath) return cachedHeavyModule;
	const loaded = loadPluginBoundaryModuleWithJiti(modulePath, jitiLoaders);
	cachedHeavyModulePath = modulePath;
	cachedHeavyModule = loaded;
	return loaded;
}
function getLightExport(exportName) {
	const value = loadWebChannelLightModule()[exportName];
	if (value == null) throw new Error(`web channel plugin runtime is missing export '${exportName}'`);
	return value;
}
async function getHeavyExport(exportName) {
	const value = (await loadWebChannelHeavyModule())[exportName];
	if (value == null) throw new Error(`web channel plugin runtime is missing export '${exportName}'`);
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
	return loadWebChannelHeavyModule().then((loaded) => loaded.loginWeb(...args));
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
function sendWebChannelMessage(...args) {
	return loadWebChannelHeavyModule().then((loaded) => loaded.sendMessageWhatsApp(...args));
}
function sendWebChannelPoll(...args) {
	return loadWebChannelHeavyModule().then((loaded) => loaded.sendPollWhatsApp(...args));
}
function sendWebChannelReaction(...args) {
	return loadWebChannelHeavyModule().then((loaded) => loaded.sendReactionWhatsApp(...args));
}
function createRuntimeWebChannelLoginTool(...args) {
	return getLightExport("createWhatsAppLoginTool")(...args);
}
function createWebChannelSocket(...args) {
	return loadWebChannelHeavyModule().then((loaded) => loaded.createWaSocket(...args));
}
function formatError(...args) {
	return getLightExport("formatError")(...args);
}
function getStatusCode(...args) {
	return getLightExport("getStatusCode")(...args);
}
function pickWebChannel(...args) {
	return getLightExport("pickWebChannel")(...args);
}
function resolveWebChannelAuthDir() {
	return getLightExport("WA_WEB_AUTH_DIR");
}
async function handleWebChannelAction(...args) {
	return (await getHeavyExport("handleWhatsAppAction"))(...args);
}
async function loadWebMedia(...args) {
	return await loadWebMedia$1(...args);
}
async function loadWebMediaRaw(...args) {
	return await loadWebMediaRaw$1(...args);
}
function monitorWebChannel(...args) {
	return loadWebChannelHeavyModule().then((loaded) => loaded.monitorWebChannel(...args));
}
async function monitorWebInbox(...args) {
	return (await getHeavyExport("monitorWebInbox"))(...args);
}
async function optimizeImageToJpeg(...args) {
	return await optimizeImageToJpeg$1(...args);
}
async function runWebHeartbeatOnce(...args) {
	return (await getHeavyExport("runWebHeartbeatOnce"))(...args);
}
async function startWebLoginWithQr(...args) {
	return (await getHeavyExport("startWebLoginWithQr"))(...args);
}
async function waitForWebChannelConnection(...args) {
	return (await getHeavyExport("waitForWaConnection"))(...args);
}
async function waitForWebLogin(...args) {
	return (await getHeavyExport("waitForWebLogin"))(...args);
}
const extractMediaPlaceholder = (...args) => loadCurrentHeavyModuleSync().extractMediaPlaceholder(...args);
const extractText = (...args) => loadCurrentHeavyModuleSync().extractText(...args);
function getDefaultLocalRoots(...args) {
	return getDefaultLocalRoots$1(...args);
}
function resolveHeartbeatRecipients(...args) {
	return loadCurrentHeavyModuleSync().resolveHeartbeatRecipients(...args);
}
//#endregion
export { createRuntimeWebChannelLoginTool, createWebChannelSocket, extractMediaPlaceholder, extractText, formatError, getActiveWebListener, getDefaultLocalRoots, getStatusCode, getWebAuthAgeMs, handleWebChannelAction, loadWebMedia, loadWebMediaRaw, logWebSelfId, loginWeb, logoutWeb, monitorWebChannel, monitorWebInbox, optimizeImageToJpeg, pickWebChannel, readWebSelfId, resolveHeartbeatRecipients, resolveWebChannelAuthDir, runWebHeartbeatOnce, sendWebChannelMessage, sendWebChannelPoll, sendWebChannelReaction, startWebLoginWithQr, waitForWebChannelConnection, waitForWebLogin, webAuthExists };
