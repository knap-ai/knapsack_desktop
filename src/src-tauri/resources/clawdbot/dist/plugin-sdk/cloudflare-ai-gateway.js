import { a as loadBundledPluginPublicSurfaceModuleSync } from "../facade-runtime-D_0VC8Qr.js";
//#region src/plugin-sdk/cloudflare-ai-gateway.ts
function loadFacadeModule() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "cloudflare-ai-gateway",
		artifactBasename: "api.js"
	});
}
const applyCloudflareAiGatewayConfig = ((...args) => loadFacadeModule()["applyCloudflareAiGatewayConfig"](...args));
const applyCloudflareAiGatewayProviderConfig = ((...args) => loadFacadeModule()["applyCloudflareAiGatewayProviderConfig"](...args));
const buildCloudflareAiGatewayConfigPatch = ((...args) => loadFacadeModule()["buildCloudflareAiGatewayConfigPatch"](...args));
const buildCloudflareAiGatewayModelDefinition = ((...args) => loadFacadeModule()["buildCloudflareAiGatewayModelDefinition"](...args));
const CLOUDFLARE_AI_GATEWAY_DEFAULT_MODEL_ID = loadFacadeModule()["CLOUDFLARE_AI_GATEWAY_DEFAULT_MODEL_ID"];
const CLOUDFLARE_AI_GATEWAY_DEFAULT_MODEL_REF = loadFacadeModule()["CLOUDFLARE_AI_GATEWAY_DEFAULT_MODEL_REF"];
const CLOUDFLARE_AI_GATEWAY_PROVIDER_ID = loadFacadeModule()["CLOUDFLARE_AI_GATEWAY_PROVIDER_ID"];
const resolveCloudflareAiGatewayBaseUrl = ((...args) => loadFacadeModule()["resolveCloudflareAiGatewayBaseUrl"](...args));
//#endregion
export { CLOUDFLARE_AI_GATEWAY_DEFAULT_MODEL_ID, CLOUDFLARE_AI_GATEWAY_DEFAULT_MODEL_REF, CLOUDFLARE_AI_GATEWAY_PROVIDER_ID, applyCloudflareAiGatewayConfig, applyCloudflareAiGatewayProviderConfig, buildCloudflareAiGatewayConfigPatch, buildCloudflareAiGatewayModelDefinition, resolveCloudflareAiGatewayBaseUrl };
