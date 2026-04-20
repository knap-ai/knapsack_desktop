import { c as normalizeAgentId } from "./session-key-Bh1lMwK5.js";
import { n as AcpRuntimeError } from "./errors-DrSVrMCJ.js";
//#region src/acp/policy.ts
const ACP_DISABLED_MESSAGE = "ACP is disabled by policy (`acp.enabled=false`).";
const ACP_DISPATCH_DISABLED_MESSAGE = "ACP dispatch is disabled by policy (`acp.dispatch.enabled=false`).";
function isAcpEnabledByPolicy(cfg) {
	return cfg.acp?.enabled !== false;
}
function resolveAcpDispatchPolicyState(cfg) {
	if (!isAcpEnabledByPolicy(cfg)) return "acp_disabled";
	if (cfg.acp?.dispatch?.enabled === false) return "dispatch_disabled";
	return "enabled";
}
function resolveAcpDispatchPolicyMessage(cfg) {
	const state = resolveAcpDispatchPolicyState(cfg);
	if (state === "acp_disabled") return ACP_DISABLED_MESSAGE;
	if (state === "dispatch_disabled") return ACP_DISPATCH_DISABLED_MESSAGE;
	return null;
}
function resolveAcpDispatchPolicyError(cfg) {
	const message = resolveAcpDispatchPolicyMessage(cfg);
	if (!message) return null;
	return new AcpRuntimeError("ACP_DISPATCH_DISABLED", message);
}
function isAcpAgentAllowedByPolicy(cfg, agentId) {
	const allowed = (cfg.acp?.allowedAgents ?? []).map((entry) => normalizeAgentId(entry)).filter(Boolean);
	if (allowed.length === 0) return true;
	return allowed.includes(normalizeAgentId(agentId));
}
function resolveAcpAgentPolicyError(cfg, agentId) {
	if (isAcpAgentAllowedByPolicy(cfg, agentId)) return null;
	return new AcpRuntimeError("ACP_SESSION_INIT_FAILED", `ACP agent "${normalizeAgentId(agentId)}" is not allowed by policy.`);
}
//#endregion
export { resolveAcpDispatchPolicyMessage as i, resolveAcpAgentPolicyError as n, resolveAcpDispatchPolicyError as r, isAcpEnabledByPolicy as t };
