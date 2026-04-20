import { n as normalizeAnthropicProviderConfig, t as applyAnthropicConfigDefaults } from "../../config-defaults-BTfbVwym.js";
//#region extensions/anthropic/provider-policy-api.ts
function normalizeConfig(params) {
	return normalizeAnthropicProviderConfig(params.providerConfig);
}
function applyConfigDefaults(params) {
	return applyAnthropicConfigDefaults(params);
}
//#endregion
export { applyConfigDefaults, normalizeConfig };
