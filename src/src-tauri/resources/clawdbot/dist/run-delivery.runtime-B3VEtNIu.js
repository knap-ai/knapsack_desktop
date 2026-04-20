import { i as formatErrorMessage } from "./errors-D8p6rxH8.js";
import { i as normalizeLowercaseStringOrEmpty, o as normalizeOptionalLowercaseString, s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { i as resolveMainSessionKey, n as resolveAgentMainSessionKey } from "./main-session-DtefsIzj.js";
import { n as sleepWithAbort } from "./backoff-DdY2WS-F.js";
import { a as isSilentReplyText, c as stripSilentToken, n as SILENT_REPLY_TOKEN, o as startsWithSilentToken, s as stripLeadingSilentToken } from "./tokens-CKM4Lddu.js";
import { a as normalizeTargetForProvider } from "./target-normalization-j5fHpTkf.js";
import { i as hasReplyPayloadContent } from "./payload-CS7dEmmu.js";
import { _ as resolveDeliveryTarget, l as hasScheduledNextRunAtMs } from "./jobs-ESUow8Zg.js";
import { n as pickLastNonEmptyTextFromPayloads, r as pickSummaryFromOutput } from "./helpers-CYnU2_ru.js";
import { n as isLikelyInterimCronMessage, t as expectsSubagentFollowup } from "./subagent-followup-hints-C0YI6gyy.js";
//#region src/cron/isolated-agent/delivery-dispatch.ts
function normalizeDeliveryTarget(channel, to) {
	const toTrimmed = to.trim();
	return normalizeTargetForProvider(channel, toTrimmed) ?? toTrimmed;
}
function normalizeSilentReplyText(text) {
	if (!text) return {
		text,
		strippedTrailingSilentToken: false
	};
	if (isSilentReplyText(text, "NO_REPLY")) return {
		text: void 0,
		strippedTrailingSilentToken: false
	};
	let next = text;
	const hasLeadingSilentToken = startsWithSilentToken(next, SILENT_REPLY_TOKEN);
	if (hasLeadingSilentToken) next = stripLeadingSilentToken(next, SILENT_REPLY_TOKEN);
	let strippedTrailingSilentToken = false;
	if (hasLeadingSilentToken || next.toLowerCase().includes("NO_REPLY".toLowerCase())) {
		const trimmedBefore = next.trim();
		const stripped = stripSilentToken(next, SILENT_REPLY_TOKEN);
		strippedTrailingSilentToken = stripped !== trimmedBefore;
		next = stripped;
	}
	if (!next.trim() || isSilentReplyText(next, "NO_REPLY")) return {
		text: void 0,
		strippedTrailingSilentToken
	};
	return {
		text: next,
		strippedTrailingSilentToken
	};
}
function matchesMessagingToolDeliveryTarget(target, delivery) {
	if (!delivery.channel || !delivery.to || !target.to) return false;
	const channel = normalizeLowercaseStringOrEmpty(delivery.channel);
	const provider = normalizeOptionalLowercaseString(target.provider);
	if (provider && provider !== "message" && provider !== channel) return false;
	if (target.accountId && delivery.accountId && target.accountId !== delivery.accountId) return false;
	return normalizeDeliveryTarget(channel, target.to.replace(/:topic:\d+$/, "")) === normalizeDeliveryTarget(channel, delivery.to);
}
function resolveCronDeliveryBestEffort(job) {
	return job.delivery?.bestEffort === true;
}
const TRANSIENT_DIRECT_CRON_DELIVERY_ERROR_PATTERNS = [
	/\berrorcode=unavailable\b/i,
	/\bstatus\s*[:=]\s*"?unavailable\b/i,
	/\bUNAVAILABLE\b/,
	/no active .* listener/i,
	/gateway not connected/i,
	/gateway closed \(1006/i,
	/gateway timeout/i,
	/\b(econnreset|econnrefused|etimedout|enotfound|ehostunreach|network error)\b/i
];
const PERMANENT_DIRECT_CRON_DELIVERY_ERROR_PATTERNS = [
	/unsupported channel/i,
	/unknown channel/i,
	/chat not found/i,
	/user not found/i,
	/bot.*not.*member/i,
	/bot was blocked by the user/i,
	/forbidden: bot was kicked/i,
	/recipient is not a valid/i,
	/outbound not configured for channel/i
];
const STALE_CRON_DELIVERY_MAX_START_DELAY_MS = 180 * 6e4;
let gatewayCallRuntimePromise;
let deliveryOutboundRuntimePromise;
let deliverySubagentRegistryRuntimePromise;
let deliveryLoggerRuntimePromise;
let subagentFollowupRuntimePromise;
const COMPLETED_DIRECT_CRON_DELIVERIES = /* @__PURE__ */ new Map();
async function loadGatewayCallRuntime() {
	gatewayCallRuntimePromise ??= import("./call.runtime-CZXt_hxp.js");
	return await gatewayCallRuntimePromise;
}
async function loadDeliveryOutboundRuntime() {
	deliveryOutboundRuntimePromise ??= import("./delivery-outbound.runtime-CiUEXPHz.js");
	return await deliveryOutboundRuntimePromise;
}
async function loadDeliverySubagentRegistryRuntime() {
	deliverySubagentRegistryRuntimePromise ??= import("./delivery-subagent-registry.runtime-D5LghaIJ.js");
	return await deliverySubagentRegistryRuntimePromise;
}
async function loadDeliveryLoggerRuntime() {
	deliveryLoggerRuntimePromise ??= import("./delivery-logger.runtime-whq1Z7Bi.js");
	return await deliveryLoggerRuntimePromise;
}
async function loadSubagentFollowupRuntime() {
	subagentFollowupRuntimePromise ??= import("./subagent-followup.runtime-BycHkblW.js");
	return await subagentFollowupRuntimePromise;
}
async function logCronDeliveryWarn(message) {
	const { logWarn } = await loadDeliveryLoggerRuntime();
	logWarn(message);
}
async function logCronDeliveryError(message) {
	const { logError } = await loadDeliveryLoggerRuntime();
	logError(message);
}
function logCronDeliveryErrorDeferred(message) {
	loadDeliveryLoggerRuntime().then(({ logError }) => {
		logError(message);
	});
}
function cloneDeliveryResults(results) {
	return results.map((result) => ({
		...result,
		...result.meta ? { meta: { ...result.meta } } : {}
	}));
}
function pruneCompletedDirectCronDeliveries(now) {
	const ttlMs = process.env.OPENCLAW_TEST_FAST === "1" ? 6e4 : 1440 * 60 * 1e3;
	for (const [key, entry] of COMPLETED_DIRECT_CRON_DELIVERIES) if (now - entry.ts >= ttlMs) COMPLETED_DIRECT_CRON_DELIVERIES.delete(key);
	const maxEntries = 2e3;
	if (COMPLETED_DIRECT_CRON_DELIVERIES.size <= maxEntries) return;
	const entries = [...COMPLETED_DIRECT_CRON_DELIVERIES.entries()].toSorted((a, b) => a[1].ts - b[1].ts);
	const toDelete = COMPLETED_DIRECT_CRON_DELIVERIES.size - maxEntries;
	for (let i = 0; i < toDelete; i += 1) {
		const oldest = entries[i];
		if (!oldest) break;
		COMPLETED_DIRECT_CRON_DELIVERIES.delete(oldest[0]);
	}
}
function resolveCronDeliveryScheduledAtMs(params) {
	const scheduledAt = params.job.state?.nextRunAtMs;
	return hasScheduledNextRunAtMs(scheduledAt) ? scheduledAt : params.runStartedAt;
}
function resolveCronDeliveryStartDelayMs(params) {
	return params.runStartedAt - resolveCronDeliveryScheduledAtMs(params);
}
function isStaleCronDelivery(params) {
	return resolveCronDeliveryStartDelayMs(params) > STALE_CRON_DELIVERY_MAX_START_DELAY_MS;
}
function rememberCompletedDirectCronDelivery(idempotencyKey, results) {
	const now = Date.now();
	COMPLETED_DIRECT_CRON_DELIVERIES.set(idempotencyKey, {
		ts: now,
		results: cloneDeliveryResults(results)
	});
	pruneCompletedDirectCronDeliveries(now);
}
function getCompletedDirectCronDelivery(idempotencyKey) {
	pruneCompletedDirectCronDeliveries(Date.now());
	const cached = COMPLETED_DIRECT_CRON_DELIVERIES.get(idempotencyKey);
	if (!cached) return;
	return cloneDeliveryResults(cached.results);
}
function buildDirectCronDeliveryIdempotencyKey(params) {
	const threadId = params.delivery.threadId == null || params.delivery.threadId === "" ? "" : String(params.delivery.threadId);
	const accountId = params.delivery.accountId?.trim() ?? "";
	const normalizedTo = normalizeDeliveryTarget(params.delivery.channel, params.delivery.to);
	return `cron-direct-delivery:v1:${params.runSessionId}:${params.delivery.channel}:${accountId}:${normalizedTo}:${threadId}`;
}
function shouldQueueCronAwareness(job, deliveryBestEffort) {
	return job.sessionTarget === "isolated" && !deliveryBestEffort;
}
function resolveCronAwarenessMainSessionKey(params) {
	return params.cfg.session?.scope === "global" ? resolveMainSessionKey(params.cfg) : resolveAgentMainSessionKey({
		cfg: params.cfg,
		agentId: params.agentId
	});
}
async function queueCronAwarenessSystemEvent(params) {
	const text = params.deliveryPayloads ? pickLastNonEmptyTextFromPayloads(params.deliveryPayloads) : normalizeOptionalString(params.outputText) ?? normalizeOptionalString(params.synthesizedText);
	if (!text) return;
	try {
		const { enqueueSystemEvent } = await loadDeliveryOutboundRuntime();
		enqueueSystemEvent(text, {
			sessionKey: resolveCronAwarenessMainSessionKey({
				cfg: params.cfg,
				agentId: params.agentId
			}),
			contextKey: params.deliveryIdempotencyKey
		});
	} catch (err) {
		await logCronDeliveryWarn(`[cron:${params.jobId}] failed to queue isolated cron awareness for the main session: ${formatErrorMessage(err)}`);
	}
}
function summarizeDirectCronDeliveryError(error) {
	if (error instanceof Error) return error.message || "error";
	if (typeof error === "string") return error;
	try {
		return JSON.stringify(error) || String(error);
	} catch {
		return String(error);
	}
}
function isTransientDirectCronDeliveryError(error) {
	const message = summarizeDirectCronDeliveryError(error);
	if (!message) return false;
	if (PERMANENT_DIRECT_CRON_DELIVERY_ERROR_PATTERNS.some((re) => re.test(message))) return false;
	return TRANSIENT_DIRECT_CRON_DELIVERY_ERROR_PATTERNS.some((re) => re.test(message));
}
function resolveDirectCronRetryDelaysMs() {
	return [
		5e3,
		1e4,
		2e4
	];
}
async function retryTransientDirectCronDelivery(params) {
	const retryDelaysMs = resolveDirectCronRetryDelaysMs();
	let retryIndex = 0;
	for (;;) {
		if (params.signal?.aborted) throw new Error("cron delivery aborted");
		try {
			return await params.run();
		} catch (err) {
			const delayMs = retryDelaysMs[retryIndex];
			if (delayMs == null || !isTransientDirectCronDeliveryError(err) || params.signal?.aborted) throw err;
			const nextAttempt = retryIndex + 2;
			const maxAttempts = retryDelaysMs.length + 1;
			await logCronDeliveryWarn(`[cron:${params.jobId}] transient direct announce delivery failure, retrying ${nextAttempt}/${maxAttempts} in ${Math.round(delayMs / 1e3)}s: ${summarizeDirectCronDeliveryError(err)}`);
			retryIndex += 1;
			await sleepWithAbort(delayMs, params.signal);
		}
	}
}
async function dispatchCronDelivery(params) {
	const skipMessagingToolDelivery = params.skipMessagingToolDelivery === true;
	let summary = params.summary;
	let outputText = params.outputText;
	let synthesizedText = params.synthesizedText;
	let deliveryPayloads = params.deliveryPayloads;
	let delivered = skipMessagingToolDelivery;
	let deliveryAttempted = skipMessagingToolDelivery;
	const failDeliveryTarget = (error) => params.withRunSession({
		status: "error",
		error,
		errorKind: "delivery-target",
		summary,
		outputText,
		deliveryAttempted,
		...params.telemetry
	});
	const cleanupDirectCronSessionIfNeeded = async () => {
		if (!params.job.deleteAfterRun) return;
		try {
			const { callGateway } = await loadGatewayCallRuntime();
			await callGateway({
				method: "sessions.delete",
				params: {
					key: params.agentSessionKey,
					deleteTranscript: true,
					emitLifecycleHooks: false
				},
				timeoutMs: 1e4
			});
		} catch {}
	};
	const finishSilentReplyDelivery = async () => {
		deliveryAttempted = true;
		await cleanupDirectCronSessionIfNeeded();
		return params.withRunSession({
			status: "ok",
			summary,
			outputText,
			delivered: false,
			deliveryAttempted: true,
			...params.telemetry
		});
	};
	const deliverViaDirect = async (delivery, options) => {
		const { buildOutboundSessionContext, createOutboundSendDeps, deliverOutboundPayloads, resolveAgentOutboundIdentity } = await loadDeliveryOutboundRuntime();
		const identity = resolveAgentOutboundIdentity(params.cfgWithAgentDefaults, params.agentId);
		const deliveryIdempotencyKey = buildDirectCronDeliveryIdempotencyKey({
			runSessionId: params.runSessionId,
			delivery
		});
		try {
			const payloadsForDelivery = (deliveryPayloads.length > 0 ? deliveryPayloads : synthesizedText ? [{ text: synthesizedText }] : []).map((p) => {
				if (!p.text) return p;
				const normalized = normalizeSilentReplyText(p.text);
				return {
					...p,
					text: normalized.strippedTrailingSilentToken ? void 0 : normalized.text
				};
			}).filter((p) => hasReplyPayloadContent(p, { trimText: true }));
			if (payloadsForDelivery.length === 0) return await finishSilentReplyDelivery();
			if (params.isAborted()) return params.withRunSession({
				status: "error",
				error: params.abortReason(),
				deliveryAttempted,
				...params.telemetry
			});
			if (params.deliveryRequested && isStaleCronDelivery({
				job: params.job,
				runStartedAt: params.runStartedAt
			})) {
				deliveryAttempted = true;
				const nowMs = Date.now();
				const scheduledAtMs = resolveCronDeliveryScheduledAtMs({
					job: params.job,
					runStartedAt: params.runStartedAt
				});
				const startDelayMs = resolveCronDeliveryStartDelayMs({
					job: params.job,
					runStartedAt: params.runStartedAt
				});
				await logCronDeliveryWarn(`[cron:${params.job.id}] skipping stale delivery scheduled at ${new Date(scheduledAtMs).toISOString()}, started ${Math.round(startDelayMs / 6e4)}m late, current age ${Math.round((nowMs - scheduledAtMs) / 6e4)}m`);
				return params.withRunSession({
					status: "ok",
					summary,
					outputText,
					deliveryAttempted,
					delivered: false,
					...params.telemetry
				});
			}
			deliveryAttempted = true;
			if (getCompletedDirectCronDelivery(deliveryIdempotencyKey)) {
				delivered = true;
				return null;
			}
			const deliverySession = buildOutboundSessionContext({
				cfg: params.cfgWithAgentDefaults,
				agentId: params.agentId,
				sessionKey: params.agentSessionKey
			});
			let hadPartialFailure = false;
			const onError = params.deliveryBestEffort ? (err, _payload) => {
				hadPartialFailure = true;
				logCronDeliveryErrorDeferred(`[cron:${params.job.id}] delivery payload failed (bestEffort): ${formatErrorMessage(err)}`);
			} : void 0;
			const runDelivery = async () => await deliverOutboundPayloads({
				cfg: params.cfgWithAgentDefaults,
				channel: delivery.channel,
				to: delivery.to,
				accountId: delivery.accountId,
				threadId: delivery.threadId,
				payloads: payloadsForDelivery,
				session: deliverySession,
				identity,
				bestEffort: params.deliveryBestEffort,
				deps: createOutboundSendDeps(params.deps),
				abortSignal: params.abortSignal,
				onError,
				skipQueue: true
			});
			const deliveryResults = options?.retryTransient ? await retryTransientDirectCronDelivery({
				jobId: params.job.id,
				signal: params.abortSignal,
				run: runDelivery
			}) : await runDelivery();
			delivered = deliveryResults.length > 0 && !hadPartialFailure;
			if (delivered && shouldQueueCronAwareness(params.job, params.deliveryBestEffort)) await queueCronAwarenessSystemEvent({
				cfg: params.cfgWithAgentDefaults,
				jobId: params.job.id,
				agentId: params.agentId,
				deliveryIdempotencyKey,
				outputText,
				synthesizedText,
				deliveryPayloads: payloadsForDelivery
			});
			if (delivered) rememberCompletedDirectCronDelivery(deliveryIdempotencyKey, deliveryResults);
			return null;
		} catch (err) {
			if (!params.deliveryBestEffort) return params.withRunSession({
				status: "error",
				summary,
				outputText,
				error: String(err),
				deliveryAttempted,
				...params.telemetry
			});
			await logCronDeliveryError(`[cron:${params.job.id}] delivery failed (bestEffort): ${formatErrorMessage(err)}`);
			return null;
		}
	};
	const finalizeTextDelivery = async (delivery) => {
		if (!synthesizedText) return null;
		const initialSynthesizedText = synthesizedText.trim();
		const expectedSubagentFollowup = expectsSubagentFollowup(initialSynthesizedText);
		const subagentRegistryRuntime = await loadDeliverySubagentRegistryRuntime();
		let activeSubagentRuns = subagentRegistryRuntime.countActiveDescendantRuns(params.agentSessionKey);
		const shouldCheckCompletedDescendants = activeSubagentRuns === 0 && isLikelyInterimCronMessage(initialSynthesizedText);
		const subagentFollowupRuntime = shouldCheckCompletedDescendants || activeSubagentRuns > 0 || expectedSubagentFollowup ? await loadSubagentFollowupRuntime() : void 0;
		const completedDescendantReply = shouldCheckCompletedDescendants ? await subagentFollowupRuntime?.readDescendantSubagentFallbackReply({
			sessionKey: params.agentSessionKey,
			runStartedAt: params.runStartedAt
		}) : void 0;
		const hadDescendants = activeSubagentRuns > 0 || Boolean(completedDescendantReply);
		if (activeSubagentRuns > 0 || expectedSubagentFollowup) {
			let finalReply = await subagentFollowupRuntime?.waitForDescendantSubagentSummary({
				sessionKey: params.agentSessionKey,
				initialReply: initialSynthesizedText,
				timeoutMs: params.timeoutMs,
				observedActiveDescendants: activeSubagentRuns > 0 || expectedSubagentFollowup
			});
			activeSubagentRuns = subagentRegistryRuntime.countActiveDescendantRuns(params.agentSessionKey);
			if (!finalReply && activeSubagentRuns === 0) finalReply = await subagentFollowupRuntime?.readDescendantSubagentFallbackReply({
				sessionKey: params.agentSessionKey,
				runStartedAt: params.runStartedAt
			});
			if (finalReply && activeSubagentRuns === 0) {
				outputText = finalReply;
				summary = pickSummaryFromOutput(finalReply) ?? summary;
				synthesizedText = finalReply;
				deliveryPayloads = [{ text: finalReply }];
			}
		} else if (completedDescendantReply) {
			outputText = completedDescendantReply;
			summary = pickSummaryFromOutput(completedDescendantReply) ?? summary;
			synthesizedText = completedDescendantReply;
			deliveryPayloads = [{ text: completedDescendantReply }];
		}
		if (activeSubagentRuns > 0) {
			deliveryAttempted = true;
			return params.withRunSession({
				status: "ok",
				summary,
				outputText,
				deliveryAttempted,
				...params.telemetry
			});
		}
		if (hadDescendants && synthesizedText.trim() === initialSynthesizedText && isLikelyInterimCronMessage(initialSynthesizedText) && !isSilentReplyText(initialSynthesizedText, "NO_REPLY")) {
			deliveryAttempted = true;
			return params.withRunSession({
				status: "ok",
				summary,
				outputText,
				deliveryAttempted,
				...params.telemetry
			});
		}
		const normalizedSynthesizedText = normalizeSilentReplyText(synthesizedText);
		if (normalizedSynthesizedText.text === void 0 || normalizedSynthesizedText.strippedTrailingSilentToken) return await finishSilentReplyDelivery();
		synthesizedText = normalizedSynthesizedText.text;
		outputText = synthesizedText;
		if (params.isAborted()) return params.withRunSession({
			status: "error",
			error: params.abortReason(),
			deliveryAttempted,
			...params.telemetry
		});
		try {
			return await deliverViaDirect(delivery, { retryTransient: true });
		} finally {
			await cleanupDirectCronSessionIfNeeded();
		}
	};
	if (params.deliveryRequested && !params.skipHeartbeatDelivery && !skipMessagingToolDelivery) {
		if (!params.resolvedDelivery.ok) {
			if (!params.deliveryBestEffort) return {
				result: failDeliveryTarget(params.resolvedDelivery.error.message),
				delivered,
				deliveryAttempted,
				summary,
				outputText,
				synthesizedText,
				deliveryPayloads
			};
			await logCronDeliveryWarn(`[cron:${params.job.id}] ${params.resolvedDelivery.error.message}`);
			return {
				result: params.withRunSession({
					status: "ok",
					summary,
					outputText,
					deliveryAttempted,
					...params.telemetry
				}),
				delivered,
				deliveryAttempted,
				summary,
				outputText,
				synthesizedText,
				deliveryPayloads
			};
		}
		if (params.deliveryPayloadHasStructuredContent || params.resolvedDelivery.threadId != null) {
			const directResult = await deliverViaDirect(params.resolvedDelivery);
			if (directResult) return {
				result: directResult,
				delivered,
				deliveryAttempted,
				summary,
				outputText,
				synthesizedText,
				deliveryPayloads
			};
		} else {
			const finalizedTextResult = await finalizeTextDelivery(params.resolvedDelivery);
			if (finalizedTextResult) return {
				result: finalizedTextResult,
				delivered,
				deliveryAttempted,
				summary,
				outputText,
				synthesizedText,
				deliveryPayloads
			};
		}
	}
	return {
		delivered,
		deliveryAttempted,
		summary,
		outputText,
		synthesizedText,
		deliveryPayloads
	};
}
//#endregion
export { dispatchCronDelivery, matchesMessagingToolDeliveryTarget, resolveCronDeliveryBestEffort, resolveDeliveryTarget };
