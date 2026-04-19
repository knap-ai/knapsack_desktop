import "./model-auth-markers-ve-OgG6R.js";
import "./model-auth-env-B-45Q6PX.js";
import { fileURLToPath, pathToFileURL } from "node:url";
import fs from "node:fs";
import path from "node:path";
//#region src/plugin-sdk/provider-auth-runtime.ts
const RUNTIME_MODEL_AUTH_CANDIDATES = ["./runtime-model-auth.runtime", "../plugins/runtime/runtime-model-auth.runtime"];
const RUNTIME_MODEL_AUTH_EXTENSIONS = [
	".js",
	".ts",
	".mjs",
	".mts",
	".cjs",
	".cts"
];
function resolveRuntimeModelAuthModuleHref() {
	const baseDir = path.dirname(fileURLToPath(import.meta.url));
	for (const relativeBase of RUNTIME_MODEL_AUTH_CANDIDATES) for (const ext of RUNTIME_MODEL_AUTH_EXTENSIONS) {
		const candidate = path.resolve(baseDir, `${relativeBase}${ext}`);
		if (fs.existsSync(candidate)) return pathToFileURL(candidate).href;
	}
	throw new Error(`Unable to resolve runtime model auth module from ${import.meta.url}`);
}
async function loadRuntimeModelAuthModule() {
	return await import(resolveRuntimeModelAuthModuleHref());
}
async function resolveApiKeyForProvider(params) {
	const { resolveApiKeyForProvider } = await loadRuntimeModelAuthModule();
	return resolveApiKeyForProvider(params);
}
async function getRuntimeAuthForModel(params) {
	const { getRuntimeAuthForModel } = await loadRuntimeModelAuthModule();
	return getRuntimeAuthForModel(params);
}
//#endregion
export { resolveApiKeyForProvider as n, getRuntimeAuthForModel as t };
