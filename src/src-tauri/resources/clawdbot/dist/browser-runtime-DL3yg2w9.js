import { r as runCommandWithTimeout } from "./exec-nWahKiCu.js";
import { i as loadActivatedBundledPluginPublicSurfaceModuleSync, n as createLazyFacadeObjectValue, o as tryLoadActivatedBundledPluginPublicSurfaceModuleSync } from "./facade-runtime-D_0VC8Qr.js";
import "./browser-config-To3UOSug.js";
import fsSync from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import os from "node:os";
import fs from "node:fs/promises";
import { randomBytes } from "node:crypto";
//#region src/plugin-sdk/browser-host-inspection.ts
const CHROME_VERSION_RE = /\b(\d+)(?:\.\d+){1,3}\b/g;
function exists(filePath) {
	try {
		return fsSync.existsSync(filePath);
	} catch {
		return false;
	}
}
function execText(command, args, timeoutMs = 1200, maxBuffer = 1024 * 1024) {
	try {
		const output = execFileSync(command, args, {
			timeout: timeoutMs,
			encoding: "utf8",
			maxBuffer
		});
		return String(output ?? "").trim() || null;
	} catch {
		return null;
	}
}
function findFirstChromeExecutable(candidates) {
	for (const candidate of candidates) if (exists(candidate)) {
		const normalizedPath = candidate.toLowerCase();
		return {
			kind: normalizedPath.includes("beta") || normalizedPath.includes("canary") || normalizedPath.includes("sxs") || normalizedPath.includes("unstable") ? "canary" : "chrome",
			path: candidate
		};
	}
	return null;
}
function findGoogleChromeExecutableMac() {
	return findFirstChromeExecutable([
		"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
		path.join(os.homedir(), "Applications/Google Chrome.app/Contents/MacOS/Google Chrome"),
		"/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
		path.join(os.homedir(), "Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary")
	]);
}
function findGoogleChromeExecutableLinux() {
	return findFirstChromeExecutable([
		"/usr/bin/google-chrome",
		"/usr/bin/google-chrome-stable",
		"/usr/bin/google-chrome-beta",
		"/usr/bin/google-chrome-unstable",
		"/snap/bin/google-chrome"
	]);
}
function findGoogleChromeExecutableWindows() {
	const localAppData = process.env.LOCALAPPDATA ?? "";
	const programFiles = process.env.ProgramFiles ?? "C:\\Program Files";
	const programFilesX86 = process.env["ProgramFiles(x86)"] ?? "C:\\Program Files (x86)";
	const joinWin = path.win32.join;
	const candidates = [];
	if (localAppData) {
		candidates.push(joinWin(localAppData, "Google", "Chrome", "Application", "chrome.exe"));
		candidates.push(joinWin(localAppData, "Google", "Chrome SxS", "Application", "chrome.exe"));
	}
	candidates.push(joinWin(programFiles, "Google", "Chrome", "Application", "chrome.exe"));
	candidates.push(joinWin(programFilesX86, "Google", "Chrome", "Application", "chrome.exe"));
	return findFirstChromeExecutable(candidates);
}
function resolveGoogleChromeExecutableForPlatform(platform) {
	if (platform === "darwin") return findGoogleChromeExecutableMac();
	if (platform === "linux") return findGoogleChromeExecutableLinux();
	if (platform === "win32") return findGoogleChromeExecutableWindows();
	return null;
}
function readBrowserVersion(executablePath) {
	const output = execText(executablePath, ["--version"], 2e3);
	if (!output) return null;
	return output.replace(/\s+/g, " ").trim();
}
function parseBrowserMajorVersion(rawVersion) {
	const match = [...String(rawVersion ?? "").matchAll(CHROME_VERSION_RE)].at(-1);
	if (!match?.[1]) return null;
	const major = Number.parseInt(match[1], 10);
	return Number.isFinite(major) ? major : null;
}
//#endregion
//#region src/plugin-sdk/browser-maintenance.ts
function createTrashCollisionSuffix() {
	return randomBytes(6).toString("hex");
}
const closeTrackedBrowserTabsForSessions = (async (...args) => {
	const closeTrackedTabs = tryLoadActivatedBundledPluginPublicSurfaceModuleSync({
		dirName: "browser",
		artifactBasename: "runtime-api.js"
	})?.closeTrackedBrowserTabsForSessions;
	if (typeof closeTrackedTabs !== "function") return 0;
	return await closeTrackedTabs(...args);
});
const movePathToTrash = (async (...args) => {
	const [targetPath] = args;
	try {
		const result = await runCommandWithTimeout(["trash", targetPath], { timeoutMs: 1e4 });
		if (result.code !== 0) throw new Error(`trash exited with code ${result.code ?? "unknown"}`);
		return targetPath;
	} catch {
		const homeDir = os.homedir();
		const pathRuntime = homeDir.startsWith("/") ? path.posix : path;
		const trashDir = pathRuntime.join(homeDir, ".Trash");
		await fs.mkdir(trashDir, { recursive: true });
		const base = pathRuntime.basename(targetPath);
		const timestamp = Date.now();
		let destination = pathRuntime.join(trashDir, `${base}-${timestamp}`);
		try {
			await fs.access(destination);
			destination = pathRuntime.join(trashDir, `${base}-${timestamp}-${createTrashCollisionSuffix()}`);
		} catch {}
		await fs.rename(targetPath, destination);
		return destination;
	}
});
//#endregion
//#region src/plugin-sdk/browser-runtime.ts
function loadFacadeModule() {
	return loadActivatedBundledPluginPublicSurfaceModuleSync({
		dirName: "browser",
		artifactBasename: "runtime-api.js"
	});
}
const applyBrowserProxyPaths = ((...args) => loadFacadeModule()["applyBrowserProxyPaths"](...args));
const browserAct = ((...args) => loadFacadeModule()["browserAct"](...args));
const browserArmDialog = ((...args) => loadFacadeModule()["browserArmDialog"](...args));
const browserArmFileChooser = ((...args) => loadFacadeModule()["browserArmFileChooser"](...args));
const browserCloseTab = ((...args) => loadFacadeModule()["browserCloseTab"](...args));
const browserConsoleMessages = ((...args) => loadFacadeModule()["browserConsoleMessages"](...args));
const browserCreateProfile = ((...args) => loadFacadeModule()["browserCreateProfile"](...args));
const browserDeleteProfile = ((...args) => loadFacadeModule()["browserDeleteProfile"](...args));
const browserFocusTab = ((...args) => loadFacadeModule()["browserFocusTab"](...args));
const browserHandlers = createLazyFacadeObjectValue(() => loadFacadeModule()["browserHandlers"]);
const browserNavigate = ((...args) => loadFacadeModule()["browserNavigate"](...args));
const browserOpenTab = ((...args) => loadFacadeModule()["browserOpenTab"](...args));
const browserPdfSave = ((...args) => loadFacadeModule()["browserPdfSave"](...args));
const browserProfiles = ((...args) => loadFacadeModule()["browserProfiles"](...args));
const browserResetProfile = ((...args) => loadFacadeModule()["browserResetProfile"](...args));
const browserScreenshotAction = ((...args) => loadFacadeModule()["browserScreenshotAction"](...args));
const browserSnapshot = ((...args) => loadFacadeModule()["browserSnapshot"](...args));
const browserStart = ((...args) => loadFacadeModule()["browserStart"](...args));
const browserStatus = ((...args) => loadFacadeModule()["browserStatus"](...args));
const browserStop = ((...args) => loadFacadeModule()["browserStop"](...args));
const browserTabAction = ((...args) => loadFacadeModule()["browserTabAction"](...args));
const browserTabs = ((...args) => loadFacadeModule()["browserTabs"](...args));
const createBrowserControlContext = ((...args) => loadFacadeModule()["createBrowserControlContext"](...args));
const createBrowserPluginService = ((...args) => loadFacadeModule()["createBrowserPluginService"](...args));
const createBrowserRouteContext = ((...args) => loadFacadeModule()["createBrowserRouteContext"](...args));
const createBrowserRouteDispatcher = ((...args) => loadFacadeModule()["createBrowserRouteDispatcher"](...args));
const createBrowserRuntimeState = ((...args) => loadFacadeModule()["createBrowserRuntimeState"](...args));
const createBrowserTool = ((...args) => loadFacadeModule()["createBrowserTool"](...args));
const definePluginEntry = ((...args) => loadFacadeModule()["definePluginEntry"](...args));
const ensureBrowserControlAuth = ((...args) => loadFacadeModule()["ensureBrowserControlAuth"](...args));
const getBrowserControlState = ((...args) => loadFacadeModule()["getBrowserControlState"](...args));
const getBrowserProfileCapabilities = ((...args) => loadFacadeModule()["getBrowserProfileCapabilities"](...args));
const handleBrowserGatewayRequest = ((...args) => loadFacadeModule()["handleBrowserGatewayRequest"](...args));
const installBrowserAuthMiddleware = ((...args) => loadFacadeModule()["installBrowserAuthMiddleware"](...args));
const installBrowserCommonMiddleware = ((...args) => loadFacadeModule()["installBrowserCommonMiddleware"](...args));
const isPersistentBrowserProfileMutation = ((...args) => loadFacadeModule()["isPersistentBrowserProfileMutation"](...args));
const normalizeBrowserFormField = ((...args) => loadFacadeModule()["normalizeBrowserFormField"](...args));
const normalizeBrowserFormFieldValue = ((...args) => loadFacadeModule()["normalizeBrowserFormFieldValue"](...args));
const normalizeBrowserRequestPath = ((...args) => loadFacadeModule()["normalizeBrowserRequestPath"](...args));
const persistBrowserProxyFiles = ((...args) => loadFacadeModule()["persistBrowserProxyFiles"](...args));
const registerBrowserCli = ((...args) => loadFacadeModule()["registerBrowserCli"](...args));
const registerBrowserRoutes = ((...args) => loadFacadeModule()["registerBrowserRoutes"](...args));
const resolveExistingPathsWithinRoot = ((...args) => loadFacadeModule()["resolveExistingPathsWithinRoot"](...args));
const resolveRequestedBrowserProfile = ((...args) => loadFacadeModule()["resolveRequestedBrowserProfile"](...args));
const runBrowserProxyCommand = ((...args) => loadFacadeModule()["runBrowserProxyCommand"](...args));
const startBrowserBridgeServer = ((...args) => loadFacadeModule()["startBrowserBridgeServer"](...args));
const startBrowserControlServiceFromConfig = ((...args) => loadFacadeModule()["startBrowserControlServiceFromConfig"](...args));
const stopBrowserBridgeServer = ((...args) => loadFacadeModule()["stopBrowserBridgeServer"](...args));
const stopBrowserControlService = ((...args) => loadFacadeModule()["stopBrowserControlService"](...args));
const stopBrowserRuntime = ((...args) => loadFacadeModule()["stopBrowserRuntime"](...args));
const trackSessionBrowserTab = ((...args) => loadFacadeModule()["trackSessionBrowserTab"](...args));
const untrackSessionBrowserTab = ((...args) => loadFacadeModule()["untrackSessionBrowserTab"](...args));
//#endregion
export { closeTrackedBrowserTabsForSessions as $, ensureBrowserControlAuth as A, persistBrowserProxyFiles as B, createBrowserControlContext as C, createBrowserRuntimeState as D, createBrowserRouteDispatcher as E, installBrowserCommonMiddleware as F, runBrowserProxyCommand as G, registerBrowserRoutes as H, isPersistentBrowserProfileMutation as I, stopBrowserBridgeServer as J, startBrowserBridgeServer as K, normalizeBrowserFormField as L, getBrowserProfileCapabilities as M, handleBrowserGatewayRequest as N, createBrowserTool as O, installBrowserAuthMiddleware as P, untrackSessionBrowserTab as Q, normalizeBrowserFormFieldValue as R, browserTabs as S, createBrowserRouteContext as T, resolveExistingPathsWithinRoot as U, registerBrowserCli as V, resolveRequestedBrowserProfile as W, stopBrowserRuntime as X, stopBrowserControlService as Y, trackSessionBrowserTab as Z, browserSnapshot as _, browserCloseTab as a, browserStop as b, browserDeleteProfile as c, browserNavigate as d, movePathToTrash as et, browserOpenTab as f, browserScreenshotAction as g, browserResetProfile as h, browserArmFileChooser as i, getBrowserControlState as j, definePluginEntry as k, browserFocusTab as l, browserProfiles as m, browserAct as n, readBrowserVersion as nt, browserConsoleMessages as o, browserPdfSave as p, startBrowserControlServiceFromConfig as q, browserArmDialog as r, resolveGoogleChromeExecutableForPlatform as rt, browserCreateProfile as s, applyBrowserProxyPaths as t, parseBrowserMajorVersion as tt, browserHandlers as u, browserStart as v, createBrowserPluginService as w, browserTabAction as x, browserStatus as y, normalizeBrowserRequestPath as z };
