import { t as defineSingleProviderPluginEntry } from "../../provider-entry-CVsaqhfb.js";
import { t as buildNvidiaProvider } from "../../provider-catalog-DRMzzBia2.js";
var nvidia_default = defineSingleProviderPluginEntry({
	id: "nvidia",
	name: "NVIDIA Provider",
	description: "Bundled NVIDIA provider plugin",
	provider: {
		label: "NVIDIA",
		docsPath: "/providers/nvidia",
		envVars: ["NVIDIA_API_KEY"],
		auth: [{
			methodId: "api-key",
			label: "NVIDIA API key",
			hint: "API key",
			optionKey: "nvidiaApiKey",
			flagName: "--nvidia-api-key",
			envVar: "NVIDIA_API_KEY",
			promptMessage: "Enter NVIDIA API key",
			wizard: {
				choiceId: "nvidia-api-key",
				choiceLabel: "NVIDIA API key",
				groupId: "nvidia",
				groupLabel: "NVIDIA",
				groupHint: "API key"
			}
		}],
		catalog: { buildProvider: buildNvidiaProvider }
	}
});
//#endregion
export { nvidia_default as default };
