import { tryDispatchAcpReplyHook } from "./runtime-api.js";
import { n as createAcpxPluginConfigSchema, t as createAcpxRuntimeService } from "./register.runtime-b8kSOZpz.js";
//#region extensions/acpx/index.ts
const plugin = {
	id: "acpx",
	name: "ACPX Runtime",
	description: "Embedded ACP runtime backend with plugin-owned session and transport management.",
	configSchema: () => createAcpxPluginConfigSchema(),
	register(api) {
		api.registerService(createAcpxRuntimeService({ pluginConfig: api.pluginConfig }));
		api.on("reply_dispatch", tryDispatchAcpReplyHook);
	}
};
//#endregion
export { plugin as default };
