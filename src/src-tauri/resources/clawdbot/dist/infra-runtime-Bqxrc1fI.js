import "./errors-Jbvi20TW.js";
import "./env-BgREcPbG.js";
import "./file-lock-CSKcwxlX.js";
import "./heartbeat-summary-BNS5obcW.js";
import "./ssrf-MkDHylX_.js";
import "./undici-global-dispatcher-KzKcGOUY.js";
import "./fetch-guard-DKbwHPzH.js";
import "./fs-safe-CezDxq3P.js";
import "./exec-approvals-BbaGmaa4.js";
import "./proxy-fetch-EMog_P9e.js";
import { n as drainPendingDeliveries$1 } from "./delivery-queue-DBXcTwQv.js";
import "./system-events-B6vO-QxY.js";
import "./retry-D2j_UnTY.js";
import "./secret-file-CTXjHVQf.js";
import "./http-body-DmMOHMx8.js";
import "./exec-approval-reply-D_fr2N-O.js";
import "./approval-native-runtime-CWtzmOGp.js";
import "./exec-approval-command-display-BNdt3-ZG.js";
import "./exec-approval-session-target-CUB1vxb8.js";
import "./heartbeat-visibility-D5nIKHUQ.js";
import "./transport-ready-D_o9C9tJ.js";
import "./identity-BZhaX0q4.js";
import "./retry-policy-6WQ3_ae7.js";
import "./ssrf-policy-fyM1MW87.js";
//#region src/plugin-sdk/infra-runtime.ts
let outboundDeliverRuntimePromise = null;
async function loadOutboundDeliverRuntime() {
	outboundDeliverRuntimePromise ??= import("./deliver-runtime-DsNlZXli.js");
	return await outboundDeliverRuntimePromise;
}
async function drainPendingDeliveries(opts) {
	const deliver = opts.deliver ?? (await loadOutboundDeliverRuntime()).deliverOutboundPayloads;
	await drainPendingDeliveries$1({
		...opts,
		deliver
	});
}
//#endregion
export { drainPendingDeliveries as t };
