import { c as normalizeOptionalString } from "./string-coerce-Bje8XVt9.js";
import { t as normalizeChatType } from "./chat-type-BrFPcj8_.js";
import { r as normalizeConversationRef } from "./conversation-id-Hca4NWaY.js";
import { r as getSessionBindingService } from "./session-binding-service-BQV_OJiA.js";
import { r as resolveConversationBindingContextFromAcpCommand } from "./conversation-binding-input-B2xFrfDD.js";
import { n as readAcpSessionEntry } from "./session-meta-D3_oSoyR.js";
import { i as resolveThreadBindingThreadName, r as resolveThreadBindingIntroText } from "./thread-bindings-messages-B-NBj3dt.js";
import { c as resolveThreadBindingMaxAgeMsForChannel, l as resolveThreadBindingPlacementForCurrentContext, n as formatThreadBindingSpawnDisabledError, o as resolveThreadBindingIdleTimeoutMsForChannel, t as formatThreadBindingDisabledError, u as resolveThreadBindingSpawnPolicy } from "./thread-bindings-policy-C8aOK058.js";
import { a as resolveAcpThreadSessionDetailLines, n as resolveAcpSessionCwd } from "./session-identifiers-pF6jmcaN.js";
import { a as resolveFocusTargetSession, u as stopWithText } from "./shared-DuvhyTe6.js";
//#region src/auto-reply/reply/commands-subagents/action-focus.ts
function resolveFocusBindingContext(params) {
	const bindingContext = resolveConversationBindingContextFromAcpCommand(params);
	if (!bindingContext) return null;
	const chatType = normalizeChatType(params.ctx.ChatType);
	const conversation = normalizeConversationRef({
		channel: bindingContext.channel,
		accountId: bindingContext.accountId,
		conversationId: bindingContext.conversationId,
		parentConversationId: bindingContext.parentConversationId
	});
	return {
		channel: conversation.channel,
		accountId: conversation.accountId,
		conversationId: conversation.conversationId,
		...conversation.parentConversationId ? { parentConversationId: conversation.parentConversationId } : {},
		placement: chatType === "direct" ? "current" : resolveThreadBindingPlacementForCurrentContext({
			channel: bindingContext.channel,
			threadId: bindingContext.threadId || void 0
		})
	};
}
async function handleSubagentsFocusAction(ctx) {
	const { params, runs, restTokens } = ctx;
	const token = restTokens.join(" ").trim();
	if (!token) return stopWithText("Usage: /focus <subagent-label|session-key|session-id|session-label>");
	const bindingContext = resolveFocusBindingContext(params);
	if (!bindingContext) return stopWithText("⚠️ /focus must be run inside a bindable conversation.");
	const bindingService = getSessionBindingService();
	const capabilities = bindingService.getCapabilities({
		channel: bindingContext.channel,
		accountId: bindingContext.accountId
	});
	if (!capabilities.adapterAvailable || !capabilities.bindSupported) return stopWithText("⚠️ Conversation bindings are unavailable for this account.");
	const focusTarget = await resolveFocusTargetSession({
		runs,
		token
	});
	if (!focusTarget) return stopWithText(`⚠️ Unable to resolve focus target: ${token}`);
	if (bindingContext.placement === "child") {
		const spawnPolicy = resolveThreadBindingSpawnPolicy({
			cfg: params.cfg,
			channel: bindingContext.channel,
			accountId: bindingContext.accountId,
			kind: "subagent"
		});
		if (!spawnPolicy.enabled) return stopWithText(`⚠️ ${formatThreadBindingDisabledError({
			channel: spawnPolicy.channel,
			accountId: spawnPolicy.accountId,
			kind: "subagent"
		})}`);
		if (bindingContext.placement === "child" && !spawnPolicy.spawnEnabled) return stopWithText(`⚠️ ${formatThreadBindingSpawnDisabledError({
			channel: spawnPolicy.channel,
			accountId: spawnPolicy.accountId,
			kind: "subagent"
		})}`);
	}
	const senderId = normalizeOptionalString(params.command.senderId) ?? "";
	const conversationRef = normalizeConversationRef({
		channel: bindingContext.channel,
		accountId: bindingContext.accountId,
		conversationId: bindingContext.conversationId,
		parentConversationId: bindingContext.parentConversationId
	});
	const existingBinding = bindingService.resolveByConversation(conversationRef);
	const boundBy = typeof existingBinding?.metadata?.boundBy === "string" ? existingBinding.metadata.boundBy.trim() : "";
	if (existingBinding && boundBy && boundBy !== "system" && senderId && senderId !== boundBy) return stopWithText(`⚠️ Only ${boundBy} can refocus this conversation.`);
	const label = focusTarget.label || token;
	const accountId = bindingContext.accountId;
	const acpMeta = focusTarget.targetKind === "acp" ? readAcpSessionEntry({
		cfg: params.cfg,
		sessionKey: focusTarget.targetSessionKey
	})?.acp : void 0;
	if (!capabilities.placements.includes(bindingContext.placement)) return stopWithText("⚠️ Conversation bindings are unavailable for this account.");
	let binding;
	try {
		binding = await bindingService.bind({
			targetSessionKey: focusTarget.targetSessionKey,
			targetKind: focusTarget.targetKind === "acp" ? "session" : "subagent",
			conversation: normalizeConversationRef({
				channel: bindingContext.channel,
				accountId: bindingContext.accountId,
				conversationId: bindingContext.conversationId,
				parentConversationId: bindingContext.parentConversationId
			}),
			placement: bindingContext.placement,
			metadata: {
				threadName: resolveThreadBindingThreadName({
					agentId: focusTarget.agentId,
					label
				}),
				agentId: focusTarget.agentId,
				label,
				boundBy: senderId || "unknown",
				introText: resolveThreadBindingIntroText({
					agentId: focusTarget.agentId,
					label,
					idleTimeoutMs: resolveThreadBindingIdleTimeoutMsForChannel({
						cfg: params.cfg,
						channel: bindingContext.channel,
						accountId
					}),
					maxAgeMs: resolveThreadBindingMaxAgeMsForChannel({
						cfg: params.cfg,
						channel: bindingContext.channel,
						accountId
					}),
					sessionCwd: focusTarget.targetKind === "acp" ? resolveAcpSessionCwd(acpMeta) : void 0,
					sessionDetails: focusTarget.targetKind === "acp" ? resolveAcpThreadSessionDetailLines({
						sessionKey: focusTarget.targetSessionKey,
						meta: acpMeta
					}) : []
				})
			}
		});
	} catch {
		return stopWithText("⚠️ Failed to bind this conversation to the target session.");
	}
	return stopWithText(`✅ ${bindingContext.placement === "child" ? `created child conversation ${binding.conversation.conversationId} and bound it to ${binding.targetSessionKey}` : `bound this conversation to ${binding.targetSessionKey}`} (${focusTarget.targetKind}).`);
}
//#endregion
export { handleSubagentsFocusAction };
