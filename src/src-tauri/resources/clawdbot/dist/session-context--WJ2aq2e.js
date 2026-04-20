import { s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { p as resolveSessionAgentId } from "./agent-scope-KFH9bkHi.js";
//#region src/infra/outbound/session-context.ts
function buildOutboundSessionContext(params) {
	const key = normalizeOptionalString(params.sessionKey);
	const explicitAgentId = normalizeOptionalString(params.agentId);
	const requesterAccountId = normalizeOptionalString(params.requesterAccountId);
	const requesterSenderId = normalizeOptionalString(params.requesterSenderId);
	const requesterSenderName = normalizeOptionalString(params.requesterSenderName);
	const requesterSenderUsername = normalizeOptionalString(params.requesterSenderUsername);
	const requesterSenderE164 = normalizeOptionalString(params.requesterSenderE164);
	const derivedAgentId = key ? resolveSessionAgentId({
		sessionKey: key,
		config: params.cfg
	}) : void 0;
	const agentId = explicitAgentId ?? derivedAgentId;
	if (!key && !agentId && !requesterAccountId && !requesterSenderId && !requesterSenderName && !requesterSenderUsername && !requesterSenderE164) return;
	return {
		...key ? { key } : {},
		...agentId ? { agentId } : {},
		...requesterAccountId ? { requesterAccountId } : {},
		...requesterSenderId ? { requesterSenderId } : {},
		...requesterSenderName ? { requesterSenderName } : {},
		...requesterSenderUsername ? { requesterSenderUsername } : {},
		...requesterSenderE164 ? { requesterSenderE164 } : {}
	};
}
//#endregion
export { buildOutboundSessionContext as t };
