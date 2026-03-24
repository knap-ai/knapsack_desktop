import { _ as normalizeAccountId } from "./session-key-DAhnzjyr.js";
import { a as hasConfiguredSecretInput, l as normalizeSecretInputString } from "./types.secrets-DgX397vI.js";
import { dd as resolveServicePrefixedAllowTarget, kb as isAllowedParsedChatSender, ld as parseChatAllowTargetPrefixes, md as resolveServicePrefixedTarget, ud as parseChatTargetPrefixesOrThrow } from "./pi-embedded-CbCYZxIb.js";
import { o as resolveMergedAccountConfig, t as createAccountListHelpers } from "./account-helpers-BzkeDMfB.js";
import { t as normalizeWebhookPath } from "./webhook-path-BYotIM_c.js";
//#region extensions/bluebubbles/src/types.ts
const DEFAULT_TIMEOUT_MS = 1e4;
function normalizeBlueBubblesServerUrl(raw) {
	const trimmed = raw.trim();
	if (!trimmed) throw new Error("BlueBubbles serverUrl is required");
	return (/^https?:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`).replace(/\/+$/, "");
}
function buildBlueBubblesApiUrl(params) {
	const normalized = normalizeBlueBubblesServerUrl(params.baseUrl);
	const url = new URL(params.path, `${normalized}/`);
	if (params.password) url.searchParams.set("password", params.password);
	return url.toString();
}
async function blueBubblesFetchWithTimeout(url, init, timeoutMs = DEFAULT_TIMEOUT_MS) {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeoutMs);
	try {
		return await fetch(url, {
			...init,
			signal: controller.signal
		});
	} finally {
		clearTimeout(timer);
	}
}
//#endregion
//#region extensions/bluebubbles/src/accounts.ts
const { listAccountIds: listBlueBubblesAccountIds, resolveDefaultAccountId: resolveDefaultBlueBubblesAccountId } = createAccountListHelpers("bluebubbles");
function mergeBlueBubblesAccountConfig(cfg, accountId) {
	const merged = resolveMergedAccountConfig({
		channelConfig: cfg.channels?.bluebubbles,
		accounts: cfg.channels?.bluebubbles?.accounts,
		accountId,
		omitKeys: ["defaultAccount"]
	});
	return {
		...merged,
		chunkMode: merged.chunkMode ?? "length"
	};
}
function resolveBlueBubblesAccount(params) {
	const accountId = normalizeAccountId(params.accountId);
	const baseEnabled = params.cfg.channels?.bluebubbles?.enabled;
	const merged = mergeBlueBubblesAccountConfig(params.cfg, accountId);
	const accountEnabled = merged.enabled !== false;
	const serverUrl = normalizeSecretInputString(merged.serverUrl);
	normalizeSecretInputString(merged.password);
	const configured = Boolean(serverUrl && hasConfiguredSecretInput(merged.password));
	const baseUrl = serverUrl ? normalizeBlueBubblesServerUrl(serverUrl) : void 0;
	return {
		accountId,
		enabled: baseEnabled !== false && accountEnabled,
		name: merged.name?.trim() || void 0,
		config: merged,
		configured,
		baseUrl
	};
}
//#endregion
//#region extensions/bluebubbles/src/targets.ts
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
	if (params.requireValue) throw new Error("group target is required");
	return null;
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
/**
* Extracts the handle from a chat_guid if it's a DM (1:1 chat).
* BlueBubbles chat_guid format for DM: "service;-;handle" (e.g., "iMessage;-;+19257864429")
* Group chat format: "service;+;groupId" (has "+" instead of "-")
*/
function extractHandleFromChatGuid(chatGuid) {
	const parts = chatGuid.split(";");
	if (parts.length === 3 && parts[1] === "-") {
		const handle = parts[2]?.trim();
		if (handle) return normalizeBlueBubblesHandle(handle);
	}
	return null;
}
function normalizeBlueBubblesMessagingTarget(raw) {
	let trimmed = raw.trim();
	if (!trimmed) return;
	trimmed = stripBlueBubblesPrefix(trimmed);
	if (!trimmed) return;
	try {
		const parsed = parseBlueBubblesTarget(trimmed);
		if (parsed.kind === "chat_id") return `chat_id:${parsed.chatId}`;
		if (parsed.kind === "chat_guid") {
			const handle = extractHandleFromChatGuid(parsed.chatGuid);
			if (handle) return handle;
			return `chat_guid:${parsed.chatGuid}`;
		}
		if (parsed.kind === "chat_identifier") return `chat_identifier:${parsed.chatIdentifier}`;
		const handle = normalizeBlueBubblesHandle(parsed.to);
		if (!handle) return;
		return parsed.service === "auto" ? handle : `${parsed.service}:${handle}`;
	} catch {
		return trimmed;
	}
}
function looksLikeBlueBubblesTargetId(raw, normalized) {
	const trimmed = raw.trim();
	if (!trimmed) return false;
	const candidate = stripBlueBubblesPrefix(trimmed);
	if (!candidate) return false;
	if (parseRawChatGuid(candidate)) return true;
	const lowered = candidate.toLowerCase();
	if (/^(imessage|sms|auto):/.test(lowered)) return true;
	if (/^(chat_id|chatid|chat|chat_guid|chatguid|guid|chat_identifier|chatidentifier|chatident|group):/.test(lowered)) return true;
	if (/^chat\d+$/i.test(candidate)) return true;
	if (looksLikeRawChatIdentifier(candidate)) return true;
	if (candidate.includes("@")) return true;
	const digitsOnly = candidate.replace(/[\s().-]/g, "");
	if (/^\+?\d{3,}$/.test(digitsOnly)) return true;
	if (normalized) {
		const normalizedTrimmed = normalized.trim();
		if (!normalizedTrimmed) return false;
		const normalizedLower = normalizedTrimmed.toLowerCase();
		if (/^(imessage|sms|auto):/.test(normalizedLower) || /^(chat_id|chat_guid|chat_identifier):/.test(normalizedLower)) return true;
	}
	return false;
}
function looksLikeBlueBubblesExplicitTargetId(raw, normalized) {
	const trimmed = raw.trim();
	if (!trimmed) return false;
	const candidate = stripBlueBubblesPrefix(trimmed);
	if (!candidate) return false;
	const lowered = candidate.toLowerCase();
	if (/^(imessage|sms|auto):/.test(lowered)) return true;
	if (/^(chat_id|chatid|chat|chat_guid|chatguid|guid|chat_identifier|chatidentifier|chatident|group):/.test(lowered)) return true;
	if (parseRawChatGuid(candidate) || looksLikeRawChatIdentifier(candidate)) return true;
	if (normalized) {
		const normalizedTrimmed = normalized.trim();
		if (!normalizedTrimmed) return false;
		const normalizedLower = normalizedTrimmed.toLowerCase();
		if (/^(imessage|sms|auto):/.test(normalizedLower) || /^(chat_id|chat_guid|chat_identifier):/.test(normalizedLower)) return true;
	}
	return false;
}
function inferBlueBubblesTargetChatType(raw) {
	try {
		const parsed = parseBlueBubblesTarget(raw);
		if (parsed.kind === "handle") return "direct";
		if (parsed.kind === "chat_guid") return parsed.chatGuid.includes(";+;") ? "group" : "direct";
		if (parsed.kind === "chat_id" || parsed.kind === "chat_identifier") return "group";
	} catch {
		return;
	}
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
		lower,
		requireValue: true
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
function parseBlueBubblesAllowTarget(raw) {
	const trimmed = raw.trim();
	if (!trimmed) return {
		kind: "handle",
		handle: ""
	};
	const lower = trimmed.toLowerCase();
	const servicePrefixed = resolveServicePrefixedAllowTarget({
		trimmed,
		lower,
		servicePrefixes: SERVICE_PREFIXES,
		parseAllowTarget: parseBlueBubblesAllowTarget
	});
	if (servicePrefixed) return servicePrefixed;
	const chatTarget = parseChatAllowTargetPrefixes({
		trimmed,
		lower,
		chatIdPrefixes: CHAT_ID_PREFIXES,
		chatGuidPrefixes: CHAT_GUID_PREFIXES,
		chatIdentifierPrefixes: CHAT_IDENTIFIER_PREFIXES
	});
	if (chatTarget) return chatTarget;
	const groupTarget = parseGroupTarget({
		trimmed,
		lower,
		requireValue: false
	});
	if (groupTarget) return groupTarget;
	const rawChatIdentifierTarget = parseRawChatIdentifierTarget(trimmed);
	if (rawChatIdentifierTarget) return rawChatIdentifierTarget;
	return {
		kind: "handle",
		handle: normalizeBlueBubblesHandle(trimmed)
	};
}
function isAllowedBlueBubblesSender(params) {
	return isAllowedParsedChatSender({
		allowFrom: params.allowFrom,
		sender: params.sender,
		chatId: params.chatId,
		chatGuid: params.chatGuid,
		chatIdentifier: params.chatIdentifier,
		normalizeSender: normalizeBlueBubblesHandle,
		parseAllowTarget: parseBlueBubblesAllowTarget
	});
}
function formatBlueBubblesChatTarget(params) {
	if (params.chatId && Number.isFinite(params.chatId)) return `chat_id:${params.chatId}`;
	const guid = params.chatGuid?.trim();
	if (guid) return `chat_guid:${guid}`;
	const identifier = params.chatIdentifier?.trim();
	if (identifier) return `chat_identifier:${identifier}`;
	return "";
}
//#endregion
//#region extensions/bluebubbles/src/webhook-shared.ts
const DEFAULT_WEBHOOK_PATH = "/bluebubbles-webhook";
function resolveWebhookPathFromConfig(config) {
	const raw = config?.webhookPath?.trim();
	if (raw) return normalizeWebhookPath(raw);
	return DEFAULT_WEBHOOK_PATH;
}
//#endregion
export { buildBlueBubblesApiUrl as _, inferBlueBubblesTargetChatType as a, looksLikeBlueBubblesTargetId as c, parseBlueBubblesAllowTarget as d, parseBlueBubblesTarget as f, blueBubblesFetchWithTimeout as g, resolveDefaultBlueBubblesAccountId as h, formatBlueBubblesChatTarget as i, normalizeBlueBubblesHandle as l, resolveBlueBubblesAccount as m, resolveWebhookPathFromConfig as n, isAllowedBlueBubblesSender as o, listBlueBubblesAccountIds as p, extractHandleFromChatGuid as r, looksLikeBlueBubblesExplicitTargetId as s, DEFAULT_WEBHOOK_PATH as t, normalizeBlueBubblesMessagingTarget as u, normalizeBlueBubblesServerUrl as v };
