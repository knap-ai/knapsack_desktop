import { _ as resolveStateDir } from "./paths-B2cMK-wd.js";
import { i as formatErrorMessage } from "./errors-CDFVCV9D.js";
import { t as createSubsystemLogger } from "./subsystem-rHhUC6qs.js";
import { p as resolveSessionAgentId } from "./agent-scope-i10se9ty.js";
import { i as normalizeChannelId, t as getChannelPlugin } from "./registry-yTN80EXi.js";
import "./plugins-D-K4uCVI.js";
import { t as finalizeInboundContext } from "./inbound-context-BSjNVUNw.js";
import { r as mergeDeliveryContext, t as deliveryContextFromSession } from "./delivery-context.shared-Bmv0a_G3.js";
import { n as resolveMainSessionKeyFromConfig } from "./sessions-CLHVJJOI.js";
import { t as parseSessionThreadInfo } from "./thread-info-Dl1e71Qh.js";
import { a as loadSessionEntry } from "./session-utils-r05OsxB5.js";
import { a as formatRestartSentinelMessage, c as readRestartSentinel, f as summarizeRestartSentinel, l as removeRestartSentinelFile, r as finalizeUpdateRestartSentinelRunningVersion, u as resolveRestartSentinelPath } from "./restart-sentinel-xJkrCnsf.js";
import { t as deliverOutboundPayloads } from "./deliver-W8vl_gyO.js";
import { a as generateSecureUuid } from "./secure-random-BJA7KabS.js";
import { c as enqueueDelivery, s as ackDelivery, u as failDelivery } from "./delivery-queue-C0acLSxc.js";
import { t as buildOutboundSessionContext } from "./session-context-DhNm8AQH.js";
import { r as resolveOutboundTarget } from "./targets-CrrO3SQE.js";
import { n as requestHeartbeatNow } from "./heartbeat-wake-FxHI2o_9.js";
import { i as enqueueSystemEvent } from "./system-events-BOVw40Do.js";
import { t as dispatchReplyWithBufferedBlockDispatcher } from "./provider-dispatcher-Bvzf8sXR.js";
import { t as recordInboundSession } from "./session-BIs3Awn3.js";
import { i as recordInboundSessionAndDispatchReply } from "./inbound-reply-dispatch-BJCyKZ9L.js";
import { t as runStartupTasks } from "./startup-tasks-SnvEADFF.js";
import { n as timestampOptsFromConfig, t as injectTimestamp } from "./agent-timestamp-C0DpoK16.js";
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
//#region src/infra/session-delivery-queue-storage.ts
const QUEUE_DIRNAME = "session-delivery-queue";
const FAILED_DIRNAME = "failed";
const TMP_SWEEP_MAX_AGE_MS = 5e3;
function getErrnoCode$1(err) {
	return err && typeof err === "object" && "code" in err ? String(err.code) : null;
}
function buildEntryId(idempotencyKey) {
	if (!idempotencyKey) return generateSecureUuid();
	return createHash("sha256").update(idempotencyKey).digest("hex");
}
async function unlinkBestEffort(filePath) {
	await fs.promises.unlink(filePath).catch(() => void 0);
}
async function unlinkStaleTmpBestEffort(filePath, now) {
	try {
		const stat = await fs.promises.stat(filePath);
		if (!stat.isFile()) return;
		if (now - stat.mtimeMs < TMP_SWEEP_MAX_AGE_MS) return;
		await unlinkBestEffort(filePath);
	} catch (err) {
		if (getErrnoCode$1(err) !== "ENOENT") throw err;
	}
}
async function writeQueueEntry(filePath, entry) {
	const tmp = `${filePath}.${process.pid}.tmp`;
	await fs.promises.writeFile(tmp, JSON.stringify(entry, null, 2), {
		encoding: "utf-8",
		mode: 384
	});
	await fs.promises.rename(tmp, filePath);
}
async function readQueueEntry(filePath) {
	return JSON.parse(await fs.promises.readFile(filePath, "utf-8"));
}
function resolveSessionDeliveryQueueDir(stateDir) {
	const base = stateDir ?? resolveStateDir();
	return path.join(base, QUEUE_DIRNAME);
}
function resolveFailedDir(stateDir) {
	return path.join(resolveSessionDeliveryQueueDir(stateDir), FAILED_DIRNAME);
}
function resolveQueueEntryPaths(id, stateDir) {
	const queueDir = resolveSessionDeliveryQueueDir(stateDir);
	return {
		jsonPath: path.join(queueDir, `${id}.json`),
		deliveredPath: path.join(queueDir, `${id}.delivered`)
	};
}
async function ensureSessionDeliveryQueueDir(stateDir) {
	const queueDir = resolveSessionDeliveryQueueDir(stateDir);
	await fs.promises.mkdir(queueDir, {
		recursive: true,
		mode: 448
	});
	await fs.promises.mkdir(resolveFailedDir(stateDir), {
		recursive: true,
		mode: 448
	});
	return queueDir;
}
async function enqueueSessionDelivery(params, stateDir) {
	const queueDir = await ensureSessionDeliveryQueueDir(stateDir);
	const id = buildEntryId(params.idempotencyKey);
	const filePath = path.join(queueDir, `${id}.json`);
	if (params.idempotencyKey) try {
		if ((await fs.promises.stat(filePath)).isFile()) return id;
	} catch (err) {
		if (getErrnoCode$1(err) !== "ENOENT") throw err;
	}
	await writeQueueEntry(filePath, {
		...params,
		id,
		enqueuedAt: Date.now(),
		retryCount: 0
	});
	return id;
}
async function ackSessionDelivery(id, stateDir) {
	const { jsonPath, deliveredPath } = resolveQueueEntryPaths(id, stateDir);
	try {
		await fs.promises.rename(jsonPath, deliveredPath);
	} catch (err) {
		if (getErrnoCode$1(err) === "ENOENT") {
			await unlinkBestEffort(deliveredPath);
			return;
		}
		throw err;
	}
	await unlinkBestEffort(deliveredPath);
}
async function failSessionDelivery(id, error, stateDir) {
	const filePath = path.join(resolveSessionDeliveryQueueDir(stateDir), `${id}.json`);
	const entry = await readQueueEntry(filePath);
	entry.retryCount += 1;
	entry.lastAttemptAt = Date.now();
	entry.lastError = error;
	await writeQueueEntry(filePath, entry);
}
async function loadPendingSessionDelivery(id, stateDir) {
	const { jsonPath } = resolveQueueEntryPaths(id, stateDir);
	try {
		if (!(await fs.promises.stat(jsonPath)).isFile()) return null;
		return await readQueueEntry(jsonPath);
	} catch (err) {
		if (getErrnoCode$1(err) === "ENOENT") return null;
		throw err;
	}
}
async function loadPendingSessionDeliveries(stateDir) {
	const queueDir = resolveSessionDeliveryQueueDir(stateDir);
	let files;
	try {
		files = await fs.promises.readdir(queueDir);
	} catch (err) {
		if (getErrnoCode$1(err) === "ENOENT") return [];
		throw err;
	}
	const now = Date.now();
	for (const file of files) if (file.endsWith(".delivered")) await unlinkBestEffort(path.join(queueDir, file));
	else if (file.endsWith(".tmp")) await unlinkStaleTmpBestEffort(path.join(queueDir, file), now);
	const entries = [];
	for (const file of files) {
		if (!file.endsWith(".json")) continue;
		const filePath = path.join(queueDir, file);
		try {
			if (!(await fs.promises.stat(filePath)).isFile()) continue;
			entries.push(await readQueueEntry(filePath));
		} catch {
			continue;
		}
	}
	return entries;
}
async function moveSessionDeliveryToFailed(id, stateDir) {
	const queueDir = resolveSessionDeliveryQueueDir(stateDir);
	const failedDir = resolveFailedDir(stateDir);
	await fs.promises.mkdir(failedDir, {
		recursive: true,
		mode: 448
	});
	await fs.promises.rename(path.join(queueDir, `${id}.json`), path.join(failedDir, `${id}.json`));
}
const BACKOFF_MS = [
	5e3,
	25e3,
	12e4,
	6e5
];
const drainInProgress = /* @__PURE__ */ new Map();
const entriesInProgress = /* @__PURE__ */ new Set();
function getErrnoCode(err) {
	return err && typeof err === "object" && "code" in err ? String(err.code) : null;
}
function createEmptyRecoverySummary() {
	return {
		recovered: 0,
		failed: 0,
		skippedMaxRetries: 0,
		deferredBackoff: 0
	};
}
function claimRecoveryEntry(entryId) {
	if (entriesInProgress.has(entryId)) return false;
	entriesInProgress.add(entryId);
	return true;
}
function releaseRecoveryEntry(entryId) {
	entriesInProgress.delete(entryId);
}
function computeSessionDeliveryBackoffMs(retryCount) {
	if (retryCount <= 0) return 0;
	return BACKOFF_MS[Math.min(retryCount - 1, BACKOFF_MS.length - 1)] ?? BACKOFF_MS.at(-1) ?? 0;
}
function isSessionDeliveryEligibleForRetry(entry, now) {
	const backoff = computeSessionDeliveryBackoffMs(entry.retryCount);
	if (backoff <= 0) return { eligible: true };
	if (entry.retryCount === 0 && entry.lastAttemptAt === void 0) return { eligible: true };
	const nextEligibleAt = (typeof entry.lastAttemptAt === "number" && entry.lastAttemptAt > 0 ? entry.lastAttemptAt : entry.enqueuedAt) + backoff;
	if (now >= nextEligibleAt) return { eligible: true };
	return {
		eligible: false,
		remainingBackoffMs: nextEligibleAt - now
	};
}
async function drainQueuedEntry(opts) {
	const { entry } = opts;
	try {
		await opts.deliver(entry);
		await ackSessionDelivery(entry.id, opts.stateDir);
		opts.onRecovered?.(entry);
		return "recovered";
	} catch (err) {
		const errMsg = formatErrorMessage(err);
		opts.onFailed?.(entry, errMsg);
		try {
			await failSessionDelivery(entry.id, errMsg, opts.stateDir);
			return "failed";
		} catch (failErr) {
			if (getErrnoCode(failErr) === "ENOENT") return "already-gone";
			return "failed";
		}
	}
}
async function drainPendingSessionDeliveries(opts) {
	if (drainInProgress.get(opts.drainKey)) {
		opts.log.info(`${opts.logLabel}: already in progress for ${opts.drainKey}, skipping`);
		return;
	}
	drainInProgress.set(opts.drainKey, true);
	try {
		const matchingEntries = (await loadPendingSessionDeliveries(opts.stateDir)).filter((entry) => opts.selectEntry(entry, Date.now()).match).toSorted((a, b) => a.enqueuedAt - b.enqueuedAt);
		for (const entry of matchingEntries) {
			if (!claimRecoveryEntry(entry.id)) {
				opts.log.info(`${opts.logLabel}: entry ${entry.id} is already being recovered`);
				continue;
			}
			try {
				const currentEntry = await loadPendingSessionDelivery(entry.id, opts.stateDir);
				if (!currentEntry) continue;
				const currentDecision = opts.selectEntry(currentEntry, Date.now());
				if (!currentDecision.match) continue;
				if (currentEntry.retryCount >= 5) {
					try {
						await moveSessionDeliveryToFailed(currentEntry.id, opts.stateDir);
					} catch (err) {
						if (getErrnoCode(err) !== "ENOENT") throw err;
					}
					opts.log.warn(`${opts.logLabel}: entry ${currentEntry.id} exceeded max retries and was moved to failed/`);
					continue;
				}
				if (!currentDecision.bypassBackoff) {
					const retryEligibility = isSessionDeliveryEligibleForRetry(currentEntry, Date.now());
					if (!retryEligibility.eligible) {
						opts.log.info(`${opts.logLabel}: entry ${currentEntry.id} not ready for retry yet — backoff ${retryEligibility.remainingBackoffMs}ms remaining`);
						continue;
					}
				}
				await drainQueuedEntry({
					entry: currentEntry,
					deliver: opts.deliver,
					stateDir: opts.stateDir,
					onFailed: (failedEntry, errMsg) => {
						opts.log.warn(`${opts.logLabel}: retry failed for entry ${failedEntry.id}: ${errMsg}`);
					}
				});
			} finally {
				releaseRecoveryEntry(entry.id);
			}
		}
	} finally {
		drainInProgress.delete(opts.drainKey);
	}
}
async function recoverPendingSessionDeliveries(opts) {
	const pending = (await loadPendingSessionDeliveries(opts.stateDir)).filter((entry) => opts.maxEnqueuedAt == null || entry.enqueuedAt <= opts.maxEnqueuedAt);
	if (pending.length === 0) return createEmptyRecoverySummary();
	pending.sort((a, b) => a.enqueuedAt - b.enqueuedAt);
	const summary = createEmptyRecoverySummary();
	const deadline = Date.now() + (opts.maxRecoveryMs ?? 6e4);
	for (const entry of pending) {
		if (Date.now() >= deadline) {
			opts.log.warn("Session delivery recovery time budget exceeded — remaining entries deferred");
			break;
		}
		if (!claimRecoveryEntry(entry.id)) continue;
		try {
			const currentEntry = await loadPendingSessionDelivery(entry.id, opts.stateDir);
			if (!currentEntry) continue;
			if (opts.maxEnqueuedAt != null && currentEntry.enqueuedAt > opts.maxEnqueuedAt) continue;
			if (currentEntry.retryCount >= 5) {
				summary.skippedMaxRetries += 1;
				try {
					await moveSessionDeliveryToFailed(currentEntry.id, opts.stateDir);
				} catch (err) {
					if (getErrnoCode(err) !== "ENOENT") throw err;
				}
				continue;
			}
			if (!isSessionDeliveryEligibleForRetry(currentEntry, Date.now()).eligible) {
				summary.deferredBackoff += 1;
				continue;
			}
			if (await drainQueuedEntry({
				entry: currentEntry,
				deliver: opts.deliver,
				stateDir: opts.stateDir,
				onRecovered: () => {
					summary.recovered += 1;
				},
				onFailed: (_failedEntry, errMsg) => {
					summary.failed += 1;
					opts.log.warn(`Session delivery retry failed: ${errMsg}`);
				}
			}) === "recovered") opts.log.info(`Recovered session delivery ${currentEntry.id}`);
		} finally {
			releaseRecoveryEntry(entry.id);
		}
	}
	return summary;
}
//#endregion
//#region src/gateway/server-restart-sentinel.ts
const log = createSubsystemLogger("gateway/restart-sentinel");
const OUTBOUND_RETRY_DELAY_MS = 1e3;
const OUTBOUND_MAX_ATTEMPTS = 45;
let latestUpdateRestartSentinel = null;
function cloneRestartSentinelPayload(payload) {
	if (!payload) return null;
	return JSON.parse(JSON.stringify(payload));
}
function hasRoutableDeliveryContext(context) {
	return Boolean(context?.channel && context?.to);
}
function enqueueRestartSentinelWake(message, sessionKey, deliveryContext) {
	enqueueSystemEvent(message, {
		sessionKey,
		...deliveryContext ? { deliveryContext } : {}
	});
	requestHeartbeatNow({
		reason: "wake",
		sessionKey
	});
}
async function waitForOutboundRetry(delayMs) {
	await new Promise((resolve) => {
		setTimeout(resolve, delayMs).unref?.();
	});
}
async function deliverRestartSentinelNotice(params) {
	const payloads = [{ text: params.message }];
	const queueId = await enqueueDelivery({
		channel: params.channel,
		to: params.to,
		accountId: params.accountId,
		replyToId: params.replyToId,
		threadId: params.threadId,
		payloads,
		bestEffort: false
	}).catch(() => null);
	for (let attempt = 1; attempt <= OUTBOUND_MAX_ATTEMPTS; attempt += 1) try {
		if ((await deliverOutboundPayloads({
			cfg: params.cfg,
			channel: params.channel,
			to: params.to,
			accountId: params.accountId,
			replyToId: params.replyToId,
			threadId: params.threadId,
			payloads,
			session: params.session,
			deps: params.deps,
			bestEffort: false,
			skipQueue: true
		})).length > 0) {
			if (queueId) await ackDelivery(queueId).catch(() => {});
			return;
		}
		throw new Error("outbound delivery returned no results");
	} catch (err) {
		const retrying = attempt < OUTBOUND_MAX_ATTEMPTS;
		const suffix = retrying ? `; retrying in ${OUTBOUND_RETRY_DELAY_MS}ms` : "";
		log.warn(`${params.summary}: outbound delivery failed${suffix}: ${String(err)}`, {
			channel: params.channel,
			to: params.to,
			sessionKey: params.sessionKey,
			attempt,
			maxAttempts: OUTBOUND_MAX_ATTEMPTS
		});
		if (!retrying) {
			if (queueId) await failDelivery(queueId, formatErrorMessage(err)).catch(() => void 0);
			return;
		}
		await waitForOutboundRetry(OUTBOUND_RETRY_DELAY_MS);
	}
}
function buildRestartContinuationMessageId(params) {
	return `restart-sentinel:${params.sessionKey}:${params.kind}:${params.ts}`;
}
function resolveRestartContinuationRoute(params) {
	if (!params.channel || !params.to) return;
	return {
		channel: params.channel,
		to: params.to,
		...params.accountId ? { accountId: params.accountId } : {},
		...params.replyToId ? { replyToId: params.replyToId } : {},
		...params.threadId ? { threadId: params.threadId } : {},
		chatType: params.chatType
	};
}
function resolveRestartContinuationOutboundPayload(params) {
	if (params.payload.replyToId !== params.messageId) return params.payload;
	const payload = { ...params.payload };
	delete payload.replyToId;
	return params.replyToId ? {
		...payload,
		replyToId: params.replyToId
	} : payload;
}
function resolveQueuedSessionDeliveryContext(entry) {
	if (entry.kind === "agentTurn" && entry.route) return {
		channel: entry.route.channel,
		to: entry.route.to,
		...entry.route.accountId ? { accountId: entry.route.accountId } : {},
		...entry.route.threadId ? { threadId: entry.route.threadId } : {}
	};
	return entry.deliveryContext;
}
async function deliverQueuedSessionDelivery(params) {
	const { cfg, storePath, canonicalKey } = loadSessionEntry(params.entry.sessionKey);
	const queuedDeliveryContext = resolveQueuedSessionDeliveryContext(params.entry);
	if (params.entry.kind === "systemEvent") {
		enqueueSystemEvent(params.entry.text, {
			sessionKey: canonicalKey,
			...queuedDeliveryContext ? { deliveryContext: { ...queuedDeliveryContext } } : {}
		});
		requestHeartbeatNow({
			reason: "wake",
			sessionKey: canonicalKey
		});
		return;
	}
	if (!params.entry.route) {
		enqueueSystemEvent(params.entry.message, {
			sessionKey: canonicalKey,
			...queuedDeliveryContext ? { deliveryContext: { ...queuedDeliveryContext } } : {}
		});
		requestHeartbeatNow({
			reason: "wake",
			sessionKey: canonicalKey
		});
		return;
	}
	const route = params.entry.route;
	const messageId = params.entry.messageId;
	const userMessage = params.entry.message.trim();
	const agentId = resolveSessionAgentId({
		sessionKey: canonicalKey,
		config: cfg
	});
	let dispatchError;
	await recordInboundSessionAndDispatchReply({
		cfg,
		channel: route.channel,
		accountId: route.accountId,
		agentId,
		routeSessionKey: canonicalKey,
		storePath,
		ctxPayload: finalizeInboundContext({
			Body: userMessage,
			BodyForAgent: injectTimestamp(userMessage, timestampOptsFromConfig(cfg)),
			BodyForCommands: "",
			RawBody: userMessage,
			CommandBody: "",
			SessionKey: canonicalKey,
			AccountId: route.accountId,
			MessageSid: messageId,
			Timestamp: Date.now(),
			Provider: route.channel,
			Surface: route.channel,
			ChatType: route.chatType,
			CommandAuthorized: false,
			ReplyToId: route.replyToId,
			OriginatingChannel: route.channel,
			OriginatingTo: route.to,
			ExplicitDeliverRoute: true,
			MessageThreadId: route.threadId
		}, {
			forceBodyForCommands: true,
			forceChatType: true
		}),
		recordInboundSession,
		dispatchReplyWithBufferedBlockDispatcher,
		deliver: async (payload) => {
			const outboundPayload = resolveRestartContinuationOutboundPayload({
				payload,
				messageId,
				replyToId: route.replyToId
			});
			if ((await deliverOutboundPayloads({
				cfg,
				channel: route.channel,
				to: route.to,
				accountId: route.accountId,
				replyToId: route.replyToId,
				threadId: route.threadId,
				payloads: [outboundPayload],
				session: buildOutboundSessionContext({
					cfg,
					sessionKey: canonicalKey
				}),
				deps: params.deps,
				bestEffort: false
			})).length === 0) throw new Error("restart continuation delivery returned no results");
		},
		onRecordError: (err) => {
			log.warn(`restart continuation failed to record inbound session metadata: ${String(err)}`, { sessionKey: canonicalKey });
		},
		onDispatchError: (err) => {
			dispatchError ??= err;
		}
	});
	if (dispatchError) throw dispatchError;
}
function buildQueuedRestartContinuation(params) {
	const idempotencyKey = buildRestartContinuationMessageId({
		sessionKey: params.sessionKey,
		kind: params.continuation.kind,
		ts: params.ts
	});
	if (params.continuation.kind === "systemEvent") return {
		kind: "systemEvent",
		sessionKey: params.sessionKey,
		text: params.continuation.text,
		...params.deliveryContext ? { deliveryContext: params.deliveryContext } : {},
		idempotencyKey
	};
	return {
		kind: "agentTurn",
		sessionKey: params.sessionKey,
		message: params.continuation.message,
		messageId: idempotencyKey,
		...params.route ? { route: params.route } : {},
		...params.deliveryContext ? { deliveryContext: params.deliveryContext } : {},
		idempotencyKey
	};
}
async function drainRestartContinuationQueue(params) {
	await drainPendingSessionDeliveries({
		drainKey: `restart-continuation:${params.entryId}`,
		logLabel: "restart continuation",
		log: params.log,
		deliver: (entry) => deliverQueuedSessionDelivery({
			deps: params.deps,
			entry
		}),
		selectEntry: (entry) => ({
			match: entry.id === params.entryId,
			bypassBackoff: true
		})
	});
}
async function recoverPendingRestartContinuationDeliveries(params) {
	await recoverPendingSessionDeliveries({
		deliver: (entry) => deliverQueuedSessionDelivery({
			deps: params.deps,
			entry
		}),
		log: params.log ?? log,
		maxEnqueuedAt: params.maxEnqueuedAt
	});
}
async function loadRestartSentinelStartupTask(params) {
	const sentinel = await readRestartSentinel();
	if (!sentinel) return null;
	const sentinelPath = resolveRestartSentinelPath();
	const payload = sentinel.payload;
	const sessionKey = payload.sessionKey?.trim();
	const message = formatRestartSentinelMessage(payload);
	const summary = summarizeRestartSentinel(payload);
	const wakeDeliveryContext = mergeDeliveryContext(payload.threadId != null ? {
		...payload.deliveryContext,
		threadId: payload.threadId
	} : payload.deliveryContext, void 0);
	const run = async () => {
		if (!sessionKey) {
			const mainSessionKey = resolveMainSessionKeyFromConfig();
			enqueueSystemEvent(message, { sessionKey: mainSessionKey });
			if (payload.continuation) log.warn(`${summary}: continuation skipped: restart sentinel sessionKey unavailable`, {
				sessionKey: mainSessionKey,
				continuationKind: payload.continuation.kind
			});
			await removeRestartSentinelFile(sentinelPath);
			return { status: "ran" };
		}
		const { baseSessionKey, threadId: sessionThreadId } = parseSessionThreadInfo(sessionKey);
		const { cfg, entry, canonicalKey } = loadSessionEntry(sessionKey);
		const sentinelContext = payload.deliveryContext;
		let sessionDeliveryContext = deliveryContextFromSession(entry);
		let chatType = entry?.origin?.chatType ?? "direct";
		if (!hasRoutableDeliveryContext(sessionDeliveryContext) && baseSessionKey && baseSessionKey !== sessionKey) {
			const { entry: baseEntry } = loadSessionEntry(baseSessionKey);
			chatType = entry?.origin?.chatType ?? baseEntry?.origin?.chatType ?? "direct";
			sessionDeliveryContext = mergeDeliveryContext(sessionDeliveryContext, deliveryContextFromSession(baseEntry));
		}
		const origin = mergeDeliveryContext(sentinelContext, sessionDeliveryContext);
		const channelRaw = origin?.channel;
		const channel = channelRaw ? normalizeChannelId(channelRaw) : null;
		const to = origin?.to;
		const threadId = payload.threadId ?? sessionThreadId ?? (origin?.threadId != null ? String(origin.threadId) : void 0);
		let resolvedTo;
		let replyToId;
		let resolvedThreadId = threadId;
		let continuationQueueId;
		if (channel && to) {
			const resolved = resolveOutboundTarget({
				channel,
				to,
				cfg,
				accountId: origin?.accountId,
				mode: "implicit"
			});
			if (resolved.ok) {
				resolvedTo = resolved.to;
				const replyTransport = getChannelPlugin(channel)?.threading?.resolveReplyTransport?.({
					cfg,
					accountId: origin?.accountId,
					threadId
				}) ?? null;
				replyToId = replyTransport?.replyToId ?? void 0;
				resolvedThreadId = replyTransport && Object.hasOwn(replyTransport, "threadId") ? replyTransport.threadId != null ? String(replyTransport.threadId) : void 0 : threadId;
			}
		}
		if (payload.continuation) continuationQueueId = await enqueueSessionDelivery(buildQueuedRestartContinuation({
			sessionKey: canonicalKey,
			continuation: payload.continuation,
			ts: payload.ts,
			route: resolveRestartContinuationRoute({
				channel: channel ?? void 0,
				to: resolvedTo,
				accountId: origin?.accountId,
				replyToId,
				threadId: resolvedThreadId,
				chatType
			}),
			deliveryContext: resolvedTo && channel ? {
				channel,
				to: resolvedTo,
				...origin?.accountId ? { accountId: origin.accountId } : {},
				...resolvedThreadId ? { threadId: resolvedThreadId } : {}
			} : wakeDeliveryContext
		}));
		await removeRestartSentinelFile(sentinelPath);
		enqueueRestartSentinelWake(message, sessionKey, wakeDeliveryContext);
		if (resolvedTo && channel) {
			const outboundSession = buildOutboundSessionContext({
				cfg,
				sessionKey: canonicalKey
			});
			await deliverRestartSentinelNotice({
				deps: params.deps,
				cfg,
				sessionKey: canonicalKey,
				summary,
				message,
				channel,
				to: resolvedTo,
				accountId: origin?.accountId,
				replyToId,
				threadId: resolvedThreadId,
				session: outboundSession
			});
		}
		if (continuationQueueId) await drainRestartContinuationQueue({
			deps: params.deps,
			entryId: continuationQueueId,
			log
		});
		return { status: "ran" };
	};
	return {
		source: "restart-sentinel",
		...sessionKey ? { sessionKey } : {},
		run
	};
}
async function scheduleRestartSentinelWake(params) {
	const task = await loadRestartSentinelStartupTask(params);
	if (!task) return;
	await runStartupTasks({
		tasks: [task],
		log
	});
}
async function refreshLatestUpdateRestartSentinel() {
	const sentinel = await finalizeUpdateRestartSentinelRunningVersion() ?? await readRestartSentinel();
	if (sentinel?.payload.kind === "update") latestUpdateRestartSentinel = cloneRestartSentinelPayload(sentinel.payload);
	return cloneRestartSentinelPayload(latestUpdateRestartSentinel);
}
function getLatestUpdateRestartSentinel() {
	return cloneRestartSentinelPayload(latestUpdateRestartSentinel);
}
function recordLatestUpdateRestartSentinel(payload) {
	latestUpdateRestartSentinel = cloneRestartSentinelPayload(payload);
}
//#endregion
export { scheduleRestartSentinelWake as a, refreshLatestUpdateRestartSentinel as i, recordLatestUpdateRestartSentinel as n, recoverPendingRestartContinuationDeliveries as r, getLatestUpdateRestartSentinel as t };
