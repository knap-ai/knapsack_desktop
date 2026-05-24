import { startWebLoginWithQr as startWebLoginWithQr$1, waitForWebLogin as waitForWebLogin$1 } from "./login-qr-runtime.js";
import { c as logoutWeb$1, d as readWebAuthExistsBestEffort$1, f as readWebAuthExistsForDecision$1, g as readWebSelfId$1, h as readWebAuthState$1, m as readWebAuthSnapshotBestEffort$1, o as getWebAuthAgeMs$1, p as readWebAuthSnapshot$1, s as logWebSelfId$1, x as webAuthExists$1 } from "./auth-store-GTQvJznL.js";
import { t as getActiveWebListener$1 } from "./active-listener-B4SDebQ6.js";
import { t as monitorWebChannel$1 } from "./monitor-ClhD-fQ6.js";
import { t as loginWeb$1 } from "./login-nJwaNuC-.js";
import { whatsappSetupWizard as whatsappSetupWizard$1 } from "./setup-surface-Uoh9W_29.js";
//#region extensions/whatsapp/src/channel.runtime.ts
function getActiveWebListener(...args) {
	return getActiveWebListener$1(...args);
}
function getWebAuthAgeMs(...args) {
	return getWebAuthAgeMs$1(...args);
}
function logWebSelfId(...args) {
	return logWebSelfId$1(...args);
}
function logoutWeb(...args) {
	return logoutWeb$1(...args);
}
function readWebAuthSnapshot(...args) {
	return readWebAuthSnapshot$1(...args);
}
function readWebAuthState(...args) {
	return readWebAuthState$1(...args);
}
function readWebAuthExistsBestEffort(...args) {
	return readWebAuthExistsBestEffort$1(...args);
}
function readWebAuthExistsForDecision(...args) {
	return readWebAuthExistsForDecision$1(...args);
}
function readWebAuthSnapshotBestEffort(...args) {
	return readWebAuthSnapshotBestEffort$1(...args);
}
function readWebSelfId(...args) {
	return readWebSelfId$1(...args);
}
function webAuthExists(...args) {
	return webAuthExists$1(...args);
}
function loginWeb(...args) {
	return loginWeb$1(...args);
}
async function startWebLoginWithQr(...args) {
	return await startWebLoginWithQr$1(...args);
}
async function waitForWebLogin(...args) {
	return await waitForWebLogin$1(...args);
}
const whatsappSetupWizard = { ...whatsappSetupWizard$1 };
function monitorWebChannel(...args) {
	return monitorWebChannel$1(...args);
}
//#endregion
export { getActiveWebListener, getWebAuthAgeMs, logWebSelfId, loginWeb, logoutWeb, monitorWebChannel, readWebAuthExistsBestEffort, readWebAuthExistsForDecision, readWebAuthSnapshot, readWebAuthSnapshotBestEffort, readWebAuthState, readWebSelfId, startWebLoginWithQr, waitForWebLogin, webAuthExists, whatsappSetupWizard };
