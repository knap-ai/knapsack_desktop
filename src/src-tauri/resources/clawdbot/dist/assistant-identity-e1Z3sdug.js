import { s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { c as normalizeAgentId } from "./session-key-Bh1lMwK5.js";
import { b as resolveAgentWorkspaceDir, x as resolveDefaultAgentId } from "./agent-scope-KFH9bkHi.js";
import { a as isAvatarImageDataUrl, i as isAvatarHttpUrl, u as looksLikeAvatarPath } from "./avatar-policy-DEMOzJv4.js";
import { n as resolveAgentIdentity } from "./identity-B_Q39IGW.js";
import { i as loadAgentIdentity } from "./agents.config-CmizwtRC.js";
//#region src/shared/assistant-identity-values.ts
function coerceIdentityValue(value, maxLength) {
	const trimmed = normalizeOptionalString(value);
	if (!trimmed) return;
	if (trimmed.length <= maxLength) return trimmed;
	return trimmed.slice(0, maxLength);
}
//#endregion
//#region src/gateway/assistant-identity.ts
const MAX_ASSISTANT_NAME = 50;
const MAX_ASSISTANT_AVATAR = 200;
const MAX_ASSISTANT_EMOJI = 16;
const DEFAULT_ASSISTANT_IDENTITY = {
	agentId: "main",
	name: "Assistant",
	avatar: "A"
};
function isAvatarUrl(value) {
	return isAvatarHttpUrl(value) || isAvatarImageDataUrl(value);
}
function normalizeAvatarValue(value) {
	if (!value) return;
	const trimmed = value.trim();
	if (!trimmed) return;
	if (isAvatarUrl(trimmed)) return trimmed;
	if (looksLikeAvatarPath(trimmed)) return trimmed;
	if (!/\s/.test(trimmed) && trimmed.length <= 4) return trimmed;
}
function normalizeEmojiValue(value) {
	if (!value) return;
	const trimmed = value.trim();
	if (!trimmed) return;
	if (trimmed.length > MAX_ASSISTANT_EMOJI) return;
	let hasNonAscii = false;
	for (let i = 0; i < trimmed.length; i += 1) if (trimmed.charCodeAt(i) > 127) {
		hasNonAscii = true;
		break;
	}
	if (!hasNonAscii) return;
	if (isAvatarUrl(trimmed) || looksLikeAvatarPath(trimmed)) return;
	return trimmed;
}
function resolveAssistantIdentity(params) {
	const agentId = normalizeAgentId(params.agentId ?? resolveDefaultAgentId(params.cfg));
	const workspaceDir = params.workspaceDir ?? resolveAgentWorkspaceDir(params.cfg, agentId);
	const configAssistant = params.cfg.ui?.assistant;
	const agentIdentity = resolveAgentIdentity(params.cfg, agentId);
	const fileIdentity = workspaceDir ? loadAgentIdentity(workspaceDir) : null;
	return {
		agentId,
		name: coerceIdentityValue(configAssistant?.name, MAX_ASSISTANT_NAME) ?? coerceIdentityValue(agentIdentity?.name, MAX_ASSISTANT_NAME) ?? coerceIdentityValue(fileIdentity?.name, MAX_ASSISTANT_NAME) ?? DEFAULT_ASSISTANT_IDENTITY.name,
		avatar: [
			coerceIdentityValue(configAssistant?.avatar, MAX_ASSISTANT_AVATAR),
			coerceIdentityValue(agentIdentity?.avatar, MAX_ASSISTANT_AVATAR),
			coerceIdentityValue(agentIdentity?.emoji, MAX_ASSISTANT_AVATAR),
			coerceIdentityValue(fileIdentity?.avatar, MAX_ASSISTANT_AVATAR),
			coerceIdentityValue(fileIdentity?.emoji, MAX_ASSISTANT_AVATAR)
		].map((candidate) => normalizeAvatarValue(candidate)).find(Boolean) ?? DEFAULT_ASSISTANT_IDENTITY.avatar,
		emoji: [
			coerceIdentityValue(agentIdentity?.emoji, MAX_ASSISTANT_EMOJI),
			coerceIdentityValue(fileIdentity?.emoji, MAX_ASSISTANT_EMOJI),
			coerceIdentityValue(agentIdentity?.avatar, MAX_ASSISTANT_EMOJI),
			coerceIdentityValue(fileIdentity?.avatar, MAX_ASSISTANT_EMOJI)
		].map((candidate) => normalizeEmojiValue(candidate)).find(Boolean)
	};
}
//#endregion
export { resolveAssistantIdentity as n, DEFAULT_ASSISTANT_IDENTITY as t };
