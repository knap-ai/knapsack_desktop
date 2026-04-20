import { l as isRecord } from "./utils-D5DtWkEu.js";
import { t as getBootstrapChannelPlugin } from "./bootstrap-registry-BI6Zdzz5.js";
import { r as hasBundledChannelPackageState, t as hasBundledChannelPersistedAuthState } from "./persisted-auth-state-BkBSoJRA.js";
import "./channel-target-Du58lo8P.js";
//#region src/plugins/plugin-scope.ts
function normalizePluginIdScope(ids) {
	if (ids === void 0) return;
	return Array.from(new Set(ids.filter((id) => typeof id === "string").map((id) => id.trim()).filter(Boolean))).toSorted();
}
function hasExplicitPluginIdScope(ids) {
	return ids !== void 0;
}
function hasNonEmptyPluginIdScope(ids) {
	return ids !== void 0 && ids.length > 0;
}
function createPluginIdScopeSet(ids) {
	if (ids === void 0) return null;
	return new Set(ids);
}
function serializePluginIdScope(ids) {
	return ids === void 0 ? "__unscoped__" : JSON.stringify(ids);
}
//#endregion
//#region src/channels/plugins/configured-state.ts
function hasBundledChannelConfiguredState(params) {
	return hasBundledChannelPackageState({
		metadataKey: "configuredState",
		channelId: params.channelId,
		cfg: params.cfg,
		env: params.env
	});
}
//#endregion
//#region src/config/channel-configured-shared.ts
function resolveChannelConfigRecord(cfg, channelId) {
	const entry = cfg.channels?.[channelId];
	return isRecord(entry) ? entry : null;
}
function hasMeaningfulChannelConfigShallow(value) {
	if (!isRecord(value)) return false;
	return Object.keys(value).some((key) => key !== "enabled");
}
//#endregion
//#region src/config/channel-configured.ts
function isChannelConfigured(cfg, channelId, env = process.env) {
	if (hasMeaningfulChannelConfigShallow(resolveChannelConfigRecord(cfg, channelId))) return true;
	if (hasBundledChannelConfiguredState({
		channelId,
		cfg,
		env
	})) return true;
	if (hasBundledChannelPersistedAuthState({
		channelId,
		cfg,
		env
	})) return true;
	const plugin = getBootstrapChannelPlugin(channelId);
	return Boolean(plugin?.config?.hasConfiguredState?.({
		cfg,
		env
	}));
}
//#endregion
export { normalizePluginIdScope as a, hasNonEmptyPluginIdScope as i, createPluginIdScopeSet as n, serializePluginIdScope as o, hasExplicitPluginIdScope as r, isChannelConfigured as t };
