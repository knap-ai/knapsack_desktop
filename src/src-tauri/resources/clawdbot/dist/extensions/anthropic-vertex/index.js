import { t as definePluginEntry } from "../../plugin-entry-DA7dUJNL.js";
import { i as resolveAnthropicVertexConfigApiKey } from "../../region-BCAVTxn2.js";
import { n as resolveImplicitAnthropicVertexProvider, t as mergeImplicitAnthropicVertexProvider } from "../../api-BHFFbiel.js";
//#region extensions/anthropic-vertex/index.ts
const PROVIDER_ID = "anthropic-vertex";
var anthropic_vertex_default = definePluginEntry({
	id: PROVIDER_ID,
	name: "Anthropic Vertex Provider",
	description: "Bundled Anthropic Vertex provider plugin",
	register(api) {
		api.registerProvider({
			id: PROVIDER_ID,
			label: "Anthropic Vertex",
			docsPath: "/providers/models",
			auth: [],
			catalog: {
				order: "simple",
				run: async (ctx) => {
					const implicit = await resolveImplicitAnthropicVertexProvider({ env: ctx.env });
					if (!implicit) return null;
					return { provider: mergeImplicitAnthropicVertexProvider({
						existing: ctx.config.models?.providers?.[PROVIDER_ID],
						implicit
					}) };
				}
			},
			resolveConfigApiKey: ({ env }) => resolveAnthropicVertexConfigApiKey(env),
			capabilities: {
				providerFamily: "anthropic",
				dropThinkingBlockModelHints: ["claude"]
			}
		});
	}
});
//#endregion
export { anthropic_vertex_default as default };
