import { s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import "./text-runtime-DTMxvodz.js";
import { t as normalizeWebhookPath } from "./webhook-path-K1OULEo3.js";
import { S as parseBlueBubblesTarget, p as extractHandleFromChatGuid, y as normalizeBlueBubblesHandle } from "./monitor-normalize-DJXrKC82.js";
//#region extensions/bluebubbles/src/conversation-id.ts
function normalizeBlueBubblesAcpConversationId(conversationId) {
	const trimmed = conversationId.trim();
	if (!trimmed) return null;
	try {
		const parsed = parseBlueBubblesTarget(trimmed);
		if (parsed.kind === "handle") {
			const handle = normalizeBlueBubblesHandle(parsed.to);
			return handle ? { conversationId: handle } : null;
		}
		if (parsed.kind === "chat_id") return { conversationId: String(parsed.chatId) };
		if (parsed.kind === "chat_guid") return { conversationId: extractHandleFromChatGuid(parsed.chatGuid) || parsed.chatGuid };
		return { conversationId: parsed.chatIdentifier };
	} catch {
		const handle = normalizeBlueBubblesHandle(trimmed);
		return handle ? { conversationId: handle } : null;
	}
}
function matchBlueBubblesAcpConversation(params) {
	const binding = normalizeBlueBubblesAcpConversationId(params.bindingConversationId);
	const conversation = normalizeBlueBubblesAcpConversationId(params.conversationId);
	if (!binding || !conversation) return null;
	if (binding.conversationId !== conversation.conversationId) return null;
	return {
		conversationId: conversation.conversationId,
		matchPriority: 2
	};
}
function resolveBlueBubblesInboundConversationId(params) {
	if (!params.isGroup) return normalizeBlueBubblesHandle(params.sender) || void 0;
	return params.chatGuid && normalizeBlueBubblesAcpConversationId(params.chatGuid)?.conversationId || params.chatIdentifier && normalizeBlueBubblesAcpConversationId(params.chatIdentifier)?.conversationId || (params.chatId != null && Number.isFinite(params.chatId) ? String(params.chatId) : "") || void 0;
}
function resolveBlueBubblesConversationIdFromTarget(target) {
	return normalizeBlueBubblesAcpConversationId(target)?.conversationId;
}
//#endregion
//#region extensions/bluebubbles/src/webhook-shared.ts
const DEFAULT_WEBHOOK_PATH = "/bluebubbles-webhook";
function resolveWebhookPathFromConfig(config) {
	const raw = normalizeOptionalString(config?.webhookPath);
	if (raw) return normalizeWebhookPath(raw);
	return DEFAULT_WEBHOOK_PATH;
}
//#endregion
export { resolveBlueBubblesConversationIdFromTarget as a, normalizeBlueBubblesAcpConversationId as i, resolveWebhookPathFromConfig as n, resolveBlueBubblesInboundConversationId as o, matchBlueBubblesAcpConversation as r, DEFAULT_WEBHOOK_PATH as t };
