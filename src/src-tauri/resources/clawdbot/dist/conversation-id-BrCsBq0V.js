import { l as normalizeSecretInputString } from "./types.secrets-DTXJhyWe.js";
import "./bluebubbles-DBV3mfXs.js";
import "./secret-input-B35x6hdb.js";
import { _ as buildBlueBubblesApiUrl, f as parseBlueBubblesTarget, g as blueBubblesFetchWithTimeout, l as normalizeBlueBubblesHandle, r as extractHandleFromChatGuid } from "./webhook-shared-Ccc9UQT3.js";
//#region extensions/bluebubbles/src/probe.ts
/** Cache server info by account ID to avoid repeated API calls.
* Size-capped to prevent unbounded growth (#4948). */
const MAX_SERVER_INFO_CACHE_SIZE = 64;
const serverInfoCache = /* @__PURE__ */ new Map();
const CACHE_TTL_MS = 600 * 1e3;
function buildCacheKey(accountId) {
	return accountId?.trim() || "default";
}
/**
* Fetch server info from BlueBubbles API and cache it.
* Returns cached result if available and not expired.
*/
async function fetchBlueBubblesServerInfo(params) {
	const baseUrl = normalizeSecretInputString(params.baseUrl);
	const password = normalizeSecretInputString(params.password);
	if (!baseUrl || !password) return null;
	const cacheKey = buildCacheKey(params.accountId);
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
	const cacheKey = buildCacheKey(accountId);
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
			error: err instanceof Error ? err.message : String(err)
		};
	}
}
//#endregion
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
export { fetchBlueBubblesServerInfo as a, isBlueBubblesPrivateApiStatusEnabled as c, resolveBlueBubblesInboundConversationId as i, isMacOS26OrHigher as l, normalizeBlueBubblesAcpConversationId as n, getCachedBlueBubblesPrivateApiStatus as o, resolveBlueBubblesConversationIdFromTarget as r, isBlueBubblesPrivateApiEnabled as s, matchBlueBubblesAcpConversation as t, probeBlueBubbles as u };
