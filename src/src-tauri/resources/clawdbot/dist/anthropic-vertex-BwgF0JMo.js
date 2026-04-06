import { a as loadBundledPluginPublicSurfaceModuleSync } from "./facade-runtime-D_0VC8Qr.js";
//#region src/plugin-sdk/anthropic-vertex.ts
function loadFacadeModule() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "anthropic-vertex",
		artifactBasename: "api.js"
	});
}
const ANTHROPIC_VERTEX_DEFAULT_MODEL_ID = loadFacadeModule()["ANTHROPIC_VERTEX_DEFAULT_MODEL_ID"];
const buildAnthropicVertexProvider = ((...args) => loadFacadeModule()["buildAnthropicVertexProvider"](...args));
const hasAnthropicVertexAvailableAuth = ((...args) => loadFacadeModule()["hasAnthropicVertexAvailableAuth"](...args));
const hasAnthropicVertexCredentials = ((...args) => loadFacadeModule()["hasAnthropicVertexCredentials"](...args));
const mergeImplicitAnthropicVertexProvider = ((...args) => loadFacadeModule()["mergeImplicitAnthropicVertexProvider"](...args));
const resolveAnthropicVertexClientRegion = ((...args) => loadFacadeModule()["resolveAnthropicVertexClientRegion"](...args));
const resolveAnthropicVertexConfigApiKey = ((...args) => loadFacadeModule()["resolveAnthropicVertexConfigApiKey"](...args));
const resolveImplicitAnthropicVertexProvider = ((...args) => loadFacadeModule()["resolveImplicitAnthropicVertexProvider"](...args));
const resolveAnthropicVertexProjectId = ((...args) => loadFacadeModule()["resolveAnthropicVertexProjectId"](...args));
const resolveAnthropicVertexRegion = ((...args) => loadFacadeModule()["resolveAnthropicVertexRegion"](...args));
const resolveAnthropicVertexRegionFromBaseUrl = ((...args) => loadFacadeModule()["resolveAnthropicVertexRegionFromBaseUrl"](...args));
//#endregion
export { mergeImplicitAnthropicVertexProvider as a, resolveAnthropicVertexProjectId as c, resolveImplicitAnthropicVertexProvider as d, hasAnthropicVertexCredentials as i, resolveAnthropicVertexRegion as l, buildAnthropicVertexProvider as n, resolveAnthropicVertexClientRegion as o, hasAnthropicVertexAvailableAuth as r, resolveAnthropicVertexConfigApiKey as s, ANTHROPIC_VERTEX_DEFAULT_MODEL_ID as t, resolveAnthropicVertexRegionFromBaseUrl as u };
