import { t as createWebSearchProviderContractFields } from "../../provider-web-search-contract-DOpaloH2.js";
//#region extensions/duckduckgo/web-search-contract-api.ts
function createDuckDuckGoWebSearchProvider() {
	return {
		id: "duckduckgo",
		label: "DuckDuckGo Search (experimental)",
		hint: "Free web search fallback with no API key required",
		requiresCredential: false,
		envVars: [],
		placeholder: "(no key needed)",
		signupUrl: "https://duckduckgo.com/",
		docsUrl: "https://docs.openclaw.ai/tools/web",
		autoDetectOrder: 100,
		credentialPath: "",
		...createWebSearchProviderContractFields({
			credentialPath: "",
			searchCredential: {
				type: "scoped",
				scopeId: "duckduckgo"
			},
			selectionPluginId: "duckduckgo"
		}),
		createTool: () => null
	};
}
//#endregion
export { createDuckDuckGoWebSearchProvider };
