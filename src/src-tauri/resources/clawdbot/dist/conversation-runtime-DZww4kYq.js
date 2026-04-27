import "./session-binding-service-CHlhSOHA.js";
import "./binding-registry-91VaibhB.js";
import "./conversation-binding-CYyevxp8.js";
import "./session-DjO_XD77.js";
import "./pairing-store-BqyKPFa6.js";
import "./dm-policy-shared-CF1kNTSS.js";
import "./binding-targets-UeDuUVfI.js";
import "./binding-routing-BqSB4IhA.js";
import "./thread-bindings-policy-C4CD051S.js";
import "./pairing-labels-CLMAe6rV.js";
//#region src/channels/session-meta.ts
let inboundSessionRuntimePromise = null;
function loadInboundSessionRuntime() {
	inboundSessionRuntimePromise ??= import("./inbound.runtime-DEk_2xSV.js");
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
