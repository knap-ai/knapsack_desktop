import { gt as OPENCODE_GO_DEFAULT_MODEL_REF } from "./provider-models-BKjzpTsb.js";
import { f as withAgentModelAliases, t as applyAgentDefaultModelPrimary } from "./provider-onboarding-config-AjQQP6EK.js";
//#region extensions/opencode-go/onboard.ts
const OPENCODE_GO_ALIAS_DEFAULTS = {
	"opencode-go/kimi-k2.5": "Kimi",
	"opencode-go/glm-5": "GLM",
	"opencode-go/minimax-m2.5": "MiniMax"
};
function applyOpencodeGoProviderConfig(cfg) {
	return {
		...cfg,
		agents: {
			...cfg.agents,
			defaults: {
				...cfg.agents?.defaults,
				models: withAgentModelAliases(cfg.agents?.defaults?.models, Object.entries(OPENCODE_GO_ALIAS_DEFAULTS).map(([modelRef, alias]) => ({
					modelRef,
					alias
				})))
			}
		}
	};
}
function applyOpencodeGoConfig(cfg) {
	return applyAgentDefaultModelPrimary(applyOpencodeGoProviderConfig(cfg), OPENCODE_GO_DEFAULT_MODEL_REF);
}
//#endregion
export { applyOpencodeGoProviderConfig as n, applyOpencodeGoConfig as t };
