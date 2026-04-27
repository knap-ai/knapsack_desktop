import { g as GATEWAY_CLIENT_NAMES, h as GATEWAY_CLIENT_MODES } from "./message-channel-C2Lnao8s.js";
import { r as callGateway } from "./call-Gv9tybWD.js";
import { n as withProgress } from "./progress-DAY5yFVV.js";
//#region src/cli/nodes-cli/rpc.runtime.ts
async function callGatewayCliRuntime(method, opts, params, callOpts) {
	return await withProgress({
		label: `Nodes ${method}`,
		indeterminate: true,
		enabled: opts.json !== true
	}, async () => await callGateway({
		url: opts.url,
		token: opts.token,
		method,
		params,
		timeoutMs: callOpts?.transportTimeoutMs ?? Number(opts.timeout ?? 1e4),
		clientName: GATEWAY_CLIENT_NAMES.CLI,
		mode: GATEWAY_CLIENT_MODES.CLI
	}));
}
//#endregion
export { callGatewayCliRuntime };
