import { createWebSearchProviderContractFields, mergeScopedSearchConfig, resolveProviderWebSearchPluginConfig } from "openclaw/plugin-sdk/provider-web-search-config-contract";
//#region extensions/google/src/gemini-web-search-provider.ts
const GEMINI_CREDENTIAL_PATH = "plugins.entries.google.config.webSearch.apiKey";
let geminiWebSearchRuntimePromise;
function loadGeminiWebSearchRuntime() {
	geminiWebSearchRuntimePromise ??= import("./gemini-web-search-provider.runtime-CsS7vgCl.js");
	return geminiWebSearchRuntimePromise;
}
const GEMINI_TOOL_PARAMETERS = {
	type: "object",
	properties: {
		query: {
			type: "string",
			description: "Search query string."
		},
		count: {
			type: "number",
			description: "Number of results to return (1-10).",
			minimum: 1,
			maximum: 10
		},
		country: {
			type: "string",
			description: "Not supported by Gemini."
		},
		language: {
			type: "string",
			description: "Not supported by Gemini."
		},
		freshness: {
			type: "string",
			description: "Not supported by Gemini."
		},
		date_after: {
			type: "string",
			description: "Not supported by Gemini."
		},
		date_before: {
			type: "string",
			description: "Not supported by Gemini."
		}
	},
	required: ["query"]
};
function createGeminiToolDefinition(searchConfig) {
	return {
		description: "Search the web using Gemini with Google Search grounding. Returns AI-synthesized answers with citations from Google Search.",
		parameters: GEMINI_TOOL_PARAMETERS,
		execute: async (args) => {
			const { executeGeminiSearch } = await loadGeminiWebSearchRuntime();
			return await executeGeminiSearch(args, searchConfig);
		}
	};
}
function createGeminiWebSearchProvider() {
	return {
		id: "gemini",
		label: "Gemini (Google Search)",
		hint: "Requires Google Gemini API key · Google Search grounding",
		onboardingScopes: ["text-inference"],
		credentialLabel: "Google Gemini API key",
		envVars: ["GEMINI_API_KEY"],
		placeholder: "AIza...",
		signupUrl: "https://aistudio.google.com/apikey",
		docsUrl: "https://docs.openclaw.ai/tools/web",
		autoDetectOrder: 20,
		credentialPath: GEMINI_CREDENTIAL_PATH,
		...createWebSearchProviderContractFields({
			credentialPath: GEMINI_CREDENTIAL_PATH,
			searchCredential: {
				type: "scoped",
				scopeId: "gemini"
			},
			configuredCredential: { pluginId: "google" }
		}),
		createTool: (ctx) => createGeminiToolDefinition(mergeScopedSearchConfig(ctx.searchConfig, "gemini", resolveProviderWebSearchPluginConfig(ctx.config, "google")))
	};
}
//#endregion
export { createGeminiWebSearchProvider as t };
