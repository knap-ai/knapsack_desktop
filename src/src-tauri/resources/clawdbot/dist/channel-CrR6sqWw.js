import { _ as normalizeAccountId, g as DEFAULT_ACCOUNT_ID, u as resolveAgentIdFromSessionKey } from "./session-key-D7XpmyVq.js";
import { l as normalizeSecretInputString } from "./types.secrets-DTXJhyWe.js";
import { a as registerSessionBindingAdapter, o as unregisterSessionBindingAdapter } from "./session-binding-service-CAxmjUEJ.js";
import { t as PAIRING_APPROVED_MESSAGE } from "./pairing-message-DoFheDS-.js";
import { d as createDefaultChannelRuntimeState, i as buildProbeChannelStatusSummary, u as createComputedAccountStatusAdapter } from "./status-helpers-CtpWf3f1.js";
import { c as jsonResult, d as readNumberParam, f as readReactionParams, h as readStringParam, i as createActionGate } from "./common-RGbDbB5n.js";
import { u as createScopedDmSecurityResolver } from "./channel-config-helpers-B0S2z66F.js";
import { i as createLazyRuntimeNamedExport } from "./lazy-runtime-B4PzSTA5.js";
import { t as readBooleanParam } from "./boolean-param-ykmVVkpE.js";
import { c as resolveThreadBindingIdleTimeoutMsForChannel, d as resolveThreadBindingMaxAgeMsForChannel } from "./thread-bindings-policy-ypJ47uk9.js";
import { o as stripChannelTargetPrefix, r as createChatChannelPlugin, t as buildChannelOutboundSessionRoute } from "./core-BghMcc08.js";
import "./routing-Br1fEo8A.js";
import { t as createAccountStatusSink } from "./channel-lifecycle.core-CgpUnF4D.js";
import { b as projectAccountWarningCollector, g as createOpenGroupPolicyRestrictSendersWarningCollector } from "./group-policy-warnings-B8ZU4B4D.js";
import "./channel-policy-Dqo0XdDX.js";
import { t as collectBlueBubblesStatusIssues } from "./bluebubbles-CmVhv8jr.js";
import { t as resolveThreadBindingConversationIdFromBindingId } from "./conversation-runtime-DIsQmaYR.js";
import { a as BLUEBUBBLES_ACTIONS, o as BLUEBUBBLES_ACTION_NAMES } from "./bluebubbles-DBV3mfXs.js";
import { i as createPairingPrefixStripper } from "./channel-pairing-Nk7oRFrM.js";
import { t as extractToolSend } from "./tool-send-CcRqBFAk.js";
import "./secret-input-B35x6hdb.js";
import { a as inferBlueBubblesTargetChatType, c as looksLikeBlueBubblesTargetId, f as parseBlueBubblesTarget, l as normalizeBlueBubblesHandle, m as resolveBlueBubblesAccount, r as extractHandleFromChatGuid, s as looksLikeBlueBubblesExplicitTargetId, u as normalizeBlueBubblesMessagingTarget } from "./webhook-shared-Ccc9UQT3.js";
import { l as isMacOS26OrHigher, n as normalizeBlueBubblesAcpConversationId, o as getCachedBlueBubblesPrivateApiStatus, r as resolveBlueBubblesConversationIdFromTarget, t as matchBlueBubblesAcpConversation } from "./conversation-id-BrCsBq0V.js";
import { a as bluebubblesConfigSchema, c as describeBlueBubblesAccount, i as bluebubblesConfigAdapter, n as blueBubblesSetupAdapter, o as bluebubblesMeta, r as bluebubblesCapabilities, s as bluebubblesReload, t as blueBubblesSetupWizard } from "./setup-surface-D-5HQI7X.js";
import { n as resolveBlueBubblesGroupToolPolicy, t as resolveBlueBubblesGroupRequireMention } from "./group-policy-I8RESAmI.js";
//#region extensions/bluebubbles/src/actions.ts
const loadBlueBubblesActionsRuntime = createLazyRuntimeNamedExport(() => import("./actions.runtime-CTpLf9xc.js"), "blueBubblesActionsRuntime");
const providerId = "bluebubbles";
function mapTarget(raw) {
	const parsed = parseBlueBubblesTarget(raw);
	if (parsed.kind === "chat_guid") return {
		kind: "chat_guid",
		chatGuid: parsed.chatGuid
	};
	if (parsed.kind === "chat_id") return {
		kind: "chat_id",
		chatId: parsed.chatId
	};
	if (parsed.kind === "chat_identifier") return {
		kind: "chat_identifier",
		chatIdentifier: parsed.chatIdentifier
	};
	return {
		kind: "handle",
		address: normalizeBlueBubblesHandle(parsed.to),
		service: parsed.service
	};
}
function readMessageText(params) {
	return readStringParam(params, "text") ?? readStringParam(params, "message");
}
/** Supported action names for BlueBubbles */
const SUPPORTED_ACTIONS = new Set([...BLUEBUBBLES_ACTION_NAMES, "upload-file"]);
const PRIVATE_API_ACTIONS = new Set([
	"react",
	"edit",
	"unsend",
	"reply",
	"sendWithEffect",
	"renameGroup",
	"setGroupIcon",
	"addParticipant",
	"removeParticipant",
	"leaveGroup"
]);
const bluebubblesMessageActions = {
	describeMessageTool: ({ cfg, currentChannelId }) => {
		const account = resolveBlueBubblesAccount({ cfg });
		if (!account.enabled || !account.configured) return null;
		const gate = createActionGate(cfg.channels?.bluebubbles?.actions);
		const actions = /* @__PURE__ */ new Set();
		const macOS26 = isMacOS26OrHigher(account.accountId);
		const privateApiStatus = getCachedBlueBubblesPrivateApiStatus(account.accountId);
		for (const action of BLUEBUBBLES_ACTION_NAMES) {
			const spec = BLUEBUBBLES_ACTIONS[action];
			if (!spec?.gate) continue;
			if (privateApiStatus === false && PRIVATE_API_ACTIONS.has(action)) continue;
			if ("unsupportedOnMacOS26" in spec && spec.unsupportedOnMacOS26 && macOS26) continue;
			if (gate(spec.gate)) actions.add(action);
		}
		const lowered = (currentChannelId ? normalizeBlueBubblesMessagingTarget(currentChannelId) : void 0)?.trim().toLowerCase() ?? "";
		if (!(lowered.startsWith("chat_guid:") || lowered.startsWith("chat_id:") || lowered.startsWith("chat_identifier:") || lowered.startsWith("group:"))) {
			for (const action of BLUEBUBBLES_ACTION_NAMES) if ("groupOnly" in BLUEBUBBLES_ACTIONS[action] && BLUEBUBBLES_ACTIONS[action].groupOnly) actions.delete(action);
		}
		if (actions.delete("sendAttachment")) actions.add("upload-file");
		return { actions: Array.from(actions) };
	},
	supportsAction: ({ action }) => SUPPORTED_ACTIONS.has(action),
	extractToolSend: ({ args }) => extractToolSend(args, "sendMessage"),
	handleAction: async ({ action, params, cfg, accountId, toolContext }) => {
		const runtime = await loadBlueBubblesActionsRuntime();
		const account = resolveBlueBubblesAccount({
			cfg,
			accountId: accountId ?? void 0
		});
		const baseUrl = normalizeSecretInputString(account.config.serverUrl);
		const password = normalizeSecretInputString(account.config.password);
		const opts = {
			cfg,
			accountId: accountId ?? void 0
		};
		const assertPrivateApiEnabled = () => {
			if (getCachedBlueBubblesPrivateApiStatus(account.accountId) === false) throw new Error(`BlueBubbles ${action} requires Private API, but it is disabled on the BlueBubbles server.`);
		};
		const resolveChatGuid = async () => {
			const chatGuid = readStringParam(params, "chatGuid");
			if (chatGuid?.trim()) return chatGuid.trim();
			const chatIdentifier = readStringParam(params, "chatIdentifier");
			const chatId = readNumberParam(params, "chatId", { integer: true });
			const to = readStringParam(params, "to");
			const contextTarget = toolContext?.currentChannelId?.trim();
			const target = chatIdentifier?.trim() ? {
				kind: "chat_identifier",
				chatIdentifier: chatIdentifier.trim()
			} : typeof chatId === "number" ? {
				kind: "chat_id",
				chatId
			} : to ? mapTarget(to) : contextTarget ? mapTarget(contextTarget) : null;
			if (!target) throw new Error(`BlueBubbles ${action} requires chatGuid, chatIdentifier, chatId, or to.`);
			if (!baseUrl || !password) throw new Error(`BlueBubbles ${action} requires serverUrl and password.`);
			const resolved = await runtime.resolveChatGuidForTarget({
				baseUrl,
				password,
				target,
				allowPrivateNetwork: account.config.allowPrivateNetwork === true
			});
			if (!resolved) throw new Error(`BlueBubbles ${action} failed: chatGuid not found for target.`);
			return resolved;
		};
		if (action === "react") {
			assertPrivateApiEnabled();
			const { emoji, remove, isEmpty } = readReactionParams(params, { removeErrorMessage: "Emoji is required to remove a BlueBubbles reaction." });
			if (isEmpty && !remove) throw new Error("BlueBubbles react requires emoji parameter. Use action=react with emoji=<emoji> and messageId=<message_id>.");
			const rawMessageId = readStringParam(params, "messageId");
			if (!rawMessageId) throw new Error("BlueBubbles react requires messageId parameter (the message ID to react to). Use action=react with messageId=<message_id>, emoji=<emoji>, and to/chatGuid to identify the chat.");
			const messageId = runtime.resolveBlueBubblesMessageId(rawMessageId, { requireKnownShortId: true });
			const partIndex = readNumberParam(params, "partIndex", { integer: true });
			const resolvedChatGuid = await resolveChatGuid();
			await runtime.sendBlueBubblesReaction({
				chatGuid: resolvedChatGuid,
				messageGuid: messageId,
				emoji,
				remove: remove || void 0,
				partIndex: typeof partIndex === "number" ? partIndex : void 0,
				opts
			});
			return jsonResult({
				ok: true,
				...remove ? { removed: true } : { added: emoji }
			});
		}
		if (action === "edit") {
			assertPrivateApiEnabled();
			if (isMacOS26OrHigher(accountId ?? void 0)) throw new Error("BlueBubbles edit is not supported on macOS 26 or higher. Apple removed the ability to edit iMessages in this version.");
			const rawMessageId = readStringParam(params, "messageId");
			const newText = readStringParam(params, "text") ?? readStringParam(params, "newText") ?? readStringParam(params, "message");
			if (!rawMessageId || !newText) {
				const missing = [];
				if (!rawMessageId) missing.push("messageId (the message ID to edit)");
				if (!newText) missing.push("text (the new message content)");
				throw new Error(`BlueBubbles edit requires: ${missing.join(", ")}. Use action=edit with messageId=<message_id>, text=<new_content>.`);
			}
			const messageId = runtime.resolveBlueBubblesMessageId(rawMessageId, { requireKnownShortId: true });
			const partIndex = readNumberParam(params, "partIndex", { integer: true });
			const backwardsCompatMessage = readStringParam(params, "backwardsCompatMessage");
			await runtime.editBlueBubblesMessage(messageId, newText, {
				...opts,
				partIndex: typeof partIndex === "number" ? partIndex : void 0,
				backwardsCompatMessage: backwardsCompatMessage ?? void 0
			});
			return jsonResult({
				ok: true,
				edited: rawMessageId
			});
		}
		if (action === "unsend") {
			assertPrivateApiEnabled();
			const rawMessageId = readStringParam(params, "messageId");
			if (!rawMessageId) throw new Error("BlueBubbles unsend requires messageId parameter (the message ID to unsend). Use action=unsend with messageId=<message_id>.");
			const messageId = runtime.resolveBlueBubblesMessageId(rawMessageId, { requireKnownShortId: true });
			const partIndex = readNumberParam(params, "partIndex", { integer: true });
			await runtime.unsendBlueBubblesMessage(messageId, {
				...opts,
				partIndex: typeof partIndex === "number" ? partIndex : void 0
			});
			return jsonResult({
				ok: true,
				unsent: rawMessageId
			});
		}
		if (action === "reply") {
			assertPrivateApiEnabled();
			const rawMessageId = readStringParam(params, "messageId");
			const text = readMessageText(params);
			const to = readStringParam(params, "to") ?? readStringParam(params, "target");
			if (!rawMessageId || !text || !to) {
				const missing = [];
				if (!rawMessageId) missing.push("messageId (the message ID to reply to)");
				if (!text) missing.push("text or message (the reply message content)");
				if (!to) missing.push("to or target (the chat target)");
				throw new Error(`BlueBubbles reply requires: ${missing.join(", ")}. Use action=reply with messageId=<message_id>, message=<your reply>, target=<chat_target>.`);
			}
			const messageId = runtime.resolveBlueBubblesMessageId(rawMessageId, { requireKnownShortId: true });
			const partIndex = readNumberParam(params, "partIndex", { integer: true });
			return jsonResult({
				ok: true,
				messageId: (await runtime.sendMessageBlueBubbles(to, text, {
					...opts,
					replyToMessageGuid: messageId,
					replyToPartIndex: typeof partIndex === "number" ? partIndex : void 0
				})).messageId,
				repliedTo: rawMessageId
			});
		}
		if (action === "sendWithEffect") {
			assertPrivateApiEnabled();
			const text = readMessageText(params);
			const to = readStringParam(params, "to") ?? readStringParam(params, "target");
			const effectId = readStringParam(params, "effectId") ?? readStringParam(params, "effect");
			if (!text || !to || !effectId) {
				const missing = [];
				if (!text) missing.push("text or message (the message content)");
				if (!to) missing.push("to or target (the chat target)");
				if (!effectId) missing.push("effectId or effect (e.g., slam, loud, gentle, invisible-ink, confetti, lasers, fireworks, balloons, heart)");
				throw new Error(`BlueBubbles sendWithEffect requires: ${missing.join(", ")}. Use action=sendWithEffect with message=<message>, target=<chat_target>, effectId=<effect_name>.`);
			}
			return jsonResult({
				ok: true,
				messageId: (await runtime.sendMessageBlueBubbles(to, text, {
					...opts,
					effectId
				})).messageId,
				effect: effectId
			});
		}
		if (action === "renameGroup") {
			assertPrivateApiEnabled();
			const resolvedChatGuid = await resolveChatGuid();
			const displayName = readStringParam(params, "displayName") ?? readStringParam(params, "name");
			if (!displayName) throw new Error("BlueBubbles renameGroup requires displayName or name parameter.");
			await runtime.renameBlueBubblesChat(resolvedChatGuid, displayName, opts);
			return jsonResult({
				ok: true,
				renamed: resolvedChatGuid,
				displayName
			});
		}
		if (action === "setGroupIcon") {
			assertPrivateApiEnabled();
			const resolvedChatGuid = await resolveChatGuid();
			const base64Buffer = readStringParam(params, "buffer");
			const filename = readStringParam(params, "filename") ?? readStringParam(params, "name") ?? "icon.png";
			const contentType = readStringParam(params, "contentType") ?? readStringParam(params, "mimeType");
			if (!base64Buffer) throw new Error("BlueBubbles setGroupIcon requires an image. Use action=setGroupIcon with media=<image_url> or path=<local_file_path> to set the group icon.");
			const buffer = Uint8Array.from(atob(base64Buffer), (c) => c.charCodeAt(0));
			await runtime.setGroupIconBlueBubbles(resolvedChatGuid, buffer, filename, {
				...opts,
				contentType: contentType ?? void 0
			});
			return jsonResult({
				ok: true,
				chatGuid: resolvedChatGuid,
				iconSet: true
			});
		}
		if (action === "addParticipant") {
			assertPrivateApiEnabled();
			const resolvedChatGuid = await resolveChatGuid();
			const address = readStringParam(params, "address") ?? readStringParam(params, "participant");
			if (!address) throw new Error("BlueBubbles addParticipant requires address or participant parameter.");
			await runtime.addBlueBubblesParticipant(resolvedChatGuid, address, opts);
			return jsonResult({
				ok: true,
				added: address,
				chatGuid: resolvedChatGuid
			});
		}
		if (action === "removeParticipant") {
			assertPrivateApiEnabled();
			const resolvedChatGuid = await resolveChatGuid();
			const address = readStringParam(params, "address") ?? readStringParam(params, "participant");
			if (!address) throw new Error("BlueBubbles removeParticipant requires address or participant parameter.");
			await runtime.removeBlueBubblesParticipant(resolvedChatGuid, address, opts);
			return jsonResult({
				ok: true,
				removed: address,
				chatGuid: resolvedChatGuid
			});
		}
		if (action === "leaveGroup") {
			assertPrivateApiEnabled();
			const resolvedChatGuid = await resolveChatGuid();
			await runtime.leaveBlueBubblesChat(resolvedChatGuid, opts);
			return jsonResult({
				ok: true,
				left: resolvedChatGuid
			});
		}
		if (action === "sendAttachment" || action === "upload-file") {
			const to = readStringParam(params, "to", { required: true });
			const filename = readStringParam(params, "filename", { required: true });
			const caption = readStringParam(params, "caption") ?? readStringParam(params, "message");
			const contentType = readStringParam(params, "contentType") ?? readStringParam(params, "mimeType");
			const asVoice = readBooleanParam(params, "asVoice");
			const base64Buffer = readStringParam(params, "buffer");
			const filePath = readStringParam(params, "path") ?? readStringParam(params, "filePath");
			let buffer;
			if (base64Buffer) buffer = Uint8Array.from(atob(base64Buffer), (c) => c.charCodeAt(0));
			else if (filePath) throw new Error(`BlueBubbles ${action}: filePath not supported in action, provide buffer as base64.`);
			else throw new Error(`BlueBubbles ${action} requires buffer (base64) parameter.`);
			return jsonResult({
				ok: true,
				messageId: (await runtime.sendBlueBubblesAttachment({
					to,
					buffer,
					filename,
					contentType: contentType ?? void 0,
					caption: caption ?? void 0,
					asVoice: asVoice ?? void 0,
					opts
				})).messageId
			});
		}
		throw new Error(`Action ${action} is not supported for provider ${providerId}.`);
	}
};
//#endregion
//#region extensions/bluebubbles/src/conversation-bindings.ts
const BLUEBUBBLES_CONVERSATION_BINDINGS_STATE_KEY = Symbol.for("openclaw.bluebubblesConversationBindingsState");
let state;
function getState() {
	if (!state) {
		const globalStore = globalThis;
		state = globalStore[BLUEBUBBLES_CONVERSATION_BINDINGS_STATE_KEY] ?? {
			managersByAccountId: /* @__PURE__ */ new Map(),
			bindingsByAccountConversation: /* @__PURE__ */ new Map()
		};
		globalStore[BLUEBUBBLES_CONVERSATION_BINDINGS_STATE_KEY] = state;
	}
	return state;
}
function resolveBindingKey(params) {
	return `${params.accountId}:${params.conversationId}`;
}
function toSessionBindingTargetKind(raw) {
	return raw === "subagent" ? "subagent" : "session";
}
function toBlueBubblesTargetKind(raw) {
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
			channel: "bluebubbles",
			accountId: record.accountId,
			conversationId: record.conversationId
		},
		status: "active",
		boundAt: record.boundAt,
		expiresAt,
		metadata: {
			agentId: record.agentId,
			label: record.label,
			boundBy: record.boundBy,
			lastActivityAt: record.lastActivityAt,
			idleTimeoutMs: defaults.idleTimeoutMs,
			maxAgeMs: defaults.maxAgeMs
		}
	};
}
function createBlueBubblesConversationBindingManager(params) {
	const accountId = normalizeAccountId(params.accountId);
	const existing = getState().managersByAccountId.get(accountId);
	if (existing) return existing;
	const idleTimeoutMs = resolveThreadBindingIdleTimeoutMsForChannel({
		cfg: params.cfg,
		channel: "bluebubbles",
		accountId
	});
	const maxAgeMs = resolveThreadBindingMaxAgeMsForChannel({
		cfg: params.cfg,
		channel: "bluebubbles",
		accountId
	});
	const manager = {
		accountId,
		getByConversationId: (conversationId) => getState().bindingsByAccountConversation.get(resolveBindingKey({
			accountId,
			conversationId
		})),
		listBySessionKey: (targetSessionKey) => [...getState().bindingsByAccountConversation.values()].filter((record) => record.accountId === accountId && record.targetSessionKey === targetSessionKey),
		bindConversation: ({ conversationId, targetKind, targetSessionKey, metadata }) => {
			const normalizedConversationId = conversationId.trim();
			const normalizedTargetSessionKey = targetSessionKey.trim();
			if (!normalizedConversationId || !normalizedTargetSessionKey) return null;
			const now = Date.now();
			const record = {
				accountId,
				conversationId: normalizedConversationId,
				targetKind: toBlueBubblesTargetKind(targetKind),
				targetSessionKey: normalizedTargetSessionKey,
				agentId: typeof metadata?.agentId === "string" && metadata.agentId.trim() ? metadata.agentId.trim() : resolveAgentIdFromSessionKey(normalizedTargetSessionKey),
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
				channel: "bluebubbles",
				accountId,
				adapter: sessionBindingAdapter
			});
		}
	};
	const sessionBindingAdapter = {
		channel: "bluebubbles",
		accountId,
		capabilities: { placements: ["current"] },
		bind: async (input) => {
			if (input.conversation.channel !== "bluebubbles" || input.placement === "child") return null;
			const bound = manager.bindConversation({
				conversationId: input.conversation.conversationId,
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
			if (ref.channel !== "bluebubbles") return null;
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
const __testing = { resetBlueBubblesConversationBindingsForTests() {
	for (const manager of getState().managersByAccountId.values()) manager.stop();
	getState().managersByAccountId.clear();
	getState().bindingsByAccountConversation.clear();
} };
//#endregion
//#region extensions/bluebubbles/src/session-route.ts
function resolveBlueBubblesOutboundSessionRoute(params) {
	const stripped = stripChannelTargetPrefix(params.target, "bluebubbles");
	if (!stripped) return null;
	const parsed = parseBlueBubblesTarget(stripped);
	const isGroup = parsed.kind === "chat_id" || parsed.kind === "chat_guid" || parsed.kind === "chat_identifier";
	const peerId = parsed.kind === "chat_id" ? String(parsed.chatId) : parsed.kind === "chat_guid" ? parsed.chatGuid : parsed.kind === "chat_identifier" ? parsed.chatIdentifier : parsed.to;
	return buildChannelOutboundSessionRoute({
		cfg: params.cfg,
		agentId: params.agentId,
		channel: "bluebubbles",
		accountId: params.accountId,
		peer: {
			kind: isGroup ? "group" : "direct",
			id: peerId
		},
		chatType: isGroup ? "group" : "direct",
		from: isGroup ? `group:${peerId}` : `bluebubbles:${peerId}`,
		to: `bluebubbles:${stripped}`
	});
}
//#endregion
//#region extensions/bluebubbles/src/channel.ts
const loadBlueBubblesChannelRuntime = createLazyRuntimeNamedExport(() => import("./channel.runtime-DSM9Ey60.js"), "blueBubblesChannelRuntime");
const resolveBlueBubblesDmPolicy = createScopedDmSecurityResolver({
	channelKey: "bluebubbles",
	resolvePolicy: (account) => account.config.dmPolicy,
	resolveAllowFrom: (account) => account.config.allowFrom,
	policyPathSuffix: "dmPolicy",
	normalizeEntry: (raw) => normalizeBlueBubblesHandle(raw.replace(/^bluebubbles:/i, ""))
});
const collectBlueBubblesSecurityWarnings = createOpenGroupPolicyRestrictSendersWarningCollector({
	resolveGroupPolicy: (account) => account.config.groupPolicy,
	defaultGroupPolicy: "allowlist",
	surface: "BlueBubbles groups",
	openScope: "any member",
	groupPolicyPath: "channels.bluebubbles.groupPolicy",
	groupAllowFromPath: "channels.bluebubbles.groupAllowFrom",
	mentionGated: false
});
const bluebubblesPlugin = createChatChannelPlugin({
	base: {
		id: "bluebubbles",
		meta: bluebubblesMeta,
		capabilities: bluebubblesCapabilities,
		groups: {
			resolveRequireMention: resolveBlueBubblesGroupRequireMention,
			resolveToolPolicy: resolveBlueBubblesGroupToolPolicy
		},
		reload: bluebubblesReload,
		configSchema: bluebubblesConfigSchema,
		setupWizard: blueBubblesSetupWizard,
		config: {
			...bluebubblesConfigAdapter,
			isConfigured: (account) => account.configured,
			describeAccount: (account) => describeBlueBubblesAccount(account)
		},
		conversationBindings: {
			supportsCurrentConversationBinding: true,
			createManager: ({ cfg, accountId }) => createBlueBubblesConversationBindingManager({
				cfg,
				accountId: accountId ?? void 0
			})
		},
		actions: bluebubblesMessageActions,
		bindings: {
			compileConfiguredBinding: ({ conversationId }) => normalizeBlueBubblesAcpConversationId(conversationId),
			matchInboundConversation: ({ compiledBinding, conversationId }) => matchBlueBubblesAcpConversation({
				bindingConversationId: compiledBinding.conversationId,
				conversationId
			}),
			resolveCommandConversation: ({ originatingTo, commandTo, fallbackTo }) => {
				const conversationId = resolveBlueBubblesConversationIdFromTarget(originatingTo ?? "") ?? resolveBlueBubblesConversationIdFromTarget(commandTo ?? "") ?? resolveBlueBubblesConversationIdFromTarget(fallbackTo ?? "");
				return conversationId ? { conversationId } : null;
			}
		},
		messaging: {
			normalizeTarget: normalizeBlueBubblesMessagingTarget,
			inferTargetChatType: ({ to }) => inferBlueBubblesTargetChatType(to),
			resolveOutboundSessionRoute: (params) => resolveBlueBubblesOutboundSessionRoute(params),
			targetResolver: {
				looksLikeId: looksLikeBlueBubblesExplicitTargetId,
				hint: "<handle|chat_guid:GUID|chat_id:ID|chat_identifier:ID>",
				resolveTarget: async ({ normalized }) => {
					const to = normalized?.trim();
					if (!to) return null;
					const chatType = inferBlueBubblesTargetChatType(to);
					if (!chatType) return null;
					return {
						to,
						kind: chatType === "direct" ? "user" : "group",
						source: "normalized"
					};
				}
			},
			formatTargetDisplay: ({ target, display }) => {
				const shouldParseDisplay = (value) => {
					if (looksLikeBlueBubblesTargetId(value)) return true;
					return /^(bluebubbles:|chat_guid:|chat_id:|chat_identifier:)/i.test(value);
				};
				const extractCleanDisplay = (value) => {
					const trimmed = value?.trim();
					if (!trimmed) return null;
					try {
						const parsed = parseBlueBubblesTarget(trimmed);
						if (parsed.kind === "chat_guid") {
							const handle = extractHandleFromChatGuid(parsed.chatGuid);
							if (handle) return handle;
						}
						if (parsed.kind === "handle") return normalizeBlueBubblesHandle(parsed.to);
					} catch {}
					const stripped = trimmed.replace(/^bluebubbles:/i, "").replace(/^chat_guid:/i, "").replace(/^chat_id:/i, "").replace(/^chat_identifier:/i, "");
					const handle = extractHandleFromChatGuid(stripped);
					if (handle) return handle;
					if (stripped.includes(";-;") || stripped.includes(";+;")) return null;
					return stripped;
				};
				const trimmedDisplay = display?.trim();
				if (trimmedDisplay) {
					if (!shouldParseDisplay(trimmedDisplay)) return trimmedDisplay;
					const cleanDisplay = extractCleanDisplay(trimmedDisplay);
					if (cleanDisplay) return cleanDisplay;
				}
				const cleanTarget = extractCleanDisplay(target);
				if (cleanTarget) return cleanTarget;
				return display?.trim() || target?.trim() || "";
			}
		},
		setup: blueBubblesSetupAdapter,
		status: createComputedAccountStatusAdapter({
			defaultRuntime: createDefaultChannelRuntimeState(DEFAULT_ACCOUNT_ID),
			collectStatusIssues: collectBlueBubblesStatusIssues,
			buildChannelSummary: ({ snapshot }) => buildProbeChannelStatusSummary(snapshot, { baseUrl: snapshot.baseUrl ?? null }),
			probeAccount: async ({ account, timeoutMs }) => (await loadBlueBubblesChannelRuntime()).probeBlueBubbles({
				baseUrl: account.baseUrl,
				password: account.config.password ?? null,
				timeoutMs,
				allowPrivateNetwork: account.config.allowPrivateNetwork === true
			}),
			resolveAccountSnapshot: ({ account, runtime, probe }) => {
				const running = runtime?.running ?? false;
				const probeOk = probe?.ok;
				return {
					accountId: account.accountId,
					name: account.name,
					enabled: account.enabled,
					configured: account.configured,
					extra: {
						baseUrl: account.baseUrl,
						connected: probeOk ?? running
					}
				};
			}
		}),
		gateway: { startAccount: async (ctx) => {
			const runtime = await loadBlueBubblesChannelRuntime();
			const account = ctx.account;
			const conversationBindings = createBlueBubblesConversationBindingManager({
				cfg: ctx.cfg,
				accountId: ctx.accountId
			});
			const webhookPath = runtime.resolveWebhookPathFromConfig(account.config);
			const statusSink = createAccountStatusSink({
				accountId: ctx.accountId,
				setStatus: ctx.setStatus
			});
			statusSink({ baseUrl: account.baseUrl });
			ctx.log?.info(`[${account.accountId}] starting provider (webhook=${webhookPath})`);
			try {
				return await runtime.monitorBlueBubblesProvider({
					account,
					config: ctx.cfg,
					runtime: ctx.runtime,
					abortSignal: ctx.abortSignal,
					statusSink,
					webhookPath
				});
			} finally {
				conversationBindings.stop();
			}
		} }
	},
	security: {
		resolveDmPolicy: resolveBlueBubblesDmPolicy,
		collectWarnings: projectAccountWarningCollector(collectBlueBubblesSecurityWarnings)
	},
	threading: { buildToolContext: ({ context, hasRepliedRef }) => ({
		currentChannelId: context.To?.trim() || void 0,
		currentThreadTs: context.ReplyToIdFull ?? context.ReplyToId,
		hasRepliedRef
	}) },
	pairing: { text: {
		idLabel: "bluebubblesSenderId",
		message: PAIRING_APPROVED_MESSAGE,
		normalizeAllowEntry: createPairingPrefixStripper(/^bluebubbles:/i, normalizeBlueBubblesHandle),
		notify: async ({ cfg, id, message, accountId }) => {
			await (await loadBlueBubblesChannelRuntime()).sendMessageBlueBubbles(id, message, {
				cfg,
				accountId
			});
		}
	} },
	outbound: {
		base: {
			deliveryMode: "direct",
			textChunkLimit: 4e3,
			resolveTarget: ({ to }) => {
				const trimmed = to?.trim();
				if (!trimmed) return {
					ok: false,
					error: /* @__PURE__ */ new Error("Delivering to BlueBubbles requires --to <handle|chat_guid:GUID>")
				};
				return {
					ok: true,
					to: trimmed
				};
			}
		},
		attachedResults: {
			channel: "bluebubbles",
			sendText: async ({ cfg, to, text, accountId, replyToId }) => {
				const runtime = await loadBlueBubblesChannelRuntime();
				const rawReplyToId = typeof replyToId === "string" ? replyToId.trim() : "";
				const replyToMessageGuid = rawReplyToId ? runtime.resolveBlueBubblesMessageId(rawReplyToId, { requireKnownShortId: true }) : "";
				return await runtime.sendMessageBlueBubbles(to, text, {
					cfg,
					accountId: accountId ?? void 0,
					replyToMessageGuid: replyToMessageGuid || void 0
				});
			},
			sendMedia: async (ctx) => {
				const runtime = await loadBlueBubblesChannelRuntime();
				const { cfg, to, text, mediaUrl, accountId, replyToId } = ctx;
				const { mediaPath, mediaBuffer, contentType, filename, caption } = ctx;
				return await runtime.sendBlueBubblesMedia({
					cfg,
					to,
					mediaUrl,
					mediaPath,
					mediaBuffer,
					contentType,
					filename,
					caption: caption ?? text ?? void 0,
					replyToId: replyToId ?? null,
					accountId: accountId ?? void 0
				});
			}
		}
	}
});
//#endregion
export { __testing as n, createBlueBubblesConversationBindingManager as r, bluebubblesPlugin as t };
