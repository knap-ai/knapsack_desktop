import { a as buildMoonshotProvider } from "../../provider-catalog-DyN0NNis.js";
//#region extensions/moonshot/provider-discovery.ts
const moonshotProviderDiscovery = {
	id: "moonshot",
	label: "Moonshot",
	docsPath: "/providers/moonshot",
	auth: [],
	staticCatalog: {
		order: "simple",
		run: async () => ({ provider: buildMoonshotProvider() })
	}
};
//#endregion
export { moonshotProviderDiscovery as default, moonshotProviderDiscovery };
