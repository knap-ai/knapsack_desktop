import { r as buildOllamaProvider } from "../../provider-models-13s6KSAW.js";
import { i as resolveOllamaDiscoveryResult, n as OLLAMA_PROVIDER_ID } from "../../discovery-shared-HsqYWuXT.js";
//#region extensions/ollama/provider-discovery.ts
function resolveOllamaPluginConfig(ctx) {
	return (ctx.config.plugins?.entries ?? {}).ollama?.config ?? {};
}
async function runOllamaDiscovery(ctx) {
	return await resolveOllamaDiscoveryResult({
		ctx,
		pluginConfig: resolveOllamaPluginConfig(ctx),
		buildProvider: buildOllamaProvider
	});
}
const ollamaProviderDiscovery = {
	id: OLLAMA_PROVIDER_ID,
	label: "Ollama",
	docsPath: "/providers/ollama",
	envVars: ["OLLAMA_API_KEY"],
	auth: [],
	discovery: {
		order: "late",
		run: runOllamaDiscovery
	}
};
//#endregion
export { ollamaProviderDiscovery as default, ollamaProviderDiscovery };
