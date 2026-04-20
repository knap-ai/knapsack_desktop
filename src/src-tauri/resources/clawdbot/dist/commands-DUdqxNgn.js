import { i as normalizeChannelId, t as getChannelPlugin } from "./registry-Delpa74L.js";
import "./plugins-D4ODSIPT.js";
//#region src/config/commands.ts
function resolveAutoDefault(providerId, kind) {
	const id = normalizeChannelId(providerId);
	if (!id) return false;
	const plugin = getChannelPlugin(id);
	if (!plugin) return false;
	if (kind === "native") return plugin.commands?.nativeCommandsAutoEnabled === true;
	return plugin.commands?.nativeSkillsAutoEnabled === true;
}
function resolveNativeSkillsEnabled(params) {
	return resolveNativeCommandSetting({
		...params,
		kind: "nativeSkills"
	});
}
function resolveNativeCommandsEnabled(params) {
	return resolveNativeCommandSetting({
		...params,
		kind: "native"
	});
}
function resolveNativeCommandSetting(params) {
	const { providerId, providerSetting, globalSetting, kind = "native" } = params;
	const setting = providerSetting === void 0 ? globalSetting : providerSetting;
	if (setting === true) return true;
	if (setting === false) return false;
	return resolveAutoDefault(providerId, kind);
}
function isNativeCommandsExplicitlyDisabled(params) {
	const { providerSetting, globalSetting } = params;
	if (providerSetting === false) return true;
	if (providerSetting === void 0) return globalSetting === false;
	return false;
}
//#endregion
export { resolveNativeCommandsEnabled as n, resolveNativeSkillsEnabled as r, isNativeCommandsExplicitlyDisabled as t };
