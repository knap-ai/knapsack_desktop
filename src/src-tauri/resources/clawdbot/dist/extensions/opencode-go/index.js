import { i as PASSTHROUGH_GEMINI_REPLAY_HOOKS } from "../../provider-model-shared-DyDnBaDe.js";
import { t as definePluginEntry } from "../../plugin-entry-Bkat4og3.js";
import { t as createOpencodeCatalogApiKeyAuthMethod } from "../../opencode-BixjxGk1.js";
import { n as applyOpencodeGoConfig, t as OPENCODE_GO_DEFAULT_MODEL_REF } from "../../onboard-CiWN1Wmk.js";
//#region extensions/opencode-go/index.ts
const PROVIDER_ID = "opencode-go";
var opencode_go_default = definePluginEntry({
	id: PROVIDER_ID,
	name: "OpenCode Go Provider",
	description: "Bundled OpenCode Go provider plugin",
	register(api) {
		api.registerProvider({
			id: PROVIDER_ID,
			label: "OpenCode Go",
			docsPath: "/providers/models",
			envVars: ["OPENCODE_API_KEY", "OPENCODE_ZEN_API_KEY"],
			auth: [createOpencodeCatalogApiKeyAuthMethod({
				providerId: PROVIDER_ID,
				label: "OpenCode Go catalog",
				optionKey: "opencodeGoApiKey",
				flagName: "--opencode-go-api-key",
				defaultModel: OPENCODE_GO_DEFAULT_MODEL_REF,
				applyConfig: (cfg) => applyOpencodeGoConfig(cfg),
				noteMessage: [
					"OpenCode uses one API key across the Zen and Go catalogs.",
					"Go focuses on Kimi, GLM, and MiniMax coding models.",
					"Get your API key at: https://opencode.ai/auth"
				].join("\n"),
				choiceId: "opencode-go",
				choiceLabel: "OpenCode Go catalog"
			})],
			...PASSTHROUGH_GEMINI_REPLAY_HOOKS,
			isModernModelRef: () => true
		});
	}
});
//#endregion
export { opencode_go_default as default };
