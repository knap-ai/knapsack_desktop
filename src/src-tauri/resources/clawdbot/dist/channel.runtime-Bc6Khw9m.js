import { i as formatErrorMessage } from "./errors-D8p6rxH8.js";
import { i as normalizeLowercaseStringOrEmpty, o as normalizeOptionalLowercaseString, r as lowercasePreservingWhitespace, s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { n as resolvePreferredOpenClawTmpDir } from "./tmp-openclaw-dir-eyAoWbVe.js";
import { _ as resolveStateDir } from "./paths-Dvv9VRAc.js";
import { l as normalizeSecretInputString } from "./types.secrets-CeL3gSMO.js";
import { r as logVerbose$1 } from "./globals-De6QTwLG.js";
import { t as safeEqualSecret } from "./secret-equal-DqrgJW5g.js";
import { _ as resolveRequestClientIp } from "./net-lBInRHnX.js";
import { u as resolveAgentIdFromSessionKey } from "./session-key-Bh1lMwK5.js";
import { t as resolveAckReaction } from "./identity-B_Q39IGW.js";
import { d as resolveOutboundMediaUrls, h as sendMediaWithLeadingCaption, m as resolveTextChunksWithFallback } from "./reply-payload-Db_8BQiX.js";
import "./temp-path-H6fpiZd0.js";
import { h as mapAllowFromEntries } from "./channel-config-helpers-9F9ZxFrZ.js";
import { i as resolveAgentRoute, n as deriveLastRoutePolicy } from "./resolve-route-ByaGTmFk.js";
import { n as writeJsonFileAtomically, t as readJsonFileWithFallback } from "./json-store-iQhnwImo.js";
import { r as getSessionBindingService } from "./session-binding-service-CP3mZirT.js";
import { r as stripMarkdown } from "./text-runtime-DTMxvodz.js";
import "./routing-BI8_fMua.js";
import { u as isPluginOwnedSessionBindingRecord } from "./conversation-binding-COoBmA8F.js";
import "./error-runtime-CgBDklBz.js";
import { n as resolveControlCommandGate } from "./command-gating-BJZZvAwg.js";
import "./channel-policy-G84s3mXs.js";
import { n as readStoreAllowFromForDmPolicy, o as resolveDmGroupAccessWithLists, t as DM_GROUP_ACCESS_REASON } from "./dm-policy-shared-B7IvP1oD.js";
import { c as evictOldHistoryKeys, u as recordPendingHistoryEntryIfEnabled } from "./history-BexnEA43.js";
import "./reply-history-DTh6o1-h.js";
import { n as logInboundDrop, r as logTypingFailure, t as logAckFailure } from "./logging-BRNZxone.js";
import { t as resolveChannelMediaMaxBytes } from "./media-limits-CdCXl04b.js";
import { t as createChannelReplyPipeline } from "./channel-reply-pipeline-DHFpjrzi.js";
import { n as createChannelPairingController } from "./channel-pairing-DMzs787S.js";
import { a as createFixedWindowRateLimiter, r as WEBHOOK_RATE_LIMIT_DEFAULTS } from "./webhook-memory-guards-xdWNBMxB.js";
import { a as createWebhookInFlightLimiter, c as readWebhookBodyOrReject } from "./webhook-request-guards-Df6jC-7E.js";
import { t as normalizeWebhookPath } from "./webhook-path-K1OULEo3.js";
import { l as withResolvedWebhookRequestPipeline, n as registerWebhookTargetWithPluginRoute, s as resolveWebhookTargetWithAuthOrRejectSync } from "./webhook-targets-CBZjdIw_.js";
import "./webhook-ingress-KrGlV9-3.js";
import "./runtime-env-DjtBb0Ku.js";
import { t as evaluateSupplementalContextVisibility } from "./context-visibility-XeuKjN99.js";
import { t as resolveChannelContextVisibilityMode } from "./context-visibility-DVYjNFN8.js";
import "./config-runtime-Bh8MKSv2.js";
import { o as isPrivateNetworkOptInEnabled } from "./ssrf-policy-CChtVzhj.js";
import "./ssrf-runtime-CmuKDV7X.js";
import "./media-runtime-M1ED8IU3.js";
import { n as resolveConfiguredBindingRoute } from "./binding-routing-DXUukGe4.js";
import "./conversation-runtime-Hy4b3Yhq.js";
import "./security-runtime-BqMUUdkX.js";
import "./browser-security-runtime-DCYxvSMK.js";
import "./command-auth-Da7bqm4r.js";
import "./channel-feedback-CM4YbZWs.js";
import "./channel-inbound-CiISPL9O.js";
import { t as createClaimableDedupe } from "./persistent-dedupe-gfdFuXzT.js";
import "./state-paths-D3bTP6X_.js";
import { A as resolveBlueBubblesAccount, C as fetchBlueBubblesServerInfo, F as buildBlueBubblesApiUrl, O as probeBlueBubbles, P as blueBubblesFetchWithTimeout, T as isBlueBubblesPrivateApiEnabled, a as formatGroupMembers, c as normalizeWebhookMessage, d as resolveGroupFlagFromChatGuid, f as resolveTapbackContext, g as isAllowedBlueBubblesSender, i as formatGroupAllowlistEntry, j as resolveBlueBubblesEffectiveAllowPrivateNetwork, l as normalizeWebhookReaction, m as formatBlueBubblesChatTarget, n as buildMessagePlaceholder, o as formatReplyTag, p as extractHandleFromChatGuid, s as normalizeParticipantList, t as asRecord, u as parseTapbackText, y as normalizeBlueBubblesHandle } from "./monitor-normalize-DJXrKC82.js";
import "./secret-input-DwXeRlOM.js";
import { n as resolveWebhookPathFromConfig, o as resolveBlueBubblesInboundConversationId } from "./webhook-shared-CgeXNqcg.js";
import { t as getBlueBubblesRuntime } from "./runtime-l4s3_WYf.js";
import { _ as fetchBlueBubblesMessageAttachments, a as resolveBlueBubblesMessageId, b as sendMessageBlueBubbles, g as downloadBlueBubblesAttachment, i as rememberBlueBubblesReplyCache, n as sendBlueBubblesReaction, o as resolveReplyContextFromCache, p as sendBlueBubblesTyping, r as getShortIdForUuid, t as normalizeBlueBubblesReactionInput, u as markBlueBubblesChatRead, v as sendBlueBubblesAttachment, x as resolveBlueBubblesServerAccount, y as resolveChatGuidForTarget } from "./reactions-B15fnLGg.js";
import { URL as URL$1, fileURLToPath } from "node:url";
import fs, { constants } from "node:fs";
import path, { join } from "node:path";
import { execFile } from "node:child_process";
import os from "node:os";
import fs$1, { access, readdir } from "node:fs/promises";
import { promisify } from "node:util";
import { createHash } from "node:crypto";
//#region extensions/bluebubbles/src/local-file-access.ts
function isLocalFileUrlHost(hostname) {
	const normalized = normalizeLowercaseStringOrEmpty(hostname);
	return normalized === "" || normalized === "localhost";
}
function assertNoWindowsNetworkPath(filePath, label = "Path") {
	if (process.platform !== "win32") return;
	const normalized = filePath.replace(/\//g, "\\");
	if (normalized.startsWith("\\\\?\\UNC\\") || normalized.startsWith("\\\\")) throw new Error(`${label} cannot use Windows network paths: ${filePath}`);
}
function safeFileURLToPath(fileUrl) {
	let parsed;
	try {
		parsed = new URL$1(fileUrl);
	} catch {
		throw new Error(`Invalid file:// URL: ${fileUrl}`);
	}
	if (parsed.protocol !== "file:") throw new Error(`Invalid file:// URL: ${fileUrl}`);
	if (!isLocalFileUrlHost(parsed.hostname)) throw new Error(`file:// URLs with remote hosts are not allowed: ${fileUrl}`);
	const filePath = fileURLToPath(parsed);
	assertNoWindowsNetworkPath(filePath, "Local file URL");
	return filePath;
}
function trySafeFileURLToPath(fileUrl) {
	try {
		return safeFileURLToPath(fileUrl);
	} catch {
		return;
	}
}
function basenameFromMediaSource(source) {
	if (!source) return;
	if (source.startsWith("file://")) {
		const filePath = trySafeFileURLToPath(source);
		return filePath ? path.basename(filePath) || void 0 : void 0;
	}
	if (/^https?:\/\//i.test(source)) try {
		return path.basename(new URL$1(source).pathname) || void 0;
	} catch {
		return;
	}
	return path.basename(source) || void 0;
}
//#endregion
//#region extensions/bluebubbles/src/media-send.ts
const HTTP_URL_RE = /^https?:\/\//i;
const MB = 1024 * 1024;
function assertMediaWithinLimit(sizeBytes, maxBytes) {
	if (typeof maxBytes !== "number" || maxBytes <= 0) return;
	if (sizeBytes <= maxBytes) return;
	const maxLabel = (maxBytes / MB).toFixed(0);
	const sizeLabel = (sizeBytes / MB).toFixed(2);
	throw new Error(`Media exceeds ${maxLabel}MB limit (got ${sizeLabel}MB)`);
}
function resolveLocalMediaPath(source) {
	if (!source.startsWith("file://")) return source;
	try {
		return safeFileURLToPath(source);
	} catch {
		throw new Error(`Invalid file:// URL: ${source}`);
	}
}
function expandHomePath(input) {
	if (input === "~") return os.homedir();
	if (input.startsWith("~/") || input.startsWith(`~${path.sep}`)) return path.join(os.homedir(), input.slice(2));
	return input;
}
function resolveConfiguredPath(input) {
	const trimmed = input.trim();
	if (!trimmed) throw new Error("Empty mediaLocalRoots entry is not allowed");
	if (trimmed.startsWith("file://")) try {
		return safeFileURLToPath(trimmed);
	} catch {
		throw new Error(`Invalid file:// URL in mediaLocalRoots: ${input}`);
	}
	const resolved = expandHomePath(trimmed);
	if (!path.isAbsolute(resolved)) throw new Error(`mediaLocalRoots entries must be absolute paths: ${input}`);
	return resolved;
}
function isPathInsideRoot(candidate, root) {
	const normalizedCandidate = path.normalize(candidate);
	const normalizedRoot = path.normalize(root);
	const rootWithSep = normalizedRoot.endsWith(path.sep) ? normalizedRoot : normalizedRoot + path.sep;
	if (process.platform === "win32") {
		const candidateLower = lowercasePreservingWhitespace(normalizedCandidate);
		const rootLower = lowercasePreservingWhitespace(normalizedRoot);
		const rootWithSepLower = lowercasePreservingWhitespace(rootWithSep);
		return candidateLower === rootLower || candidateLower.startsWith(rootWithSepLower);
	}
	return normalizedCandidate === normalizedRoot || normalizedCandidate.startsWith(rootWithSep);
}
function resolveMediaLocalRoots(params) {
	return (resolveBlueBubblesAccount({
		cfg: params.cfg,
		accountId: params.accountId
	}).config.mediaLocalRoots ?? []).map((entry) => entry.trim()).filter((entry) => entry.length > 0);
}
async function assertLocalMediaPathAllowed(params) {
	if (params.localRoots.length === 0) throw new Error(`Local BlueBubbles media paths are disabled by default. Set channels.bluebubbles.mediaLocalRoots${params.accountId ? ` or channels.bluebubbles.accounts.${params.accountId}.mediaLocalRoots` : ""} to explicitly allow local file directories.`);
	const resolvedLocalPath = path.resolve(params.localPath);
	const supportsNoFollow = process.platform !== "win32" && "O_NOFOLLOW" in constants;
	const openFlags = constants.O_RDONLY | (supportsNoFollow ? constants.O_NOFOLLOW : 0);
	for (const rootEntry of params.localRoots) {
		const resolvedRootInput = resolveConfiguredPath(rootEntry);
		const relativeToRoot = path.relative(resolvedRootInput, resolvedLocalPath);
		if (relativeToRoot.startsWith("..") || path.isAbsolute(relativeToRoot) || relativeToRoot === "") continue;
		let rootReal;
		try {
			rootReal = await fs$1.realpath(resolvedRootInput);
		} catch {
			rootReal = path.resolve(resolvedRootInput);
		}
		const candidatePath = path.resolve(rootReal, relativeToRoot);
		if (!isPathInsideRoot(candidatePath, rootReal)) continue;
		let handle = null;
		try {
			handle = await fs$1.open(candidatePath, openFlags);
			const realPath = await fs$1.realpath(candidatePath);
			if (!isPathInsideRoot(realPath, rootReal)) continue;
			const stat = await handle.stat();
			if (!stat.isFile()) continue;
			const realStat = await fs$1.stat(realPath);
			if (stat.ino !== realStat.ino || stat.dev !== realStat.dev) continue;
			return {
				data: await handle.readFile(),
				realPath,
				sizeBytes: stat.size
			};
		} catch {
			continue;
		} finally {
			if (handle) await handle.close().catch(() => {});
		}
	}
	throw new Error(`Local media path is not under any configured mediaLocalRoots entry: ${params.localPath}`);
}
function resolveFilenameFromSource(source) {
	return basenameFromMediaSource(source);
}
async function sendBlueBubblesMedia(params) {
	const { cfg, to, mediaUrl, mediaPath, mediaBuffer, contentType, filename, caption, replyToId, accountId, asVoice } = params;
	const core = getBlueBubblesRuntime();
	const maxBytes = resolveChannelMediaMaxBytes({
		cfg,
		resolveChannelLimitMb: ({ cfg, accountId }) => (cfg.channels?.bluebubbles?.accounts?.[accountId])?.mediaMaxMb ?? cfg.channels?.bluebubbles?.mediaMaxMb,
		accountId
	});
	const mediaLocalRoots = resolveMediaLocalRoots({
		cfg,
		accountId
	});
	let buffer;
	let resolvedContentType = contentType ?? void 0;
	let resolvedFilename = filename ?? void 0;
	if (mediaBuffer) {
		assertMediaWithinLimit(mediaBuffer.byteLength, maxBytes);
		buffer = mediaBuffer;
		if (!resolvedContentType) {
			const hint = mediaPath ?? mediaUrl;
			resolvedContentType = await core.media.detectMime({
				buffer: Buffer.isBuffer(mediaBuffer) ? mediaBuffer : Buffer.from(mediaBuffer),
				filePath: hint
			}) ?? void 0;
		}
		if (!resolvedFilename) resolvedFilename = resolveFilenameFromSource(mediaPath ?? mediaUrl);
	} else {
		const source = mediaPath ?? mediaUrl;
		if (!source) throw new Error("BlueBubbles media delivery requires mediaUrl, mediaPath, or mediaBuffer.");
		if (HTTP_URL_RE.test(source)) {
			const fetched = await core.channel.media.fetchRemoteMedia({
				url: source,
				maxBytes: typeof maxBytes === "number" && maxBytes > 0 ? maxBytes : void 0
			});
			buffer = fetched.buffer;
			resolvedContentType = resolvedContentType ?? fetched.contentType ?? void 0;
			resolvedFilename = resolvedFilename ?? fetched.fileName;
		} else {
			const localFile = await assertLocalMediaPathAllowed({
				localPath: expandHomePath(resolveLocalMediaPath(source)),
				localRoots: mediaLocalRoots,
				accountId
			});
			if (typeof maxBytes === "number" && maxBytes > 0) assertMediaWithinLimit(localFile.sizeBytes, maxBytes);
			const data = localFile.data;
			assertMediaWithinLimit(data.byteLength, maxBytes);
			buffer = new Uint8Array(data);
			if (!resolvedContentType) resolvedContentType = await core.media.detectMime({
				buffer: data,
				filePath: localFile.realPath
			}) ?? void 0;
			if (!resolvedFilename) resolvedFilename = resolveFilenameFromSource(localFile.realPath);
		}
	}
	const replyToMessageGuid = replyToId?.trim() ? resolveBlueBubblesMessageId(replyToId.trim(), { requireKnownShortId: true }) : void 0;
	const attachmentResult = await sendBlueBubblesAttachment({
		to,
		buffer,
		filename: resolvedFilename ?? "attachment",
		contentType: resolvedContentType ?? void 0,
		replyToMessageGuid,
		asVoice,
		opts: {
			cfg,
			accountId
		}
	});
	const trimmedCaption = caption?.trim();
	if (trimmedCaption) await sendMessageBlueBubbles(to, trimmedCaption, {
		cfg,
		accountId,
		replyToMessageGuid
	});
	return attachmentResult;
}
//#endregion
//#region extensions/bluebubbles/src/inbound-dedupe.ts
const DEDUP_TTL_MS = 10080 * 60 * 1e3;
const MEMORY_MAX_SIZE = 5e3;
const FILE_MAX_ENTRIES = 5e4;
const MAX_GUID_CHARS = 512;
function resolveStateDirFromEnv$1(env = process.env) {
	if (env.VITEST || env.NODE_ENV === "test") {
		const name = "openclaw-vitest-" + process.pid;
		return path.join(resolvePreferredOpenClawTmpDir(), name);
	}
	return resolveStateDir(env);
}
function resolveLegacyNamespaceFilePath(namespace) {
	const safe = namespace.replace(/[^a-zA-Z0-9_-]/g, "_") || "global";
	return path.join(resolveStateDirFromEnv$1(), "bluebubbles", "inbound-dedupe", `${safe}.json`);
}
function resolveNamespaceFilePath(namespace) {
	const safePrefix = namespace.replace(/[^a-zA-Z0-9_-]/g, "_") || "ns";
	const hash = createHash("sha256").update(namespace, "utf8").digest("hex").slice(0, 12);
	const dir = path.join(resolveStateDirFromEnv$1(), "bluebubbles", "inbound-dedupe");
	const newPath = path.join(dir, `${safePrefix}__${hash}.json`);
	migrateLegacyDedupeFile(namespace, newPath);
	return newPath;
}
const migratedNamespaces = /* @__PURE__ */ new Set();
function migrateLegacyDedupeFile(namespace, newPath) {
	if (migratedNamespaces.has(namespace)) return;
	migratedNamespaces.add(namespace);
	try {
		const legacyPath = resolveLegacyNamespaceFilePath(namespace);
		if (legacyPath === newPath) return;
		if (!fs.existsSync(legacyPath)) return;
		if (!fs.existsSync(newPath)) fs.renameSync(legacyPath, newPath);
		else fs.unlinkSync(legacyPath);
	} catch {}
}
function buildPersistentImpl() {
	return createClaimableDedupe({
		ttlMs: DEDUP_TTL_MS,
		memoryMaxSize: MEMORY_MAX_SIZE,
		fileMaxEntries: FILE_MAX_ENTRIES,
		resolveFilePath: resolveNamespaceFilePath
	});
}
let impl = buildPersistentImpl();
function sanitizeGuid(guid) {
	const trimmed = guid?.trim();
	if (!trimmed) return null;
	if (trimmed.length > MAX_GUID_CHARS) return null;
	return trimmed;
}
/**
* Resolve the canonical dedupe key for a BlueBubbles inbound message.
*
* Mirrors `monitor-debounce.ts`'s `buildKey`: BlueBubbles sends URL-preview
* / sticker "balloon" events with a different `messageId` than the text
* message they belong to, and the debouncer coalesces the two only when
* both `balloonBundleId` AND `associatedMessageGuid` are present. We gate
* on the same pair so that regular replies — which also set
* `associatedMessageGuid` (pointing at the parent message) but have no
* `balloonBundleId` — are NOT collapsed onto their parent's dedupe key.
*
* Known tradeoff: `combineDebounceEntries` clears `balloonBundleId` on
* merged entries while keeping `associatedMessageGuid`, so a post-merge
* balloon+text message here will fall back to its `messageId`. A later
* MessagePoller replay that arrives in a different text-first/balloon-first
* order could therefore produce a different `messageId` at merge time and
* bypass this dedupe for that one message. That edge case is strictly
* narrower than the alternative — which would dedupe every distinct user
* reply against the same parent GUID and silently drop real messages.
*/
function resolveBlueBubblesInboundDedupeKey(message) {
	const balloonBundleId = message.balloonBundleId?.trim();
	const associatedMessageGuid = message.associatedMessageGuid?.trim();
	let base;
	if (balloonBundleId && associatedMessageGuid) base = associatedMessageGuid;
	else base = message.messageId?.trim() || void 0;
	if (!base) return;
	if (message.eventType === "updated-message") return `${base}:updated`;
	return base;
}
/**
* Attempt to claim an inbound BlueBubbles message GUID.
*
* - `claimed`: caller should process the message, then call `finalize()` on
*   success (persists the GUID) or `release()` on failure (lets a later
*   replay try again).
* - `duplicate`: we've already committed this GUID; caller should drop.
* - `inflight`: another claim is currently in progress; caller should drop
*   rather than race.
* - `skip`: GUID was missing or invalid — caller should continue processing
*   without dedup (no finalize/release needed).
*/
async function claimBlueBubblesInboundMessage(params) {
	const normalized = sanitizeGuid(params.guid);
	if (!normalized) return { kind: "skip" };
	const claim = await impl.claim(normalized, {
		namespace: params.accountId,
		onDiskError: params.onDiskError
	});
	if (claim.kind === "duplicate") return { kind: "duplicate" };
	if (claim.kind === "inflight") return { kind: "inflight" };
	return {
		kind: "claimed",
		finalize: async () => {
			await impl.commit(normalized, {
				namespace: params.accountId,
				onDiskError: params.onDiskError
			});
		},
		release: () => {
			impl.release(normalized, { namespace: params.accountId });
		}
	};
}
/**
* Ensure the legacy→hashed dedupe file migration runs and the on-disk
* store is warmed into memory for the given account. Call before any
* catchup replay so already-handled GUIDs are recognized even when the
* file-naming convention changed between versions.
*/
async function warmupBlueBubblesInboundDedupe(accountId) {
	resolveNamespaceFilePath(accountId);
	await impl.warmup(accountId);
}
//#endregion
//#region extensions/bluebubbles/src/conversation-route.ts
function resolveBlueBubblesConversationRoute(params) {
	let route = resolveAgentRoute({
		cfg: params.cfg,
		channel: "bluebubbles",
		accountId: params.accountId,
		peer: {
			kind: params.isGroup ? "group" : "direct",
			id: params.peerId
		}
	});
	const conversationId = resolveBlueBubblesInboundConversationId({
		isGroup: params.isGroup,
		sender: params.sender,
		chatId: params.chatId,
		chatGuid: params.chatGuid,
		chatIdentifier: params.chatIdentifier
	});
	if (!conversationId) return route;
	route = resolveConfiguredBindingRoute({
		cfg: params.cfg,
		route,
		conversation: {
			channel: "bluebubbles",
			accountId: params.accountId,
			conversationId
		}
	}).route;
	const runtimeBinding = getSessionBindingService().resolveByConversation({
		channel: "bluebubbles",
		accountId: params.accountId,
		conversationId
	});
	const boundSessionKey = runtimeBinding?.targetSessionKey?.trim();
	if (!runtimeBinding || !boundSessionKey) return route;
	getSessionBindingService().touch(runtimeBinding.bindingId);
	if (isPluginOwnedSessionBindingRecord(runtimeBinding)) {
		logVerbose$1(`bluebubbles: plugin-bound conversation ${conversationId}`);
		return route;
	}
	logVerbose$1(`bluebubbles: routed via bound conversation ${conversationId} -> ${boundSessionKey}`);
	return {
		...route,
		sessionKey: boundSessionKey,
		agentId: resolveAgentIdFromSessionKey(boundSessionKey),
		lastRoutePolicy: deriveLastRoutePolicy({
			sessionKey: boundSessionKey,
			mainSessionKey: route.mainSessionKey
		}),
		matchedBy: "binding.channel"
	};
}
//#endregion
//#region extensions/bluebubbles/src/history.ts
function resolveAccount(params) {
	return resolveBlueBubblesServerAccount(params);
}
const MAX_HISTORY_FETCH_LIMIT = 100;
const HISTORY_SCAN_MULTIPLIER = 8;
const MAX_HISTORY_SCAN_MESSAGES = 500;
const MAX_HISTORY_BODY_CHARS = 2e3;
function clampHistoryLimit(limit) {
	if (!Number.isFinite(limit)) return 0;
	const normalized = Math.floor(limit);
	if (normalized <= 0) return 0;
	return Math.min(normalized, MAX_HISTORY_FETCH_LIMIT);
}
function truncateHistoryBody$1(text) {
	if (text.length <= MAX_HISTORY_BODY_CHARS) return text;
	return `${text.slice(0, MAX_HISTORY_BODY_CHARS).trimEnd()}...`;
}
/**
* Fetch message history from BlueBubbles API for a specific chat.
* This provides the initial backfill for both group chats and DMs.
*/
async function fetchBlueBubblesHistory(chatIdentifier, limit, opts = {}) {
	const effectiveLimit = clampHistoryLimit(limit);
	if (!chatIdentifier.trim() || effectiveLimit <= 0) return {
		entries: [],
		resolved: true
	};
	let baseUrl;
	let password;
	let allowPrivateNetwork = false;
	try {
		({baseUrl, password, allowPrivateNetwork} = resolveAccount(opts));
	} catch {
		return {
			entries: [],
			resolved: false
		};
	}
	const ssrfPolicy = allowPrivateNetwork ? { allowPrivateNetwork: true } : {};
	const possiblePaths = [
		`/api/v1/chat/${encodeURIComponent(chatIdentifier)}/messages?limit=${effectiveLimit}&sort=DESC`,
		`/api/v1/messages?chatGuid=${encodeURIComponent(chatIdentifier)}&limit=${effectiveLimit}`,
		`/api/v1/chat/${encodeURIComponent(chatIdentifier)}/message?limit=${effectiveLimit}`
	];
	for (const path of possiblePaths) try {
		const res = await blueBubblesFetchWithTimeout(buildBlueBubblesApiUrl({
			baseUrl,
			path,
			password
		}), { method: "GET" }, opts.timeoutMs ?? 1e4, ssrfPolicy);
		if (!res.ok) continue;
		const data = await res.json().catch(() => null);
		if (!data) continue;
		let messages = [];
		if (Array.isArray(data)) messages = data;
		else if (data.data && Array.isArray(data.data)) messages = data.data;
		else if (data.messages && Array.isArray(data.messages)) messages = data.messages;
		else continue;
		const historyEntries = [];
		const maxScannedMessages = Math.min(Math.max(effectiveLimit * HISTORY_SCAN_MULTIPLIER, effectiveLimit), MAX_HISTORY_SCAN_MESSAGES);
		for (let i = 0; i < messages.length && i < maxScannedMessages; i++) {
			const msg = messages[i];
			const text = msg.text?.trim();
			if (!text) continue;
			const sender = msg.is_from_me ? "me" : msg.sender?.display_name || msg.sender?.address || msg.handle_id || "Unknown";
			const timestamp = msg.date_created || msg.date_delivered;
			historyEntries.push({
				sender,
				body: truncateHistoryBody$1(text),
				timestamp,
				messageId: msg.guid
			});
		}
		historyEntries.sort((a, b) => {
			return (a.timestamp || 0) - (b.timestamp || 0);
		});
		return {
			entries: historyEntries.slice(0, effectiveLimit),
			resolved: true
		};
	} catch {
		continue;
	}
	return {
		entries: [],
		resolved: false
	};
}
//#endregion
//#region extensions/bluebubbles/src/monitor-self-chat-cache.ts
const SELF_CHAT_TTL_MS = 1e4;
const MAX_SELF_CHAT_CACHE_ENTRIES = 512;
const CLEANUP_MIN_INTERVAL_MS = 1e3;
const MAX_SELF_CHAT_BODY_CHARS = 32768;
const cache = /* @__PURE__ */ new Map();
let lastCleanupAt = 0;
function normalizeBody(body) {
	if (!body) return null;
	const normalized = (body.length > MAX_SELF_CHAT_BODY_CHARS ? body.slice(0, MAX_SELF_CHAT_BODY_CHARS) : body).replace(/\r\n?/g, "\n").trim();
	return normalized ? normalized : null;
}
function isUsableTimestamp(timestamp) {
	return typeof timestamp === "number" && Number.isFinite(timestamp);
}
function digestText(text) {
	return createHash("sha256").update(text).digest("base64url");
}
function resolveCanonicalChatTarget(parts) {
	const handleFromGuid = parts.chatGuid ? extractHandleFromChatGuid(parts.chatGuid) : null;
	if (handleFromGuid) return handleFromGuid;
	const normalizedIdentifier = normalizeBlueBubblesHandle(parts.chatIdentifier ?? "");
	if (normalizedIdentifier) return normalizedIdentifier;
	return normalizeOptionalString(parts.chatGuid) ?? normalizeOptionalString(parts.chatIdentifier) ?? (typeof parts.chatId === "number" ? String(parts.chatId) : null);
}
function buildScope(parts) {
	const target = resolveCanonicalChatTarget(parts) ?? parts.senderId;
	return `${parts.accountId}:${target}`;
}
function cleanupExpired(now = Date.now()) {
	if (lastCleanupAt !== 0 && now >= lastCleanupAt && now - lastCleanupAt < CLEANUP_MIN_INTERVAL_MS) return;
	lastCleanupAt = now;
	for (const [key, seenAt] of cache.entries()) if (now - seenAt > SELF_CHAT_TTL_MS) cache.delete(key);
}
function enforceSizeCap() {
	while (cache.size > MAX_SELF_CHAT_CACHE_ENTRIES) {
		const oldestKey = cache.keys().next().value;
		if (typeof oldestKey !== "string") break;
		cache.delete(oldestKey);
	}
}
function buildKey(lookup) {
	const body = normalizeBody(lookup.body);
	if (!body || !isUsableTimestamp(lookup.timestamp)) return null;
	return `${buildScope(lookup)}:${lookup.timestamp}:${digestText(body)}`;
}
function rememberBlueBubblesSelfChatCopy(lookup) {
	cleanupExpired();
	const key = buildKey(lookup);
	if (!key) return;
	cache.set(key, Date.now());
	enforceSizeCap();
}
function hasBlueBubblesSelfChatCopy(lookup) {
	cleanupExpired();
	const key = buildKey(lookup);
	if (!key) return false;
	const seenAt = cache.get(key);
	return typeof seenAt === "number" && Date.now() - seenAt <= SELF_CHAT_TTL_MS;
}
//#endregion
//#region extensions/bluebubbles/src/participant-contact-names.ts
const execFileAsync = promisify(execFile);
const CONTACT_NAME_CACHE_TTL_MS = 3600 * 1e3;
const NEGATIVE_CONTACT_NAME_CACHE_TTL_MS = 300 * 1e3;
const MAX_PARTICIPANT_CONTACT_NAME_CACHE_ENTRIES = 2048;
const SQLITE_MAX_BUFFER = 8 * 1024 * 1024;
const SQLITE_PHONE_DIGITS_SQL = "REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(COALESCE(p.ZFULLNUMBER, ''), ' ', ''), '(', ''), ')', ''), '-', ''), '+', ''), '.', ''), '\n', ''), '\r', '')";
const participantContactNameCache = /* @__PURE__ */ new Map();
function normalizePhoneLookupKey(value) {
	const digits = value.replace(/\D/g, "");
	if (!digits) return null;
	const normalized = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
	return normalized.length >= 7 ? normalized : null;
}
function uniqueNormalizedPhoneLookupKeys(phoneKeys) {
	const unique = /* @__PURE__ */ new Set();
	for (const phoneKey of phoneKeys) {
		const normalized = normalizePhoneLookupKey(phoneKey);
		if (normalized) unique.add(normalized);
	}
	return [...unique];
}
function resolveParticipantPhoneLookupKey(participant) {
	if (participant.id.includes("@")) return null;
	return normalizePhoneLookupKey(participant.id);
}
function trimParticipantContactNameCache(now) {
	for (const [phoneKey, entry] of participantContactNameCache) if (entry.expiresAt <= now) participantContactNameCache.delete(phoneKey);
	while (participantContactNameCache.size > MAX_PARTICIPANT_CONTACT_NAME_CACHE_ENTRIES) {
		const oldestPhoneKey = participantContactNameCache.keys().next().value;
		if (!oldestPhoneKey) return;
		participantContactNameCache.delete(oldestPhoneKey);
	}
}
function readFreshCacheEntry(phoneKey, now) {
	const cached = participantContactNameCache.get(phoneKey);
	if (!cached) return null;
	if (cached.expiresAt <= now) {
		participantContactNameCache.delete(phoneKey);
		return null;
	}
	participantContactNameCache.delete(phoneKey);
	participantContactNameCache.set(phoneKey, cached);
	return cached;
}
function writeCacheEntry(phoneKey, name, now) {
	participantContactNameCache.delete(phoneKey);
	participantContactNameCache.set(phoneKey, {
		name,
		expiresAt: now + (name ? CONTACT_NAME_CACHE_TTL_MS : NEGATIVE_CONTACT_NAME_CACHE_TTL_MS)
	});
	trimParticipantContactNameCache(now);
}
function buildAddressBookSourcesDir(homeDir) {
	const trimmedHomeDir = homeDir?.trim();
	if (!trimmedHomeDir) return null;
	return join(trimmedHomeDir, "Library", "Application Support", "AddressBook", "Sources");
}
async function fileExists(path, deps) {
	try {
		await deps.access(path);
		return true;
	} catch {
		return false;
	}
}
async function listContactsDatabases(deps) {
	const sourcesDir = buildAddressBookSourcesDir(deps.homeDir);
	if (!sourcesDir) return [];
	let entries = [];
	try {
		entries = await deps.readdir(sourcesDir);
	} catch {
		return [];
	}
	const databases = [];
	for (const entry of entries) {
		const dbPath = join(sourcesDir, entry, "AddressBook-v22.abcddb");
		if (await fileExists(dbPath, deps)) databases.push(dbPath);
	}
	return databases;
}
function buildSqlitePhoneKeyList(phoneKeys) {
	return uniqueNormalizedPhoneLookupKeys(phoneKeys).map((phoneKey) => `'${phoneKey}'`).join(", ");
}
async function queryContactsDatabase(dbPath, phoneKeys, deps) {
	const sqlitePhoneKeyList = buildSqlitePhoneKeyList(phoneKeys);
	if (!sqlitePhoneKeyList) return [];
	const sql = `
SELECT digits, name
FROM (
  SELECT
    ${SQLITE_PHONE_DIGITS_SQL} AS digits,
    TRIM(
      CASE
        WHEN TRIM(COALESCE(r.ZFIRSTNAME, '') || ' ' || COALESCE(r.ZLASTNAME, '')) != ''
          THEN TRIM(COALESCE(r.ZFIRSTNAME, '') || ' ' || COALESCE(r.ZLASTNAME, ''))
        ELSE COALESCE(r.ZORGANIZATION, '')
      END
    ) AS name
  FROM ZABCDRECORD r
  JOIN ZABCDPHONENUMBER p ON p.ZOWNER = r.Z_PK
  WHERE p.ZFULLNUMBER IS NOT NULL
)
WHERE digits IN (${sqlitePhoneKeyList})
  AND name != '';
`;
	const options = {
		encoding: "utf8",
		maxBuffer: SQLITE_MAX_BUFFER
	};
	const { stdout } = await deps.execFileAsync("sqlite3", [
		"-separator",
		"	",
		dbPath,
		sql
	], options);
	const rows = [];
	for (const line of stdout.split(/\r?\n/)) {
		const trimmed = line.trim();
		if (!trimmed) continue;
		const [digitsRaw, ...nameParts] = trimmed.split("	");
		const phoneKey = normalizePhoneLookupKey(digitsRaw ?? "");
		const name = nameParts.join("	").trim();
		if (!phoneKey || !name) continue;
		rows.push({
			phoneKey,
			name
		});
	}
	return rows;
}
async function resolvePhoneNamesFromMacOsContacts(phoneKeys, deps) {
	const normalizedPhoneKeys = uniqueNormalizedPhoneLookupKeys(phoneKeys);
	if (normalizedPhoneKeys.length === 0) return /* @__PURE__ */ new Map();
	const databases = await listContactsDatabases(deps);
	if (databases.length === 0) return /* @__PURE__ */ new Map();
	const unresolved = new Set(normalizedPhoneKeys);
	const resolved = /* @__PURE__ */ new Map();
	for (const dbPath of databases) {
		let rows = [];
		try {
			rows = await queryContactsDatabase(dbPath, [...unresolved], deps);
		} catch {
			continue;
		}
		for (const row of rows) {
			if (!unresolved.has(row.phoneKey) || resolved.has(row.phoneKey)) continue;
			resolved.set(row.phoneKey, row.name);
			unresolved.delete(row.phoneKey);
			if (unresolved.size === 0) return resolved;
		}
	}
	return resolved;
}
function resolveLookupDeps(deps) {
	const merged = { ...deps };
	return {
		platform: merged.platform ?? process.platform,
		now: merged.now ?? (() => Date.now()),
		resolvePhoneNames: merged.resolvePhoneNames,
		homeDir: merged.homeDir ?? process.env.HOME,
		readdir: merged.readdir ?? readdir,
		access: merged.access ?? access,
		execFileAsync: merged.execFileAsync ?? execFileAsync
	};
}
async function enrichBlueBubblesParticipantsWithContactNames(participants, deps) {
	if (!Array.isArray(participants) || participants.length === 0) return [];
	const resolvedDeps = resolveLookupDeps(deps);
	const lookup = resolvedDeps.resolvePhoneNames ?? ((phoneKeys) => resolvePhoneNamesFromMacOsContacts(phoneKeys, resolvedDeps));
	if (!(Boolean(resolvedDeps.resolvePhoneNames) || resolvedDeps.platform === "darwin")) return participants;
	const nowMs = resolvedDeps.now();
	trimParticipantContactNameCache(nowMs);
	const pendingPhoneKeys = /* @__PURE__ */ new Set();
	const cachedNames = /* @__PURE__ */ new Map();
	for (const participant of participants) {
		if (participant.name?.trim()) continue;
		const phoneKey = resolveParticipantPhoneLookupKey(participant);
		if (!phoneKey) continue;
		const cached = readFreshCacheEntry(phoneKey, nowMs);
		if (cached?.name) {
			cachedNames.set(phoneKey, cached.name);
			continue;
		}
		if (!cached) pendingPhoneKeys.add(phoneKey);
	}
	if (pendingPhoneKeys.size > 0) try {
		const resolved = await lookup([...pendingPhoneKeys]);
		for (const phoneKey of pendingPhoneKeys) {
			const name = normalizeOptionalString(resolved.get(phoneKey));
			writeCacheEntry(phoneKey, name, nowMs);
			if (name) cachedNames.set(phoneKey, name);
		}
	} catch {
		return participants;
	}
	let didChange = false;
	const enriched = participants.map((participant) => {
		if (participant.name?.trim()) return participant;
		const phoneKey = resolveParticipantPhoneLookupKey(participant);
		if (!phoneKey) return participant;
		const name = cachedNames.get(phoneKey)?.trim();
		if (!name) return participant;
		didChange = true;
		return {
			...participant,
			name
		};
	});
	return didChange ? enriched : participants;
}
//#endregion
//#region extensions/bluebubbles/src/monitor-processing.ts
const DEFAULT_TEXT_LIMIT = 4e3;
const invalidAckReactions = /* @__PURE__ */ new Set();
const REPLY_DIRECTIVE_TAG_RE = /\[\[\s*(?:reply_to_current|reply_to\s*:\s*[^\]\n]+)\s*\]\]/gi;
const PENDING_OUTBOUND_MESSAGE_ID_TTL_MS = 120 * 1e3;
const pendingOutboundMessageIds = [];
let pendingOutboundMessageIdCounter = 0;
function normalizeSnippet(value) {
	return normalizeOptionalLowercaseString(stripMarkdown(value).replace(/\s+/g, " ")) ?? "";
}
function blueBubblesPolicy(allowPrivateNetwork) {
	return allowPrivateNetwork ? { allowPrivateNetwork: true } : void 0;
}
function extractBlueBubblesChatGuid(chat) {
	const candidates = [
		chat.chatGuid,
		chat.guid,
		chat.chat_guid
	];
	for (const candidate of candidates) if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
}
function extractBlueBubblesChatId(chat) {
	const candidates = [
		chat.chatId,
		chat.id,
		chat.chat_id
	];
	for (const candidate of candidates) if (typeof candidate === "number" && Number.isFinite(candidate)) return candidate;
}
function extractChatIdentifierFromChatGuid(chatGuid) {
	const parts = chatGuid.split(";");
	if (parts.length < 3) return;
	return parts[2]?.trim() || void 0;
}
function extractBlueBubblesChatIdentifier(chat) {
	const candidates = [
		chat.chatIdentifier,
		chat.chat_identifier,
		chat.identifier
	];
	for (const candidate of candidates) if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
	const chatGuid = extractBlueBubblesChatGuid(chat);
	return chatGuid ? extractChatIdentifierFromChatGuid(chatGuid) : void 0;
}
async function queryBlueBubblesChats(params) {
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
	}, params.timeoutMs, blueBubblesPolicy(params.allowPrivateNetwork));
	if (!res.ok) return [];
	const payload = await res.json().catch(() => null);
	const data = payload && typeof payload.data !== "undefined" ? payload.data : null;
	return Array.isArray(data) ? data : [];
}
async function fetchBlueBubblesParticipantsForInboundMessage(params) {
	if (!params.chatGuid && params.chatId == null && !params.chatIdentifier) return null;
	const limit = 500;
	for (let offset = 0; offset < 5e3; offset += limit) {
		const chats = await queryBlueBubblesChats({
			baseUrl: params.baseUrl,
			password: params.password,
			offset,
			limit,
			allowPrivateNetwork: params.allowPrivateNetwork
		});
		if (chats.length === 0) return null;
		for (const chat of chats) {
			const chatGuid = extractBlueBubblesChatGuid(chat);
			const chatId = extractBlueBubblesChatId(chat);
			const chatIdentifier = extractBlueBubblesChatIdentifier(chat);
			if (params.chatGuid && chatGuid === params.chatGuid || params.chatId != null && chatId === params.chatId || params.chatIdentifier && (chatIdentifier === params.chatIdentifier || chatGuid === params.chatIdentifier)) return normalizeParticipantList(chat);
		}
		if (chats.length < limit) return null;
	}
	return null;
}
function isBlueBubblesSelfChatMessage(message, isGroup) {
	if (isGroup || !message.senderIdExplicit) return false;
	const chatHandle = (message.chatGuid ? extractHandleFromChatGuid(message.chatGuid) : null) ?? normalizeBlueBubblesHandle(message.chatIdentifier ?? "");
	return Boolean(chatHandle) && chatHandle === message.senderId;
}
function prunePendingOutboundMessageIds(now = Date.now()) {
	const cutoff = now - PENDING_OUTBOUND_MESSAGE_ID_TTL_MS;
	for (let i = pendingOutboundMessageIds.length - 1; i >= 0; i--) if (pendingOutboundMessageIds[i].createdAt < cutoff) pendingOutboundMessageIds.splice(i, 1);
}
function rememberPendingOutboundMessageId(entry) {
	prunePendingOutboundMessageIds();
	pendingOutboundMessageIdCounter += 1;
	const snippetRaw = entry.snippet.trim();
	const snippetNorm = normalizeSnippet(snippetRaw);
	pendingOutboundMessageIds.push({
		id: pendingOutboundMessageIdCounter,
		accountId: entry.accountId,
		sessionKey: entry.sessionKey,
		outboundTarget: entry.outboundTarget,
		chatGuid: normalizeOptionalString(entry.chatGuid),
		chatIdentifier: normalizeOptionalString(entry.chatIdentifier),
		chatId: typeof entry.chatId === "number" ? entry.chatId : void 0,
		snippetRaw,
		snippetNorm,
		isMediaSnippet: normalizeLowercaseStringOrEmpty(snippetRaw).startsWith("<media:"),
		createdAt: Date.now()
	});
	return pendingOutboundMessageIdCounter;
}
function forgetPendingOutboundMessageId(id) {
	const index = pendingOutboundMessageIds.findIndex((entry) => entry.id === id);
	if (index >= 0) pendingOutboundMessageIds.splice(index, 1);
}
function chatsMatch(left, right) {
	const leftGuid = normalizeOptionalString(left.chatGuid);
	const rightGuid = normalizeOptionalString(right.chatGuid);
	if (leftGuid && rightGuid) return leftGuid === rightGuid;
	const leftIdentifier = normalizeOptionalString(left.chatIdentifier);
	const rightIdentifier = normalizeOptionalString(right.chatIdentifier);
	if (leftIdentifier && rightIdentifier) return leftIdentifier === rightIdentifier;
	const leftChatId = typeof left.chatId === "number" ? left.chatId : void 0;
	const rightChatId = typeof right.chatId === "number" ? right.chatId : void 0;
	if (leftChatId !== void 0 && rightChatId !== void 0) return leftChatId === rightChatId;
	return false;
}
function consumePendingOutboundMessageId(params) {
	prunePendingOutboundMessageIds();
	const bodyNorm = normalizeSnippet(params.body);
	const isMediaBody = normalizeLowercaseStringOrEmpty(params.body).startsWith("<media:");
	for (let i = 0; i < pendingOutboundMessageIds.length; i++) {
		const entry = pendingOutboundMessageIds[i];
		if (entry.accountId !== params.accountId) continue;
		if (!chatsMatch(entry, params)) continue;
		if (entry.snippetNorm && entry.snippetNorm === bodyNorm) {
			pendingOutboundMessageIds.splice(i, 1);
			return entry;
		}
		if (entry.isMediaSnippet && isMediaBody) {
			pendingOutboundMessageIds.splice(i, 1);
			return entry;
		}
	}
	return null;
}
function logVerbose(core, runtime, message) {
	if (core.logging.shouldLogVerbose()) runtime.log?.(`[bluebubbles] ${message}`);
}
function logGroupAllowlistHint(params) {
	const log = params.runtime.log ?? console.log;
	const nameHint = params.chatName ? ` (group name: ${params.chatName})` : "";
	const accountHint = params.accountId ? ` (or channels.bluebubbles.accounts.${params.accountId}.groupAllowFrom)` : "";
	if (params.entry) {
		log(`[bluebubbles] group message blocked (${params.reason}). Allow this group by adding "${params.entry}" to channels.bluebubbles.groupAllowFrom${nameHint}.`);
		log(`[bluebubbles] add to config: channels.bluebubbles.groupAllowFrom=["${params.entry}"]${accountHint}.`);
		return;
	}
	log(`[bluebubbles] group message blocked (${params.reason}). Allow groups by setting channels.bluebubbles.groupPolicy="open" or adding a group id to channels.bluebubbles.groupAllowFrom${accountHint}${nameHint}.`);
}
function resolveBlueBubblesAckReaction(params) {
	const raw = resolveAckReaction(params.cfg, params.agentId).trim();
	if (!raw) return null;
	try {
		normalizeBlueBubblesReactionInput(raw);
		return raw;
	} catch {
		const key = normalizeLowercaseStringOrEmpty(raw);
		if (!invalidAckReactions.has(key)) {
			invalidAckReactions.add(key);
			logVerbose(params.core, params.runtime, `ack reaction skipped (unsupported for BlueBubbles): ${raw}`);
		}
		return null;
	}
}
/**
* In-memory rolling history map keyed by account + chat identifier.
* Populated from incoming messages during the session.
* API backfill is attempted until one fetch resolves (or retries are exhausted).
*/
const chatHistories = /* @__PURE__ */ new Map();
const historyBackfills = /* @__PURE__ */ new Map();
const HISTORY_BACKFILL_BASE_DELAY_MS = 5e3;
const HISTORY_BACKFILL_MAX_DELAY_MS = 120 * 1e3;
const HISTORY_BACKFILL_MAX_ATTEMPTS = 6;
const HISTORY_BACKFILL_RETRY_WINDOW_MS = 1800 * 1e3;
const MAX_STORED_HISTORY_ENTRY_CHARS = 2e3;
const MAX_INBOUND_HISTORY_ENTRY_CHARS = 1200;
const MAX_INBOUND_HISTORY_TOTAL_CHARS = 12e3;
function buildAccountScopedHistoryKey(accountId, historyIdentifier) {
	return `${accountId}\u0000${historyIdentifier}`;
}
function historyDedupKey(entry) {
	const messageId = entry.messageId?.trim();
	if (messageId) return `id:${messageId}`;
	return `fallback:${entry.sender}\u0000${entry.body}\u0000${entry.timestamp ?? ""}`;
}
function truncateHistoryBody(body, maxChars) {
	const trimmed = body.trim();
	if (!trimmed) return "";
	if (trimmed.length <= maxChars) return trimmed;
	return `${trimmed.slice(0, maxChars).trimEnd()}...`;
}
function mergeHistoryEntries(params) {
	if (params.limit <= 0) return [];
	const merged = [];
	const seen = /* @__PURE__ */ new Set();
	const appendUnique = (entry) => {
		const key = historyDedupKey(entry);
		if (seen.has(key)) return;
		seen.add(key);
		merged.push(entry);
	};
	for (const entry of params.apiEntries) appendUnique(entry);
	for (const entry of params.currentEntries) appendUnique(entry);
	if (merged.length <= params.limit) return merged;
	return merged.slice(merged.length - params.limit);
}
function pruneHistoryBackfillState() {
	for (const key of historyBackfills.keys()) if (!chatHistories.has(key)) historyBackfills.delete(key);
}
function markHistoryBackfillResolved(historyKey) {
	const state = historyBackfills.get(historyKey);
	if (state) {
		state.resolved = true;
		historyBackfills.set(historyKey, state);
		return;
	}
	historyBackfills.set(historyKey, {
		attempts: 0,
		firstAttemptAt: Date.now(),
		nextAttemptAt: Number.POSITIVE_INFINITY,
		resolved: true
	});
}
function planHistoryBackfillAttempt(historyKey, now) {
	const existing = historyBackfills.get(historyKey);
	if (existing?.resolved) return null;
	if (existing && now - existing.firstAttemptAt > HISTORY_BACKFILL_RETRY_WINDOW_MS) {
		markHistoryBackfillResolved(historyKey);
		return null;
	}
	if (existing && existing.attempts >= HISTORY_BACKFILL_MAX_ATTEMPTS) {
		markHistoryBackfillResolved(historyKey);
		return null;
	}
	if (existing && now < existing.nextAttemptAt) return null;
	const attempts = (existing?.attempts ?? 0) + 1;
	const state = {
		attempts,
		firstAttemptAt: existing?.firstAttemptAt ?? now,
		nextAttemptAt: now + Math.min(HISTORY_BACKFILL_BASE_DELAY_MS * 2 ** (attempts - 1), HISTORY_BACKFILL_MAX_DELAY_MS),
		resolved: false
	};
	historyBackfills.set(historyKey, state);
	return state;
}
function buildInboundHistorySnapshot(params) {
	if (params.limit <= 0 || params.entries.length === 0) return;
	const recent = params.entries.slice(-params.limit);
	const selected = [];
	let remainingChars = MAX_INBOUND_HISTORY_TOTAL_CHARS;
	for (let i = recent.length - 1; i >= 0; i--) {
		const entry = recent[i];
		const body = truncateHistoryBody(entry.body, MAX_INBOUND_HISTORY_ENTRY_CHARS);
		if (!body) continue;
		if (selected.length > 0 && body.length > remainingChars) break;
		selected.push({
			sender: entry.sender,
			body,
			timestamp: entry.timestamp
		});
		remainingChars -= body.length;
		if (remainingChars <= 0) break;
	}
	if (selected.length === 0) return;
	selected.reverse();
	return selected;
}
function sanitizeForLog(value, maxLen = 200) {
	const cleaned = String(value).replace(/[\r\n\t\p{C}]/gu, " ");
	return cleaned.length > maxLen ? cleaned.slice(0, maxLen) + "..." : cleaned;
}
/**
* Claim → process → finalize/release wrapper around the real inbound flow.
*
* Claim before doing any work so restart replays and in-flight concurrent
* redeliveries both drop cleanly. Finalize (persist the GUID) only when
* processing completed cleanly AND any reply dispatch reported success;
* release (let a later replay try again) when processing threw OR the reply
* pipeline reported a delivery failure via its onError callback.
*
* The dedupe key follows the same canonicalization rules as the debouncer
* (`monitor-debounce.ts`): balloon events (URL previews, stickers) share
* a logical identity with their originating text message via
* `associatedMessageGuid`, so balloon-first vs text-first event ordering
* cannot produce two distinct dedupe keys for the same logical message.
*/
async function processMessage(message, target) {
	const { account, core, runtime } = target;
	const dedupeKey = resolveBlueBubblesInboundDedupeKey(message);
	const claim = await claimBlueBubblesInboundMessage({
		guid: dedupeKey,
		accountId: account.accountId,
		onDiskError: (error) => logVerbose(core, runtime, `inbound-dedupe disk error: ${sanitizeForLog(error)}`)
	});
	if (claim.kind === "duplicate" || claim.kind === "inflight") {
		logVerbose(core, runtime, `drop: ${claim.kind} inbound key=${sanitizeForLog(dedupeKey ?? "")} sender=${sanitizeForLog(message.senderId)}`);
		return;
	}
	const signal = { deliveryFailed: false };
	try {
		await processMessageAfterDedupe(message, target, signal);
	} catch (error) {
		if (claim.kind === "claimed") claim.release();
		throw error;
	}
	if (claim.kind === "claimed") if (signal.deliveryFailed) {
		logVerbose(core, runtime, `inbound-dedupe: releasing claim for key=${sanitizeForLog(dedupeKey ?? "")} after reply delivery failure (will retry on replay)`);
		claim.release();
	} else try {
		await claim.finalize();
	} catch (finalizeError) {
		logVerbose(core, runtime, `inbound-dedupe: finalize failed for key=${sanitizeForLog(dedupeKey ?? "")}: ${sanitizeForLog(finalizeError)}`);
	}
}
async function processMessageAfterDedupe(message, target, dedupeSignal) {
	const { account, config, runtime, core, statusSink } = target;
	const pairing = createChannelPairingController({
		core,
		channel: "bluebubbles",
		accountId: account.accountId
	});
	const privateApiEnabled = isBlueBubblesPrivateApiEnabled(account.accountId);
	const groupFlag = resolveGroupFlagFromChatGuid(message.chatGuid);
	const isGroup = typeof groupFlag === "boolean" ? groupFlag : message.isGroup;
	const text = message.text.trim();
	let attachments = message.attachments ?? [];
	const baseUrl = normalizeSecretInputString(account.config.serverUrl);
	const password = normalizeSecretInputString(account.config.password);
	const retryMessageId = message.messageId?.trim();
	if (attachments.length === 0 && retryMessageId && baseUrl && password && (text.length === 0 || message.eventType === "updated-message")) try {
		await new Promise((resolve) => setTimeout(resolve, 2e3));
		const fetched = await fetchBlueBubblesMessageAttachments(retryMessageId, {
			baseUrl,
			password,
			timeoutMs: 1e4,
			allowPrivateNetwork: isPrivateNetworkOptInEnabled(account.config)
		});
		if (fetched.length > 0) {
			logVerbose(core, runtime, `attachment retry found ${fetched.length} attachment(s) for msgId=${message.messageId}`);
			attachments = fetched;
		}
	} catch (err) {
		logVerbose(core, runtime, `attachment retry failed for msgId=${message.messageId}: ${String(err)}`);
	}
	const placeholder = buildMessagePlaceholder({
		...message,
		attachments
	});
	const tapbackContext = resolveTapbackContext(message);
	const tapbackParsed = parseTapbackText({
		text,
		emojiHint: tapbackContext?.emojiHint,
		actionHint: tapbackContext?.actionHint,
		requireQuoted: !tapbackContext
	});
	const isTapbackMessage = Boolean(tapbackParsed);
	const rawBody = tapbackParsed ? tapbackParsed.action === "removed" ? `removed ${tapbackParsed.emoji} reaction` : `reacted with ${tapbackParsed.emoji}` : text || placeholder;
	const isSelfChatMessage = isBlueBubblesSelfChatMessage(message, isGroup);
	const selfChatLookup = {
		accountId: account.accountId,
		chatGuid: message.chatGuid,
		chatIdentifier: message.chatIdentifier,
		chatId: message.chatId,
		senderId: message.senderId,
		body: rawBody,
		timestamp: message.timestamp
	};
	const cacheMessageId = message.messageId?.trim();
	const confirmedOutboundCacheEntry = cacheMessageId ? resolveReplyContextFromCache({
		accountId: account.accountId,
		replyToId: cacheMessageId,
		chatGuid: message.chatGuid,
		chatIdentifier: message.chatIdentifier,
		chatId: message.chatId
	}) : null;
	let messageShortId;
	const cacheInboundMessage = () => {
		if (!cacheMessageId) return;
		messageShortId = rememberBlueBubblesReplyCache({
			accountId: account.accountId,
			messageId: cacheMessageId,
			chatGuid: message.chatGuid,
			chatIdentifier: message.chatIdentifier,
			chatId: message.chatId,
			senderLabel: message.fromMe ? "me" : message.senderId,
			body: rawBody,
			timestamp: message.timestamp ?? Date.now()
		}).shortId;
	};
	if (message.fromMe) {
		cacheInboundMessage();
		const confirmedAssistantOutbound = confirmedOutboundCacheEntry?.senderLabel === "me" && normalizeSnippet(confirmedOutboundCacheEntry.body ?? "") === normalizeSnippet(rawBody);
		if (isSelfChatMessage && confirmedAssistantOutbound) rememberBlueBubblesSelfChatCopy(selfChatLookup);
		if (cacheMessageId) {
			const pending = consumePendingOutboundMessageId({
				accountId: account.accountId,
				chatGuid: message.chatGuid,
				chatIdentifier: message.chatIdentifier,
				chatId: message.chatId,
				body: rawBody
			});
			if (pending) {
				const displayId = getShortIdForUuid(cacheMessageId) || cacheMessageId;
				const previewSource = pending.snippetRaw || rawBody;
				const preview = previewSource ? ` "${previewSource.slice(0, 12)}${previewSource.length > 12 ? "…" : ""}"` : "";
				core.system.enqueueSystemEvent(`Assistant sent${preview} [message_id:${displayId}]`, {
					sessionKey: pending.sessionKey,
					contextKey: `bluebubbles:outbound:${pending.outboundTarget}:${cacheMessageId}`
				});
			}
		}
		return;
	}
	if (isSelfChatMessage && hasBlueBubblesSelfChatCopy(selfChatLookup)) {
		logVerbose(core, runtime, `drop: reflected self-chat duplicate sender=${message.senderId}`);
		return;
	}
	if (!rawBody) {
		logVerbose(core, runtime, `drop: empty text sender=${message.senderId}`);
		return;
	}
	logVerbose(core, runtime, `msg sender=${message.senderId} group=${isGroup} textLen=${text.length} attachments=${attachments.length} chatGuid=${message.chatGuid ?? ""} chatId=${message.chatId ?? ""}`);
	const dmPolicy = account.config.dmPolicy ?? "pairing";
	const groupPolicy = account.config.groupPolicy ?? "allowlist";
	const configuredAllowFrom = mapAllowFromEntries(account.config.allowFrom);
	const storeAllowFrom = await readStoreAllowFromForDmPolicy({
		provider: "bluebubbles",
		accountId: account.accountId,
		dmPolicy,
		readStore: pairing.readStoreForDmPolicy
	});
	const accessDecision = resolveDmGroupAccessWithLists({
		isGroup,
		dmPolicy,
		groupPolicy,
		allowFrom: configuredAllowFrom,
		groupAllowFrom: account.config.groupAllowFrom,
		storeAllowFrom,
		isSenderAllowed: (allowFrom) => isAllowedBlueBubblesSender({
			allowFrom,
			sender: message.senderId,
			chatId: message.chatId ?? void 0,
			chatGuid: message.chatGuid ?? void 0,
			chatIdentifier: message.chatIdentifier ?? void 0
		})
	});
	const effectiveAllowFrom = accessDecision.effectiveAllowFrom;
	const effectiveGroupAllowFrom = accessDecision.effectiveGroupAllowFrom;
	const groupAllowEntry = formatGroupAllowlistEntry({
		chatGuid: message.chatGuid,
		chatId: message.chatId ?? void 0,
		chatIdentifier: message.chatIdentifier ?? void 0
	});
	const groupName = normalizeOptionalString(message.chatName);
	if (accessDecision.decision !== "allow") {
		if (isGroup) {
			if (accessDecision.reasonCode === DM_GROUP_ACCESS_REASON.GROUP_POLICY_DISABLED) {
				logVerbose(core, runtime, "Blocked BlueBubbles group message (groupPolicy=disabled)");
				logGroupAllowlistHint({
					runtime,
					reason: "groupPolicy=disabled",
					entry: groupAllowEntry,
					chatName: groupName,
					accountId: account.accountId
				});
				return;
			}
			if (accessDecision.reasonCode === DM_GROUP_ACCESS_REASON.GROUP_POLICY_EMPTY_ALLOWLIST) {
				logVerbose(core, runtime, "Blocked BlueBubbles group message (no allowlist)");
				logGroupAllowlistHint({
					runtime,
					reason: "groupPolicy=allowlist (empty allowlist)",
					entry: groupAllowEntry,
					chatName: groupName,
					accountId: account.accountId
				});
				return;
			}
			if (accessDecision.reasonCode === DM_GROUP_ACCESS_REASON.GROUP_POLICY_NOT_ALLOWLISTED) {
				logVerbose(core, runtime, `Blocked BlueBubbles sender ${message.senderId} (not in groupAllowFrom)`);
				logVerbose(core, runtime, `drop: group sender not allowed sender=${message.senderId} allowFrom=${effectiveGroupAllowFrom.join(",")}`);
				logGroupAllowlistHint({
					runtime,
					reason: "groupPolicy=allowlist (not allowlisted)",
					entry: groupAllowEntry,
					chatName: groupName,
					accountId: account.accountId
				});
				return;
			}
			return;
		}
		if (accessDecision.reasonCode === DM_GROUP_ACCESS_REASON.DM_POLICY_DISABLED) {
			logVerbose(core, runtime, `Blocked BlueBubbles DM from ${message.senderId}`);
			logVerbose(core, runtime, `drop: dmPolicy disabled sender=${message.senderId}`);
			return;
		}
		if (accessDecision.decision === "pairing") {
			await pairing.issueChallenge({
				senderId: message.senderId,
				senderIdLine: `Your BlueBubbles sender id: ${message.senderId}`,
				meta: { name: message.senderName },
				onCreated: () => {
					runtime.log?.(`[bluebubbles] pairing request sender=${message.senderId} created=true`);
					logVerbose(core, runtime, `bluebubbles pairing request sender=${message.senderId}`);
				},
				sendPairingReply: async (text) => {
					await sendMessageBlueBubbles(message.senderId, text, {
						cfg: config,
						accountId: account.accountId
					});
					statusSink?.({ lastOutboundAt: Date.now() });
				},
				onReplyError: (err) => {
					logVerbose(core, runtime, `bluebubbles pairing reply failed for ${message.senderId}: ${String(err)}`);
					runtime.error?.(`[bluebubbles] pairing reply failed sender=${message.senderId}: ${String(err)}`);
				}
			});
			return;
		}
		logVerbose(core, runtime, `Blocked unauthorized BlueBubbles sender ${message.senderId} (dmPolicy=${dmPolicy})`);
		logVerbose(core, runtime, `drop: dm sender not allowed sender=${message.senderId} allowFrom=${effectiveAllowFrom.join(",")}`);
		return;
	}
	const chatId = message.chatId ?? void 0;
	const chatGuid = message.chatGuid ?? void 0;
	const chatIdentifier = message.chatIdentifier ?? void 0;
	const peerId = isGroup ? chatGuid ?? chatIdentifier ?? (chatId ? String(chatId) : "group") : message.senderId;
	const route = resolveBlueBubblesConversationRoute({
		cfg: config,
		accountId: account.accountId,
		isGroup,
		peerId,
		sender: message.senderId,
		chatId,
		chatGuid,
		chatIdentifier
	});
	const contextVisibilityMode = resolveChannelContextVisibilityMode({
		cfg: config,
		channel: "bluebubbles",
		accountId: account.accountId
	});
	const messageText = text;
	const mentionRegexes = core.channel.mentions.buildMentionRegexes(config, route.agentId);
	const wasMentioned = isGroup ? core.channel.mentions.matchesMentionPatterns(messageText, mentionRegexes) : true;
	const canDetectMention = mentionRegexes.length > 0;
	const requireMention = core.channel.groups.resolveRequireMention({
		cfg: config,
		channel: "bluebubbles",
		groupId: peerId,
		accountId: account.accountId
	});
	const useAccessGroups = config.commands?.useAccessGroups !== false;
	const hasControlCmd = core.channel.text.hasControlCommand(messageText, config);
	const commandDmAllowFrom = isGroup ? configuredAllowFrom : effectiveAllowFrom;
	const ownerAllowedForCommands = commandDmAllowFrom.length > 0 ? isAllowedBlueBubblesSender({
		allowFrom: commandDmAllowFrom,
		sender: message.senderId,
		chatId: message.chatId ?? void 0,
		chatGuid: message.chatGuid ?? void 0,
		chatIdentifier: message.chatIdentifier ?? void 0
	}) : false;
	const groupAllowedForCommands = effectiveGroupAllowFrom.length > 0 ? isAllowedBlueBubblesSender({
		allowFrom: effectiveGroupAllowFrom,
		sender: message.senderId,
		chatId: message.chatId ?? void 0,
		chatGuid: message.chatGuid ?? void 0,
		chatIdentifier: message.chatIdentifier ?? void 0
	}) : false;
	const commandGate = resolveControlCommandGate({
		useAccessGroups,
		authorizers: [{
			configured: commandDmAllowFrom.length > 0,
			allowed: ownerAllowedForCommands
		}, {
			configured: effectiveGroupAllowFrom.length > 0,
			allowed: groupAllowedForCommands
		}],
		allowTextCommands: true,
		hasControlCommand: hasControlCmd
	});
	const commandAuthorized = commandGate.commandAuthorized;
	if (isGroup && commandGate.shouldBlock) {
		logInboundDrop({
			log: (msg) => logVerbose(core, runtime, msg),
			channel: "bluebubbles",
			reason: "control command (unauthorized)",
			target: message.senderId
		});
		return;
	}
	const shouldBypassMention = isGroup && requireMention && !wasMentioned && commandAuthorized && hasControlCmd;
	const effectiveWasMentioned = wasMentioned || shouldBypassMention;
	if (isGroup && requireMention && canDetectMention && !wasMentioned && !shouldBypassMention) {
		logVerbose(core, runtime, `bluebubbles: skipping group message (no mention)`);
		return;
	}
	if (isGroup && !message.participants?.length && baseUrl && password) try {
		const fetchedParticipants = await fetchBlueBubblesParticipantsForInboundMessage({
			baseUrl,
			password,
			chatGuid: message.chatGuid,
			chatId: message.chatId,
			chatIdentifier: message.chatIdentifier,
			allowPrivateNetwork: isPrivateNetworkOptInEnabled(account.config)
		});
		if (fetchedParticipants?.length) message.participants = fetchedParticipants;
	} catch (err) {
		logVerbose(core, runtime, `bluebubbles: participant fallback lookup failed chat=${peerId}: ${String(err)}`);
	}
	if (isGroup && account.config.enrichGroupParticipantsFromContacts === true && message.participants?.length) message.participants = await enrichBlueBubblesParticipantsWithContactNames(message.participants);
	cacheInboundMessage();
	const maxBytes = account.config.mediaMaxMb && account.config.mediaMaxMb > 0 ? account.config.mediaMaxMb * 1024 * 1024 : 8 * 1024 * 1024;
	let mediaUrls = [];
	let mediaPaths = [];
	let mediaTypes = [];
	if (attachments.length > 0) if (!baseUrl || !password) logVerbose(core, runtime, "attachment download skipped (missing serverUrl/password)");
	else for (const attachment of attachments) {
		if (!attachment.guid) continue;
		if (attachment.totalBytes && attachment.totalBytes > maxBytes) {
			logVerbose(core, runtime, `attachment too large guid=${attachment.guid} bytes=${attachment.totalBytes}`);
			continue;
		}
		try {
			const downloaded = await downloadBlueBubblesAttachment(attachment, {
				cfg: config,
				accountId: account.accountId,
				maxBytes
			});
			const saved = await core.channel.media.saveMediaBuffer(Buffer.from(downloaded.buffer), downloaded.contentType, "inbound", maxBytes);
			mediaPaths.push(saved.path);
			mediaUrls.push(saved.path);
			if (saved.contentType) mediaTypes.push(saved.contentType);
		} catch (err) {
			logVerbose(core, runtime, `attachment download failed guid=${attachment.guid} err=${String(err)}`);
		}
	}
	let replyToId = message.replyToId;
	let replyToBody = message.replyToBody;
	let replyToSender = message.replyToSender;
	let replyToShortId;
	if (isTapbackMessage && tapbackContext?.replyToId) replyToId = tapbackContext.replyToId;
	if (replyToId) {
		const cached = resolveReplyContextFromCache({
			accountId: account.accountId,
			replyToId,
			chatGuid: message.chatGuid,
			chatIdentifier: message.chatIdentifier,
			chatId: message.chatId
		});
		if (cached) {
			if (!replyToBody && cached.body) replyToBody = cached.body;
			if (!replyToSender && cached.senderLabel) replyToSender = cached.senderLabel;
			replyToShortId = cached.shortId;
			if (core.logging.shouldLogVerbose()) {
				const preview = (cached.body ?? "").replace(/\s+/g, " ").slice(0, 120);
				logVerbose(core, runtime, `reply-context cache hit replyToId=${replyToId} sender=${replyToSender ?? ""} body="${preview}"`);
			}
		}
	}
	if (replyToId && !replyToShortId) replyToShortId = getShortIdForUuid(replyToId);
	const hasReplyContext = Boolean(replyToId || replyToBody || replyToSender);
	const replySenderAllowed = !isGroup || effectiveGroupAllowFrom.length === 0 ? true : replyToSender ? isAllowedBlueBubblesSender({
		allowFrom: effectiveGroupAllowFrom,
		sender: replyToSender,
		chatId: message.chatId ?? void 0,
		chatGuid: message.chatGuid ?? void 0,
		chatIdentifier: message.chatIdentifier ?? void 0
	}) : false;
	const includeReplyContext = !hasReplyContext || evaluateSupplementalContextVisibility({
		mode: contextVisibilityMode,
		kind: "quote",
		senderAllowed: replySenderAllowed
	}).include;
	if (hasReplyContext && !includeReplyContext && isGroup) logVerbose(core, runtime, `bluebubbles: drop reply context (mode=${contextVisibilityMode}, sender_allowed=${replySenderAllowed ? "yes" : "no"})`);
	const visibleReplyToId = includeReplyContext ? replyToId : void 0;
	const visibleReplyToShortId = includeReplyContext ? replyToShortId : void 0;
	const visibleReplyToBody = includeReplyContext ? replyToBody : void 0;
	const visibleReplyToSender = includeReplyContext ? replyToSender : void 0;
	const replyTag = formatReplyTag({
		replyToId: visibleReplyToId,
		replyToShortId: visibleReplyToShortId
	});
	const baseBody = replyTag ? isTapbackMessage ? `${rawBody} ${replyTag}` : `${replyTag} ${rawBody}` : rawBody;
	const senderLabel = message.senderName || `user:${message.senderId}`;
	const fromLabel = isGroup ? `${normalizeOptionalString(message.chatName) || "Group"} id:${peerId}` : senderLabel !== message.senderId ? `${senderLabel} id:${message.senderId}` : senderLabel;
	const groupSubject = isGroup ? normalizeOptionalString(message.chatName) : void 0;
	const groupMembers = isGroup ? formatGroupMembers({
		participants: message.participants,
		fallback: message.senderId ? {
			id: message.senderId,
			name: message.senderName
		} : void 0
	}) : void 0;
	const storePath = core.channel.session.resolveStorePath(config.session?.store, { agentId: route.agentId });
	const envelopeOptions = core.channel.reply.resolveEnvelopeFormatOptions(config);
	const previousTimestamp = core.channel.session.readSessionUpdatedAt({
		storePath,
		sessionKey: route.sessionKey
	});
	const body = core.channel.reply.formatInboundEnvelope({
		channel: "BlueBubbles",
		from: fromLabel,
		timestamp: message.timestamp,
		previousTimestamp,
		envelope: envelopeOptions,
		body: baseBody,
		chatType: isGroup ? "group" : "direct",
		sender: {
			name: message.senderName || void 0,
			id: message.senderId
		}
	});
	let chatGuidForActions = chatGuid;
	if (!chatGuidForActions && baseUrl && password) {
		const resolveTarget = isGroup && (chatId || chatIdentifier) ? chatId ? {
			kind: "chat_id",
			chatId
		} : {
			kind: "chat_identifier",
			chatIdentifier: chatIdentifier ?? ""
		} : {
			kind: "handle",
			address: message.senderId
		};
		if (resolveTarget.kind !== "chat_identifier" || resolveTarget.chatIdentifier) chatGuidForActions = await resolveChatGuidForTarget({
			baseUrl,
			password,
			target: resolveTarget,
			allowPrivateNetwork: isPrivateNetworkOptInEnabled(account.config)
		}) ?? void 0;
	}
	const ackReactionScope = config.messages?.ackReactionScope ?? "group-mentions";
	const removeAckAfterReply = config.messages?.removeAckAfterReply ?? false;
	const ackReactionValue = resolveBlueBubblesAckReaction({
		cfg: config,
		agentId: route.agentId,
		core,
		runtime
	});
	const shouldAckReaction = () => Boolean(ackReactionValue && core.channel.reactions.shouldAckReaction({
		scope: ackReactionScope,
		isDirect: !isGroup,
		isGroup,
		isMentionableGroup: isGroup,
		requireMention,
		canDetectMention,
		effectiveWasMentioned,
		shouldBypassMention
	}));
	const ackMessageId = message.messageId?.trim() || "";
	const ackReactionPromise = shouldAckReaction() && ackMessageId && chatGuidForActions && ackReactionValue ? sendBlueBubblesReaction({
		chatGuid: chatGuidForActions,
		messageGuid: ackMessageId,
		emoji: ackReactionValue,
		opts: {
			cfg: config,
			accountId: account.accountId
		}
	}).then(() => true, (err) => {
		logVerbose(core, runtime, `ack reaction failed chatGuid=${chatGuidForActions} msg=${ackMessageId}: ${String(err)}`);
		return false;
	}) : null;
	const sendReadReceipts = account.config.sendReadReceipts !== false;
	if (chatGuidForActions && baseUrl && password && sendReadReceipts) try {
		await markBlueBubblesChatRead(chatGuidForActions, {
			cfg: config,
			accountId: account.accountId
		});
		logVerbose(core, runtime, `marked read chatGuid=${chatGuidForActions}`);
	} catch (err) {
		runtime.error?.(`[bluebubbles] mark read failed: ${String(err)}`);
	}
	else if (!sendReadReceipts) logVerbose(core, runtime, "mark read skipped (sendReadReceipts=false)");
	else logVerbose(core, runtime, "mark read skipped (missing chatGuid or credentials)");
	const outboundTarget = isGroup ? formatBlueBubblesChatTarget({
		chatId,
		chatGuid: chatGuidForActions ?? chatGuid,
		chatIdentifier
	}) || peerId : chatGuidForActions ? formatBlueBubblesChatTarget({ chatGuid: chatGuidForActions }) : message.senderId;
	const maybeEnqueueOutboundMessageId = (messageId, snippet) => {
		const trimmed = messageId?.trim();
		if (!trimmed || trimmed === "ok" || trimmed === "unknown") return false;
		const displayId = rememberBlueBubblesReplyCache({
			accountId: account.accountId,
			messageId: trimmed,
			chatGuid: chatGuidForActions ?? chatGuid,
			chatIdentifier,
			chatId,
			senderLabel: "me",
			body: snippet ?? "",
			timestamp: Date.now()
		}).shortId || trimmed;
		const preview = snippet ? ` "${snippet.slice(0, 12)}${snippet.length > 12 ? "…" : ""}"` : "";
		core.system.enqueueSystemEvent(`Assistant sent${preview} [message_id:${displayId}]`, {
			sessionKey: route.sessionKey,
			contextKey: `bluebubbles:outbound:${outboundTarget}:${trimmed}`
		});
		return true;
	};
	const sanitizeReplyDirectiveText = (value) => {
		if (privateApiEnabled) return value;
		return value.replace(REPLY_DIRECTIVE_TAG_RE, " ").replace(/[ \t]+/g, " ").trim();
	};
	const historyLimit = isGroup ? account.config.historyLimit ?? 0 : account.config.dmHistoryLimit ?? 0;
	const historyIdentifier = chatGuid || chatIdentifier || (chatId ? String(chatId) : null) || (isGroup ? null : message.senderId) || "";
	const historyKey = historyIdentifier ? buildAccountScopedHistoryKey(account.accountId, historyIdentifier) : "";
	if (historyKey && historyLimit > 0) {
		const nowMs = Date.now();
		const senderLabel = message.fromMe ? "me" : message.senderName || message.senderId;
		const normalizedHistoryBody = truncateHistoryBody(text, MAX_STORED_HISTORY_ENTRY_CHARS);
		const currentEntries = recordPendingHistoryEntryIfEnabled({
			historyMap: chatHistories,
			limit: historyLimit,
			historyKey,
			entry: normalizedHistoryBody ? {
				sender: senderLabel,
				body: normalizedHistoryBody,
				timestamp: message.timestamp ?? nowMs,
				messageId: message.messageId ?? void 0
			} : null
		});
		pruneHistoryBackfillState();
		const backfillAttempt = planHistoryBackfillAttempt(historyKey, nowMs);
		if (backfillAttempt) try {
			const backfillResult = await fetchBlueBubblesHistory(historyIdentifier, historyLimit, {
				cfg: config,
				accountId: account.accountId
			});
			if (backfillResult.resolved) markHistoryBackfillResolved(historyKey);
			if (backfillResult.entries.length > 0) {
				const apiEntries = [];
				for (const entry of backfillResult.entries) {
					const body = truncateHistoryBody(entry.body, MAX_STORED_HISTORY_ENTRY_CHARS);
					if (!body) continue;
					apiEntries.push({
						sender: entry.sender,
						body,
						timestamp: entry.timestamp,
						messageId: entry.messageId
					});
				}
				const merged = mergeHistoryEntries({
					apiEntries,
					currentEntries: currentEntries.length > 0 ? currentEntries : chatHistories.get(historyKey) ?? [],
					limit: historyLimit
				});
				if (chatHistories.has(historyKey)) chatHistories.delete(historyKey);
				chatHistories.set(historyKey, merged);
				evictOldHistoryKeys(chatHistories);
				logVerbose(core, runtime, `backfilled ${backfillResult.entries.length} history messages for ${isGroup ? "group" : "DM"}: ${historyIdentifier}`);
			} else if (!backfillResult.resolved) {
				const remainingAttempts = HISTORY_BACKFILL_MAX_ATTEMPTS - backfillAttempt.attempts;
				const nextBackoffMs = Math.max(backfillAttempt.nextAttemptAt - nowMs, 0);
				logVerbose(core, runtime, `history backfill unresolved for ${historyIdentifier}; retries left=${Math.max(remainingAttempts, 0)} next_in_ms=${nextBackoffMs}`);
			}
		} catch (err) {
			const remainingAttempts = HISTORY_BACKFILL_MAX_ATTEMPTS - backfillAttempt.attempts;
			const nextBackoffMs = Math.max(backfillAttempt.nextAttemptAt - nowMs, 0);
			logVerbose(core, runtime, `history backfill failed for ${historyIdentifier}: ${String(err)} (retries left=${Math.max(remainingAttempts, 0)} next_in_ms=${nextBackoffMs})`);
		}
	}
	let inboundHistory;
	if (historyKey && historyLimit > 0) {
		const entries = chatHistories.get(historyKey);
		if (entries && entries.length > 0) inboundHistory = buildInboundHistorySnapshot({
			entries,
			limit: historyLimit
		});
	}
	const commandBody = messageText.trim();
	const ctxPayload = core.channel.reply.finalizeInboundContext({
		Body: body,
		BodyForAgent: rawBody,
		InboundHistory: inboundHistory,
		RawBody: rawBody,
		CommandBody: commandBody,
		BodyForCommands: commandBody,
		MediaUrl: mediaUrls[0],
		MediaUrls: mediaUrls.length > 0 ? mediaUrls : void 0,
		MediaPath: mediaPaths[0],
		MediaPaths: mediaPaths.length > 0 ? mediaPaths : void 0,
		MediaType: mediaTypes[0],
		MediaTypes: mediaTypes.length > 0 ? mediaTypes : void 0,
		From: isGroup ? `group:${peerId}` : `bluebubbles:${message.senderId}`,
		To: `bluebubbles:${outboundTarget}`,
		SessionKey: route.sessionKey,
		AccountId: route.accountId,
		ChatType: isGroup ? "group" : "direct",
		ConversationLabel: fromLabel,
		ReplyToId: visibleReplyToShortId || visibleReplyToId,
		ReplyToIdFull: visibleReplyToId,
		ReplyToBody: visibleReplyToBody,
		ReplyToSender: visibleReplyToSender,
		GroupSubject: groupSubject,
		GroupMembers: groupMembers,
		SenderName: message.senderName || void 0,
		SenderId: message.senderId,
		Provider: "bluebubbles",
		Surface: "bluebubbles",
		MessageSid: messageShortId || message.messageId,
		MessageSidFull: message.messageId,
		Timestamp: message.timestamp,
		OriginatingChannel: "bluebubbles",
		OriginatingTo: `bluebubbles:${outboundTarget}`,
		WasMentioned: effectiveWasMentioned,
		CommandAuthorized: commandAuthorized
	});
	let sentMessage = false;
	let streamingActive = false;
	let typingRestartTimer;
	const typingRestartDelayMs = 150;
	const clearTypingRestartTimer = () => {
		if (typingRestartTimer) {
			clearTimeout(typingRestartTimer);
			typingRestartTimer = void 0;
		}
	};
	const restartTypingSoon = () => {
		if (!streamingActive || !chatGuidForActions || !baseUrl || !password) return;
		clearTypingRestartTimer();
		typingRestartTimer = setTimeout(() => {
			typingRestartTimer = void 0;
			if (!streamingActive) return;
			sendBlueBubblesTyping(chatGuidForActions, true, {
				cfg: config,
				accountId: account.accountId
			}).catch((err) => {
				runtime.error?.(`[bluebubbles] typing restart failed: ${String(err)}`);
			});
		}, typingRestartDelayMs);
	};
	try {
		const { onModelSelected, typingCallbacks, ...replyPipeline } = createChannelReplyPipeline({
			cfg: config,
			agentId: route.agentId,
			channel: "bluebubbles",
			accountId: account.accountId,
			typingCallbacks: {
				onReplyStart: async () => {
					if (!chatGuidForActions) return;
					if (!baseUrl || !password) return;
					streamingActive = true;
					clearTypingRestartTimer();
					try {
						await sendBlueBubblesTyping(chatGuidForActions, true, {
							cfg: config,
							accountId: account.accountId
						});
					} catch (err) {
						runtime.error?.(`[bluebubbles] typing start failed: ${String(err)}`);
					}
				},
				onIdle: () => {
					if (!chatGuidForActions) return;
					if (!baseUrl || !password) return;
				}
			}
		});
		await core.channel.reply.dispatchReplyWithBufferedBlockDispatcher({
			ctx: ctxPayload,
			cfg: config,
			dispatcherOptions: {
				...replyPipeline,
				deliver: async (payload, info) => {
					const rawReplyToId = privateApiEnabled && typeof payload.replyToId === "string" ? payload.replyToId.trim() : "";
					const replyToMessageGuid = rawReplyToId ? resolveBlueBubblesMessageId(rawReplyToId, { requireKnownShortId: true }) : "";
					const mediaList = resolveOutboundMediaUrls(payload);
					if (mediaList.length > 0) {
						const tableMode = core.channel.text.resolveMarkdownTableMode({
							cfg: config,
							channel: "bluebubbles",
							accountId: account.accountId
						});
						await sendMediaWithLeadingCaption({
							mediaUrls: mediaList,
							caption: sanitizeReplyDirectiveText(core.channel.text.convertMarkdownTables(payload.text ?? "", tableMode)),
							send: async ({ mediaUrl, caption }) => {
								const cachedBody = (caption ?? "").trim() || "<media:attachment>";
								const pendingId = rememberPendingOutboundMessageId({
									accountId: account.accountId,
									sessionKey: route.sessionKey,
									outboundTarget,
									chatGuid: chatGuidForActions ?? chatGuid,
									chatIdentifier,
									chatId,
									snippet: cachedBody
								});
								let result;
								try {
									result = await sendBlueBubblesMedia({
										cfg: config,
										to: outboundTarget,
										mediaUrl,
										caption: caption ?? void 0,
										replyToId: replyToMessageGuid || null,
										accountId: account.accountId
									});
								} catch (err) {
									forgetPendingOutboundMessageId(pendingId);
									throw err;
								}
								if (maybeEnqueueOutboundMessageId(result.messageId, cachedBody)) forgetPendingOutboundMessageId(pendingId);
								sentMessage = true;
								statusSink?.({ lastOutboundAt: Date.now() });
								if (info.kind === "block") restartTypingSoon();
							}
						});
						return;
					}
					const textLimit = account.config.textChunkLimit && account.config.textChunkLimit > 0 ? account.config.textChunkLimit : DEFAULT_TEXT_LIMIT;
					const chunkMode = account.config.chunkMode ?? "length";
					const tableMode = core.channel.text.resolveMarkdownTableMode({
						cfg: config,
						channel: "bluebubbles",
						accountId: account.accountId
					});
					const text = sanitizeReplyDirectiveText(core.channel.text.convertMarkdownTables(payload.text ?? "", tableMode));
					const chunks = chunkMode === "newline" ? resolveTextChunksWithFallback(text, core.channel.text.chunkTextWithMode(text, textLimit, chunkMode)) : resolveTextChunksWithFallback(text, core.channel.text.chunkMarkdownText(text, textLimit));
					if (!chunks.length) return;
					for (const chunk of chunks) {
						const pendingId = rememberPendingOutboundMessageId({
							accountId: account.accountId,
							sessionKey: route.sessionKey,
							outboundTarget,
							chatGuid: chatGuidForActions ?? chatGuid,
							chatIdentifier,
							chatId,
							snippet: chunk
						});
						let result;
						try {
							result = await sendMessageBlueBubbles(outboundTarget, chunk, {
								cfg: config,
								accountId: account.accountId,
								replyToMessageGuid: replyToMessageGuid || void 0
							});
						} catch (err) {
							forgetPendingOutboundMessageId(pendingId);
							throw err;
						}
						if (maybeEnqueueOutboundMessageId(result.messageId, chunk)) forgetPendingOutboundMessageId(pendingId);
						sentMessage = true;
						statusSink?.({ lastOutboundAt: Date.now() });
						if (info.kind === "block") restartTypingSoon();
					}
				},
				onReplyStart: typingCallbacks?.onReplyStart,
				onIdle: typingCallbacks?.onIdle,
				onError: (err, info) => {
					if (info.kind === "final") dedupeSignal.deliveryFailed = true;
					runtime.error?.(`BlueBubbles ${info.kind} reply failed: ${String(err)}`);
				}
			},
			replyOptions: {
				onModelSelected,
				disableBlockStreaming: typeof account.config.blockStreaming === "boolean" ? !account.config.blockStreaming : void 0
			}
		});
	} finally {
		const shouldStopTyping = Boolean(chatGuidForActions && baseUrl && password) && (streamingActive || !sentMessage);
		streamingActive = false;
		clearTypingRestartTimer();
		if (sentMessage && chatGuidForActions && ackMessageId) core.channel.reactions.removeAckReactionAfterReply({
			removeAfterReply: removeAckAfterReply,
			ackReactionPromise,
			ackReactionValue: ackReactionValue ?? null,
			remove: () => sendBlueBubblesReaction({
				chatGuid: chatGuidForActions,
				messageGuid: ackMessageId,
				emoji: ackReactionValue ?? "",
				remove: true,
				opts: {
					cfg: config,
					accountId: account.accountId
				}
			}),
			onError: (err) => {
				logAckFailure({
					log: (msg) => logVerbose(core, runtime, msg),
					channel: "bluebubbles",
					target: `${chatGuidForActions}/${ackMessageId}`,
					error: err
				});
			}
		});
		if (shouldStopTyping && chatGuidForActions) sendBlueBubblesTyping(chatGuidForActions, false, {
			cfg: config,
			accountId: account.accountId
		}).catch((err) => {
			logTypingFailure({
				log: (msg) => logVerbose(core, runtime, msg),
				channel: "bluebubbles",
				action: "stop",
				target: chatGuidForActions,
				error: err
			});
		});
	}
}
async function processReaction(reaction, target) {
	const { account, config, runtime, core } = target;
	const pairing = createChannelPairingController({
		core,
		channel: "bluebubbles",
		accountId: account.accountId
	});
	if (reaction.fromMe) return;
	const dmPolicy = account.config.dmPolicy ?? "pairing";
	const groupPolicy = account.config.groupPolicy ?? "allowlist";
	const storeAllowFrom = await readStoreAllowFromForDmPolicy({
		provider: "bluebubbles",
		accountId: account.accountId,
		dmPolicy,
		readStore: pairing.readStoreForDmPolicy
	});
	if (resolveDmGroupAccessWithLists({
		isGroup: reaction.isGroup,
		dmPolicy,
		groupPolicy,
		allowFrom: account.config.allowFrom,
		groupAllowFrom: account.config.groupAllowFrom,
		storeAllowFrom,
		isSenderAllowed: (allowFrom) => isAllowedBlueBubblesSender({
			allowFrom,
			sender: reaction.senderId,
			chatId: reaction.chatId ?? void 0,
			chatGuid: reaction.chatGuid ?? void 0,
			chatIdentifier: reaction.chatIdentifier ?? void 0
		})
	}).decision !== "allow") return;
	const chatId = reaction.chatId ?? void 0;
	const chatGuid = reaction.chatGuid ?? void 0;
	const chatIdentifier = reaction.chatIdentifier ?? void 0;
	const peerId = reaction.isGroup ? chatGuid ?? chatIdentifier ?? (chatId ? String(chatId) : "group") : reaction.senderId;
	if (reaction.isGroup && core.channel.groups.resolveRequireMention({
		cfg: config,
		channel: "bluebubbles",
		groupId: peerId,
		accountId: account.accountId
	})) {
		logVerbose(core, runtime, "bluebubbles: skipping group reaction (requireMention=true)");
		return;
	}
	const route = resolveBlueBubblesConversationRoute({
		cfg: config,
		accountId: account.accountId,
		isGroup: reaction.isGroup,
		peerId,
		sender: reaction.senderId,
		chatId,
		chatGuid,
		chatIdentifier
	});
	const senderLabel = reaction.senderName || reaction.senderId;
	const chatLabel = reaction.isGroup ? ` in group:${peerId}` : "";
	const messageDisplayId = getShortIdForUuid(reaction.messageId) || reaction.messageId;
	const text = reaction.action === "removed" ? `${senderLabel} removed ${reaction.emoji} reaction [[reply_to:${messageDisplayId}]]${chatLabel}` : `${senderLabel} reacted with ${reaction.emoji} [[reply_to:${messageDisplayId}]]${chatLabel}`;
	core.system.enqueueSystemEvent(text, {
		sessionKey: route.sessionKey,
		contextKey: `bluebubbles:reaction:${reaction.action}:${peerId}:${reaction.messageId}:${reaction.senderId}:${reaction.emoji}`
	});
	logVerbose(core, runtime, `reaction event enqueued: ${text}`);
}
//#endregion
//#region extensions/bluebubbles/src/catchup.ts
const DEFAULT_MAX_AGE_MINUTES = 120;
const MAX_MAX_AGE_MINUTES = 720;
const DEFAULT_PER_RUN_LIMIT = 50;
const MAX_PER_RUN_LIMIT = 500;
const DEFAULT_FIRST_RUN_LOOKBACK_MINUTES = 30;
const DEFAULT_MAX_FAILURE_RETRIES = 10;
const MAX_MAX_FAILURE_RETRIES = 1e3;
const MAX_FAILURE_RETRY_MAP_SIZE = 5e3;
const FETCH_TIMEOUT_MS = 15e3;
function resolveStateDirFromEnv(env = process.env) {
	if (env.OPENCLAW_STATE_DIR?.trim()) return resolveStateDir(env);
	if (env.VITEST || env.NODE_ENV === "test") {
		const name = "openclaw-vitest-" + process.pid;
		return path.join(resolvePreferredOpenClawTmpDir(), name);
	}
	return resolveStateDir(env);
}
function resolveCursorFilePath(accountId) {
	const safePrefix = accountId.replace(/[^a-zA-Z0-9_-]/g, "_") || "account";
	const hash = createHash("sha256").update(accountId, "utf8").digest("hex").slice(0, 12);
	return path.join(resolveStateDirFromEnv(), "bluebubbles", "catchup", `${safePrefix}__${hash}.json`);
}
function sanitizeFailureRetriesInput(raw) {
	if (!raw || typeof raw !== "object") return {};
	const out = {};
	for (const [guid, count] of Object.entries(raw)) {
		if (!guid || typeof guid !== "string") continue;
		if (typeof count !== "number" || !Number.isFinite(count) || count <= 0) continue;
		out[guid] = Math.floor(count);
	}
	return out;
}
async function loadBlueBubblesCatchupCursor(accountId) {
	const { value } = await readJsonFileWithFallback(resolveCursorFilePath(accountId), null);
	if (!value || typeof value !== "object") return null;
	if (typeof value.lastSeenMs !== "number" || !Number.isFinite(value.lastSeenMs)) return null;
	const failureRetries = sanitizeFailureRetriesInput(value.failureRetries);
	const hasRetries = Object.keys(failureRetries).length > 0;
	return {
		lastSeenMs: value.lastSeenMs,
		updatedAt: typeof value.updatedAt === "number" ? value.updatedAt : 0,
		...hasRetries ? { failureRetries } : {}
	};
}
async function saveBlueBubblesCatchupCursor(accountId, lastSeenMs, failureRetries) {
	const filePath = resolveCursorFilePath(accountId);
	const sanitized = sanitizeFailureRetriesInput(failureRetries);
	const hasRetries = Object.keys(sanitized).length > 0;
	await writeJsonFileAtomically(filePath, {
		lastSeenMs,
		updatedAt: Date.now(),
		...hasRetries ? { failureRetries: sanitized } : {}
	});
}
/**
* Bound the retry map so a pathological storm of unique failing GUIDs
* cannot grow the cursor file without limit. Keeps the `maxSize` entries
* with the highest counts (closest to give-up) when over the bound.
*
* The map is already scoped to "currently failing, still-retrying" GUIDs
* and prunes on every run (entries not observed in the fetched window are
* dropped), so this is a defense-in-depth cap, not the primary pruning
* mechanism.
*/
function capFailureRetriesMap(map, maxSize) {
	const entries = Object.entries(map);
	if (entries.length <= maxSize) return map;
	entries.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
	const capped = {};
	for (let i = 0; i < maxSize; i++) {
		const [guid, count] = entries[i];
		capped[guid] = count;
	}
	return capped;
}
async function fetchBlueBubblesMessagesSince(sinceMs, limit, opts) {
	const ssrfPolicy = opts.allowPrivateNetwork ? { allowPrivateNetwork: true } : {};
	const url = buildBlueBubblesApiUrl({
		baseUrl: opts.baseUrl,
		path: "/api/v1/message/query",
		password: opts.password
	});
	const body = JSON.stringify({
		limit,
		sort: "ASC",
		after: sinceMs,
		with: [
			"chat",
			"chat.participants",
			"attachment"
		]
	});
	try {
		const res = await blueBubblesFetchWithTimeout(url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body
		}, opts.timeoutMs ?? FETCH_TIMEOUT_MS, ssrfPolicy);
		if (!res.ok) return {
			resolved: false,
			messages: []
		};
		const json = await res.json().catch(() => null);
		if (!json || !Array.isArray(json.data)) return {
			resolved: false,
			messages: []
		};
		const messages = [];
		for (const entry of json.data) {
			const rec = asRecord(entry);
			if (rec) messages.push(rec);
		}
		return {
			resolved: true,
			messages
		};
	} catch {
		return {
			resolved: false,
			messages: []
		};
	}
}
function clampCatchupConfig(raw) {
	const maxAgeMinutes = Math.min(Math.max(raw?.maxAgeMinutes ?? DEFAULT_MAX_AGE_MINUTES, 1), MAX_MAX_AGE_MINUTES);
	const perRunLimit = Math.min(Math.max(raw?.perRunLimit ?? DEFAULT_PER_RUN_LIMIT, 1), MAX_PER_RUN_LIMIT);
	const firstRunLookbackMinutes = Math.min(Math.max(raw?.firstRunLookbackMinutes ?? DEFAULT_FIRST_RUN_LOOKBACK_MINUTES, 1), MAX_MAX_AGE_MINUTES);
	const maxFailureRetries = Math.min(Math.max(Math.floor(raw?.maxFailureRetries ?? DEFAULT_MAX_FAILURE_RETRIES), 1), MAX_MAX_FAILURE_RETRIES);
	return {
		maxAgeMs: maxAgeMinutes * 6e4,
		perRunLimit,
		firstRunLookbackMs: firstRunLookbackMinutes * 6e4,
		maxFailureRetries
	};
}
/**
* Fetch and replay BlueBubbles messages delivered since the persisted
* catchup cursor, feeding each through the same `processMessage` pipeline
* live webhooks use. Safe to call on every gateway startup: replays that
* collide with #66230's inbound dedupe cache are dropped there, so a
* message already processed via live webhook will not be processed twice.
*
* Returns the run summary, or `null` when disabled or aborted before the
* first query.
*
* Concurrent calls for the same accountId are coalesced into a single
* in-flight run via a module-level singleflight map. Without this, a
* fire-and-forget trigger (monitor.ts) combined with an overlapping
* webhook-target re-registration could race: two runs would read the
* same cursor, compute divergent `nextCursorMs` values, and the last
* writer could regress the cursor — causing repeated replay of the same
* backlog on every subsequent startup.
*/
const inFlightCatchups = /* @__PURE__ */ new Map();
function runBlueBubblesCatchup(target, deps = {}) {
	const accountId = target.account.accountId;
	const existing = inFlightCatchups.get(accountId);
	if (existing) return existing;
	const runPromise = runBlueBubblesCatchupInner(target, deps).finally(() => {
		inFlightCatchups.delete(accountId);
	});
	inFlightCatchups.set(accountId, runPromise);
	return runPromise;
}
async function runBlueBubblesCatchupInner(target, deps) {
	const raw = target.account.config.catchup;
	if (raw?.enabled === false) return null;
	const now = deps.now ?? (() => Date.now());
	const log = deps.log ?? target.runtime.log;
	const error = deps.error ?? target.runtime.error;
	const fetchFn = deps.fetchMessages ?? fetchBlueBubblesMessagesSince;
	const procFn = deps.processMessageFn ?? processMessage;
	const accountId = target.account.accountId;
	const { maxAgeMs, perRunLimit, firstRunLookbackMs, maxFailureRetries } = clampCatchupConfig(raw);
	const nowMs = now();
	const existing = await loadBlueBubblesCatchupCursor(accountId).catch(() => null);
	const cursorBefore = existing?.lastSeenMs ?? null;
	const prevRetries = existing?.failureRetries ?? {};
	const earliestAllowed = nowMs - maxAgeMs;
	const windowStartMs = existing !== null && existing.lastSeenMs <= nowMs ? Math.max(existing.lastSeenMs, earliestAllowed) : Math.max(nowMs - firstRunLookbackMs, earliestAllowed);
	let baseUrl;
	let password;
	let allowPrivateNetwork = false;
	try {
		({baseUrl, password, allowPrivateNetwork} = resolveBlueBubblesServerAccount({
			serverUrl: target.account.baseUrl,
			password: target.account.config.password,
			accountId,
			cfg: target.config
		}));
	} catch (err) {
		error?.(`[${accountId}] BlueBubbles catchup: cannot resolve server account: ${String(err)}`);
		return null;
	}
	await warmupBlueBubblesInboundDedupe(accountId).catch((err) => {
		error?.(`[${accountId}] BlueBubbles catchup: dedupe warmup failed: ${String(err)}`);
	});
	const { resolved, messages } = await fetchFn(windowStartMs, perRunLimit, {
		baseUrl,
		password,
		allowPrivateNetwork
	});
	const summary = {
		querySucceeded: resolved,
		replayed: 0,
		skippedFromMe: 0,
		skippedPreCursor: 0,
		skippedGivenUp: 0,
		failed: 0,
		givenUp: 0,
		cursorBefore,
		cursorAfter: nowMs,
		windowStartMs,
		windowEndMs: nowMs,
		fetchedCount: messages.length
	};
	if (!resolved) {
		error?.(`[${accountId}] BlueBubbles catchup: message-query failed; cursor unchanged`);
		return summary;
	}
	let earliestProcessFailureTs = null;
	let latestFetchedTs = windowStartMs;
	const nextRetries = {};
	for (const rec of messages) {
		const ts = typeof rec.dateCreated === "number" ? rec.dateCreated : 0;
		if (ts > 0 && ts > latestFetchedTs) latestFetchedTs = ts;
		if (ts > 0 && ts <= windowStartMs) {
			summary.skippedPreCursor++;
			continue;
		}
		if (rec.isFromMe === true || rec.is_from_me === true) {
			summary.skippedFromMe++;
			continue;
		}
		const assocGuid = typeof rec.associatedMessageGuid === "string" ? rec.associatedMessageGuid.trim() : typeof rec.associated_message_guid === "string" ? rec.associated_message_guid.trim() : "";
		const assocType = rec.associatedMessageType ?? rec.associated_message_type;
		const balloonId = typeof rec.balloonBundleId === "string" ? rec.balloonBundleId.trim() : "";
		if (assocGuid && (assocType != null || balloonId)) continue;
		const normalized = normalizeWebhookMessage({
			type: "new-message",
			data: rec
		});
		if (!normalized) {
			summary.failed++;
			continue;
		}
		if (normalized.fromMe) {
			summary.skippedFromMe++;
			continue;
		}
		const retryKey = normalized.messageId ?? (typeof rec.guid === "string" ? rec.guid : "");
		const prevCount = retryKey ? prevRetries[retryKey] ?? 0 : 0;
		if (retryKey && prevCount >= maxFailureRetries) {
			summary.skippedGivenUp++;
			nextRetries[retryKey] = prevCount;
			continue;
		}
		try {
			await procFn(normalized, target);
			summary.replayed++;
		} catch (err) {
			summary.failed++;
			const nextCount = prevCount + 1;
			if (retryKey && nextCount >= maxFailureRetries) {
				summary.givenUp++;
				nextRetries[retryKey] = nextCount;
				error?.(`[${accountId}] BlueBubbles catchup: giving up on guid=${retryKey} after ${nextCount} consecutive failures; future sweeps will skip this message. timestamp=${ts}: ${String(err)}`);
			} else {
				if (retryKey) nextRetries[retryKey] = nextCount;
				if (ts > 0 && (earliestProcessFailureTs === null || ts < earliestProcessFailureTs)) earliestProcessFailureTs = ts;
				error?.(`[${accountId}] BlueBubbles catchup: processMessage failed (retry ${nextCount}/${maxFailureRetries}): ${String(err)}`);
			}
		}
	}
	const isTruncated = summary.fetchedCount >= perRunLimit;
	let nextCursorMs = nowMs;
	if (earliestProcessFailureTs !== null) {
		const heldCursor = Math.max(earliestProcessFailureTs - 1, cursorBefore ?? windowStartMs);
		nextCursorMs = Math.min(heldCursor, nowMs);
	} else if (isTruncated) nextCursorMs = Math.min(Math.max(latestFetchedTs, cursorBefore ?? windowStartMs), nowMs);
	summary.cursorAfter = nextCursorMs;
	const retriesToPersist = capFailureRetriesMap(nextRetries, MAX_FAILURE_RETRY_MAP_SIZE);
	await saveBlueBubblesCatchupCursor(accountId, nextCursorMs, retriesToPersist).catch((err) => {
		error?.(`[${accountId}] BlueBubbles catchup: cursor save failed: ${String(err)}`);
	});
	log?.(`[${accountId}] BlueBubbles catchup: replayed=${summary.replayed} skipped_fromMe=${summary.skippedFromMe} skipped_preCursor=${summary.skippedPreCursor} skipped_givenUp=${summary.skippedGivenUp} failed=${summary.failed} given_up=${summary.givenUp} fetched=${summary.fetchedCount} window_ms=${nowMs - windowStartMs}`);
	if (isTruncated) error?.(`[${accountId}] BlueBubbles catchup: WARNING fetched=${summary.fetchedCount} hit perRunLimit=${perRunLimit}; cursor advanced only to page boundary, remaining messages will be picked up on next startup. Raise channels.bluebubbles...catchup.perRunLimit to drain larger backlogs in a single pass.`);
	return summary;
}
//#endregion
//#region extensions/bluebubbles/src/monitor-debounce.ts
function normalizeDebounceMessageText(text) {
	return typeof text === "string" ? text : "";
}
function sanitizeDebounceEntry(entry) {
	if (typeof entry.message.text === "string") return entry;
	return {
		...entry,
		message: {
			...entry.message,
			text: ""
		}
	};
}
/**
* Default debounce window for inbound message coalescing (ms).
* This helps combine URL text + link preview balloon messages that BlueBubbles
* sends as separate webhook events when no explicit inbound debounce config exists.
*/
const DEFAULT_INBOUND_DEBOUNCE_MS = 500;
/**
* Combines multiple debounced messages into a single message for processing.
* Used when multiple webhook events arrive within the debounce window.
*/
function combineDebounceEntries(entries) {
	if (entries.length === 0) throw new Error("Cannot combine empty entries");
	if (entries.length === 1) return entries[0].message;
	const first = entries[0].message;
	const seenTexts = /* @__PURE__ */ new Set();
	const textParts = [];
	for (const entry of entries) {
		const text = normalizeDebounceMessageText(entry.message.text).trim();
		if (!text) continue;
		const normalizedText = normalizeLowercaseStringOrEmpty(text);
		if (seenTexts.has(normalizedText)) continue;
		seenTexts.add(normalizedText);
		textParts.push(text);
	}
	const allAttachments = entries.flatMap((e) => e.message.attachments ?? []);
	const timestamps = entries.map((e) => e.message.timestamp).filter((t) => typeof t === "number");
	const latestTimestamp = timestamps.length > 0 ? Math.max(...timestamps) : first.timestamp;
	const messageId = entries.map((e) => e.message.messageId).find((id) => Boolean(id));
	const entryWithReply = entries.find((e) => e.message.replyToId);
	return {
		...first,
		text: textParts.join(" "),
		attachments: allAttachments.length > 0 ? allAttachments : first.attachments,
		timestamp: latestTimestamp,
		messageId: messageId ?? first.messageId,
		replyToId: entryWithReply?.message.replyToId ?? first.replyToId,
		replyToBody: entryWithReply?.message.replyToBody ?? first.replyToBody,
		replyToSender: entryWithReply?.message.replyToSender ?? first.replyToSender,
		balloonBundleId: void 0
	};
}
function resolveBlueBubblesDebounceMs(config, core) {
	const inbound = config.messages?.inbound;
	if (!(typeof inbound?.debounceMs === "number" || typeof inbound?.byChannel?.bluebubbles === "number")) return DEFAULT_INBOUND_DEBOUNCE_MS;
	return core.channel.debounce.resolveInboundDebounceMs({
		cfg: config,
		channel: "bluebubbles"
	});
}
function createBlueBubblesDebounceRegistry(params) {
	const targetDebouncers = /* @__PURE__ */ new Map();
	return {
		getOrCreateDebouncer: (target) => {
			const existing = targetDebouncers.get(target);
			if (existing) return existing;
			const { account, config, runtime, core } = target;
			const baseDebouncer = core.channel.debounce.createInboundDebouncer({
				debounceMs: resolveBlueBubblesDebounceMs(config, core),
				buildKey: (entry) => {
					const msg = entry.message;
					const balloonBundleId = msg.balloonBundleId?.trim();
					const associatedMessageGuid = msg.associatedMessageGuid?.trim();
					if (balloonBundleId && associatedMessageGuid) return `bluebubbles:${account.accountId}:msg:${associatedMessageGuid}`;
					const messageId = msg.messageId?.trim();
					if (messageId) return `bluebubbles:${account.accountId}:msg:${messageId}`;
					const chatKey = msg.chatGuid?.trim() ?? msg.chatIdentifier?.trim() ?? (msg.chatId ? String(msg.chatId) : "dm");
					return `bluebubbles:${account.accountId}:${chatKey}:${msg.senderId}`;
				},
				shouldDebounce: (entry) => {
					const msg = entry.message;
					if (msg.fromMe) return false;
					if (core.channel.text.hasControlCommand(msg.text, config)) return false;
					return true;
				},
				onFlush: async (entries) => {
					if (entries.length === 0) return;
					const flushTarget = entries[0].target;
					if (entries.length === 1) {
						await params.processMessage(entries[0].message, flushTarget);
						return;
					}
					const combined = combineDebounceEntries(entries);
					if (core.logging.shouldLogVerbose()) {
						const count = entries.length;
						const preview = combined.text.slice(0, 50);
						runtime.log?.(`[bluebubbles] coalesced ${count} messages: "${preview}${combined.text.length > 50 ? "..." : ""}"`);
					}
					await params.processMessage(combined, flushTarget);
				},
				onError: (err) => {
					runtime.error?.(`[${account.accountId}] [bluebubbles] debounce flush failed: ${String(err)}`);
				}
			});
			const debouncer = {
				enqueue: async (item) => {
					await baseDebouncer.enqueue(sanitizeDebounceEntry(item));
				},
				flushKey: (key) => baseDebouncer.flushKey(key)
			};
			targetDebouncers.set(target, debouncer);
			return debouncer;
		},
		removeDebouncer: (target) => {
			targetDebouncers.delete(target);
		}
	};
}
//#endregion
//#region extensions/bluebubbles/src/monitor.ts
const webhookTargets = /* @__PURE__ */ new Map();
const webhookRateLimiter = createFixedWindowRateLimiter({
	windowMs: WEBHOOK_RATE_LIMIT_DEFAULTS.windowMs,
	maxRequests: WEBHOOK_RATE_LIMIT_DEFAULTS.maxRequests,
	maxTrackedKeys: WEBHOOK_RATE_LIMIT_DEFAULTS.maxTrackedKeys
});
const webhookInFlightLimiter = createWebhookInFlightLimiter();
const debounceRegistry = createBlueBubblesDebounceRegistry({ processMessage });
function registerBlueBubblesWebhookTarget(target) {
	const registered = registerWebhookTargetWithPluginRoute({
		targetsByPath: webhookTargets,
		target,
		route: {
			auth: "plugin",
			match: "exact",
			pluginId: "bluebubbles",
			source: "bluebubbles-webhook",
			accountId: target.account.accountId,
			log: target.runtime.log,
			handler: async (req, res) => {
				if (!await handleBlueBubblesWebhookRequest(req, res) && !res.headersSent) {
					res.statusCode = 404;
					res.setHeader("Content-Type", "text/plain; charset=utf-8");
					res.end("Not Found");
				}
			}
		}
	});
	return () => {
		registered.unregister();
		debounceRegistry.removeDebouncer(registered.target);
	};
}
function parseBlueBubblesWebhookPayload(rawBody) {
	const trimmed = rawBody.trim();
	if (!trimmed) return {
		ok: false,
		error: "empty payload"
	};
	try {
		return {
			ok: true,
			value: JSON.parse(trimmed)
		};
	} catch {
		const params = new URLSearchParams(rawBody);
		const payload = params.get("payload") ?? params.get("data") ?? params.get("message");
		if (!payload) return {
			ok: false,
			error: "invalid json"
		};
		try {
			return {
				ok: true,
				value: JSON.parse(payload)
			};
		} catch (error) {
			return {
				ok: false,
				error: formatErrorMessage(error)
			};
		}
	}
}
function maskSecret(value) {
	if (value.length <= 6) return "***";
	return `${value.slice(0, 2)}***${value.slice(-2)}`;
}
function normalizeAuthToken(raw) {
	const value = raw.trim();
	if (!value) return "";
	if (normalizeLowercaseStringOrEmpty(value).startsWith("bearer ")) return value.slice(7).trim();
	return value;
}
function safeEqualAuthToken(aRaw, bRaw) {
	const a = normalizeAuthToken(aRaw);
	const b = normalizeAuthToken(bRaw);
	if (!a || !b) return false;
	return safeEqualSecret(a, b);
}
function collectTrustedProxies(targets) {
	const proxies = /* @__PURE__ */ new Set();
	for (const target of targets) for (const proxy of target.config.gateway?.trustedProxies ?? []) {
		const normalized = proxy.trim();
		if (normalized) proxies.add(normalized);
	}
	return [...proxies];
}
function resolveWebhookAllowRealIpFallback(targets) {
	return targets.some((target) => target.config.gateway?.allowRealIpFallback === true);
}
function resolveWebhookClientIp(req, trustedProxies, allowRealIpFallback) {
	if (!req.headers["x-forwarded-for"] && !(allowRealIpFallback && req.headers["x-real-ip"])) return req.socket.remoteAddress ?? "unknown";
	return resolveRequestClientIp(req, [...trustedProxies], allowRealIpFallback) ?? req.socket.remoteAddress ?? "unknown";
}
async function handleBlueBubblesWebhookRequest(req, res) {
	const requestUrl = new URL(req.url ?? "/", "http://localhost");
	const normalizedPath = normalizeWebhookPath(requestUrl.pathname);
	const pathTargets = webhookTargets.get(normalizedPath) ?? [];
	const clientIp = resolveWebhookClientIp(req, collectTrustedProxies(pathTargets), resolveWebhookAllowRealIpFallback(pathTargets));
	return await withResolvedWebhookRequestPipeline({
		req,
		res,
		targetsByPath: webhookTargets,
		allowMethods: ["POST"],
		rateLimiter: webhookRateLimiter,
		rateLimitKey: `${normalizedPath}:${clientIp}`,
		inFlightLimiter: webhookInFlightLimiter,
		inFlightKey: `${normalizedPath}:${clientIp}`,
		handle: async ({ path, targets }) => {
			const url = requestUrl;
			const guidParam = url.searchParams.get("guid") ?? url.searchParams.get("password");
			const headerToken = req.headers["x-guid"] ?? req.headers["x-password"] ?? req.headers["x-bluebubbles-guid"] ?? req.headers["authorization"];
			const guid = (Array.isArray(headerToken) ? headerToken[0] : headerToken) ?? guidParam ?? "";
			const target = resolveWebhookTargetWithAuthOrRejectSync({
				targets,
				res,
				isMatch: (target) => {
					return safeEqualAuthToken(guid, target.account.config.password?.trim() ?? "");
				}
			});
			if (!target) {
				console.warn(`[bluebubbles] webhook rejected: status=${res.statusCode} path=${path} guid=${maskSecret(url.searchParams.get("guid") ?? url.searchParams.get("password") ?? "")}`);
				return true;
			}
			const body = await readWebhookBodyOrReject({
				req,
				res,
				profile: "post-auth",
				invalidBodyMessage: "invalid payload"
			});
			if (!body.ok) {
				console.warn(`[bluebubbles] webhook rejected: status=${res.statusCode}`);
				return true;
			}
			const parsed = parseBlueBubblesWebhookPayload(body.value);
			if (!parsed.ok) {
				res.statusCode = 400;
				res.end(parsed.error);
				console.warn(`[bluebubbles] webhook rejected: ${parsed.error}`);
				return true;
			}
			const payload = asRecord(parsed.value) ?? {};
			const firstTarget = targets[0];
			if (firstTarget) logVerbose(firstTarget.core, firstTarget.runtime, `webhook received path=${path} keys=${Object.keys(payload).join(",") || "none"}`);
			const eventTypeRaw = payload.type;
			const eventType = typeof eventTypeRaw === "string" ? eventTypeRaw.trim() : "";
			if (eventType && !new Set([
				"new-message",
				"updated-message",
				"message-reaction",
				"reaction"
			]).has(eventType)) {
				res.statusCode = 200;
				res.end("ok");
				if (firstTarget) logVerbose(firstTarget.core, firstTarget.runtime, `webhook ignored type=${eventType}`);
				return true;
			}
			const reaction = normalizeWebhookReaction(payload);
			const message = reaction ? null : normalizeWebhookMessage(payload, { eventType });
			const isAttachmentUpdate = eventType === "updated-message" && (message?.attachments?.length ?? 0) > 0;
			if ((eventType === "updated-message" || eventType === "message-reaction" || eventType === "reaction") && !reaction && !isAttachmentUpdate) {
				res.statusCode = 200;
				res.end("ok");
				if (firstTarget) logVerbose(firstTarget.core, firstTarget.runtime, `webhook ignored ${eventType || "event"} (no reaction or attachment update)`);
				return true;
			}
			if (!message && !reaction) {
				res.statusCode = 400;
				res.end("invalid payload");
				console.warn("[bluebubbles] webhook rejected: unable to parse message payload");
				return true;
			}
			target.statusSink?.({ lastInboundAt: Date.now() });
			if (reaction) processReaction(reaction, target).catch((err) => {
				target.runtime.error?.(`[${target.account.accountId}] BlueBubbles reaction failed: ${String(err)}`);
			});
			else if (message) debounceRegistry.getOrCreateDebouncer(target).enqueue({
				message,
				target
			}).catch((err) => {
				target.runtime.error?.(`[${target.account.accountId}] BlueBubbles webhook failed: ${String(err)}`);
			});
			res.statusCode = 200;
			res.end("ok");
			if (reaction) {
				if (firstTarget) logVerbose(firstTarget.core, firstTarget.runtime, `webhook accepted reaction sender=${reaction.senderId} msg=${reaction.messageId} action=${reaction.action}`);
			} else if (message) {
				if (firstTarget) logVerbose(firstTarget.core, firstTarget.runtime, `webhook accepted sender=${message.senderId} group=${message.isGroup} chatGuid=${message.chatGuid ?? ""} chatId=${message.chatId ?? ""}`);
			}
			return true;
		}
	});
}
async function monitorBlueBubblesProvider(options) {
	const { account, config, runtime, abortSignal, statusSink } = options;
	const core = getBlueBubblesRuntime();
	const path = options.webhookPath?.trim() || "/bluebubbles-webhook";
	const allowPrivateNetwork = resolveBlueBubblesEffectiveAllowPrivateNetwork({
		baseUrl: account.baseUrl,
		config: account.config
	});
	const serverInfo = await fetchBlueBubblesServerInfo({
		baseUrl: account.baseUrl,
		password: account.config.password,
		accountId: account.accountId,
		timeoutMs: 5e3,
		allowPrivateNetwork
	}).catch(() => null);
	if (serverInfo?.os_version) runtime.log?.(`[${account.accountId}] BlueBubbles server macOS ${serverInfo.os_version}`);
	if (typeof serverInfo?.private_api === "boolean") runtime.log?.(`[${account.accountId}] BlueBubbles Private API ${serverInfo.private_api ? "enabled" : "disabled"}`);
	const target = {
		account,
		config,
		runtime,
		core,
		path,
		statusSink
	};
	const unregister = registerBlueBubblesWebhookTarget(target);
	return await new Promise((resolve) => {
		const stop = () => {
			unregister();
			resolve();
		};
		if (abortSignal?.aborted) {
			stop();
			return;
		}
		abortSignal?.addEventListener("abort", stop, { once: true });
		runtime.log?.(`[${account.accountId}] BlueBubbles webhook listening on ${normalizeWebhookPath(path)}`);
		runBlueBubblesCatchup(target).catch((err) => {
			runtime.error?.(`[${account.accountId}] BlueBubbles catchup: unexpected failure: ${String(err)}`);
		});
	});
}
//#endregion
//#region extensions/bluebubbles/src/channel.runtime.ts
const blueBubblesChannelRuntime = {
	sendBlueBubblesMedia,
	resolveBlueBubblesMessageId,
	monitorBlueBubblesProvider,
	resolveWebhookPathFromConfig,
	probeBlueBubbles,
	sendMessageBlueBubbles
};
//#endregion
export { blueBubblesChannelRuntime };
