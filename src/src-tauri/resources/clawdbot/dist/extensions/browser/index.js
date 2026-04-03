import { t as definePluginEntry } from "../../plugin-entry-DA7dUJNL.js";
import { a as createBrowserTool, i as registerBrowserCli, n as handleBrowserGatewayRequest, r as createBrowserPluginService } from "../../runtime-api-DN3n8SWI.js";
//#region extensions/browser/index.ts
var browser_default = definePluginEntry({
	id: "browser",
	name: "Browser",
	description: "Default browser tool plugin",
	register(api) {
		api.registerTool(((ctx) => createBrowserTool({
			sandboxBridgeUrl: ctx.browser?.sandboxBridgeUrl,
			allowHostControl: ctx.browser?.allowHostControl,
			agentSessionKey: ctx.sessionKey
		})));
		api.registerCli(({ program }) => registerBrowserCli(program), { commands: ["browser"] });
		api.registerGatewayMethod("browser.request", handleBrowserGatewayRequest, { scope: "operator.write" });
		api.registerService(createBrowserPluginService());
	}
});
//#endregion
export { browser_default as default };
