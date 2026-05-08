import { i as loadBundledPluginPublicSurfaceModuleSync } from "./facade-loader-BAtcmKGO.js";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
//#region src/plugin-sdk/browser-maintenance.ts
let cachedBrowserMaintenanceSurface;
let secureRandomRuntimePromise;
let execRuntimePromise;
function hasRequestedSessionKeys(sessionKeys) {
	return sessionKeys.some((key) => Boolean(key?.trim()));
}
function loadBrowserMaintenanceSurface() {
	cachedBrowserMaintenanceSurface ??= loadBundledPluginPublicSurfaceModuleSync({
		dirName: "browser",
		artifactBasename: "browser-maintenance.js"
	});
	return cachedBrowserMaintenanceSurface;
}
function loadSecureRandomRuntime() {
	secureRandomRuntimePromise ??= import("./secure-random-DrztuQ67.js");
	return secureRandomRuntimePromise;
}
function loadExecRuntime() {
	execRuntimePromise ??= import("./exec-CPPEX8uQ.js");
	return execRuntimePromise;
}
async function closeTrackedBrowserTabsForSessions(params) {
	if (!hasRequestedSessionKeys(params.sessionKeys)) return 0;
	let surface;
	try {
		surface = loadBrowserMaintenanceSurface();
	} catch (error) {
		params.onWarn?.(`browser cleanup unavailable: ${String(error)}`);
		return 0;
	}
	return await surface.closeTrackedBrowserTabsForSessions(params);
}
async function movePathToTrash(targetPath) {
	const [{ generateSecureToken }, { runExec }] = await Promise.all([loadSecureRandomRuntime(), loadExecRuntime()]);
	try {
		await runExec("trash", [targetPath], { timeoutMs: 1e4 });
		return targetPath;
	} catch {
		const trashDir = path.join(os.homedir(), ".Trash");
		fs.mkdirSync(trashDir, { recursive: true });
		const base = path.basename(targetPath);
		let dest = path.join(trashDir, `${base}-${Date.now()}`);
		if (fs.existsSync(dest)) dest = path.join(trashDir, `${base}-${Date.now()}-${generateSecureToken(6)}`);
		fs.renameSync(targetPath, dest);
		return dest;
	}
}
//#endregion
export { movePathToTrash as n, closeTrackedBrowserTabsForSessions as t };
