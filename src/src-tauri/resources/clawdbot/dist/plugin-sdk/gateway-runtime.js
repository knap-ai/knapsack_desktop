import { t as GatewayClient } from "../client-DkWAat_P.js";
import { n as withOperatorApprovalsGatewayClient, t as createOperatorApprovalsGatewayClient } from "../operator-approvals-client-CGHXKajQ.js";
//#region src/gateway/channel-status-patches.ts
function createConnectedChannelStatusPatch(at = Date.now()) {
	return {
		connected: true,
		lastConnectedAt: at,
		lastEventAt: at
	};
}
//#endregion
export { GatewayClient, createConnectedChannelStatusPatch, createOperatorApprovalsGatewayClient, withOperatorApprovalsGatewayClient };
