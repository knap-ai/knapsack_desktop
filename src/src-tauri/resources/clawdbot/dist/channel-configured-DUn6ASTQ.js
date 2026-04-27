import { l as isRecord } from "./utils-BMRcljdi.js";
import { t as getBootstrapChannelPlugin } from "./bootstrap-registry-NCgrvsYW.js";
import "./channel-env-vars-Cpw7TOAF.js";
import { r as hasBundledChannelPackageState, t as hasBundledChannelPersistedAuthState } from "./persisted-auth-state-DdqnHcUm.js";
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
export { isChannelConfigured as t };
