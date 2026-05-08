import "./client-Dh94CUDv.js";
import "./protocol-Hjar_s3V.js";
import "./operator-approvals-client-BdTbpocA.js";
import "./gateway-rpc-DGmyKiL0.js";
//#region src/gateway/channel-status-patches.ts
function createConnectedChannelStatusPatch(at = Date.now()) {
	return {
		connected: true,
		lastConnectedAt: at,
		lastEventAt: at
	};
}
function createTransportActivityStatusPatch(at = Date.now()) {
	return { lastTransportActivityAt: at };
}
//#endregion
export { createTransportActivityStatusPatch as n, createConnectedChannelStatusPatch as t };
