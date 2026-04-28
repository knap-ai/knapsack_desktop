import "./errors-CDFVCV9D.js";
import "./env-BAymvSVL.js";
import "./fs-safe-CYYfKgf3.js";
import "./file-lock-CKuai5ox.js";
import "./ssrf-K8pX0Zi6.js";
import "./undici-global-dispatcher-CDAQsjZ7.js";
import "./fetch-guard-8smVA_M-.js";
import "./proxy-fetch-C6fA8jMX.js";
import "./heartbeat-summary-h5pqfmuE.js";
import "./exec-approvals-BzZbTLG7.js";
import { n as drainPendingDeliveries$1 } from "./delivery-queue-C0acLSxc.js";
import "./system-events-BOVw40Do.js";
import "./retry-DH0sbtC7.js";
import "./secret-file-BEd6O4bq.js";
import "./http-body-DULyPC70.js";
import "./exec-approval-reply-B6LWxNYR.js";
import "./approval-native-runtime-BXV4owB7.js";
import "./exec-approval-command-display-DMZaYbM0.js";
import "./exec-approval-session-target-CL_qLXQQ.js";
import "./heartbeat-events-Dev4DATw.js";
import "./transport-ready-E5t9jPbv.js";
import "./identity-C7z27lmT.js";
import "./retry-policy-B1zLFrse.js";
import "./ssrf-policy-BMzLPvV8.js";
//#region src/plugin-sdk/infra-runtime.ts
let outboundDeliverRuntimePromise = null;
async function loadOutboundDeliverRuntime() {
	outboundDeliverRuntimePromise ??= import("./deliver-runtime-CYH-eW6R.js");
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
