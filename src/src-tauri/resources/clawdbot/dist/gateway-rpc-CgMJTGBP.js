//#region src/cli/gateway-rpc.ts
let gatewayRpcRuntimePromise;
async function loadGatewayRpcRuntime() {
	gatewayRpcRuntimePromise ??= import("./gateway-rpc.runtime-CspmwJWz.js");
	return gatewayRpcRuntimePromise;
}
function addGatewayClientOptions(cmd) {
	return cmd.option("--url <url>", "Gateway WebSocket URL (defaults to gateway.remote.url when configured)").option("--token <token>", "Gateway token (if required)").option("--timeout <ms>", "Timeout in ms", "30000").option("--expect-final", "Wait for final response (agent)", false);
}
async function callGatewayFromCli(method, opts, params, extra) {
	return await (await loadGatewayRpcRuntime()).callGatewayFromCliRuntime(method, opts, params, extra);
}
//#endregion
export { callGatewayFromCli as n, addGatewayClientOptions as t };
