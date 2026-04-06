import { _ as GATEWAY_CLIENT_NAMES, g as GATEWAY_CLIENT_MODES } from "./message-channel-D19EDm2g.js";
import { d as GatewayClient } from "./method-scopes-DNlWj6m4.js";
import { n as buildGatewayConnectionDetails } from "./call-CQ0eH9Ew.js";
import { t as resolveGatewayConnectionAuth } from "./connection-auth-BupeSvnP.js";
//#region src/gateway/operator-approvals-client.ts
async function createOperatorApprovalsGatewayClient(params) {
	const { url: gatewayUrl, urlSource } = buildGatewayConnectionDetails({
		config: params.config,
		url: params.gatewayUrl
	});
	const gatewayUrlOverrideSource = urlSource === "cli --url" ? "cli" : urlSource === "env OPENCLAW_GATEWAY_URL" ? "env" : void 0;
	const auth = await resolveGatewayConnectionAuth({
		config: params.config,
		env: process.env,
		urlOverride: gatewayUrlOverrideSource ? gatewayUrl : void 0,
		urlOverrideSource: gatewayUrlOverrideSource
	});
	return new GatewayClient({
		url: gatewayUrl,
		token: auth.token,
		password: auth.password,
		clientName: GATEWAY_CLIENT_NAMES.GATEWAY_CLIENT,
		clientDisplayName: params.clientDisplayName,
		mode: GATEWAY_CLIENT_MODES.BACKEND,
		scopes: ["operator.approvals"],
		onEvent: params.onEvent,
		onHelloOk: params.onHelloOk,
		onConnectError: params.onConnectError,
		onClose: params.onClose
	});
}
//#endregion
export { createOperatorApprovalsGatewayClient as t };
