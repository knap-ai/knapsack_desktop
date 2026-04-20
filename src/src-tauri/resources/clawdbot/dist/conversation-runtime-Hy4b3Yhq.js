import "./session-binding-service-CP3mZirT.js";
import "./binding-registry-ebIwre-S.js";
import "./conversation-binding-COoBmA8F.js";
import "./session-CHI_eL18.js";
import "./pairing-store-C_d7unmE.js";
import "./dm-policy-shared-B7IvP1oD.js";
import "./binding-targets-xmalh8ui.js";
import "./binding-routing-DXUukGe4.js";
import "./thread-bindings-policy-BdnKXnQj.js";
import "./pairing-labels-BNRiD4Up.js";
//#region src/channels/session-meta.ts
let inboundSessionRuntimePromise = null;
function loadInboundSessionRuntime() {
	inboundSessionRuntimePromise ??= import("./inbound.runtime-DLlKRcSc.js");
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
