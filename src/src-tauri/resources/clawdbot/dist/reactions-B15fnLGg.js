import { i as formatErrorMessage } from "./errors-D8p6rxH8.js";
import { i as normalizeLowercaseStringOrEmpty, o as normalizeOptionalLowercaseString, s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { c as normalizeResolvedSecretInputString } from "./types.secrets-CeL3gSMO.js";
import { c as isBlockedHostnameOrIp } from "./ssrf-DoOclwFS.js";
import { r as stripMarkdown } from "./text-runtime-DTMxvodz.js";
import "./error-runtime-CgBDklBz.js";
import { t as resolveRequestUrl } from "./request-url-DqjdVIkC.js";
import "./ssrf-runtime-CmuKDV7X.js";
import { A as resolveBlueBubblesAccount, C as fetchBlueBubblesServerInfo, E as isBlueBubblesPrivateApiStatusEnabled, F as buildBlueBubblesApiUrl, M as resolveBlueBubblesPrivateNetworkConfigValue, P as blueBubblesFetchWithTimeout, S as parseBlueBubblesTarget, j as resolveBlueBubblesEffectiveAllowPrivateNetwork, p as extractHandleFromChatGuid, r as extractAttachments, t as asRecord, w as getCachedBlueBubblesPrivateApiStatus, y as normalizeBlueBubblesHandle } from "./monitor-normalize-DJXrKC82.js";
import "./secret-input-DwXeRlOM.js";
import { r as warnBlueBubbles, t as getBlueBubblesRuntime } from "./runtime-l4s3_WYf.js";
import path from "node:path";
import crypto from "node:crypto";
//#region extensions/bluebubbles/src/account-resolve.ts
function resolveBlueBubblesServerAccount(params) {
	const account = resolveBlueBubblesAccount({
		cfg: params.cfg ?? {},
		accountId: params.accountId
	});
	const baseUrl = normalizeResolvedSecretInputString({
		value: params.serverUrl,
		path: "channels.bluebubbles.serverUrl"
	}) || normalizeResolvedSecretInputString({
		value: account.config.serverUrl,
		path: `channels.bluebubbles.accounts.${account.accountId}.serverUrl`
	});
	const password = normalizeResolvedSecretInputString({
		value: params.password,
		path: "channels.bluebubbles.password"
	}) || normalizeResolvedSecretInputString({
		value: account.config.password,
		path: `channels.bluebubbles.accounts.${account.accountId}.password`
	});
	if (!baseUrl) throw new Error("BlueBubbles serverUrl is required");
	if (!password) throw new Error("BlueBubbles password is required");
	return {
		baseUrl,
		password,
		accountId: account.accountId,
		allowPrivateNetwork: resolveBlueBubblesEffectiveAllowPrivateNetwork({
			baseUrl,
			config: account.config
		}),
		allowPrivateNetworkConfig: resolveBlueBubblesPrivateNetworkConfigValue(account.config)
	};
}
//#endregion
//#region extensions/bluebubbles/src/multipart.ts
function concatUint8Arrays(parts) {
	const totalLength = parts.reduce((acc, part) => acc + part.length, 0);
	const body = new Uint8Array(totalLength);
	let offset = 0;
	for (const part of parts) {
		body.set(part, offset);
		offset += part.length;
	}
	return body;
}
async function postMultipartFormData(params) {
	const body = Buffer.from(concatUint8Arrays(params.parts));
	return await blueBubblesFetchWithTimeout(params.url, {
		method: "POST",
		headers: { "Content-Type": `multipart/form-data; boundary=${params.boundary}` },
		body
	}, params.timeoutMs, params.ssrfPolicy);
}
async function assertMultipartActionOk(response, action) {
	if (response.ok) return;
	const errorText = await response.text().catch(() => "");
	throw new Error(`BlueBubbles ${action} failed (${response.status}): ${errorText || "unknown"}`);
}
//#endregion
//#region extensions/bluebubbles/src/send-helpers.ts
function resolveBlueBubblesSendTarget(raw) {
	const parsed = parseBlueBubblesTarget(raw);
	if (parsed.kind === "handle") return {
		kind: "handle",
		address: normalizeBlueBubblesHandle(parsed.to),
		service: parsed.service
	};
	if (parsed.kind === "chat_id") return {
		kind: "chat_id",
		chatId: parsed.chatId
	};
	if (parsed.kind === "chat_guid") return {
		kind: "chat_guid",
		chatGuid: parsed.chatGuid
	};
	return {
		kind: "chat_identifier",
		chatIdentifier: parsed.chatIdentifier
	};
}
function extractBlueBubblesMessageId(payload) {
	if (!payload || typeof payload !== "object") return "unknown";
	const record = payload;
	const roots = [
		record,
		asRecord(record.data),
		asRecord(record.result),
		asRecord(record.payload),
		asRecord(record.message),
		Array.isArray(record.data) ? asRecord(record.data[0]) : null
	];
	for (const root of roots) {
		if (!root) continue;
		const candidates = [
			root.message_id,
			root.messageId,
			root.messageGuid,
			root.message_guid,
			root.guid,
			root.id,
			root.uuid
		];
		for (const candidate of candidates) {
			if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
			if (typeof candidate === "number" && Number.isFinite(candidate)) return String(candidate);
		}
	}
	return "unknown";
}
//#endregion
//#region extensions/bluebubbles/src/send.ts
function blueBubblesPolicy$2(allowPrivateNetwork) {
	return allowPrivateNetwork ? { allowPrivateNetwork: true } : {};
}
/** Maps short effect names to full Apple effect IDs */
const EFFECT_MAP = {
	slam: "com.apple.MobileSMS.expressivesend.impact",
	loud: "com.apple.MobileSMS.expressivesend.loud",
	gentle: "com.apple.MobileSMS.expressivesend.gentle",
	invisible: "com.apple.MobileSMS.expressivesend.invisibleink",
	"invisible-ink": "com.apple.MobileSMS.expressivesend.invisibleink",
	"invisible ink": "com.apple.MobileSMS.expressivesend.invisibleink",
	invisibleink: "com.apple.MobileSMS.expressivesend.invisibleink",
	echo: "com.apple.messages.effect.CKEchoEffect",
	spotlight: "com.apple.messages.effect.CKSpotlightEffect",
	balloons: "com.apple.messages.effect.CKHappyBirthdayEffect",
	confetti: "com.apple.messages.effect.CKConfettiEffect",
	love: "com.apple.messages.effect.CKHeartEffect",
	heart: "com.apple.messages.effect.CKHeartEffect",
	hearts: "com.apple.messages.effect.CKHeartEffect",
	lasers: "com.apple.messages.effect.CKLasersEffect",
	fireworks: "com.apple.messages.effect.CKFireworksEffect",
	celebration: "com.apple.messages.effect.CKSparklesEffect"
};
function resolveEffectId(raw) {
	const trimmed = normalizeOptionalLowercaseString(raw);
	if (!trimmed) return;
	if (EFFECT_MAP[trimmed]) return EFFECT_MAP[trimmed];
	const normalized = trimmed.replace(/[\s_]+/g, "-");
	if (EFFECT_MAP[normalized]) return EFFECT_MAP[normalized];
	const compact = trimmed.replace(/[\s_-]+/g, "");
	if (EFFECT_MAP[compact]) return EFFECT_MAP[compact];
	return raw;
}
function resolvePrivateApiDecision(params) {
	const { privateApiStatus, wantsReplyThread, wantsEffect } = params;
	const needsPrivateApi = wantsReplyThread || wantsEffect;
	const canUsePrivateApi = needsPrivateApi && isBlueBubblesPrivateApiStatusEnabled(privateApiStatus);
	const throwEffectDisabledError = wantsEffect && privateApiStatus === false;
	if (!needsPrivateApi || privateApiStatus !== null) return {
		canUsePrivateApi,
		throwEffectDisabledError
	};
	return {
		canUsePrivateApi,
		throwEffectDisabledError,
		warningMessage: `Private API status unknown; sending without ${[wantsReplyThread ? "reply threading" : null, wantsEffect ? "message effects" : null].filter(Boolean).join(" + ")}. Run a status probe to restore private-api features.`
	};
}
async function parseBlueBubblesMessageResponse(res) {
	const body = await res.text();
	if (!body) return { messageId: "ok" };
	try {
		return { messageId: extractBlueBubblesMessageId(JSON.parse(body)) };
	} catch {
		return { messageId: "ok" };
	}
}
function extractChatGuid(chat) {
	const candidates = [
		chat.chatGuid,
		chat.guid,
		chat.chat_guid,
		chat.identifier,
		chat.chatIdentifier,
		chat.chat_identifier
	];
	for (const candidate of candidates) {
		const value = normalizeOptionalString(candidate);
		if (value) return value;
	}
	return null;
}
function extractChatId(chat) {
	const candidates = [
		chat.chatId,
		chat.id,
		chat.chat_id
	];
	for (const candidate of candidates) if (typeof candidate === "number" && Number.isFinite(candidate)) return candidate;
	return null;
}
function extractChatIdentifierFromChatGuid(chatGuid) {
	const parts = chatGuid.split(";");
	if (parts.length < 3) return null;
	return normalizeOptionalString(parts[2]) ?? null;
}
function extractParticipantAddresses(chat) {
	const raw = (Array.isArray(chat.participants) ? chat.participants : null) ?? (Array.isArray(chat.handles) ? chat.handles : null) ?? (Array.isArray(chat.participantHandles) ? chat.participantHandles : null);
	if (!raw) return [];
	const out = [];
	for (const entry of raw) {
		if (typeof entry === "string") {
			out.push(entry);
			continue;
		}
		if (entry && typeof entry === "object") {
			const record = entry;
			const candidate = typeof record.address === "string" && record.address || typeof record.handle === "string" && record.handle || typeof record.id === "string" && record.id || typeof record.identifier === "string" && record.identifier;
			if (candidate) out.push(candidate);
		}
	}
	return out;
}
async function queryChats(params) {
	const res = await blueBubblesFetchWithTimeout(buildBlueBubblesApiUrl({
		baseUrl: params.baseUrl,
		path: "/api/v1/chat/query",
		password: params.password
	}), {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			limit: params.limit,
			offset: params.offset,
			with: ["participants"]
		})
	}, params.timeoutMs, blueBubblesPolicy$2(params.allowPrivateNetwork));
	if (!res.ok) return [];
	const payload = await res.json().catch(() => null);
	const data = payload && typeof payload.data !== "undefined" ? payload.data : null;
	return Array.isArray(data) ? data : [];
}
async function resolveChatGuidForTarget(params) {
	if (params.target.kind === "chat_guid") return params.target.chatGuid;
	const normalizedHandle = params.target.kind === "handle" ? normalizeBlueBubblesHandle(params.target.address) : "";
	const targetChatId = params.target.kind === "chat_id" ? params.target.chatId : null;
	const targetChatIdentifier = params.target.kind === "chat_identifier" ? params.target.chatIdentifier : null;
	const limit = 500;
	let participantMatch = null;
	for (let offset = 0; offset < 5e3; offset += limit) {
		const chats = await queryChats({
			baseUrl: params.baseUrl,
			password: params.password,
			timeoutMs: params.timeoutMs,
			offset,
			limit,
			allowPrivateNetwork: params.allowPrivateNetwork
		});
		if (chats.length === 0) break;
		for (const chat of chats) {
			if (targetChatId != null) {
				const chatId = extractChatId(chat);
				if (chatId != null && chatId === targetChatId) return extractChatGuid(chat);
			}
			if (targetChatIdentifier) {
				const guid = extractChatGuid(chat);
				if (guid) {
					if (guid === targetChatIdentifier) return guid;
					const guidIdentifier = extractChatIdentifierFromChatGuid(guid);
					if (guidIdentifier && guidIdentifier === targetChatIdentifier) return guid;
				}
				const identifier = typeof chat.identifier === "string" ? chat.identifier : typeof chat.chatIdentifier === "string" ? chat.chatIdentifier : typeof chat.chat_identifier === "string" ? chat.chat_identifier : "";
				if (identifier && identifier === targetChatIdentifier) return guid ?? extractChatGuid(chat);
			}
			if (normalizedHandle) {
				const guid = extractChatGuid(chat);
				const directHandle = guid ? extractHandleFromChatGuid(guid) : null;
				if (directHandle && directHandle === normalizedHandle) return guid;
				if (!participantMatch && guid) {
					if (guid.includes(";-;")) {
						if (extractParticipantAddresses(chat).map((entry) => normalizeBlueBubblesHandle(entry)).includes(normalizedHandle)) participantMatch = guid;
					}
				}
			}
		}
	}
	return participantMatch;
}
/**
* Creates a new DM chat for the given address and returns the chat GUID.
* Requires Private API to be enabled in BlueBubbles.
*
* If a `message` is provided it is sent as the initial message in the new chat;
* otherwise an empty-string message body is used (BlueBubbles still creates the
* chat but will not deliver a visible bubble).
*/
async function createChatForHandle(params) {
	const url = buildBlueBubblesApiUrl({
		baseUrl: params.baseUrl,
		path: "/api/v1/chat/new",
		password: params.password
	});
	const payload = {
		addresses: [params.address],
		message: params.message ?? "",
		tempGuid: `temp-${crypto.randomUUID()}`
	};
	const res = await blueBubblesFetchWithTimeout(url, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload)
	}, params.timeoutMs, blueBubblesPolicy$2(params.allowPrivateNetwork));
	if (!res.ok) {
		const errorText = await res.text();
		if (res.status === 400 || res.status === 403 || normalizeLowercaseStringOrEmpty(errorText).includes("private api")) throw new Error(`BlueBubbles send failed: Cannot create new chat - Private API must be enabled. Original error: ${errorText || res.status}`);
		throw new Error(`BlueBubbles create chat failed (${res.status}): ${errorText || "unknown"}`);
	}
	const body = await res.text();
	let messageId = "ok";
	let chatGuid = null;
	if (body) try {
		const parsed = JSON.parse(body);
		messageId = extractBlueBubblesMessageId(parsed);
		const data = parsed.data;
		if (data) {
			chatGuid = typeof data.chatGuid === "string" && data.chatGuid || typeof data.guid === "string" && data.guid || null;
			if (!chatGuid) {
				const chats = data.chats ?? data.chat;
				if (Array.isArray(chats) && chats.length > 0) {
					const first = chats[0];
					chatGuid = typeof first?.guid === "string" && first.guid || typeof first?.chatGuid === "string" && first.chatGuid || null;
				} else if (chats && typeof chats === "object" && !Array.isArray(chats)) {
					const chatObj = chats;
					chatGuid = typeof chatObj.guid === "string" && chatObj.guid || typeof chatObj.chatGuid === "string" && chatObj.chatGuid || null;
				}
			}
		}
	} catch {}
	return {
		chatGuid,
		messageId
	};
}
/**
* Creates a new chat (DM) and sends an initial message.
* Requires Private API to be enabled in BlueBubbles.
*/
async function createNewChatWithMessage(params) {
	return { messageId: (await createChatForHandle({
		baseUrl: params.baseUrl,
		password: params.password,
		address: params.address,
		message: params.message,
		timeoutMs: params.timeoutMs,
		allowPrivateNetwork: params.allowPrivateNetwork
	})).messageId };
}
async function sendMessageBlueBubbles(to, text, opts = {}) {
	const trimmedText = text ?? "";
	if (!trimmedText.trim()) throw new Error("BlueBubbles send requires text");
	const strippedText = stripMarkdown(trimmedText);
	if (!strippedText.trim()) throw new Error("BlueBubbles send requires text (message was empty after markdown removal)");
	const { baseUrl, password, accountId, allowPrivateNetwork } = resolveBlueBubblesServerAccount({
		cfg: opts.cfg ?? {},
		accountId: opts.accountId,
		serverUrl: opts.serverUrl,
		password: opts.password
	});
	let privateApiStatus = getCachedBlueBubblesPrivateApiStatus(accountId);
	const target = resolveBlueBubblesSendTarget(to);
	const chatGuid = await resolveChatGuidForTarget({
		baseUrl,
		password,
		timeoutMs: opts.timeoutMs,
		target,
		allowPrivateNetwork
	});
	if (!chatGuid) {
		if (target.kind === "handle") return createNewChatWithMessage({
			baseUrl,
			password,
			address: target.address,
			message: strippedText,
			timeoutMs: opts.timeoutMs,
			allowPrivateNetwork
		});
		throw new Error("BlueBubbles send failed: chatGuid not found for target. Use a chat_guid target or ensure the chat exists.");
	}
	const effectId = resolveEffectId(opts.effectId);
	const wantsReplyThread = normalizeOptionalString(opts.replyToMessageGuid) !== void 0;
	const wantsEffect = Boolean(effectId);
	if (privateApiStatus === null && (wantsReplyThread || wantsEffect)) try {
		await fetchBlueBubblesServerInfo({
			baseUrl,
			password,
			accountId,
			timeoutMs: opts.timeoutMs ?? 5e3,
			allowPrivateNetwork
		});
		privateApiStatus = getCachedBlueBubblesPrivateApiStatus(accountId);
	} catch {}
	const privateApiDecision = resolvePrivateApiDecision({
		privateApiStatus,
		wantsReplyThread,
		wantsEffect
	});
	if (privateApiDecision.throwEffectDisabledError) throw new Error("BlueBubbles send failed: reply/effect requires Private API, but it is disabled on the BlueBubbles server.");
	if (privateApiDecision.warningMessage) warnBlueBubbles(privateApiDecision.warningMessage);
	const payload = {
		chatGuid,
		tempGuid: crypto.randomUUID(),
		message: strippedText
	};
	if (privateApiDecision.canUsePrivateApi) payload.method = "private-api";
	if (wantsReplyThread && privateApiDecision.canUsePrivateApi) {
		payload.selectedMessageGuid = opts.replyToMessageGuid;
		payload.partIndex = typeof opts.replyToPartIndex === "number" ? opts.replyToPartIndex : 0;
	}
	if (effectId && privateApiDecision.canUsePrivateApi) payload.effectId = effectId;
	const res = await blueBubblesFetchWithTimeout(buildBlueBubblesApiUrl({
		baseUrl,
		path: "/api/v1/message/text",
		password
	}), {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload)
	}, opts.timeoutMs, blueBubblesPolicy$2(allowPrivateNetwork));
	if (!res.ok) {
		const errorText = await res.text();
		throw new Error(`BlueBubbles send failed (${res.status}): ${errorText || "unknown"}`);
	}
	return parseBlueBubblesMessageResponse(res);
}
//#endregion
//#region extensions/bluebubbles/src/attachments.ts
function blueBubblesPolicy$1(allowPrivateNetwork) {
	return allowPrivateNetwork ? { allowPrivateNetwork: true } : void 0;
}
const DEFAULT_ATTACHMENT_MAX_BYTES = 8 * 1024 * 1024;
const AUDIO_MIME_MP3 = new Set(["audio/mpeg", "audio/mp3"]);
const AUDIO_MIME_CAF = new Set(["audio/x-caf", "audio/caf"]);
function sanitizeFilename(input, fallback) {
	const trimmed = input?.trim() ?? "";
	return ((trimmed ? path.basename(trimmed) : "") || fallback).replace(/[\r\n"\\]/g, "_");
}
function ensureExtension(filename, extension, fallbackBase) {
	const currentExt = path.extname(filename);
	if (normalizeLowercaseStringOrEmpty(currentExt) === extension) return filename;
	return `${(currentExt ? filename.slice(0, -currentExt.length) : filename) || fallbackBase}${extension}`;
}
function resolveVoiceInfo(filename, contentType) {
	const normalizedType = normalizeOptionalLowercaseString(contentType);
	const extension = normalizeLowercaseStringOrEmpty(path.extname(filename));
	const isMp3 = extension === ".mp3" || (normalizedType ? AUDIO_MIME_MP3.has(normalizedType) : false);
	const isCaf = extension === ".caf" || (normalizedType ? AUDIO_MIME_CAF.has(normalizedType) : false);
	return {
		isAudio: isMp3 || isCaf || Boolean(normalizedType?.startsWith("audio/")),
		isMp3,
		isCaf
	};
}
function resolveAccount$2(params) {
	return resolveBlueBubblesServerAccount(params);
}
function safeExtractHostname(url) {
	try {
		return new URL(url).hostname.trim() || void 0;
	} catch {
		return;
	}
}
function readMediaFetchErrorCode(error) {
	if (!error || typeof error !== "object") return;
	const code = error.code;
	return code === "max_bytes" || code === "http_error" || code === "fetch_failed" ? code : void 0;
}
/**
* Fetch attachment metadata for a message from the BlueBubbles API.
*
* BlueBubbles sometimes fires the `new-message` webhook before attachment
* indexing is complete, so `attachments` arrives as `[]`. This function
* GETs the message by GUID and returns whatever attachments the server
* has indexed by now. (#65430, #67437)
*/
async function fetchBlueBubblesMessageAttachments(messageGuid, opts) {
	const url = buildBlueBubblesApiUrl({
		baseUrl: opts.baseUrl,
		path: `/api/v1/message/${encodeURIComponent(messageGuid)}`,
		password: opts.password
	});
	const policy = opts.allowPrivateNetwork ? { allowPrivateNetwork: true } : void 0;
	const response = await blueBubblesFetchWithTimeout(url, { method: "GET" }, opts.timeoutMs, policy);
	if (!response.ok) return [];
	const data = (await response.json()).data;
	if (!data) return [];
	return extractAttachments(data);
}
async function downloadBlueBubblesAttachment(attachment, opts = {}) {
	const guid = attachment.guid?.trim();
	if (!guid) throw new Error("BlueBubbles attachment guid is required");
	const { baseUrl, password, allowPrivateNetwork, allowPrivateNetworkConfig } = resolveAccount$2(opts);
	const url = buildBlueBubblesApiUrl({
		baseUrl,
		path: `/api/v1/attachment/${encodeURIComponent(guid)}/download`,
		password
	});
	const maxBytes = typeof opts.maxBytes === "number" ? opts.maxBytes : DEFAULT_ATTACHMENT_MAX_BYTES;
	const trustedHostname = safeExtractHostname(baseUrl);
	const trustedHostnameIsPrivate = trustedHostname ? isBlockedHostnameOrIp(trustedHostname) : false;
	try {
		const fetched = await getBlueBubblesRuntime().channel.media.fetchRemoteMedia({
			url,
			filePathHint: attachment.transferName ?? attachment.guid ?? "attachment",
			maxBytes,
			ssrfPolicy: allowPrivateNetwork ? { allowPrivateNetwork: true } : trustedHostname && (allowPrivateNetworkConfig !== false || !trustedHostnameIsPrivate) ? { allowedHostnames: [trustedHostname] } : void 0,
			fetchImpl: async (input, init) => await blueBubblesFetchWithTimeout(resolveRequestUrl(input), {
				...init,
				method: init?.method ?? "GET"
			}, opts.timeoutMs)
		});
		return {
			buffer: new Uint8Array(fetched.buffer),
			contentType: fetched.contentType ?? attachment.mimeType ?? void 0
		};
	} catch (error) {
		if (readMediaFetchErrorCode(error) === "max_bytes") throw new Error(`BlueBubbles attachment too large (limit ${maxBytes} bytes)`, { cause: error });
		const text = formatErrorMessage(error);
		throw new Error(`BlueBubbles attachment download failed: ${text}`, { cause: error });
	}
}
/**
* Send an attachment via BlueBubbles API.
* Supports sending media files (images, videos, audio, documents) to a chat.
* When asVoice is true, expects MP3/CAF audio and marks it as an iMessage voice memo.
*/
async function sendBlueBubblesAttachment(params) {
	const { to, caption, replyToMessageGuid, replyToPartIndex, asVoice, opts = {} } = params;
	let { buffer, filename, contentType } = params;
	const wantsVoice = asVoice === true;
	const fallbackName = wantsVoice ? "Audio Message" : "attachment";
	filename = sanitizeFilename(filename, fallbackName);
	contentType = normalizeOptionalString(contentType);
	const { baseUrl, password, accountId, allowPrivateNetwork } = resolveAccount$2(opts);
	let privateApiStatus = getCachedBlueBubblesPrivateApiStatus(accountId);
	const wantsReplyThread = Boolean(replyToMessageGuid?.trim());
	if (privateApiStatus === null && wantsReplyThread) try {
		await fetchBlueBubblesServerInfo({
			baseUrl,
			password,
			accountId,
			timeoutMs: opts.timeoutMs ?? 5e3,
			allowPrivateNetwork
		});
		privateApiStatus = getCachedBlueBubblesPrivateApiStatus(accountId);
	} catch {}
	const privateApiEnabled = isBlueBubblesPrivateApiStatusEnabled(privateApiStatus);
	const isAudioMessage = wantsVoice;
	if (isAudioMessage) {
		const voiceInfo = resolveVoiceInfo(filename, contentType);
		if (!voiceInfo.isAudio) throw new Error("BlueBubbles voice messages require audio media (mp3 or caf).");
		if (voiceInfo.isMp3) {
			filename = ensureExtension(filename, ".mp3", fallbackName);
			contentType = contentType ?? "audio/mpeg";
		} else if (voiceInfo.isCaf) {
			filename = ensureExtension(filename, ".caf", fallbackName);
			contentType = contentType ?? "audio/x-caf";
		} else throw new Error("BlueBubbles voice messages require mp3 or caf audio (convert before sending).");
	}
	const target = resolveBlueBubblesSendTarget(to);
	let chatGuid = await resolveChatGuidForTarget({
		baseUrl,
		password,
		timeoutMs: opts.timeoutMs,
		target,
		allowPrivateNetwork
	});
	if (!chatGuid) {
		if (target.kind === "handle") {
			chatGuid = (await createChatForHandle({
				baseUrl,
				password,
				address: target.address,
				timeoutMs: opts.timeoutMs,
				allowPrivateNetwork
			})).chatGuid;
			if (!chatGuid) chatGuid = await resolveChatGuidForTarget({
				baseUrl,
				password,
				timeoutMs: opts.timeoutMs,
				target,
				allowPrivateNetwork
			});
		}
		if (!chatGuid) throw new Error("BlueBubbles attachment send failed: chatGuid not found for target. Use a chat_guid target or ensure the chat exists.");
	}
	const url = buildBlueBubblesApiUrl({
		baseUrl,
		path: "/api/v1/message/attachment",
		password
	});
	const boundary = `----BlueBubblesFormBoundary${crypto.randomUUID().replace(/-/g, "")}`;
	const parts = [];
	const encoder = new TextEncoder();
	const addField = (name, value) => {
		parts.push(encoder.encode(`--${boundary}\r\n`));
		parts.push(encoder.encode(`Content-Disposition: form-data; name="${name}"\r\n\r\n`));
		parts.push(encoder.encode(`${value}\r\n`));
	};
	const addFile = (name, fileBuffer, fileName, mimeType) => {
		parts.push(encoder.encode(`--${boundary}\r\n`));
		parts.push(encoder.encode(`Content-Disposition: form-data; name="${name}"; filename="${fileName}"\r\n`));
		parts.push(encoder.encode(`Content-Type: ${mimeType ?? "application/octet-stream"}\r\n\r\n`));
		parts.push(fileBuffer);
		parts.push(encoder.encode("\r\n"));
	};
	addFile("attachment", buffer, filename, contentType);
	addField("chatGuid", chatGuid);
	addField("name", filename);
	addField("tempGuid", `temp-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`);
	if (privateApiEnabled) addField("method", "private-api");
	if (isAudioMessage) addField("isAudioMessage", "true");
	const trimmedReplyTo = replyToMessageGuid?.trim();
	if (trimmedReplyTo && privateApiEnabled) {
		addField("selectedMessageGuid", trimmedReplyTo);
		addField("partIndex", typeof replyToPartIndex === "number" ? String(replyToPartIndex) : "0");
	} else if (trimmedReplyTo && privateApiStatus === null) warnBlueBubbles("Private API status unknown; sending attachment without reply threading metadata. Run a status probe to restore private-api reply features.");
	if (caption) {
		addField("message", caption);
		addField("text", caption);
		addField("caption", caption);
	}
	parts.push(encoder.encode(`--${boundary}--\r\n`));
	const res = await postMultipartFormData({
		url,
		boundary,
		parts,
		timeoutMs: opts.timeoutMs ?? 6e4,
		ssrfPolicy: blueBubblesPolicy$1(allowPrivateNetwork)
	});
	await assertMultipartActionOk(res, "attachment send");
	const responseBody = await res.text();
	if (!responseBody) return { messageId: "ok" };
	try {
		return { messageId: extractBlueBubblesMessageId(JSON.parse(responseBody)) };
	} catch {
		return { messageId: "ok" };
	}
}
//#endregion
//#region extensions/bluebubbles/src/chat.ts
function blueBubblesPolicy(allowPrivateNetwork) {
	return allowPrivateNetwork ? { allowPrivateNetwork: true } : {};
}
function resolveAccount$1(params) {
	return resolveBlueBubblesServerAccount(params);
}
function assertPrivateApiEnabled(accountId, feature) {
	if (getCachedBlueBubblesPrivateApiStatus(accountId) === false) throw new Error(`BlueBubbles ${feature} requires Private API, but it is disabled on the BlueBubbles server.`);
}
function resolvePartIndex(partIndex) {
	return typeof partIndex === "number" ? partIndex : 0;
}
async function sendBlueBubblesChatEndpointRequest(params) {
	const trimmed = params.chatGuid.trim();
	if (!trimmed) return;
	const { baseUrl, password, accountId, allowPrivateNetwork } = resolveAccount$1(params.opts);
	if (getCachedBlueBubblesPrivateApiStatus(accountId) === false) return;
	await assertMultipartActionOk(await blueBubblesFetchWithTimeout(buildBlueBubblesApiUrl({
		baseUrl,
		path: `/api/v1/chat/${encodeURIComponent(trimmed)}/${params.endpoint}`,
		password
	}), { method: params.method }, params.opts.timeoutMs, blueBubblesPolicy(allowPrivateNetwork)), params.action);
}
async function sendPrivateApiJsonRequest(params) {
	const { baseUrl, password, accountId, allowPrivateNetwork } = resolveAccount$1(params.opts);
	assertPrivateApiEnabled(accountId, params.feature);
	const url = buildBlueBubblesApiUrl({
		baseUrl,
		path: params.path,
		password
	});
	const request = { method: params.method };
	if (params.payload !== void 0) {
		request.headers = { "Content-Type": "application/json" };
		request.body = JSON.stringify(params.payload);
	}
	await assertMultipartActionOk(await blueBubblesFetchWithTimeout(url, request, params.opts.timeoutMs, blueBubblesPolicy(allowPrivateNetwork)), params.action);
}
async function markBlueBubblesChatRead(chatGuid, opts = {}) {
	await sendBlueBubblesChatEndpointRequest({
		chatGuid,
		opts,
		endpoint: "read",
		method: "POST",
		action: "read"
	});
}
async function sendBlueBubblesTyping(chatGuid, typing, opts = {}) {
	await sendBlueBubblesChatEndpointRequest({
		chatGuid,
		opts,
		endpoint: "typing",
		method: typing ? "POST" : "DELETE",
		action: "typing"
	});
}
/**
* Edit a message via BlueBubbles API.
* Requires macOS 13 (Ventura) or higher with Private API enabled.
*/
async function editBlueBubblesMessage(messageGuid, newText, opts = {}) {
	const trimmedGuid = messageGuid.trim();
	if (!trimmedGuid) throw new Error("BlueBubbles edit requires messageGuid");
	const trimmedText = newText.trim();
	if (!trimmedText) throw new Error("BlueBubbles edit requires newText");
	await sendPrivateApiJsonRequest({
		opts,
		feature: "edit",
		action: "edit",
		method: "POST",
		path: `/api/v1/message/${encodeURIComponent(trimmedGuid)}/edit`,
		payload: {
			editedMessage: trimmedText,
			backwardsCompatibilityMessage: opts.backwardsCompatMessage ?? `Edited to: ${trimmedText}`,
			partIndex: resolvePartIndex(opts.partIndex)
		}
	});
}
/**
* Unsend (retract) a message via BlueBubbles API.
* Requires macOS 13 (Ventura) or higher with Private API enabled.
*/
async function unsendBlueBubblesMessage(messageGuid, opts = {}) {
	const trimmedGuid = messageGuid.trim();
	if (!trimmedGuid) throw new Error("BlueBubbles unsend requires messageGuid");
	await sendPrivateApiJsonRequest({
		opts,
		feature: "unsend",
		action: "unsend",
		method: "POST",
		path: `/api/v1/message/${encodeURIComponent(trimmedGuid)}/unsend`,
		payload: { partIndex: resolvePartIndex(opts.partIndex) }
	});
}
/**
* Rename a group chat via BlueBubbles API.
*/
async function renameBlueBubblesChat(chatGuid, displayName, opts = {}) {
	const trimmedGuid = chatGuid.trim();
	if (!trimmedGuid) throw new Error("BlueBubbles rename requires chatGuid");
	await sendPrivateApiJsonRequest({
		opts,
		feature: "renameGroup",
		action: "rename",
		method: "PUT",
		path: `/api/v1/chat/${encodeURIComponent(trimmedGuid)}`,
		payload: { displayName }
	});
}
/**
* Add a participant to a group chat via BlueBubbles API.
*/
async function addBlueBubblesParticipant(chatGuid, address, opts = {}) {
	const trimmedGuid = chatGuid.trim();
	if (!trimmedGuid) throw new Error("BlueBubbles addParticipant requires chatGuid");
	const trimmedAddress = address.trim();
	if (!trimmedAddress) throw new Error("BlueBubbles addParticipant requires address");
	await sendPrivateApiJsonRequest({
		opts,
		feature: "addParticipant",
		action: "addParticipant",
		method: "POST",
		path: `/api/v1/chat/${encodeURIComponent(trimmedGuid)}/participant`,
		payload: { address: trimmedAddress }
	});
}
/**
* Remove a participant from a group chat via BlueBubbles API.
*/
async function removeBlueBubblesParticipant(chatGuid, address, opts = {}) {
	const trimmedGuid = chatGuid.trim();
	if (!trimmedGuid) throw new Error("BlueBubbles removeParticipant requires chatGuid");
	const trimmedAddress = address.trim();
	if (!trimmedAddress) throw new Error("BlueBubbles removeParticipant requires address");
	await sendPrivateApiJsonRequest({
		opts,
		feature: "removeParticipant",
		action: "removeParticipant",
		method: "DELETE",
		path: `/api/v1/chat/${encodeURIComponent(trimmedGuid)}/participant`,
		payload: { address: trimmedAddress }
	});
}
/**
* Leave a group chat via BlueBubbles API.
*/
async function leaveBlueBubblesChat(chatGuid, opts = {}) {
	const trimmedGuid = chatGuid.trim();
	if (!trimmedGuid) throw new Error("BlueBubbles leaveChat requires chatGuid");
	await sendPrivateApiJsonRequest({
		opts,
		feature: "leaveGroup",
		action: "leaveChat",
		method: "POST",
		path: `/api/v1/chat/${encodeURIComponent(trimmedGuid)}/leave`
	});
}
/**
* Set a group chat's icon/photo via BlueBubbles API.
* Requires Private API to be enabled.
*/
async function setGroupIconBlueBubbles(chatGuid, buffer, filename, opts = {}) {
	const trimmedGuid = chatGuid.trim();
	if (!trimmedGuid) throw new Error("BlueBubbles setGroupIcon requires chatGuid");
	if (!buffer || buffer.length === 0) throw new Error("BlueBubbles setGroupIcon requires image buffer");
	const { baseUrl, password, accountId, allowPrivateNetwork } = resolveAccount$1(opts);
	assertPrivateApiEnabled(accountId, "setGroupIcon");
	const url = buildBlueBubblesApiUrl({
		baseUrl,
		path: `/api/v1/chat/${encodeURIComponent(trimmedGuid)}/icon`,
		password
	});
	const boundary = `----BlueBubblesFormBoundary${crypto.randomUUID().replace(/-/g, "")}`;
	const parts = [];
	const encoder = new TextEncoder();
	const safeFilename = path.basename(filename).replace(/[\r\n"\\]/g, "_") || "icon.png";
	parts.push(encoder.encode(`--${boundary}\r\n`));
	parts.push(encoder.encode(`Content-Disposition: form-data; name="icon"; filename="${safeFilename}"\r\n`));
	parts.push(encoder.encode(`Content-Type: ${opts.contentType ?? "application/octet-stream"}\r\n\r\n`));
	parts.push(buffer);
	parts.push(encoder.encode("\r\n"));
	parts.push(encoder.encode(`--${boundary}--\r\n`));
	await assertMultipartActionOk(await postMultipartFormData({
		url,
		boundary,
		parts,
		timeoutMs: opts.timeoutMs ?? 6e4,
		ssrfPolicy: blueBubblesPolicy(allowPrivateNetwork)
	}), "setGroupIcon");
}
//#endregion
//#region extensions/bluebubbles/src/monitor-reply-cache.ts
const REPLY_CACHE_MAX = 2e3;
const REPLY_CACHE_TTL_MS = 360 * 60 * 1e3;
const blueBubblesReplyCacheByMessageId = /* @__PURE__ */ new Map();
const blueBubblesShortIdToUuid = /* @__PURE__ */ new Map();
const blueBubblesUuidToShortId = /* @__PURE__ */ new Map();
let blueBubblesShortIdCounter = 0;
function generateShortId() {
	blueBubblesShortIdCounter += 1;
	return String(blueBubblesShortIdCounter);
}
function rememberBlueBubblesReplyCache(entry) {
	const messageId = entry.messageId.trim();
	if (!messageId) return {
		...entry,
		shortId: ""
	};
	let shortId = blueBubblesUuidToShortId.get(messageId);
	if (!shortId) {
		shortId = generateShortId();
		blueBubblesShortIdToUuid.set(shortId, messageId);
		blueBubblesUuidToShortId.set(messageId, shortId);
	}
	const fullEntry = {
		...entry,
		messageId,
		shortId
	};
	blueBubblesReplyCacheByMessageId.delete(messageId);
	blueBubblesReplyCacheByMessageId.set(messageId, fullEntry);
	const cutoff = Date.now() - REPLY_CACHE_TTL_MS;
	for (const [key, value] of blueBubblesReplyCacheByMessageId) {
		if (value.timestamp < cutoff) {
			blueBubblesReplyCacheByMessageId.delete(key);
			if (value.shortId) {
				blueBubblesShortIdToUuid.delete(value.shortId);
				blueBubblesUuidToShortId.delete(key);
			}
			continue;
		}
		break;
	}
	while (blueBubblesReplyCacheByMessageId.size > REPLY_CACHE_MAX) {
		const oldest = blueBubblesReplyCacheByMessageId.keys().next().value;
		if (!oldest) break;
		const oldEntry = blueBubblesReplyCacheByMessageId.get(oldest);
		blueBubblesReplyCacheByMessageId.delete(oldest);
		if (oldEntry?.shortId) {
			blueBubblesShortIdToUuid.delete(oldEntry.shortId);
			blueBubblesUuidToShortId.delete(oldest);
		}
	}
	return fullEntry;
}
/**
* Resolves a short message ID (e.g., "1", "2") to a full BlueBubbles GUID.
* Returns the input unchanged if it's already a GUID or not found in the mapping.
*/
function resolveBlueBubblesMessageId(shortOrUuid, opts) {
	const trimmed = shortOrUuid.trim();
	if (!trimmed) return trimmed;
	if (/^\d+$/.test(trimmed)) {
		const uuid = blueBubblesShortIdToUuid.get(trimmed);
		if (uuid) return uuid;
		if (opts?.requireKnownShortId) throw new Error(`BlueBubbles short message id "${trimmed}" is no longer available. Use MessageSidFull.`);
	}
	return trimmed;
}
/**
* Gets the short ID for a message GUID, if one exists.
*/
function getShortIdForUuid(uuid) {
	return blueBubblesUuidToShortId.get(uuid.trim());
}
function resolveReplyContextFromCache(params) {
	const replyToId = params.replyToId.trim();
	if (!replyToId) return null;
	const cached = blueBubblesReplyCacheByMessageId.get(replyToId);
	if (!cached) return null;
	if (cached.accountId !== params.accountId) return null;
	const cutoff = Date.now() - REPLY_CACHE_TTL_MS;
	if (cached.timestamp < cutoff) {
		blueBubblesReplyCacheByMessageId.delete(replyToId);
		return null;
	}
	const chatGuid = normalizeOptionalString(params.chatGuid);
	const chatIdentifier = normalizeOptionalString(params.chatIdentifier);
	const cachedChatGuid = normalizeOptionalString(cached.chatGuid);
	const cachedChatIdentifier = normalizeOptionalString(cached.chatIdentifier);
	const chatId = typeof params.chatId === "number" ? params.chatId : void 0;
	const cachedChatId = typeof cached.chatId === "number" ? cached.chatId : void 0;
	if (chatGuid && cachedChatGuid && chatGuid !== cachedChatGuid) return null;
	if (!chatGuid && chatIdentifier && cachedChatIdentifier && chatIdentifier !== cachedChatIdentifier) return null;
	if (!chatGuid && !chatIdentifier && chatId && cachedChatId && chatId !== cachedChatId) return null;
	return cached;
}
//#endregion
//#region extensions/bluebubbles/src/reactions.ts
const REACTION_TYPES = new Set([
	"love",
	"like",
	"dislike",
	"laugh",
	"emphasize",
	"question"
]);
const REACTION_ALIASES = new Map([
	["heart", "love"],
	["love", "love"],
	["❤", "love"],
	["❤️", "love"],
	["red_heart", "love"],
	["thumbs_up", "like"],
	["thumbsup", "like"],
	["thumbs-up", "like"],
	["thumbsup", "like"],
	["like", "like"],
	["thumb", "like"],
	["ok", "like"],
	["thumbs_down", "dislike"],
	["thumbsdown", "dislike"],
	["thumbs-down", "dislike"],
	["dislike", "dislike"],
	["boo", "dislike"],
	["no", "dislike"],
	["haha", "laugh"],
	["lol", "laugh"],
	["lmao", "laugh"],
	["rofl", "laugh"],
	["😂", "laugh"],
	["🤣", "laugh"],
	["xd", "laugh"],
	["laugh", "laugh"],
	["emphasis", "emphasize"],
	["emphasize", "emphasize"],
	["exclaim", "emphasize"],
	["!!", "emphasize"],
	["‼", "emphasize"],
	["‼️", "emphasize"],
	["❗", "emphasize"],
	["important", "emphasize"],
	["bang", "emphasize"],
	["question", "question"],
	["?", "question"],
	["❓", "question"],
	["❔", "question"],
	["ask", "question"],
	["loved", "love"],
	["liked", "like"],
	["disliked", "dislike"],
	["laughed", "laugh"],
	["emphasized", "emphasize"],
	["questioned", "question"],
	["fire", "love"],
	["🔥", "love"],
	["wow", "emphasize"],
	["!", "emphasize"],
	["heart_eyes", "love"],
	["smile", "laugh"],
	["smiley", "laugh"],
	["happy", "laugh"],
	["joy", "laugh"]
]);
const REACTION_EMOJIS = new Map([
	["❤️", "love"],
	["❤", "love"],
	["♥️", "love"],
	["♥", "love"],
	["😍", "love"],
	["💕", "love"],
	["👍", "like"],
	["👌", "like"],
	["👎", "dislike"],
	["🙅", "dislike"],
	["😂", "laugh"],
	["🤣", "laugh"],
	["😆", "laugh"],
	["😁", "laugh"],
	["😹", "laugh"],
	["‼️", "emphasize"],
	["‼", "emphasize"],
	["!!", "emphasize"],
	["❗", "emphasize"],
	["❕", "emphasize"],
	["!", "emphasize"],
	["❓", "question"],
	["❔", "question"],
	["?", "question"]
]);
function resolveAccount(params) {
	return resolveBlueBubblesServerAccount(params);
}
function normalizeBlueBubblesReactionInput(emoji, remove) {
	const trimmed = emoji.trim();
	if (!trimmed) throw new Error("BlueBubbles reaction requires an emoji or name.");
	let raw = normalizeLowercaseStringOrEmpty(trimmed);
	if (raw.startsWith("-")) raw = raw.slice(1);
	const aliased = REACTION_ALIASES.get(raw) ?? raw;
	const mapped = REACTION_EMOJIS.get(trimmed) ?? REACTION_EMOJIS.get(raw) ?? aliased;
	if (!REACTION_TYPES.has(mapped)) throw new Error(`Unsupported BlueBubbles reaction: ${trimmed}`);
	return remove ? `-${mapped}` : mapped;
}
async function sendBlueBubblesReaction(params) {
	const chatGuid = params.chatGuid.trim();
	const messageGuid = params.messageGuid.trim();
	if (!chatGuid) throw new Error("BlueBubbles reaction requires chatGuid.");
	if (!messageGuid) throw new Error("BlueBubbles reaction requires messageGuid.");
	const reaction = normalizeBlueBubblesReactionInput(params.emoji, params.remove);
	const { baseUrl, password, accountId, allowPrivateNetwork } = resolveAccount(params.opts ?? {});
	if (getCachedBlueBubblesPrivateApiStatus(accountId) === false) throw new Error("BlueBubbles reaction requires Private API, but it is disabled on the BlueBubbles server.");
	const url = buildBlueBubblesApiUrl({
		baseUrl,
		path: "/api/v1/message/react",
		password
	});
	const payload = {
		chatGuid,
		selectedMessageGuid: messageGuid,
		reaction,
		partIndex: typeof params.partIndex === "number" ? params.partIndex : 0
	};
	const ssrfPolicy = allowPrivateNetwork ? { allowPrivateNetwork: true } : {};
	const res = await blueBubblesFetchWithTimeout(url, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload)
	}, params.opts?.timeoutMs, ssrfPolicy);
	if (!res.ok) {
		const errorText = await res.text();
		throw new Error(`BlueBubbles reaction failed (${res.status}): ${errorText || "unknown"}`);
	}
}
//#endregion
export { fetchBlueBubblesMessageAttachments as _, resolveBlueBubblesMessageId as a, sendMessageBlueBubbles as b, editBlueBubblesMessage as c, removeBlueBubblesParticipant as d, renameBlueBubblesChat as f, downloadBlueBubblesAttachment as g, unsendBlueBubblesMessage as h, rememberBlueBubblesReplyCache as i, leaveBlueBubblesChat as l, setGroupIconBlueBubbles as m, sendBlueBubblesReaction as n, resolveReplyContextFromCache as o, sendBlueBubblesTyping as p, getShortIdForUuid as r, addBlueBubblesParticipant as s, normalizeBlueBubblesReactionInput as t, markBlueBubblesChatRead as u, sendBlueBubblesAttachment as v, resolveBlueBubblesServerAccount as x, resolveChatGuidForTarget as y };
