import { c as setScopedCredentialValue, o as resolveProviderWebSearchPluginConfig, r as getScopedCredentialValue, s as setProviderWebSearchPluginConfigValue } from "./provider-web-search-BvBfxXst.js";
import { t as enablePluginInConfig } from "./enable-CpDMTfhy.js";
import { n as runFirecrawlSearch } from "./firecrawl-client-CaC60Tes.js";
import { Type } from "@sinclair/typebox";
//#region extensions/firecrawl/src/firecrawl-search-provider.ts
const GenericFirecrawlSearchSchema = Type.Object({
	query: Type.String({ description: "Search query string." }),
	count: Type.Optional(Type.Number({
		description: "Number of results to return (1-10).",
		minimum: 1,
		maximum: 10
	}))
}, { additionalProperties: false });
function createFirecrawlWebSearchProvider() {
	return {
		id: "firecrawl",
		label: "Firecrawl Search",
		hint: "Structured results with optional result scraping",
		onboardingScopes: ["text-inference"],
		credentialLabel: "Firecrawl API key",
		envVars: ["FIRECRAWL_API_KEY"],
		placeholder: "fc-...",
		signupUrl: "https://www.firecrawl.dev/",
		docsUrl: "https://docs.openclaw.ai/tools/firecrawl",
		autoDetectOrder: 60,
		credentialPath: "plugins.entries.firecrawl.config.webSearch.apiKey",
		inactiveSecretPaths: ["plugins.entries.firecrawl.config.webSearch.apiKey"],
		getCredentialValue: (searchConfig) => getScopedCredentialValue(searchConfig, "firecrawl"),
		setCredentialValue: (searchConfigTarget, value) => setScopedCredentialValue(searchConfigTarget, "firecrawl", value),
		getConfiguredCredentialValue: (config) => resolveProviderWebSearchPluginConfig(config, "firecrawl")?.apiKey,
		setConfiguredCredentialValue: (configTarget, value) => {
			setProviderWebSearchPluginConfigValue(configTarget, "firecrawl", "apiKey", value);
		},
		applySelectionConfig: (config) => enablePluginInConfig(config, "firecrawl").config,
		createTool: (ctx) => ({
			description: "Search the web using Firecrawl. Returns structured results with snippets from Firecrawl Search. Use firecrawl_search for Firecrawl-specific knobs like sources or categories.",
			parameters: GenericFirecrawlSearchSchema,
			execute: async (args) => await runFirecrawlSearch({
				cfg: ctx.config,
				query: typeof args.query === "string" ? args.query : "",
				count: typeof args.count === "number" ? args.count : void 0
			})
		})
	};
}
//#endregion
export { createFirecrawlWebSearchProvider as t };
