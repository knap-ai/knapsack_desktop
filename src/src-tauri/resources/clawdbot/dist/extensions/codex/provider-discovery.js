import { CODEX_APP_SERVER_AUTH_MARKER, CODEX_PROVIDER_ID, FALLBACK_CODEX_MODELS, buildCodexProviderConfig } from "./provider-catalog.js";
//#region extensions/codex/provider-discovery.ts
function resolveCodexPluginConfig(ctx) {
	return (ctx.config.plugins?.entries)?.codex?.config;
}
async function runCodexCatalog(ctx) {
	const { buildCodexProviderCatalog } = await import("./provider.js");
	return await buildCodexProviderCatalog({
		env: ctx.env,
		pluginConfig: resolveCodexPluginConfig(ctx)
	});
}
const codexProviderDiscovery = {
	id: CODEX_PROVIDER_ID,
	label: "Codex",
	docsPath: "/providers/models",
	auth: [],
	catalog: {
		order: "late",
		run: runCodexCatalog
	},
	staticCatalog: {
		order: "late",
		run: async () => ({ provider: buildCodexProviderConfig(FALLBACK_CODEX_MODELS) })
	},
	resolveSyntheticAuth: () => ({
		apiKey: CODEX_APP_SERVER_AUTH_MARKER,
		source: "codex-app-server",
		mode: "token"
	})
};
//#endregion
export { codexProviderDiscovery, codexProviderDiscovery as default };
