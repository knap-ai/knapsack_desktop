import { st as OPENCODE_ZEN_DEFAULT_MODEL_REF } from "./provider-models-BKjzpTsb.js";
import { f as withAgentModelAliases, t as applyAgentDefaultModelPrimary } from "./provider-onboarding-config-AjQQP6EK.js";
//#region extensions/opencode/onboard.ts
function applyOpencodeZenProviderConfig(cfg) {
	return {
		...cfg,
		agents: {
			...cfg.agents,
			defaults: {
				...cfg.agents?.defaults,
				models: withAgentModelAliases(cfg.agents?.defaults?.models, [{
					modelRef: OPENCODE_ZEN_DEFAULT_MODEL_REF,
					alias: "Opus"
				}])
			}
		}
	};
}
function applyOpencodeZenConfig(cfg) {
	return applyAgentDefaultModelPrimary(applyOpencodeZenProviderConfig(cfg), OPENCODE_ZEN_DEFAULT_MODEL_REF);
}
//#endregion
export { applyOpencodeZenProviderConfig as n, applyOpencodeZenConfig as t };
