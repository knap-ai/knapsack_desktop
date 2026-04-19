import { s as __toESM } from "./chunk-iyeSoAlh.js";
import { i as normalizeLowercaseStringOrEmpty, s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { l as isRecord } from "./utils-D5DtWkEu.js";
import { n as estimateBase64DecodedBytes } from "./base64-BgT9iohk.js";
import { n as fetchWithSsrFGuard } from "./fetch-guard-B3p4gGaY.js";
import { u as isPrivateIpAddress } from "./ssrf-DoOclwFS.js";
import "./text-runtime-DTMxvodz.js";
import { a as isHttpsUrlAllowedByHostnameSuffixAllowlist, c as normalizeHostnameSuffixAllowlist, n as buildHostnameAllowlistPolicyFromSuffixAllowlist } from "./ssrf-policy-CChtVzhj.js";
import "./ssrf-runtime-CmuKDV7X.js";
import "./media-runtime-M1ED8IU3.js";
import { t as getMSTeamsRuntime } from "./runtime-D4L8hM9P.js";
import "./runtime-api-Ds1QPION.js";
import { a as resolveMSTeamsCredentials } from "./token-GSTWn7zC.js";
import { createRequire } from "node:module";
import * as fs$1 from "node:fs";
import { Buffer } from "node:buffer";
import { lookup } from "node:dns/promises";
//#region extensions/msteams/src/attachments/shared.ts
const IMAGE_EXT_RE = /\.(avif|bmp|gif|heic|heif|jpe?g|png|tiff?|webp)$/i;
const IMG_SRC_RE = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
const ATTACHMENT_TAG_RE = /<attachment[^>]+id=["']([^"']+)["'][^>]*>/gi;
const DEFAULT_MEDIA_HOST_ALLOWLIST = [
	"graph.microsoft.com",
	"graph.microsoft.us",
	"graph.microsoft.de",
	"graph.microsoft.cn",
	"sharepoint.com",
	"sharepoint.us",
	"sharepoint.de",
	"sharepoint.cn",
	"sharepoint-df.com",
	"1drv.ms",
	"onedrive.com",
	"teams.microsoft.com",
	"teams.cdn.office.net",
	"statics.teams.cdn.office.net",
	"office.com",
	"office.net",
	"asm.skype.com",
	"ams.skype.com",
	"media.ams.skype.com",
	"trafficmanager.net",
	"blob.core.windows.net",
	"azureedge.net",
	"microsoft.com"
];
const DEFAULT_MEDIA_AUTH_HOST_ALLOWLIST = [
	"api.botframework.com",
	"botframework.com",
	"smba.trafficmanager.net",
	"graph.microsoft.com",
	"graph.microsoft.us",
	"graph.microsoft.de",
	"graph.microsoft.cn"
];
const GRAPH_ROOT = "https://graph.microsoft.com/v1.0";
/**
* Host suffixes for SharePoint/OneDrive shared links that must be fetched via
* the Graph `/shares/{shareId}/driveItem/content` endpoint instead of directly.
*
* Direct fetches of SharePoint/OneDrive shared URLs return empty/HTML landing
* pages unless encoded as a Graph share id. See
* https://learn.microsoft.com/en-us/graph/api/shares-get for the encoding.
*/
const GRAPH_SHARED_LINK_HOST_SUFFIXES = [
	".sharepoint.com",
	".sharepoint.us",
	".sharepoint.de",
	".sharepoint.cn",
	".sharepoint-df.com",
	"1drv.ms",
	"onedrive.live.com",
	"onedrive.com"
];
/**
* Returns true when the URL points at a SharePoint or OneDrive host whose
* shared-link content must be fetched through the Graph shares API rather
* than directly.
*/
function isGraphSharedLinkUrl(url) {
	let host;
	try {
		host = normalizeLowercaseStringOrEmpty(new URL(url).hostname);
	} catch {
		return false;
	}
	if (!host) return false;
	return GRAPH_SHARED_LINK_HOST_SUFFIXES.some((suffix) => host === suffix || host.endsWith(suffix));
}
/**
* Encode a SharePoint/OneDrive URL as a Graph shareId using the documented
* `u!` + base64url (no padding) scheme:
* https://learn.microsoft.com/en-us/graph/api/shares-get#encoding-sharing-urls
*/
function encodeGraphShareId(url) {
	return `u!${Buffer.from(url, "utf8").toString("base64url")}`;
}
/**
* When `url` is a SharePoint/OneDrive shared link, return the matching
* `GET /shares/{shareId}/driveItem/content` URL that actually yields the file
* bytes. Returns `undefined` for non-shared-link URLs so callers can fall
* through to the existing fetch path.
*/
function tryBuildGraphSharesUrlForSharedLink(url) {
	if (!isGraphSharedLinkUrl(url)) return;
	return `${GRAPH_ROOT}/shares/${encodeGraphShareId(url)}/driveItem/content`;
}
function readNestedString(value, keys) {
	let current = value;
	for (const key of keys) {
		if (!isRecord(current)) return;
		current = current[key];
	}
	return normalizeOptionalString(current);
}
function resolveRequestUrl(input) {
	if (typeof input === "string") return input;
	if (input instanceof URL) return input.toString();
	if (typeof input === "object" && input && "url" in input && typeof input.url === "string") return input.url;
	try {
		return JSON.stringify(input);
	} catch {
		return "";
	}
}
function normalizeContentType(value) {
	if (typeof value !== "string") return;
	const trimmed = value.trim();
	return trimmed ? trimmed : void 0;
}
function inferPlaceholder(params) {
	const mime = normalizeLowercaseStringOrEmpty(params.contentType ?? "");
	const name = normalizeLowercaseStringOrEmpty(params.fileName ?? "");
	const fileType = normalizeLowercaseStringOrEmpty(params.fileType ?? "");
	return mime.startsWith("image/") || IMAGE_EXT_RE.test(name) || IMAGE_EXT_RE.test(`x.${fileType}`) ? "<media:image>" : "<media:document>";
}
function isLikelyImageAttachment(att) {
	const contentType = normalizeContentType(att.contentType) ?? "";
	const name = typeof att.name === "string" ? att.name : "";
	if (contentType.startsWith("image/")) return true;
	if (IMAGE_EXT_RE.test(name)) return true;
	if (contentType === "application/vnd.microsoft.teams.file.download.info" && isRecord(att.content)) {
		const fileType = typeof att.content.fileType === "string" ? att.content.fileType : "";
		if (fileType && IMAGE_EXT_RE.test(`x.${fileType}`)) return true;
		const fileName = typeof att.content.fileName === "string" ? att.content.fileName : "";
		if (fileName && IMAGE_EXT_RE.test(fileName)) return true;
	}
	return false;
}
/**
* Returns true if the attachment can be downloaded (any file type).
* Used when downloading all files, not just images.
*/
function isDownloadableAttachment(att) {
	if ((normalizeContentType(att.contentType) ?? "") === "application/vnd.microsoft.teams.file.download.info" && isRecord(att.content) && typeof att.content.downloadUrl === "string") return true;
	if (typeof att.contentUrl === "string" && att.contentUrl.trim()) return true;
	return false;
}
function isHtmlAttachment(att) {
	return (normalizeContentType(att.contentType) ?? "").startsWith("text/html");
}
function extractHtmlFromAttachment(att) {
	if (!isHtmlAttachment(att)) return;
	if (typeof att.content === "string") return att.content;
	if (!isRecord(att.content)) return;
	return typeof att.content.text === "string" ? att.content.text : typeof att.content.body === "string" ? att.content.body : typeof att.content.content === "string" ? att.content.content : void 0;
}
function isLikelyBase64Payload(value) {
	return /^[A-Za-z0-9+/=\r\n]+$/.test(value);
}
function decodeDataImageWithLimits(src, opts) {
	const match = /^data:(image\/[a-z0-9.+-]+)?(;base64)?,(.*)$/i.exec(src);
	if (!match) return {
		candidate: null,
		estimatedBytes: 0
	};
	const contentType = normalizeLowercaseStringOrEmpty(match[1] ?? "");
	if (!Boolean(match[2])) return {
		candidate: null,
		estimatedBytes: 0
	};
	const payload = match[3] ?? "";
	if (!payload || !isLikelyBase64Payload(payload)) return {
		candidate: null,
		estimatedBytes: 0
	};
	const estimatedBytes = estimateBase64DecodedBytes(payload);
	if (estimatedBytes <= 0) return {
		candidate: null,
		estimatedBytes: 0
	};
	if (typeof opts.maxInlineBytes === "number" && estimatedBytes > opts.maxInlineBytes) return {
		candidate: null,
		estimatedBytes
	};
	try {
		return {
			candidate: {
				kind: "data",
				data: Buffer.from(payload, "base64"),
				contentType,
				placeholder: "<media:image>"
			},
			estimatedBytes
		};
	} catch {
		return {
			candidate: null,
			estimatedBytes: 0
		};
	}
}
function fileHintFromUrl(src) {
	try {
		return new URL(src).pathname.split("/").pop() || void 0;
	} catch {
		return;
	}
}
function extractInlineImageCandidates(attachments, limits) {
	const out = [];
	let totalEstimatedInlineBytes = 0;
	outerLoop: for (const att of attachments) {
		const html = extractHtmlFromAttachment(att);
		if (!html) continue;
		IMG_SRC_RE.lastIndex = 0;
		let match = IMG_SRC_RE.exec(html);
		while (match) {
			const src = match[1]?.trim();
			if (src && !src.startsWith("cid:")) if (src.startsWith("data:")) {
				const { candidate: decoded, estimatedBytes } = decodeDataImageWithLimits(src, { maxInlineBytes: limits?.maxInlineBytes });
				if (decoded) {
					const nextTotal = totalEstimatedInlineBytes + estimatedBytes;
					if (typeof limits?.maxInlineTotalBytes === "number" && nextTotal > limits.maxInlineTotalBytes) break outerLoop;
					totalEstimatedInlineBytes = nextTotal;
					out.push(decoded);
				}
			} else out.push({
				kind: "url",
				url: src,
				fileHint: fileHintFromUrl(src),
				placeholder: "<media:image>"
			});
			match = IMG_SRC_RE.exec(html);
		}
	}
	return out;
}
function safeHostForUrl(url) {
	try {
		return normalizeLowercaseStringOrEmpty(new URL(url).hostname);
	} catch {
		return "invalid-url";
	}
}
function resolveAllowedHosts(input) {
	return normalizeHostnameSuffixAllowlist(input, DEFAULT_MEDIA_HOST_ALLOWLIST);
}
function resolveAuthAllowedHosts(input) {
	return normalizeHostnameSuffixAllowlist(input, DEFAULT_MEDIA_AUTH_HOST_ALLOWLIST);
}
function resolveAttachmentFetchPolicy(params) {
	return {
		allowHosts: resolveAllowedHosts(params?.allowHosts),
		authAllowHosts: resolveAuthAllowedHosts(params?.authAllowHosts)
	};
}
function isUrlAllowed(url, allowlist) {
	return isHttpsUrlAllowedByHostnameSuffixAllowlist(url, allowlist);
}
function applyAuthorizationHeaderForUrl(params) {
	if (!params.bearerToken) {
		params.headers.delete("Authorization");
		return;
	}
	if (isUrlAllowed(params.url, params.authAllowHosts)) {
		params.headers.set("Authorization", `Bearer ${params.bearerToken}`);
		return;
	}
	params.headers.delete("Authorization");
}
function resolveMediaSsrfPolicy(allowHosts) {
	return buildHostnameAllowlistPolicyFromSuffixAllowlist(allowHosts);
}
/**
* Returns true if the given IPv4 or IPv6 address is in a private, loopback,
* or link-local range that must never be reached from media downloads.
*
* Delegates to the SDK's `isPrivateIpAddress` which handles IPv4-mapped IPv6,
* expanded notation, NAT64, 6to4, Teredo, octal IPv4, and fails closed on
* parse errors.
*/
const isPrivateOrReservedIP = isPrivateIpAddress;
/**
* Resolve a hostname via DNS and reject private/reserved IPs.
* Throws if the resolved IP is private or resolution fails.
*/
async function resolveAndValidateIP(hostname, resolveFn) {
	const resolve = resolveFn ?? lookup;
	let resolved;
	try {
		resolved = await resolve(hostname);
	} catch {
		throw new Error(`DNS resolution failed for "${hostname}"`);
	}
	if (isPrivateOrReservedIP(resolved.address)) throw new Error(`Hostname "${hostname}" resolves to private/reserved IP (${resolved.address})`);
	return resolved.address;
}
/** Maximum number of redirects to follow in safeFetch. */
const MAX_SAFE_REDIRECTS = 5;
/**
* Fetch a URL with redirect: "manual", validating each redirect target
* against the hostname allowlist and optional DNS-resolved IP (anti-SSRF).
*
* This prevents:
* - Auto-following redirects to non-allowlisted hosts
* - DNS rebinding attacks when a lookup function is provided
*/
async function safeFetch(params) {
	const fetchFn = params.fetchFn ?? fetch;
	const resolveFn = params.resolveFn ?? lookup;
	const hasDispatcher = Boolean(params.requestInit && typeof params.requestInit === "object" && "dispatcher" in params.requestInit);
	const currentHeaders = new Headers(params.requestInit?.headers);
	let currentUrl = params.url;
	if (!isUrlAllowed(currentUrl, params.allowHosts)) throw new Error(`Initial download URL blocked: ${currentUrl}`);
	if (resolveFn) try {
		const initialHost = new URL(currentUrl).hostname;
		await resolveAndValidateIP(initialHost, resolveFn);
	} catch {
		throw new Error(`Initial download URL blocked: ${currentUrl}`);
	}
	for (let i = 0; i <= MAX_SAFE_REDIRECTS; i++) {
		const res = await fetchFn(currentUrl, {
			...params.requestInit,
			headers: currentHeaders,
			redirect: "manual"
		});
		if (![
			301,
			302,
			303,
			307,
			308
		].includes(res.status)) return res;
		const location = res.headers.get("location");
		if (!location) return res;
		let redirectUrl;
		try {
			redirectUrl = new URL(location, currentUrl).toString();
		} catch {
			throw new Error(`Invalid redirect URL: ${location}`);
		}
		if (!isUrlAllowed(redirectUrl, params.allowHosts)) throw new Error(`Media redirect target blocked by allowlist: ${redirectUrl}`);
		if (currentHeaders.has("authorization") && params.authorizationAllowHosts && !isUrlAllowed(redirectUrl, params.authorizationAllowHosts)) currentHeaders.delete("authorization");
		if (hasDispatcher) return res;
		if (resolveFn) {
			const redirectHost = new URL(redirectUrl).hostname;
			await resolveAndValidateIP(redirectHost, resolveFn);
		}
		currentUrl = redirectUrl;
	}
	throw new Error(`Too many redirects (>${MAX_SAFE_REDIRECTS})`);
}
async function safeFetchWithPolicy(params) {
	return await safeFetch({
		url: params.url,
		allowHosts: params.policy.allowHosts,
		authorizationAllowHosts: params.policy.authAllowHosts,
		fetchFn: params.fetchFn,
		requestInit: params.requestInit,
		resolveFn: params.resolveFn
	});
}
//#endregion
//#region extensions/msteams/src/errors.ts
function formatUnknownError(err) {
	if (err instanceof Error) return err.message;
	if (typeof err === "string") return err;
	if (err === null) return "null";
	if (err === void 0) return "undefined";
	if (typeof err === "number" || typeof err === "boolean" || typeof err === "bigint") return String(err);
	if (typeof err === "symbol") return err.description ?? err.toString();
	if (typeof err === "function") return err.name ? `[function ${err.name}]` : "[function]";
	try {
		return JSON.stringify(err) ?? "unknown error";
	} catch {
		return "unknown error";
	}
}
function extractStatusCode(err) {
	if (!isRecord(err)) return null;
	const direct = err.statusCode ?? err.status;
	if (typeof direct === "number" && Number.isFinite(direct)) return direct;
	if (typeof direct === "string") {
		const parsed = Number.parseInt(direct, 10);
		if (Number.isFinite(parsed)) return parsed;
	}
	const response = err.response;
	if (isRecord(response)) {
		const status = response.status;
		if (typeof status === "number" && Number.isFinite(status)) return status;
		if (typeof status === "string") {
			const parsed = Number.parseInt(status, 10);
			if (Number.isFinite(parsed)) return parsed;
		}
	}
	return null;
}
function extractErrorCode(err) {
	if (!isRecord(err)) return null;
	const direct = err.code;
	if (typeof direct === "string" && direct.trim()) return direct;
	const response = err.response;
	if (!isRecord(response)) return null;
	const body = response.body;
	if (isRecord(body)) {
		const error = body.error;
		if (isRecord(error) && typeof error.code === "string" && error.code.trim()) return error.code;
	}
	return null;
}
function extractRetryAfterMs(err) {
	if (!isRecord(err)) return null;
	const direct = err.retryAfterMs ?? err.retry_after_ms;
	if (typeof direct === "number" && Number.isFinite(direct) && direct >= 0) return direct;
	const retryAfter = err.retryAfter ?? err.retry_after;
	if (typeof retryAfter === "number" && Number.isFinite(retryAfter)) return retryAfter >= 0 ? retryAfter * 1e3 : null;
	if (typeof retryAfter === "string") {
		const parsed = Number.parseFloat(retryAfter);
		if (Number.isFinite(parsed) && parsed >= 0) return parsed * 1e3;
	}
	const response = err.response;
	if (!isRecord(response)) return null;
	const headers = response.headers;
	if (!headers) return null;
	if (isRecord(headers)) {
		const raw = headers["retry-after"] ?? headers["Retry-After"];
		if (typeof raw === "string") {
			const parsed = Number.parseFloat(raw);
			if (Number.isFinite(parsed) && parsed >= 0) return parsed * 1e3;
		}
	}
	if (typeof headers === "object" && headers !== null && "get" in headers && typeof headers.get === "function") {
		const raw = headers.get("retry-after");
		if (raw) {
			const parsed = Number.parseFloat(raw);
			if (Number.isFinite(parsed) && parsed >= 0) return parsed * 1e3;
		}
	}
	return null;
}
/**
* Classify outbound send errors for safe retries and actionable logs.
*
* Important: We only mark errors as retryable when we have an explicit HTTP
* status code that indicates the message was not accepted (e.g. 429, 5xx).
* For transport-level errors where delivery is ambiguous, we prefer to avoid
* retries to reduce the chance of duplicate posts.
*/
function classifyMSTeamsSendError(err) {
	const statusCode = extractStatusCode(err);
	const retryAfterMs = extractRetryAfterMs(err);
	const errorCode = extractErrorCode(err) ?? void 0;
	if (statusCode === 401) return {
		kind: "auth",
		statusCode,
		errorCode
	};
	if (statusCode === 403) {
		if (errorCode === "ContentStreamNotAllowed") return {
			kind: "permanent",
			statusCode,
			errorCode
		};
		return {
			kind: "auth",
			statusCode,
			errorCode
		};
	}
	if (statusCode === 429) return {
		kind: "throttled",
		statusCode,
		retryAfterMs: retryAfterMs ?? void 0,
		errorCode
	};
	if (statusCode === 408 || statusCode != null && statusCode >= 500) return {
		kind: "transient",
		statusCode,
		retryAfterMs: retryAfterMs ?? void 0,
		errorCode
	};
	if (statusCode != null && statusCode >= 400) return {
		kind: "permanent",
		statusCode,
		errorCode
	};
	return {
		kind: "unknown",
		statusCode: statusCode ?? void 0,
		retryAfterMs: retryAfterMs ?? void 0,
		errorCode
	};
}
/**
* Detect whether an error is caused by a revoked Proxy.
*
* The Bot Framework SDK wraps TurnContext in a Proxy that is revoked once the
* turn handler returns.  Any later access (e.g. from a debounced callback)
* throws a TypeError whose message contains the distinctive "proxy that has
* been revoked" string.
*/
function isRevokedProxyError(err) {
	if (!(err instanceof TypeError)) return false;
	return /proxy that has been revoked/i.test(err.message);
}
function formatMSTeamsSendErrorHint(classification) {
	if (classification.kind === "auth") return "check msteams appId/appPassword/tenantId (or env vars MSTEAMS_APP_ID/MSTEAMS_APP_PASSWORD/MSTEAMS_TENANT_ID)";
	if (classification.errorCode === "ContentStreamNotAllowed") return "Teams expired the content stream; stop streaming earlier and fall back to normal message delivery";
	if (classification.kind === "throttled") return "Teams throttled the bot; backing off may help";
	if (classification.kind === "transient") return "transient Teams/Bot Framework error; retry may succeed";
}
//#endregion
//#region extensions/msteams/src/user-agent.ts
let cachedUserAgent;
function resolveTeamsSdkVersion() {
	try {
		return createRequire(import.meta.url)("@microsoft/teams.apps/package.json").version ?? "unknown";
	} catch {
		return "unknown";
	}
}
function resolveOpenClawVersion() {
	try {
		return getMSTeamsRuntime().version;
	} catch {
		return "unknown";
	}
}
function buildUserAgent() {
	if (cachedUserAgent) return cachedUserAgent;
	cachedUserAgent = `teams.ts[apps]/${resolveTeamsSdkVersion()} OpenClaw/${resolveOpenClawVersion()}`;
	return cachedUserAgent;
}
function ensureUserAgentHeader(headers) {
	const nextHeaders = new Headers(headers);
	if (!nextHeaders.has("User-Agent")) nextHeaders.set("User-Agent", buildUserAgent());
	return nextHeaders;
}
//#endregion
//#region extensions/msteams/src/sdk.ts
const AZURE_IDENTITY_MODULE = "@azure/identity";
async function loadAzureIdentity() {
	return await import(AZURE_IDENTITY_MODULE);
}
async function loadMSTeamsSdk() {
	const [appsModule, apiModule] = await Promise.all([import("./dist-D-KE8e0r.js").then((m) => /* @__PURE__ */ __toESM(m.default, 1)), import("./dist-De-AQDST.js").then((m) => /* @__PURE__ */ __toESM(m.default, 1))]);
	return {
		App: appsModule.App,
		Client: apiModule.Client
	};
}
/**
* Create a no-op HTTP server adapter that satisfies the Teams SDK's
* IHttpServerAdapter interface without spinning up an Express server.
*
* OpenClaw manages its own Express server for the Teams webhook endpoint, so
* the SDK's built-in HTTP server is unnecessary.  Passing this adapter via the
* `httpServerAdapter` option prevents the SDK from creating the default
* HttpPlugin (which uses the deprecated `plugins` array and registers an
* Express middleware with the pattern `/api*` — invalid in Express 5).
*
* See: https://github.com/openclaw/openclaw/issues/55161
* See: https://github.com/openclaw/openclaw/issues/60732
*/
function createNoOpHttpServerAdapter() {
	return { registerRoute() {} };
}
/**
* Create a Teams SDK App instance from credentials. The App manages token
* acquisition, JWT validation, and the HTTP server lifecycle.
*
* This replaces the previous CloudAdapter + MsalTokenProvider + authorizeJWT
* from @microsoft/agents-hosting.
*/
async function createMSTeamsApp(creds, sdk) {
	if (creds.type === "federated") return createFederatedApp(creds, sdk);
	return new sdk.App({
		clientId: creds.appId,
		clientSecret: creds.appPassword,
		tenantId: creds.tenantId,
		httpServerAdapter: createNoOpHttpServerAdapter()
	});
}
function createFederatedApp(creds, sdk) {
	if (creds.useManagedIdentity) return createManagedIdentityApp(creds, sdk);
	if (!creds.certificatePath) throw new Error("Federated credentials require either a certificate path or managed identity.");
	let privateKey;
	try {
		privateKey = fs$1.readFileSync(creds.certificatePath, "utf-8");
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		throw new Error(`Failed to read certificate file at '${creds.certificatePath}': ${msg}`, { cause: err });
	}
	return createCertificateApp(creds, privateKey, sdk);
}
function createCertificateApp(creds, privateKey, sdk) {
	let credentialPromise = null;
	const getCredential = async () => {
		if (!credentialPromise) credentialPromise = loadAzureIdentity().then((az) => new az.ClientCertificateCredential(creds.tenantId, creds.appId, { certificate: privateKey }));
		return credentialPromise;
	};
	const tokenProvider = async (scope) => {
		const token = await (await getCredential()).getToken(scope);
		if (!token?.token) throw new Error("Failed to acquire token via certificate credential.");
		return token.token;
	};
	return new sdk.App({
		clientId: creds.appId,
		tenantId: creds.tenantId,
		token: tokenProvider,
		httpServerAdapter: createNoOpHttpServerAdapter()
	});
}
function createManagedIdentityApp(creds, sdk) {
	let credentialPromise = null;
	const getCredential = async () => {
		if (!credentialPromise) credentialPromise = loadAzureIdentity().then((az) => creds.managedIdentityClientId ? new az.ManagedIdentityCredential(creds.managedIdentityClientId) : new az.ManagedIdentityCredential());
		return credentialPromise;
	};
	const tokenProvider = async (scope) => {
		const token = await (await getCredential()).getToken(scope);
		if (!token?.token) throw new Error("Failed to acquire token via managed identity.");
		return token.token;
	};
	return new sdk.App({
		clientId: creds.appId,
		tenantId: creds.tenantId,
		token: tokenProvider,
		httpServerAdapter: createNoOpHttpServerAdapter()
	});
}
/**
* Build a token provider that uses the Teams SDK App for token acquisition.
*/
function createMSTeamsTokenProvider(app) {
	return { async getAccessToken(scope) {
		if (scope.includes("graph.microsoft.com")) {
			const token = await app.getAppGraphToken();
			return token ? String(token) : "";
		}
		const token = await app.getBotToken();
		return token ? String(token) : "";
	} };
}
function createBotTokenGetter(app) {
	return async () => {
		const token = await app.getBotToken();
		return token ? String(token) : void 0;
	};
}
function createApiClient(sdk, serviceUrl, getToken) {
	return new sdk.Client(serviceUrl, {
		token: async () => await getToken() || void 0,
		headers: { "User-Agent": buildUserAgent() }
	});
}
function normalizeOutboundActivity(textOrActivity) {
	return typeof textOrActivity === "string" ? {
		type: "message",
		text: textOrActivity
	} : textOrActivity;
}
function createSendContext(params) {
	const apiClient = params.serviceUrl && params.conversationId ? createApiClient(params.sdk, params.serviceUrl, params.getToken) : void 0;
	return {
		async sendActivity(textOrActivity) {
			const msg = normalizeOutboundActivity(textOrActivity);
			if (params.treatInvokeResponseAsNoop && msg.type === "invokeResponse") return { id: "invokeResponse" };
			if (!apiClient || !params.conversationId) return { id: "unknown" };
			const existingChannelData = msg.channelData && typeof msg.channelData === "object" ? msg.channelData : void 0;
			const channelData = params.tenantId ? {
				...existingChannelData,
				tenant: { id: params.tenantId }
			} : existingChannelData;
			return await apiClient.conversations.activities(params.conversationId).create({
				type: "message",
				...msg,
				...channelData ? { channelData } : {},
				from: params.bot?.id ? {
					id: params.bot.id,
					name: params.bot.name ?? "",
					role: "bot"
				} : void 0,
				conversation: {
					id: params.conversationId,
					conversationType: params.conversationType ?? "personal",
					...params.tenantId ? { tenantId: params.tenantId } : {}
				},
				...params.recipientId || params.recipientAadObjectId ? { recipient: {
					...params.recipientId ? { id: params.recipientId } : {},
					...params.recipientAadObjectId ? { aadObjectId: params.recipientAadObjectId } : {}
				} } : {},
				...params.replyToActivityId && !msg.replyToId ? { replyToId: params.replyToActivityId } : {}
			});
		},
		async updateActivity(activityUpdate) {
			const nextActivity = activityUpdate;
			const activityId = nextActivity.id;
			if (!activityId) throw new Error("updateActivity requires an activity id");
			if (!params.serviceUrl || !params.conversationId) return { id: "unknown" };
			return await updateActivityViaRest({
				serviceUrl: params.serviceUrl,
				conversationId: params.conversationId,
				activityId,
				activity: nextActivity,
				token: await params.getToken()
			});
		},
		async deleteActivity(activityId) {
			if (!activityId) throw new Error("deleteActivity requires an activity id");
			if (!params.serviceUrl || !params.conversationId) return;
			await deleteActivityViaRest({
				serviceUrl: params.serviceUrl,
				conversationId: params.conversationId,
				activityId,
				token: await params.getToken()
			});
		}
	};
}
function createProcessContext(params) {
	const serviceUrl = params.activity?.serviceUrl;
	const conversationId = (params.activity?.conversation)?.id;
	const conversationType = (params.activity?.conversation)?.conversationType;
	const replyToActivityId = params.activity?.id;
	const bot = params.activity?.recipient && typeof params.activity.recipient === "object" ? {
		id: params.activity.recipient.id,
		name: params.activity.recipient.name
	} : void 0;
	const sendContext = createSendContext({
		sdk: params.sdk,
		serviceUrl,
		conversationId,
		conversationType,
		bot,
		replyToActivityId,
		getToken: params.getToken,
		treatInvokeResponseAsNoop: true
	});
	return {
		activity: params.activity,
		...sendContext,
		async sendActivities(activities) {
			const results = [];
			for (const activity of activities) results.push(await sendContext.sendActivity(activity));
			return results;
		}
	};
}
/**
* Update an existing activity via the Bot Framework REST API.
* PUT /v3/conversations/{conversationId}/activities/{activityId}
*/
async function updateActivityViaRest(params) {
	const { serviceUrl, conversationId, activityId, activity, token } = params;
	const url = `${serviceUrl.replace(/\/+$/, "")}/v3/conversations/${encodeURIComponent(conversationId)}/activities/${encodeURIComponent(activityId)}`;
	const headers = {
		"Content-Type": "application/json",
		"User-Agent": buildUserAgent()
	};
	if (token) headers.Authorization = `Bearer ${token}`;
	const currentFetch = globalThis.fetch;
	const { response, release } = await fetchWithSsrFGuard({
		url,
		fetchImpl: async (input, guardedInit) => await currentFetch(input, guardedInit),
		init: {
			method: "PUT",
			headers,
			body: JSON.stringify({
				type: "message",
				...activity,
				id: activityId
			})
		},
		auditContext: "msteams-update-activity"
	});
	try {
		if (!response.ok) {
			const body = await response.text().catch(() => "");
			throw Object.assign(/* @__PURE__ */ new Error(`updateActivity failed: HTTP ${response.status} ${body}`), { statusCode: response.status });
		}
		return await response.json().catch(() => ({ id: activityId }));
	} finally {
		await release();
	}
}
/**
* Delete an existing activity via the Bot Framework REST API.
* DELETE /v3/conversations/{conversationId}/activities/{activityId}
*/
async function deleteActivityViaRest(params) {
	const { serviceUrl, conversationId, activityId, token } = params;
	const url = `${serviceUrl.replace(/\/+$/, "")}/v3/conversations/${encodeURIComponent(conversationId)}/activities/${encodeURIComponent(activityId)}`;
	const headers = { "User-Agent": buildUserAgent() };
	if (token) headers.Authorization = `Bearer ${token}`;
	const currentFetch = globalThis.fetch;
	const { response, release } = await fetchWithSsrFGuard({
		url,
		fetchImpl: async (input, guardedInit) => await currentFetch(input, guardedInit),
		init: {
			method: "DELETE",
			headers
		},
		auditContext: "msteams-delete-activity"
	});
	try {
		if (!response.ok) {
			const body = await response.text().catch(() => "");
			throw Object.assign(/* @__PURE__ */ new Error(`deleteActivity failed: HTTP ${response.status} ${body}`), { statusCode: response.status });
		}
	} finally {
		await release();
	}
}
/**
* Build a CloudAdapter-compatible adapter using the Teams SDK REST client.
*
* This replaces the previous CloudAdapter from @microsoft/agents-hosting.
* For incoming requests: the App's HTTP server handles JWT validation.
* For proactive sends: uses the Bot Framework REST API via
* @microsoft/teams.api Client.
*/
function createMSTeamsAdapter(app, sdk) {
	return {
		async continueConversation(_appId, reference, logic) {
			const serviceUrl = reference.serviceUrl;
			if (!serviceUrl) throw new Error("Missing serviceUrl in conversation reference");
			const conversationId = reference.conversation?.id;
			if (!conversationId) throw new Error("Missing conversation.id in conversation reference");
			const tenantId = reference.tenantId ?? reference.conversation?.tenantId;
			const recipientAadObjectId = reference.aadObjectId ?? reference.user?.aadObjectId;
			const recipientId = reference.user?.id;
			await logic(createSendContext({
				sdk,
				serviceUrl,
				conversationId,
				conversationType: reference.conversation?.conversationType,
				bot: reference.agent ?? void 0,
				getToken: createBotTokenGetter(app),
				tenantId,
				recipientId,
				recipientAadObjectId
			}));
		},
		async process(req, res, logic) {
			const request = req;
			const response = res;
			const activity = request.body;
			const isInvoke = activity?.type === "invoke";
			try {
				const context = createProcessContext({
					sdk,
					activity,
					getToken: createBotTokenGetter(app)
				});
				if (isInvoke) response.status(200).send();
				await logic(context);
				if (!isInvoke) response.status(200).send();
			} catch (err) {
				if (!isInvoke) response.status(500).send({ error: formatUnknownError(err) });
			}
		},
		async updateActivity(_context, _activity) {},
		async deleteActivity(_context, _reference) {}
	};
}
async function loadMSTeamsSdkWithAuth(creds) {
	const sdk = await loadMSTeamsSdk();
	return {
		sdk,
		app: await createMSTeamsApp(creds, sdk)
	};
}
/**
* Bot Framework issuer → JWKS mapping.
* During Microsoft's transition, inbound service tokens can be signed by either
* the legacy Bot Framework issuer or the Entra issuer. Each gets its own JWKS
* endpoint so we verify signatures with the correct key set.
*/
const BOT_FRAMEWORK_ISSUERS = [
	{
		issuer: "https://api.botframework.com",
		jwksUri: "https://login.botframework.com/v1/.well-known/keys"
	},
	{
		issuer: (tenantId) => `https://login.microsoftonline.com/${tenantId}/v2.0`,
		jwksUri: "https://login.microsoftonline.com/common/discovery/v2.0/keys"
	},
	{
		issuer: (tenantId) => `https://sts.windows.net/${tenantId}/`,
		jwksUri: "https://login.microsoftonline.com/common/discovery/v2.0/keys"
	}
];
/**
* Create a Bot Framework JWT validator using jsonwebtoken + jwks-rsa directly.
*
* The @microsoft/teams.apps JwtValidator hardcodes audience to [clientId, api://clientId],
* which rejects valid Bot Framework tokens that carry aud: "https://api.botframework.com".
* This implementation uses jsonwebtoken directly with the correct audience list, matching
* the behavior of the legacy @microsoft/agents-hosting authorizeJWT middleware.
*
* Security invariants:
* - signature verification via issuer-specific JWKS endpoints
* - audience validation: appId, api://appId, and https://api.botframework.com
* - issuer validation: strict allowlist (Bot Framework + tenant-scoped Entra)
* - expiration validation with 5-minute clock tolerance
*/
async function createBotFrameworkJwtValidator(creds) {
	const jwt = await import("./jsonwebtoken-DThqj21b.js").then((m) => /* @__PURE__ */ __toESM(m.default, 1));
	const { JwksClient } = await import("./src-BiYkOlyC.js").then((m) => /* @__PURE__ */ __toESM(m.default, 1));
	const allowedAudiences = [
		creds.appId,
		`api://${creds.appId}`,
		"https://api.botframework.com"
	];
	const allowedIssuers = BOT_FRAMEWORK_ISSUERS.map((entry) => typeof entry.issuer === "function" ? entry.issuer(creds.tenantId) : entry.issuer);
	const jwksClients = /* @__PURE__ */ new Map();
	function getJwksClient(uri) {
		let client = jwksClients.get(uri);
		if (!client) {
			client = new JwksClient({
				jwksUri: uri,
				cache: true,
				cacheMaxAge: 6e5,
				rateLimit: true
			});
			jwksClients.set(uri, client);
		}
		return client;
	}
	/** Decode the token header without verification to determine the kid. */
	function decodeHeader(token) {
		const decoded = jwt.decode(token, { complete: true });
		return decoded && typeof decoded === "object" ? decoded.header : null;
	}
	/** Resolve the issuer entry for a token's issuer claim (pre-verification). */
	function resolveIssuerEntry(issuerClaim) {
		if (!issuerClaim) return;
		return BOT_FRAMEWORK_ISSUERS.find((entry) => {
			return (typeof entry.issuer === "function" ? entry.issuer(creds.tenantId) : entry.issuer) === issuerClaim;
		});
	}
	return { async validate(authHeader, _serviceUrl) {
		const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
		if (!token) return false;
		const header = decodeHeader(token);
		const unverifiedPayload = jwt.decode(token);
		if (!header?.kid || !unverifiedPayload?.iss) return false;
		const issuerEntry = resolveIssuerEntry(unverifiedPayload.iss);
		if (!issuerEntry) return false;
		const client = getJwksClient(issuerEntry.jwksUri);
		try {
			const publicKey = (await client.getSigningKey(header.kid)).getPublicKey();
			jwt.verify(token, publicKey, {
				audience: allowedAudiences,
				issuer: allowedIssuers,
				algorithms: ["RS256"],
				clockTolerance: 300
			});
			return true;
		} catch {
			return false;
		}
	} };
}
//#endregion
//#region extensions/msteams/src/token-response.ts
function readAccessToken(value) {
	if (typeof value === "string") return value;
	if (value && typeof value === "object") {
		const token = value.accessToken ?? value.token;
		return typeof token === "string" ? token : null;
	}
	return null;
}
//#endregion
//#region extensions/msteams/src/graph.ts
const GRAPH_BETA = "https://graph.microsoft.com/beta";
function normalizeQuery(value) {
	return value?.trim() ?? "";
}
function escapeOData(value) {
	return value.replace(/'/g, "''");
}
async function requestGraph(params) {
	const hasBody = params.body !== void 0;
	const res = await fetch(`${params.root ?? "https://graph.microsoft.com/v1.0"}${params.path}`, {
		method: params.method,
		headers: {
			"User-Agent": buildUserAgent(),
			Authorization: `Bearer ${params.token}`,
			...hasBody ? { "Content-Type": "application/json" } : {},
			...params.headers
		},
		body: hasBody ? JSON.stringify(params.body) : void 0
	});
	if (!res.ok) {
		const text = await res.text().catch(() => "");
		throw new Error(`${params.errorPrefix ?? "Graph"} ${params.path} failed (${res.status}): ${text || "unknown error"}`);
	}
	return res;
}
async function readOptionalGraphJson(res) {
	if (res.status === 204 || res.headers?.get?.("content-length") === "0") return;
	return await res.json();
}
async function fetchGraphJson(params) {
	return await readOptionalGraphJson(await requestGraph({
		token: params.token,
		path: params.path,
		method: params.method,
		body: params.body,
		headers: params.headers
	}));
}
/**
* Fetch JSON from an absolute Graph API URL (for example @odata.nextLink
* pagination URLs) without prepending GRAPH_ROOT.
*/
async function fetchGraphAbsoluteUrl(params) {
	const { response, release } = await fetchWithSsrFGuard({
		url: params.url,
		init: { headers: {
			"User-Agent": buildUserAgent(),
			Authorization: `Bearer ${params.token}`,
			...params.headers
		} },
		auditContext: "msteams.graph.absolute"
	});
	try {
		if (!response.ok) {
			const text = await response.text().catch(() => "");
			throw new Error(`Graph ${params.url} failed (${response.status}): ${text || "unknown error"}`);
		}
		return await response.json();
	} finally {
		await release();
	}
}
/**
* Fetch all pages of a Graph API collection, following @odata.nextLink.
* Optionally stop early when `findOne` matches an item.
*/
async function fetchAllGraphPages(params) {
	const maxPages = params.maxPages ?? 50;
	const items = [];
	let nextPath = params.path;
	for (let page = 0; page < maxPages && nextPath; page++) {
		const res = await fetchGraphJson({
			token: params.token,
			path: nextPath,
			headers: params.headers
		});
		const pageItems = res.value ?? [];
		if (params.findOne) {
			const match = pageItems.find(params.findOne);
			if (match) {
				items.push(...pageItems);
				return {
					items,
					truncated: false,
					found: match
				};
			}
		}
		items.push(...pageItems);
		const rawNext = res["@odata.nextLink"];
		if (rawNext) nextPath = rawNext.replace("https://graph.microsoft.com/v1.0", "").replace("https://graph.microsoft.com/beta", "");
		else nextPath = void 0;
	}
	return {
		items,
		truncated: Boolean(nextPath)
	};
}
async function resolveGraphToken(cfg, options) {
	const msteamsCfg = cfg?.channels?.msteams;
	const creds = resolveMSTeamsCredentials(msteamsCfg);
	if (!creds) throw new Error("MS Teams credentials missing");
	if (options?.preferDelegated && msteamsCfg?.delegatedAuth?.enabled && creds.type === "secret") {
		const { resolveDelegatedAccessToken } = await import("./token---oXt4Ni.js");
		const delegated = await resolveDelegatedAccessToken({
			tenantId: creds.tenantId,
			clientId: creds.appId,
			clientSecret: creds.appPassword
		});
		if (delegated) return delegated;
	}
	const { app } = await loadMSTeamsSdkWithAuth(creds);
	const accessToken = readAccessToken(await createMSTeamsTokenProvider(app).getAccessToken("https://graph.microsoft.com"));
	if (!accessToken) throw new Error("MS Teams graph token unavailable");
	return accessToken;
}
async function listTeamsByName(token, query) {
	const filter = `resourceProvisioningOptions/Any(x:x eq 'Team') and startsWith(displayName,'${escapeOData(query)}')`;
	const { items } = await fetchAllGraphPages({
		token,
		path: `/groups?$filter=${encodeURIComponent(filter)}&$select=id,displayName`,
		maxPages: 5
	});
	return items;
}
async function postGraphJson(params) {
	return readOptionalGraphJson(await requestGraph({
		token: params.token,
		path: params.path,
		method: "POST",
		body: params.body,
		errorPrefix: "Graph POST"
	}));
}
async function postGraphBetaJson(params) {
	return readOptionalGraphJson(await requestGraph({
		token: params.token,
		path: params.path,
		method: "POST",
		root: GRAPH_BETA,
		body: params.body,
		errorPrefix: "Graph beta POST"
	}));
}
async function deleteGraphRequest(params) {
	await requestGraph({
		token: params.token,
		path: params.path,
		method: "DELETE",
		errorPrefix: "Graph DELETE"
	});
}
async function patchGraphJson(params) {
	const res = await requestGraph({
		token: params.token,
		path: params.path,
		method: "PATCH",
		body: params.body,
		errorPrefix: "Graph PATCH"
	});
	if (res.status === 204 || res.headers.get("content-length") === "0") return;
	return await res.json();
}
async function listChannelsForTeam(token, teamId) {
	const { items } = await fetchAllGraphPages({
		token,
		path: `/teams/${encodeURIComponent(teamId)}/channels?$select=id,displayName`,
		maxPages: 10
	});
	return items;
}
//#endregion
//#region extensions/msteams/src/graph-users.ts
async function searchGraphUsers(params) {
	const query = params.query.trim();
	if (!query) return [];
	if (query.includes("@")) {
		const escaped = escapeOData(query);
		const filter = `(mail eq '${escaped}' or userPrincipalName eq '${escaped}')`;
		const path = `/users?$filter=${encodeURIComponent(filter)}&$select=id,displayName,mail,userPrincipalName`;
		return (await fetchGraphJson({
			token: params.token,
			path
		})).value ?? [];
	}
	const top = typeof params.top === "number" && params.top > 0 ? params.top : 10;
	const path = `/users?$search=${encodeURIComponent(`"displayName:${query}"`)}&$select=id,displayName,mail,userPrincipalName&$top=${top}`;
	return (await fetchGraphJson({
		token: params.token,
		path,
		headers: { ConsistencyLevel: "eventual" }
	})).value ?? [];
}
//#endregion
export { extractInlineImageCandidates as A, safeFetchWithPolicy as B, isRevokedProxyError as C, applyAuthorizationHeaderForUrl as D, IMG_SRC_RE as E, normalizeContentType as F, tryBuildGraphSharesUrlForSharedLink as H, readNestedString as I, resolveAttachmentFetchPolicy as L, isDownloadableAttachment as M, isLikelyImageAttachment as N, encodeGraphShareId as O, isUrlAllowed as P, resolveMediaSsrfPolicy as R, formatUnknownError as S, GRAPH_ROOT as T, safeHostForUrl as V, loadMSTeamsSdkWithAuth as _, fetchGraphJson as a, classifyMSTeamsSendError as b, normalizeQuery as c, postGraphJson as d, resolveGraphToken as f, createMSTeamsTokenProvider as g, createMSTeamsAdapter as h, fetchGraphAbsoluteUrl as i, inferPlaceholder as j, extractHtmlFromAttachment as k, patchGraphJson as l, createBotFrameworkJwtValidator as m, deleteGraphRequest as n, listChannelsForTeam as o, readAccessToken as p, escapeOData as r, listTeamsByName as s, searchGraphUsers as t, postGraphBetaJson as u, buildUserAgent as v, ATTACHMENT_TAG_RE as w, formatMSTeamsSendErrorHint as x, ensureUserAgentHeader as y, resolveRequestUrl as z };
