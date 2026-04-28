import { createCodexAppServerAgentHarness } from "./harness.js";
import { buildCodexMediaUnderstandingProvider } from "./media-understanding-provider.js";
import { buildCodexProvider } from "./provider.js";
import { n as handleCodexConversationInboundClaim, t as handleCodexConversationBindingResolved } from "./conversation-binding-DuQ2dfSZ.js";
import { resolveLivePluginConfigObject } from "openclaw/plugin-sdk/plugin-config-runtime";
import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
//#region extensions/codex/src/commands.ts
function createCodexCommand(options) {
	return {
		name: "codex",
		description: "Inspect and control the Codex app-server harness",
		agentPromptGuidance: ["Native Codex app-server plugin is available (`/codex ...`). For Codex bind/control/thread/resume/steer/stop requests, prefer `/codex bind`, `/codex threads`, `/codex resume`, `/codex steer`, and `/codex stop` over ACP.", "Use ACP for Codex only when the user explicitly asks for ACP/acpx or wants to test the ACP path."],
		acceptsArgs: true,
		requireAuth: true,
		handler: (ctx) => handleCodexCommand(ctx, options)
	};
}
async function handleCodexCommand(ctx, options = {}) {
	const { handleCodexSubcommand } = await import("./command-handlers-DJ51z90W.js");
	return await handleCodexSubcommand(ctx, options);
}
//#endregion
//#region extensions/codex/index.ts
var codex_default = definePluginEntry({
	id: "codex",
	name: "Codex",
	description: "Codex app-server harness and Codex-managed GPT model catalog.",
	register(api) {
		const resolveCurrentPluginConfig = () => resolveLivePluginConfigObject(api.runtime.config?.current ? () => api.runtime.config.current() : void 0, "codex", api.pluginConfig) ?? api.pluginConfig;
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
