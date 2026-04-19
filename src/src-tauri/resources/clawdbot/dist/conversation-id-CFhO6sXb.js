import { i as normalizeLowercaseStringOrEmpty, s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
//#region src/infra/outbound/conversation-id.ts
function resolveExplicitConversationTargetId(target) {
	for (const prefix of [
		"channel:",
		"conversation:",
		"group:",
		"room:",
		"dm:"
	]) if (normalizeLowercaseStringOrEmpty(target).startsWith(prefix)) return normalizeOptionalString(target.slice(prefix.length));
}
function resolveConversationIdFromTargets(params) {
	const threadId = params.threadId != null ? normalizeOptionalString(String(params.threadId)) : void 0;
	if (threadId) return threadId;
	for (const rawTarget of params.targets) {
		const target = normalizeOptionalString(rawTarget);
		if (!target) continue;
		const explicitConversationId = resolveExplicitConversationTargetId(target);
		if (explicitConversationId) return explicitConversationId;
		if (target.includes(":") && explicitConversationId === void 0) continue;
		const mentionMatch = target.match(/^<#(\d+)>$/);
		if (mentionMatch?.[1]) return mentionMatch[1];
		if (/^\d{6,}$/.test(target)) return target;
	}
}
//#endregion
export { resolveConversationIdFromTargets as t };
