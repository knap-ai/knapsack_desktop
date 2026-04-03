import { t as definePluginEntry } from "../../plugin-entry-DA7dUJNL.js";
import { n as createExaWebSearchProvider } from "../../exa-web-search-provider-KWSL0j74.js";
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
