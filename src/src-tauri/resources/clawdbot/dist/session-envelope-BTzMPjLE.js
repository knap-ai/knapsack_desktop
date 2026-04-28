import { u as resolveStorePath } from "./paths-CHP3g1Fg.js";
import { n as readSessionUpdatedAt } from "./store-CR7YmZjp.js";
import "./sessions-CLHVJJOI.js";
import { a as resolveEnvelopeFormatOptions } from "./envelope-Cozhn2Y4.js";
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
