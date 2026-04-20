import { i as formatErrorMessage } from "./errors-D8p6rxH8.js";
import { i as normalizeLowercaseStringOrEmpty } from "./string-coerce-BUSzWgUA.js";
import { n as fetchWithSsrFGuard } from "./fetch-guard-B3p4gGaY.js";
import "./text-runtime-DTMxvodz.js";
import "./error-runtime-CgBDklBz.js";
import "./runtime-api-W70q3M7u.js";
import crypto from "node:crypto";
import { GoogleAuth, OAuth2Client } from "google-auth-library";
//#region extensions/googlechat/src/auth.ts
const CHAT_SCOPE = "https://www.googleapis.com/auth/chat.bot";
const CHAT_ISSUER = "chat@system.gserviceaccount.com";
const ADDON_ISSUER_PATTERN = /^service-\d+@gcp-sa-gsuiteaddons\.iam\.gserviceaccount\.com$/;
const CHAT_CERTS_URL = "https://www.googleapis.com/service_accounts/v1/metadata/x509/chat@system.gserviceaccount.com";
const MAX_AUTH_CACHE_SIZE = 32;
const authCache = /* @__PURE__ */ new Map();
const verifyClient = new OAuth2Client();
let cachedCerts = null;
function buildAuthKey(account) {
	if (account.credentialsFile) return `file:${account.credentialsFile}`;
	if (account.credentials) return `inline:${JSON.stringify(account.credentials)}`;
	return "none";
}
function getAuthInstance(account) {
	const key = buildAuthKey(account);
	const cached = authCache.get(account.accountId);
	if (cached && cached.key === key) return cached.auth;
	const evictOldest = () => {
		if (authCache.size > MAX_AUTH_CACHE_SIZE) {
			const oldest = authCache.keys().next().value;
			if (oldest !== void 0) authCache.delete(oldest);
		}
	};
	if (account.credentialsFile) {
		const auth = new GoogleAuth({
			keyFile: account.credentialsFile,
			scopes: [CHAT_SCOPE]
		});
		authCache.set(account.accountId, {
			key,
			auth
		});
		evictOldest();
		return auth;
	}
	if (account.credentials) {
		const auth = new GoogleAuth({
			credentials: account.credentials,
			scopes: [CHAT_SCOPE]
		});
		authCache.set(account.accountId, {
			key,
			auth
		});
		evictOldest();
		return auth;
	}
	const auth = new GoogleAuth({ scopes: [CHAT_SCOPE] });
	authCache.set(account.accountId, {
		key,
		auth
	});
	evictOldest();
	return auth;
}
async function getGoogleChatAccessToken(account) {
	const access = await (await getAuthInstance(account).getClient()).getAccessToken();
	const token = typeof access === "string" ? access : access?.token;
	if (!token) throw new Error("Missing Google Chat access token");
	return token;
}
async function fetchChatCerts() {
	const now = Date.now();
	if (cachedCerts && now - cachedCerts.fetchedAt < 600 * 1e3) return cachedCerts.certs;
	const res = await fetch(CHAT_CERTS_URL);
	if (!res.ok) throw new Error(`Failed to fetch Chat certs (${res.status})`);
	const certs = await res.json();
	cachedCerts = {
		fetchedAt: now,
		certs
	};
	return certs;
}
async function verifyGoogleChatRequest(params) {
	const bearer = params.bearer?.trim();
	if (!bearer) return {
		ok: false,
		reason: "missing token"
	};
	const audience = params.audience?.trim();
	if (!audience) return {
		ok: false,
		reason: "missing audience"
	};
	const audienceType = params.audienceType ?? null;
	if (audienceType === "app-url") try {
		const payload = (await verifyClient.verifyIdToken({
			idToken: bearer,
			audience
		})).getPayload();
		const email = normalizeLowercaseStringOrEmpty(payload?.email ?? "");
		if (!payload?.email_verified) return {
			ok: false,
			reason: "email not verified"
		};
		if (email === CHAT_ISSUER) return { ok: true };
		if (!ADDON_ISSUER_PATTERN.test(email)) return {
			ok: false,
			reason: `invalid issuer: ${email}`
		};
		const expectedAddOnPrincipal = normalizeLowercaseStringOrEmpty(params.expectedAddOnPrincipal ?? "");
		if (!expectedAddOnPrincipal) return {
			ok: false,
			reason: "missing add-on principal binding"
		};
		const tokenPrincipal = normalizeLowercaseStringOrEmpty(payload?.sub ?? "");
		if (!tokenPrincipal || tokenPrincipal !== expectedAddOnPrincipal) return {
			ok: false,
			reason: `unexpected add-on principal: ${tokenPrincipal || "<missing>"}`
		};
		return { ok: true };
	} catch (err) {
		return {
			ok: false,
			reason: err instanceof Error ? err.message : "invalid token"
		};
	}
	if (audienceType === "project-number") try {
		const certs = await fetchChatCerts();
		await verifyClient.verifySignedJwtWithCertsAsync(bearer, certs, audience, [CHAT_ISSUER]);
		return { ok: true };
	} catch (err) {
		return {
			ok: false,
			reason: err instanceof Error ? err.message : "invalid token"
		};
	}
	return {
		ok: false,
		reason: "unsupported audience type"
	};
}
//#endregion
//#region extensions/googlechat/src/api.ts
const CHAT_API_BASE = "https://chat.googleapis.com/v1";
const CHAT_UPLOAD_BASE = "https://chat.googleapis.com/upload/v1";
const headersToObject = (headers) => headers instanceof Headers ? Object.fromEntries(headers.entries()) : Array.isArray(headers) ? Object.fromEntries(headers) : headers || {};
async function withGoogleChatResponse(params) {
	const { account, url, init, auditContext, errorPrefix = "Google Chat API", handleResponse } = params;
	const token = await getGoogleChatAccessToken(account);
	const { response, release } = await fetchWithSsrFGuard({
		url,
		init: {
			...init,
			headers: {
				...headersToObject(init?.headers),
				Authorization: `Bearer ${token}`
			}
		},
		auditContext
	});
	try {
		if (!response.ok) {
			const text = await response.text().catch(() => "");
			throw new Error(`${errorPrefix} ${response.status}: ${text || response.statusText}`);
		}
		return await handleResponse(response);
	} finally {
		await release();
	}
}
async function fetchJson(account, url, init) {
	return await withGoogleChatResponse({
		account,
		url,
		init: {
			...init,
			headers: {
				...headersToObject(init.headers),
				"Content-Type": "application/json"
			}
		},
		auditContext: "googlechat.api.json",
		handleResponse: async (response) => await response.json()
	});
}
async function fetchOk(account, url, init) {
	await withGoogleChatResponse({
		account,
		url,
		init,
		auditContext: "googlechat.api.ok",
		handleResponse: async () => void 0
	});
}
async function fetchBuffer(account, url, init, options) {
	return await withGoogleChatResponse({
		account,
		url,
		init,
		auditContext: "googlechat.api.buffer",
		handleResponse: async (res) => {
			const maxBytes = options?.maxBytes;
			const lengthHeader = res.headers.get("content-length");
			if (maxBytes && lengthHeader) {
				const length = Number(lengthHeader);
				if (Number.isFinite(length) && length > maxBytes) throw new Error(`Google Chat media exceeds max bytes (${maxBytes})`);
			}
			if (!maxBytes || !res.body) return {
				buffer: Buffer.from(await res.arrayBuffer()),
				contentType: res.headers.get("content-type") ?? void 0
			};
			const reader = res.body.getReader();
			const chunks = [];
			let total = 0;
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				if (!value) continue;
				total += value.length;
				if (total > maxBytes) {
					await reader.cancel();
					throw new Error(`Google Chat media exceeds max bytes (${maxBytes})`);
				}
				chunks.push(Buffer.from(value));
			}
			return {
				buffer: Buffer.concat(chunks, total),
				contentType: res.headers.get("content-type") ?? void 0
			};
		}
	});
}
async function sendGoogleChatMessage(params) {
	const { account, space, text, thread, attachments } = params;
	const body = {};
	if (text) body.text = text;
	if (thread) body.thread = { name: thread };
	if (attachments && attachments.length > 0) body.attachment = attachments.map((item) => ({
		attachmentDataRef: { attachmentUploadToken: item.attachmentUploadToken },
		...item.contentName ? { contentName: item.contentName } : {}
	}));
	const urlObj = new URL(`${CHAT_API_BASE}/${space}/messages`);
	if (thread) urlObj.searchParams.set("messageReplyOption", "REPLY_MESSAGE_FALLBACK_TO_NEW_THREAD");
	const result = await fetchJson(account, urlObj.toString(), {
		method: "POST",
		body: JSON.stringify(body)
	});
	return result ? { messageName: result.name } : null;
}
async function updateGoogleChatMessage(params) {
	const { account, messageName, text } = params;
	return { messageName: (await fetchJson(account, `${CHAT_API_BASE}/${messageName}?updateMask=text`, {
		method: "PATCH",
		body: JSON.stringify({ text })
	})).name };
}
async function deleteGoogleChatMessage(params) {
	const { account, messageName } = params;
	await fetchOk(account, `${CHAT_API_BASE}/${messageName}`, { method: "DELETE" });
}
async function uploadGoogleChatAttachment(params) {
	const { account, space, filename, buffer, contentType } = params;
	const boundary = `openclaw-${crypto.randomUUID()}`;
	const header = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify({ filename })}\r\n`;
	const mediaHeader = `--${boundary}\r\nContent-Type: ${contentType ?? "application/octet-stream"}\r\n\r\n`;
	const footer = `\r\n--${boundary}--\r\n`;
	const body = Buffer.concat([
		Buffer.from(header, "utf8"),
		Buffer.from(mediaHeader, "utf8"),
		buffer,
		Buffer.from(footer, "utf8")
	]);
	return { attachmentUploadToken: (await withGoogleChatResponse({
		account,
		url: `${CHAT_UPLOAD_BASE}/${space}/attachments:upload?uploadType=multipart`,
		init: {
			method: "POST",
			headers: { "Content-Type": `multipart/related; boundary=${boundary}` },
			body
		},
		auditContext: "googlechat.upload",
		errorPrefix: "Google Chat upload",
		handleResponse: async (response) => await response.json()
	})).attachmentDataRef?.attachmentUploadToken };
}
async function downloadGoogleChatMedia(params) {
	const { account, resourceName, maxBytes } = params;
	return await fetchBuffer(account, `${CHAT_API_BASE}/media/${resourceName}?alt=media`, void 0, { maxBytes });
}
async function createGoogleChatReaction(params) {
	const { account, messageName, emoji } = params;
	return await fetchJson(account, `${CHAT_API_BASE}/${messageName}/reactions`, {
		method: "POST",
		body: JSON.stringify({ emoji: { unicode: emoji } })
	});
}
async function listGoogleChatReactions(params) {
	const { account, messageName, limit } = params;
	const url = new URL(`${CHAT_API_BASE}/${messageName}/reactions`);
	if (limit && limit > 0) url.searchParams.set("pageSize", String(limit));
	return (await fetchJson(account, url.toString(), { method: "GET" })).reactions ?? [];
}
async function deleteGoogleChatReaction(params) {
	const { account, reactionName } = params;
	await fetchOk(account, `${CHAT_API_BASE}/${reactionName}`, { method: "DELETE" });
}
async function findGoogleChatDirectMessage(params) {
	const { account, userName } = params;
	const url = new URL(`${CHAT_API_BASE}/spaces:findDirectMessage`);
	url.searchParams.set("name", userName);
	return await fetchJson(account, url.toString(), { method: "GET" });
}
async function probeGoogleChat(account) {
	try {
		const url = new URL(`${CHAT_API_BASE}/spaces`);
		url.searchParams.set("pageSize", "1");
		await fetchJson(account, url.toString(), { method: "GET" });
		return { ok: true };
	} catch (err) {
		return {
			ok: false,
			error: formatErrorMessage(err)
		};
	}
}
//#endregion
export { findGoogleChatDirectMessage as a, sendGoogleChatMessage as c, verifyGoogleChatRequest as d, downloadGoogleChatMedia as i, updateGoogleChatMessage as l, deleteGoogleChatMessage as n, listGoogleChatReactions as o, deleteGoogleChatReaction as r, probeGoogleChat as s, createGoogleChatReaction as t, uploadGoogleChatAttachment as u };
