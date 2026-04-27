#!/usr/bin/env node
import { a as formatUncaughtError } from "./errors-Jbvi20TW.js";
import { r as runFatalErrorHooks } from "./fatal-error-hooks-Dy3Y88QN.js";
import { t as isMainModule } from "./is-main-C_eE8dOT.js";
import { t as installUnhandledRejectionHandler } from "./unhandled-rejections-Bzjq4Io_.js";
import process from "node:process";
import { fileURLToPath } from "node:url";
//#region src/index.ts
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
let waitForever;
async function loadLegacyCliDeps() {
	const { runCli } = await import("./run-main-bbWXFk-0.js");
	return { runCli };
}
async function runLegacyCliEntry(argv = process.argv, deps) {
	const { runCli } = deps ?? await loadLegacyCliDeps();
	await runCli(argv);
}
const isMain = isMainModule({ currentFile: fileURLToPath(import.meta.url) });
if (!isMain) ({applyTemplate, createDefaultDeps, deriveSessionKey, describePortOwner, ensureBinary, ensurePortAvailable, getReplyFromConfig, handlePortError, loadConfig, loadSessionStore, monitorWebChannel, normalizeE164, PortInUseError, promptYesNo, resolveSessionKey, resolveStorePath, runCommandWithTimeout, runExec, saveSessionStore, waitForever} = await import("./library-CsJoJUl8.js"));
if (isMain) {
	const { restoreTerminalState } = await import("./restore-Bq3mpjIz.js");
	installUnhandledRejectionHandler();
	process.on("uncaughtException", (error) => {
		console.error("[openclaw] Uncaught exception:", formatUncaughtError(error));
		for (const message of runFatalErrorHooks({
			reason: "uncaught_exception",
			error
		})) console.error("[openclaw]", message);
		restoreTerminalState("uncaught exception", { resumeStdinIfPaused: false });
		process.exit(1);
	});
	runLegacyCliEntry(process.argv).catch((err) => {
		console.error("[openclaw] CLI failed:", formatUncaughtError(err));
		for (const message of runFatalErrorHooks({
			reason: "legacy_cli_failure",
			error: err
		})) console.error("[openclaw]", message);
		restoreTerminalState("legacy cli failure", { resumeStdinIfPaused: false });
		process.exit(1);
	});
}
//#endregion
export { PortInUseError, applyTemplate, createDefaultDeps, deriveSessionKey, describePortOwner, ensureBinary, ensurePortAvailable, getReplyFromConfig, handlePortError, loadConfig, loadSessionStore, monitorWebChannel, normalizeE164, promptYesNo, resolveSessionKey, resolveStorePath, runCommandWithTimeout, runExec, runLegacyCliEntry, saveSessionStore, waitForever };
