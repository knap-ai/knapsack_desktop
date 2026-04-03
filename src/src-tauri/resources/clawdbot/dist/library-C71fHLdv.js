import { n as assertWebChannel, p as normalizeE164, w as toWhatsappJid } from "./utils-CE3P21nG.js";
import { c as loadConfig } from "./io-DhtVmzAJ.js";
import "./config-CJQx-9zo.js";
import { i as loadSessionStore, l as saveSessionStore } from "./store-BGmy-Wot.js";
import { l as resolveStorePath } from "./paths-DBIQqSpZ.js";
import { n as resolveSessionKey, t as deriveSessionKey } from "./session-key-CrIfzXHI.js";
import { i as handlePortError, n as describePortOwner, r as ensurePortAvailable, t as PortInUseError } from "./ports-C5dh_OwP.js";
import { t as applyTemplate } from "./templating-DJb7QXiA.js";
import { t as createDefaultDeps } from "./deps-BFwksfYt.js";
import { t as waitForever } from "./wait-DbkUrhLe.js";
//#region src/library.ts
let replyRuntimePromise = null;
let promptRuntimePromise = null;
let binariesRuntimePromise = null;
let execRuntimePromise = null;
let whatsappRuntimePromise = null;
function loadReplyRuntime() {
	replyRuntimePromise ??= import("./reply.runtime-KErtGlnV.js");
	return replyRuntimePromise;
}
function loadPromptRuntime() {
	promptRuntimePromise ??= import("./prompt-Dba_bqSf.js");
	return promptRuntimePromise;
}
function loadBinariesRuntime() {
	binariesRuntimePromise ??= import("./binaries-BTpn3LhP.js");
	return binariesRuntimePromise;
}
function loadExecRuntime() {
	execRuntimePromise ??= import("./exec-o2EIOeyB.js");
	return execRuntimePromise;
}
function loadWhatsAppRuntime() {
	whatsappRuntimePromise ??= import("./runtime-whatsapp-boundary-65dXHgbq.js");
	return whatsappRuntimePromise;
}
const getReplyFromConfig = async (...args) => (await loadReplyRuntime()).getReplyFromConfig(...args);
const promptYesNo = async (...args) => (await loadPromptRuntime()).promptYesNo(...args);
const ensureBinary = async (...args) => (await loadBinariesRuntime()).ensureBinary(...args);
const runExec = async (...args) => (await loadExecRuntime()).runExec(...args);
const runCommandWithTimeout = async (...args) => (await loadExecRuntime()).runCommandWithTimeout(...args);
const monitorWebChannel = async (...args) => (await loadWhatsAppRuntime()).monitorWebChannel(...args);
//#endregion
export { PortInUseError, applyTemplate, assertWebChannel, createDefaultDeps, deriveSessionKey, describePortOwner, ensureBinary, ensurePortAvailable, getReplyFromConfig, handlePortError, loadConfig, loadSessionStore, monitorWebChannel, normalizeE164, promptYesNo, resolveSessionKey, resolveStorePath, runCommandWithTimeout, runExec, saveSessionStore, toWhatsappJid, waitForever };
