import { m as defaultRuntime, t as createSubsystemLogger } from "./subsystem-CJEvHE2o.js";
import { t as sanitizeForLog } from "./ansi-B_0KjIJj.js";
import { n as ensureAuthProfileStore } from "./store-CY-e50gT.js";
import "./auth-profiles-bVW1e9Dr.js";
import { n as DEFAULT_MODEL, r as DEFAULT_PROVIDER } from "./defaults-BwiMD7ye.js";
import { f as normalizeVerboseLevel, n as formatXHighModelHint, u as normalizeThinkLevel } from "./thinking.shared-B8IAgSi8.js";
import { S as resolveThinkingDefault, f as parseModelRef, g as resolveDefaultModelForAgent, h as resolveConfiguredModelRef, l as modelKey, s as isCliProvider, t as buildAllowedModelSet, u as normalizeModelRef } from "./model-selection-8a6zD_aX.js";
import { c as normalizeAgentId, l as normalizeMainKey, m as toAgentRequestSessionKey, u as resolveAgentIdFromSessionKey } from "./session-key-D7XpmyVq.js";
import { a as resolveAgentDir, f as resolveAgentSkillsFilter, h as resolveEffectiveModelFallbacks, p as resolveAgentWorkspaceDir, r as listAgentIds, v as resolveSessionAgentId } from "./agent-scope-CYXg_wTS.js";
import { d as ensureAgentWorkspace } from "./workspace-R-NeOkBt.js";
import { c as loadConfig, p as readConfigFileSnapshotForWrite, y as setRuntimeConfigSnapshot } from "./io-DhtVmzAJ.js";
import "./config-CJQx-9zo.js";
import { t as formatCliCommand } from "./command-format-CkCGNdQh.js";
import { a as isGatewayMessageChannel, d as normalizeMessageChannel, o as isInternalMessageChannel, p as resolveMessageChannel, r as isDeliverableMessageChannel, t as INTERNAL_MESSAGE_CHANNEL } from "./message-channel-D19EDm2g.js";
import { d as updateSessionStore, i as loadSessionStore } from "./store-BGmy-Wot.js";
import { r as normalizeChannelId, t as getChannelPlugin } from "./registry-fiJfPVib.js";
import "./plugins-DF32jmMU.js";
import { r as resolveExplicitAgentSessionKey } from "./main-session-CFwamLE8.js";
import { s as resolveSessionTranscriptFile } from "./sessions-DC7OiAdD.js";
import { l as resolveStorePath } from "./paths-DBIQqSpZ.js";
import { n as mergeSessionEntry, o as setSessionRuntimeModel } from "./types-KyI2zD1Y.js";
import { a as resolveSessionResetType, i as resolveSessionResetPolicy, n as evaluateSessionFreshness, r as resolveChannelResetConfig } from "./session-file-B_sG4I7G.js";
import { n as resolveSessionKey } from "./session-key-CrIfzXHI.js";
import { c as normalizeAccountId } from "./delivery-context-BV8uXbJ1.js";
import { t as emitSessionTranscriptUpdate } from "./transcript-events-KFgKuvkB.js";
import { a as isSilentReplyText, i as isSilentReplyPrefixText } from "./tokens-Bot0VGKf.js";
import { F as normalizeSpawnedRunMetadata, H as resolveAcpAgentPolicyError, In as formatAgentInternalEventsForPrompt, Ln as clearAgentRunContext, Mn as toAcpRuntimeError, R as resolveAcpSessionCwd, Rn as emitAgentEvent, U as resolveAcpDispatchPolicyError, Un as AGENT_LANE_NESTED, Vn as registerAgentRunContext, Wn as AGENT_LANE_SUBAGENT, fn as getAcpSessionManager, i as prepareSessionManagerForRun, p as resolveBootstrapWarningSignaturesSeen, t as runEmbeddedPiAgent, tr as runWithModelFallback } from "./pi-embedded-BYdcxQ5A.js";
import { f as clearBootstrapSnapshotOnSessionRollover, n as resolveAgentTimeoutMs } from "./content-blocks-CWb2xgCb.js";
import { U as hasInternalRuntimeContext } from "./pi-embedded-helpers-CGU2Pfj9.js";
import { i as supportsXHighThinking, t as formatThinkingLevels } from "./thinking-EUyzvAQE.js";
import { i as normalizeOutboundPayloadsForJson, n as formatOutboundPayloadLog, r as normalizeOutboundPayloads, t as deliverOutboundPayloads } from "./deliver-BV9UlnxV.js";
import { n as resolveMessageChannelSelection } from "./channel-selection-CTvUgc2I.js";
import { t as buildOutboundSessionContext } from "./session-context-Be2O9afs.js";
import { i as resolveSessionDeliveryTarget, r as resolveOutboundTarget } from "./targets-DjOu09mG.js";
import { t as FailoverError } from "./failover-error-qR7EPsdr.js";
import { r as loadModelCatalog } from "./model-catalog-k0g7_9Nb.js";
import { t as resolveCommandSecretRefsViaGateway } from "./command-secret-gateway-D6E4pqJn.js";
import { t as getAgentRuntimeCommandSecretTargetIds } from "./command-secret-targets-DenfdcDu.js";
import { t as normalizeReplyPayload } from "./normalize-reply-OmOn1Pmu.js";
import { n as resolveContextTokensForModel } from "./context-awuvPcZd.js";
import { r as buildWorkspaceSkillSnapshot } from "./skills-C4NiYd5P.js";
import { c as hasNonzeroUsage, s as deriveSessionTotalTokens } from "./chat-envelope-BIAAz1Jw.js";
import { i as resolveModelCostConfig, t as estimateUsageCost } from "./usage-format-DD-9lWqe.js";
import { t as applyModelOverrideToSessionEntry } from "./model-overrides-C9noPWm6.js";
import { n as resolveSendPolicy } from "./send-policy-DGmd7hOX.js";
import { t as clearSessionAuthProfileOverride } from "./session-override-DAC1RGxw.js";
import { t as createReplyPrefixContext } from "./reply-prefix--bHYafND.js";
import { t as createDefaultDeps } from "./deps-BFwksfYt.js";
import { _ as getSkillsSnapshotVersion, t as getRemoteSkillEligibility } from "./skills-remote-fYLkhhDd.js";
import { t as applyVerboseOverride } from "./level-overrides-BwdJMGw7.js";
import { a as setCliSessionBinding, n as clearCliSession, o as setCliSessionId, r as getCliSessionBinding, t as runCliAgent } from "./cli-runner-CY7Mj0mY.js";
import { t as createOutboundSendDeps } from "./outbound-send-deps-BgT6g6N3.js";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import { SessionManager } from "@mariozechner/pi-coding-agent";
import readline from "node:readline";
//#region src/agents/command/attempt-execution.ts
const log$1 = createSubsystemLogger("agents/agent-command");
/** Maximum number of JSONL records to inspect before giving up. */
const SESSION_FILE_MAX_RECORDS = 500;
/**
* Check whether a session transcript file exists and contains at least one
* assistant message, indicating that the SessionManager has flushed the
* initial user+assistant exchange to disk.  This is used to decide whether
* a fallback retry can rely on the on-disk history or must re-send the
* original prompt.
*
* The check parses JSONL records line-by-line (CWE-703) instead of relying
* on a raw substring match against a bounded byte prefix, which could
* produce false negatives when the pre-assistant content exceeds the byte
* limit.
*/
async function sessionFileHasContent(sessionFile) {
	if (!sessionFile) return false;
	try {
		if ((await fs.lstat(sessionFile)).isSymbolicLink()) return false;
		const fh = await fs.open(sessionFile, "r");
		try {
			const rl = readline.createInterface({ input: fh.createReadStream({ encoding: "utf-8" }) });
			let recordCount = 0;
			for await (const line of rl) {
				if (!line.trim()) continue;
				recordCount++;
				if (recordCount > SESSION_FILE_MAX_RECORDS) break;
				let obj;
				try {
					obj = JSON.parse(line);
				} catch {
					continue;
				}
				const rec = obj;
				if (rec?.type === "message" && rec.message?.role === "assistant") return true;
			}
			return false;
		} finally {
			await fh.close();
		}
	} catch {
		return false;
	}
}
async function persistSessionEntry$1(params) {
	const persisted = await updateSessionStore(params.storePath, (store) => {
		const merged = mergeSessionEntry(store[params.sessionKey], params.entry);
		for (const field of params.clearedFields ?? []) if (!Object.hasOwn(params.entry, field)) Reflect.deleteProperty(merged, field);
		store[params.sessionKey] = merged;
		return merged;
	});
	params.sessionStore[params.sessionKey] = persisted;
}
function resolveFallbackRetryPrompt(params) {
	if (!params.isFallbackRetry) return params.body;
	if (!params.sessionHasHistory) return params.body;
	return "Continue where you left off. The previous model attempt failed or timed out.";
}
function prependInternalEventContext(body, events) {
	if (hasInternalRuntimeContext(body)) return body;
	const renderedEvents = formatAgentInternalEventsForPrompt(events);
	if (!renderedEvents) return body;
	return [renderedEvents, body].filter(Boolean).join("\n\n");
}
function createAcpVisibleTextAccumulator() {
	let pendingSilentPrefix = "";
	let visibleText = "";
	const startsWithWordChar = (chunk) => /^[\p{L}\p{N}]/u.test(chunk);
	const resolveNextCandidate = (base, chunk) => {
		if (!base) return chunk;
		if (isSilentReplyText(base, "NO_REPLY") && !chunk.startsWith(base) && startsWithWordChar(chunk)) return chunk;
		if (chunk.startsWith(base) && chunk.length > base.length) return chunk;
		return `${base}${chunk}`;
	};
	const mergeVisibleChunk = (base, chunk) => {
		if (!base) return {
			text: chunk,
			delta: chunk
		};
		if (chunk.startsWith(base) && chunk.length > base.length) return {
			text: chunk,
			delta: chunk.slice(base.length)
		};
		return {
			text: `${base}${chunk}`,
			delta: chunk
		};
	};
	return {
		consume(chunk) {
			if (!chunk) return null;
			if (!visibleText) {
				const leadCandidate = resolveNextCandidate(pendingSilentPrefix, chunk);
				const trimmedLeadCandidate = leadCandidate.trim();
				if (isSilentReplyText(trimmedLeadCandidate, "NO_REPLY") || isSilentReplyPrefixText(trimmedLeadCandidate, "NO_REPLY")) {
					pendingSilentPrefix = leadCandidate;
					return null;
				}
				if (pendingSilentPrefix) {
					pendingSilentPrefix = "";
					visibleText = leadCandidate;
					return {
						text: visibleText,
						delta: leadCandidate
					};
				}
			}
			const nextVisible = mergeVisibleChunk(visibleText, chunk);
			visibleText = nextVisible.text;
			return nextVisible.delta ? nextVisible : null;
		},
		finalize() {
			return visibleText.trim();
		},
		finalizeRaw() {
			return visibleText;
		}
	};
}
const ACP_TRANSCRIPT_USAGE = {
	input: 0,
	output: 0,
	cacheRead: 0,
	cacheWrite: 0,
	totalTokens: 0,
	cost: {
		input: 0,
		output: 0,
		cacheRead: 0,
		cacheWrite: 0,
		total: 0
	}
};
async function persistAcpTurnTranscript(params) {
	const promptText = params.body;
	const replyText = params.finalText;
	if (!promptText && !replyText) return params.sessionEntry;
	const { sessionFile, sessionEntry } = await resolveSessionTranscriptFile({
		sessionId: params.sessionId,
		sessionKey: params.sessionKey,
		sessionEntry: params.sessionEntry,
		sessionStore: params.sessionStore,
		storePath: params.storePath,
		agentId: params.sessionAgentId,
		threadId: params.threadId
	});
	const hadSessionFile = await fs.access(sessionFile).then(() => true).catch(() => false);
	const sessionManager = SessionManager.open(sessionFile);
	await prepareSessionManagerForRun({
		sessionManager,
		sessionFile,
		hadSessionFile,
		sessionId: params.sessionId,
		cwd: params.sessionCwd
	});
	if (promptText) sessionManager.appendMessage({
		role: "user",
		content: promptText,
		timestamp: Date.now()
	});
	if (replyText) sessionManager.appendMessage({
		role: "assistant",
		content: [{
			type: "text",
			text: replyText
		}],
		api: "openai-responses",
		provider: "openclaw",
		model: "acp-runtime",
		usage: ACP_TRANSCRIPT_USAGE,
		stopReason: "stop",
		timestamp: Date.now()
	});
	emitSessionTranscriptUpdate(sessionFile);
	return sessionEntry;
}
function runAgentAttempt(params) {
	const effectivePrompt = resolveFallbackRetryPrompt({
		body: params.body,
		isFallbackRetry: params.isFallbackRetry,
		sessionHasHistory: params.sessionHasHistory
	});
	const bootstrapPromptWarningSignaturesSeen = resolveBootstrapWarningSignaturesSeen(params.sessionEntry?.systemPromptReport);
	const bootstrapPromptWarningSignature = bootstrapPromptWarningSignaturesSeen[bootstrapPromptWarningSignaturesSeen.length - 1];
	const authProfileId = params.providerOverride === params.authProfileProvider ? params.sessionEntry?.authProfileOverride : void 0;
	if (isCliProvider(params.providerOverride, params.cfg)) {
		const cliSessionBinding = getCliSessionBinding(params.sessionEntry, params.providerOverride);
		const runCliWithSession = (nextCliSessionId) => runCliAgent({
			sessionId: params.sessionId,
			sessionKey: params.sessionKey,
			agentId: params.sessionAgentId,
			sessionFile: params.sessionFile,
			workspaceDir: params.workspaceDir,
			config: params.cfg,
			prompt: effectivePrompt,
			provider: params.providerOverride,
			model: params.modelOverride,
			thinkLevel: params.resolvedThinkLevel,
			timeoutMs: params.timeoutMs,
			runId: params.runId,
			extraSystemPrompt: params.opts.extraSystemPrompt,
			cliSessionId: nextCliSessionId,
			cliSessionBinding: nextCliSessionId === cliSessionBinding?.sessionId ? cliSessionBinding : void 0,
			authProfileId,
			bootstrapPromptWarningSignaturesSeen,
			bootstrapPromptWarningSignature,
			images: params.isFallbackRetry ? void 0 : params.opts.images,
			imageOrder: params.isFallbackRetry ? void 0 : params.opts.imageOrder,
			streamParams: params.opts.streamParams
		});
		return runCliWithSession(cliSessionBinding?.sessionId).catch(async (err) => {
			if (err instanceof FailoverError && err.reason === "session_expired" && cliSessionBinding?.sessionId && params.sessionKey && params.sessionStore && params.storePath) {
				log$1.warn(`CLI session expired, clearing from session store: provider=${sanitizeForLog(params.providerOverride)} sessionKey=${params.sessionKey}`);
				const entry = params.sessionStore[params.sessionKey];
				if (entry) {
					const updatedEntry = { ...entry };
					clearCliSession(updatedEntry, params.providerOverride);
					updatedEntry.updatedAt = Date.now();
					await persistSessionEntry$1({
						sessionStore: params.sessionStore,
						sessionKey: params.sessionKey,
						storePath: params.storePath,
						entry: updatedEntry
					});
					params.sessionEntry = updatedEntry;
				}
				return runCliWithSession(void 0).then(async (result) => {
					if (result.meta.agentMeta?.cliSessionBinding?.sessionId && params.sessionKey && params.sessionStore && params.storePath) {
						const entry = params.sessionStore[params.sessionKey];
						if (entry) {
							const updatedEntry = { ...entry };
							setCliSessionBinding(updatedEntry, params.providerOverride, result.meta.agentMeta.cliSessionBinding);
							updatedEntry.updatedAt = Date.now();
							await persistSessionEntry$1({
								sessionStore: params.sessionStore,
								sessionKey: params.sessionKey,
								storePath: params.storePath,
								entry: updatedEntry
							});
						}
					}
					return result;
				});
			}
			throw err;
		});
	}
	return runEmbeddedPiAgent({
		sessionId: params.sessionId,
		sessionKey: params.sessionKey,
		agentId: params.sessionAgentId,
		trigger: "user",
		messageChannel: params.messageChannel,
		agentAccountId: params.runContext.accountId,
		messageTo: params.opts.replyTo ?? params.opts.to,
		messageThreadId: params.opts.threadId,
		groupId: params.runContext.groupId,
		groupChannel: params.runContext.groupChannel,
		groupSpace: params.runContext.groupSpace,
		spawnedBy: params.spawnedBy,
		currentChannelId: params.runContext.currentChannelId,
		currentThreadTs: params.runContext.currentThreadTs,
		replyToMode: params.runContext.replyToMode,
		hasRepliedRef: params.runContext.hasRepliedRef,
		senderIsOwner: params.opts.senderIsOwner,
		sessionFile: params.sessionFile,
		workspaceDir: params.workspaceDir,
		config: params.cfg,
		skillsSnapshot: params.skillsSnapshot,
		prompt: effectivePrompt,
		images: params.isFallbackRetry ? void 0 : params.opts.images,
		imageOrder: params.isFallbackRetry ? void 0 : params.opts.imageOrder,
		clientTools: params.opts.clientTools,
		provider: params.providerOverride,
		model: params.modelOverride,
		authProfileId,
		authProfileIdSource: authProfileId ? params.sessionEntry?.authProfileOverrideSource : void 0,
		thinkLevel: params.resolvedThinkLevel,
		verboseLevel: params.resolvedVerboseLevel,
		timeoutMs: params.timeoutMs,
		runId: params.runId,
		lane: params.opts.lane,
		abortSignal: params.opts.abortSignal,
		extraSystemPrompt: params.opts.extraSystemPrompt,
		inputProvenance: params.opts.inputProvenance,
		streamParams: params.opts.streamParams,
		agentDir: params.agentDir,
		allowTransientCooldownProbe: params.allowTransientCooldownProbe,
		cleanupBundleMcpOnRunEnd: params.opts.cleanupBundleMcpOnRunEnd,
		onAgentEvent: params.onAgentEvent,
		bootstrapPromptWarningSignaturesSeen,
		bootstrapPromptWarningSignature
	});
}
function buildAcpResult(params) {
	const normalizedFinalPayload = normalizeReplyPayload({ text: params.payloadText });
	return {
		payloads: normalizedFinalPayload ? [normalizedFinalPayload] : [],
		meta: {
			durationMs: Date.now() - params.startedAt,
			aborted: params.abortSignal?.aborted === true,
			stopReason: params.stopReason
		}
	};
}
function emitAcpLifecycleStart(params) {
	emitAgentEvent({
		runId: params.runId,
		stream: "lifecycle",
		data: {
			phase: "start",
			startedAt: params.startedAt
		}
	});
}
function emitAcpLifecycleEnd(params) {
	emitAgentEvent({
		runId: params.runId,
		stream: "lifecycle",
		data: {
			phase: "end",
			endedAt: Date.now()
		}
	});
}
function emitAcpLifecycleError(params) {
	emitAgentEvent({
		runId: params.runId,
		stream: "lifecycle",
		data: {
			phase: "error",
			error: params.message,
			endedAt: Date.now()
		}
	});
}
function emitAcpAssistantDelta(params) {
	emitAgentEvent({
		runId: params.runId,
		stream: "assistant",
		data: {
			text: params.text,
			delta: params.delta
		}
	});
}
//#endregion
//#region src/infra/outbound/agent-delivery.ts
function resolveAgentDeliveryPlan(params) {
	const requestedRaw = typeof params.requestedChannel === "string" ? params.requestedChannel.trim() : "";
	const requestedChannel = (requestedRaw ? normalizeMessageChannel(requestedRaw) : void 0) || "last";
	const explicitTo = typeof params.explicitTo === "string" && params.explicitTo.trim() ? params.explicitTo.trim() : void 0;
	const normalizedTurnSource = params.turnSourceChannel ? normalizeMessageChannel(params.turnSourceChannel) : void 0;
	const turnSourceChannel = normalizedTurnSource && isDeliverableMessageChannel(normalizedTurnSource) ? normalizedTurnSource : void 0;
	const turnSourceTo = typeof params.turnSourceTo === "string" && params.turnSourceTo.trim() ? params.turnSourceTo.trim() : void 0;
	const turnSourceAccountId = normalizeAccountId(params.turnSourceAccountId);
	const turnSourceThreadId = params.turnSourceThreadId != null && params.turnSourceThreadId !== "" ? params.turnSourceThreadId : void 0;
	const baseDelivery = resolveSessionDeliveryTarget({
		entry: params.sessionEntry,
		requestedChannel: requestedChannel === "webchat" ? "last" : requestedChannel,
		explicitTo,
		explicitThreadId: params.explicitThreadId,
		turnSourceChannel,
		turnSourceTo,
		turnSourceAccountId,
		turnSourceThreadId
	});
	const resolvedChannel = (() => {
		if (requestedChannel === "webchat") return INTERNAL_MESSAGE_CHANNEL;
		if (requestedChannel === "last") {
			if (baseDelivery.channel && baseDelivery.channel !== "webchat") return baseDelivery.channel;
			return INTERNAL_MESSAGE_CHANNEL;
		}
		if (isGatewayMessageChannel(requestedChannel)) return requestedChannel;
		if (baseDelivery.channel && baseDelivery.channel !== "webchat") return baseDelivery.channel;
		return INTERNAL_MESSAGE_CHANNEL;
	})();
	const deliveryTargetMode = explicitTo ? "explicit" : isDeliverableMessageChannel(resolvedChannel) ? "implicit" : void 0;
	const resolvedAccountId = normalizeAccountId(params.accountId) ?? (deliveryTargetMode === "implicit" ? baseDelivery.accountId : void 0);
	let resolvedTo = explicitTo;
	if (!resolvedTo && isDeliverableMessageChannel(resolvedChannel) && resolvedChannel === baseDelivery.lastChannel) resolvedTo = baseDelivery.lastTo;
	return {
		baseDelivery,
		resolvedChannel,
		resolvedTo,
		resolvedAccountId,
		resolvedThreadId: baseDelivery.threadId,
		deliveryTargetMode
	};
}
function resolveAgentOutboundTarget(params) {
	const targetMode = params.targetMode ?? params.plan.deliveryTargetMode ?? (params.plan.resolvedTo ? "explicit" : "implicit");
	if (!isDeliverableMessageChannel(params.plan.resolvedChannel)) return {
		resolvedTarget: null,
		resolvedTo: params.plan.resolvedTo,
		targetMode
	};
	if (params.validateExplicitTarget !== true && params.plan.resolvedTo) return {
		resolvedTarget: null,
		resolvedTo: params.plan.resolvedTo,
		targetMode
	};
	const resolvedTarget = resolveOutboundTarget({
		channel: params.plan.resolvedChannel,
		to: params.plan.resolvedTo,
		cfg: params.cfg,
		accountId: params.plan.resolvedAccountId,
		mode: targetMode
	});
	return {
		resolvedTarget,
		resolvedTo: resolvedTarget.ok ? resolvedTarget.to : params.plan.resolvedTo,
		targetMode
	};
}
//#endregion
//#region src/infra/outbound/envelope.ts
const isOutboundPayloadJson = (payload) => "mediaUrl" in payload;
function buildOutboundResultEnvelope(params) {
	const hasPayloads = params.payloads !== void 0;
	const payloads = params.payloads === void 0 ? void 0 : params.payloads.length === 0 ? [] : isOutboundPayloadJson(params.payloads[0]) ? [...params.payloads] : normalizeOutboundPayloadsForJson(params.payloads);
	if (params.flattenDelivery !== false && params.delivery && !params.meta && !hasPayloads) return params.delivery;
	return {
		...hasPayloads ? { payloads } : {},
		...params.meta ? { meta: params.meta } : {},
		...params.delivery ? { delivery: params.delivery } : {}
	};
}
//#endregion
//#region src/agents/command/delivery.ts
const NESTED_LOG_PREFIX = "[agent:nested]";
function formatNestedLogPrefix(opts, sessionKey) {
	const parts = [NESTED_LOG_PREFIX];
	const session = sessionKey ?? opts.sessionKey ?? opts.sessionId;
	if (session) parts.push(`session=${session}`);
	if (opts.runId) parts.push(`run=${opts.runId}`);
	const channel = opts.messageChannel ?? opts.channel;
	if (channel) parts.push(`channel=${channel}`);
	if (opts.to) parts.push(`to=${opts.to}`);
	if (opts.accountId) parts.push(`account=${opts.accountId}`);
	return parts.join(" ");
}
function logNestedOutput(runtime, opts, output, sessionKey) {
	const prefix = formatNestedLogPrefix(opts, sessionKey);
	for (const line of output.split(/\r?\n/)) {
		if (!line) continue;
		runtime.log(`${prefix} ${line}`);
	}
}
function normalizeAgentCommandReplyPayloads(params) {
	const payloads = params.payloads ?? [];
	if (payloads.length === 0) return [];
	const channel = params.deliveryChannel && !isInternalMessageChannel(params.deliveryChannel) ? normalizeChannelId(params.deliveryChannel) ?? params.deliveryChannel : void 0;
	if (!channel) return payloads;
	const sessionKey = params.outboundSession?.key ?? params.opts.sessionKey;
	const agentId = params.outboundSession?.agentId ?? resolveSessionAgentId({
		sessionKey,
		config: params.cfg
	});
	const replyPrefix = createReplyPrefixContext({
		cfg: params.cfg,
		agentId,
		channel,
		accountId: params.accountId
	});
	const modelUsed = params.result.meta.agentMeta?.model;
	const providerUsed = params.result.meta.agentMeta?.provider;
	if (providerUsed && modelUsed) replyPrefix.onModelSelected({
		provider: providerUsed,
		model: modelUsed,
		thinkLevel: void 0
	});
	const responsePrefixContext = replyPrefix.responsePrefixContextProvider();
	const applyChannelTransforms = params.applyChannelTransforms ?? true;
	const normalizedPayloads = [];
	for (const payload of payloads) {
		const normalized = normalizeReplyPayload(payload, {
			responsePrefix: replyPrefix.responsePrefix,
			enableSlackInteractiveReplies: replyPrefix.enableSlackInteractiveReplies,
			applyChannelTransforms,
			responsePrefixContext
		});
		if (normalized) normalizedPayloads.push(normalized);
	}
	return normalizedPayloads;
}
async function deliverAgentCommandResult(params) {
	const { cfg, deps, runtime, opts, outboundSession, sessionEntry, payloads, result } = params;
	const effectiveSessionKey = outboundSession?.key ?? opts.sessionKey;
	const deliver = opts.deliver === true;
	const bestEffortDeliver = opts.bestEffortDeliver === true;
	const turnSourceChannel = opts.runContext?.messageChannel ?? opts.messageChannel;
	const turnSourceTo = opts.runContext?.currentChannelId ?? opts.to;
	const turnSourceAccountId = opts.runContext?.accountId ?? opts.accountId;
	const turnSourceThreadId = opts.runContext?.currentThreadTs ?? opts.threadId;
	const deliveryPlan = resolveAgentDeliveryPlan({
		sessionEntry,
		requestedChannel: opts.replyChannel ?? opts.channel,
		explicitTo: opts.replyTo ?? opts.to,
		explicitThreadId: opts.threadId,
		accountId: opts.replyAccountId ?? opts.accountId,
		wantsDelivery: deliver,
		turnSourceChannel,
		turnSourceTo,
		turnSourceAccountId,
		turnSourceThreadId
	});
	let deliveryChannel = deliveryPlan.resolvedChannel;
	const explicitChannelHint = (opts.replyChannel ?? opts.channel)?.trim();
	if (deliver && isInternalMessageChannel(deliveryChannel) && !explicitChannelHint) try {
		deliveryChannel = (await resolveMessageChannelSelection({ cfg })).channel;
	} catch {}
	const effectiveDeliveryPlan = deliveryChannel === deliveryPlan.resolvedChannel ? deliveryPlan : {
		...deliveryPlan,
		resolvedChannel: deliveryChannel
	};
	const deliveryPlugin = !isInternalMessageChannel(deliveryChannel) ? getChannelPlugin(normalizeChannelId(deliveryChannel) ?? deliveryChannel) : void 0;
	const isDeliveryChannelKnown = isInternalMessageChannel(deliveryChannel) || Boolean(deliveryPlugin);
	const targetMode = opts.deliveryTargetMode ?? effectiveDeliveryPlan.deliveryTargetMode ?? (opts.to ? "explicit" : "implicit");
	const resolvedAccountId = effectiveDeliveryPlan.resolvedAccountId;
	const resolved = deliver && isDeliveryChannelKnown && deliveryChannel ? resolveAgentOutboundTarget({
		cfg,
		plan: effectiveDeliveryPlan,
		targetMode,
		validateExplicitTarget: true
	}) : {
		resolvedTarget: null,
		resolvedTo: effectiveDeliveryPlan.resolvedTo,
		targetMode
	};
	const resolvedTarget = resolved.resolvedTarget;
	const deliveryTarget = resolved.resolvedTo;
	const resolvedThreadId = deliveryPlan.resolvedThreadId ?? opts.threadId;
	const resolvedReplyToId = deliveryChannel === "slack" && resolvedThreadId != null ? String(resolvedThreadId) : void 0;
	const resolvedThreadTarget = deliveryChannel === "slack" ? void 0 : resolvedThreadId;
	const logDeliveryError = (err) => {
		const message = `Delivery failed (${deliveryChannel}${deliveryTarget ? ` to ${deliveryTarget}` : ""}): ${String(err)}`;
		runtime.error?.(message);
		if (!runtime.error) runtime.log(message);
	};
	if (deliver) {
		if (isInternalMessageChannel(deliveryChannel)) {
			const err = /* @__PURE__ */ new Error("delivery channel is required: pass --channel/--reply-channel or use a main session with a previous channel");
			if (!bestEffortDeliver) throw err;
			logDeliveryError(err);
		} else if (!isDeliveryChannelKnown) {
			const err = /* @__PURE__ */ new Error(`Unknown channel: ${deliveryChannel}`);
			if (!bestEffortDeliver) throw err;
			logDeliveryError(err);
		} else if (resolvedTarget && !resolvedTarget.ok) {
			if (!bestEffortDeliver) throw resolvedTarget.error;
			logDeliveryError(resolvedTarget.error);
		}
	}
	const normalizedReplyPayloads = normalizeAgentCommandReplyPayloads({
		cfg,
		opts,
		outboundSession,
		payloads,
		result,
		deliveryChannel,
		accountId: resolvedAccountId,
		applyChannelTransforms: deliver
	});
	const normalizedPayloads = normalizeOutboundPayloadsForJson(normalizedReplyPayloads);
	if (opts.json) {
		runtime.log(JSON.stringify(buildOutboundResultEnvelope({
			payloads: normalizedPayloads,
			meta: result.meta
		}), null, 2));
		if (!deliver) return {
			payloads: normalizedPayloads,
			meta: result.meta
		};
	}
	if (!payloads || payloads.length === 0) {
		runtime.log("No reply from agent.");
		return {
			payloads: [],
			meta: result.meta
		};
	}
	const deliveryPayloads = normalizeOutboundPayloads(normalizedReplyPayloads);
	const logPayload = (payload) => {
		if (opts.json) return;
		const output = formatOutboundPayloadLog(payload);
		if (!output) return;
		if (opts.lane === AGENT_LANE_NESTED) {
			logNestedOutput(runtime, opts, output, effectiveSessionKey);
			return;
		}
		runtime.log(output);
	};
	if (!deliver) for (const payload of deliveryPayloads) logPayload(payload);
	if (deliver && deliveryChannel && !isInternalMessageChannel(deliveryChannel)) {
		if (deliveryTarget) await deliverOutboundPayloads({
			cfg,
			channel: deliveryChannel,
			to: deliveryTarget,
			accountId: resolvedAccountId,
			payloads: deliveryPayloads,
			session: outboundSession,
			replyToId: resolvedReplyToId ?? null,
			threadId: resolvedThreadTarget ?? null,
			bestEffort: bestEffortDeliver,
			onError: (err) => logDeliveryError(err),
			onPayload: logPayload,
			deps: createOutboundSendDeps(deps)
		});
	}
	return {
		payloads: normalizedPayloads,
		meta: result.meta
	};
}
//#endregion
//#region src/agents/command/run-context.ts
function resolveAgentRunContext(opts) {
	const merged = opts.runContext ? { ...opts.runContext } : {};
	const normalizedChannel = resolveMessageChannel(merged.messageChannel ?? opts.messageChannel, opts.replyChannel ?? opts.channel);
	if (normalizedChannel) merged.messageChannel = normalizedChannel;
	const normalizedAccountId = normalizeAccountId(merged.accountId ?? opts.accountId);
	if (normalizedAccountId) merged.accountId = normalizedAccountId;
	const groupId = (merged.groupId ?? opts.groupId)?.toString().trim();
	if (groupId) merged.groupId = groupId;
	const groupChannel = (merged.groupChannel ?? opts.groupChannel)?.toString().trim();
	if (groupChannel) merged.groupChannel = groupChannel;
	const groupSpace = (merged.groupSpace ?? opts.groupSpace)?.toString().trim();
	if (groupSpace) merged.groupSpace = groupSpace;
	if (merged.currentThreadTs == null && opts.threadId != null && opts.threadId !== "" && opts.threadId !== null) merged.currentThreadTs = String(opts.threadId);
	if (!merged.currentChannelId && opts.to) {
		const trimmedTo = opts.to.trim();
		if (trimmedTo) merged.currentChannelId = trimmedTo;
	}
	return merged;
}
//#endregion
//#region src/agents/command/session-store.ts
function resolveNonNegativeNumber(value) {
	return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : void 0;
}
async function updateSessionStoreAfterAgentRun(params) {
	const { cfg, sessionId, sessionKey, storePath, sessionStore, defaultProvider, defaultModel, fallbackProvider, fallbackModel, result } = params;
	const usage = result.meta.agentMeta?.usage;
	const promptTokens = result.meta.agentMeta?.promptTokens;
	const compactionsThisRun = Math.max(0, result.meta.agentMeta?.compactionCount ?? 0);
	const modelUsed = result.meta.agentMeta?.model ?? fallbackModel ?? defaultModel;
	const providerUsed = result.meta.agentMeta?.provider ?? fallbackProvider ?? defaultProvider;
	const contextTokens = resolveContextTokensForModel({
		cfg,
		provider: providerUsed,
		model: modelUsed,
		contextTokensOverride: params.contextTokensOverride,
		fallbackContextTokens: 2e5,
		allowAsyncLoad: false
	}) ?? 2e5;
	const entry = sessionStore[sessionKey] ?? {
		sessionId,
		updatedAt: Date.now()
	};
	const next = {
		...entry,
		sessionId,
		updatedAt: Date.now(),
		contextTokens
	};
	setSessionRuntimeModel(next, {
		provider: providerUsed,
		model: modelUsed
	});
	if (isCliProvider(providerUsed, cfg)) {
		const cliSessionBinding = result.meta.agentMeta?.cliSessionBinding;
		if (cliSessionBinding?.sessionId?.trim()) setCliSessionBinding(next, providerUsed, cliSessionBinding);
		else {
			const cliSessionId = result.meta.agentMeta?.sessionId?.trim();
			if (cliSessionId) setCliSessionId(next, providerUsed, cliSessionId);
		}
	}
	next.abortedLastRun = result.meta.aborted ?? false;
	if (result.meta.systemPromptReport) next.systemPromptReport = result.meta.systemPromptReport;
	if (hasNonzeroUsage(usage)) {
		const input = usage.input ?? 0;
		const output = usage.output ?? 0;
		const totalTokens = deriveSessionTotalTokens({
			usage: promptTokens ? void 0 : usage,
			contextTokens,
			promptTokens
		});
		const runEstimatedCostUsd = resolveNonNegativeNumber(estimateUsageCost({
			usage,
			cost: resolveModelCostConfig({
				provider: providerUsed,
				model: modelUsed,
				config: cfg
			})
		}));
		next.inputTokens = input;
		next.outputTokens = output;
		if (typeof totalTokens === "number" && Number.isFinite(totalTokens) && totalTokens > 0) {
			next.totalTokens = totalTokens;
			next.totalTokensFresh = true;
		} else {
			next.totalTokens = void 0;
			next.totalTokensFresh = false;
		}
		next.cacheRead = usage.cacheRead ?? 0;
		next.cacheWrite = usage.cacheWrite ?? 0;
		if (runEstimatedCostUsd !== void 0) next.estimatedCostUsd = (resolveNonNegativeNumber(entry.estimatedCostUsd) ?? 0) + runEstimatedCostUsd;
	}
	if (compactionsThisRun > 0) next.compactionCount = (entry.compactionCount ?? 0) + compactionsThisRun;
	sessionStore[sessionKey] = await updateSessionStore(storePath, (store) => {
		const merged = mergeSessionEntry(store[sessionKey], next);
		store[sessionKey] = merged;
		return merged;
	});
}
//#endregion
//#region src/sessions/session-id-resolution.ts
function resolvePreferredSessionKeyForSessionIdMatches(matches, sessionId) {
	if (matches.length === 0) return;
	if (matches.length === 1) return matches[0][0];
	const loweredSessionId = sessionId.trim().toLowerCase();
	const structuralMatches = matches.filter(([storeKey]) => {
		const requestKey = toAgentRequestSessionKey(storeKey)?.toLowerCase();
		return storeKey.toLowerCase().endsWith(`:${loweredSessionId}`) || requestKey === loweredSessionId || requestKey?.endsWith(`:${loweredSessionId}`) === true;
	});
	if (structuralMatches.length === 1) return structuralMatches[0][0];
	const [freshest, secondFreshest] = [...matches].toSorted((a, b) => (b[1]?.updatedAt ?? 0) - (a[1]?.updatedAt ?? 0));
	if ((freshest?.[1]?.updatedAt ?? 0) > (secondFreshest?.[1]?.updatedAt ?? 0)) return freshest?.[0];
}
//#endregion
//#region src/agents/command/session.ts
function resolveSessionKeyForRequest(opts) {
	const sessionCfg = opts.cfg.session;
	const scope = sessionCfg?.scope ?? "per-sender";
	const mainKey = normalizeMainKey(sessionCfg?.mainKey);
	const explicitSessionKey = opts.sessionKey?.trim() || resolveExplicitAgentSessionKey({
		cfg: opts.cfg,
		agentId: opts.agentId
	});
	const storeAgentId = resolveAgentIdFromSessionKey(explicitSessionKey);
	const storePath = resolveStorePath(sessionCfg?.store, { agentId: storeAgentId });
	const sessionStore = loadSessionStore(storePath);
	const ctx = opts.to?.trim() ? { From: opts.to } : void 0;
	let sessionKey = explicitSessionKey ?? (ctx ? resolveSessionKey(scope, ctx, mainKey) : void 0);
	if (opts.sessionId && !explicitSessionKey && (!sessionKey || sessionStore[sessionKey]?.sessionId !== opts.sessionId)) {
		const matches = [];
		const storeByKey = /* @__PURE__ */ new Map();
		const addMatches = (candidateStore, candidateStorePath) => {
			for (const [candidateKey, candidateEntry] of Object.entries(candidateStore)) {
				if (candidateEntry?.sessionId !== opts.sessionId) continue;
				matches.push([candidateKey, candidateEntry]);
				storeByKey.set(candidateKey, {
					sessionKey: candidateKey,
					sessionStore: candidateStore,
					storePath: candidateStorePath
				});
			}
		};
		addMatches(sessionStore, storePath);
		const allAgentIds = listAgentIds(opts.cfg);
		for (const agentId of allAgentIds) {
			if (agentId === storeAgentId) continue;
			const altStorePath = resolveStorePath(sessionCfg?.store, { agentId });
			addMatches(loadSessionStore(altStorePath), altStorePath);
		}
		const preferredKey = resolvePreferredSessionKeyForSessionIdMatches(matches, opts.sessionId);
		if (preferredKey) {
			const preferred = storeByKey.get(preferredKey);
			if (preferred) return preferred;
			sessionKey = preferredKey;
		}
	}
	return {
		sessionKey,
		sessionStore,
		storePath
	};
}
function resolveSession(opts) {
	const sessionCfg = opts.cfg.session;
	const { sessionKey, sessionStore, storePath } = resolveSessionKeyForRequest({
		cfg: opts.cfg,
		to: opts.to,
		sessionId: opts.sessionId,
		sessionKey: opts.sessionKey,
		agentId: opts.agentId
	});
	const now = Date.now();
	const sessionEntry = sessionKey ? sessionStore[sessionKey] : void 0;
	const resetPolicy = resolveSessionResetPolicy({
		sessionCfg,
		resetType: resolveSessionResetType({ sessionKey }),
		resetOverride: resolveChannelResetConfig({
			sessionCfg,
			channel: sessionEntry?.lastChannel ?? sessionEntry?.channel ?? sessionEntry?.origin?.provider
		})
	});
	const fresh = sessionEntry ? evaluateSessionFreshness({
		updatedAt: sessionEntry.updatedAt,
		now,
		policy: resetPolicy
	}).fresh : false;
	const sessionId = opts.sessionId?.trim() || (fresh ? sessionEntry?.sessionId : void 0) || crypto.randomUUID();
	const isNewSession = !fresh && !opts.sessionId;
	clearBootstrapSnapshotOnSessionRollover({
		sessionKey,
		previousSessionId: isNewSession ? sessionEntry?.sessionId : void 0
	});
	return {
		sessionId,
		sessionKey,
		sessionEntry,
		sessionStore,
		storePath,
		isNewSession,
		persistedThinking: fresh && sessionEntry?.thinkingLevel ? normalizeThinkLevel(sessionEntry.thinkingLevel) : void 0,
		persistedVerbose: fresh && sessionEntry?.verboseLevel ? normalizeVerboseLevel(sessionEntry.verboseLevel) : void 0
	};
}
//#endregion
//#region src/agents/agent-command.ts
const log = createSubsystemLogger("agents/agent-command");
const OVERRIDE_FIELDS_CLEARED_BY_DELETE = [
	"providerOverride",
	"modelOverride",
	"authProfileOverride",
	"authProfileOverrideSource",
	"authProfileOverrideCompactionCount",
	"fallbackNoticeSelectedModel",
	"fallbackNoticeActiveModel",
	"fallbackNoticeReason",
	"claudeCliSessionId"
];
const OVERRIDE_VALUE_MAX_LENGTH = 256;
async function persistSessionEntry(params) {
	await persistSessionEntry$1({
		...params,
		clearedFields: OVERRIDE_FIELDS_CLEARED_BY_DELETE
	});
}
function containsControlCharacters(value) {
	for (const char of value) {
		const code = char.codePointAt(0);
		if (code === void 0) continue;
		if (code <= 31 || code >= 127 && code <= 159) return true;
	}
	return false;
}
function normalizeExplicitOverrideInput(raw, kind) {
	const trimmed = raw.trim();
	const label = kind === "provider" ? "Provider" : "Model";
	if (!trimmed) throw new Error(`${label} override must be non-empty.`);
	if (trimmed.length > OVERRIDE_VALUE_MAX_LENGTH) throw new Error(`${label} override exceeds ${String(OVERRIDE_VALUE_MAX_LENGTH)} characters.`);
	if (containsControlCharacters(trimmed)) throw new Error(`${label} override contains invalid control characters.`);
	return trimmed;
}
async function prepareAgentCommandExecution(opts, runtime) {
	const message = opts.message ?? "";
	if (!message.trim()) throw new Error("Message (--message) is required");
	const body = prependInternalEventContext(message, opts.internalEvents);
	if (!opts.to && !opts.sessionId && !opts.sessionKey && !opts.agentId) throw new Error("Pass --to <E.164>, --session-id, or --agent to choose a session");
	const loadedRaw = loadConfig();
	const sourceConfig = await (async () => {
		try {
			const { snapshot } = await readConfigFileSnapshotForWrite();
			if (snapshot.valid) return snapshot.resolved;
		} catch {}
		return loadedRaw;
	})();
	const { resolvedConfig: cfg, diagnostics } = await resolveCommandSecretRefsViaGateway({
		config: loadedRaw,
		commandName: "agent",
		targetIds: getAgentRuntimeCommandSecretTargetIds()
	});
	setRuntimeConfigSnapshot(cfg, sourceConfig);
	const normalizedSpawned = normalizeSpawnedRunMetadata({
		spawnedBy: opts.spawnedBy,
		groupId: opts.groupId,
		groupChannel: opts.groupChannel,
		groupSpace: opts.groupSpace,
		workspaceDir: opts.workspaceDir
	});
	for (const entry of diagnostics) runtime.log(`[secrets] ${entry}`);
	const agentIdOverrideRaw = opts.agentId?.trim();
	const agentIdOverride = agentIdOverrideRaw ? normalizeAgentId(agentIdOverrideRaw) : void 0;
	if (agentIdOverride) {
		if (!listAgentIds(cfg).includes(agentIdOverride)) throw new Error(`Unknown agent id "${agentIdOverrideRaw}". Use "${formatCliCommand("openclaw agents list")}" to see configured agents.`);
	}
	if (agentIdOverride && opts.sessionKey) {
		const sessionAgentId = resolveAgentIdFromSessionKey(opts.sessionKey);
		if (sessionAgentId !== agentIdOverride) throw new Error(`Agent id "${agentIdOverrideRaw}" does not match session key agent "${sessionAgentId}".`);
	}
	const agentCfg = cfg.agents?.defaults;
	const configuredModel = resolveConfiguredModelRef({
		cfg,
		defaultProvider: DEFAULT_PROVIDER,
		defaultModel: DEFAULT_MODEL
	});
	const thinkingLevelsHint = formatThinkingLevels(configuredModel.provider, configuredModel.model);
	const thinkOverride = normalizeThinkLevel(opts.thinking);
	const thinkOnce = normalizeThinkLevel(opts.thinkingOnce);
	if (opts.thinking && !thinkOverride) throw new Error(`Invalid thinking level. Use one of: ${thinkingLevelsHint}.`);
	if (opts.thinkingOnce && !thinkOnce) throw new Error(`Invalid one-shot thinking level. Use one of: ${thinkingLevelsHint}.`);
	const verboseOverride = normalizeVerboseLevel(opts.verbose);
	if (opts.verbose && !verboseOverride) throw new Error("Invalid verbose level. Use \"on\", \"full\", or \"off\".");
	const isSubagentLane = (typeof opts.lane === "string" ? opts.lane.trim() : "") === String(AGENT_LANE_SUBAGENT);
	const timeoutSecondsRaw = opts.timeout !== void 0 ? Number.parseInt(String(opts.timeout), 10) : isSubagentLane ? 0 : void 0;
	if (timeoutSecondsRaw !== void 0 && (Number.isNaN(timeoutSecondsRaw) || timeoutSecondsRaw < 0)) throw new Error("--timeout must be a non-negative integer (seconds; 0 means no timeout)");
	const timeoutMs = resolveAgentTimeoutMs({
		cfg,
		overrideSeconds: timeoutSecondsRaw
	});
	const { sessionId, sessionKey, sessionEntry: sessionEntryRaw, sessionStore, storePath, isNewSession, persistedThinking, persistedVerbose } = resolveSession({
		cfg,
		to: opts.to,
		sessionId: opts.sessionId,
		sessionKey: opts.sessionKey,
		agentId: agentIdOverride
	});
	const sessionAgentId = agentIdOverride ?? resolveSessionAgentId({
		sessionKey: sessionKey ?? opts.sessionKey?.trim(),
		config: cfg
	});
	const outboundSession = buildOutboundSessionContext({
		cfg,
		agentId: sessionAgentId,
		sessionKey
	});
	const workspaceDirRaw = normalizedSpawned.workspaceDir ?? resolveAgentWorkspaceDir(cfg, sessionAgentId);
	const agentDir = resolveAgentDir(cfg, sessionAgentId);
	const workspaceDir = (await ensureAgentWorkspace({
		dir: workspaceDirRaw,
		ensureBootstrapFiles: !agentCfg?.skipBootstrap
	})).dir;
	const runId = opts.runId?.trim() || sessionId;
	const acpManager = getAcpSessionManager();
	return {
		body,
		cfg,
		normalizedSpawned,
		agentCfg,
		thinkOverride,
		thinkOnce,
		verboseOverride,
		timeoutMs,
		sessionId,
		sessionKey,
		sessionEntry: sessionEntryRaw,
		sessionStore,
		storePath,
		isNewSession,
		persistedThinking,
		persistedVerbose,
		sessionAgentId,
		outboundSession,
		workspaceDir,
		agentDir,
		runId,
		acpManager,
		acpResolution: sessionKey ? acpManager.resolveSession({
			cfg,
			sessionKey
		}) : null
	};
}
async function agentCommandInternal(opts, runtime = defaultRuntime, deps = createDefaultDeps()) {
	const prepared = await prepareAgentCommandExecution(opts, runtime);
	const { body, cfg, normalizedSpawned, agentCfg, thinkOverride, thinkOnce, verboseOverride, timeoutMs, sessionId, sessionKey, sessionStore, storePath, isNewSession, persistedThinking, persistedVerbose, sessionAgentId, outboundSession, workspaceDir, agentDir, runId, acpManager, acpResolution } = prepared;
	let sessionEntry = prepared.sessionEntry;
	try {
		if (opts.deliver === true) {
			if (resolveSendPolicy({
				cfg,
				entry: sessionEntry,
				sessionKey,
				channel: sessionEntry?.channel,
				chatType: sessionEntry?.chatType
			}) === "deny") throw new Error("send blocked by session policy");
		}
		if (acpResolution?.kind === "stale") throw acpResolution.error;
		if (acpResolution?.kind === "ready" && sessionKey) {
			const startedAt = Date.now();
			registerAgentRunContext(runId, { sessionKey });
			emitAcpLifecycleStart({
				runId,
				startedAt
			});
			const visibleTextAccumulator = createAcpVisibleTextAccumulator();
			let stopReason;
			try {
				const dispatchPolicyError = resolveAcpDispatchPolicyError(cfg);
				if (dispatchPolicyError) throw dispatchPolicyError;
				const agentPolicyError = resolveAcpAgentPolicyError(cfg, normalizeAgentId(acpResolution.meta.agent || resolveAgentIdFromSessionKey(sessionKey)));
				if (agentPolicyError) throw agentPolicyError;
				await acpManager.runTurn({
					cfg,
					sessionKey,
					text: body,
					mode: "prompt",
					requestId: runId,
					signal: opts.abortSignal,
					onEvent: (event) => {
						if (event.type === "done") {
							stopReason = event.stopReason;
							return;
						}
						if (event.type !== "text_delta") return;
						if (event.stream && event.stream !== "output") return;
						if (!event.text) return;
						const visibleUpdate = visibleTextAccumulator.consume(event.text);
						if (!visibleUpdate) return;
						emitAcpAssistantDelta({
							runId,
							text: visibleUpdate.text,
							delta: visibleUpdate.delta
						});
					}
				});
			} catch (error) {
				const acpError = toAcpRuntimeError({
					error,
					fallbackCode: "ACP_TURN_FAILED",
					fallbackMessage: "ACP turn failed before completion."
				});
				emitAcpLifecycleError({
					runId,
					message: acpError.message
				});
				throw acpError;
			}
			emitAcpLifecycleEnd({ runId });
			const finalTextRaw = visibleTextAccumulator.finalizeRaw();
			const finalText = visibleTextAccumulator.finalize();
			try {
				sessionEntry = await persistAcpTurnTranscript({
					body,
					finalText: finalTextRaw,
					sessionId,
					sessionKey,
					sessionEntry,
					sessionStore,
					storePath,
					sessionAgentId,
					threadId: opts.threadId,
					sessionCwd: resolveAcpSessionCwd(acpResolution.meta) ?? workspaceDir
				});
			} catch (error) {
				log.warn(`ACP transcript persistence failed for ${sessionKey}: ${error instanceof Error ? error.message : String(error)}`);
			}
			const result = buildAcpResult({
				payloadText: finalText,
				startedAt,
				stopReason,
				abortSignal: opts.abortSignal
			});
			const payloads = result.payloads;
			return await deliverAgentCommandResult({
				cfg,
				deps,
				runtime,
				opts,
				outboundSession,
				sessionEntry,
				result,
				payloads
			});
		}
		let resolvedThinkLevel = thinkOnce ?? thinkOverride ?? persistedThinking;
		const resolvedVerboseLevel = verboseOverride ?? persistedVerbose ?? agentCfg?.verboseDefault;
		if (sessionKey) registerAgentRunContext(runId, {
			sessionKey,
			verboseLevel: resolvedVerboseLevel
		});
		const needsSkillsSnapshot = isNewSession || !sessionEntry?.skillsSnapshot;
		const skillsSnapshotVersion = getSkillsSnapshotVersion(workspaceDir);
		const skillFilter = resolveAgentSkillsFilter(cfg, sessionAgentId);
		const skillsSnapshot = needsSkillsSnapshot ? buildWorkspaceSkillSnapshot(workspaceDir, {
			config: cfg,
			eligibility: { remote: getRemoteSkillEligibility() },
			snapshotVersion: skillsSnapshotVersion,
			skillFilter
		}) : sessionEntry?.skillsSnapshot;
		if (skillsSnapshot && sessionStore && sessionKey && needsSkillsSnapshot) {
			const next = {
				...sessionEntry ?? {
					sessionId,
					updatedAt: Date.now()
				},
				sessionId,
				updatedAt: Date.now(),
				skillsSnapshot
			};
			await persistSessionEntry({
				sessionStore,
				sessionKey,
				storePath,
				entry: next
			});
			sessionEntry = next;
		}
		if (sessionStore && sessionKey) {
			const next = {
				...sessionStore[sessionKey] ?? sessionEntry ?? {
					sessionId,
					updatedAt: Date.now()
				},
				sessionId,
				updatedAt: Date.now()
			};
			if (thinkOverride) next.thinkingLevel = thinkOverride;
			applyVerboseOverride(next, verboseOverride);
			await persistSessionEntry({
				sessionStore,
				sessionKey,
				storePath,
				entry: next
			});
			sessionEntry = next;
		}
		const configuredDefaultRef = resolveDefaultModelForAgent({
			cfg,
			agentId: sessionAgentId
		});
		const { provider: defaultProvider, model: defaultModel } = normalizeModelRef(configuredDefaultRef.provider, configuredDefaultRef.model);
		let provider = defaultProvider;
		let model = defaultModel;
		const hasAllowlist = agentCfg?.models && Object.keys(agentCfg.models).length > 0;
		const hasStoredOverride = Boolean(sessionEntry?.modelOverride || sessionEntry?.providerOverride);
		const explicitProviderOverride = typeof opts.provider === "string" ? normalizeExplicitOverrideInput(opts.provider, "provider") : void 0;
		const explicitModelOverride = typeof opts.model === "string" ? normalizeExplicitOverrideInput(opts.model, "model") : void 0;
		const hasExplicitRunOverride = Boolean(explicitProviderOverride || explicitModelOverride);
		if (hasExplicitRunOverride && opts.allowModelOverride !== true) throw new Error("Model override is not authorized for this caller.");
		const needsModelCatalog = hasAllowlist || hasStoredOverride || hasExplicitRunOverride;
		let allowedModelKeys = /* @__PURE__ */ new Set();
		let allowedModelCatalog = [];
		let modelCatalog = null;
		let allowAnyModel = false;
		if (needsModelCatalog) {
			modelCatalog = await loadModelCatalog({ config: cfg });
			const allowed = buildAllowedModelSet({
				cfg,
				catalog: modelCatalog,
				defaultProvider,
				defaultModel,
				agentId: sessionAgentId
			});
			allowedModelKeys = allowed.allowedKeys;
			allowedModelCatalog = allowed.allowedCatalog;
			allowAnyModel = allowed.allowAny ?? false;
		}
		if (sessionEntry && sessionStore && sessionKey && hasStoredOverride) {
			const entry = sessionEntry;
			const overrideProvider = sessionEntry.providerOverride?.trim() || defaultProvider;
			const overrideModel = sessionEntry.modelOverride?.trim();
			if (overrideModel) {
				const normalizedOverride = normalizeModelRef(overrideProvider, overrideModel);
				const key = modelKey(normalizedOverride.provider, normalizedOverride.model);
				if (!allowAnyModel && !allowedModelKeys.has(key)) {
					const { updated } = applyModelOverrideToSessionEntry({
						entry,
						selection: {
							provider: defaultProvider,
							model: defaultModel,
							isDefault: true
						}
					});
					if (updated) await persistSessionEntry({
						sessionStore,
						sessionKey,
						storePath,
						entry
					});
				}
			}
		}
		const storedProviderOverride = sessionEntry?.providerOverride?.trim();
		const storedModelOverride = sessionEntry?.modelOverride?.trim();
		if (storedModelOverride) {
			const normalizedStored = normalizeModelRef(storedProviderOverride || defaultProvider, storedModelOverride);
			const key = modelKey(normalizedStored.provider, normalizedStored.model);
			if (allowAnyModel || allowedModelKeys.has(key)) {
				provider = normalizedStored.provider;
				model = normalizedStored.model;
			}
		}
		const providerForAuthProfileValidation = provider;
		if (hasExplicitRunOverride) {
			const explicitRef = explicitModelOverride ? explicitProviderOverride ? normalizeModelRef(explicitProviderOverride, explicitModelOverride) : parseModelRef(explicitModelOverride, provider) : explicitProviderOverride ? normalizeModelRef(explicitProviderOverride, model) : null;
			if (!explicitRef) throw new Error("Invalid model override.");
			const explicitKey = modelKey(explicitRef.provider, explicitRef.model);
			if (!allowAnyModel && !allowedModelKeys.has(explicitKey)) throw new Error(`Model override "${sanitizeForLog(explicitRef.provider)}/${sanitizeForLog(explicitRef.model)}" is not allowed for agent "${sessionAgentId}".`);
			provider = explicitRef.provider;
			model = explicitRef.model;
		}
		if (sessionEntry) {
			const authProfileId = sessionEntry.authProfileOverride;
			if (authProfileId) {
				const entry = sessionEntry;
				const profile = ensureAuthProfileStore().profiles[authProfileId];
				if (!profile || profile.provider !== providerForAuthProfileValidation) {
					if (sessionStore && sessionKey) await clearSessionAuthProfileOverride({
						sessionEntry: entry,
						sessionStore,
						sessionKey,
						storePath
					});
				}
			}
		}
		if (!resolvedThinkLevel) {
			let catalogForThinking = modelCatalog ?? allowedModelCatalog;
			if (!catalogForThinking || catalogForThinking.length === 0) {
				modelCatalog = await loadModelCatalog({ config: cfg });
				catalogForThinking = modelCatalog;
			}
			resolvedThinkLevel = resolveThinkingDefault({
				cfg,
				provider,
				model,
				catalog: catalogForThinking
			});
		}
		if (resolvedThinkLevel === "xhigh" && !supportsXHighThinking(provider, model)) {
			if (Boolean(thinkOnce || thinkOverride)) throw new Error(`Thinking level "xhigh" is only supported for ${formatXHighModelHint()}.`);
			resolvedThinkLevel = "high";
			if (sessionEntry && sessionStore && sessionKey && sessionEntry.thinkingLevel === "xhigh") {
				const entry = sessionEntry;
				entry.thinkingLevel = "high";
				entry.updatedAt = Date.now();
				await persistSessionEntry({
					sessionStore,
					sessionKey,
					storePath,
					entry
				});
			}
		}
		let sessionFile;
		if (sessionStore && sessionKey) {
			const resolvedSessionFile = await resolveSessionTranscriptFile({
				sessionId,
				sessionKey,
				sessionStore,
				storePath,
				sessionEntry,
				agentId: sessionAgentId,
				threadId: opts.threadId
			});
			sessionFile = resolvedSessionFile.sessionFile;
			sessionEntry = resolvedSessionFile.sessionEntry;
		}
		if (!sessionFile) {
			const resolvedSessionFile = await resolveSessionTranscriptFile({
				sessionId,
				sessionKey: sessionKey ?? sessionId,
				storePath,
				sessionEntry,
				agentId: sessionAgentId,
				threadId: opts.threadId
			});
			sessionFile = resolvedSessionFile.sessionFile;
			sessionEntry = resolvedSessionFile.sessionEntry;
		}
		const startedAt = Date.now();
		let lifecycleEnded = false;
		let result;
		let fallbackProvider = provider;
		let fallbackModel = model;
		try {
			const runContext = resolveAgentRunContext(opts);
			const messageChannel = resolveMessageChannel(runContext.messageChannel, opts.replyChannel ?? opts.channel);
			const spawnedBy = normalizedSpawned.spawnedBy ?? sessionEntry?.spawnedBy;
			const effectiveFallbacksOverride = resolveEffectiveModelFallbacks({
				cfg,
				agentId: sessionAgentId,
				hasSessionModelOverride: Boolean(storedModelOverride)
			});
			let fallbackAttemptIndex = 0;
			const fallbackResult = await runWithModelFallback({
				cfg,
				provider,
				model,
				runId,
				agentDir,
				fallbacksOverride: effectiveFallbacksOverride,
				run: async (providerOverride, modelOverride, runOptions) => {
					const isFallbackRetry = fallbackAttemptIndex > 0;
					fallbackAttemptIndex += 1;
					return runAgentAttempt({
						providerOverride,
						modelOverride,
						cfg,
						sessionEntry,
						sessionId,
						sessionKey,
						sessionAgentId,
						sessionFile,
						workspaceDir,
						body,
						isFallbackRetry,
						resolvedThinkLevel,
						timeoutMs,
						runId,
						opts,
						runContext,
						spawnedBy,
						messageChannel,
						skillsSnapshot,
						resolvedVerboseLevel,
						agentDir,
						authProfileProvider: providerForAuthProfileValidation,
						sessionStore,
						storePath,
						allowTransientCooldownProbe: runOptions?.allowTransientCooldownProbe,
						sessionHasHistory: !isNewSession || await sessionFileHasContent(sessionFile),
						onAgentEvent: (evt) => {
							if (evt.stream === "lifecycle" && typeof evt.data?.phase === "string" && (evt.data.phase === "end" || evt.data.phase === "error")) lifecycleEnded = true;
						}
					});
				}
			});
			result = fallbackResult.result;
			fallbackProvider = fallbackResult.provider;
			fallbackModel = fallbackResult.model;
			if (!lifecycleEnded) {
				const stopReason = result.meta.stopReason;
				if (stopReason && stopReason !== "end_turn") console.error(`[agent] run ${runId} ended with stopReason=${stopReason}`);
				emitAgentEvent({
					runId,
					stream: "lifecycle",
					data: {
						phase: "end",
						startedAt,
						endedAt: Date.now(),
						aborted: result.meta.aborted ?? false,
						stopReason
					}
				});
			}
		} catch (err) {
			if (!lifecycleEnded) emitAgentEvent({
				runId,
				stream: "lifecycle",
				data: {
					phase: "error",
					startedAt,
					endedAt: Date.now(),
					error: String(err)
				}
			});
			throw err;
		}
		if (sessionStore && sessionKey) await updateSessionStoreAfterAgentRun({
			cfg,
			contextTokensOverride: agentCfg?.contextTokens,
			sessionId,
			sessionKey,
			storePath,
			sessionStore,
			defaultProvider: provider,
			defaultModel: model,
			fallbackProvider,
			fallbackModel,
			result
		});
		const payloads = result.payloads ?? [];
		return await deliverAgentCommandResult({
			cfg,
			deps,
			runtime,
			opts,
			outboundSession,
			sessionEntry,
			result,
			payloads
		});
	} finally {
		clearAgentRunContext(runId);
	}
}
async function agentCommand(opts, runtime = defaultRuntime, deps = createDefaultDeps()) {
	return await agentCommandInternal({
		...opts,
		senderIsOwner: opts.senderIsOwner ?? true,
		allowModelOverride: opts.allowModelOverride ?? true
	}, runtime, deps);
}
async function agentCommandFromIngress(opts, runtime = defaultRuntime, deps = createDefaultDeps()) {
	if (typeof opts.senderIsOwner !== "boolean") throw new Error("senderIsOwner must be explicitly set for ingress agent runs.");
	if (typeof opts.allowModelOverride !== "boolean") throw new Error("allowModelOverride must be explicitly set for ingress agent runs.");
	return await agentCommandInternal({
		...opts,
		senderIsOwner: opts.senderIsOwner,
		allowModelOverride: opts.allowModelOverride
	}, runtime, deps);
}
//#endregion
export { resolveAgentDeliveryPlan as a, resolvePreferredSessionKeyForSessionIdMatches as i, agentCommandFromIngress as n, resolveAgentOutboundTarget as o, resolveSessionKeyForRequest as r, agentCommand as t };
