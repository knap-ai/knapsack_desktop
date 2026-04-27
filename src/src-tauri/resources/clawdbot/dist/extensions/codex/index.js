import { createCodexAppServerAgentHarness } from "./harness.js";
import { buildCodexMediaUnderstandingProvider } from "./media-understanding-provider.js";
import { buildCodexProvider } from "./provider.js";
import { n as handleCodexConversationInboundClaim, t as handleCodexConversationBindingResolved } from "./conversation-binding-BTs128LH.js";
import { resolveLivePluginConfigObject } from "openclaw/plugin-sdk/config-runtime";
import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
//#region extensions/codex/src/commands.ts
function createCodexCommand(options) {
	return {
		name: "codex",
		description: "Inspect and control the Codex app-server harness",
		acceptsArgs: true,
		requireAuth: true,
		handler: (ctx) => handleCodexCommand(ctx, options)
	};
}
async function handleCodexCommand(ctx, options = {}) {
	const { handleCodexSubcommand } = await import("./command-handlers-HUCrU4lp.js");
	return await handleCodexSubcommand(ctx, options);
}
//#endregion
//#region extensions/codex/index.ts
var codex_default = definePluginEntry({
	id: "codex",
	name: "Codex",
	description: "Codex app-server harness and Codex-managed GPT model catalog.",
	register(api) {
		const resolveCurrentPluginConfig = () => resolveLivePluginConfigObject(api.runtime.config?.loadConfig, "codex", api.pluginConfig) ?? api.pluginConfig;
		api.registerAgentHarness(createCodexAppServerAgentHarness({ pluginConfig: api.pluginConfig }));
		api.registerProvider(buildCodexProvider({ pluginConfig: api.pluginConfig }));
		api.registerMediaUnderstandingProvider(buildCodexMediaUnderstandingProvider({ pluginConfig: api.pluginConfig }));
		api.registerCommand(createCodexCommand({ pluginConfig: api.pluginConfig }));
		api.on("inbound_claim", (event, ctx) => handleCodexConversationInboundClaim(event, ctx, { pluginConfig: resolveCurrentPluginConfig() }));
		api.onConversationBindingResolved(handleCodexConversationBindingResolved);
	}
});
//#endregion
export { codex_default as default };
