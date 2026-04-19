import { i as formatErrorMessage } from "./errors-D8p6rxH8.js";
import { i as normalizeLowercaseStringOrEmpty, s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { a as hasConfiguredSecretInput, l as normalizeSecretInputString } from "./types.secrets-CeL3gSMO.js";
import { n as asNullableRecord, o as readStringField } from "./record-coerce-Bls3blVy.js";
import { n as normalizeAccountId } from "./account-id-j7GeQlaZ.js";
import { t as parseFiniteNumber } from "./parse-finite-number-BfJR0a23.js";
import { n as fetchWithSsrFGuard } from "./fetch-guard-B3p4gGaY.js";
import { c as isBlockedHostnameOrIp } from "./ssrf-DoOclwFS.js";
import { a as resolveChannelStreamingChunkMode } from "./channel-streaming-DxZqCxKM.js";
import "./text-runtime-DTMxvodz.js";
import { s as resolveMergedAccountConfig, t as createAccountListHelpers } from "./account-helpers-BWbrvOLB.js";
import "./error-runtime-CgBDklBz.js";
import { r as isAllowedParsedChatSender } from "./allow-from-3zjA49Rt.js";
import { i as resolveServicePrefixedAllowTarget, n as parseChatAllowTargetPrefixes, r as parseChatTargetPrefixesOrThrow, s as resolveServicePrefixedTarget } from "./channel-targets-DhS74GMe.js";
import "./infra-runtime-CTpDySJ1.js";
import "./ssrf-runtime-CmuKDV7X.js";
import "./account-resolution-CMEeTy4m.js";
import "./secret-input-DwXeRlOM.js";
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
let _fetchGuard = fetchWithSsrFGuard;
async function blueBubblesFetchWithTimeout(url, init, timeoutMs = DEFAULT_TIMEOUT_MS, ssrfPolicy) {
	if (ssrfPolicy !== void 0) {
		const { response, release } = await _fetchGuard({
			url,
			init,
			timeoutMs,
			policy: ssrfPolicy,
			auditContext: "bluebubbles-api"
		});
		const isNullBody = response.status === 101 || response.status === 204 || response.status === 205 || response.status === 304;
		try {
			const bodyBytes = isNullBody ? null : await response.arrayBuffer();
			return new Response(bodyBytes, {
				status: response.status,
				headers: response.headers
			});
		} finally {
			await release();
		}
	}
	const { dispatcher: _dispatcher, ...safeInit } = init ?? {};
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeoutMs);
	try {
		return await fetch(url, {
			...safeInit,
			signal: controller.signal
		});
	} finally {
		clearTimeout(timer);
	}
}
//#endregion
//#region extensions/bluebubbles/src/accounts-normalization.ts
function asRecord$1(value) {
	return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}
function normalizeBlueBubblesPrivateNetworkAliases(config) {
	const record = asRecord$1(config);
	if (!record) return config;
	const network = asRecord$1(record.network);
	const canonicalValue = typeof network?.dangerouslyAllowPrivateNetwork === "boolean" ? network.dangerouslyAllowPrivateNetwork : typeof network?.allowPrivateNetwork === "boolean" ? network.allowPrivateNetwork : typeof record.dangerouslyAllowPrivateNetwork === "boolean" ? record.dangerouslyAllowPrivateNetwork : typeof record.allowPrivateNetwork === "boolean" ? record.allowPrivateNetwork : void 0;
	if (canonicalValue === void 0) return config;
	const { allowPrivateNetwork: _legacyFlatAllow, dangerouslyAllowPrivateNetwork: _legacyFlatDanger, ...rest } = record;
	const { allowPrivateNetwork: _legacyNetworkAllow, dangerouslyAllowPrivateNetwork: _legacyNetworkDanger, ...restNetwork } = network ?? {};
	return {
		...rest,
		network: {
			...restNetwork,
			dangerouslyAllowPrivateNetwork: canonicalValue
		}
	};
}
function normalizeBlueBubblesAccountsMap(accounts) {
	if (!accounts) return;
	return Object.fromEntries(Object.entries(accounts).map(([accountKey, accountConfig]) => [accountKey, normalizeBlueBubblesPrivateNetworkAliases(accountConfig)]));
}
function resolveBlueBubblesPrivateNetworkConfigValue$1(config) {
	const record = asRecord$1(config);
	if (!record) return;
	const network = asRecord$1(record.network);
	if (typeof network?.dangerouslyAllowPrivateNetwork === "boolean") return network.dangerouslyAllowPrivateNetwork;
	if (typeof network?.allowPrivateNetwork === "boolean") return network.allowPrivateNetwork;
	if (typeof record.dangerouslyAllowPrivateNetwork === "boolean") return record.dangerouslyAllowPrivateNetwork;
	if (typeof record.allowPrivateNetwork === "boolean") return record.allowPrivateNetwork;
}
function resolveBlueBubblesEffectiveAllowPrivateNetworkFromConfig(params) {
	const configuredValue = resolveBlueBubblesPrivateNetworkConfigValue$1(params.config);
	if (configuredValue !== void 0) return configuredValue;
	if (!params.baseUrl) return false;
	try {
		const hostname = new URL(normalizeBlueBubblesServerUrl(params.baseUrl)).hostname.trim();
		return Boolean(hostname) && isBlockedHostnameOrIp(hostname);
	} catch {
		return false;
	}
}
//#endregion
//#region extensions/bluebubbles/src/accounts.ts
const { listAccountIds: listBlueBubblesAccountIds, resolveDefaultAccountId: resolveDefaultBlueBubblesAccountId } = createAccountListHelpers("bluebubbles");
function mergeBlueBubblesAccountConfig(cfg, accountId) {
	const merged = resolveMergedAccountConfig({
		channelConfig: normalizeBlueBubblesPrivateNetworkAliases(cfg.channels?.bluebubbles),
		accounts: normalizeBlueBubblesAccountsMap(cfg.channels?.bluebubbles?.accounts),
		accountId,
		omitKeys: ["defaultAccount"],
		normalizeAccountId,
		nestedObjectKeys: ["network", "catchup"]
	});
	return {
		...merged,
		chunkMode: resolveChannelStreamingChunkMode(merged) ?? merged.chunkMode ?? "length"
	};
}
function resolveBlueBubblesAccount(params) {
	const accountId = normalizeAccountId(params.accountId ?? resolveDefaultBlueBubblesAccountId(params.cfg));
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
		name: normalizeOptionalString(merged.name),
		config: merged,
		configured,
		baseUrl
	};
}
function resolveBlueBubblesPrivateNetworkConfigValue(config) {
	return resolveBlueBubblesPrivateNetworkConfigValue$1(config);
}
function resolveBlueBubblesEffectiveAllowPrivateNetwork(params) {
	return resolveBlueBubblesEffectiveAllowPrivateNetworkFromConfig(params);
}
//#endregion
//#region extensions/bluebubbles/src/probe.ts
/** Cache server info by account ID to avoid repeated API calls.
* Size-capped to prevent unbounded growth (#4948). */
const MAX_SERVER_INFO_CACHE_SIZE = 64;
const serverInfoCache = /* @__PURE__ */ new Map();
const CACHE_TTL_MS = 600 * 1e3;
/**
* Fetch server info from BlueBubbles API and cache it.
* Returns cached result if available and not expired.
*/
async function fetchBlueBubblesServerInfo(params) {
	const baseUrl = normalizeSecretInputString(params.baseUrl);
	const password = normalizeSecretInputString(params.password);
	if (!baseUrl || !password) return null;
	const cacheKey = normalizeOptionalString(params.accountId) || "default";
	const cached = serverInfoCache.get(cacheKey);
	if (cached && cached.expires > Date.now()) return cached.info;
	const ssrfPolicy = params.allowPrivateNetwork ? { allowPrivateNetwork: true } : {};
	const url = buildBlueBubblesApiUrl({
		baseUrl,
		path: "/api/v1/server/info",
		password
	});
	try {
		const res = await blueBubblesFetchWithTimeout(url, { method: "GET" }, params.timeoutMs ?? 5e3, ssrfPolicy);
		if (!res.ok) return null;
		const data = (await res.json().catch(() => null))?.data;
		if (data) {
			serverInfoCache.set(cacheKey, {
				info: data,
				expires: Date.now() + CACHE_TTL_MS
			});
			if (serverInfoCache.size > MAX_SERVER_INFO_CACHE_SIZE) {
				const oldest = serverInfoCache.keys().next().value;
				if (oldest !== void 0) serverInfoCache.delete(oldest);
			}
		}
		return data ?? null;
	} catch {
		return null;
	}
}
/**
* Get cached server info synchronously (for use in describeMessageTool).
* Returns null if not cached or expired.
*/
function getCachedBlueBubblesServerInfo(accountId) {
	const cacheKey = normalizeOptionalString(accountId) || "default";
	const cached = serverInfoCache.get(cacheKey);
	if (cached && cached.expires > Date.now()) return cached.info;
	return null;
}
/**
* Read cached private API capability for a BlueBubbles account.
* Returns null when capability is unknown (for example, before first probe).
*/
function getCachedBlueBubblesPrivateApiStatus(accountId) {
	const info = getCachedBlueBubblesServerInfo(accountId);
	if (!info || typeof info.private_api !== "boolean") return null;
	return info.private_api;
}
function isBlueBubblesPrivateApiStatusEnabled(status) {
	return status === true;
}
function isBlueBubblesPrivateApiEnabled(accountId) {
	return isBlueBubblesPrivateApiStatusEnabled(getCachedBlueBubblesPrivateApiStatus(accountId));
}
/**
* Parse macOS version string (e.g., "15.0.1" or "26.0") into major version number.
*/
function parseMacOSMajorVersion(version) {
	if (!version) return null;
	const match = /^(\d+)/.exec(version.trim());
	return match ? Number.parseInt(match[1], 10) : null;
}
/**
* Check if the cached server info indicates macOS 26 or higher.
* Returns false if no cached info is available (fail open for action listing).
*/
function isMacOS26OrHigher(accountId) {
	const info = getCachedBlueBubblesServerInfo(accountId);
	if (!info?.os_version) return false;
	const major = parseMacOSMajorVersion(info.os_version);
	return major !== null && major >= 26;
}
async function probeBlueBubbles(params) {
	const baseUrl = normalizeSecretInputString(params.baseUrl);
	const password = normalizeSecretInputString(params.password);
	if (!baseUrl) return {
		ok: false,
		error: "serverUrl not configured"
	};
	if (!password) return {
		ok: false,
		error: "password not configured"
	};
	const probeSsrfPolicy = params.allowPrivateNetwork ? { allowPrivateNetwork: true } : {};
	const url = buildBlueBubblesApiUrl({
		baseUrl,
		path: "/api/v1/ping",
		password
	});
	try {
		const res = await blueBubblesFetchWithTimeout(url, { method: "GET" }, params.timeoutMs, probeSsrfPolicy);
		if (!res.ok) return {
			ok: false,
			status: res.status,
			error: `HTTP ${res.status}`
		};
		return {
			ok: true,
			status: res.status
		};
	} catch (err) {
		return {
			ok: false,
			status: null,
			error: formatErrorMessage(err)
		};
	}
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
	const trimmed = normalizeOptionalString(value);
	if (!trimmed) return null;
	const parts = trimmed.split(";");
	if (parts.length !== 3) return null;
	const service = normalizeOptionalString(parts[0]);
	const separator = normalizeOptionalString(parts[1]);
	const identifier = normalizeOptionalString(parts[2]);
	if (!service || !identifier) return null;
	if (separator !== "+" && separator !== "-") return null;
	return `${service};${separator};${identifier}`;
}
function stripPrefix(value, prefix) {
	return value.slice(prefix.length).trim();
}
function stripBlueBubblesPrefix(value) {
	const trimmed = normalizeOptionalString(value) ?? "";
	if (!trimmed) return "";
	if (!normalizeLowercaseStringOrEmpty(trimmed).startsWith("bluebubbles:")) return trimmed;
	return trimmed.slice(12).trim();
}
function looksLikeRawChatIdentifier(value) {
	const trimmed = normalizeOptionalString(value);
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
	const lowered = normalizeLowercaseStringOrEmpty(trimmed);
	if (lowered.startsWith("imessage:")) return normalizeBlueBubblesHandle(trimmed.slice(9));
	if (lowered.startsWith("sms:")) return normalizeBlueBubblesHandle(trimmed.slice(4));
	if (lowered.startsWith("auto:")) return normalizeBlueBubblesHandle(trimmed.slice(5));
	if (trimmed.includes("@")) return normalizeLowercaseStringOrEmpty(trimmed);
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
		const handle = normalizeOptionalString(parts[2]);
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
	const lowered = normalizeLowercaseStringOrEmpty(candidate);
	if (/^(imessage|sms|auto):/.test(lowered)) return true;
	if (/^(chat_id|chatid|chat|chat_guid|chatguid|guid|chat_identifier|chatidentifier|chatident|group):/.test(lowered)) return true;
	if (/^chat\d+$/i.test(candidate)) return true;
	if (looksLikeRawChatIdentifier(candidate)) return true;
	if (candidate.includes("@")) return true;
	const digitsOnly = candidate.replace(/[\s().-]/g, "");
	if (/^\+?\d{3,}$/.test(digitsOnly)) return true;
	if (normalized) {
		const normalizedTrimmed = normalizeOptionalString(normalized);
		if (!normalizedTrimmed) return false;
		const normalizedLower = normalizeLowercaseStringOrEmpty(normalizedTrimmed);
		if (/^(imessage|sms|auto):/.test(normalizedLower) || /^(chat_id|chat_guid|chat_identifier):/.test(normalizedLower)) return true;
	}
	return false;
}
function looksLikeBlueBubblesExplicitTargetId(raw, normalized) {
	const trimmed = raw.trim();
	if (!trimmed) return false;
	const candidate = stripBlueBubblesPrefix(trimmed);
	if (!candidate) return false;
	const lowered = normalizeLowercaseStringOrEmpty(candidate);
	if (/^(imessage|sms|auto):/.test(lowered)) return true;
	if (/^(chat_id|chatid|chat|chat_guid|chatguid|guid|chat_identifier|chatidentifier|chatident|group):/.test(lowered)) return true;
	if (parseRawChatGuid(candidate) || looksLikeRawChatIdentifier(candidate)) return true;
	if (normalized) {
		const normalizedTrimmed = normalized.trim();
		if (!normalizedTrimmed) return false;
		const normalizedLower = normalizeLowercaseStringOrEmpty(normalizedTrimmed);
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
	const lower = normalizeLowercaseStringOrEmpty(trimmed);
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
	const trimmed = normalizeOptionalString(raw) ?? "";
	if (!trimmed) return {
		kind: "handle",
		handle: ""
	};
	const lower = normalizeLowercaseStringOrEmpty(trimmed);
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
	const guid = normalizeOptionalString(params.chatGuid);
	if (guid) return `chat_guid:${guid}`;
	const identifier = normalizeOptionalString(params.chatIdentifier);
	if (identifier) return `chat_identifier:${identifier}`;
	return "";
}
//#endregion
//#region extensions/bluebubbles/src/monitor-normalize.ts
const asRecord = asNullableRecord;
const readString = readStringField;
function readNumber(record, key) {
	if (!record) return;
	const value = record[key];
	return typeof value === "number" && Number.isFinite(value) ? value : void 0;
}
function readBoolean(record, key) {
	if (!record) return;
	const value = record[key];
	return typeof value === "boolean" ? value : void 0;
}
function readNumberLike(record, key) {
	if (!record) return;
	return parseFiniteNumber(record[key]);
}
function extractAttachments(message) {
	const raw = message["attachments"];
	if (!Array.isArray(raw)) return [];
	const out = [];
	for (const entry of raw) {
		const record = asRecord(entry);
		if (!record) continue;
		out.push({
			guid: readString(record, "guid"),
			uti: readString(record, "uti"),
			mimeType: readString(record, "mimeType") ?? readString(record, "mime_type"),
			transferName: readString(record, "transferName") ?? readString(record, "transfer_name"),
			totalBytes: readNumberLike(record, "totalBytes") ?? readNumberLike(record, "total_bytes"),
			height: readNumberLike(record, "height"),
			width: readNumberLike(record, "width"),
			originalROWID: readNumberLike(record, "originalROWID") ?? readNumberLike(record, "rowid")
		});
	}
	return out;
}
function buildAttachmentPlaceholder(attachments) {
	if (attachments.length === 0) return "";
	const mimeTypes = attachments.map((entry) => entry.mimeType ?? "");
	const allImages = mimeTypes.every((entry) => entry.startsWith("image/"));
	const allVideos = mimeTypes.every((entry) => entry.startsWith("video/"));
	const allAudio = mimeTypes.every((entry) => entry.startsWith("audio/"));
	const tag = allImages ? "<media:image>" : allVideos ? "<media:video>" : allAudio ? "<media:audio>" : "<media:attachment>";
	const label = allImages ? "image" : allVideos ? "video" : allAudio ? "audio" : "file";
	const suffix = attachments.length === 1 ? label : `${label}s`;
	return `${tag} (${attachments.length} ${suffix})`;
}
function buildMessagePlaceholder(message) {
	const attachmentPlaceholder = buildAttachmentPlaceholder(message.attachments ?? []);
	if (attachmentPlaceholder) return attachmentPlaceholder;
	if (message.balloonBundleId) return "<media:sticker>";
	return "";
}
function formatReplyTag(message) {
	const rawId = message.replyToShortId || message.replyToId;
	if (!rawId) return null;
	return `[[reply_to:${rawId}]]`;
}
function extractReplyMetadata(message) {
	const replyRecord = asRecord(message["replyTo"] ?? message["reply_to"] ?? message["replyToMessage"] ?? message["reply_to_message"] ?? message["repliedMessage"] ?? message["quotedMessage"] ?? message["associatedMessage"] ?? message["reply"]);
	const replyHandle = asRecord(replyRecord?.["handle"]) ?? asRecord(replyRecord?.["sender"]) ?? null;
	const replySenderRaw = readString(replyHandle, "address") ?? readString(replyHandle, "handle") ?? readString(replyHandle, "id") ?? readString(replyRecord, "senderId") ?? readString(replyRecord, "sender") ?? readString(replyRecord, "from");
	const normalizedSender = replySenderRaw ? normalizeBlueBubblesHandle(replySenderRaw) || replySenderRaw.trim() : void 0;
	const replyToBody = readString(replyRecord, "text") ?? readString(replyRecord, "body") ?? readString(replyRecord, "message") ?? readString(replyRecord, "subject") ?? void 0;
	const directReplyId = readString(message, "replyToMessageGuid") ?? readString(message, "replyToGuid") ?? readString(message, "replyGuid") ?? readString(message, "selectedMessageGuid") ?? readString(message, "selectedMessageId") ?? readString(message, "replyToMessageId") ?? readString(message, "replyId") ?? readString(replyRecord, "guid") ?? readString(replyRecord, "id") ?? readString(replyRecord, "messageId");
	const associatedType = readNumberLike(message, "associatedMessageType") ?? readNumberLike(message, "associated_message_type");
	const associatedGuid = readString(message, "associatedMessageGuid") ?? readString(message, "associated_message_guid") ?? readString(message, "associatedMessageId");
	const isReactionAssociation = typeof associatedType === "number" && REACTION_TYPE_MAP.has(associatedType);
	const replyToId = directReplyId ?? (!isReactionAssociation ? associatedGuid : void 0);
	const threadOriginatorGuid = readString(message, "threadOriginatorGuid");
	const messageGuid = readString(message, "guid");
	return {
		replyToId: normalizeOptionalString(replyToId ?? (!replyToId && threadOriginatorGuid && threadOriginatorGuid !== messageGuid ? threadOriginatorGuid : void 0)),
		replyToBody: normalizeOptionalString(replyToBody),
		replyToSender: normalizedSender || void 0
	};
}
function readFirstChatRecord(message) {
	const chats = message["chats"];
	if (!Array.isArray(chats) || chats.length === 0) return null;
	const first = chats[0];
	return asRecord(first);
}
function readParticipantEntries(record) {
	if (!record) return;
	const participants = record["participants"];
	if (Array.isArray(participants)) return participants;
	const handles = record["handles"];
	if (Array.isArray(handles)) return handles;
	const participantHandles = record["participantHandles"];
	if (Array.isArray(participantHandles)) return participantHandles;
}
function extractSenderInfo(message) {
	const handleValue = message.handle ?? message.sender;
	const handle = asRecord(handleValue) ?? (typeof handleValue === "string" ? { address: handleValue } : null);
	const senderId = (readString(handle, "address") ?? readString(handle, "handle") ?? readString(handle, "id") ?? readString(message, "senderId") ?? readString(message, "sender") ?? readString(message, "from") ?? "").trim();
	const senderName = readString(handle, "displayName") ?? readString(handle, "name") ?? readString(message, "senderName") ?? void 0;
	return {
		senderId,
		senderIdExplicit: Boolean(senderId),
		senderName
	};
}
function extractChatContext(message) {
	const chat = asRecord(message.chat) ?? asRecord(message.conversation) ?? null;
	const chatFromList = readFirstChatRecord(message);
	const chatGuid = readString(message, "chatGuid") ?? readString(message, "chat_guid") ?? readString(chat, "chatGuid") ?? readString(chat, "chat_guid") ?? readString(chat, "guid") ?? readString(chatFromList, "chatGuid") ?? readString(chatFromList, "chat_guid") ?? readString(chatFromList, "guid");
	const chatIdentifier = readString(message, "chatIdentifier") ?? readString(message, "chat_identifier") ?? readString(chat, "chatIdentifier") ?? readString(chat, "chat_identifier") ?? readString(chat, "identifier") ?? readString(chatFromList, "chatIdentifier") ?? readString(chatFromList, "chat_identifier") ?? readString(chatFromList, "identifier") ?? extractChatIdentifierFromChatGuid(chatGuid);
	const chatId = readNumberLike(message, "chatId") ?? readNumberLike(message, "chat_id") ?? readNumberLike(chat, "chatId") ?? readNumberLike(chat, "chat_id") ?? readNumberLike(chat, "id") ?? readNumberLike(chatFromList, "chatId") ?? readNumberLike(chatFromList, "chat_id") ?? readNumberLike(chatFromList, "id");
	const chatName = readString(message, "chatName") ?? readString(chat, "displayName") ?? readString(chat, "name") ?? readString(chatFromList, "displayName") ?? readString(chatFromList, "name") ?? void 0;
	const participants = readParticipantEntries(chat) ?? readParticipantEntries(message) ?? readParticipantEntries(chatFromList) ?? [];
	const participantsCount = participants.length;
	const groupFromChatGuid = resolveGroupFlagFromChatGuid(chatGuid);
	const explicitIsGroup = readBoolean(message, "isGroup") ?? readBoolean(message, "is_group") ?? readBoolean(chat, "isGroup") ?? readBoolean(message, "group");
	return {
		chatGuid,
		chatIdentifier,
		chatId,
		chatName,
		isGroup: typeof groupFromChatGuid === "boolean" ? groupFromChatGuid : explicitIsGroup ?? participantsCount > 2,
		participants
	};
}
function normalizeParticipantEntry(entry) {
	if (typeof entry === "string" || typeof entry === "number") {
		const raw = String(entry).trim();
		if (!raw) return null;
		const normalized = normalizeBlueBubblesHandle(raw) || raw;
		return normalized ? { id: normalized } : null;
	}
	const record = asRecord(entry);
	if (!record) return null;
	const nestedHandle = asRecord(record["handle"]) ?? asRecord(record["sender"]) ?? asRecord(record["contact"]) ?? null;
	const idRaw = readString(record, "address") ?? readString(record, "handle") ?? readString(record, "id") ?? readString(record, "phoneNumber") ?? readString(record, "phone_number") ?? readString(record, "email") ?? readString(nestedHandle, "address") ?? readString(nestedHandle, "handle") ?? readString(nestedHandle, "id");
	const nameRaw = readString(record, "displayName") ?? readString(record, "name") ?? readString(record, "title") ?? readString(nestedHandle, "displayName") ?? readString(nestedHandle, "name");
	const normalizedId = idRaw ? normalizeBlueBubblesHandle(idRaw) || idRaw.trim() : "";
	if (!normalizedId) return null;
	return {
		id: normalizedId,
		name: normalizeOptionalString(nameRaw)
	};
}
function normalizeParticipantList(raw) {
	const entries = Array.isArray(raw) ? raw : readParticipantEntries(asRecord(raw)) ?? [];
	if (entries.length === 0) return [];
	const seen = /* @__PURE__ */ new Set();
	const output = [];
	for (const entry of entries) {
		const normalized = normalizeParticipantEntry(entry);
		if (!normalized?.id) continue;
		const key = normalizeLowercaseStringOrEmpty(normalized.id);
		if (seen.has(key)) continue;
		seen.add(key);
		output.push(normalized);
	}
	return output;
}
function formatGroupMembers(params) {
	const seen = /* @__PURE__ */ new Set();
	const ordered = [];
	for (const entry of params.participants ?? []) {
		if (!entry?.id) continue;
		const key = normalizeLowercaseStringOrEmpty(entry.id);
		if (seen.has(key)) continue;
		seen.add(key);
		ordered.push(entry);
	}
	if (ordered.length === 0 && params.fallback?.id) ordered.push(params.fallback);
	if (ordered.length === 0) return;
	return ordered.map((entry) => entry.name ? `${entry.name} (${entry.id})` : entry.id).join(", ");
}
function resolveGroupFlagFromChatGuid(chatGuid) {
	const guid = chatGuid?.trim();
	if (!guid) return;
	const parts = guid.split(";");
	if (parts.length >= 3) {
		if (parts[1] === "+") return true;
		if (parts[1] === "-") return false;
	}
	if (guid.includes(";+;")) return true;
	if (guid.includes(";-;")) return false;
}
function extractChatIdentifierFromChatGuid(chatGuid) {
	const guid = chatGuid?.trim();
	if (!guid) return;
	const parts = guid.split(";");
	if (parts.length < 3) return;
	return parts[2]?.trim() || void 0;
}
function formatGroupAllowlistEntry(params) {
	const guid = params.chatGuid?.trim();
	if (guid) return `chat_guid:${guid}`;
	const chatId = params.chatId;
	if (typeof chatId === "number" && Number.isFinite(chatId)) return `chat_id:${chatId}`;
	const identifier = params.chatIdentifier?.trim();
	if (identifier) return `chat_identifier:${identifier}`;
	return null;
}
const REACTION_TYPE_MAP = new Map([
	[2e3, {
		emoji: "❤️",
		action: "added"
	}],
	[2001, {
		emoji: "👍",
		action: "added"
	}],
	[2002, {
		emoji: "👎",
		action: "added"
	}],
	[2003, {
		emoji: "😂",
		action: "added"
	}],
	[2004, {
		emoji: "‼️",
		action: "added"
	}],
	[2005, {
		emoji: "❓",
		action: "added"
	}],
	[3e3, {
		emoji: "❤️",
		action: "removed"
	}],
	[3001, {
		emoji: "👍",
		action: "removed"
	}],
	[3002, {
		emoji: "👎",
		action: "removed"
	}],
	[3003, {
		emoji: "😂",
		action: "removed"
	}],
	[3004, {
		emoji: "‼️",
		action: "removed"
	}],
	[3005, {
		emoji: "❓",
		action: "removed"
	}]
]);
const TAPBACK_TEXT_MAP = new Map([
	["loved", {
		emoji: "❤️",
		action: "added"
	}],
	["liked", {
		emoji: "👍",
		action: "added"
	}],
	["disliked", {
		emoji: "👎",
		action: "added"
	}],
	["laughed at", {
		emoji: "😂",
		action: "added"
	}],
	["emphasized", {
		emoji: "‼️",
		action: "added"
	}],
	["questioned", {
		emoji: "❓",
		action: "added"
	}],
	["removed a heart from", {
		emoji: "❤️",
		action: "removed"
	}],
	["removed a like from", {
		emoji: "👍",
		action: "removed"
	}],
	["removed a dislike from", {
		emoji: "👎",
		action: "removed"
	}],
	["removed a laugh from", {
		emoji: "😂",
		action: "removed"
	}],
	["removed an emphasis from", {
		emoji: "‼️",
		action: "removed"
	}],
	["removed a question from", {
		emoji: "❓",
		action: "removed"
	}]
]);
const TAPBACK_EMOJI_REGEX = /(?:\p{Regional_Indicator}{2})|(?:[0-9#*]\uFE0F?\u20E3)|(?:\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?(?:\p{Emoji_Modifier})?(?:\u200D\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?(?:\p{Emoji_Modifier})?)*)/u;
function extractFirstEmoji(text) {
	const match = text.match(TAPBACK_EMOJI_REGEX);
	return match ? match[0] : null;
}
function extractQuotedTapbackText(text) {
	const match = text.match(/[“"]([^”"]+)[”"]/s);
	return match ? match[1] : null;
}
function isTapbackAssociatedType(type) {
	return typeof type === "number" && Number.isFinite(type) && type >= 2e3 && type < 4e3;
}
function resolveTapbackActionHint(type) {
	if (typeof type !== "number" || !Number.isFinite(type)) return;
	if (type >= 3e3 && type < 4e3) return "removed";
	if (type >= 2e3 && type < 3e3) return "added";
}
function resolveTapbackContext(message) {
	const associatedType = message.associatedMessageType;
	const hasTapbackType = isTapbackAssociatedType(associatedType);
	const hasTapbackMarker = Boolean(message.associatedMessageEmoji) || Boolean(message.isTapback);
	if (!hasTapbackType && !hasTapbackMarker) return null;
	const replyToId = normalizeOptionalString(message.associatedMessageGuid) ?? normalizeOptionalString(message.replyToId);
	const actionHint = resolveTapbackActionHint(associatedType);
	return {
		emojiHint: message.associatedMessageEmoji?.trim() || REACTION_TYPE_MAP.get(associatedType ?? -1)?.emoji,
		actionHint,
		replyToId
	};
}
function parseTapbackText(params) {
	const trimmed = params.text.trim();
	const lower = normalizeLowercaseStringOrEmpty(trimmed);
	if (!trimmed) return null;
	const parseLeadingReactionAction = (prefix, defaultAction) => {
		if (!lower.startsWith(prefix)) return null;
		const emoji = extractFirstEmoji(trimmed) ?? params.emojiHint;
		if (!emoji) return null;
		const quotedText = extractQuotedTapbackText(trimmed);
		if (params.requireQuoted && !quotedText) return null;
		const fallback = trimmed.slice(prefix.length).trim();
		return {
			emoji,
			action: params.actionHint ?? defaultAction,
			quotedText: quotedText ?? fallback
		};
	};
	for (const [pattern, { emoji, action }] of TAPBACK_TEXT_MAP) if (lower.startsWith(pattern)) {
		const afterPattern = trimmed.slice(pattern.length).trim();
		if (params.requireQuoted) {
			const strictMatch = afterPattern.match(/^[“"](.+)[”"]$/s);
			if (!strictMatch) return null;
			return {
				emoji,
				action,
				quotedText: strictMatch[1]
			};
		}
		return {
			emoji,
			action,
			quotedText: extractQuotedTapbackText(afterPattern) ?? extractQuotedTapbackText(trimmed) ?? afterPattern
		};
	}
	const reacted = parseLeadingReactionAction("reacted", "added");
	if (reacted) return reacted;
	const removed = parseLeadingReactionAction("removed", "removed");
	if (removed) return removed;
	return null;
}
function extractMessagePayload(payload) {
	const parseRecord = (value) => {
		const record = asRecord(value);
		if (record) return record;
		if (Array.isArray(value)) {
			for (const entry of value) {
				const parsedEntry = parseRecord(entry);
				if (parsedEntry) return parsedEntry;
			}
			return null;
		}
		if (typeof value !== "string") return null;
		const trimmed = value.trim();
		if (!trimmed) return null;
		try {
			return parseRecord(JSON.parse(trimmed));
		} catch {
			return null;
		}
	};
	const data = parseRecord(payload.data ?? payload.payload ?? payload.event);
	const message = parseRecord(payload.message ?? data?.message ?? data);
	if (message) return message;
	return null;
}
function normalizeWebhookMessage(payload, options) {
	const message = extractMessagePayload(payload);
	if (!message) return null;
	const text = readString(message, "text") ?? readString(message, "body") ?? readString(message, "subject") ?? "";
	const { senderId, senderIdExplicit, senderName } = extractSenderInfo(message);
	const { chatGuid, chatIdentifier, chatId, chatName, isGroup, participants } = extractChatContext(message);
	const normalizedParticipants = normalizeParticipantList(participants);
	const fromMe = readBoolean(message, "isFromMe") ?? readBoolean(message, "is_from_me");
	const messageId = readString(message, "guid") ?? readString(message, "id") ?? readString(message, "messageId") ?? void 0;
	const balloonBundleId = readString(message, "balloonBundleId");
	const associatedMessageGuid = readString(message, "associatedMessageGuid") ?? readString(message, "associated_message_guid") ?? readString(message, "associatedMessageId") ?? void 0;
	const associatedMessageType = readNumberLike(message, "associatedMessageType") ?? readNumberLike(message, "associated_message_type");
	const associatedMessageEmoji = readString(message, "associatedMessageEmoji") ?? readString(message, "associated_message_emoji") ?? readString(message, "reactionEmoji") ?? readString(message, "reaction_emoji") ?? void 0;
	const isTapback = readBoolean(message, "isTapback") ?? readBoolean(message, "is_tapback") ?? readBoolean(message, "tapback") ?? void 0;
	const timestampRaw = readNumber(message, "date") ?? readNumber(message, "dateCreated") ?? readNumber(message, "timestamp");
	const timestamp = typeof timestampRaw === "number" ? timestampRaw > 0xe8d4a51000 ? timestampRaw : timestampRaw * 1e3 : void 0;
	const senderFallbackFromChatGuid = !senderIdExplicit && !isGroup && chatGuid ? extractHandleFromChatGuid(chatGuid) : null;
	const normalizedSender = normalizeBlueBubblesHandle(senderId || senderFallbackFromChatGuid || "");
	if (!normalizedSender) return null;
	const replyMetadata = extractReplyMetadata(message);
	return {
		text,
		senderId: normalizedSender,
		senderIdExplicit,
		senderName,
		messageId,
		timestamp,
		isGroup,
		chatId,
		chatGuid,
		chatIdentifier,
		chatName,
		fromMe,
		attachments: extractAttachments(message),
		balloonBundleId,
		associatedMessageGuid,
		associatedMessageType,
		associatedMessageEmoji,
		isTapback,
		participants: normalizedParticipants,
		replyToId: replyMetadata.replyToId,
		replyToBody: replyMetadata.replyToBody,
		replyToSender: replyMetadata.replyToSender,
		eventType: options?.eventType
	};
}
function normalizeWebhookReaction(payload) {
	const message = extractMessagePayload(payload);
	if (!message) return null;
	const associatedGuid = readString(message, "associatedMessageGuid") ?? readString(message, "associated_message_guid") ?? readString(message, "associatedMessageId");
	const associatedType = readNumberLike(message, "associatedMessageType") ?? readNumberLike(message, "associated_message_type");
	if (!associatedGuid || associatedType === void 0) return null;
	const mapping = REACTION_TYPE_MAP.get(associatedType);
	const emoji = ((readString(message, "associatedMessageEmoji") ?? readString(message, "associated_message_emoji") ?? readString(message, "reactionEmoji") ?? readString(message, "reaction_emoji"))?.trim() || mapping?.emoji) ?? `reaction:${associatedType}`;
	const action = mapping?.action ?? resolveTapbackActionHint(associatedType) ?? "added";
	const { senderId, senderIdExplicit, senderName } = extractSenderInfo(message);
	const { chatGuid, chatIdentifier, chatId, chatName, isGroup } = extractChatContext(message);
	const fromMe = readBoolean(message, "isFromMe") ?? readBoolean(message, "is_from_me");
	const timestampRaw = readNumberLike(message, "date") ?? readNumberLike(message, "dateCreated") ?? readNumberLike(message, "timestamp");
	const timestamp = typeof timestampRaw === "number" ? timestampRaw > 0xe8d4a51000 ? timestampRaw : timestampRaw * 1e3 : void 0;
	const senderFallbackFromChatGuid = !senderIdExplicit && !isGroup && chatGuid ? extractHandleFromChatGuid(chatGuid) : null;
	const normalizedSender = normalizeBlueBubblesHandle(senderId || senderFallbackFromChatGuid || "");
	if (!normalizedSender) return null;
	return {
		action,
		emoji,
		senderId: normalizedSender,
		senderIdExplicit,
		senderName,
		messageId: associatedGuid,
		timestamp,
		isGroup,
		chatId,
		chatGuid,
		chatIdentifier,
		chatName,
		fromMe
	};
}
//#endregion
export { resolveBlueBubblesAccount as A, fetchBlueBubblesServerInfo as C, isMacOS26OrHigher as D, isBlueBubblesPrivateApiStatusEnabled as E, buildBlueBubblesApiUrl as F, normalizeBlueBubblesServerUrl as I, resolveBlueBubblesPrivateNetworkConfigValue as M, resolveDefaultBlueBubblesAccountId as N, probeBlueBubbles as O, blueBubblesFetchWithTimeout as P, parseBlueBubblesTarget as S, isBlueBubblesPrivateApiEnabled as T, looksLikeBlueBubblesExplicitTargetId as _, formatGroupMembers as a, normalizeBlueBubblesMessagingTarget as b, normalizeWebhookMessage as c, resolveGroupFlagFromChatGuid as d, resolveTapbackContext as f, isAllowedBlueBubblesSender as g, inferBlueBubblesTargetChatType as h, formatGroupAllowlistEntry as i, resolveBlueBubblesEffectiveAllowPrivateNetwork as j, listBlueBubblesAccountIds as k, normalizeWebhookReaction as l, formatBlueBubblesChatTarget as m, buildMessagePlaceholder as n, formatReplyTag as o, extractHandleFromChatGuid as p, extractAttachments as r, normalizeParticipantList as s, asRecord as t, parseTapbackText as u, looksLikeBlueBubblesTargetId as v, getCachedBlueBubblesPrivateApiStatus as w, parseBlueBubblesAllowTarget as x, normalizeBlueBubblesHandle as y };
