import { n as MOONSHOT_DEFAULT_MODEL_ID, r as buildMoonshotProvider, t as MOONSHOT_BASE_URL } from "./provider-catalog-BakDjRHt.js";
import { l as createDefaultModelPresetAppliers } from "./provider-onboarding-config-AjQQP6EK.js";
//#region extensions/moonshot/onboard.ts
const MOONSHOT_CN_BASE_URL = "https://api.moonshot.cn/v1";
const MOONSHOT_DEFAULT_MODEL_REF = `moonshot/${MOONSHOT_DEFAULT_MODEL_ID}`;
const moonshotPresetAppliers = createDefaultModelPresetAppliers({
	primaryModelRef: MOONSHOT_DEFAULT_MODEL_REF,
	resolveParams: (_cfg, baseUrl) => {
		const defaultModel = buildMoonshotProvider().models[0];
		if (!defaultModel) return null;
		return {
			providerId: "moonshot",
			api: "openai-completions",
			baseUrl,
			defaultModel,
			defaultModelId: MOONSHOT_DEFAULT_MODEL_ID,
			aliases: [{
				modelRef: MOONSHOT_DEFAULT_MODEL_REF,
				alias: "Kimi"
			}]
		};
	}
});
function applyMoonshotProviderConfig(cfg) {
	return moonshotPresetAppliers.applyProviderConfig(cfg, MOONSHOT_BASE_URL);
}
function applyMoonshotProviderConfigCn(cfg) {
	return moonshotPresetAppliers.applyProviderConfig(cfg, MOONSHOT_CN_BASE_URL);
}
function applyMoonshotConfig(cfg) {
	return moonshotPresetAppliers.applyConfig(cfg, MOONSHOT_BASE_URL);
}
function applyMoonshotConfigCn(cfg) {
	return moonshotPresetAppliers.applyConfig(cfg, MOONSHOT_CN_BASE_URL);
}
//#endregion
export { applyMoonshotProviderConfig as a, applyMoonshotConfigCn as i, MOONSHOT_DEFAULT_MODEL_REF as n, applyMoonshotProviderConfigCn as o, applyMoonshotConfig as r, MOONSHOT_CN_BASE_URL as t };
