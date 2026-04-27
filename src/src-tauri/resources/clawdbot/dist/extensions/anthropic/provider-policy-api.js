import { applyAnthropicConfigDefaults, normalizeAnthropicProviderConfigForProvider } from "./config-defaults.js";
//#region extensions/anthropic/provider-policy-api.ts
function normalizeConfig(params) {
	return normalizeAnthropicProviderConfigForProvider(params);
}
function applyConfigDefaults(params) {
	return applyAnthropicConfigDefaults(params);
}
//#endregion
export { applyConfigDefaults, normalizeConfig };
