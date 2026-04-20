import { s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { r as normalizeProviderId } from "./provider-id-KaStHhRz.js";
import "./model-selection-CTdyYoio.js";
import crypto from "node:crypto";
//#region src/agents/cli-session.ts
const CLAUDE_CLI_BACKEND_ID = "claude-cli";
function hashCliSessionText(value) {
	const trimmed = normalizeOptionalString(value);
	if (!trimmed) return;
	return crypto.createHash("sha256").update(trimmed).digest("hex");
}
function getCliSessionBinding(entry, provider) {
	if (!entry) return;
	const normalized = normalizeProviderId(provider);
	const fromBindings = entry.cliSessionBindings?.[normalized];
	const bindingSessionId = normalizeOptionalString(fromBindings?.sessionId);
	if (bindingSessionId) return {
		sessionId: bindingSessionId,
		authProfileId: normalizeOptionalString(fromBindings?.authProfileId),
		authEpoch: normalizeOptionalString(fromBindings?.authEpoch),
		extraSystemPromptHash: normalizeOptionalString(fromBindings?.extraSystemPromptHash),
		mcpConfigHash: normalizeOptionalString(fromBindings?.mcpConfigHash)
	};
	const fromMap = entry.cliSessionIds?.[normalized];
	const normalizedFromMap = normalizeOptionalString(fromMap);
	if (normalizedFromMap) return { sessionId: normalizedFromMap };
	if (normalized === CLAUDE_CLI_BACKEND_ID) {
		const legacy = normalizeOptionalString(entry.claudeCliSessionId);
		if (legacy) return { sessionId: legacy };
	}
}
function getCliSessionId(entry, provider) {
	return getCliSessionBinding(entry, provider)?.sessionId;
}
function setCliSessionId(entry, provider, sessionId) {
	setCliSessionBinding(entry, provider, { sessionId });
}
function setCliSessionBinding(entry, provider, binding) {
	const normalized = normalizeProviderId(provider);
	const trimmed = binding.sessionId.trim();
	if (!trimmed) return;
	entry.cliSessionBindings = {
		...entry.cliSessionBindings,
		[normalized]: {
			sessionId: trimmed,
			...normalizeOptionalString(binding.authProfileId) ? { authProfileId: normalizeOptionalString(binding.authProfileId) } : {},
			...normalizeOptionalString(binding.authEpoch) ? { authEpoch: normalizeOptionalString(binding.authEpoch) } : {},
			...normalizeOptionalString(binding.extraSystemPromptHash) ? { extraSystemPromptHash: normalizeOptionalString(binding.extraSystemPromptHash) } : {},
			...normalizeOptionalString(binding.mcpConfigHash) ? { mcpConfigHash: normalizeOptionalString(binding.mcpConfigHash) } : {}
		}
	};
	entry.cliSessionIds = {
		...entry.cliSessionIds,
		[normalized]: trimmed
	};
	if (normalized === CLAUDE_CLI_BACKEND_ID) entry.claudeCliSessionId = trimmed;
}
function clearCliSession(entry, provider) {
	const normalized = normalizeProviderId(provider);
	if (entry.cliSessionBindings?.[normalized] !== void 0) {
		const next = { ...entry.cliSessionBindings };
		delete next[normalized];
		entry.cliSessionBindings = Object.keys(next).length > 0 ? next : void 0;
	}
	if (entry.cliSessionIds?.[normalized] !== void 0) {
		const next = { ...entry.cliSessionIds };
		delete next[normalized];
		entry.cliSessionIds = Object.keys(next).length > 0 ? next : void 0;
	}
	if (normalized === CLAUDE_CLI_BACKEND_ID) delete entry.claudeCliSessionId;
}
function resolveCliSessionReuse(params) {
	const binding = params.binding;
	const sessionId = normalizeOptionalString(binding?.sessionId);
	if (!sessionId) return {};
	const currentAuthProfileId = normalizeOptionalString(params.authProfileId);
	const currentAuthEpoch = normalizeOptionalString(params.authEpoch);
	const currentExtraSystemPromptHash = normalizeOptionalString(params.extraSystemPromptHash);
	const currentMcpConfigHash = normalizeOptionalString(params.mcpConfigHash);
	if (normalizeOptionalString(binding?.authProfileId) !== currentAuthProfileId) return { invalidatedReason: "auth-profile" };
	if (normalizeOptionalString(binding?.authEpoch) !== currentAuthEpoch) return { invalidatedReason: "auth-epoch" };
	if (normalizeOptionalString(binding?.extraSystemPromptHash) !== currentExtraSystemPromptHash) return { invalidatedReason: "system-prompt" };
	if (normalizeOptionalString(binding?.mcpConfigHash) !== currentMcpConfigHash) return { invalidatedReason: "mcp" };
	return { sessionId };
}
//#endregion
export { resolveCliSessionReuse as a, hashCliSessionText as i, getCliSessionBinding as n, setCliSessionBinding as o, getCliSessionId as r, setCliSessionId as s, clearCliSession as t };
