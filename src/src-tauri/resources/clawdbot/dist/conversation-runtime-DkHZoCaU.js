import "./session-binding-service-BQV_OJiA.js";
import "./binding-registry-DJBdq26s.js";
import "./conversation-binding-DIzQqGtm.js";
import "./session-BIs3Awn3.js";
import "./pairing-store-YNHOr2Zu.js";
import "./dm-policy-shared-DzT5EPsb.js";
import "./binding-targets-BJXYmzqo.js";
import "./binding-routing-DDDv_bKW.js";
import "./thread-bindings-policy-C8aOK058.js";
import "./pairing-labels-CRTdM3hq.js";
//#region src/channels/session-meta.ts
let inboundSessionRuntimePromise = null;
function loadInboundSessionRuntime() {
	inboundSessionRuntimePromise ??= import("./inbound.runtime-8DECBh4Q.js");
	return inboundSessionRuntimePromise;
}
async function recordInboundSessionMetaSafe(params) {
	const runtime = await loadInboundSessionRuntime();
	const storePath = runtime.resolveStorePath(params.cfg.session?.store, { agentId: params.agentId });
	try {
		await runtime.recordSessionMetaFromInbound({
			storePath,
			sessionKey: params.sessionKey,
			ctx: params.ctx
		});
	} catch (err) {
		params.onError?.(err);
	}
}
//#endregion
export { recordInboundSessionMetaSafe as t };
