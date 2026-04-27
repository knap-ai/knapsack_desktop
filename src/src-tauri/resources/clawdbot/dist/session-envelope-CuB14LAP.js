import { u as resolveStorePath } from "./paths-DvU8Tgvw.js";
import { n as readSessionUpdatedAt } from "./store-Bm25Mivo.js";
import "./sessions-DIdqAx7y.js";
import { a as resolveEnvelopeFormatOptions } from "./envelope-DDp7QU_Z.js";
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
