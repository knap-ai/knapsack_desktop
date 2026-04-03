import { v as resolveSessionAgentId } from "./agent-scope-CYXg_wTS.js";
//#region src/infra/outbound/session-context.ts
function normalizeOptionalString(value) {
	if (typeof value !== "string") return;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : void 0;
}
function buildOutboundSessionContext(params) {
	const key = normalizeOptionalString(params.sessionKey);
	const explicitAgentId = normalizeOptionalString(params.agentId);
	const derivedAgentId = key ? resolveSessionAgentId({
		sessionKey: key,
		config: params.cfg
	}) : void 0;
	const agentId = explicitAgentId ?? derivedAgentId;
	if (!key && !agentId) return;
	return {
		...key ? { key } : {},
		...agentId ? { agentId } : {}
	};
}
//#endregion
export { buildOutboundSessionContext as t };
