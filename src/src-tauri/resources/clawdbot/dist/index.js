#!/usr/bin/env node
import { i as formatUncaughtError } from "./errors-Bs2h5H8p.js";
import { t as isMainModule } from "./is-main-Bv5ej4lF.js";
import { t as installUnhandledRejectionHandler } from "./unhandled-rejections-BWJ-75jM.js";
import process from "node:process";
import { fileURLToPath } from "node:url";
//#region src/index.ts
let assertWebChannel;
let applyTemplate;
let createDefaultDeps;
let deriveSessionKey;
let describePortOwner;
let ensureBinary;
let ensurePortAvailable;
let getReplyFromConfig;
let handlePortError;
let loadConfig;
let loadSessionStore;
let monitorWebChannel;
let normalizeE164;
let PortInUseError;
let promptYesNo;
let resolveSessionKey;
let resolveStorePath;
let runCommandWithTimeout;
let runExec;
let saveSessionStore;
let toWhatsappJid;
let waitForever;
async function loadLegacyCliDeps() {
	const [{ installGaxiosFetchCompat }, { runCli }] = await Promise.all([import("./gaxios-fetch-compat-lq1frmBg.js"), import("./run-main-Dn5_pwmb.js")]);
	return {
		installGaxiosFetchCompat,
		runCli
	};
}
async function runLegacyCliEntry(argv = process.argv, deps) {
	const { installGaxiosFetchCompat, runCli } = deps ?? await loadLegacyCliDeps();
	await installGaxiosFetchCompat();
	await runCli(argv);
}
const isMain = isMainModule({ currentFile: fileURLToPath(import.meta.url) });
if (!isMain) ({assertWebChannel, applyTemplate, createDefaultDeps, deriveSessionKey, describePortOwner, ensureBinary, ensurePortAvailable, getReplyFromConfig, handlePortError, loadConfig, loadSessionStore, monitorWebChannel, normalizeE164, PortInUseError, promptYesNo, resolveSessionKey, resolveStorePath, runCommandWithTimeout, runExec, saveSessionStore, toWhatsappJid, waitForever} = await import("./library-C71fHLdv.js"));
if (isMain) {
	installUnhandledRejectionHandler();
	process.on("uncaughtException", (error) => {
		console.error("[openclaw] Uncaught exception:", formatUncaughtError(error));
		process.exit(1);
	});
	runLegacyCliEntry(process.argv).catch((err) => {
		console.error("[openclaw] CLI failed:", formatUncaughtError(err));
		process.exit(1);
	});
}
//#endregion
export { PortInUseError, applyTemplate, assertWebChannel, createDefaultDeps, deriveSessionKey, describePortOwner, ensureBinary, ensurePortAvailable, getReplyFromConfig, handlePortError, loadConfig, loadSessionStore, monitorWebChannel, normalizeE164, promptYesNo, resolveSessionKey, resolveStorePath, runCommandWithTimeout, runExec, runLegacyCliEntry, saveSessionStore, toWhatsappJid, waitForever };
