import { r as readSessionUpdatedAt } from "./store-DFXcceZJ.js";
import "./sessions-vP2E4vs-.js";
import { u as resolveStorePath } from "./paths-CZMxg3hs.js";
import { a as resolveEnvelopeFormatOptions } from "./envelope-B1SOAhzt.js";
//#region src/channels/session-envelope.ts
function resolveInboundSessionEnvelopeContext(params) {
	const storePath = resolveStorePath(params.cfg.session?.store, { agentId: params.agentId });
	return {
		storePath,
		envelopeOptions: resolveEnvelopeFormatOptions(params.cfg),
		previousTimestamp: readSessionUpdatedAt({
			storePath,
			sessionKey: params.sessionKey
		})
	};
}
//#endregion
export { resolveInboundSessionEnvelopeContext as t };
