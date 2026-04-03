import { o as readSessionUpdatedAt } from "./store-BGmy-Wot.js";
import "./sessions-DC7OiAdD.js";
import { l as resolveStorePath } from "./paths-DBIQqSpZ.js";
import { a as resolveEnvelopeFormatOptions } from "./envelope-CTj2Ympv.js";
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
