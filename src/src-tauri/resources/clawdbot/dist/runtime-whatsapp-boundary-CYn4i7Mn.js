import { n as loadWebMediaRaw$1, o as getDefaultLocalRoots$1, r as optimizeImageToJpeg$1, t as loadWebMedia$1 } from "./web-media-4TOxrRxF.js";
import { n as resolvePluginRuntimeModulePath, r as resolvePluginRuntimeRecord, t as loadPluginBoundaryModuleWithJiti } from "./runtime-plugin-boundary-BrIbTCFo.js";
import { t as resolveWhatsAppHeartbeatRecipients } from "./whatsapp-heartbeat-B4yUEp_v.js";
//#region src/plugins/runtime/runtime-whatsapp-boundary.ts
const WHATSAPP_PLUGIN_ID = "whatsapp";
let cachedHeavyModulePath = null;
let cachedHeavyModule = null;
let cachedLightModulePath = null;
let cachedLightModule = null;
const jitiLoaders = /* @__PURE__ */ new Map();
function resolveWhatsAppPluginRecord() {
	return resolvePluginRuntimeRecord(WHATSAPP_PLUGIN_ID, () => {
		throw new Error(`WhatsApp plugin runtime is unavailable: missing plugin '${WHATSAPP_PLUGIN_ID}'`);
	});
}
function resolveWhatsAppRuntimeModulePath(record, entryBaseName) {
	const modulePath = resolvePluginRuntimeModulePath(record, entryBaseName, () => {
		throw new Error(`WhatsApp plugin runtime is unavailable: missing ${entryBaseName} for plugin '${WHATSAPP_PLUGIN_ID}'`);
	});
	if (!modulePath) throw new Error(`WhatsApp plugin runtime is unavailable: missing ${entryBaseName} for plugin '${WHATSAPP_PLUGIN_ID}'`);
	return modulePath;
}
function loadCurrentHeavyModuleSync() {
	return loadPluginBoundaryModuleWithJiti(resolveWhatsAppRuntimeModulePath(resolveWhatsAppPluginRecord(), "runtime-api"), jitiLoaders);
}
function loadWhatsAppLightModule() {
	const modulePath = resolveWhatsAppRuntimeModulePath(resolveWhatsAppPluginRecord(), "light-runtime-api");
	if (cachedLightModule && cachedLightModulePath === modulePath) return cachedLightModule;
	const loaded = loadPluginBoundaryModuleWithJiti(modulePath, jitiLoaders);
	cachedLightModulePath = modulePath;
	cachedLightModule = loaded;
	return loaded;
}
async function loadWhatsAppHeavyModule() {
	const modulePath = resolveWhatsAppRuntimeModulePath(resolveWhatsAppPluginRecord(), "runtime-api");
	if (cachedHeavyModule && cachedHeavyModulePath === modulePath) return cachedHeavyModule;
	const loaded = loadPluginBoundaryModuleWithJiti(modulePath, jitiLoaders);
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
function sendReactionWhatsApp(...args) {
	return loadWhatsAppHeavyModule().then((loaded) => loaded.sendReactionWhatsApp(...args));
}
function createRuntimeWhatsAppLoginTool(...args) {
	return getLightExport("createWhatsAppLoginTool")(...args);
}
function createWaSocket(...args) {
	return loadWhatsAppHeavyModule().then((loaded) => loaded.createWaSocket(...args));
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
function resolveWaWebAuthDir() {
	return getLightExport("WA_WEB_AUTH_DIR");
}
async function handleWhatsAppAction(...args) {
	return (await getHeavyExport("handleWhatsAppAction"))(...args);
}
async function loadWebMedia(...args) {
	return await loadWebMedia$1(...args);
}
async function loadWebMediaRaw(...args) {
	return await loadWebMediaRaw$1(...args);
}
function monitorWebChannel(...args) {
	return loadWhatsAppHeavyModule().then((loaded) => loaded.monitorWebChannel(...args));
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
async function waitForWaConnection(...args) {
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
	return resolveWhatsAppHeartbeatRecipients(...args);
}
//#endregion
export { webAuthExists as A, runWebHeartbeatOnce as C, startWebLoginWithQr as D, sendReactionWhatsApp as E, waitForWaConnection as O, resolveWaWebAuthDir as S, sendPollWhatsApp as T, monitorWebInbox as _, formatError as a, readWebSelfId as b, getStatusCode as c, loadWebMedia as d, loadWebMediaRaw as f, monitorWebChannel as g, logoutWeb as h, extractText as i, waitForWebLogin as k, getWebAuthAgeMs as l, loginWeb as m, createWaSocket as n, getActiveWebListener as o, logWebSelfId as p, extractMediaPlaceholder as r, getDefaultLocalRoots as s, createRuntimeWhatsAppLoginTool as t, handleWhatsAppAction as u, optimizeImageToJpeg as v, sendMessageWhatsApp as w, resolveHeartbeatRecipients as x, pickWebChannel as y };
