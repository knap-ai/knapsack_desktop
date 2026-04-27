import { a as normalizeLowercaseStringOrEmpty } from "../../string-coerce-C1IzJjqi.js";
import { i as applyXaiModelCompat } from "../../provider-tools-VpDDhpdz.js";
import "../../text-runtime-B1c54bxG.js";
import { t as defineSingleProviderPluginEntry } from "../../provider-entry-CVsaqhfb.js";
import { i as VENICE_DEFAULT_MODEL_REF } from "../../models-CSjDQ74B.js";
import { t as buildVeniceProvider } from "../../provider-catalog-BZCHXQ06.js";
import { t as applyVeniceConfig } from "../../onboard-D97vAVfb.js";
//#region extensions/venice/index.ts
const PROVIDER_ID = "venice";
function isXaiBackedVeniceModel(modelId) {
	return normalizeLowercaseStringOrEmpty(modelId).includes("grok");
}
var venice_default = defineSingleProviderPluginEntry({
	id: PROVIDER_ID,
	name: "Venice Provider",
	description: "Bundled Venice provider plugin",
	provider: {
		label: "Venice",
		docsPath: "/providers/venice",
		auth: [{
			methodId: "api-key",
			label: "Venice AI API key",
			hint: "Privacy-focused (uncensored models)",
			optionKey: "veniceApiKey",
			flagName: "--venice-api-key",
			envVar: "VENICE_API_KEY",
			promptMessage: "Enter Venice AI API key",
			defaultModel: VENICE_DEFAULT_MODEL_REF,
			applyConfig: (cfg) => applyVeniceConfig(cfg),
			noteMessage: [
				"Venice AI provides privacy-focused inference with uncensored models.",
				"Get your API key at: https://venice.ai/settings/api",
				"Supports 'private' (fully private) and 'anonymized' (proxy) modes."
			].join("\n"),
			noteTitle: "Venice AI",
			wizard: { groupLabel: "Venice AI" }
		}],
		catalog: { buildProvider: buildVeniceProvider },
		normalizeResolvedModel: ({ modelId, model }) => isXaiBackedVeniceModel(modelId) ? applyXaiModelCompat(model) : void 0
	}
});
//#endregion
export { venice_default as default };
