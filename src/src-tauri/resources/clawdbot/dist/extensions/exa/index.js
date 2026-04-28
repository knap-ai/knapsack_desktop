import { t as definePluginEntry } from "../../plugin-entry-BBPiA0af.js";
import { t as createExaWebSearchProvider } from "../../exa-web-search-provider-DJ-JdDrL.js";
//#region extensions/exa/index.ts
var exa_default = definePluginEntry({
	id: "exa",
	name: "Exa Plugin",
	description: "Bundled Exa web search plugin",
	register(api) {
		api.registerWebSearchProvider(createExaWebSearchProvider());
	}
});
//#endregion
export { exa_default as default };
