import { n as resolveGlobalSingleton } from "./global-singleton-D9TlHTN5.js";
import { _ as normalizeAccountId, u as resolveAgentIdFromSessionKey } from "./session-key-DAhnzjyr.js";
import { K as registerSessionBindingAdapter, a as resolveThreadBindingConversationIdFromBindingId, q as unregisterSessionBindingAdapter } from "./conversation-runtime-nmWgJSXS.js";
import { s as resolveThreadBindingIdleTimeoutMsForChannel, u as resolveThreadBindingMaxAgeMsForChannel } from "./thread-bindings-policy-C1Av-nes.js";
//#region extensions/feishu/src/conversation-id.ts
function normalizeText(value) {
	if (typeof value !== "string") return;
	return value.trim() || void 0;
}
function buildFeishuConversationId(params) {
	const chatId = normalizeText(params.chatId) ?? "unknown";
	const senderOpenId = normalizeText(params.senderOpenId);
	const topicId = normalizeText(params.topicId);
	switch (params.scope) {
		case "group_sender": return senderOpenId ? `${chatId}:sender:${senderOpenId}` : chatId;
		case "group_topic": return topicId ? `${chatId}:topic:${topicId}` : chatId;
		case "group_topic_sender":
			if (topicId && senderOpenId) return `${chatId}:topic:${topicId}:sender:${senderOpenId}`;
			if (topicId) return `${chatId}:topic:${topicId}`;
			return senderOpenId ? `${chatId}:sender:${senderOpenId}` : chatId;
		default: return chatId;
	}
}
function parseFeishuConversationId(params) {
	const conversationId = normalizeText(params.conversationId);
	const parentConversationId = normalizeText(params.parentConversationId);
	if (!conversationId) return null;
	const topicSenderMatch = conversationId.match(/^(.+):topic:([^:]+):sender:([^:]+)$/);
	if (topicSenderMatch) {
		const [, chatId, topicId, senderOpenId] = topicSenderMatch;
		return {
			canonicalConversationId: buildFeishuConversationId({
				chatId,
				scope: "group_topic_sender",
				topicId,
				senderOpenId
			}),
			chatId,
			topicId,
			senderOpenId,
			scope: "group_topic_sender"
		};
	}
	const topicMatch = conversationId.match(/^(.+):topic:([^:]+)$/);
	if (topicMatch) {
		const [, chatId, topicId] = topicMatch;
		return {
			canonicalConversationId: buildFeishuConversationId({
				chatId,
				scope: "group_topic",
				topicId
			}),
			chatId,
			topicId,
			scope: "group_topic"
		};
	}
	const senderMatch = conversationId.match(/^(.+):sender:([^:]+)$/);
	if (senderMatch) {
		const [, chatId, senderOpenId] = senderMatch;
		return {
			canonicalConversationId: buildFeishuConversationId({
				chatId,
				scope: "group_sender",
				senderOpenId
			}),
			chatId,
			senderOpenId,
			scope: "group_sender"
		};
	}
	if (parentConversationId) return {
		canonicalConversationId: buildFeishuConversationId({
			chatId: parentConversationId,
			scope: "group_topic",
			topicId: conversationId
		}),
		chatId: parentConversationId,
		topicId: conversationId,
		scope: "group_topic"
	};
	return {
		canonicalConversationId: conversationId,
		chatId: conversationId,
		scope: "group"
	};
}
//#endregion
//#region extensions/feishu/src/thread-bindings.ts
const state = resolveGlobalSingleton(Symbol.for("openclaw.feishuThreadBindingsState"), () => ({
	managersByAccountId: /* @__PURE__ */ new Map(),
	bindingsByAccountConversation: /* @__PURE__ */ new Map()
}));
function getState() {
	return state;
}
function resolveBindingKey(params) {
	return `${params.accountId}:${params.conversationId}`;
}
function toSessionBindingTargetKind(raw) {
	return raw === "subagent" ? "subagent" : "session";
}
function toFeishuTargetKind(raw) {
	return raw === "subagent" ? "subagent" : "acp";
}
function toSessionBindingRecord(record, defaults) {
	const idleExpiresAt = defaults.idleTimeoutMs > 0 ? record.lastActivityAt + defaults.idleTimeoutMs : void 0;
	const maxAgeExpiresAt = defaults.maxAgeMs > 0 ? record.boundAt + defaults.maxAgeMs : void 0;
	const expiresAt = idleExpiresAt != null && maxAgeExpiresAt != null ? Math.min(idleExpiresAt, maxAgeExpiresAt) : idleExpiresAt ?? maxAgeExpiresAt;
	return {
		bindingId: resolveBindingKey({
			accountId: record.accountId,
			conversationId: record.conversationId
		}),
		targetSessionKey: record.targetSessionKey,
		targetKind: toSessionBindingTargetKind(record.targetKind),
		conversation: {
			channel: "feishu",
			accountId: record.accountId,
			conversationId: record.conversationId,
			parentConversationId: record.parentConversationId
		},
		status: "active",
		boundAt: record.boundAt,
		expiresAt,
		metadata: {
			agentId: record.agentId,
			label: record.label,
			boundBy: record.boundBy,
			deliveryTo: record.deliveryTo,
			deliveryThreadId: record.deliveryThreadId,
			lastActivityAt: record.lastActivityAt,
			idleTimeoutMs: defaults.idleTimeoutMs,
			maxAgeMs: defaults.maxAgeMs
		}
	};
}
function createFeishuThreadBindingManager(params) {
	const accountId = normalizeAccountId(params.accountId);
	const existing = getState().managersByAccountId.get(accountId);
	if (existing) return existing;
	const idleTimeoutMs = resolveThreadBindingIdleTimeoutMsForChannel({
		cfg: params.cfg,
		channel: "feishu",
		accountId
	});
	const maxAgeMs = resolveThreadBindingMaxAgeMsForChannel({
		cfg: params.cfg,
		channel: "feishu",
		accountId
	});
	const manager = {
		accountId,
		getByConversationId: (conversationId) => getState().bindingsByAccountConversation.get(resolveBindingKey({
			accountId,
			conversationId
		})),
		listBySessionKey: (targetSessionKey) => [...getState().bindingsByAccountConversation.values()].filter((record) => record.accountId === accountId && record.targetSessionKey === targetSessionKey),
		bindConversation: ({ conversationId, parentConversationId, targetKind, targetSessionKey, metadata }) => {
			const normalizedConversationId = conversationId.trim();
			if (!normalizedConversationId || !targetSessionKey.trim()) return null;
			const now = Date.now();
			const record = {
				accountId,
				conversationId: normalizedConversationId,
				parentConversationId: parentConversationId?.trim() || void 0,
				deliveryTo: typeof metadata?.deliveryTo === "string" && metadata.deliveryTo.trim() ? metadata.deliveryTo.trim() : void 0,
				deliveryThreadId: typeof metadata?.deliveryThreadId === "string" && metadata.deliveryThreadId.trim() ? metadata.deliveryThreadId.trim() : void 0,
				targetKind: toFeishuTargetKind(targetKind),
				targetSessionKey: targetSessionKey.trim(),
				agentId: typeof metadata?.agentId === "string" && metadata.agentId.trim() ? metadata.agentId.trim() : resolveAgentIdFromSessionKey(targetSessionKey),
				label: typeof metadata?.label === "string" && metadata.label.trim() ? metadata.label.trim() : void 0,
				boundBy: typeof metadata?.boundBy === "string" && metadata.boundBy.trim() ? metadata.boundBy.trim() : void 0,
				boundAt: now,
				lastActivityAt: now
			};
			getState().bindingsByAccountConversation.set(resolveBindingKey({
				accountId,
				conversationId: normalizedConversationId
			}), record);
			return record;
		},
		touchConversation: (conversationId, at = Date.now()) => {
			const key = resolveBindingKey({
				accountId,
				conversationId
			});
			const existingRecord = getState().bindingsByAccountConversation.get(key);
			if (!existingRecord) return null;
			const updated = {
				...existingRecord,
				lastActivityAt: at
			};
			getState().bindingsByAccountConversation.set(key, updated);
			return updated;
		},
		unbindConversation: (conversationId) => {
			const key = resolveBindingKey({
				accountId,
				conversationId
			});
			const existingRecord = getState().bindingsByAccountConversation.get(key);
			if (!existingRecord) return null;
			getState().bindingsByAccountConversation.delete(key);
			return existingRecord;
		},
		unbindBySessionKey: (targetSessionKey) => {
			const removed = [];
			for (const record of [...getState().bindingsByAccountConversation.values()]) {
				if (record.accountId !== accountId || record.targetSessionKey !== targetSessionKey) continue;
				getState().bindingsByAccountConversation.delete(resolveBindingKey({
					accountId,
					conversationId: record.conversationId
				}));
				removed.push(record);
			}
			return removed;
		},
		stop: () => {
			for (const key of [...getState().bindingsByAccountConversation.keys()]) if (key.startsWith(`${accountId}:`)) getState().bindingsByAccountConversation.delete(key);
			getState().managersByAccountId.delete(accountId);
			unregisterSessionBindingAdapter({
				channel: "feishu",
				accountId,
				adapter: sessionBindingAdapter
			});
		}
	};
	const sessionBindingAdapter = {
		channel: "feishu",
		accountId,
		capabilities: { placements: ["current"] },
		bind: async (input) => {
			if (input.conversation.channel !== "feishu" || input.placement === "child") return null;
			const bound = manager.bindConversation({
				conversationId: input.conversation.conversationId,
				parentConversationId: input.conversation.parentConversationId,
				targetKind: input.targetKind,
				targetSessionKey: input.targetSessionKey,
				metadata: input.metadata
			});
			return bound ? toSessionBindingRecord(bound, {
				idleTimeoutMs,
				maxAgeMs
			}) : null;
		},
		listBySession: (targetSessionKey) => manager.listBySessionKey(targetSessionKey).map((entry) => toSessionBindingRecord(entry, {
			idleTimeoutMs,
			maxAgeMs
		})),
		resolveByConversation: (ref) => {
			if (ref.channel !== "feishu") return null;
			const found = manager.getByConversationId(ref.conversationId);
			return found ? toSessionBindingRecord(found, {
				idleTimeoutMs,
				maxAgeMs
			}) : null;
		},
		touch: (bindingId, at) => {
			const conversationId = resolveThreadBindingConversationIdFromBindingId({
				accountId,
				bindingId
			});
			if (conversationId) manager.touchConversation(conversationId, at);
		},
		unbind: async (input) => {
			if (input.targetSessionKey?.trim()) return manager.unbindBySessionKey(input.targetSessionKey.trim()).map((entry) => toSessionBindingRecord(entry, {
				idleTimeoutMs,
				maxAgeMs
			}));
			const conversationId = resolveThreadBindingConversationIdFromBindingId({
				accountId,
				bindingId: input.bindingId
			});
			if (!conversationId) return [];
			const removed = manager.unbindConversation(conversationId);
			return removed ? [toSessionBindingRecord(removed, {
				idleTimeoutMs,
				maxAgeMs
			})] : [];
		}
	};
	registerSessionBindingAdapter(sessionBindingAdapter);
	getState().managersByAccountId.set(accountId, manager);
	return manager;
}
function getFeishuThreadBindingManager(accountId) {
	return getState().managersByAccountId.get(normalizeAccountId(accountId)) ?? null;
}
const __testing = { resetFeishuThreadBindingsForTests() {
	for (const manager of getState().managersByAccountId.values()) manager.stop();
	getState().managersByAccountId.clear();
	getState().bindingsByAccountConversation.clear();
} };
//#endregion
export { parseFeishuConversationId as a, buildFeishuConversationId as i, createFeishuThreadBindingManager as n, getFeishuThreadBindingManager as r, __testing as t };
