import { createRequire } from "node:module";
import path from "node:path";
//#region src/plugins/native-module-require.ts
const nodeRequire = createRequire(import.meta.url);
function isJavaScriptModulePath(modulePath) {
	return [
		".js",
		".mjs",
		".cjs"
	].includes(path.extname(modulePath).toLowerCase());
}
function tryNativeRequireJavaScriptModule(modulePath, options = {}) {
	if (process.platform === "win32" && options.allowWindows !== true) return { ok: false };
	if (!isJavaScriptModulePath(modulePath)) return { ok: false };
	try {
		return {
			ok: true,
			moduleExport: nodeRequire(modulePath)
		};
	} catch {
		return { ok: false };
	}
}
//#endregion
export { tryNativeRequireJavaScriptModule as n, isJavaScriptModulePath as t };
