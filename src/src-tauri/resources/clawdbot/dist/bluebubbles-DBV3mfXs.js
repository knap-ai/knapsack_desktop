import "./links-Ce33eXq9.js";
import "./zod-schema.core-Cx4hqkoC.js";
import "./config-schema-BoSEJoAt.js";
import "./zod-schema.agent-runtime-BB53-_4o.js";
import { a as loadBundledPluginPublicSurfaceModuleSync } from "./facade-runtime-D_0VC8Qr.js";
import "./setup-helpers-CjYO5YkF.js";
import "./status-helpers-CtpWf3f1.js";
import "./identity-BVAU5Jb3.js";
import "./common-RGbDbB5n.js";
import "./setup-wizard-helpers-BfrhuTOh.js";
import "./dm-policy-shared-ikRqobo8.js";
import "./history-5RBVRj2e.js";
import "./bluebubbles-policy-BQdlBcYI.js";
import "./bluebubbles-CmVhv8jr.js";
import "./channel-reply-pipeline-S26JmiPz.js";
import "./text-runtime-B0ZpmkER.js";
import { r as parseChatTargetPrefixesOrThrow, s as resolveServicePrefixedTarget } from "./chat-target-prefixes-BCUMPwim.js";
import "./webhook-ingress-B2uHxBM3.js";
//#region src/channels/plugins/bluebubbles-actions.ts
const BLUEBUBBLES_ACTIONS = {
	react: { gate: "reactions" },
	edit: {
		gate: "edit",
		unsupportedOnMacOS26: true
	},
	unsend: { gate: "unsend" },
	reply: { gate: "reply" },
	sendWithEffect: { gate: "sendWithEffect" },
	renameGroup: {
		gate: "renameGroup",
		groupOnly: true
	},
	setGroupIcon: {
		gate: "setGroupIcon",
		groupOnly: true
	},
	addParticipant: {
		gate: "addParticipant",
		groupOnly: true
	},
	removeParticipant: {
		gate: "removeParticipant",
		groupOnly: true
	},
	leaveGroup: {
		gate: "leaveGroup",
		groupOnly: true
	},
	sendAttachment: { gate: "sendAttachment" }
};
const BLUEBUBBLES_ACTION_SPECS = BLUEBUBBLES_ACTIONS;
const BLUEBUBBLES_ACTION_NAMES = Object.keys(BLUEBUBBLES_ACTIONS);
new Set(BLUEBUBBLES_ACTION_NAMES.filter((action) => BLUEBUBBLES_ACTION_SPECS[action]?.groupOnly));
//#endregion
//#region src/plugin-sdk/bluebubbles.ts
function loadBlueBubblesFacadeModule() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "bluebubbles",
		artifactBasename: "api.js"
	});
}
function createBlueBubblesConversationBindingManager(params) {
	return loadBlueBubblesFacadeModule().createBlueBubblesConversationBindingManager(params);
}
const CHAT_ID_PREFIXES = [
	"chat_id:",
	"chatid:",
	"chat:"
];
const CHAT_GUID_PREFIXES = [
	"chat_guid:",
	"chatguid:",
	"guid:"
];
const CHAT_IDENTIFIER_PREFIXES = [
	"chat_identifier:",
	"chatidentifier:",
	"chatident:"
];
const SERVICE_PREFIXES = [
	{
		prefix: "imessage:",
		service: "imessage"
	},
	{
		prefix: "sms:",
		service: "sms"
	},
	{
		prefix: "auto:",
		service: "auto"
	}
];
const CHAT_IDENTIFIER_UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CHAT_IDENTIFIER_HEX_RE = /^[0-9a-f]{24,64}$/i;
function parseRawChatGuid(value) {
	const trimmed = value.trim();
	if (!trimmed) return null;
	const parts = trimmed.split(";");
	if (parts.length !== 3) return null;
	const service = parts[0]?.trim();
	const separator = parts[1]?.trim();
	const identifier = parts[2]?.trim();
	if (!service || !identifier) return null;
	if (separator !== "+" && separator !== "-") return null;
	return `${service};${separator};${identifier}`;
}
function stripPrefix(value, prefix) {
	return value.slice(prefix.length).trim();
}
function stripBlueBubblesPrefix(value) {
	const trimmed = value.trim();
	if (!trimmed) return "";
	if (!trimmed.toLowerCase().startsWith("bluebubbles:")) return trimmed;
	return trimmed.slice(12).trim();
}
function looksLikeRawChatIdentifier(value) {
	const trimmed = value.trim();
	if (!trimmed) return false;
	if (/^chat\d+$/i.test(trimmed)) return true;
	return CHAT_IDENTIFIER_UUID_RE.test(trimmed) || CHAT_IDENTIFIER_HEX_RE.test(trimmed);
}
function parseGroupTarget(params) {
	if (!params.lower.startsWith("group:")) return null;
	const value = stripPrefix(params.trimmed, "group:");
	const chatId = Number.parseInt(value, 10);
	if (Number.isFinite(chatId)) return {
		kind: "chat_id",
		chatId
	};
	if (value) return {
		kind: "chat_guid",
		chatGuid: value
	};
	throw new Error("group target is required");
}
function parseRawChatIdentifierTarget(trimmed) {
	if (/^chat\d+$/i.test(trimmed)) return {
		kind: "chat_identifier",
		chatIdentifier: trimmed
	};
	if (looksLikeRawChatIdentifier(trimmed)) return {
		kind: "chat_identifier",
		chatIdentifier: trimmed
	};
	return null;
}
function normalizeBlueBubblesHandle(raw) {
	const trimmed = raw.trim();
	if (!trimmed) return "";
	const lowered = trimmed.toLowerCase();
	if (lowered.startsWith("imessage:")) return normalizeBlueBubblesHandle(trimmed.slice(9));
	if (lowered.startsWith("sms:")) return normalizeBlueBubblesHandle(trimmed.slice(4));
	if (lowered.startsWith("auto:")) return normalizeBlueBubblesHandle(trimmed.slice(5));
	if (trimmed.includes("@")) return trimmed.toLowerCase();
	return trimmed.replace(/\s+/g, "");
}
function extractHandleFromChatGuid(chatGuid) {
	const parts = chatGuid.split(";");
	if (parts.length === 3 && parts[1] === "-") {
		const handle = parts[2]?.trim();
		if (handle) return normalizeBlueBubblesHandle(handle);
	}
	return null;
}
function parseBlueBubblesTarget(raw) {
	const trimmed = stripBlueBubblesPrefix(raw);
	if (!trimmed) throw new Error("BlueBubbles target is required");
	const lower = trimmed.toLowerCase();
	const servicePrefixed = resolveServicePrefixedTarget({
		trimmed,
		lower,
		servicePrefixes: SERVICE_PREFIXES,
		isChatTarget: (remainderLower) => CHAT_ID_PREFIXES.some((p) => remainderLower.startsWith(p)) || CHAT_GUID_PREFIXES.some((p) => remainderLower.startsWith(p)) || CHAT_IDENTIFIER_PREFIXES.some((p) => remainderLower.startsWith(p)) || remainderLower.startsWith("group:"),
		parseTarget: parseBlueBubblesTarget
	});
	if (servicePrefixed) return servicePrefixed;
	const chatTarget = parseChatTargetPrefixesOrThrow({
		trimmed,
		lower,
		chatIdPrefixes: CHAT_ID_PREFIXES,
		chatGuidPrefixes: CHAT_GUID_PREFIXES,
		chatIdentifierPrefixes: CHAT_IDENTIFIER_PREFIXES
	});
	if (chatTarget) return chatTarget;
	const groupTarget = parseGroupTarget({
		trimmed,
		lower
	});
	if (groupTarget) return groupTarget;
	const rawChatGuid = parseRawChatGuid(trimmed);
	if (rawChatGuid) return {
		kind: "chat_guid",
		chatGuid: rawChatGuid
	};
	const rawChatIdentifierTarget = parseRawChatIdentifierTarget(trimmed);
	if (rawChatIdentifierTarget) return rawChatIdentifierTarget;
	return {
		kind: "handle",
		to: trimmed,
		service: "auto"
	};
}
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
function resolveBlueBubblesConversationIdFromTarget(target) {
	return normalizeBlueBubblesAcpConversationId(target)?.conversationId;
}
//#endregion
export { BLUEBUBBLES_ACTIONS as a, resolveBlueBubblesConversationIdFromTarget as i, matchBlueBubblesAcpConversation as n, BLUEBUBBLES_ACTION_NAMES as o, normalizeBlueBubblesAcpConversationId as r, createBlueBubblesConversationBindingManager as t };
