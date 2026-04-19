import { createWebSearchProviderContractFields } from "openclaw/plugin-sdk/provider-web-search-config-contract";
//#region extensions/google/web-search-contract-api.ts
function createGeminiWebSearchProvider() {
	const credentialPath = "plugins.entries.google.config.webSearch.apiKey";
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
		credentialPath,
		...createWebSearchProviderContractFields({
			credentialPath,
			searchCredential: {
				type: "scoped",
				scopeId: "gemini"
			},
			configuredCredential: { pluginId: "google" }
		}),
		createTool: () => null
	};
}
//#endregion
export { createGeminiWebSearchProvider };
