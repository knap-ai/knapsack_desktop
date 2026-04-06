import "./method-scopes-DNlWj6m4.js";
import "./operator-approvals-client-DS85D1Fh.js";
//#region src/gateway/channel-status-patches.ts
function createConnectedChannelStatusPatch(at = Date.now()) {
	return {
		connected: true,
		lastConnectedAt: at,
		lastEventAt: at
	};
}
//#endregion
export { createConnectedChannelStatusPatch as t };
