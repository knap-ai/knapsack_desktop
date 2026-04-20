import { n as resolvePreferredOpenClawTmpDir } from "./tmp-openclaw-dir-eyAoWbVe.js";
import { i as loadBundledPluginPublicSurfaceModuleSync } from "./facade-loader-CGu7k8Om.js";
import path from "node:path";
//#region src/plugin-sdk/browser-profiles.ts
const DEFAULT_OPENCLAW_BROWSER_ENABLED = true;
const DEFAULT_BROWSER_EVALUATE_ENABLED = true;
const DEFAULT_OPENCLAW_BROWSER_COLOR = "#FF4500";
const DEFAULT_OPENCLAW_BROWSER_PROFILE_NAME = "openclaw";
const DEFAULT_BROWSER_DEFAULT_PROFILE_NAME = "openclaw";
const DEFAULT_AI_SNAPSHOT_MAX_CHARS = 8e4;
const DEFAULT_UPLOAD_DIR = path.join(resolvePreferredOpenClawTmpDir(), "uploads");
function loadBrowserProfilesSurface() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "browser",
		artifactBasename: "browser-profiles.js"
	});
}
function resolveBrowserConfig(cfg, rootConfig) {
	return loadBrowserProfilesSurface().resolveBrowserConfig(cfg, rootConfig);
}
function resolveProfile(resolved, profileName) {
	return loadBrowserProfilesSurface().resolveProfile(resolved, profileName);
}
//#endregion
export { DEFAULT_OPENCLAW_BROWSER_ENABLED as a, resolveBrowserConfig as c, DEFAULT_OPENCLAW_BROWSER_COLOR as i, resolveProfile as l, DEFAULT_BROWSER_DEFAULT_PROFILE_NAME as n, DEFAULT_OPENCLAW_BROWSER_PROFILE_NAME as o, DEFAULT_BROWSER_EVALUATE_ENABLED as r, DEFAULT_UPLOAD_DIR as s, DEFAULT_AI_SNAPSHOT_MAX_CHARS as t };
