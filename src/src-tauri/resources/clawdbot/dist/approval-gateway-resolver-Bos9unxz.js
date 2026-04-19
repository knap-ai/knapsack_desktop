import { t as isApprovalNotFoundError } from "./approval-errors-Bz4ETuUv.js";
import { t as createOperatorApprovalsGatewayClient } from "./operator-approvals-client-CGHXKajQ.js";
//#region src/infra/approval-gateway-resolver.ts
async function resolveApprovalOverGateway(params) {
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
		config: params.cfg,
		gatewayUrl: params.gatewayUrl,
		clientDisplayName: params.clientDisplayName ?? `Approval (${params.senderId?.trim() || "unknown"})`,
		onHelloOk: markReady,
		onConnectError: failReady,
		onClose: (code, reason) => {
			failReady(/* @__PURE__ */ new Error(`gateway closed (${code}): ${reason}`));
		}
	});
	try {
		gatewayClient.start();
		await ready;
		const requestResolve = async (method) => {
			await gatewayClient.request(method, {
				id: params.approvalId,
				decision: params.decision
			});
		};
		if (params.approvalId.startsWith("plugin:")) {
			await requestResolve("plugin.approval.resolve");
			return;
		}
		try {
			await requestResolve("exec.approval.resolve");
		} catch (err) {
			if (!params.allowPluginFallback || !isApprovalNotFoundError(err)) throw err;
			await requestResolve("plugin.approval.resolve");
		}
	} finally {
		await gatewayClient.stopAndWait().catch(() => {
			gatewayClient.stop();
		});
	}
}
//#endregion
export { resolveApprovalOverGateway as t };
