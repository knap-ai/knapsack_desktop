import { t as GatewayClient } from "./client-Dh94CUDv.js";
import { i as GATEWAY_CLIENT_NAMES, r as GATEWAY_CLIENT_MODES } from "./client-info-B22NhLQV.js";
import { t as resolveGatewayClientBootstrap } from "./client-bootstrap-Dz8oirkv.js";
//#region src/gateway/operator-approvals-client.ts
async function createOperatorApprovalsGatewayClient(params) {
	const bootstrap = await resolveGatewayClientBootstrap({
		config: params.config,
		gatewayUrl: params.gatewayUrl,
		env: process.env
	});
	return new GatewayClient({
		url: bootstrap.url,
		token: bootstrap.auth.token,
		password: bootstrap.auth.password,
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
async function withOperatorApprovalsGatewayClient(params, run) {
	let readySettled = false;
	let resolveReady;
	let rejectReady;
	const ready = new Promise((resolve, reject) => {
		resolveReady = resolve;
		rejectReady = reject;
	});
	const markReady = () => {
		if (readySettled) return;
		readySettled = true;
		resolveReady();
	};
	const failReady = (err) => {
		if (readySettled) return;
		readySettled = true;
		rejectReady(err);
	};
	const gatewayClient = await createOperatorApprovalsGatewayClient({
		config: params.config,
		gatewayUrl: params.gatewayUrl,
		clientDisplayName: params.clientDisplayName,
		onHelloOk: () => {
			markReady();
		},
		onConnectError: (err) => {
			failReady(err);
		},
		onClose: (code, reason) => {
			failReady(/* @__PURE__ */ new Error(`gateway closed (${code}): ${reason}`));
		}
	});
	try {
		gatewayClient.start();
		await ready;
		return await run(gatewayClient);
	} finally {
		await gatewayClient.stopAndWait().catch(() => {
			gatewayClient.stop();
		});
	}
}
//#endregion
export { withOperatorApprovalsGatewayClient as n, createOperatorApprovalsGatewayClient as t };
