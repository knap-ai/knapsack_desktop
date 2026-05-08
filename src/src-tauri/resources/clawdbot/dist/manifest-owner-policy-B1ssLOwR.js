import { c as resolveEffectivePluginActivationState } from "./config-state-Bw_lAn0M.js";
//#region src/plugins/manifest-owner-policy.ts
function isBundledManifestOwner(plugin) {
	return plugin.origin === "bundled";
}
function hasExplicitManifestOwnerTrust(params) {
	return params.normalizedConfig.allow.includes(params.plugin.id) || params.normalizedConfig.entries[params.plugin.id]?.enabled === true;
}
function passesManifestOwnerBasePolicy(params) {
	if (!params.normalizedConfig.enabled) return false;
	if (params.normalizedConfig.deny.includes(params.plugin.id)) return false;
	if (params.normalizedConfig.entries[params.plugin.id]?.enabled === false && params.allowExplicitlyDisabled !== true) return false;
	if (params.allowRestrictiveAllowlistBypass !== true && params.normalizedConfig.allow.length > 0 && !params.normalizedConfig.allow.includes(params.plugin.id)) return false;
	return true;
}
function isActivatedManifestOwner(params) {
	return resolveEffectivePluginActivationState({
		id: params.plugin.id,
		origin: params.plugin.origin,
		config: params.normalizedConfig,
		rootConfig: params.rootConfig,
		enabledByDefault: params.plugin.enabledByDefault
	}).activated;
}
//#endregion
export { passesManifestOwnerBasePolicy as i, isActivatedManifestOwner as n, isBundledManifestOwner as r, hasExplicitManifestOwnerTrust as t };
