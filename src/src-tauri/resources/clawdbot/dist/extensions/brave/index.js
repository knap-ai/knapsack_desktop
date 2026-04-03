import { t as definePluginEntry } from "../../plugin-entry-DA7dUJNL.js";
import { n as createBraveWebSearchProvider } from "../../brave-web-search-provider-CMPeY1_v.js";
//#region extensions/brave/index.ts
var brave_default = definePluginEntry({
	id: "brave",
	name: "Brave Plugin",
	description: "Bundled Brave plugin",
	register(api) {
		api.registerWebSearchProvider(createBraveWebSearchProvider());
	}
});
//#endregion
export { brave_default as default };
