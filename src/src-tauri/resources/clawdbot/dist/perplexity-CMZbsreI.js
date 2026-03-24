import { t as definePluginEntry } from "./plugin-entry-B2shVOQl.js";
import { n as createPerplexityWebSearchProvider } from "./perplexity-web-search-provider-CI38RNUU.js";
//#region extensions/perplexity/index.ts
var perplexity_default = definePluginEntry({
	id: "perplexity",
	name: "Perplexity Plugin",
	description: "Bundled Perplexity plugin",
	register(api) {
		api.registerWebSearchProvider(createPerplexityWebSearchProvider());
	}
});
//#endregion
export { perplexity_default as t };
