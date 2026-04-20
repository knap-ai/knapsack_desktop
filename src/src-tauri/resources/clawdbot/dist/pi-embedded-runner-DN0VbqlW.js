import { i as formatErrorMessage } from "./errors-D8p6rxH8.js";
import { d as readStringValue, i as normalizeLowercaseStringOrEmpty, o as normalizeOptionalLowercaseString, s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { g as shortenHomeInString, m as resolveUserPath } from "./utils-D5DtWkEu.js";
import { t as sanitizeForLog } from "./ansi-Bs_ZZlnS.js";
import { t as createSubsystemLogger } from "./subsystem-Cgmckbux.js";
import { t as isTruthyEnvValue } from "./env-BiSxzotM.js";
import { _ as resolveStateDir } from "./paths-Dvv9VRAc.js";
import { n as resolveOwnerDisplaySetting } from "./owner-display-CR4JL3B8.js";
import { J as normalizeGoogleApiBaseUrl } from "./io-5pxHCi7V.js";
import { r as normalizeProviderId } from "./provider-id-KaStHhRz.js";
import { b as isSubagentSessionKey, c as normalizeAgentId, y as isCronSessionKey } from "./session-key-Bh1lMwK5.js";
import { n as DEFAULT_MODEL, r as DEFAULT_PROVIDER, t as DEFAULT_CONTEXT_TOKENS } from "./defaults-CiQa3xnX.js";
import { t as describeProviderRequestRoutingSummary } from "./provider-attribution-BJhkfmfB.js";
import "./workspace-hhTlRYqM.js";
import { h as listAgentEntries, m as resolveSessionAgentIds, r as resolveAgentExecutionContract, t as hasConfiguredModelFallbacks } from "./agent-scope-KFH9bkHi.js";
import { i as isMarkdownCapableMessageChannel, u as normalizeMessageChannel } from "./message-channel-CBqCPFa_.js";
import { n as ensureAuthProfileStore } from "./store-C1I9Mkh8.js";
import { r as wrapStreamFnTextTransforms } from "./plugin-text-transforms-BQzFygd9.js";
import { y as listRegisteredAgentHarnesses } from "./loader-DYW2PvbF.js";
import { s as joinPresentTextSegments, t as getGlobalHookRunner } from "./hook-runner-global-CYvQf43U.js";
import { r as resolveContextEngine } from "./registry-hc1-G3yP.js";
import { F as resolveProviderSystemPromptContribution, I as resolveProviderTextTransforms, K as transformProviderSystemPrompt, x as prepareProviderRuntimeAuth } from "./provider-runtime-khVgWetm.js";
import { t as resolveOpenClawAgentDir } from "./agent-paths-JWlHCT48.js";
import { t as ensureOpenClawModelsJson } from "./models-config-CkfuLe-V.js";
import { f as resolveDefaultModelForAgent } from "./model-selection-CTdyYoio.js";
import { t as ensureContextEnginesInitialized } from "./init-Dtmr41at.js";
import { t as ensureRuntimePluginsLoaded } from "./runtime-plugins-CSOygVdm.js";
import { a as resolveToolCallArgumentsEncoding } from "./provider-model-compat-Dsxuyzi4.js";
import { i as resolveSessionLockMaxHoldFromTimeout, t as acquireSessionWriteLock } from "./session-write-lock-CcI4KSH8.js";
import { n as sleepWithAbort } from "./backoff-DdY2WS-F.js";
import { a as normalizeUsage, i as makeZeroUsageSnapshot, r as hasNonzeroUsage, t as derivePromptTokens } from "./usage-CDsCClku.js";
import { n as extractAssistantTextForPhase, o as parseAssistantTextSignature, s as resolveAssistantMessagePhase } from "./chat-message-content-BsffCIGz.js";
import { t as parseInlineDirectives } from "./directive-tags-_9B0F8vD.js";
import { $ as assessLastAssistantMessage, A as SAFETY_MARGIN, B as readLastCacheTtlTimestamp, C as trackSessionManagerAccess, D as getDmHistoryLimitFromSessionKey, E as buildEmbeddedMessageActionDiscoveryInput, G as resolveLiveToolResultMaxChars, H as shouldAllowProviderOwnedThinkingReplay, J as truncateOversizedToolResultsInSessionManager, K as sessionLikelyHasOversizedToolResults, O as limitHistoryTurns, Q as createPreparedEmbeddedPiSettingsManager, R as resolveCompactionTimeoutMs, S as prewarmSessionFile, T as validateReplayTurns, U as guardSessionManager, V as resolveTranscriptPolicy, W as estimateToolResultReductionPotential, X as installToolResultContextGuard, Y as installContextEngineLoopHook, Z as repairSessionFileIfNeeded, _ as describeEmbeddedAgentStreamStrategy, at as resolveChannelCapabilities, b as resolveEmbeddedAgentStreamFn, c as buildEmbeddedCompactionRuntimeContext, d as mapThinkingLevel, et as dropThinkingBlocks, f as splitSdkTools, g as createSystemPromptOverride, h as buildEmbeddedSystemPrompt, j as estimateMessagesTokens, k as buildEmbeddedExtensionFactories, l as resolveEmbeddedCompactionTarget, lt as captureCompactionCheckpointSnapshot, m as applySystemPromptOverrideToSession, mt as resolveSessionCompactionCheckpointReason, n as asCompactionHookRunner, nt as releaseWsSession, ot as filterHeartbeatPairs, p as collectAllowedToolNames, pt as persistSessionCompactionCheckpoint, q as truncateOversizedToolResultsInSession, rt as buildStreamErrorAssistantMessage, s as runPostCompactionSideEffects, t as readPiModelContextTokens, tt as createBundleLspToolRuntime, u as flushPendingToolResultsAfterIdle, ut as cleanupCompactionCheckpointSnapshot, v as resolveEmbeddedAgentApiKey, w as sanitizeSessionHistory, x as resolveEmbeddedRunSkillEntries, y as resolveEmbeddedAgentBaseStreamFn, z as isCacheTtlEligibleProvider } from "./model-context-tokens-z5hvDVkk.js";
import { i as enqueueCommandInLane, o as getQueueSize } from "./command-queue-BLDIg9zn.js";
import { a as formatContextWindowWarningMessage, i as formatContextWindowBlockMessage, n as CONTEXT_WINDOW_WARN_BELOW_TOKENS, o as resolveContextWindowInfo, r as evaluateContextWindowGuard, t as CONTEXT_WINDOW_HARD_MIN_TOKENS } from "./context-window-guard-CERNVERH.js";
import { a as extractToolResultText, c as isToolResultTimedOut, d as isMessagingToolSendAction, f as normalizeEmbeddedAgentRuntime, i as extractToolResultMediaArtifact, l as sanitizeToolResult, m as resolveEmbeddedAgentRuntime, n as extractMessagingToolSend, o as filterToolResultMediaUrls, p as resolveEmbeddedAgentHarnessFallback, r as extractToolErrorMessage, s as isToolResultError, t as buildEmbeddedAttemptToolRunContext, u as isMessagingTool } from "./attempt.tool-run-context-CgVg2Nu2.js";
import { a as isSilentReplyText, i as isSilentReplyPrefixText, o as startsWithSilentToken, r as isSilentReplyPayloadText, s as stripLeadingSilentToken } from "./tokens-CKM4Lddu.js";
import { r as resolveHeartbeatSummaryForAgent } from "./heartbeat-summary-Cgk1PVlc.js";
import { t as getMachineDisplayName } from "./machine-name-dWhRKMd-.js";
import { n as ensureGlobalUndiciEnvProxyDispatcher, r as ensureGlobalUndiciStreamTimeouts } from "./undici-global-dispatcher-yJO9KyXW.js";
import { f as MAX_IMAGE_BYTES } from "./mime-B6nXlmtY.js";
import { l as normalizeToolName } from "./tool-policy-C3rJHw58.js";
import { a as listChannelSupportedActions, c as resolveChannelReactionGuidance, o as resolveChannelMessageToolCapabilities, s as resolveChannelMessageToolHints, u as getPluginToolMeta } from "./channel-tools-DdZyHuyK.js";
import { n as buildTtsSystemPromptHint } from "./tts-m-RAIr7w.js";
import { t as isReasoningTagProvider } from "./provider-utils-DNY7A_rU.js";
import { t as parseBooleanValue } from "./boolean-C7EklDWC.js";
import { n as estimateBase64DecodedBytes } from "./base64-BgT9iohk.js";
import { a as prependBootstrapPromptWarning, i as buildBootstrapTruncationReportMeta, n as buildBootstrapInjectionStats, r as buildBootstrapPromptWarning, t as analyzeBootstrapBudget } from "./bootstrap-budget-BfULAZ3v.js";
import { a as resolveContextInjectionMode, i as resolveBootstrapContextForRun, n as hasCompletedBootstrapTurn, o as resolveHeartbeatPromptForSystemPrompt, r as makeBootstrapWarn, t as FULL_BOOTSTRAP_COMPLETED_CUSTOM_TYPE } from "./bootstrap-files-ZYTN7n8L.js";
import { _ as resolveBootstrapPromptTruncationWarningMode, a as isMessagingToolDuplicateNormalized, c as extractToolCallsFromAssistant, d as downgradeOpenAIFunctionCallReasoningPairs, g as resolveBootstrapMaxChars, n as validateGeminiTurns, o as normalizeTextForComparison, r as pickFallbackThinkingLevel, t as validateAnthropicTurns, u as sanitizeToolCallIdsForCloudCodeAssist, v as resolveBootstrapTotalMaxChars } from "./pi-embedded-helpers-6UMMUO8y.js";
import { n as formatRawAssistantErrorForUi } from "./assistant-error-format-tQ4SCN8S.js";
import { C as isTimeoutErrorMessage, D as parseExecApprovalResultText, d as stableStringify$1, l as isRawApiErrorPayload, n as formatBillingErrorMessage, o as getApiErrorPayloadFingerprint, t as BILLING_ERROR_USER_MESSAGE } from "./sanitize-user-facing-text-CQF1CTnZ.js";
import { _ as parseImageDimensionError, a as formatAssistantErrorText, c as isCloudCodeAssistFormatError, d as isFailoverAssistantError, f as isFailoverErrorMessage, i as extractObservedOverflowTokenCount, l as isCompactionFailureError, m as isRateLimitAssistantError, o as isAuthAssistantError, p as isLikelyContextOverflowError, s as isBillingAssistantError, t as classifyFailoverReason, v as parseImageSizeError } from "./errors-CJULmF31.js";
import { n as resolveSandboxRuntimeStatus } from "./runtime-status-DhGewqgv.js";
import { i as resolveImageSanitizationLimits } from "./tool-images-D6i9LZcG.js";
import { t as resolveOpenClawDocsPath } from "./docs-path-cNW4ADLB.js";
import { a as isTimeoutError, n as coerceToFailoverError, r as describeFailoverError, s as resolveFailoverStatus, t as FailoverError } from "./failover-error-CqpA2cGv.js";
import { t as buildModelAliasLines } from "./model-alias-lines-C__EBjO0.js";
import "./auth-profiles-BQEgLpFI.js";
import { f as resolveProfilesUnavailableReason, l as markAuthProfileFailure, n as resolveAuthProfileOrder, s as isProfileInCooldown, t as resolveAuthProfileEligibility, u as markAuthProfileUsed } from "./order-t2w38pFY.js";
import { r as markAuthProfileGood } from "./profiles-CVErLX2C.js";
import { t as redactIdentifier } from "./redact-identifier-Bi5PTLUH.js";
import { t as sanitizeForConsole } from "./console-sanitize-OEKi2aRr.js";
import { c as resolveModelAuthMode, n as applyLocalNoAuthHeaderOverride, r as getApiKeyForModel, t as applyAuthHeaderOverride, u as shouldPreferExplicitConfigApiKeyAuth } from "./model-auth-KKLbMBGv.js";
import { a as shouldUseOpenAIWebSocketTransport, c as supportsModelTools, i as shouldPersistCompletedBootstrapTurn, n as composeSystemPromptWithHookContext, o as logProviderToolSchemaDiagnostics, r as resolveAttemptSpawnWorkspaceDir, s as normalizeProviderToolSchemas, t as appendAttemptCacheTtlIfNeeded } from "./attempt.thread-helpers-DleRYb_O.js";
import { l as sanitizeTransportPayloadText, n as registerProviderStreamForModel, s as mergeTransportHeaders, u as buildGuardedModelFetch } from "./anthropic-vertex-stream-BpkPWKP9.js";
import { d as sanitizeRuntimeProviderRequestOverrides, s as resolveProviderRequestConfig } from "./provider-request-config-S_W3yUlE.js";
import { t as log$3 } from "./logger-CMwqWyWx.js";
import { r as streamWithPayloadPatch } from "./moonshot-thinking-stream-wrappers-B057G_9z.js";
import { i as stripSystemPromptCacheBoundary, n as prependSystemPromptAdditionAfterCacheBoundary } from "./system-prompt-cache-boundary-NUMoTji1.js";
import { t as parseGeminiAuth } from "./gemini-auth-CalhrTDk.js";
import { i as getOrCreateSessionMcpRuntime, n as materializeBundleMcpToolsForRun, r as disposeSessionMcpRuntime } from "./pi-bundle-mcp-tools-vusm-AE2.js";
import { n as setReplyPayloadMetadata } from "./reply-payload-dsrzRv7F.js";
import { r as parseFenceSpans } from "./fences-u7A-b4Xc.js";
import { r as splitMediaFromOutput } from "./parse-CwkQk8aD.js";
import { u as parseReplyDirectives } from "./deliver-BNvlWd4P.js";
import { p as resolveSendableOutboundReplyParts, s as hasOutboundReplyContent } from "./reply-payload-Db_8BQiX.js";
import { r as resolveToolDisplay } from "./tool-display-1Aycu5Cc.js";
import { a as emitAgentItemEvent, i as emitAgentEvent, n as emitAgentApprovalEvent, o as emitAgentPatchSummaryEvent, r as emitAgentCommandOutputEvent, s as emitAgentPlanEvent } from "./agent-events-BLJ1mmc3.js";
import { t as EmbeddedBlockChunker } from "./pi-embedded-block-chunker-CerCSf1M.js";
import { a as shouldAllowCooldownProbeForReason, i as LiveSessionModelSwitchError, o as buildApiErrorObservationFields, s as buildTextObservationFields } from "./model-fallback-D2mt9Plr.js";
import { _ as isStrictAgenticExecutionContractActive, i as findActiveSessionTask, n as buildActiveVideoGenerationTaskPromptContextForSession, r as buildActiveMusicGenerationTaskPromptContextForSession, v as isStrictAgenticSupportedProviderModel } from "./openclaw-tools-CUmYpN1l.js";
import { i as isSameToolMutationAction, n as isLikelyMutatingToolName, t as buildToolMutationState } from "./tool-mutation-BL_oIgx1.js";
import { a as stripDowngradedToolCallText } from "./assistant-visible-text-Bu-2kS6O.js";
import { a as extractThinkingFromTaggedText, c as isAssistantMessage, i as extractThinkingFromTaggedStream, l as promoteThinkingTagsToBlocks, n as extractAssistantThinking, o as formatReasoningMessage, r as extractAssistantVisibleText, s as inferToolMetaFromArgs, t as extractAssistantText } from "./pi-embedded-utils-CzYG7ldK.js";
import { a as MIN_PROMPT_BUDGET_TOKENS, i as MIN_PROMPT_BUDGET_RATIO, n as applyPiAutoCompactionGuard } from "./pi-settings-RskXDZtF.js";
import { i as toClientToolDefinitions, n as findClientToolNameConflicts, t as createClientToolNameConflictError } from "./pi-tool-definition-adapter-CClxmVg9.js";
import { n as resolveToolLoopDetectionConfig, t as createOpenClawCodingTools } from "./pi-tools-BXpX0SpG.js";
import { c as resolveEffectiveToolFsWorkspaceOnly } from "./local-roots-BrPriMlc.js";
import { i as generateSecureToken } from "./secure-random-DHoiZOqc.js";
import { c as recordTaskRunProgressByRunId, d as startTaskRunByRunId, i as createQueuedTaskRun, o as failTaskRunByRunId, r as completeTaskRunByRunId, u as setDetachedTaskDeliveryStatusByRunId } from "./task-executor-ZyzAPL-M.js";
import { o as resolveGlobalLane, s as resolveSessionLane } from "./queue-bNmQjdDV.js";
import { l as setActiveEmbeddedRun, n as clearActiveEmbeddedRun, u as updateActiveEmbeddedRunSnapshot } from "./runs-D-CeEXwD.js";
import { c as updateTaskNotifyPolicyForOwner, i as findTaskByRunIdForOwner, n as cancelTaskByIdForOwner } from "./task-owner-access-Pn4DXNYI.js";
import { t as resolveAgentTimeoutMs } from "./timeout-CxW3WOrq.js";
import { c as resolveSkillsPromptForRun } from "./skills-Cwx5TftI.js";
import { n as applySkillEnvOverridesFromSnapshot, t as applySkillEnvOverrides } from "./env-overrides-CqQvDQ3v.js";
import { t as detectRuntimeShell } from "./shell-utils-7dy62Zl_.js";
import { o as resolveSandboxContext } from "./sandbox-BBeXIB2_.js";
import { n as rewriteTranscriptEntriesInSessionManager, t as rewriteTranscriptEntriesInSessionFile } from "./transcript-rewrite-DHjUPkJL.js";
import { a as sanitizeToolUseResultPairing, t as isRedactedSessionsSpawnAttachment } from "./session-transcript-repair-DyGWFT1O.js";
import { t as resolveSystemPromptOverride } from "./system-prompt-override-CuDxkMuk.js";
import { t as buildSystemPromptParams } from "./system-prompt-params-xdcYtMFY.js";
import { t as buildSystemPromptReport } from "./system-prompt-report-CLLKjEMB.js";
import "./tool-loop-detection-BKqLjSpk.js";
import { a as resolveCacheRetention, i as isGooglePromptCacheEligible, n as resolveAgentTransportOverride, t as applyExtraParamsToAgent } from "./extra-params-DFVfEeA7.js";
import { t as buildEmbeddedSandboxInfo } from "./sandbox-info-DFrJghWk.js";
import { n as createHtmlEntityToolCallArgumentDecodingWrapper } from "./provider-stream-shared-DisAYlnl.js";
import { t as detectAndLoadPromptImages } from "./images-BXD_c4El.js";
import "./ollama-runtime-uuoemyaO.js";
import { n as resolveModelAsync } from "./model-Bl_gU5g0.js";
import { a as resolveStoredSessionKeyForSessionId, i as resolveSessionKeyForRequest, n as shouldSwitchToLiveModel, t as clearLiveModelSwitchPending } from "./live-model-switch-DHqPme9r.js";
import { n as resolveRunWorkspaceDir, t as redactRunIdentifier } from "./workspace-run-BpESKBl2.js";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import fs$1 from "node:fs/promises";
import crypto, { randomBytes, randomUUID } from "node:crypto";
import { DefaultResourceLoader, SessionManager, createAgentSession, estimateTokens } from "@mariozechner/pi-coding-agent";
import { createAssistantMessageEventStream } from "@mariozechner/pi-ai";
//#region src/utils/safe-json.ts
function safeJsonStringify(value) {
	try {
		return JSON.stringify(value, (_key, val) => {
			if (typeof val === "bigint") return val.toString();
			if (typeof val === "function") return "[Function]";
			if (val instanceof Error) return {
				name: val.name,
				message: val.message,
				stack: val.stack
			};
			if (val instanceof Uint8Array) return {
				type: "Uint8Array",
				data: Buffer.from(val).toString("base64")
			};
			return val;
		});
	} catch {
		return null;
	}
}
//#endregion
//#region src/agents/payload-redaction.ts
const REDACTED_IMAGE_DATA = "<redacted>";
const NON_CREDENTIAL_FIELD_NAMES = new Set([
	"passwordfile",
	"tokenbudget",
	"tokencount",
	"tokenfield",
	"tokenlimit",
	"tokens"
]);
function normalizeFieldName(value) {
	return normalizeLowercaseStringOrEmpty(value.replaceAll(/[^a-z0-9]/gi, ""));
}
function isCredentialFieldName(key) {
	const normalized = normalizeFieldName(key);
	if (!normalized || NON_CREDENTIAL_FIELD_NAMES.has(normalized)) return false;
	if (normalized === "authorization" || normalized === "proxyauthorization") return true;
	return normalized.endsWith("apikey") || normalized.endsWith("password") || normalized.endsWith("passwd") || normalized.endsWith("passphrase") || normalized.endsWith("secret") || normalized.endsWith("secretkey") || normalized.endsWith("token");
}
function hasImageMime(record) {
	return [
		normalizeLowercaseStringOrEmpty(record.mimeType),
		normalizeLowercaseStringOrEmpty(record.media_type),
		normalizeLowercaseStringOrEmpty(record.mime_type)
	].some((value) => value.startsWith("image/"));
}
function shouldRedactImageData(record) {
	if (typeof record.data !== "string") return false;
	return normalizeLowercaseStringOrEmpty(record.type) === "image" || hasImageMime(record);
}
function digestBase64Payload(data) {
	return crypto.createHash("sha256").update(data).digest("hex");
}
function visitDiagnosticPayload(value, opts) {
	const seen = /* @__PURE__ */ new WeakSet();
	const visit = (input) => {
		if (Array.isArray(input)) return input.map((entry) => visit(entry));
		if (!input || typeof input !== "object") return input;
		if (seen.has(input)) return "[Circular]";
		seen.add(input);
		const record = input;
		const out = {};
		for (const [key, val] of Object.entries(record)) {
			if (opts?.omitField?.(key)) continue;
			out[key] = visit(val);
		}
		if (shouldRedactImageData(record)) {
			out.data = REDACTED_IMAGE_DATA;
			out.bytes = estimateBase64DecodedBytes(record.data);
			out.sha256 = digestBase64Payload(record.data);
		}
		return out;
	};
	return visit(value);
}
/**
* Removes credential-like fields and image/base64 payload data from diagnostic
* objects before persistence.
*/
function sanitizeDiagnosticPayload(value) {
	return visitDiagnosticPayload(value, { omitField: isCredentialFieldName });
}
//#endregion
//#region src/agents/queued-file-writer.ts
function getQueuedFileWriter(writers, filePath) {
	const existing = writers.get(filePath);
	if (existing) return existing;
	const dir = path.dirname(filePath);
	const ready = fs$1.mkdir(dir, { recursive: true }).catch(() => void 0);
	let queue = Promise.resolve();
	const writer = {
		filePath,
		write: (line) => {
			queue = queue.then(() => ready).then(() => fs$1.appendFile(filePath, line, "utf8")).catch(() => void 0);
		}
	};
	writers.set(filePath, writer);
	return writer;
}
//#endregion
//#region src/agents/anthropic-payload-log.ts
const writers$1 = /* @__PURE__ */ new Map();
const log$2 = createSubsystemLogger("agent/anthropic-payload");
function resolvePayloadLogConfig(env) {
	const enabled = parseBooleanValue(env.OPENCLAW_ANTHROPIC_PAYLOAD_LOG) ?? false;
	const fileOverride = env.OPENCLAW_ANTHROPIC_PAYLOAD_LOG_FILE?.trim();
	return {
		enabled,
		filePath: fileOverride ? resolveUserPath(fileOverride) : path.join(resolveStateDir(env), "logs", "anthropic-payload.jsonl")
	};
}
function getWriter$1(filePath) {
	return getQueuedFileWriter(writers$1, filePath);
}
function formatError(error) {
	if (error instanceof Error) return error.message;
	if (typeof error === "string") return error;
	if (typeof error === "number" || typeof error === "boolean" || typeof error === "bigint") return String(error);
	if (error && typeof error === "object") return safeJsonStringify(error) ?? "unknown error";
}
function digest$1(value) {
	const serialized = safeJsonStringify(value);
	if (!serialized) return;
	return crypto.createHash("sha256").update(serialized).digest("hex");
}
function isAnthropicModel(model) {
	return model?.api === "anthropic-messages";
}
function findLastAssistantUsage(messages) {
	for (let i = messages.length - 1; i >= 0; i -= 1) {
		const msg = messages[i];
		if (msg?.role === "assistant" && msg.usage && typeof msg.usage === "object") return msg.usage;
	}
	return null;
}
function createAnthropicPayloadLogger(params) {
	const cfg = resolvePayloadLogConfig(params.env ?? process.env);
	if (!cfg.enabled) return null;
	const writer = params.writer ?? getWriter$1(cfg.filePath);
	const base = {
		runId: params.runId,
		sessionId: params.sessionId,
		sessionKey: params.sessionKey,
		provider: params.provider,
		modelId: params.modelId,
		modelApi: params.modelApi,
		workspaceDir: params.workspaceDir
	};
	const record = (event) => {
		const line = safeJsonStringify(event);
		if (!line) return;
		writer.write(`${line}\n`);
	};
	const wrapStreamFn = (streamFn) => {
		const wrapped = (model, context, options) => {
			if (!isAnthropicModel(model)) return streamFn(model, context, options);
			const nextOnPayload = (payload) => {
				const redactedPayload = sanitizeDiagnosticPayload(payload);
				record({
					...base,
					ts: (/* @__PURE__ */ new Date()).toISOString(),
					stage: "request",
					payload: redactedPayload,
					payloadDigest: digest$1(redactedPayload)
				});
				return options?.onPayload?.(payload, model);
			};
			return streamFn(model, context, {
				...options,
				onPayload: nextOnPayload
			});
		};
		return wrapped;
	};
	const recordUsage = (messages, error) => {
		const usage = findLastAssistantUsage(messages);
		const errorMessage = formatError(error);
		if (!usage) {
			if (errorMessage) record({
				...base,
				ts: (/* @__PURE__ */ new Date()).toISOString(),
				stage: "usage",
				error: errorMessage
			});
			return;
		}
		record({
			...base,
			ts: (/* @__PURE__ */ new Date()).toISOString(),
			stage: "usage",
			usage,
			error: errorMessage
		});
		log$2.info("anthropic usage", {
			runId: params.runId,
			sessionId: params.sessionId,
			usage
		});
	};
	log$2.info("anthropic payload logger enabled", { filePath: writer.filePath });
	return {
		enabled: true,
		wrapStreamFn,
		recordUsage
	};
}
//#endregion
//#region src/agents/trace-base.ts
function buildAgentTraceBase(params) {
	return {
		runId: params.runId,
		sessionId: params.sessionId,
		sessionKey: params.sessionKey,
		provider: params.provider,
		modelId: params.modelId,
		modelApi: params.modelApi,
		workspaceDir: params.workspaceDir
	};
}
//#endregion
//#region src/agents/cache-trace.ts
const writers = /* @__PURE__ */ new Map();
function resolveCacheTraceConfig(params) {
	const env = params.env ?? process.env;
	const config = params.cfg?.diagnostics?.cacheTrace;
	const enabled = parseBooleanValue(env.OPENCLAW_CACHE_TRACE) ?? config?.enabled ?? false;
	const fileOverride = config?.filePath?.trim() || env.OPENCLAW_CACHE_TRACE_FILE?.trim();
	const filePath = fileOverride ? resolveUserPath(fileOverride) : path.join(resolveStateDir(env), "logs", "cache-trace.jsonl");
	const includeMessages = parseBooleanValue(env.OPENCLAW_CACHE_TRACE_MESSAGES) ?? config?.includeMessages;
	const includePrompt = parseBooleanValue(env.OPENCLAW_CACHE_TRACE_PROMPT) ?? config?.includePrompt;
	const includeSystem = parseBooleanValue(env.OPENCLAW_CACHE_TRACE_SYSTEM) ?? config?.includeSystem;
	return {
		enabled,
		filePath,
		includeMessages: includeMessages ?? true,
		includePrompt: includePrompt ?? true,
		includeSystem: includeSystem ?? true
	};
}
function getWriter(filePath) {
	return getQueuedFileWriter(writers, filePath);
}
function stableStringify(value, seen = /* @__PURE__ */ new WeakSet()) {
	if (value === null || value === void 0) return String(value);
	if (typeof value === "number" && !Number.isFinite(value)) return JSON.stringify(String(value));
	if (typeof value === "bigint") return JSON.stringify(value.toString());
	if (typeof value !== "object") return JSON.stringify(value) ?? "null";
	if (seen.has(value)) return JSON.stringify("[Circular]");
	seen.add(value);
	if (value instanceof Error) return stableStringify({
		name: value.name,
		message: value.message,
		stack: value.stack
	}, seen);
	if (value instanceof Uint8Array) return stableStringify({
		type: "Uint8Array",
		data: Buffer.from(value).toString("base64")
	}, seen);
	if (Array.isArray(value)) {
		const serializedEntries = [];
		for (const entry of value) serializedEntries.push(stableStringify(entry, seen));
		return `[${serializedEntries.join(",")}]`;
	}
	const record = value;
	const serializedFields = [];
	for (const key of Object.keys(record).toSorted()) serializedFields.push(`${JSON.stringify(key)}:${stableStringify(record[key], seen)}`);
	return `{${serializedFields.join(",")}}`;
}
function digest(value) {
	const serialized = stableStringify(value);
	return crypto.createHash("sha256").update(serialized).digest("hex");
}
function summarizeMessages(messages) {
	const messageFingerprints = messages.map((msg) => digest(msg));
	return {
		messageCount: messages.length,
		messageRoles: messages.map((msg) => msg.role),
		messageFingerprints,
		messagesDigest: digest(messageFingerprints.join("|"))
	};
}
function createCacheTrace(params) {
	const cfg = resolveCacheTraceConfig(params);
	if (!cfg.enabled) return null;
	const writer = params.writer ?? getWriter(cfg.filePath);
	let seq = 0;
	const base = buildAgentTraceBase(params);
	const recordStage = (stage, payload = {}) => {
		const event = {
			...base,
			ts: (/* @__PURE__ */ new Date()).toISOString(),
			seq: seq += 1,
			stage
		};
		if (payload.prompt !== void 0 && cfg.includePrompt) event.prompt = payload.prompt;
		if (payload.system !== void 0 && cfg.includeSystem) {
			event.system = sanitizeDiagnosticPayload(payload.system);
			event.systemDigest = digest(payload.system);
		}
		if (payload.options) event.options = sanitizeDiagnosticPayload(payload.options);
		if (payload.model) event.model = sanitizeDiagnosticPayload(payload.model);
		const messages = payload.messages;
		if (Array.isArray(messages)) {
			const summary = summarizeMessages(messages);
			event.messageCount = summary.messageCount;
			event.messageRoles = summary.messageRoles;
			event.messageFingerprints = summary.messageFingerprints;
			event.messagesDigest = summary.messagesDigest;
			if (cfg.includeMessages) event.messages = sanitizeDiagnosticPayload(messages);
		}
		if (payload.note) event.note = payload.note;
		if (payload.error) event.error = payload.error;
		const line = safeJsonStringify(event);
		if (!line) return;
		writer.write(`${line}\n`);
	};
	const wrapStreamFn = (streamFn) => {
		const wrapped = (model, context, options) => {
			const traceContext = context;
			recordStage("stream:context", {
				model: {
					id: model?.id,
					provider: model?.provider,
					api: model?.api
				},
				system: traceContext.systemPrompt ?? traceContext.system,
				messages: traceContext.messages ?? [],
				options: options ?? {}
			});
			return streamFn(model, context, options);
		};
		return wrapped;
	};
	return {
		enabled: true,
		filePath: cfg.filePath,
		recordStage,
		wrapStreamFn
	};
}
//#endregion
//#region src/auto-reply/reply/streaming-directives.ts
const splitTrailingDirective = (text) => {
	const openIndex = text.lastIndexOf("[[");
	if (openIndex < 0) return {
		text,
		tail: ""
	};
	if (text.indexOf("]]", openIndex + 2) >= 0) return {
		text,
		tail: ""
	};
	return {
		text: text.slice(0, openIndex),
		tail: text.slice(openIndex)
	};
};
const parseChunk = (raw, options) => {
	const split = splitMediaFromOutput(raw);
	let text = split.text ?? "";
	const replyParsed = parseInlineDirectives(text, {
		stripAudioTag: false,
		stripReplyTags: true
	});
	if (replyParsed.hasReplyTag) text = replyParsed.text;
	const silentToken = options?.silentToken ?? "NO_REPLY";
	const isSilent = isSilentReplyText(text, silentToken) || isSilentReplyPrefixText(text, silentToken);
	if (isSilent) text = "";
	else if (startsWithSilentToken(text, silentToken)) text = stripLeadingSilentToken(text, silentToken);
	return {
		text,
		mediaUrls: split.mediaUrls,
		mediaUrl: split.mediaUrl,
		replyToId: replyParsed.replyToId,
		replyToExplicitId: replyParsed.replyToExplicitId,
		replyToCurrent: replyParsed.replyToCurrent,
		replyToTag: replyParsed.hasReplyTag,
		audioAsVoice: split.audioAsVoice,
		isSilent
	};
};
const hasRenderableContent = (parsed) => hasOutboundReplyContent(parsed) || Boolean(parsed.audioAsVoice);
function createStreamingDirectiveAccumulator() {
	let pendingTail = "";
	let pendingReply = {
		sawCurrent: false,
		hasTag: false
	};
	let activeReply = {
		sawCurrent: false,
		hasTag: false
	};
	const reset = () => {
		pendingTail = "";
		pendingReply = {
			sawCurrent: false,
			hasTag: false
		};
		activeReply = {
			sawCurrent: false,
			hasTag: false
		};
	};
	const consume = (raw, options = {}) => {
		let combined = `${pendingTail}${raw ?? ""}`;
		pendingTail = "";
		if (!options.final) {
			const split = splitTrailingDirective(combined);
			combined = split.text;
			pendingTail = split.tail;
		}
		if (!combined) return null;
		const parsed = parseChunk(combined, { silentToken: options.silentToken });
		const hasTag = activeReply.hasTag || pendingReply.hasTag || parsed.replyToTag;
		const sawCurrent = activeReply.sawCurrent || pendingReply.sawCurrent || parsed.replyToCurrent;
		const explicitId = parsed.replyToExplicitId ?? pendingReply.explicitId ?? activeReply.explicitId;
		const combinedResult = {
			...parsed,
			replyToId: explicitId,
			replyToCurrent: sawCurrent,
			replyToTag: hasTag
		};
		if (!hasRenderableContent(combinedResult)) {
			if (hasTag) pendingReply = {
				explicitId,
				sawCurrent,
				hasTag
			};
			return null;
		}
		activeReply = {
			explicitId,
			sawCurrent,
			hasTag
		};
		pendingReply = {
			sawCurrent: false,
			hasTag: false
		};
		return combinedResult;
	};
	return {
		consume,
		reset
	};
}
//#endregion
//#region src/auto-reply/tool-meta.ts
function shortenMeta(meta) {
	if (!meta) return meta;
	return shortenHomeInString(meta);
}
function formatToolAggregate(toolName, metas, options) {
	const filtered = (metas ?? []).filter(Boolean).map(shortenMeta);
	const display = resolveToolDisplay({ name: toolName });
	const prefix = `${display.emoji} ${display.label}`;
	if (!filtered.length) return prefix;
	const rawSegments = [];
	const grouped = {};
	for (const m of filtered) {
		if (!isPathLike(m)) {
			rawSegments.push(m);
			continue;
		}
		if (m.includes("→")) {
			rawSegments.push(m);
			continue;
		}
		const parts = m.split("/");
		if (parts.length > 1) {
			const dir = parts.slice(0, -1).join("/");
			const base = parts.at(-1) ?? m;
			if (!grouped[dir]) grouped[dir] = [];
			grouped[dir].push(base);
		} else {
			if (!grouped["."]) grouped["."] = [];
			grouped["."].push(m);
		}
	}
	const segments = Object.entries(grouped).map(([dir, files]) => {
		const brace = files.length > 1 ? `{${files.join(", ")}}` : files[0];
		if (dir === ".") return brace;
		return `${dir}/${brace}`;
	});
	return `${prefix}: ${formatMetaForDisplay(toolName, [...rawSegments, ...segments].join("; "), options?.markdown)}`;
}
function formatMetaForDisplay(toolName, meta, markdown) {
	const normalized = normalizeLowercaseStringOrEmpty(toolName);
	if (normalized === "exec" || normalized === "bash") {
		const { flags, body } = splitExecFlags(meta);
		if (flags.length > 0) {
			if (!body) return flags.join(" · ");
			return `${flags.join(" · ")} · ${maybeWrapMarkdown(body, markdown)}`;
		}
	}
	return maybeWrapMarkdown(meta, markdown);
}
function splitExecFlags(meta) {
	const parts = meta.split(" · ").map((part) => part.trim()).filter(Boolean);
	if (parts.length === 0) return {
		flags: [],
		body: ""
	};
	const flags = [];
	const bodyParts = [];
	for (const part of parts) {
		if (part === "elevated" || part === "pty") {
			flags.push(part);
			continue;
		}
		bodyParts.push(part);
	}
	return {
		flags,
		body: bodyParts.join(" · ")
	};
}
function isPathLike(value) {
	if (!value) return false;
	if (value.includes(" ")) return false;
	if (value.includes("://")) return false;
	if (value.includes("·")) return false;
	if (value.includes("&&") || value.includes("||")) return false;
	return /^~?(\/[^\s]+)+$/.test(value);
}
function maybeWrapMarkdown(value, markdown) {
	if (!markdown) return value;
	if (value.includes("`")) return value;
	return `\`${value}\``;
}
//#endregion
//#region src/markdown/code-spans.ts
function createInlineCodeState() {
	return {
		open: false,
		ticks: 0
	};
}
function buildCodeSpanIndex(text, inlineState) {
	const fenceSpans = parseFenceSpans(text);
	const { spans: inlineSpans, state: nextInlineState } = parseInlineCodeSpans(text, fenceSpans, inlineState ? {
		open: inlineState.open,
		ticks: inlineState.ticks
	} : createInlineCodeState());
	return {
		inlineState: nextInlineState,
		isInside: (index) => isInsideFenceSpan(index, fenceSpans) || isInsideInlineSpan(index, inlineSpans)
	};
}
function parseInlineCodeSpans(text, fenceSpans, initialState) {
	const spans = [];
	let open = initialState.open;
	let ticks = initialState.ticks;
	let openStart = open ? 0 : -1;
	let i = 0;
	while (i < text.length) {
		const fence = findFenceSpanAtInclusive(fenceSpans, i);
		if (fence) {
			i = fence.end;
			continue;
		}
		if (text[i] !== "`") {
			i += 1;
			continue;
		}
		const runStart = i;
		let runLength = 0;
		while (i < text.length && text[i] === "`") {
			runLength += 1;
			i += 1;
		}
		if (!open) {
			open = true;
			ticks = runLength;
			openStart = runStart;
			continue;
		}
		if (runLength === ticks) {
			spans.push([openStart, i]);
			open = false;
			ticks = 0;
			openStart = -1;
		}
	}
	if (open) spans.push([openStart, text.length]);
	return {
		spans,
		state: {
			open,
			ticks
		}
	};
}
function findFenceSpanAtInclusive(spans, index) {
	return spans.find((span) => index >= span.start && index < span.end);
}
function isInsideFenceSpan(index, spans) {
	return spans.some((span) => index >= span.start && index < span.end);
}
function isInsideInlineSpan(index, spans) {
	return spans.some(([start, end]) => index >= start && index < end);
}
//#endregion
//#region src/agents/pi-embedded-runner/replay-state.ts
function createEmbeddedRunReplayState(state) {
	return {
		replayInvalid: state?.replayInvalid === true,
		hadPotentialSideEffects: state?.hadPotentialSideEffects === true
	};
}
function mergeEmbeddedRunReplayState(current, next) {
	if (!next) return current;
	return {
		replayInvalid: current.replayInvalid || next.replayInvalid === true,
		hadPotentialSideEffects: current.hadPotentialSideEffects || next.hadPotentialSideEffects === true
	};
}
function observeReplayMetadata(current, metadata) {
	return mergeEmbeddedRunReplayState(current, {
		replayInvalid: !metadata.replaySafe,
		hadPotentialSideEffects: metadata.hadPotentialSideEffects
	});
}
function replayMetadataFromState(state) {
	return {
		hadPotentialSideEffects: state.hadPotentialSideEffects,
		replaySafe: !state.replayInvalid && !state.hadPotentialSideEffects
	};
}
//#endregion
//#region src/agents/pi-embedded-runner/run/incomplete-turn.ts
function isIncompleteTerminalAssistantTurn(params) {
	return !params.hasAssistantVisibleText && params.lastAssistant?.stopReason === "toolUse";
}
const PLANNING_ONLY_PROMISE_RE = /\b(?:i(?:'ll| will)|let me|i(?:'m| am)\s+going to|first[, ]+i(?:'ll| will)|next[, ]+i(?:'ll| will)|i can do that)\b/i;
const PLANNING_ONLY_COMPLETION_RE = /\b(?:done|finished|implemented|updated|fixed|changed|ran|verified|found|here(?:'s| is) what|blocked by|the blocker is)\b/i;
const PLANNING_ONLY_HEADING_RE = /^(?:plan|steps?|next steps?)\s*:/i;
const PLANNING_ONLY_BULLET_RE = /^(?:[-*•]\s+|\d+[.)]\s+)/u;
const PLANNING_ONLY_MAX_VISIBLE_TEXT = 700;
const PLANNING_ONLY_ACTION_VERB_RE = /\b(?:inspect|investigate|check|look(?:\s+into|\s+at)?|read|search|find|debug|fix|patch|update|change|edit|write|implement|run|test|verify|review|analy(?:s|z)e|summari(?:s|z)e|explain|answer|show|share|report|prepare|capture|take|refactor|restart|deploy|ship)\b/i;
const SINGLE_ACTION_EXPLICIT_CONTINUATION_RE = /\b(?:going to|first[, ]+i(?:'ll| will)|next[, ]+i(?:'ll| will)|then[, ]+i(?:'ll| will)|i can do that next|let me (?!know\b)\w+(?:\s+\w+){0,3}\s+(?:next|then|first)\b)/i;
const SINGLE_ACTION_MULTI_STEP_PROMISE_RE = /\bi(?:'ll| will)\b(?=[^.!?]{0,160}\b(?:next|then|after(?:wards)?|once)\b)/i;
const SINGLE_ACTION_RESULT_STYLE_RE = /\b(?:i(?:'ll| will)\s+(?:summarize|explain|share|show|report|describe|clarify|answer|recap)(?:\s+\w+){0,4}\s*:|(?:here(?:'s| is)|summary|result|answer|findings?|root cause)\s*:)/i;
const SINGLE_ACTION_RETRY_SAFE_TOOL_NAMES = new Set([
	"read",
	"search",
	"find",
	"grep",
	"glob",
	"ls"
]);
const DEFAULT_PLANNING_ONLY_RETRY_LIMIT = 1;
const STRICT_AGENTIC_PLANNING_ONLY_RETRY_LIMIT = 2;
const ACK_EXECUTION_NORMALIZED_SET = new Set([
	"ok",
	"okay",
	"ok do it",
	"okay do it",
	"do it",
	"go ahead",
	"please do",
	"sounds good",
	"sounds good do it",
	"ship it",
	"fix it",
	"make it so",
	"yes do it",
	"yep do it",
	"تمام",
	"حسنا",
	"حسنًا",
	"امض قدما",
	"نفذها",
	"mach es",
	"leg los",
	"los geht s",
	"weiter",
	"やって",
	"進めて",
	"そのまま進めて",
	"allez y",
	"vas y",
	"fais le",
	"continue",
	"hazlo",
	"adelante",
	"sigue",
	"faz isso",
	"vai em frente",
	"pode fazer",
	"해줘",
	"진행해",
	"계속해"
]);
const ACTIONABLE_PROMPT_DIRECTIVE_RE = /^\s*(?:please\s+)?(?:check|look(?:\s+into|\s+at)?|read|write|edit|update|fix|investigate|debug|run|search|find|implement|add|remove|refactor|explain|summari(?:s|z)e|analy(?:s|z)e|review|tell|show|make|restart|deploy|prepare)\b/i;
const ACTIONABLE_PROMPT_REQUEST_RE = /\b(?:can|could|would|will)\s+you\b|\b(?:please|pls)\b|\b(?:help|explain|summari(?:s|z)e|analy(?:s|z)e|review|investigate|debug|fix|check|look(?:\s+into|\s+at)?|read|write|edit|update|run|search|find|implement|add|remove|refactor|show|tell me|walk me through)\b/i;
const PLANNING_ONLY_RETRY_INSTRUCTION = "The previous assistant turn only described the plan. Do not restate the plan. Act now: take the first concrete tool action you can. If a real blocker prevents action, reply with the exact blocker in one sentence.";
const REASONING_ONLY_RETRY_INSTRUCTION = "The previous assistant turn recorded reasoning but did not produce a user-visible answer. Continue from that partial turn and produce the visible answer now. Do not restate the reasoning or restart from scratch.";
const EMPTY_RESPONSE_RETRY_INSTRUCTION = "The previous attempt did not produce a user-visible answer. Continue from the current state and produce the visible answer now. Do not restart from scratch.";
const ACK_EXECUTION_FAST_PATH_INSTRUCTION = "The latest user message is a short approval to proceed. Do not recap or restate the plan. Start with the first concrete tool action immediately. Keep any user-facing follow-up brief and natural.";
const STRICT_AGENTIC_BLOCKED_TEXT = "Agent stopped after repeated plan-only turns without taking a concrete action. No concrete tool action or external side effect advanced the task.";
function buildAttemptReplayMetadata(params) {
	const hadPotentialSideEffects = params.toolMetas.some((t) => isLikelyMutatingToolName(t.toolName)) || params.didSendViaMessagingTool || (params.successfulCronAdds ?? 0) > 0;
	return {
		hadPotentialSideEffects,
		replaySafe: !hadPotentialSideEffects
	};
}
function resolveIncompleteTurnPayloadText(params) {
	if (params.payloadCount !== 0 || params.aborted || params.timedOut || params.attempt.clientToolCall || params.attempt.yieldDetected || params.attempt.didSendDeterministicApprovalPrompt || params.attempt.lastToolError) return null;
	const stopReason = params.attempt.lastAssistant?.stopReason;
	const incompleteTerminalAssistant = isIncompleteTerminalAssistantTurn({
		hasAssistantVisibleText: params.payloadCount > 0,
		lastAssistant: params.attempt.lastAssistant
	});
	const reasoningOnlyAssistant = isReasoningOnlyAssistantTurn(params.attempt.currentAttemptAssistant ?? params.attempt.lastAssistant);
	const emptyResponseAssistant = isEmptyResponseAssistantTurn({
		payloadCount: params.payloadCount,
		attempt: params.attempt
	});
	if (!incompleteTerminalAssistant && !reasoningOnlyAssistant && !emptyResponseAssistant && stopReason !== "error") return null;
	return params.attempt.replayMetadata.hadPotentialSideEffects ? "⚠️ Agent couldn't generate a response. Note: some tool actions may have already been executed — please verify before retrying." : "⚠️ Agent couldn't generate a response. Please try again.";
}
function resolveReplayInvalidFlag(params) {
	return !params.attempt.replayMetadata.replaySafe || params.attempt.promptErrorSource === "compaction" || params.attempt.timedOutDuringCompaction || Boolean(params.incompleteTurnText);
}
function resolveRunLivenessState(params) {
	if (params.incompleteTurnText) return "abandoned";
	if (params.attempt.promptErrorSource === "compaction" || params.attempt.timedOutDuringCompaction) return "paused";
	if ((params.aborted || params.timedOut) && params.payloadCount === 0) return "blocked";
	if (params.attempt.lastAssistant?.stopReason === "error") return "blocked";
	return "working";
}
function isReasoningOnlyAssistantTurn(message) {
	if (!message || typeof message !== "object") return false;
	return assessLastAssistantMessage(message) === "incomplete-text";
}
function isEmptyResponseAssistantTurn(params) {
	if (params.payloadCount !== 0) return false;
	if (params.attempt.assistantTexts.join("\n\n").trim().length > 0) return false;
	const assistant = params.attempt.currentAttemptAssistant ?? params.attempt.lastAssistant;
	if (!assistant) return true;
	if (assistant.stopReason === "error") return false;
	if (isIncompleteTerminalAssistantTurn({
		hasAssistantVisibleText: false,
		lastAssistant: assistant
	}) || isReasoningOnlyAssistantTurn(assistant)) return false;
	return true;
}
function resolveReasoningOnlyRetryInstruction(params) {
	if (params.aborted || params.timedOut || params.attempt.clientToolCall || params.attempt.yieldDetected || params.attempt.didSendDeterministicApprovalPrompt || params.attempt.lastToolError || params.attempt.replayMetadata.hadPotentialSideEffects) return null;
	if (!shouldApplyPlanningOnlyRetryGuard({
		provider: params.provider,
		modelId: params.modelId
	})) return null;
	const assistant = params.attempt.currentAttemptAssistant ?? params.attempt.lastAssistant;
	if (params.attempt.assistantTexts.join("\n\n").trim().length > 0) return null;
	if (assistant?.stopReason === "error") return null;
	if (!isReasoningOnlyAssistantTurn(assistant)) return null;
	return REASONING_ONLY_RETRY_INSTRUCTION;
}
function resolveEmptyResponseRetryInstruction(params) {
	if (params.aborted || params.timedOut || params.attempt.clientToolCall || params.attempt.yieldDetected || params.attempt.didSendDeterministicApprovalPrompt || params.attempt.lastToolError || params.attempt.replayMetadata.hadPotentialSideEffects) return null;
	if (!shouldApplyPlanningOnlyRetryGuard({
		provider: params.provider,
		modelId: params.modelId
	})) return null;
	if (!isEmptyResponseAssistantTurn({
		payloadCount: params.payloadCount,
		attempt: params.attempt
	})) return null;
	return EMPTY_RESPONSE_RETRY_INSTRUCTION;
}
function shouldApplyPlanningOnlyRetryGuard(params) {
	return isStrictAgenticSupportedProviderModel({
		provider: params.provider,
		modelId: params.modelId
	});
}
function normalizeAckPrompt(text) {
	return normalizeLowercaseStringOrEmpty(text.normalize("NFKC").trim().replace(/[\p{P}\p{S}]+/gu, " ").replace(/\s+/g, " ").trim());
}
function isLikelyExecutionAckPrompt(text) {
	const trimmed = text.trim();
	if (!trimmed || trimmed.length > 80 || trimmed.includes("\n") || trimmed.includes("?")) return false;
	return ACK_EXECUTION_NORMALIZED_SET.has(normalizeAckPrompt(trimmed));
}
function isLikelyActionableUserPrompt(text) {
	const trimmed = text.trim();
	if (!trimmed) return false;
	if (isLikelyExecutionAckPrompt(trimmed) || trimmed.includes("?")) return true;
	return ACTIONABLE_PROMPT_DIRECTIVE_RE.test(trimmed) || ACTIONABLE_PROMPT_REQUEST_RE.test(trimmed);
}
function resolveAckExecutionFastPathInstruction(params) {
	if (!shouldApplyPlanningOnlyRetryGuard({
		provider: params.provider,
		modelId: params.modelId
	}) || !isLikelyExecutionAckPrompt(params.prompt)) return null;
	return ACK_EXECUTION_FAST_PATH_INSTRUCTION;
}
function extractPlanningOnlySteps(text) {
	const bulletLines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => line.replace(/^[-*•]\s+|^\d+[.)]\s+/u, "").trim()).filter(Boolean);
	if (bulletLines.length >= 2) return bulletLines.slice(0, 4);
	return text.split(/(?<=[.!?])\s+/u).map((step) => step.trim()).filter(Boolean).slice(0, 4);
}
function hasStructuredPlanningOnlyFormat(text) {
	const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
	if (lines.length === 0) return false;
	const bulletLineCount = lines.filter((line) => PLANNING_ONLY_BULLET_RE.test(line)).length;
	const hasPlanningCueLine = lines.some((line) => PLANNING_ONLY_PROMISE_RE.test(line));
	return PLANNING_ONLY_HEADING_RE.test(lines[0] ?? "") && hasPlanningCueLine || bulletLineCount >= 2 && hasPlanningCueLine;
}
function extractPlanningOnlyPlanDetails(text) {
	const trimmed = text.trim();
	if (!trimmed) return null;
	return {
		explanation: trimmed,
		steps: extractPlanningOnlySteps(trimmed)
	};
}
function countPlanOnlyToolMetas(toolMetas) {
	return toolMetas.filter((entry) => entry.toolName === "update_plan").length;
}
function countNonPlanToolCalls(toolMetas) {
	return toolMetas.filter((entry) => entry.toolName !== "update_plan").length;
}
function hasNonPlanToolActivity(toolMetas) {
	return toolMetas.some((entry) => entry.toolName !== "update_plan");
}
function hasSingleRetrySafeNonPlanTool(toolMetas) {
	const nonPlanToolNames = toolMetas.map((entry) => normalizeLowercaseStringOrEmpty(entry.toolName)).filter((toolName) => toolName && toolName !== "update_plan");
	return nonPlanToolNames.length === 1 && SINGLE_ACTION_RETRY_SAFE_TOOL_NAMES.has(nonPlanToolNames[0] ?? "");
}
/**
* Treat a turn with exactly one non-plan tool call plus visible "I'll do X
* next" prose as effectively planning-only from the user's perspective. This
* closes the one-action-then-narrative loophole without changing the 2+ tool
* call path, which still counts as real multi-step progress.
*/
function isSingleActionThenNarrativePattern(params) {
	if (countNonPlanToolCalls(params.toolMetas) !== 1) return false;
	const text = params.assistantTexts.join("\n\n").trim();
	if (!text || text.length > PLANNING_ONLY_MAX_VISIBLE_TEXT) return false;
	if (SINGLE_ACTION_RESULT_STYLE_RE.test(text)) return false;
	return SINGLE_ACTION_EXPLICIT_CONTINUATION_RE.test(text) || SINGLE_ACTION_MULTI_STEP_PROMISE_RE.test(text);
}
function resolvePlanningOnlyRetryLimit(executionContract) {
	return executionContract === "strict-agentic" ? STRICT_AGENTIC_PLANNING_ONLY_RETRY_LIMIT : DEFAULT_PLANNING_ONLY_RETRY_LIMIT;
}
function resolvePlanningOnlyRetryInstruction(params) {
	const planOnlyToolMetaCount = countPlanOnlyToolMetas(params.attempt.toolMetas);
	const singleActionNarrative = isSingleActionThenNarrativePattern({
		toolMetas: params.attempt.toolMetas,
		assistantTexts: params.attempt.assistantTexts
	});
	const allowSingleActionRetryBypass = singleActionNarrative && hasSingleRetrySafeNonPlanTool(params.attempt.toolMetas);
	if (!shouldApplyPlanningOnlyRetryGuard({
		provider: params.provider,
		modelId: params.modelId
	}) || typeof params.prompt === "string" && !isLikelyActionableUserPrompt(params.prompt) || params.aborted || params.timedOut || params.attempt.clientToolCall || params.attempt.yieldDetected || params.attempt.didSendDeterministicApprovalPrompt || params.attempt.didSendViaMessagingTool || params.attempt.lastToolError || hasNonPlanToolActivity(params.attempt.toolMetas) && !allowSingleActionRetryBypass || params.attempt.itemLifecycle.startedCount > planOnlyToolMetaCount && !allowSingleActionRetryBypass || params.attempt.replayMetadata.hadPotentialSideEffects) return null;
	const stopReason = params.attempt.lastAssistant?.stopReason;
	if (stopReason && stopReason !== "stop") return null;
	const text = params.attempt.assistantTexts.join("\n\n").trim();
	if (!text || text.length > PLANNING_ONLY_MAX_VISIBLE_TEXT || text.includes("```")) return null;
	const hasStructuredPlanningFormat = hasStructuredPlanningOnlyFormat(text);
	if (!PLANNING_ONLY_PROMISE_RE.test(text) && !hasStructuredPlanningFormat) return null;
	if (!hasStructuredPlanningFormat && !singleActionNarrative && !PLANNING_ONLY_ACTION_VERB_RE.test(text)) return null;
	if (PLANNING_ONLY_COMPLETION_RE.test(text)) return null;
	return PLANNING_ONLY_RETRY_INSTRUCTION;
}
//#endregion
//#region src/agents/pi-embedded-subscribe.promise.ts
function isPromiseLike(value) {
	return Boolean(value && (typeof value === "object" || typeof value === "function") && "then" in value && typeof value.then === "function");
}
//#endregion
//#region src/agents/pi-embedded-subscribe.raw-stream.ts
let rawStreamReady = false;
function isRawStreamEnabled() {
	return isTruthyEnvValue(process.env.OPENCLAW_RAW_STREAM);
}
function resolveRawStreamPath() {
	return process.env.OPENCLAW_RAW_STREAM_PATH?.trim() || path.join(resolveStateDir(), "logs", "raw-stream.jsonl");
}
function appendRawStream(payload) {
	if (!isRawStreamEnabled()) return;
	const rawStreamPath = resolveRawStreamPath();
	if (!rawStreamReady) {
		rawStreamReady = true;
		try {
			fs.mkdirSync(path.dirname(rawStreamPath), { recursive: true });
		} catch {}
	}
	try {
		fs.promises.appendFile(rawStreamPath, `${JSON.stringify(payload)}\n`);
	} catch {}
}
//#endregion
//#region src/agents/pi-embedded-subscribe.handlers.messages.ts
const stripTrailingDirective = (text) => {
	const openIndex = text.lastIndexOf("[[");
	if (openIndex < 0) {
		if (text.endsWith("[")) return text.slice(0, -1);
		return text;
	}
	if (text.indexOf("]]", openIndex + 2) >= 0) return text;
	return text.slice(0, openIndex);
};
const coerceText = (value) => {
	if (typeof value === "string") return value;
	if (value == null) return "";
	if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint" || typeof value === "symbol") return String(value);
	if (typeof value === "object") try {
		return JSON.stringify(value) ?? "";
	} catch {
		return "";
	}
	return "";
};
function shouldSuppressAssistantVisibleOutput(message) {
	return resolveAssistantMessagePhase(message) === "commentary";
}
function isTranscriptOnlyOpenClawAssistantMessage(message) {
	if (!message || message.role !== "assistant") return false;
	const provider = normalizeOptionalString(message.provider) ?? "";
	const model = normalizeOptionalString(message.model) ?? "";
	return provider === "openclaw" && (model === "delivery-mirror" || model === "gateway-injected");
}
function resolveAssistantStreamItemId(params) {
	const content = params.message?.content;
	if (!Array.isArray(content)) return;
	const contentIndex = typeof params.contentIndex === "number" && Number.isInteger(params.contentIndex) && params.contentIndex >= 0 ? params.contentIndex : void 0;
	const candidateBlocks = contentIndex !== void 0 ? [content[contentIndex]] : content.toReversed();
	for (const block of candidateBlocks) {
		if (!block || typeof block !== "object") continue;
		const record = block;
		if (record.type !== "text") continue;
		const signature = parseAssistantTextSignature(record.textSignature);
		if (signature?.id) return signature.id;
	}
}
function emitReasoningEnd(ctx) {
	if (!ctx.state.reasoningStreamOpen) return;
	ctx.state.reasoningStreamOpen = false;
	ctx.params.onReasoningEnd?.();
}
function openReasoningStream(ctx) {
	ctx.state.reasoningStreamOpen = true;
}
function shouldSuppressDeterministicApprovalOutput(state) {
	return state.deterministicApprovalPromptPending || state.deterministicApprovalPromptSent;
}
function appendBlockReplyChunk(ctx, chunk) {
	if (ctx.blockChunker) {
		ctx.blockChunker.append(chunk);
		return;
	}
	ctx.state.blockBuffer += chunk;
}
function replaceBlockReplyBuffer(ctx, text) {
	if (ctx.blockChunker) {
		ctx.blockChunker.reset();
		ctx.blockChunker.append(text);
		return;
	}
	ctx.state.blockBuffer = text;
}
function resolveAssistantTextChunk(params) {
	const { evtType, delta, content, accumulatedText } = params;
	if (evtType === "text_delta") return delta;
	if (delta) return delta;
	if (!content) return "";
	if (content.startsWith(accumulatedText)) return content.slice(accumulatedText.length);
	if (accumulatedText.startsWith(content)) return "";
	if (!accumulatedText.includes(content)) return content;
	return "";
}
function resolveSilentReplyFallbackText(params) {
	const text = coerceText(params.text);
	if (text.trim() !== "NO_REPLY") return text;
	const fallback = coerceText(params.messagingToolSentTexts.at(-1)).trim();
	if (!fallback) return text;
	return fallback;
}
function clearPendingToolMedia(state) {
	state.pendingToolMediaUrls = [];
	state.pendingToolAudioAsVoice = false;
}
function consumePendingToolMediaIntoReply(state, payload) {
	if (payload.isReasoning) return payload;
	if (state.pendingToolMediaUrls.length === 0 && !state.pendingToolAudioAsVoice) return payload;
	const mergedMediaUrls = Array.from(new Set([...payload.mediaUrls ?? [], ...state.pendingToolMediaUrls]));
	const mergedPayload = {
		...payload,
		mediaUrls: mergedMediaUrls.length ? mergedMediaUrls : void 0,
		audioAsVoice: payload.audioAsVoice || state.pendingToolAudioAsVoice || void 0
	};
	clearPendingToolMedia(state);
	return mergedPayload;
}
function consumePendingToolMediaReply(state) {
	if (state.pendingToolMediaUrls.length === 0 && !state.pendingToolAudioAsVoice) return null;
	const payload = {
		mediaUrls: state.pendingToolMediaUrls.length ? Array.from(new Set(state.pendingToolMediaUrls)) : void 0,
		audioAsVoice: state.pendingToolAudioAsVoice || void 0
	};
	clearPendingToolMedia(state);
	return payload;
}
function hasAssistantVisibleReply(params) {
	return resolveSendableOutboundReplyParts(params).hasContent || Boolean(params.audioAsVoice);
}
function buildAssistantStreamData(params) {
	const mediaUrls = resolveSendableOutboundReplyParts(params).mediaUrls;
	return {
		text: params.text ?? "",
		delta: params.delta ?? "",
		replace: params.replace ? true : void 0,
		mediaUrls: mediaUrls.length ? mediaUrls : void 0,
		phase: params.phase
	};
}
function handleMessageStart(ctx, evt) {
	const msg = evt.message;
	if (msg?.role !== "assistant" || isTranscriptOnlyOpenClawAssistantMessage(msg)) return;
	ctx.resetAssistantMessageState(ctx.state.assistantTexts.length);
	ctx.params.onAssistantMessageStart?.();
}
function handleMessageUpdate(ctx, evt) {
	const msg = evt.message;
	if (msg?.role !== "assistant" || isTranscriptOnlyOpenClawAssistantMessage(msg)) return;
	ctx.noteLastAssistant(msg);
	if (shouldSuppressAssistantVisibleOutput(msg)) return;
	const suppressDeterministicApprovalOutput = shouldSuppressDeterministicApprovalOutput(ctx.state);
	const assistantEvent = evt.assistantMessageEvent;
	const assistantPhase = resolveAssistantMessagePhase(msg);
	const assistantRecord = assistantEvent && typeof assistantEvent === "object" ? assistantEvent : void 0;
	const evtType = typeof assistantRecord?.type === "string" ? assistantRecord.type : "";
	if (evtType === "thinking_start" || evtType === "thinking_delta" || evtType === "thinking_end") {
		if (evtType === "thinking_start" || evtType === "thinking_delta") openReasoningStream(ctx);
		const thinkingDelta = typeof assistantRecord?.delta === "string" ? assistantRecord.delta : "";
		const thinkingContent = typeof assistantRecord?.content === "string" ? assistantRecord.content : "";
		appendRawStream({
			ts: Date.now(),
			event: "assistant_thinking_stream",
			runId: ctx.params.runId,
			sessionId: ctx.params.session.id,
			evtType,
			delta: thinkingDelta,
			content: thinkingContent
		});
		if (ctx.state.streamReasoning) {
			const partialThinking = extractAssistantThinking(msg);
			ctx.emitReasoningStream(partialThinking || thinkingContent || thinkingDelta);
		}
		if (evtType === "thinking_end") {
			if (!ctx.state.reasoningStreamOpen) openReasoningStream(ctx);
			emitReasoningEnd(ctx);
		}
		return;
	}
	if (evtType !== "text_delta" && evtType !== "text_start" && evtType !== "text_end") return;
	const delta = typeof assistantRecord?.delta === "string" ? assistantRecord.delta : "";
	const content = typeof assistantRecord?.content === "string" ? assistantRecord.content : "";
	appendRawStream({
		ts: Date.now(),
		event: "assistant_text_stream",
		runId: ctx.params.runId,
		sessionId: ctx.params.session.id,
		evtType,
		delta,
		content
	});
	const chunk = resolveAssistantTextChunk({
		evtType,
		delta,
		content,
		accumulatedText: ctx.state.deltaBuffer
	});
	const partialAssistant = assistantRecord?.partial && typeof assistantRecord.partial === "object" ? assistantRecord.partial : msg;
	const deliveryPhase = resolveAssistantMessagePhase(partialAssistant);
	const streamItemId = resolveAssistantStreamItemId({
		contentIndex: assistantRecord?.contentIndex,
		message: partialAssistant
	});
	if (deliveryPhase && streamItemId) {
		const previousStreamItemId = ctx.state.lastAssistantStreamItemId;
		if (previousStreamItemId && previousStreamItemId !== streamItemId) {
			ctx.flushBlockReplyBuffer({ assistantMessageIndex: ctx.state.assistantMessageIndex });
			ctx.resetAssistantMessageState(ctx.state.assistantTexts.length);
			ctx.params.onAssistantMessageStart?.();
		}
		ctx.state.lastAssistantStreamItemId = streamItemId;
	}
	if (deliveryPhase === "commentary") return;
	const phaseAwareVisibleText = coerceText(extractAssistantVisibleText(partialAssistant)).trim();
	const shouldUsePhaseAwareBlockReply = Boolean(deliveryPhase);
	if (chunk) {
		ctx.state.deltaBuffer += chunk;
		if (!shouldUsePhaseAwareBlockReply) appendBlockReplyChunk(ctx, chunk);
	}
	if (ctx.state.streamReasoning) ctx.emitReasoningStream(extractThinkingFromTaggedStream(ctx.state.deltaBuffer));
	const next = phaseAwareVisibleText || (deliveryPhase === "final_answer" ? "" : ctx.stripBlockTags(ctx.state.deltaBuffer, {
		thinking: false,
		final: false,
		inlineCode: createInlineCodeState()
	}).trim());
	if (next) {
		const wasThinking = ctx.state.partialBlockState.thinking;
		const visibleDelta = chunk ? ctx.stripBlockTags(chunk, ctx.state.partialBlockState) : "";
		if (!wasThinking && ctx.state.partialBlockState.thinking) openReasoningStream(ctx);
		if (wasThinking && !ctx.state.partialBlockState.thinking) emitReasoningEnd(ctx);
		const parsedDelta = visibleDelta ? ctx.consumePartialReplyDirectives(visibleDelta) : null;
		const cleanedText = parseReplyDirectives(stripTrailingDirective(next)).text;
		const { mediaUrls, hasMedia } = resolveSendableOutboundReplyParts(parsedDelta ?? {});
		const hasAudio = Boolean(parsedDelta?.audioAsVoice);
		const previousCleaned = ctx.state.lastStreamedAssistantCleaned ?? "";
		let shouldEmit = false;
		let deltaText = "";
		let replace = false;
		if (!hasAssistantVisibleReply({
			text: cleanedText,
			mediaUrls,
			audioAsVoice: hasAudio
		})) shouldEmit = false;
		else {
			replace = Boolean(previousCleaned && !cleanedText.startsWith(previousCleaned));
			deltaText = replace ? "" : cleanedText.slice(previousCleaned.length);
			shouldEmit = replace ? cleanedText !== previousCleaned || hasMedia || hasAudio : Boolean(deltaText || hasMedia || hasAudio);
		}
		if (shouldUsePhaseAwareBlockReply) {
			if (replace) {
				ctx.state.blockBuffer = "";
				ctx.blockChunker?.reset();
			}
			const blockReplyChunk = replace ? cleanedText : deltaText;
			if (blockReplyChunk) appendBlockReplyChunk(ctx, blockReplyChunk);
			if (evtType === "text_end" && !ctx.state.lastBlockReplyText && cleanedText) replaceBlockReplyBuffer(ctx, cleanedText);
		}
		ctx.state.lastStreamedAssistant = next;
		ctx.state.lastStreamedAssistantCleaned = cleanedText;
		if (ctx.params.silentExpected || suppressDeterministicApprovalOutput) shouldEmit = false;
		if (shouldEmit) {
			const data = buildAssistantStreamData({
				text: cleanedText,
				delta: deltaText,
				replace,
				mediaUrls,
				phase: assistantPhase
			});
			emitAgentEvent({
				runId: ctx.params.runId,
				stream: "assistant",
				data
			});
			ctx.params.onAgentEvent?.({
				stream: "assistant",
				data
			});
			ctx.state.emittedAssistantUpdate = true;
			if (ctx.params.onPartialReply && ctx.state.shouldEmitPartialReplies) ctx.params.onPartialReply(data);
		}
	}
	if (!ctx.params.silentExpected && !suppressDeterministicApprovalOutput && ctx.params.onBlockReply && ctx.blockChunking && ctx.state.blockReplyBreak === "text_end") ctx.blockChunker?.drain({
		force: false,
		emit: ctx.emitBlockChunk
	});
	if (!ctx.params.silentExpected && !suppressDeterministicApprovalOutput && evtType === "text_end" && ctx.state.blockReplyBreak === "text_end") {
		const assistantMessageIndex = ctx.state.assistantMessageIndex;
		Promise.resolve().then(() => ctx.flushBlockReplyBuffer({ assistantMessageIndex })).catch((err) => {
			ctx.log.debug(`text_end block reply flush failed: ${String(err)}`);
		});
	}
}
function handleMessageEnd(ctx, evt) {
	const msg = evt.message;
	if (msg?.role !== "assistant" || isTranscriptOnlyOpenClawAssistantMessage(msg)) return;
	const assistantMessage = msg;
	const assistantPhase = resolveAssistantMessagePhase(assistantMessage);
	const suppressVisibleAssistantOutput = shouldSuppressAssistantVisibleOutput(assistantMessage);
	const suppressDeterministicApprovalOutput = shouldSuppressDeterministicApprovalOutput(ctx.state);
	ctx.noteLastAssistant(assistantMessage);
	ctx.recordAssistantUsage(assistantMessage.usage);
	if (suppressVisibleAssistantOutput) return;
	promoteThinkingTagsToBlocks(assistantMessage);
	const rawText = coerceText(extractAssistantText(assistantMessage));
	const rawVisibleText = coerceText(extractAssistantVisibleText(assistantMessage));
	appendRawStream({
		ts: Date.now(),
		event: "assistant_message_end",
		runId: ctx.params.runId,
		sessionId: ctx.params.session.id,
		rawText,
		rawThinking: extractAssistantThinking(assistantMessage)
	});
	const text = resolveSilentReplyFallbackText({
		text: ctx.stripBlockTags(rawVisibleText, {
			thinking: false,
			final: false
		}),
		messagingToolSentTexts: ctx.state.messagingToolSentTexts
	});
	const rawThinking = ctx.state.includeReasoning || ctx.state.streamReasoning ? extractAssistantThinking(assistantMessage) || extractThinkingFromTaggedText(rawText) : "";
	const formattedReasoning = rawThinking ? formatReasoningMessage(rawThinking) : "";
	const trimmedText = text.trim();
	const parsedText = trimmedText ? parseReplyDirectives(stripTrailingDirective(trimmedText)) : null;
	let cleanedText = parsedText?.text ?? "";
	let { mediaUrls, hasMedia } = resolveSendableOutboundReplyParts(parsedText ?? {});
	const finalizeMessageEnd = () => {
		ctx.state.deltaBuffer = "";
		ctx.state.blockBuffer = "";
		ctx.blockChunker?.reset();
		ctx.state.blockState.thinking = false;
		ctx.state.blockState.final = false;
		ctx.state.blockState.inlineCode = createInlineCodeState();
		ctx.state.lastStreamedAssistant = void 0;
		ctx.state.lastStreamedAssistantCleaned = void 0;
		ctx.state.reasoningStreamOpen = false;
	};
	const previousStreamedText = ctx.state.lastStreamedAssistantCleaned ?? "";
	const shouldReplaceFinalStream = Boolean(previousStreamedText && cleanedText && !cleanedText.startsWith(previousStreamedText));
	const didTextChangeWithinCurrentMessage = Boolean(previousStreamedText && cleanedText !== previousStreamedText);
	const finalStreamDelta = shouldReplaceFinalStream ? "" : cleanedText.slice(previousStreamedText.length);
	if (!ctx.params.silentExpected && !suppressDeterministicApprovalOutput && (cleanedText || hasMedia) && (!ctx.state.emittedAssistantUpdate || shouldReplaceFinalStream || didTextChangeWithinCurrentMessage || hasMedia)) {
		const data = buildAssistantStreamData({
			text: cleanedText,
			delta: finalStreamDelta,
			replace: shouldReplaceFinalStream,
			mediaUrls,
			phase: assistantPhase
		});
		emitAgentEvent({
			runId: ctx.params.runId,
			stream: "assistant",
			data
		});
		ctx.params.onAgentEvent?.({
			stream: "assistant",
			data
		});
		ctx.state.emittedAssistantUpdate = true;
		ctx.state.lastStreamedAssistantCleaned = cleanedText;
	}
	const finalAssistantText = ctx.params.silentExpected && !isSilentReplyText(trimmedText, "NO_REPLY") ? "" : text;
	const addedDuringMessage = ctx.state.assistantTexts.length > ctx.state.assistantTextBaseline;
	const chunkerHasBuffered = ctx.blockChunker?.hasBuffered() ?? false;
	ctx.finalizeAssistantTexts({
		text: finalAssistantText,
		addedDuringMessage,
		chunkerHasBuffered
	});
	const onBlockReply = ctx.params.onBlockReply;
	const shouldEmitReasoning = Boolean(!ctx.params.silentExpected && !suppressDeterministicApprovalOutput && ctx.state.includeReasoning && formattedReasoning && onBlockReply && formattedReasoning !== ctx.state.lastReasoningSent);
	const shouldEmitReasoningBeforeAnswer = shouldEmitReasoning && ctx.state.blockReplyBreak === "message_end" && !addedDuringMessage;
	const maybeEmitReasoning = () => {
		if (!shouldEmitReasoning || !formattedReasoning) return;
		ctx.state.lastReasoningSent = formattedReasoning;
		ctx.emitBlockReply({
			text: formattedReasoning,
			isReasoning: true
		});
	};
	if (shouldEmitReasoningBeforeAnswer) maybeEmitReasoning();
	const emitSplitResultAsBlockReply = (splitResult) => {
		if (!splitResult || !onBlockReply) return;
		const { text: cleanedText, mediaUrls, audioAsVoice, replyToId, replyToTag, replyToCurrent } = splitResult;
		if (hasAssistantVisibleReply({
			text: cleanedText,
			mediaUrls,
			audioAsVoice
		})) ctx.emitBlockReply({
			text: cleanedText,
			mediaUrls: mediaUrls?.length ? mediaUrls : void 0,
			audioAsVoice,
			replyToId,
			replyToTag,
			replyToCurrent
		});
	};
	const hasBufferedBlockReply = ctx.blockChunker ? ctx.blockChunker.hasBuffered() : ctx.state.blockBuffer.length > 0;
	if (!ctx.params.silentExpected && !suppressDeterministicApprovalOutput && text && onBlockReply && (ctx.state.blockReplyBreak === "message_end" || hasBufferedBlockReply || text !== ctx.state.lastBlockReplyText)) {
		if (hasBufferedBlockReply && ctx.blockChunker?.hasBuffered()) {
			ctx.blockChunker.drain({
				force: true,
				emit: ctx.emitBlockChunk
			});
			ctx.blockChunker.reset();
		} else if (text !== ctx.state.lastBlockReplyText) if (ctx.state.blockReplyBreak === "text_end" && ctx.state.lastBlockReplyText != null) ctx.log.debug(`Skipping message_end safety send for text_end channel - content already delivered via text_end`);
		else if (isMessagingToolDuplicateNormalized(normalizeTextForComparison(text), ctx.state.messagingToolSentTextsNormalized)) ctx.log.debug(`Skipping message_end block reply - already sent via messaging tool: ${text.slice(0, 50)}...`);
		else {
			ctx.state.lastBlockReplyText = text;
			emitSplitResultAsBlockReply(ctx.consumeReplyDirectives(text, { final: true }));
		}
	}
	if (!shouldEmitReasoningBeforeAnswer) maybeEmitReasoning();
	if (!ctx.params.silentExpected && ctx.state.streamReasoning && rawThinking) ctx.emitReasoningStream(rawThinking);
	if (!ctx.params.silentExpected && ctx.state.blockReplyBreak === "text_end" && onBlockReply) emitSplitResultAsBlockReply(ctx.consumeReplyDirectives("", { final: true }));
	if (!ctx.params.silentExpected && ctx.state.blockReplyBreak === "message_end" && ctx.params.onBlockReplyFlush) {
		const flushBlockReplyBufferResult = ctx.flushBlockReplyBuffer();
		if (isPromiseLike(flushBlockReplyBufferResult)) return flushBlockReplyBufferResult.then(() => {
			const onBlockReplyFlushResult = ctx.params.onBlockReplyFlush?.();
			if (isPromiseLike(onBlockReplyFlushResult)) return onBlockReplyFlushResult;
		}).finally(() => {
			finalizeMessageEnd();
		});
		const onBlockReplyFlushResult = ctx.params.onBlockReplyFlush();
		if (isPromiseLike(onBlockReplyFlushResult)) return onBlockReplyFlushResult.finally(() => {
			finalizeMessageEnd();
		});
	}
	finalizeMessageEnd();
}
//#endregion
//#region src/agents/pi-embedded-subscribe.handlers.compaction.ts
function handleAutoCompactionStart(ctx) {
	ctx.state.compactionInFlight = true;
	ctx.state.livenessState = "paused";
	ctx.ensureCompactionPromise();
	ctx.log.debug(`embedded run compaction start: runId=${ctx.params.runId}`);
	emitAgentEvent({
		runId: ctx.params.runId,
		stream: "compaction",
		data: { phase: "start" }
	});
	ctx.params.onAgentEvent?.({
		stream: "compaction",
		data: { phase: "start" }
	});
	const hookRunner = getGlobalHookRunner();
	if (hookRunner?.hasHooks("before_compaction")) hookRunner.runBeforeCompaction({
		messageCount: ctx.params.session.messages?.length ?? 0,
		messages: ctx.params.session.messages,
		sessionFile: ctx.params.session.sessionFile
	}, { sessionKey: ctx.params.sessionKey }).catch((err) => {
		ctx.log.warn(`before_compaction hook failed: ${String(err)}`);
	});
}
function handleAutoCompactionEnd(ctx, evt) {
	ctx.state.compactionInFlight = false;
	const willRetry = Boolean(evt.willRetry);
	const hasResult = evt.result != null;
	const wasAborted = Boolean(evt.aborted);
	if (hasResult && !wasAborted) {
		ctx.incrementCompactionCount();
		const observedCompactionCount = ctx.getCompactionCount();
		reconcileSessionStoreCompactionCountAfterSuccess({
			sessionKey: ctx.params.sessionKey,
			agentId: ctx.params.agentId,
			configStore: ctx.params.config?.session?.store,
			observedCompactionCount
		}).catch((err) => {
			ctx.log.warn(`late compaction count reconcile failed: ${String(err)}`);
		});
	}
	if (willRetry) {
		ctx.noteCompactionRetry();
		ctx.resetForCompactionRetry();
		ctx.log.debug(`embedded run compaction retry: runId=${ctx.params.runId}`);
	} else {
		if (!wasAborted) ctx.state.livenessState = "working";
		ctx.maybeResolveCompactionWait();
		clearStaleAssistantUsageOnSessionMessages(ctx);
	}
	emitAgentEvent({
		runId: ctx.params.runId,
		stream: "compaction",
		data: {
			phase: "end",
			willRetry,
			completed: hasResult && !wasAborted
		}
	});
	ctx.params.onAgentEvent?.({
		stream: "compaction",
		data: {
			phase: "end",
			willRetry,
			completed: hasResult && !wasAborted
		}
	});
	if (!willRetry) {
		const hookRunnerEnd = getGlobalHookRunner();
		if (hookRunnerEnd?.hasHooks("after_compaction")) hookRunnerEnd.runAfterCompaction({
			messageCount: ctx.params.session.messages?.length ?? 0,
			compactedCount: ctx.getCompactionCount(),
			sessionFile: ctx.params.session.sessionFile
		}, { sessionKey: ctx.params.sessionKey }).catch((err) => {
			ctx.log.warn(`after_compaction hook failed: ${String(err)}`);
		});
	}
}
async function reconcileSessionStoreCompactionCountAfterSuccess(params) {
	const { reconcileSessionStoreCompactionCountAfterSuccess: reconcile } = await import("./pi-embedded-subscribe.handlers.compaction.runtime-701nNNdM.js");
	return reconcile(params);
}
function clearStaleAssistantUsageOnSessionMessages(ctx) {
	const messages = ctx.params.session.messages;
	if (!Array.isArray(messages)) return;
	for (const message of messages) {
		if (!message || typeof message !== "object") continue;
		const candidate = message;
		if (candidate.role !== "assistant") continue;
		candidate.usage = makeZeroUsageSnapshot();
	}
}
//#endregion
//#region src/agents/pi-embedded-subscribe.handlers.lifecycle.ts
function handleAgentStart(ctx) {
	ctx.log.debug(`embedded run agent start: runId=${ctx.params.runId}`);
	emitAgentEvent({
		runId: ctx.params.runId,
		stream: "lifecycle",
		data: {
			phase: "start",
			startedAt: Date.now()
		}
	});
	ctx.params.onAgentEvent?.({
		stream: "lifecycle",
		data: { phase: "start" }
	});
}
function handleAgentEnd(ctx) {
	const lastAssistant = ctx.state.lastAssistant;
	const isError = isAssistantMessage(lastAssistant) && lastAssistant.stopReason === "error";
	let lifecycleErrorText;
	const hasAssistantVisibleText = Array.isArray(ctx.state.assistantTexts) && ctx.state.assistantTexts.some((text) => hasAssistantVisibleReply({ text }));
	const hadDeterministicSideEffect = ctx.state.hadDeterministicSideEffect === true || (ctx.state.messagingToolSentTexts?.length ?? 0) > 0 || (ctx.state.messagingToolSentMediaUrls?.length ?? 0) > 0 || (ctx.state.successfulCronAdds ?? 0) > 0;
	const incompleteTerminalAssistant = isIncompleteTerminalAssistantTurn({
		hasAssistantVisibleText,
		lastAssistant: isAssistantMessage(lastAssistant) ? lastAssistant : null
	});
	const replayInvalid = ctx.state.replayState.replayInvalid || incompleteTerminalAssistant ? true : void 0;
	const derivedWorkingTerminalState = isError ? "blocked" : replayInvalid && !hasAssistantVisibleText && !hadDeterministicSideEffect ? "abandoned" : ctx.state.livenessState;
	const livenessState = ctx.state.livenessState === "working" ? derivedWorkingTerminalState : ctx.state.livenessState;
	if (isError && lastAssistant) {
		const friendlyError = formatAssistantErrorText(lastAssistant, {
			cfg: ctx.params.config,
			sessionKey: ctx.params.sessionKey,
			provider: lastAssistant.provider,
			model: lastAssistant.model
		});
		const rawError = lastAssistant.errorMessage?.trim();
		const failoverReason = classifyFailoverReason(rawError ?? "", { provider: lastAssistant.provider });
		const errorText = (friendlyError || lastAssistant.errorMessage || "LLM request failed.").trim();
		const observedError = buildApiErrorObservationFields(rawError, { provider: lastAssistant.provider });
		const safeErrorText = buildTextObservationFields(errorText, { provider: lastAssistant.provider }).textPreview ?? "LLM request failed.";
		lifecycleErrorText = safeErrorText;
		const safeRunId = sanitizeForConsole(ctx.params.runId) ?? "-";
		const safeModel = sanitizeForConsole(lastAssistant.model) ?? "unknown";
		const safeProvider = sanitizeForConsole(lastAssistant.provider) ?? "unknown";
		const safeRawErrorPreview = sanitizeForConsole(observedError.rawErrorPreview);
		const rawErrorConsoleSuffix = safeRawErrorPreview ? ` rawError=${safeRawErrorPreview}` : "";
		ctx.log.warn("embedded run agent end", {
			event: "embedded_run_agent_end",
			tags: [
				"error_handling",
				"lifecycle",
				"agent_end",
				"assistant_error"
			],
			runId: ctx.params.runId,
			isError: true,
			error: safeErrorText,
			failoverReason,
			model: lastAssistant.model,
			provider: lastAssistant.provider,
			...observedError,
			consoleMessage: `embedded run agent end: runId=${safeRunId} isError=true model=${safeModel} provider=${safeProvider} error=${safeErrorText}${rawErrorConsoleSuffix}`
		});
	} else ctx.log.debug(`embedded run agent end: runId=${ctx.params.runId} isError=${isError}`);
	const emitLifecycleTerminal = () => {
		if (isError) {
			emitAgentEvent({
				runId: ctx.params.runId,
				stream: "lifecycle",
				data: {
					phase: "error",
					error: lifecycleErrorText ?? "LLM request failed.",
					...livenessState ? { livenessState } : {},
					...replayInvalid ? { replayInvalid } : {},
					endedAt: Date.now()
				}
			});
			ctx.params.onAgentEvent?.({
				stream: "lifecycle",
				data: {
					phase: "error",
					error: lifecycleErrorText ?? "LLM request failed.",
					...livenessState ? { livenessState } : {},
					...replayInvalid ? { replayInvalid } : {}
				}
			});
			return;
		}
		emitAgentEvent({
			runId: ctx.params.runId,
			stream: "lifecycle",
			data: {
				phase: "end",
				...livenessState ? { livenessState } : {},
				...replayInvalid ? { replayInvalid } : {},
				endedAt: Date.now()
			}
		});
		ctx.params.onAgentEvent?.({
			stream: "lifecycle",
			data: {
				phase: "end",
				...livenessState ? { livenessState } : {},
				...replayInvalid ? { replayInvalid } : {}
			}
		});
	};
	const finalizeAgentEnd = () => {
		ctx.state.blockState.thinking = false;
		ctx.state.blockState.final = false;
		ctx.state.blockState.inlineCode = createInlineCodeState();
		if (ctx.state.pendingCompactionRetry > 0) ctx.resolveCompactionRetry();
		else ctx.maybeResolveCompactionWait();
	};
	const flushPendingMediaAndChannel = () => {
		const pendingToolMediaReply = consumePendingToolMediaReply(ctx.state);
		if (pendingToolMediaReply && hasAssistantVisibleReply(pendingToolMediaReply)) ctx.emitBlockReply(pendingToolMediaReply);
		const postMediaFlushResult = ctx.flushBlockReplyBuffer();
		if (isPromiseLike(postMediaFlushResult)) return postMediaFlushResult.then(() => {
			const onBlockReplyFlushResult = ctx.params.onBlockReplyFlush?.();
			if (isPromiseLike(onBlockReplyFlushResult)) return onBlockReplyFlushResult;
		});
		const onBlockReplyFlushResult = ctx.params.onBlockReplyFlush?.();
		if (isPromiseLike(onBlockReplyFlushResult)) return onBlockReplyFlushResult;
	};
	let lifecycleTerminalEmitted = false;
	const emitLifecycleTerminalOnce = () => {
		if (lifecycleTerminalEmitted) return;
		lifecycleTerminalEmitted = true;
		emitLifecycleTerminal();
	};
	try {
		const flushBlockReplyBufferResult = ctx.flushBlockReplyBuffer();
		finalizeAgentEnd();
		const flushPendingMediaAndChannelResult = isPromiseLike(flushBlockReplyBufferResult) ? Promise.resolve(flushBlockReplyBufferResult).then(() => flushPendingMediaAndChannel()) : flushPendingMediaAndChannel();
		if (isPromiseLike(flushPendingMediaAndChannelResult)) return Promise.resolve(flushPendingMediaAndChannelResult).finally(() => {
			emitLifecycleTerminalOnce();
		});
	} catch (error) {
		emitLifecycleTerminalOnce();
		throw error;
	}
	emitLifecycleTerminalOnce();
}
//#endregion
//#region src/agents/pi-embedded-subscribe.handlers.tools.ts
let execApprovalReplyModulePromise;
let hookRunnerGlobalModulePromise;
let mediaParseModulePromise;
let beforeToolCallModulePromise;
function loadExecApprovalReply() {
	execApprovalReplyModulePromise ??= import("./exec-approval-reply-Iw48Devl.js");
	return execApprovalReplyModulePromise;
}
function loadHookRunnerGlobal() {
	hookRunnerGlobalModulePromise ??= import("./hook-runner-global-BdOpIhxP.js");
	return hookRunnerGlobalModulePromise;
}
function loadMediaParse() {
	mediaParseModulePromise ??= import("./parse-DUsQk5Kg.js");
	return mediaParseModulePromise;
}
function loadBeforeToolCall() {
	beforeToolCallModulePromise ??= import("./pi-tools.before-tool-call-Duf2bUiz.js");
	return beforeToolCallModulePromise;
}
/** Track tool execution start data for after_tool_call hook. */
const toolStartData = /* @__PURE__ */ new Map();
function buildToolStartKey(runId, toolCallId) {
	return `${runId}:${toolCallId}`;
}
function isCronAddAction(args) {
	if (!args || typeof args !== "object") return false;
	const action = args.action;
	return normalizeOptionalLowercaseString(action) === "add";
}
function buildToolCallSummary(toolName, args, meta) {
	const mutation = buildToolMutationState(toolName, args, meta);
	return {
		meta,
		mutatingAction: mutation.mutatingAction,
		actionFingerprint: mutation.actionFingerprint
	};
}
function buildToolItemId(toolCallId) {
	return `tool:${toolCallId}`;
}
function buildToolItemTitle(toolName, meta) {
	return meta ? `${toolName} ${meta}` : toolName;
}
function isExecToolName(toolName) {
	return toolName === "exec" || toolName === "bash";
}
function isPatchToolName(toolName) {
	return toolName === "apply_patch";
}
function buildCommandItemId(toolCallId) {
	return `command:${toolCallId}`;
}
function buildPatchItemId(toolCallId) {
	return `patch:${toolCallId}`;
}
function buildCommandItemTitle(toolName, meta) {
	return meta ? `command ${meta}` : `${toolName} command`;
}
function buildPatchItemTitle(meta) {
	return meta ? `patch ${meta}` : "apply patch";
}
function emitTrackedItemEvent(ctx, itemData) {
	if (itemData.phase === "start") {
		ctx.state.itemActiveIds.add(itemData.itemId);
		ctx.state.itemStartedCount += 1;
	} else if (itemData.phase === "end") {
		ctx.state.itemActiveIds.delete(itemData.itemId);
		ctx.state.itemCompletedCount += 1;
	}
	emitAgentItemEvent({
		runId: ctx.params.runId,
		...ctx.params.sessionKey ? { sessionKey: ctx.params.sessionKey } : {},
		data: itemData
	});
	ctx.params.onAgentEvent?.({
		stream: "item",
		data: itemData
	});
}
function readToolResultDetailsRecord(result) {
	if (!result || typeof result !== "object") return;
	const details = result.details;
	return details && typeof details === "object" && !Array.isArray(details) ? details : void 0;
}
function readExecToolDetails(result) {
	const details = readToolResultDetailsRecord(result);
	if (!details || typeof details.status !== "string") return null;
	return details;
}
function readApplyPatchSummary(result) {
	const details = readToolResultDetailsRecord(result);
	const summary = details?.summary && typeof details.summary === "object" && !Array.isArray(details.summary) ? details.summary : null;
	if (!summary) return null;
	return {
		added: Array.isArray(summary.added) ? summary.added.filter((entry) => typeof entry === "string") : [],
		modified: Array.isArray(summary.modified) ? summary.modified.filter((entry) => typeof entry === "string") : [],
		deleted: Array.isArray(summary.deleted) ? summary.deleted.filter((entry) => typeof entry === "string") : []
	};
}
function buildPatchSummaryText(summary) {
	const parts = [];
	if (summary.added.length > 0) parts.push(`${summary.added.length} added`);
	if (summary.modified.length > 0) parts.push(`${summary.modified.length} modified`);
	if (summary.deleted.length > 0) parts.push(`${summary.deleted.length} deleted`);
	return parts.length > 0 ? parts.join(", ") : "no file changes recorded";
}
function extendExecMeta(toolName, args, meta) {
	const normalized = normalizeOptionalLowercaseString(toolName);
	if (normalized !== "exec" && normalized !== "bash") return meta;
	if (!args || typeof args !== "object") return meta;
	const record = args;
	const flags = [];
	if (record.pty === true) flags.push("pty");
	if (record.elevated === true) flags.push("elevated");
	if (flags.length === 0) return meta;
	const suffix = flags.join(" · ");
	return meta ? `${meta} · ${suffix}` : suffix;
}
function pushUniqueMediaUrl(urls, seen, value) {
	if (typeof value !== "string") return;
	const normalized = value.trim();
	if (!normalized || seen.has(normalized)) return;
	seen.add(normalized);
	urls.push(normalized);
}
function collectMessagingMediaUrlsFromRecord(record) {
	const urls = [];
	const seen = /* @__PURE__ */ new Set();
	pushUniqueMediaUrl(urls, seen, record.media);
	pushUniqueMediaUrl(urls, seen, record.mediaUrl);
	pushUniqueMediaUrl(urls, seen, record.path);
	pushUniqueMediaUrl(urls, seen, record.filePath);
	const mediaUrls = record.mediaUrls;
	if (Array.isArray(mediaUrls)) for (const mediaUrl of mediaUrls) pushUniqueMediaUrl(urls, seen, mediaUrl);
	return urls;
}
function collectMessagingMediaUrlsFromToolResult(result) {
	const urls = [];
	const seen = /* @__PURE__ */ new Set();
	const appendFromRecord = (value) => {
		if (!value || typeof value !== "object") return;
		const extracted = collectMessagingMediaUrlsFromRecord(value);
		for (const url of extracted) {
			if (seen.has(url)) continue;
			seen.add(url);
			urls.push(url);
		}
	};
	appendFromRecord(result);
	if (result && typeof result === "object") appendFromRecord(result.details);
	const outputText = extractToolResultText(result);
	if (outputText) try {
		appendFromRecord(JSON.parse(outputText));
	} catch {}
	return urls;
}
function queuePendingToolMedia(ctx, mediaReply) {
	const seen = new Set(ctx.state.pendingToolMediaUrls);
	for (const mediaUrl of mediaReply.mediaUrls) {
		if (seen.has(mediaUrl)) continue;
		seen.add(mediaUrl);
		ctx.state.pendingToolMediaUrls.push(mediaUrl);
	}
	if (mediaReply.audioAsVoice) ctx.state.pendingToolAudioAsVoice = true;
}
async function collectEmittedToolOutputMediaUrls(toolName, outputText, result) {
	const { splitMediaFromOutput } = await loadMediaParse();
	const mediaUrls = splitMediaFromOutput(outputText).mediaUrls ?? [];
	if (mediaUrls.length === 0) return [];
	return filterToolResultMediaUrls(toolName, mediaUrls, result);
}
const COMPACT_PROVIDER_INVENTORY_TOOLS = new Set(["image_generate", "video_generate"]);
function hasProviderInventoryDetails(result) {
	if (!result || typeof result !== "object") return false;
	const details = readToolResultDetailsRecord(result);
	return Array.isArray(details?.providers);
}
function shouldEmitCompactToolOutput(params) {
	if (!COMPACT_PROVIDER_INVENTORY_TOOLS.has(params.toolName)) return false;
	if (!hasProviderInventoryDetails(params.result)) return false;
	return Boolean(params.outputText?.trim());
}
function readExecApprovalPendingDetails(result) {
	if (!result || typeof result !== "object") return null;
	const outer = result;
	const details = outer.details && typeof outer.details === "object" && !Array.isArray(outer.details) ? outer.details : outer;
	if (details.status !== "approval-pending") return null;
	const approvalId = readStringValue(details.approvalId) ?? "";
	const approvalSlug = readStringValue(details.approvalSlug) ?? "";
	const command = typeof details.command === "string" ? details.command : "";
	const host = details.host === "node" ? "node" : details.host === "gateway" ? "gateway" : null;
	if (!approvalId || !approvalSlug || !command || !host) return null;
	return {
		approvalId,
		approvalSlug,
		expiresAtMs: typeof details.expiresAtMs === "number" ? details.expiresAtMs : void 0,
		allowedDecisions: Array.isArray(details.allowedDecisions) ? details.allowedDecisions.filter((decision) => decision === "allow-once" || decision === "allow-always" || decision === "deny") : void 0,
		host,
		command,
		cwd: readStringValue(details.cwd),
		nodeId: readStringValue(details.nodeId),
		warningText: readStringValue(details.warningText)
	};
}
function readExecApprovalUnavailableDetails(result) {
	if (!result || typeof result !== "object") return null;
	const outer = result;
	const details = outer.details && typeof outer.details === "object" && !Array.isArray(outer.details) ? outer.details : outer;
	if (details.status !== "approval-unavailable") return null;
	const reason = details.reason === "initiating-platform-disabled" || details.reason === "initiating-platform-unsupported" || details.reason === "no-approval-route" ? details.reason : null;
	if (!reason) return null;
	return {
		reason,
		warningText: readStringValue(details.warningText),
		channel: readStringValue(details.channel),
		channelLabel: readStringValue(details.channelLabel),
		accountId: readStringValue(details.accountId),
		sentApproverDms: details.sentApproverDms === true
	};
}
async function emitToolResultOutput(params) {
	const { ctx, toolName, rawToolName, meta, isToolError, result, sanitizedResult } = params;
	const hasStructuredMedia = result && typeof result === "object" && result.details && typeof result.details === "object" && !Array.isArray(result.details) && typeof (result.details?.media ?? void 0) === "object" && !Array.isArray(result.details?.media);
	const approvalPending = readExecApprovalPendingDetails(result);
	let emittedToolOutputMediaUrls = [];
	if (!isToolError && approvalPending) {
		if (!ctx.params.onToolResult) return;
		ctx.state.deterministicApprovalPromptPending = true;
		try {
			const { buildExecApprovalPendingReplyPayload } = await loadExecApprovalReply();
			await ctx.params.onToolResult(buildExecApprovalPendingReplyPayload({
				approvalId: approvalPending.approvalId,
				approvalSlug: approvalPending.approvalSlug,
				allowedDecisions: approvalPending.allowedDecisions,
				command: approvalPending.command,
				cwd: approvalPending.cwd,
				host: approvalPending.host,
				nodeId: approvalPending.nodeId,
				expiresAtMs: approvalPending.expiresAtMs,
				warningText: approvalPending.warningText
			}));
			ctx.state.deterministicApprovalPromptSent = true;
		} catch {
			ctx.state.deterministicApprovalPromptSent = false;
		} finally {
			ctx.state.deterministicApprovalPromptPending = false;
		}
		return;
	}
	const approvalUnavailable = readExecApprovalUnavailableDetails(result);
	if (!isToolError && approvalUnavailable) {
		if (!ctx.params.onToolResult) return;
		ctx.state.deterministicApprovalPromptPending = true;
		try {
			const { buildExecApprovalUnavailableReplyPayload } = await loadExecApprovalReply();
			await ctx.params.onToolResult?.(buildExecApprovalUnavailableReplyPayload({
				reason: approvalUnavailable.reason,
				warningText: approvalUnavailable.warningText,
				channel: approvalUnavailable.channel,
				channelLabel: approvalUnavailable.channelLabel,
				accountId: approvalUnavailable.accountId,
				sentApproverDms: approvalUnavailable.sentApproverDms
			}));
			ctx.state.deterministicApprovalPromptSent = true;
		} catch {
			ctx.state.deterministicApprovalPromptSent = false;
		} finally {
			ctx.state.deterministicApprovalPromptPending = false;
		}
		return;
	}
	const outputText = extractToolResultText(sanitizedResult);
	if (ctx.shouldEmitToolOutput() || shouldEmitCompactToolOutput({
		toolName,
		result,
		outputText
	})) {
		if (outputText) {
			ctx.emitToolOutput(rawToolName, meta, outputText, result);
			if (ctx.params.toolResultFormat === "plain") emittedToolOutputMediaUrls = await collectEmittedToolOutputMediaUrls(rawToolName, outputText, result);
		}
		if (!hasStructuredMedia) return;
	}
	if (isToolError) return;
	const mediaReply = extractToolResultMediaArtifact(result);
	if (!mediaReply) return;
	const mediaUrls = filterToolResultMediaUrls(rawToolName, mediaReply.mediaUrls, result, ctx.builtinToolNames);
	const pendingMediaUrls = mediaReply.audioAsVoice || emittedToolOutputMediaUrls.length === 0 ? mediaUrls : mediaUrls.filter((url) => !emittedToolOutputMediaUrls.includes(url));
	if (pendingMediaUrls.length === 0) return;
	queuePendingToolMedia(ctx, {
		mediaUrls: pendingMediaUrls,
		...mediaReply.audioAsVoice ? { audioAsVoice: true } : {}
	});
}
function handleToolExecutionStart(ctx, evt) {
	const continueAfterBlockReplyFlush = () => {
		const onBlockReplyFlushResult = ctx.params.onBlockReplyFlush?.();
		if (isPromiseLike(onBlockReplyFlushResult)) return onBlockReplyFlushResult.then(() => {
			continueToolExecutionStart();
		});
		continueToolExecutionStart();
	};
	const continueToolExecutionStart = () => {
		const rawToolName = evt.toolName;
		const toolName = normalizeToolName(rawToolName);
		const toolCallId = evt.toolCallId;
		const args = evt.args;
		const runId = ctx.params.runId;
		const startedAt = Date.now();
		toolStartData.set(buildToolStartKey(runId, toolCallId), {
			startTime: startedAt,
			args
		});
		if (toolName === "read") {
			const record = args && typeof args === "object" ? args : {};
			if (!(typeof record.path === "string" ? record.path : typeof record.file_path === "string" ? record.file_path : "").trim()) {
				const argsPreview = readStringValue(args)?.slice(0, 200);
				ctx.log.warn(`read tool called without path: toolCallId=${toolCallId} argsType=${typeof args}${argsPreview ? ` argsPreview=${argsPreview}` : ""}`);
			}
		}
		const meta = extendExecMeta(toolName, args, inferToolMetaFromArgs(toolName, args));
		ctx.state.toolMetaById.set(toolCallId, buildToolCallSummary(toolName, args, meta));
		ctx.log.debug(`embedded run tool start: runId=${ctx.params.runId} tool=${toolName} toolCallId=${toolCallId}`);
		const shouldEmitToolEvents = ctx.shouldEmitToolResult();
		emitAgentEvent({
			runId: ctx.params.runId,
			stream: "tool",
			data: {
				phase: "start",
				name: toolName,
				toolCallId,
				args
			}
		});
		emitTrackedItemEvent(ctx, {
			itemId: buildToolItemId(toolCallId),
			phase: "start",
			kind: "tool",
			title: buildToolItemTitle(toolName, meta),
			status: "running",
			name: toolName,
			meta,
			toolCallId,
			startedAt
		});
		ctx.params.onAgentEvent?.({
			stream: "tool",
			data: {
				phase: "start",
				name: toolName,
				toolCallId
			}
		});
		if (isExecToolName(toolName)) emitTrackedItemEvent(ctx, {
			itemId: buildCommandItemId(toolCallId),
			phase: "start",
			kind: "command",
			title: buildCommandItemTitle(toolName, meta),
			status: "running",
			name: toolName,
			meta,
			toolCallId,
			startedAt
		});
		else if (isPatchToolName(toolName)) emitTrackedItemEvent(ctx, {
			itemId: buildPatchItemId(toolCallId),
			phase: "start",
			kind: "patch",
			title: buildPatchItemTitle(meta),
			status: "running",
			name: toolName,
			meta,
			toolCallId,
			startedAt
		});
		if (ctx.params.onToolResult && shouldEmitToolEvents && !ctx.state.toolSummaryById.has(toolCallId)) {
			ctx.state.toolSummaryById.add(toolCallId);
			ctx.emitToolSummary(toolName, meta);
		}
		if (isMessagingTool(toolName)) {
			const argsRecord = args && typeof args === "object" ? args : {};
			if (isMessagingToolSendAction(toolName, argsRecord)) {
				const sendTarget = extractMessagingToolSend(toolName, argsRecord);
				if (sendTarget) ctx.state.pendingMessagingTargets.set(toolCallId, sendTarget);
				const text = argsRecord.content ?? argsRecord.message;
				if (text && typeof text === "string") {
					ctx.state.pendingMessagingTexts.set(toolCallId, text);
					ctx.log.debug(`Tracking pending messaging text: tool=${toolName} len=${text.length}`);
				}
				const mediaUrls = collectMessagingMediaUrlsFromRecord(argsRecord);
				if (mediaUrls.length > 0) ctx.state.pendingMessagingMediaUrls.set(toolCallId, mediaUrls);
			}
		}
	};
	const flushBlockReplyBufferResult = ctx.flushBlockReplyBuffer();
	if (isPromiseLike(flushBlockReplyBufferResult)) return flushBlockReplyBufferResult.then(() => continueAfterBlockReplyFlush());
	return continueAfterBlockReplyFlush();
}
function handleToolExecutionUpdate(ctx, evt) {
	const toolName = normalizeToolName(evt.toolName);
	const toolCallId = evt.toolCallId;
	const partial = evt.partialResult;
	const sanitized = sanitizeToolResult(partial);
	emitAgentEvent({
		runId: ctx.params.runId,
		stream: "tool",
		data: {
			phase: "update",
			name: toolName,
			toolCallId,
			partialResult: sanitized
		}
	});
	emitTrackedItemEvent(ctx, {
		itemId: buildToolItemId(toolCallId),
		phase: "update",
		kind: "tool",
		title: buildToolItemTitle(toolName, ctx.state.toolMetaById.get(toolCallId)?.meta),
		status: "running",
		name: toolName,
		meta: ctx.state.toolMetaById.get(toolCallId)?.meta,
		toolCallId
	});
	ctx.params.onAgentEvent?.({
		stream: "tool",
		data: {
			phase: "update",
			name: toolName,
			toolCallId
		}
	});
	if (isExecToolName(toolName)) {
		const output = extractToolResultText(sanitized);
		const commandData = {
			itemId: buildCommandItemId(toolCallId),
			phase: "update",
			kind: "command",
			title: buildCommandItemTitle(toolName, ctx.state.toolMetaById.get(toolCallId)?.meta),
			status: "running",
			name: toolName,
			meta: ctx.state.toolMetaById.get(toolCallId)?.meta,
			toolCallId,
			...output ? { progressText: output } : {}
		};
		emitTrackedItemEvent(ctx, commandData);
		if (output) {
			const outputData = {
				itemId: commandData.itemId,
				phase: "delta",
				title: commandData.title,
				toolCallId,
				name: toolName,
				output,
				status: "running"
			};
			emitAgentCommandOutputEvent({
				runId: ctx.params.runId,
				...ctx.params.sessionKey ? { sessionKey: ctx.params.sessionKey } : {},
				data: outputData
			});
			ctx.params.onAgentEvent?.({
				stream: "command_output",
				data: outputData
			});
		}
	}
}
async function handleToolExecutionEnd(ctx, evt) {
	const rawToolName = evt.toolName;
	const toolName = normalizeToolName(rawToolName);
	const toolCallId = evt.toolCallId;
	const runId = ctx.params.runId;
	const isError = evt.isError;
	const result = evt.result;
	const isToolError = isError || isToolResultError(result);
	const sanitizedResult = sanitizeToolResult(result);
	const toolStartKey = buildToolStartKey(runId, toolCallId);
	const startData = toolStartData.get(toolStartKey);
	toolStartData.delete(toolStartKey);
	const callSummary = ctx.state.toolMetaById.get(toolCallId);
	const completedMutatingAction = !isToolError && Boolean(callSummary?.mutatingAction);
	const meta = callSummary?.meta;
	ctx.state.toolMetas.push({
		toolName,
		meta
	});
	ctx.state.toolMetaById.delete(toolCallId);
	ctx.state.toolSummaryById.delete(toolCallId);
	if (isToolError) {
		const errorMessage = extractToolErrorMessage(sanitizedResult);
		ctx.state.lastToolError = {
			toolName,
			meta,
			error: errorMessage,
			timedOut: isToolResultTimedOut(sanitizedResult) || void 0,
			mutatingAction: callSummary?.mutatingAction,
			actionFingerprint: callSummary?.actionFingerprint
		};
	} else if (ctx.state.lastToolError) if (ctx.state.lastToolError.mutatingAction) {
		if (isSameToolMutationAction(ctx.state.lastToolError, {
			toolName,
			meta,
			actionFingerprint: callSummary?.actionFingerprint
		})) ctx.state.lastToolError = void 0;
	} else ctx.state.lastToolError = void 0;
	if (completedMutatingAction) ctx.state.replayState = mergeEmbeddedRunReplayState(ctx.state.replayState, {
		replayInvalid: true,
		hadPotentialSideEffects: true
	});
	const pendingText = ctx.state.pendingMessagingTexts.get(toolCallId);
	const pendingTarget = ctx.state.pendingMessagingTargets.get(toolCallId);
	if (pendingText) {
		ctx.state.pendingMessagingTexts.delete(toolCallId);
		if (!isToolError) {
			ctx.state.messagingToolSentTexts.push(pendingText);
			ctx.state.messagingToolSentTextsNormalized.push(normalizeTextForComparison(pendingText));
			ctx.log.debug(`Committed messaging text: tool=${toolName} len=${pendingText.length}`);
			ctx.trimMessagingToolSent();
		}
	}
	if (pendingTarget) {
		ctx.state.pendingMessagingTargets.delete(toolCallId);
		if (!isToolError) {
			ctx.state.messagingToolSentTargets.push(pendingTarget);
			ctx.trimMessagingToolSent();
		}
	}
	const pendingMediaUrls = ctx.state.pendingMessagingMediaUrls.get(toolCallId) ?? [];
	ctx.state.pendingMessagingMediaUrls.delete(toolCallId);
	const startArgs = startData?.args && typeof startData.args === "object" ? startData.args : {};
	const isMessagingSend = pendingMediaUrls.length > 0 || isMessagingTool(toolName) && isMessagingToolSendAction(toolName, startArgs);
	if (!isToolError && isMessagingSend) {
		const committedMediaUrls = [...pendingMediaUrls, ...collectMessagingMediaUrlsFromToolResult(result)];
		if (committedMediaUrls.length > 0) {
			ctx.state.messagingToolSentMediaUrls.push(...committedMediaUrls);
			ctx.trimMessagingToolSent();
		}
	}
	if (!isToolError && toolName === "cron" && isCronAddAction(startData?.args)) ctx.state.successfulCronAdds += 1;
	emitAgentEvent({
		runId: ctx.params.runId,
		stream: "tool",
		data: {
			phase: "result",
			name: toolName,
			toolCallId,
			meta,
			isError: isToolError,
			result: sanitizedResult
		}
	});
	const endedAt = Date.now();
	emitTrackedItemEvent(ctx, {
		itemId: buildToolItemId(toolCallId),
		phase: "end",
		kind: "tool",
		title: buildToolItemTitle(toolName, meta),
		status: isToolError ? "failed" : "completed",
		name: toolName,
		meta,
		toolCallId,
		startedAt: startData?.startTime,
		endedAt,
		...isToolError && extractToolErrorMessage(sanitizedResult) ? { error: extractToolErrorMessage(sanitizedResult) } : {}
	});
	ctx.params.onAgentEvent?.({
		stream: "tool",
		data: {
			phase: "result",
			name: toolName,
			toolCallId,
			meta,
			isError: isToolError
		}
	});
	if (isExecToolName(toolName)) {
		const execDetails = readExecToolDetails(result);
		const commandItemId = buildCommandItemId(toolCallId);
		if (execDetails?.status === "approval-pending" || execDetails?.status === "approval-unavailable") {
			const approvalStatus = execDetails.status === "approval-pending" ? "pending" : "unavailable";
			const approvalData = {
				phase: "requested",
				kind: "exec",
				status: approvalStatus,
				title: approvalStatus === "pending" ? "Command approval requested" : "Command approval unavailable",
				itemId: commandItemId,
				toolCallId,
				...execDetails.status === "approval-pending" ? {
					approvalId: execDetails.approvalId,
					approvalSlug: execDetails.approvalSlug
				} : {},
				command: execDetails.command,
				host: execDetails.host,
				...execDetails.status === "approval-unavailable" ? { reason: execDetails.reason } : {},
				message: execDetails.warningText
			};
			emitAgentApprovalEvent({
				runId: ctx.params.runId,
				...ctx.params.sessionKey ? { sessionKey: ctx.params.sessionKey } : {},
				data: approvalData
			});
			ctx.params.onAgentEvent?.({
				stream: "approval",
				data: approvalData
			});
			emitTrackedItemEvent(ctx, {
				itemId: commandItemId,
				phase: "end",
				kind: "command",
				title: buildCommandItemTitle(toolName, meta),
				status: "blocked",
				name: toolName,
				meta,
				toolCallId,
				startedAt: startData?.startTime,
				endedAt,
				...execDetails.status === "approval-pending" ? {
					approvalId: execDetails.approvalId,
					approvalSlug: execDetails.approvalSlug,
					summary: "Awaiting approval before command can run."
				} : { summary: "Command is blocked because no interactive approval route is available." }
			});
		} else {
			const output = execDetails && "aggregated" in execDetails ? execDetails.aggregated : extractToolResultText(sanitizedResult);
			const commandStatus = execDetails?.status === "failed" || isToolError ? "failed" : "completed";
			emitTrackedItemEvent(ctx, {
				itemId: commandItemId,
				phase: "end",
				kind: "command",
				title: buildCommandItemTitle(toolName, meta),
				status: commandStatus,
				name: toolName,
				meta,
				toolCallId,
				startedAt: startData?.startTime,
				endedAt,
				...output ? { summary: output } : {},
				...isToolError && extractToolErrorMessage(sanitizedResult) ? { error: extractToolErrorMessage(sanitizedResult) } : {}
			});
			const outputData = {
				itemId: commandItemId,
				phase: "end",
				title: buildCommandItemTitle(toolName, meta),
				toolCallId,
				name: toolName,
				...output ? { output } : {},
				status: commandStatus,
				...execDetails && "exitCode" in execDetails ? { exitCode: execDetails.exitCode } : {},
				...execDetails && "durationMs" in execDetails ? { durationMs: execDetails.durationMs } : {},
				...execDetails && "cwd" in execDetails && typeof execDetails.cwd === "string" ? { cwd: execDetails.cwd } : {}
			};
			emitAgentCommandOutputEvent({
				runId: ctx.params.runId,
				...ctx.params.sessionKey ? { sessionKey: ctx.params.sessionKey } : {},
				data: outputData
			});
			ctx.params.onAgentEvent?.({
				stream: "command_output",
				data: outputData
			});
			if (typeof output === "string") {
				const parsedApprovalResult = parseExecApprovalResultText(output);
				if (parsedApprovalResult.kind === "denied") {
					const approvalData = {
						phase: "resolved",
						kind: "exec",
						status: normalizeOptionalLowercaseString(parsedApprovalResult.metadata)?.includes("approval-request-failed") ? "failed" : "denied",
						title: "Command approval resolved",
						itemId: commandItemId,
						toolCallId,
						message: parsedApprovalResult.body || parsedApprovalResult.raw
					};
					emitAgentApprovalEvent({
						runId: ctx.params.runId,
						...ctx.params.sessionKey ? { sessionKey: ctx.params.sessionKey } : {},
						data: approvalData
					});
					ctx.params.onAgentEvent?.({
						stream: "approval",
						data: approvalData
					});
				}
			}
		}
	}
	if (isPatchToolName(toolName)) {
		const patchSummary = readApplyPatchSummary(result);
		const patchItemId = buildPatchItemId(toolCallId);
		const summaryText = patchSummary ? buildPatchSummaryText(patchSummary) : void 0;
		emitTrackedItemEvent(ctx, {
			itemId: patchItemId,
			phase: "end",
			kind: "patch",
			title: buildPatchItemTitle(meta),
			status: isToolError ? "failed" : "completed",
			name: toolName,
			meta,
			toolCallId,
			startedAt: startData?.startTime,
			endedAt,
			...summaryText ? { summary: summaryText } : {},
			...isToolError && extractToolErrorMessage(sanitizedResult) ? { error: extractToolErrorMessage(sanitizedResult) } : {}
		});
		if (patchSummary) {
			const patchData = {
				itemId: patchItemId,
				phase: "end",
				title: buildPatchItemTitle(meta),
				toolCallId,
				name: toolName,
				added: patchSummary.added,
				modified: patchSummary.modified,
				deleted: patchSummary.deleted,
				summary: summaryText ?? buildPatchSummaryText(patchSummary)
			};
			emitAgentPatchSummaryEvent({
				runId: ctx.params.runId,
				...ctx.params.sessionKey ? { sessionKey: ctx.params.sessionKey } : {},
				data: patchData
			});
			ctx.params.onAgentEvent?.({
				stream: "patch",
				data: patchData
			});
		}
	}
	ctx.log.debug(`embedded run tool end: runId=${ctx.params.runId} tool=${toolName} toolCallId=${toolCallId}`);
	await emitToolResultOutput({
		ctx,
		toolName,
		rawToolName,
		meta,
		isToolError,
		result,
		sanitizedResult
	});
	const hookRunnerAfter = ctx.hookRunner ?? (await loadHookRunnerGlobal()).getGlobalHookRunner();
	if (hookRunnerAfter?.hasHooks("after_tool_call")) {
		const { consumeAdjustedParamsForToolCall } = await loadBeforeToolCall();
		const adjustedArgs = consumeAdjustedParamsForToolCall(toolCallId, runId);
		const afterToolCallArgs = adjustedArgs && typeof adjustedArgs === "object" ? adjustedArgs : startArgs;
		const durationMs = startData?.startTime != null ? Date.now() - startData.startTime : void 0;
		const hookEvent = {
			toolName,
			params: afterToolCallArgs,
			runId,
			toolCallId,
			result: sanitizedResult,
			error: isToolError ? extractToolErrorMessage(sanitizedResult) : void 0,
			durationMs
		};
		hookRunnerAfter.runAfterToolCall(hookEvent, {
			toolName,
			agentId: ctx.params.agentId,
			sessionKey: ctx.params.sessionKey,
			sessionId: ctx.params.sessionId,
			runId,
			toolCallId
		}).catch((err) => {
			ctx.log.warn(`after_tool_call hook failed: tool=${toolName} error=${String(err)}`);
		});
	}
}
//#endregion
//#region src/agents/pi-embedded-subscribe.handlers.ts
function createEmbeddedPiSessionEventHandler(ctx) {
	let pendingEventChain = null;
	const scheduleEvent = (evt, handler, options) => {
		const run = () => {
			try {
				return handler();
			} catch (err) {
				ctx.log.debug(`${evt.type} handler failed: ${String(err)}`);
				return;
			}
		};
		if (!pendingEventChain) {
			const result = run();
			if (!isPromiseLike(result)) return;
			const task = result.catch((err) => {
				ctx.log.debug(`${evt.type} handler failed: ${String(err)}`);
			}).finally(() => {
				if (pendingEventChain === task) pendingEventChain = null;
			});
			if (!options?.detach) pendingEventChain = task;
			return;
		}
		const task = pendingEventChain.then(() => run()).catch((err) => {
			ctx.log.debug(`${evt.type} handler failed: ${String(err)}`);
		}).finally(() => {
			if (pendingEventChain === task) pendingEventChain = null;
		});
		if (!options?.detach) pendingEventChain = task;
	};
	return (evt) => {
		switch (evt.type) {
			case "message_start":
				scheduleEvent(evt, () => {
					handleMessageStart(ctx, evt);
				});
				return;
			case "message_update":
				scheduleEvent(evt, () => {
					handleMessageUpdate(ctx, evt);
				});
				return;
			case "message_end":
				scheduleEvent(evt, () => {
					return handleMessageEnd(ctx, evt);
				});
				return;
			case "tool_execution_start":
				scheduleEvent(evt, () => {
					return handleToolExecutionStart(ctx, evt);
				});
				return;
			case "tool_execution_update":
				scheduleEvent(evt, () => {
					handleToolExecutionUpdate(ctx, evt);
				});
				return;
			case "tool_execution_end":
				scheduleEvent(evt, () => {
					return handleToolExecutionEnd(ctx, evt);
				}, { detach: true });
				return;
			case "agent_start":
				scheduleEvent(evt, () => {
					handleAgentStart(ctx);
				});
				return;
			case "auto_compaction_start":
				scheduleEvent(evt, () => {
					handleAutoCompactionStart(ctx);
				});
				return;
			case "auto_compaction_end":
				scheduleEvent(evt, () => {
					handleAutoCompactionEnd(ctx, evt);
				});
				return;
			case "agent_end":
				scheduleEvent(evt, () => {
					return handleAgentEnd(ctx);
				});
				return;
			default: return;
		}
	};
}
//#endregion
//#region src/agents/pi-embedded-subscribe.ts
const THINKING_TAG_SCAN_RE = /<\s*(\/?)\s*(?:think(?:ing)?|thought|antthinking)\s*>/gi;
const FINAL_TAG_SCAN_RE = /<\s*(\/?)\s*final\s*>/gi;
const log$1 = createSubsystemLogger("agent/embedded");
function collectPendingMediaFromInternalEvents(events) {
	if (!events?.length) return [];
	const pending = [];
	const seen = /* @__PURE__ */ new Set();
	for (const event of events) {
		if (!Array.isArray(event.mediaUrls)) continue;
		for (const mediaUrl of event.mediaUrls) {
			const normalized = normalizeOptionalString(mediaUrl) ?? "";
			if (!normalized || seen.has(normalized)) continue;
			seen.add(normalized);
			pending.push(normalized);
		}
	}
	return pending;
}
function subscribeEmbeddedPiSession(params) {
	const reasoningMode = params.reasoningMode ?? "off";
	const useMarkdown = (params.toolResultFormat ?? "markdown") === "markdown";
	const initialPendingToolMediaUrls = collectPendingMediaFromInternalEvents(params.internalEvents);
	const state = {
		assistantTexts: [],
		toolMetas: [],
		toolMetaById: /* @__PURE__ */ new Map(),
		toolSummaryById: /* @__PURE__ */ new Set(),
		itemActiveIds: /* @__PURE__ */ new Set(),
		itemStartedCount: 0,
		itemCompletedCount: 0,
		lastToolError: void 0,
		blockReplyBreak: params.blockReplyBreak ?? "text_end",
		reasoningMode,
		includeReasoning: reasoningMode === "on",
		shouldEmitPartialReplies: !(reasoningMode === "on" && !params.onBlockReply),
		streamReasoning: reasoningMode === "stream" && typeof params.onReasoningStream === "function",
		deltaBuffer: "",
		blockBuffer: "",
		blockState: {
			thinking: false,
			final: false,
			inlineCode: createInlineCodeState()
		},
		partialBlockState: {
			thinking: false,
			final: false,
			inlineCode: createInlineCodeState()
		},
		lastStreamedAssistant: void 0,
		lastStreamedAssistantCleaned: void 0,
		emittedAssistantUpdate: false,
		lastStreamedReasoning: void 0,
		lastBlockReplyText: void 0,
		reasoningStreamOpen: false,
		assistantMessageIndex: 0,
		lastAssistantStreamItemId: void 0,
		lastAssistantTextMessageIndex: -1,
		lastAssistantTextNormalized: void 0,
		lastAssistantTextTrimmed: void 0,
		assistantTextBaseline: 0,
		suppressBlockChunks: false,
		lastReasoningSent: void 0,
		compactionInFlight: false,
		pendingCompactionRetry: 0,
		compactionRetryResolve: void 0,
		compactionRetryReject: void 0,
		compactionRetryPromise: null,
		unsubscribed: false,
		replayState: createEmbeddedRunReplayState(params.initialReplayState),
		livenessState: "working",
		hadDeterministicSideEffect: false,
		messagingToolSentTexts: [],
		messagingToolSentTextsNormalized: [],
		messagingToolSentTargets: [],
		messagingToolSentMediaUrls: [],
		pendingMessagingTexts: /* @__PURE__ */ new Map(),
		pendingMessagingTargets: /* @__PURE__ */ new Map(),
		successfulCronAdds: 0,
		pendingMessagingMediaUrls: /* @__PURE__ */ new Map(),
		pendingToolMediaUrls: initialPendingToolMediaUrls,
		pendingToolAudioAsVoice: false,
		deterministicApprovalPromptPending: false,
		deterministicApprovalPromptSent: false
	};
	const usageTotals = {
		input: 0,
		output: 0,
		cacheRead: 0,
		cacheWrite: 0,
		total: 0
	};
	let compactionCount = 0;
	const assistantTexts = state.assistantTexts;
	const toolMetas = state.toolMetas;
	const toolMetaById = state.toolMetaById;
	const toolSummaryById = state.toolSummaryById;
	const messagingToolSentTexts = state.messagingToolSentTexts;
	const messagingToolSentTextsNormalized = state.messagingToolSentTextsNormalized;
	const messagingToolSentTargets = state.messagingToolSentTargets;
	const messagingToolSentMediaUrls = state.messagingToolSentMediaUrls;
	const pendingMessagingTexts = state.pendingMessagingTexts;
	const pendingMessagingTargets = state.pendingMessagingTargets;
	const pendingBlockReplyTasks = /* @__PURE__ */ new Set();
	const replyDirectiveAccumulator = createStreamingDirectiveAccumulator();
	const partialReplyDirectiveAccumulator = createStreamingDirectiveAccumulator();
	const shouldAllowSilentTurnText = (text) => Boolean(text && isSilentReplyText(text, "NO_REPLY"));
	const emitBlockReplySafely = (payload, options) => {
		if (!params.onBlockReply) return;
		try {
			const taggedPayload = options?.assistantMessageIndex !== void 0 ? setReplyPayloadMetadata(payload, { assistantMessageIndex: options.assistantMessageIndex }) : payload;
			const maybeTask = params.onBlockReply(taggedPayload);
			if (!isPromiseLike(maybeTask)) return;
			const task = Promise.resolve(maybeTask).catch((err) => {
				log$1.warn(`block reply callback failed: ${String(err)}`);
			});
			pendingBlockReplyTasks.add(task);
			task.finally(() => {
				pendingBlockReplyTasks.delete(task);
			});
		} catch (err) {
			log$1.warn(`block reply callback failed: ${String(err)}`);
		}
	};
	const emitBlockReply = (payload, options) => {
		emitBlockReplySafely(consumePendingToolMediaIntoReply(state, payload), options);
	};
	const resetAssistantMessageState = (nextAssistantTextBaseline) => {
		state.deltaBuffer = "";
		state.blockBuffer = "";
		blockChunker?.reset();
		replyDirectiveAccumulator.reset();
		partialReplyDirectiveAccumulator.reset();
		state.blockState.thinking = false;
		state.blockState.final = false;
		state.blockState.inlineCode = createInlineCodeState();
		state.partialBlockState.thinking = false;
		state.partialBlockState.final = false;
		state.partialBlockState.inlineCode = createInlineCodeState();
		state.lastStreamedAssistant = void 0;
		state.lastStreamedAssistantCleaned = void 0;
		state.emittedAssistantUpdate = false;
		state.lastBlockReplyText = void 0;
		state.lastStreamedReasoning = void 0;
		state.lastReasoningSent = void 0;
		state.reasoningStreamOpen = false;
		state.suppressBlockChunks = false;
		state.assistantMessageIndex += 1;
		state.lastAssistantStreamItemId = void 0;
		state.lastAssistantTextMessageIndex = -1;
		state.lastAssistantTextNormalized = void 0;
		state.lastAssistantTextTrimmed = void 0;
		state.assistantTextBaseline = nextAssistantTextBaseline;
	};
	const rememberAssistantText = (text) => {
		state.lastAssistantTextMessageIndex = state.assistantMessageIndex;
		state.lastAssistantTextTrimmed = text.trimEnd();
		const normalized = normalizeTextForComparison(text);
		state.lastAssistantTextNormalized = normalized.length > 0 ? normalized : void 0;
	};
	const shouldSkipAssistantText = (text) => {
		if (state.lastAssistantTextMessageIndex !== state.assistantMessageIndex) return false;
		const trimmed = text.trimEnd();
		if (trimmed && trimmed === state.lastAssistantTextTrimmed) return true;
		const normalized = normalizeTextForComparison(text);
		if (normalized.length > 0 && normalized === state.lastAssistantTextNormalized) return true;
		return false;
	};
	const pushAssistantText = (text) => {
		if (!text) return;
		if (params.silentExpected && !shouldAllowSilentTurnText(text)) return;
		if (shouldSkipAssistantText(text)) return;
		assistantTexts.push(text);
		rememberAssistantText(text);
	};
	const finalizeAssistantTexts = (args) => {
		const { text, addedDuringMessage, chunkerHasBuffered } = args;
		if (state.includeReasoning && text && !params.onBlockReply) {
			if (assistantTexts.length > state.assistantTextBaseline) {
				assistantTexts.splice(state.assistantTextBaseline, assistantTexts.length - state.assistantTextBaseline, text);
				rememberAssistantText(text);
			} else pushAssistantText(text);
			state.suppressBlockChunks = true;
		} else if (!addedDuringMessage && !chunkerHasBuffered && text) pushAssistantText(text);
		state.assistantTextBaseline = assistantTexts.length;
	};
	const MAX_MESSAGING_SENT_TEXTS = 200;
	const MAX_MESSAGING_SENT_TARGETS = 200;
	const MAX_MESSAGING_SENT_MEDIA_URLS = 200;
	const trimMessagingToolSent = () => {
		if (messagingToolSentTexts.length > MAX_MESSAGING_SENT_TEXTS) {
			const overflow = messagingToolSentTexts.length - MAX_MESSAGING_SENT_TEXTS;
			messagingToolSentTexts.splice(0, overflow);
			messagingToolSentTextsNormalized.splice(0, overflow);
		}
		if (messagingToolSentTargets.length > MAX_MESSAGING_SENT_TARGETS) {
			const overflow = messagingToolSentTargets.length - MAX_MESSAGING_SENT_TARGETS;
			messagingToolSentTargets.splice(0, overflow);
		}
		if (messagingToolSentMediaUrls.length > MAX_MESSAGING_SENT_MEDIA_URLS) {
			const overflow = messagingToolSentMediaUrls.length - MAX_MESSAGING_SENT_MEDIA_URLS;
			messagingToolSentMediaUrls.splice(0, overflow);
		}
	};
	const ensureCompactionPromise = () => {
		if (!state.compactionRetryPromise) {
			state.compactionRetryPromise = new Promise((resolve, reject) => {
				state.compactionRetryResolve = resolve;
				state.compactionRetryReject = reject;
			});
			state.compactionRetryPromise.catch((err) => {
				log$1.debug(`compaction promise rejected (no waiter): ${String(err)}`);
			});
		}
	};
	const noteCompactionRetry = () => {
		state.pendingCompactionRetry += 1;
		ensureCompactionPromise();
	};
	const resolveCompactionPromiseIfIdle = () => {
		if (state.pendingCompactionRetry !== 0 || state.compactionInFlight) return;
		state.compactionRetryResolve?.();
		state.compactionRetryResolve = void 0;
		state.compactionRetryReject = void 0;
		state.compactionRetryPromise = null;
	};
	const resolveCompactionRetry = () => {
		if (state.pendingCompactionRetry <= 0) return;
		state.pendingCompactionRetry -= 1;
		resolveCompactionPromiseIfIdle();
	};
	const maybeResolveCompactionWait = () => {
		resolveCompactionPromiseIfIdle();
	};
	const recordAssistantUsage = (usageLike) => {
		const usage = normalizeUsage(usageLike ?? void 0);
		if (!hasNonzeroUsage(usage)) return;
		usageTotals.input += usage.input ?? 0;
		usageTotals.output += usage.output ?? 0;
		usageTotals.cacheRead += usage.cacheRead ?? 0;
		usageTotals.cacheWrite += usage.cacheWrite ?? 0;
		const usageTotal = usage.total ?? (usage.input ?? 0) + (usage.output ?? 0) + (usage.cacheRead ?? 0) + (usage.cacheWrite ?? 0);
		usageTotals.total += usageTotal;
	};
	const getUsageTotals = () => {
		if (!(usageTotals.input > 0 || usageTotals.output > 0 || usageTotals.cacheRead > 0 || usageTotals.cacheWrite > 0 || usageTotals.total > 0)) return;
		const derivedTotal = usageTotals.input + usageTotals.output + usageTotals.cacheRead + usageTotals.cacheWrite;
		return {
			input: usageTotals.input || void 0,
			output: usageTotals.output || void 0,
			cacheRead: usageTotals.cacheRead || void 0,
			cacheWrite: usageTotals.cacheWrite || void 0,
			total: usageTotals.total || derivedTotal || void 0
		};
	};
	const incrementCompactionCount = () => {
		compactionCount += 1;
	};
	const blockChunking = params.blockReplyChunking;
	const blockChunker = blockChunking ? new EmbeddedBlockChunker(blockChunking) : null;
	const shouldEmitToolResult = () => typeof params.shouldEmitToolResult === "function" ? params.shouldEmitToolResult() : params.verboseLevel === "on" || params.verboseLevel === "full";
	const shouldEmitToolOutput = () => typeof params.shouldEmitToolOutput === "function" ? params.shouldEmitToolOutput() : params.verboseLevel === "full";
	const formatToolOutputBlock = (text) => {
		const trimmed = text.trim();
		if (!trimmed) return "(no output)";
		if (!useMarkdown) return trimmed;
		return `\`\`\`txt\n${trimmed}\n\`\`\``;
	};
	const emitToolResultMessage = (toolName, message, result) => {
		if (!params.onToolResult) return;
		const { text: cleanedText, mediaUrls } = parseReplyDirectives(message);
		const filteredMediaUrls = filterToolResultMediaUrls(toolName, mediaUrls ?? [], result, params.builtinToolNames);
		if (!cleanedText && filteredMediaUrls.length === 0) return;
		try {
			params.onToolResult({
				text: cleanedText,
				mediaUrls: filteredMediaUrls.length ? filteredMediaUrls : void 0
			});
		} catch {}
	};
	const emitToolSummary = (toolName, meta) => {
		emitToolResultMessage(toolName, formatToolAggregate(toolName, meta ? [meta] : void 0, { markdown: useMarkdown }));
	};
	const emitToolOutput = (toolName, meta, output, result) => {
		if (!output) return;
		emitToolResultMessage(toolName, `${formatToolAggregate(toolName, meta ? [meta] : void 0, { markdown: useMarkdown })}\n${formatToolOutputBlock(output)}`, result);
	};
	const stripBlockTags = (text, state) => {
		if (!text) return text;
		const inlineStateStart = state.inlineCode ?? createInlineCodeState();
		const codeSpans = buildCodeSpanIndex(text, inlineStateStart);
		let processed = "";
		THINKING_TAG_SCAN_RE.lastIndex = 0;
		let lastIndex = 0;
		let inThinking = state.thinking;
		for (const match of text.matchAll(THINKING_TAG_SCAN_RE)) {
			const idx = match.index ?? 0;
			if (codeSpans.isInside(idx)) continue;
			if (!inThinking) processed += text.slice(lastIndex, idx);
			inThinking = !(match[1] === "/");
			lastIndex = idx + match[0].length;
		}
		if (!inThinking) processed += text.slice(lastIndex);
		state.thinking = inThinking;
		const finalCodeSpans = buildCodeSpanIndex(processed, inlineStateStart);
		if (!params.enforceFinalTag) {
			state.inlineCode = finalCodeSpans.inlineState;
			FINAL_TAG_SCAN_RE.lastIndex = 0;
			return stripTagsOutsideCodeSpans(processed, FINAL_TAG_SCAN_RE, finalCodeSpans.isInside);
		}
		let result = "";
		FINAL_TAG_SCAN_RE.lastIndex = 0;
		let lastFinalIndex = 0;
		let inFinal = state.final;
		let everInFinal = state.final;
		for (const match of processed.matchAll(FINAL_TAG_SCAN_RE)) {
			const idx = match.index ?? 0;
			if (finalCodeSpans.isInside(idx)) continue;
			const isClose = match[1] === "/";
			if (!inFinal && !isClose) {
				inFinal = true;
				everInFinal = true;
				lastFinalIndex = idx + match[0].length;
			} else if (inFinal && isClose) {
				result += processed.slice(lastFinalIndex, idx);
				inFinal = false;
				lastFinalIndex = idx + match[0].length;
			}
		}
		if (inFinal) result += processed.slice(lastFinalIndex);
		state.final = inFinal;
		if (!everInFinal) return "";
		const resultCodeSpans = buildCodeSpanIndex(result, inlineStateStart);
		state.inlineCode = resultCodeSpans.inlineState;
		return stripTagsOutsideCodeSpans(result, FINAL_TAG_SCAN_RE, resultCodeSpans.isInside);
	};
	const stripTagsOutsideCodeSpans = (text, pattern, isInside) => {
		let output = "";
		let lastIndex = 0;
		pattern.lastIndex = 0;
		for (const match of text.matchAll(pattern)) {
			const idx = match.index ?? 0;
			if (isInside(idx)) continue;
			output += text.slice(lastIndex, idx);
			lastIndex = idx + match[0].length;
		}
		output += text.slice(lastIndex);
		return output;
	};
	const emitBlockChunk = (text, options) => {
		if (state.suppressBlockChunks || params.silentExpected) return;
		const chunk = stripDowngradedToolCallText(stripBlockTags(text, state.blockState)).trimEnd();
		if (!chunk) return;
		if (chunk === state.lastBlockReplyText) return;
		if (isMessagingToolDuplicateNormalized(normalizeTextForComparison(chunk), messagingToolSentTextsNormalized)) {
			log$1.debug(`Skipping block reply - already sent via messaging tool: ${chunk.slice(0, 50)}...`);
			return;
		}
		if (shouldSkipAssistantText(chunk)) return;
		state.lastBlockReplyText = chunk;
		pushAssistantText(chunk);
		if (!params.onBlockReply) return;
		const splitResult = replyDirectiveAccumulator.consume(chunk);
		if (!splitResult) return;
		const { text: cleanedText, mediaUrls, audioAsVoice, replyToId, replyToTag, replyToCurrent } = splitResult;
		if (!cleanedText && (!mediaUrls || mediaUrls.length === 0) && !audioAsVoice) return;
		emitBlockReply({
			text: cleanedText,
			mediaUrls: mediaUrls?.length ? mediaUrls : void 0,
			audioAsVoice,
			replyToId,
			replyToTag,
			replyToCurrent
		}, { assistantMessageIndex: options?.assistantMessageIndex ?? state.assistantMessageIndex });
	};
	const consumeReplyDirectives = (text, options) => replyDirectiveAccumulator.consume(text, options);
	const consumePartialReplyDirectives = (text, options) => partialReplyDirectiveAccumulator.consume(text, options);
	const flushBlockReplyBuffer = (options) => {
		if (!params.onBlockReply) return;
		if (blockChunker?.hasBuffered()) {
			blockChunker.drain({
				force: true,
				emit: (text) => emitBlockChunk(text, options)
			});
			blockChunker.reset();
		} else if (state.blockBuffer.length > 0) {
			emitBlockChunk(state.blockBuffer, options);
			state.blockBuffer = "";
		}
		if (pendingBlockReplyTasks.size === 0) return;
		return (async () => {
			while (pendingBlockReplyTasks.size > 0) await Promise.allSettled(pendingBlockReplyTasks);
		})();
	};
	const emitReasoningStream = (text) => {
		if (params.silentExpected) return;
		if (!state.streamReasoning || !params.onReasoningStream) return;
		const formatted = formatReasoningMessage(text);
		if (!formatted) return;
		if (formatted === state.lastStreamedReasoning) return;
		const prior = state.lastStreamedReasoning ?? "";
		const delta = formatted.startsWith(prior) ? formatted.slice(prior.length) : formatted;
		state.lastStreamedReasoning = formatted;
		emitAgentEvent({
			runId: params.runId,
			stream: "thinking",
			data: {
				text: formatted,
				delta
			}
		});
		params.onReasoningStream({ text: formatted });
	};
	const resetForCompactionRetry = () => {
		state.hadDeterministicSideEffect = state.hadDeterministicSideEffect === true || messagingToolSentTexts.length > 0 || messagingToolSentMediaUrls.length > 0 || state.successfulCronAdds > 0;
		assistantTexts.length = 0;
		toolMetas.length = 0;
		toolMetaById.clear();
		toolSummaryById.clear();
		state.itemActiveIds.clear();
		state.itemStartedCount = 0;
		state.itemCompletedCount = 0;
		state.lastToolError = void 0;
		messagingToolSentTexts.length = 0;
		messagingToolSentTextsNormalized.length = 0;
		messagingToolSentTargets.length = 0;
		messagingToolSentMediaUrls.length = 0;
		pendingMessagingTexts.clear();
		pendingMessagingTargets.clear();
		state.successfulCronAdds = 0;
		state.pendingMessagingMediaUrls.clear();
		state.pendingToolMediaUrls = [];
		state.pendingToolAudioAsVoice = false;
		state.deterministicApprovalPromptPending = false;
		state.deterministicApprovalPromptSent = false;
		state.replayState = mergeEmbeddedRunReplayState(state.replayState, params.initialReplayState);
		state.livenessState = "working";
		resetAssistantMessageState(0);
	};
	const noteLastAssistant = (msg) => {
		if (msg?.role === "assistant") state.lastAssistant = msg;
	};
	const ctx = {
		params,
		state,
		log: log$1,
		blockChunking,
		blockChunker,
		hookRunner: params.hookRunner,
		builtinToolNames: params.builtinToolNames,
		noteLastAssistant,
		shouldEmitToolResult,
		shouldEmitToolOutput,
		emitToolSummary,
		emitToolOutput,
		stripBlockTags,
		emitBlockChunk,
		flushBlockReplyBuffer,
		emitBlockReply,
		emitReasoningStream,
		consumeReplyDirectives,
		consumePartialReplyDirectives,
		resetAssistantMessageState,
		resetForCompactionRetry,
		finalizeAssistantTexts,
		trimMessagingToolSent,
		ensureCompactionPromise,
		noteCompactionRetry,
		resolveCompactionRetry,
		maybeResolveCompactionWait,
		recordAssistantUsage,
		incrementCompactionCount,
		getUsageTotals,
		getCompactionCount: () => compactionCount
	};
	const sessionUnsubscribe = params.session.subscribe(createEmbeddedPiSessionEventHandler(ctx));
	const unsubscribe = () => {
		if (state.unsubscribed) return;
		state.unsubscribed = true;
		if (state.compactionRetryPromise) {
			log$1.debug(`unsubscribe: rejecting compaction wait runId=${params.runId}`);
			const reject = state.compactionRetryReject;
			state.compactionRetryResolve = void 0;
			state.compactionRetryReject = void 0;
			state.compactionRetryPromise = null;
			const abortErr = /* @__PURE__ */ new Error("Unsubscribed during compaction");
			abortErr.name = "AbortError";
			reject?.(abortErr);
		}
		if (params.session.isCompacting) {
			log$1.debug(`unsubscribe: aborting in-flight compaction runId=${params.runId}`);
			try {
				params.session.abortCompaction();
			} catch (err) {
				log$1.warn(`unsubscribe: compaction abort failed runId=${params.runId} err=${String(err)}`);
			}
		}
		sessionUnsubscribe();
	};
	return {
		assistantTexts,
		toolMetas,
		unsubscribe,
		setTerminalLifecycleMeta: (meta) => {
			if (typeof meta.replayInvalid === "boolean") state.replayState = {
				...state.replayState,
				replayInvalid: meta.replayInvalid
			};
			if (meta.livenessState) state.livenessState = meta.livenessState;
		},
		isCompacting: () => state.compactionInFlight || state.pendingCompactionRetry > 0,
		isCompactionInFlight: () => state.compactionInFlight,
		getMessagingToolSentTexts: () => messagingToolSentTexts.slice(),
		getMessagingToolSentMediaUrls: () => messagingToolSentMediaUrls.slice(),
		getMessagingToolSentTargets: () => messagingToolSentTargets.slice(),
		getSuccessfulCronAdds: () => state.successfulCronAdds,
		getReplayState: () => ({ ...state.replayState }),
		didSendViaMessagingTool: () => messagingToolSentTexts.length > 0,
		didSendDeterministicApprovalPrompt: () => state.deterministicApprovalPromptSent,
		getLastToolError: () => state.lastToolError ? { ...state.lastToolError } : void 0,
		getUsageTotals,
		getCompactionCount: () => compactionCount,
		getItemLifecycle: () => ({
			startedCount: state.itemStartedCount,
			completedCount: state.itemCompletedCount,
			activeCount: state.itemActiveIds.size
		}),
		waitForCompactionRetry: () => {
			if (state.unsubscribed) {
				const err = /* @__PURE__ */ new Error("Unsubscribed during compaction wait");
				err.name = "AbortError";
				return Promise.reject(err);
			}
			if (state.compactionInFlight || state.pendingCompactionRetry > 0) {
				ensureCompactionPromise();
				return state.compactionRetryPromise ?? Promise.resolve();
			}
			return new Promise((resolve, reject) => {
				queueMicrotask(() => {
					if (state.unsubscribed) {
						const err = /* @__PURE__ */ new Error("Unsubscribed during compaction wait");
						err.name = "AbortError";
						reject(err);
						return;
					}
					if (state.compactionInFlight || state.pendingCompactionRetry > 0) {
						ensureCompactionPromise();
						(state.compactionRetryPromise ?? Promise.resolve()).then(resolve, reject);
					} else resolve();
				});
			});
		}
	};
}
//#endregion
//#region src/agents/pi-embedded-runner/abort.ts
/**
* Runner abort check. Catches any abort-related message for embedded runners.
* More permissive than the core isAbortError since runners need to catch
* various abort signals from different sources.
*/
function isRunnerAbortError(err) {
	if (!err || typeof err !== "object") return false;
	if (("name" in err ? String(err.name) : "") === "AbortError") return true;
	return ("message" in err && typeof err.message === "string" ? normalizeLowercaseStringOrEmpty(err.message) : "").includes("aborted");
}
//#endregion
//#region src/agents/pi-embedded-runner/context-engine-maintenance.ts
const TURN_MAINTENANCE_TASK_KIND = "context_engine_turn_maintenance";
const TURN_MAINTENANCE_TASK_LABEL = "Context engine turn maintenance";
const TURN_MAINTENANCE_TASK_TASK = "Deferred context-engine maintenance after turn.";
const TURN_MAINTENANCE_LANE_PREFIX = "context-engine-turn-maintenance:";
const TURN_MAINTENANCE_WAIT_POLL_MS = 100;
const TURN_MAINTENANCE_LONG_WAIT_MS = 1e4;
const DEFERRED_TURN_MAINTENANCE_ABORT_STATE_KEY = Symbol.for("openclaw.contextEngineTurnMaintenanceAbortState");
const activeDeferredTurnMaintenanceRuns = /* @__PURE__ */ new Map();
function resolveDeferredTurnMaintenanceAbortState(processLike) {
	const existing = processLike[DEFERRED_TURN_MAINTENANCE_ABORT_STATE_KEY];
	if (existing) return existing;
	const created = {
		registered: false,
		controllers: /* @__PURE__ */ new Set(),
		cleanupHandlers: /* @__PURE__ */ new Map()
	};
	processLike[DEFERRED_TURN_MAINTENANCE_ABORT_STATE_KEY] = created;
	return created;
}
function unregisterDeferredTurnMaintenanceAbortSignalHandlers(processLike, state) {
	if (!state.registered) return;
	for (const [signal, handler] of state.cleanupHandlers) processLike.off(signal, handler);
	state.cleanupHandlers.clear();
	state.registered = false;
}
function normalizeSessionKey(sessionKey) {
	return normalizeOptionalString(sessionKey) || void 0;
}
function resolveDeferredTurnMaintenanceLane(sessionKey) {
	return `${TURN_MAINTENANCE_LANE_PREFIX}${sessionKey}`;
}
function createDeferredTurnMaintenanceAbortSignal(params) {
	if (typeof AbortController === "undefined") return {
		abortSignal: void 0,
		dispose: () => {}
	};
	const processLike = params?.processLike ?? process;
	const state = resolveDeferredTurnMaintenanceAbortState(processLike);
	const handleTerminationSignal = (signalName) => {
		const shouldReraise = typeof processLike.listenerCount === "function" ? processLike.listenerCount(signalName) === 1 : false;
		for (const activeController of state.controllers) if (!activeController.signal.aborted) activeController.abort(/* @__PURE__ */ new Error(`received ${signalName} while waiting for deferred maintenance`));
		state.controllers.clear();
		unregisterDeferredTurnMaintenanceAbortSignalHandlers(processLike, state);
		if (shouldReraise && typeof processLike.kill === "function") try {
			processLike.kill(processLike.pid ?? process.pid, signalName);
		} catch {}
	};
	if (!state.registered) {
		state.registered = true;
		const onSigint = () => handleTerminationSignal("SIGINT");
		const onSigterm = () => handleTerminationSignal("SIGTERM");
		state.cleanupHandlers.set("SIGINT", onSigint);
		state.cleanupHandlers.set("SIGTERM", onSigterm);
		processLike.on("SIGINT", onSigint);
		processLike.on("SIGTERM", onSigterm);
	}
	const controller = new AbortController();
	state.controllers.add(controller);
	let disposed = false;
	const cleanup = () => {
		if (disposed) return;
		disposed = true;
		state.controllers.delete(controller);
		if (state.controllers.size === 0) unregisterDeferredTurnMaintenanceAbortSignalHandlers(processLike, state);
	};
	return {
		abortSignal: controller.signal,
		dispose: cleanup
	};
}
function markDeferredTurnMaintenanceTaskScheduleFailure(params) {
	const errorMessage = formatErrorMessage(params.error);
	log$3.warn(`failed to schedule deferred context engine maintenance: ${errorMessage}`);
	cancelTaskByIdForOwner({
		taskId: params.taskId,
		callerOwnerKey: params.sessionKey,
		endedAt: Date.now(),
		terminalSummary: `Deferred maintenance could not be scheduled: ${errorMessage}`
	});
}
function buildTurnMaintenanceTaskDescriptor(params) {
	const runId = `turn-maint:${params.sessionKey}:${Date.now().toString(36)}:${randomUUID().slice(0, 8)}`;
	return createQueuedTaskRun({
		runtime: "acp",
		taskKind: TURN_MAINTENANCE_TASK_KIND,
		sourceId: TURN_MAINTENANCE_TASK_KIND,
		requesterSessionKey: params.sessionKey,
		ownerKey: params.sessionKey,
		scopeKind: "session",
		runId,
		label: TURN_MAINTENANCE_TASK_LABEL,
		task: TURN_MAINTENANCE_TASK_TASK,
		notifyPolicy: "silent",
		deliveryStatus: "pending",
		preferMetadata: true
	});
}
function promoteTurnMaintenanceTaskVisibility(params) {
	const task = findTaskByRunIdForOwner({
		runId: params.runId,
		callerOwnerKey: params.sessionKey
	});
	if (!task) return createQueuedTaskRun({
		runtime: "acp",
		taskKind: TURN_MAINTENANCE_TASK_KIND,
		sourceId: TURN_MAINTENANCE_TASK_KIND,
		requesterSessionKey: params.sessionKey,
		ownerKey: params.sessionKey,
		scopeKind: "session",
		runId: params.runId,
		label: TURN_MAINTENANCE_TASK_LABEL,
		task: TURN_MAINTENANCE_TASK_TASK,
		notifyPolicy: params.notifyPolicy,
		deliveryStatus: "pending",
		preferMetadata: true
	});
	setDetachedTaskDeliveryStatusByRunId({
		runId: params.runId,
		runtime: "acp",
		sessionKey: params.sessionKey,
		deliveryStatus: "pending"
	});
	if (task.notifyPolicy !== params.notifyPolicy) updateTaskNotifyPolicyForOwner({
		taskId: task.taskId,
		callerOwnerKey: params.sessionKey,
		notifyPolicy: params.notifyPolicy
	});
	return findTaskByRunIdForOwner({
		runId: params.runId,
		callerOwnerKey: params.sessionKey
	}) ?? task;
}
/**
* Attach runtime-owned transcript rewrite helpers to an existing
* context-engine runtime context payload.
*/
function buildContextEngineMaintenanceRuntimeContext(params) {
	return {
		...params.runtimeContext,
		...params.allowDeferredCompactionExecution ? { allowDeferredCompactionExecution: true } : {},
		rewriteTranscriptEntries: async (request) => {
			if (params.sessionManager) return rewriteTranscriptEntriesInSessionManager({
				sessionManager: params.sessionManager,
				replacements: request.replacements
			});
			const rewriteTranscriptEntriesInFile = async () => await rewriteTranscriptEntriesInSessionFile({
				sessionFile: params.sessionFile,
				sessionId: params.sessionId,
				sessionKey: params.sessionKey,
				request
			});
			const rewriteSessionKey = normalizeSessionKey(params.sessionKey ?? params.sessionId);
			if (params.deferTranscriptRewriteToSessionLane && rewriteSessionKey) return await enqueueCommandInLane(resolveSessionLane(rewriteSessionKey), async () => await rewriteTranscriptEntriesInFile());
			return await rewriteTranscriptEntriesInFile();
		}
	};
}
async function executeContextEngineMaintenance(params) {
	if (typeof params.contextEngine.maintain !== "function") return;
	const result = await params.contextEngine.maintain({
		sessionId: params.sessionId,
		sessionKey: params.sessionKey,
		sessionFile: params.sessionFile,
		runtimeContext: buildContextEngineMaintenanceRuntimeContext({
			sessionId: params.sessionId,
			sessionKey: params.sessionKey,
			sessionFile: params.sessionFile,
			sessionManager: params.executionMode === "background" ? void 0 : params.sessionManager,
			runtimeContext: params.runtimeContext,
			allowDeferredCompactionExecution: params.executionMode === "background",
			deferTranscriptRewriteToSessionLane: params.executionMode === "background"
		})
	});
	if (result.changed) log$3.info(`[context-engine] maintenance(${params.reason}) changed transcript rewrittenEntries=${result.rewrittenEntries} bytesFreed=${result.bytesFreed} sessionKey=${params.sessionKey ?? params.sessionId ?? "unknown"}`);
	return result;
}
async function runDeferredTurnMaintenanceWorker(params) {
	let surfacedUserNotice = false;
	let longRunningTimer = null;
	const shutdownAbort = createDeferredTurnMaintenanceAbortSignal();
	const surfaceMaintenanceUpdate = (summary, eventSummary) => {
		promoteTurnMaintenanceTaskVisibility({
			sessionKey: params.sessionKey,
			runId: params.runId,
			notifyPolicy: "state_changes"
		});
		surfacedUserNotice = true;
		recordTaskRunProgressByRunId({
			runId: params.runId,
			runtime: "acp",
			sessionKey: params.sessionKey,
			lastEventAt: Date.now(),
			progressSummary: summary,
			eventSummary
		});
	};
	try {
		const sessionLane = resolveSessionLane(params.sessionKey);
		const startedWaitingAt = Date.now();
		let lastWaitNoticeAt = 0;
		for (;;) {
			while (getQueueSize(sessionLane) > 0) {
				const now = Date.now();
				if (now - startedWaitingAt >= TURN_MAINTENANCE_LONG_WAIT_MS && now - lastWaitNoticeAt >= TURN_MAINTENANCE_LONG_WAIT_MS) {
					lastWaitNoticeAt = now;
					surfaceMaintenanceUpdate("Waiting for the session lane to go idle.", surfacedUserNotice ? "Still waiting for the session lane to go idle." : "Deferred maintenance is waiting for the session lane to go idle.");
				}
				await sleepWithAbort(TURN_MAINTENANCE_WAIT_POLL_MS, shutdownAbort.abortSignal);
			}
			await Promise.resolve();
			if (getQueueSize(sessionLane) === 0) break;
		}
		const runningAt = Date.now();
		startTaskRunByRunId({
			runId: params.runId,
			runtime: "acp",
			sessionKey: params.sessionKey,
			startedAt: runningAt,
			lastEventAt: runningAt,
			progressSummary: "Running deferred maintenance.",
			eventSummary: "Starting deferred maintenance."
		});
		longRunningTimer = setTimeout(() => {
			try {
				surfaceMaintenanceUpdate("Deferred maintenance is still running.", "Deferred maintenance is still running.");
			} catch (error) {
				log$3.warn(`failed to surface deferred maintenance progress: ${String(error)}`);
			}
		}, TURN_MAINTENANCE_LONG_WAIT_MS);
		const result = await executeContextEngineMaintenance({
			contextEngine: params.contextEngine,
			sessionId: params.sessionId,
			sessionKey: params.sessionKey,
			sessionFile: params.sessionFile,
			reason: "turn",
			sessionManager: params.sessionManager,
			runtimeContext: params.runtimeContext,
			executionMode: "background"
		});
		if (longRunningTimer) {
			clearTimeout(longRunningTimer);
			longRunningTimer = null;
		}
		const endedAt = Date.now();
		completeTaskRunByRunId({
			runId: params.runId,
			runtime: "acp",
			sessionKey: params.sessionKey,
			endedAt,
			lastEventAt: endedAt,
			progressSummary: result?.changed ? "Deferred maintenance completed with transcript changes." : "Deferred maintenance completed.",
			terminalSummary: result?.changed ? `Rewrote ${result.rewrittenEntries} transcript entr${result.rewrittenEntries === 1 ? "y" : "ies"} and freed ${result.bytesFreed} bytes.` : "No transcript changes were needed."
		});
	} catch (err) {
		if (shutdownAbort.abortSignal?.aborted) {
			if (longRunningTimer) {
				clearTimeout(longRunningTimer);
				longRunningTimer = null;
			}
			const task = findTaskByRunIdForOwner({
				runId: params.runId,
				callerOwnerKey: params.sessionKey
			});
			if (task) cancelTaskByIdForOwner({
				taskId: task.taskId,
				callerOwnerKey: params.sessionKey,
				endedAt: Date.now(),
				terminalSummary: "Deferred maintenance cancelled during shutdown."
			});
			return;
		}
		if (longRunningTimer) {
			clearTimeout(longRunningTimer);
			longRunningTimer = null;
		}
		const endedAt = Date.now();
		const reason = formatErrorMessage(err);
		if (!surfacedUserNotice) promoteTurnMaintenanceTaskVisibility({
			sessionKey: params.sessionKey,
			runId: params.runId,
			notifyPolicy: "done_only"
		});
		failTaskRunByRunId({
			runId: params.runId,
			runtime: "acp",
			sessionKey: params.sessionKey,
			endedAt,
			lastEventAt: endedAt,
			error: reason,
			progressSummary: "Deferred maintenance failed.",
			terminalSummary: reason
		});
		log$3.warn(`deferred context engine maintenance failed: ${reason}`);
	} finally {
		shutdownAbort.dispose();
	}
}
function scheduleDeferredTurnMaintenance(params) {
	const sessionKey = normalizeSessionKey(params.sessionKey);
	if (!sessionKey) return;
	const activeRun = activeDeferredTurnMaintenanceRuns.get(sessionKey);
	if (activeRun) {
		activeRun.rerunRequested = true;
		activeRun.latestParams = {
			...params,
			sessionKey
		};
		return;
	}
	const existingTask = findActiveSessionTask({
		sessionKey,
		runtime: "acp",
		taskKind: TURN_MAINTENANCE_TASK_KIND
	});
	const reusableTask = existingTask?.runId?.trim() ? existingTask : void 0;
	if (existingTask && !reusableTask) {
		updateTaskNotifyPolicyForOwner({
			taskId: existingTask.taskId,
			callerOwnerKey: sessionKey,
			notifyPolicy: "silent"
		});
		cancelTaskByIdForOwner({
			taskId: existingTask.taskId,
			callerOwnerKey: sessionKey,
			endedAt: Date.now(),
			terminalSummary: "Superseded by refreshed deferred maintenance task."
		});
	}
	const task = reusableTask ?? buildTurnMaintenanceTaskDescriptor({ sessionKey });
	log$3.info(`[context-engine] deferred turn maintenance ${reusableTask ? "resuming" : "queued"} taskId=${task.taskId} sessionKey=${sessionKey} lane=${resolveDeferredTurnMaintenanceLane(sessionKey)}`);
	const schedulerAbort = createDeferredTurnMaintenanceAbortSignal();
	let runPromise;
	try {
		runPromise = enqueueCommandInLane(resolveDeferredTurnMaintenanceLane(sessionKey), async () => runDeferredTurnMaintenanceWorker({
			contextEngine: params.contextEngine,
			sessionId: params.sessionId,
			sessionKey,
			sessionFile: params.sessionFile,
			sessionManager: params.sessionManager,
			runtimeContext: params.runtimeContext,
			runId: task.runId
		}));
	} catch (err) {
		schedulerAbort.dispose();
		markDeferredTurnMaintenanceTaskScheduleFailure({
			sessionKey,
			taskId: task.taskId,
			error: err
		});
		return;
	}
	let state;
	state = {
		promise: runPromise.catch((err) => {
			markDeferredTurnMaintenanceTaskScheduleFailure({
				sessionKey,
				taskId: task.taskId,
				error: err
			});
		}).finally(() => {
			schedulerAbort.dispose();
			const current = activeDeferredTurnMaintenanceRuns.get(sessionKey);
			if (current !== state) return;
			const shutdownTriggered = schedulerAbort.abortSignal?.aborted === true;
			const rerunParams = current.rerunRequested && !shutdownTriggered ? current.latestParams : void 0;
			activeDeferredTurnMaintenanceRuns.delete(sessionKey);
			if (rerunParams) scheduleDeferredTurnMaintenance(rerunParams);
		}),
		rerunRequested: false,
		latestParams: {
			...params,
			sessionKey
		}
	};
	activeDeferredTurnMaintenanceRuns.set(sessionKey, state);
}
/**
* Run optional context-engine transcript maintenance and normalize the result.
*/
async function runContextEngineMaintenance(params) {
	if (typeof params.contextEngine?.maintain !== "function") return;
	const executionMode = params.executionMode ?? "foreground";
	if (params.reason === "turn" && executionMode !== "background" && params.contextEngine.info.turnMaintenanceMode === "background") {
		try {
			scheduleDeferredTurnMaintenance({
				contextEngine: params.contextEngine,
				sessionId: params.sessionId,
				sessionKey: params.sessionKey ?? params.sessionId,
				sessionFile: params.sessionFile,
				sessionManager: params.sessionManager,
				runtimeContext: params.runtimeContext
			});
		} catch (err) {
			log$3.warn(`failed to schedule deferred context engine maintenance: ${String(err)}`);
		}
		return;
	}
	try {
		return await executeContextEngineMaintenance({
			contextEngine: params.contextEngine,
			sessionId: params.sessionId,
			sessionKey: params.sessionKey,
			sessionFile: params.sessionFile,
			reason: params.reason,
			sessionManager: params.sessionManager,
			runtimeContext: params.runtimeContext,
			executionMode
		});
	} catch (err) {
		log$3.warn(`context engine maintain failed (${params.reason}): ${String(err)}`);
		return;
	}
}
//#endregion
//#region src/agents/pi-embedded-runner/google-prompt-cache.ts
const GOOGLE_PROMPT_CACHE_CUSTOM_TYPE = "openclaw.google-prompt-cache";
const GOOGLE_PROMPT_CACHE_RETRY_BACKOFF_MS = 10 * 6e4;
const GOOGLE_PROMPT_CACHE_SHORT_REFRESH_WINDOW_MS = 3e4;
const GOOGLE_PROMPT_CACHE_LONG_REFRESH_WINDOW_MS = 5 * 6e4;
function resolveGooglePromptCacheTtl(cacheRetention) {
	return cacheRetention === "long" ? "3600s" : "300s";
}
function resolveGooglePromptCacheRefreshWindowMs(cacheRetention) {
	return cacheRetention === "long" ? GOOGLE_PROMPT_CACHE_LONG_REFRESH_WINDOW_MS : GOOGLE_PROMPT_CACHE_SHORT_REFRESH_WINDOW_MS;
}
function digestSystemPrompt(systemPrompt) {
	return crypto.createHash("sha256").update(systemPrompt).digest("hex");
}
function resolveManagedSystemPrompt(systemPrompt) {
	const sanitized = sanitizeTransportPayloadText(typeof systemPrompt === "string" ? stripSystemPromptCacheBoundary(systemPrompt) : "");
	return sanitized.trim() ? sanitized : void 0;
}
function resolveExplicitCachedContent(extraParams) {
	const trimmed = (typeof extraParams?.cachedContent === "string" ? extraParams.cachedContent : typeof extraParams?.cached_content === "string" ? extraParams.cached_content : void 0)?.trim();
	return trimmed ? trimmed : void 0;
}
function buildGooglePromptCacheMatchKey(params) {
	return stableStringify$1(params);
}
function stringifyGooglePromptCacheKeyPart(value) {
	if (typeof value === "string") return value;
	if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") return String(value);
	return "";
}
function readLatestGooglePromptCacheEntry(sessionManager, matchKey) {
	try {
		const entries = sessionManager.getEntries();
		for (let i = entries.length - 1; i >= 0; i -= 1) {
			const entry = entries[i];
			if (entry?.type !== "custom" || entry?.customType !== GOOGLE_PROMPT_CACHE_CUSTOM_TYPE) continue;
			const data = entry.data;
			if (!data || typeof data !== "object") continue;
			const cacheData = data;
			if (buildGooglePromptCacheMatchKey({
				provider: stringifyGooglePromptCacheKeyPart(cacheData.provider),
				modelId: stringifyGooglePromptCacheKeyPart(cacheData.modelId),
				modelApi: typeof cacheData.modelApi === "string" || cacheData.modelApi == null ? cacheData.modelApi : null,
				baseUrl: stringifyGooglePromptCacheKeyPart(cacheData.baseUrl),
				systemPromptDigest: stringifyGooglePromptCacheKeyPart(cacheData.systemPromptDigest)
			}) === matchKey) return data;
		}
	} catch {
		return null;
	}
	return null;
}
function appendGooglePromptCacheEntry(sessionManager, entry) {
	try {
		sessionManager.appendCustomEntry(GOOGLE_PROMPT_CACHE_CUSTOM_TYPE, entry);
	} catch {}
}
function parseExpireTimeMs(expireTime) {
	if (!expireTime) return null;
	const timestamp = Date.parse(expireTime);
	return Number.isFinite(timestamp) ? timestamp : null;
}
function buildManagedContextWithoutSystemPrompt(context) {
	if (!context.systemPrompt) return context;
	return {
		...context,
		systemPrompt: void 0
	};
}
async function updateGooglePromptCacheTtl(params) {
	const response = await params.fetchImpl(`${params.baseUrl}/${params.cachedContent}?updateMask=ttl`, {
		method: "PATCH",
		headers: mergeTransportHeaders(parseGeminiAuth(params.apiKey).headers, params.headers),
		body: JSON.stringify({ ttl: resolveGooglePromptCacheTtl(params.cacheRetention) }),
		signal: params.signal
	});
	if (!response.ok) return null;
	return await response.json();
}
async function createGooglePromptCache(params) {
	const response = await params.fetchImpl(`${params.baseUrl}/cachedContents`, {
		method: "POST",
		headers: mergeTransportHeaders(parseGeminiAuth(params.apiKey).headers, params.headers),
		body: JSON.stringify({
			model: params.modelId.startsWith("models/") ? params.modelId : `models/${params.modelId}`,
			ttl: resolveGooglePromptCacheTtl(params.cacheRetention),
			systemInstruction: { parts: [{ text: params.systemPrompt }] }
		}),
		signal: params.signal
	});
	if (!response.ok) return null;
	const json = await response.json();
	const cachedContent = normalizeOptionalString(json.name) ?? "";
	return cachedContent ? {
		cachedContent,
		expireTime: json.expireTime
	} : null;
}
async function ensureGooglePromptCache(params, deps) {
	const baseUrl = normalizeGoogleApiBaseUrl(params.model.baseUrl);
	const now = deps.now?.() ?? Date.now();
	const systemPromptDigest = digestSystemPrompt(params.systemPrompt);
	const matchKey = buildGooglePromptCacheMatchKey({
		provider: params.provider,
		modelId: params.model.id,
		modelApi: params.model.api,
		baseUrl,
		systemPromptDigest
	});
	const latestEntry = readLatestGooglePromptCacheEntry(params.sessionManager, matchKey);
	if (latestEntry?.status === "failed" && latestEntry.retryAfter > now) return null;
	const fetchImpl = (deps.buildGuardedFetch ?? buildGuardedModelFetch)(params.model);
	const refreshWindowMs = resolveGooglePromptCacheRefreshWindowMs(params.cacheRetention);
	if (latestEntry?.status === "ready" && latestEntry.cachedContent) {
		const expiresAt = parseExpireTimeMs(latestEntry.expireTime);
		if (!(expiresAt !== null && expiresAt <= now)) {
			if (!(expiresAt !== null && expiresAt - now <= refreshWindowMs)) return latestEntry.cachedContent;
			const refreshed = await updateGooglePromptCacheTtl({
				apiKey: params.apiKey,
				baseUrl,
				cacheRetention: params.cacheRetention,
				cachedContent: latestEntry.cachedContent,
				fetchImpl,
				headers: params.model.headers,
				signal: params.signal
			}).catch(() => null);
			if (refreshed) {
				appendGooglePromptCacheEntry(params.sessionManager, {
					status: "ready",
					timestamp: now,
					provider: params.provider,
					modelId: params.model.id,
					modelApi: params.model.api,
					baseUrl,
					systemPromptDigest,
					cacheRetention: params.cacheRetention,
					cachedContent: latestEntry.cachedContent,
					expireTime: refreshed.expireTime ?? latestEntry.expireTime
				});
				return latestEntry.cachedContent;
			}
			return latestEntry.cachedContent;
		}
	}
	const created = await createGooglePromptCache({
		apiKey: params.apiKey,
		baseUrl,
		cacheRetention: params.cacheRetention,
		fetchImpl,
		headers: params.model.headers,
		modelId: params.model.id,
		signal: params.signal,
		systemPrompt: params.systemPrompt
	});
	if (!created) {
		appendGooglePromptCacheEntry(params.sessionManager, {
			status: "failed",
			timestamp: now,
			provider: params.provider,
			modelId: params.model.id,
			modelApi: params.model.api,
			baseUrl,
			systemPromptDigest,
			cacheRetention: params.cacheRetention,
			retryAfter: now + GOOGLE_PROMPT_CACHE_RETRY_BACKOFF_MS
		});
		return null;
	}
	appendGooglePromptCacheEntry(params.sessionManager, {
		status: "ready",
		timestamp: now,
		provider: params.provider,
		modelId: params.model.id,
		modelApi: params.model.api,
		baseUrl,
		systemPromptDigest,
		cacheRetention: params.cacheRetention,
		cachedContent: created.cachedContent,
		expireTime: created.expireTime
	});
	return created.cachedContent;
}
async function prepareGooglePromptCacheStreamFn(params, deps = {}) {
	if (!params.streamFn) return;
	if (resolveExplicitCachedContent(params.extraParams)) return;
	if (!isGooglePromptCacheEligible({
		modelApi: params.model.api,
		modelId: params.modelId
	})) return;
	const resolvedRetention = resolveCacheRetention(params.extraParams, params.provider, params.model.api, params.modelId);
	if (resolvedRetention !== "short" && resolvedRetention !== "long") return;
	const systemPrompt = resolveManagedSystemPrompt(params.systemPrompt);
	const apiKey = params.apiKey?.trim();
	if (!systemPrompt || !apiKey) return;
	const cachedContent = await ensureGooglePromptCache({
		apiKey,
		cacheRetention: resolvedRetention,
		model: params.model,
		provider: params.provider,
		sessionManager: params.sessionManager,
		signal: params.signal,
		systemPrompt
	}, deps);
	if (!cachedContent) {
		log$3.debug(`google prompt cache unavailable for ${params.provider}/${params.modelId}; continuing without cachedContent`);
		return;
	}
	const inner = params.streamFn;
	return (model, context, options) => streamWithPayloadPatch(inner, model, buildManagedContextWithoutSystemPrompt(context), options, (payload) => {
		payload.cachedContent = cachedContent;
	});
}
//#endregion
//#region src/agents/pi-embedded-runner/prompt-cache-observability.ts
const trackers = /* @__PURE__ */ new Map();
const MAX_TRACKERS = 512;
const MIN_CACHE_BREAK_TOKEN_DROP = 1e3;
const MAX_STABLE_CACHE_READ_RATIO = .95;
function digestText(value) {
	return crypto.createHash("sha256").update(value).digest("hex");
}
function buildTrackerKey(params) {
	return params.sessionKey?.trim() || params.sessionId;
}
function buildToolDigest(toolNames) {
	return digestText(JSON.stringify([...toolNames].toSorted()));
}
function setTracker(key, tracker) {
	if (trackers.has(key)) trackers.delete(key);
	else if (trackers.size >= MAX_TRACKERS) {
		const oldestKey = trackers.keys().next().value;
		if (typeof oldestKey === "string") trackers.delete(oldestKey);
	}
	trackers.set(key, tracker);
}
function diffSnapshots(previous, next) {
	const changes = [];
	if (previous.provider !== next.provider || previous.modelId !== next.modelId) changes.push({
		code: "model",
		detail: `${previous.provider}/${previous.modelId} -> ${next.provider}/${next.modelId}`
	});
	else if ((previous.modelApi ?? null) !== (next.modelApi ?? null)) changes.push({
		code: "model",
		detail: `${previous.modelApi ?? "unknown"} -> ${next.modelApi ?? "unknown"}`
	});
	if (previous.cacheRetention !== next.cacheRetention) changes.push({
		code: "cacheRetention",
		detail: `${previous.cacheRetention ?? "default"} -> ${next.cacheRetention ?? "default"}`
	});
	if (previous.transport !== next.transport) changes.push({
		code: "transport",
		detail: `${previous.transport ?? "default"} -> ${next.transport ?? "default"}`
	});
	if (previous.streamStrategy !== next.streamStrategy) changes.push({
		code: "streamStrategy",
		detail: `${previous.streamStrategy} -> ${next.streamStrategy}`
	});
	if (previous.systemPromptDigest !== next.systemPromptDigest) changes.push({
		code: "systemPrompt",
		detail: "system prompt digest changed"
	});
	if (previous.toolDigest !== next.toolDigest) changes.push({
		code: "tools",
		detail: previous.toolCount === next.toolCount ? "tool set changed with same count" : `${previous.toolCount} -> ${next.toolCount} tools`
	});
	return changes.length > 0 ? changes : null;
}
function collectPromptCacheToolNames(tools) {
	return tools.map((tool) => tool.name?.trim()).filter((name) => Boolean(name));
}
function beginPromptCacheObservation(params) {
	const key = buildTrackerKey(params);
	const snapshot = {
		provider: params.provider,
		modelId: params.modelId,
		modelApi: params.modelApi,
		cacheRetention: params.cacheRetention,
		streamStrategy: params.streamStrategy,
		transport: params.transport,
		systemPromptDigest: digestText(params.systemPrompt),
		toolDigest: buildToolDigest(params.toolNames),
		toolCount: params.toolNames.length,
		toolNames: [...params.toolNames]
	};
	const previous = trackers.get(key);
	const changes = previous ? diffSnapshots(previous.snapshot, snapshot) : null;
	setTracker(key, {
		snapshot,
		lastCacheRead: previous?.lastCacheRead ?? null,
		pendingChanges: changes
	});
	return {
		snapshot,
		changes,
		previousCacheRead: previous?.lastCacheRead ?? null
	};
}
function completePromptCacheObservation(params) {
	const key = buildTrackerKey(params);
	const tracker = trackers.get(key);
	if (!tracker) return null;
	const cacheRead = params.usage?.cacheRead;
	if (typeof cacheRead !== "number" || !Number.isFinite(cacheRead)) {
		tracker.pendingChanges = null;
		return null;
	}
	const previousCacheRead = tracker.lastCacheRead;
	tracker.lastCacheRead = cacheRead;
	if (previousCacheRead == null || previousCacheRead <= 0) {
		tracker.pendingChanges = null;
		return null;
	}
	const tokenDrop = previousCacheRead - cacheRead;
	const result = cacheRead < previousCacheRead * MAX_STABLE_CACHE_READ_RATIO && tokenDrop >= MIN_CACHE_BREAK_TOKEN_DROP ? {
		previousCacheRead,
		cacheRead,
		changes: tracker.pendingChanges
	} : null;
	tracker.pendingChanges = null;
	return result;
}
//#endregion
//#region src/agents/pi-embedded-runner/session-manager-init.ts
/**
* pi-coding-agent SessionManager persistence quirk:
* - If the file exists but has no assistant message, SessionManager marks itself `flushed=true`
*   and will never persist the initial user message.
* - If the file doesn't exist yet, SessionManager builds a new session in memory and flushes
*   header+user+assistant once the first assistant arrives (good).
*
* This normalizes the file/session state so the first user prompt is persisted before the first
* assistant entry, even for pre-created session files.
*/
async function prepareSessionManagerForRun(params) {
	const sm = params.sessionManager;
	const header = sm.fileEntries.find((e) => e.type === "session");
	const hasAssistant = sm.fileEntries.some((e) => e.type === "message" && e.message?.role === "assistant");
	if (!params.hadSessionFile && header) {
		header.id = params.sessionId;
		header.cwd = params.cwd;
		sm.sessionId = params.sessionId;
		return;
	}
	if (params.hadSessionFile && header && !hasAssistant) {
		await fs$1.writeFile(params.sessionFile, "", "utf-8");
		sm.fileEntries = [header];
		sm.byId?.clear?.();
		sm.labelsById?.clear?.();
		sm.leafId = null;
		sm.flushed = false;
	}
}
//#endregion
//#region src/agents/pi-embedded-runner/run/attempt.context-engine-helpers.ts
async function resolveAttemptBootstrapContext(params) {
	const isContinuationTurn = params.contextInjectionMode === "continuation-skip" && params.bootstrapContextRunKind !== "heartbeat" && await params.hasCompletedBootstrapTurn(params.sessionFile);
	const shouldRecordCompletedBootstrapTurn = !isContinuationTurn && params.bootstrapContextMode !== "lightweight" && params.bootstrapContextRunKind !== "heartbeat";
	return {
		...isContinuationTurn ? {
			bootstrapFiles: [],
			contextFiles: []
		} : await params.resolveBootstrapContextForRun(),
		isContinuationTurn,
		shouldRecordCompletedBootstrapTurn
	};
}
function buildContextEnginePromptCacheInfo(params) {
	const promptCache = {};
	if (params.retention) promptCache.retention = params.retention;
	if (params.lastCallUsage) promptCache.lastCallUsage = { ...params.lastCallUsage };
	if (params.observation) promptCache.observation = {
		broke: params.observation.broke,
		...typeof params.observation.previousCacheRead === "number" ? { previousCacheRead: params.observation.previousCacheRead } : {},
		...typeof params.observation.cacheRead === "number" ? { cacheRead: params.observation.cacheRead } : {},
		...params.observation.changes && params.observation.changes.length > 0 ? { changes: params.observation.changes.map((change) => ({
			code: change.code,
			detail: change.detail
		})) } : {}
	};
	if (typeof params.lastCacheTouchAt === "number" && Number.isFinite(params.lastCacheTouchAt)) promptCache.lastCacheTouchAt = params.lastCacheTouchAt;
	return Object.keys(promptCache).length > 0 ? promptCache : void 0;
}
function findCurrentAttemptAssistantMessage(params) {
	return params.messagesSnapshot.slice(Math.max(0, params.prePromptMessageCount)).toReversed().find((message) => message.role === "assistant");
}
function parsePromptCacheTouchTimestamp(value) {
	if (typeof value === "number" && Number.isFinite(value)) return value;
	if (typeof value === "string") {
		const parsed = Date.parse(value);
		if (Number.isFinite(parsed)) return parsed;
	}
	return null;
}
/** Resolve the effective prompt-cache touch timestamp for the current assistant turn. */
function resolvePromptCacheTouchTimestamp(params) {
	if (!(typeof params.lastCallUsage?.cacheRead === "number" || typeof params.lastCallUsage?.cacheWrite === "number")) return params.fallbackLastCacheTouchAt ?? null;
	return parsePromptCacheTouchTimestamp(params.assistantTimestamp) ?? params.fallbackLastCacheTouchAt ?? null;
}
function buildLoopPromptCacheInfo(params) {
	const currentAttemptAssistant = findCurrentAttemptAssistantMessage({
		messagesSnapshot: params.messagesSnapshot,
		prePromptMessageCount: params.prePromptMessageCount
	});
	const lastCallUsage = normalizeUsage(currentAttemptAssistant?.usage);
	return buildContextEnginePromptCacheInfo({
		retention: params.retention,
		lastCallUsage,
		lastCacheTouchAt: resolvePromptCacheTouchTimestamp({
			lastCallUsage,
			assistantTimestamp: currentAttemptAssistant?.timestamp,
			fallbackLastCacheTouchAt: params.fallbackLastCacheTouchAt
		})
	});
}
async function runAttemptContextEngineBootstrap(params) {
	if (!params.hadSessionFile || !(params.contextEngine?.bootstrap || params.contextEngine?.maintain)) return;
	try {
		if (typeof params.contextEngine?.bootstrap === "function") await params.contextEngine.bootstrap({
			sessionId: params.sessionId,
			sessionKey: params.sessionKey,
			sessionFile: params.sessionFile
		});
		await params.runMaintenance({
			contextEngine: params.contextEngine,
			sessionId: params.sessionId,
			sessionKey: params.sessionKey,
			sessionFile: params.sessionFile,
			reason: "bootstrap",
			sessionManager: params.sessionManager,
			runtimeContext: params.runtimeContext
		});
	} catch (bootstrapErr) {
		params.warn(`context engine bootstrap failed: ${String(bootstrapErr)}`);
	}
}
async function assembleAttemptContextEngine(params) {
	if (!params.contextEngine) return;
	return await params.contextEngine.assemble({
		sessionId: params.sessionId,
		sessionKey: params.sessionKey,
		messages: params.messages,
		tokenBudget: params.tokenBudget,
		...params.availableTools ? { availableTools: params.availableTools } : {},
		...params.citationsMode ? { citationsMode: params.citationsMode } : {},
		model: params.modelId,
		...params.prompt !== void 0 ? { prompt: params.prompt } : {}
	});
}
async function finalizeAttemptContextEngineTurn(params) {
	if (!params.contextEngine) return { postTurnFinalizationSucceeded: true };
	let postTurnFinalizationSucceeded = true;
	if (typeof params.contextEngine.afterTurn === "function") try {
		await params.contextEngine.afterTurn({
			sessionId: params.sessionIdUsed,
			sessionKey: params.sessionKey,
			sessionFile: params.sessionFile,
			messages: params.messagesSnapshot,
			prePromptMessageCount: params.prePromptMessageCount,
			tokenBudget: params.tokenBudget,
			runtimeContext: params.runtimeContext
		});
	} catch (afterTurnErr) {
		postTurnFinalizationSucceeded = false;
		params.warn(`context engine afterTurn failed: ${String(afterTurnErr)}`);
	}
	else {
		const newMessages = params.messagesSnapshot.slice(params.prePromptMessageCount);
		if (newMessages.length > 0) if (typeof params.contextEngine.ingestBatch === "function") try {
			await params.contextEngine.ingestBatch({
				sessionId: params.sessionIdUsed,
				sessionKey: params.sessionKey,
				messages: newMessages
			});
		} catch (ingestErr) {
			postTurnFinalizationSucceeded = false;
			params.warn(`context engine ingest failed: ${String(ingestErr)}`);
		}
		else for (const msg of newMessages) try {
			await params.contextEngine.ingest?.({
				sessionId: params.sessionIdUsed,
				sessionKey: params.sessionKey,
				message: msg
			});
		} catch (ingestErr) {
			postTurnFinalizationSucceeded = false;
			params.warn(`context engine ingest failed: ${String(ingestErr)}`);
		}
	}
	if (!params.promptError && !params.aborted && !params.yieldAborted && postTurnFinalizationSucceeded) await params.runMaintenance({
		contextEngine: params.contextEngine,
		sessionId: params.sessionIdUsed,
		sessionKey: params.sessionKey,
		sessionFile: params.sessionFile,
		reason: "turn",
		sessionManager: params.sessionManager,
		runtimeContext: params.runtimeContext
	});
	return { postTurnFinalizationSucceeded };
}
//#endregion
//#region src/agents/pi-embedded-runner/run/trigger-policy.ts
const DEFAULT_EMBEDDED_RUN_TRIGGER_POLICY = { injectHeartbeatPrompt: true };
const EMBEDDED_RUN_TRIGGER_POLICY = { cron: { injectHeartbeatPrompt: false } };
function shouldInjectHeartbeatPromptForTrigger(trigger) {
	return (trigger ? EMBEDDED_RUN_TRIGGER_POLICY[trigger] : void 0)?.injectHeartbeatPrompt ?? DEFAULT_EMBEDDED_RUN_TRIGGER_POLICY.injectHeartbeatPrompt;
}
//#endregion
//#region src/agents/pi-embedded-runner/run/attempt.prompt-helpers.ts
async function resolvePromptBuildHookResult(params) {
	const promptBuildResult = params.hookRunner?.hasHooks("before_prompt_build") ? await params.hookRunner.runBeforePromptBuild({
		prompt: params.prompt,
		messages: params.messages
	}, params.hookCtx).catch((hookErr) => {
		log$3.warn(`before_prompt_build hook failed: ${String(hookErr)}`);
	}) : void 0;
	const legacyResult = params.legacyBeforeAgentStartResult ?? (params.hookRunner?.hasHooks("before_agent_start") ? await params.hookRunner.runBeforeAgentStart({
		prompt: params.prompt,
		messages: params.messages
	}, params.hookCtx).catch((hookErr) => {
		log$3.warn(`before_agent_start hook (legacy prompt build path) failed: ${String(hookErr)}`);
	}) : void 0);
	return {
		systemPrompt: promptBuildResult?.systemPrompt ?? legacyResult?.systemPrompt,
		prependContext: joinPresentTextSegments([promptBuildResult?.prependContext, legacyResult?.prependContext]),
		prependSystemContext: joinPresentTextSegments([promptBuildResult?.prependSystemContext, legacyResult?.prependSystemContext]),
		appendSystemContext: joinPresentTextSegments([promptBuildResult?.appendSystemContext, legacyResult?.appendSystemContext])
	};
}
function resolvePromptModeForSession(sessionKey) {
	if (!sessionKey) return "full";
	return isSubagentSessionKey(sessionKey) || isCronSessionKey(sessionKey) ? "minimal" : "full";
}
function shouldInjectHeartbeatPrompt(params) {
	return params.isDefaultAgent && shouldInjectHeartbeatPromptForTrigger(params.trigger) && Boolean(resolveHeartbeatPromptForSystemPrompt({
		config: params.config,
		agentId: params.agentId,
		defaultAgentId: params.defaultAgentId
	}));
}
function shouldWarnOnOrphanedUserRepair(trigger) {
	return trigger === "user" || trigger === "manual";
}
function extractUserMessagePlainText(content) {
	if (typeof content === "string") return content.trim() || void 0;
	if (!Array.isArray(content)) return;
	return content.flatMap((part) => part && typeof part === "object" && "type" in part && part.type === "text" ? [typeof part.text === "string" ? part.text : ""] : []).join("\n").trim() || void 0;
}
function mergeOrphanedTrailingUserPrompt(params) {
	if (!shouldWarnOnOrphanedUserRepair(params.trigger)) return {
		prompt: params.prompt,
		merged: false
	};
	const orphanText = extractUserMessagePlainText(params.leafMessage.content);
	if (!orphanText || orphanText.length < 4 || params.prompt.includes(orphanText)) return {
		prompt: params.prompt,
		merged: false
	};
	return {
		prompt: [
			"[Queued user message that arrived while the previous turn was still active]",
			orphanText,
			"",
			params.prompt
		].join("\n"),
		merged: true
	};
}
function resolveAttemptFsWorkspaceOnly(params) {
	return resolveEffectiveToolFsWorkspaceOnly({
		cfg: params.config,
		agentId: params.sessionAgentId
	});
}
function prependSystemPromptAddition(params) {
	return prependSystemPromptAdditionAfterCacheBoundary(params);
}
function resolveAttemptPrependSystemContext(params) {
	return joinPresentTextSegments([...params.trigger === "user" || params.trigger === "manual" ? [buildActiveVideoGenerationTaskPromptContextForSession(params.sessionKey), buildActiveMusicGenerationTaskPromptContextForSession(params.sessionKey)] : [], params.hookPrependSystemContext]);
}
/** Build runtime context passed into context-engine afterTurn hooks. */
function buildAfterTurnRuntimeContext(params) {
	return {
		...buildEmbeddedCompactionRuntimeContext({
			sessionKey: params.attempt.sessionKey,
			messageChannel: params.attempt.messageChannel,
			messageProvider: params.attempt.messageProvider,
			agentAccountId: params.attempt.agentAccountId,
			currentChannelId: params.attempt.currentChannelId,
			currentThreadTs: params.attempt.currentThreadTs,
			currentMessageId: params.attempt.currentMessageId,
			authProfileId: params.attempt.authProfileId,
			workspaceDir: params.workspaceDir,
			agentDir: params.agentDir,
			config: params.attempt.config,
			skillsSnapshot: params.attempt.skillsSnapshot,
			senderIsOwner: params.attempt.senderIsOwner,
			senderId: params.attempt.senderId,
			provider: params.attempt.provider,
			modelId: params.attempt.modelId,
			thinkLevel: params.attempt.thinkLevel,
			reasoningLevel: params.attempt.reasoningLevel,
			bashElevated: params.attempt.bashElevated,
			extraSystemPrompt: params.attempt.extraSystemPrompt,
			ownerNumbers: params.attempt.ownerNumbers
		}),
		...typeof params.tokenBudget === "number" && Number.isFinite(params.tokenBudget) && params.tokenBudget > 0 ? { tokenBudget: Math.floor(params.tokenBudget) } : {},
		...typeof params.currentTokenCount === "number" && Number.isFinite(params.currentTokenCount) && params.currentTokenCount > 0 ? { currentTokenCount: Math.floor(params.currentTokenCount) } : {},
		...params.promptCache ? { promptCache: params.promptCache } : {}
	};
}
//#endregion
//#region src/agents/pi-embedded-runner/run/attempt.sessions-yield.ts
const SESSIONS_YIELD_INTERRUPT_CUSTOM_TYPE = "openclaw.sessions_yield_interrupt";
const SESSIONS_YIELD_CONTEXT_CUSTOM_TYPE = "openclaw.sessions_yield";
const SESSIONS_YIELD_ABORT_SETTLE_TIMEOUT_MS = process.env.OPENCLAW_TEST_FAST === "1" ? 250 : 2e3;
function buildSessionsYieldContextMessage(message) {
	return `${message}\n\n[Context: The previous turn ended intentionally via sessions_yield while waiting for a follow-up event.]`;
}
async function waitForSessionsYieldAbortSettle(params) {
	if (!params.settlePromise) return;
	let timeout;
	const outcome = await Promise.race([params.settlePromise.then(() => "settled").catch((err) => {
		log$3.warn(`sessions_yield abort settle failed: runId=${params.runId} sessionId=${params.sessionId} err=${String(err)}`);
		return "errored";
	}), new Promise((resolve) => {
		timeout = setTimeout(() => resolve("timed_out"), SESSIONS_YIELD_ABORT_SETTLE_TIMEOUT_MS);
	})]);
	if (timeout) clearTimeout(timeout);
	if (outcome === "timed_out") log$3.warn(`sessions_yield abort settle timed out: runId=${params.runId} sessionId=${params.sessionId} timeoutMs=${SESSIONS_YIELD_ABORT_SETTLE_TIMEOUT_MS}`);
}
function createYieldAbortedResponse(model) {
	const message = {
		role: "assistant",
		content: [{
			type: "text",
			text: ""
		}],
		stopReason: "aborted",
		api: model.api ?? "",
		provider: model.provider ?? "",
		model: model.id ?? "",
		usage: {
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
		},
		timestamp: Date.now()
	};
	return {
		async *[Symbol.asyncIterator]() {},
		result: async () => message
	};
}
function queueSessionsYieldInterruptMessage(activeSession) {
	activeSession.agent.steer({
		role: "custom",
		customType: SESSIONS_YIELD_INTERRUPT_CUSTOM_TYPE,
		content: "[sessions_yield interrupt]",
		display: false,
		details: { source: "sessions_yield" },
		timestamp: Date.now()
	});
}
async function persistSessionsYieldContextMessage(activeSession, message) {
	await activeSession.sendCustomMessage({
		customType: SESSIONS_YIELD_CONTEXT_CUSTOM_TYPE,
		content: buildSessionsYieldContextMessage(message),
		display: false,
		details: {
			source: "sessions_yield",
			message
		}
	}, { triggerTurn: false });
}
function stripSessionsYieldArtifacts(activeSession) {
	const strippedMessages = activeSession.messages.slice();
	while (strippedMessages.length > 0) {
		const last = strippedMessages.at(-1);
		if (last?.role === "assistant" && "stopReason" in last && last.stopReason === "aborted") {
			strippedMessages.pop();
			continue;
		}
		if (last?.role === "custom" && "customType" in last && last.customType === SESSIONS_YIELD_INTERRUPT_CUSTOM_TYPE) {
			strippedMessages.pop();
			continue;
		}
		break;
	}
	if (strippedMessages.length !== activeSession.messages.length) activeSession.agent.state.messages = strippedMessages;
	const sessionManager = activeSession.sessionManager;
	const fileEntries = sessionManager?.fileEntries;
	const byId = sessionManager?.byId;
	if (!fileEntries || !byId) return;
	let changed = false;
	while (fileEntries.length > 1) {
		const last = fileEntries.at(-1);
		if (!last || last.type === "session") break;
		const isYieldAbortAssistant = last.type === "message" && last.message?.role === "assistant" && last.message?.stopReason === "aborted";
		const isYieldInterruptMessage = last.type === "custom_message" && last.customType === SESSIONS_YIELD_INTERRUPT_CUSTOM_TYPE;
		if (!isYieldAbortAssistant && !isYieldInterruptMessage) break;
		fileEntries.pop();
		if (last.id) byId.delete(last.id);
		sessionManager.leafId = last.parentId ?? null;
		changed = true;
	}
	if (changed) sessionManager._rewriteFile?.();
}
//#endregion
//#region src/agents/pi-embedded-runner/run/attempt.stop-reason-recovery.ts
const UNHANDLED_STOP_REASON_RE = /^Unhandled stop reason:\s*(.+)$/i;
function formatUnhandledStopReasonErrorMessage(stopReason) {
	return `The model stopped because the provider returned an unhandled stop reason: ${stopReason}. Please rephrase and try again.`;
}
function normalizeUnhandledStopReasonMessage(message) {
	if (typeof message !== "string") return;
	const stopReason = message.trim().match(UNHANDLED_STOP_REASON_RE)?.[1]?.trim();
	if (!stopReason) return;
	return formatUnhandledStopReasonErrorMessage(stopReason);
}
function patchUnhandledStopReasonInAssistantMessage(message) {
	if (!message || typeof message !== "object") return;
	const assistant = message;
	const normalizedMessage = normalizeUnhandledStopReasonMessage(assistant.errorMessage);
	if (!normalizedMessage) return;
	assistant.stopReason = "error";
	assistant.errorMessage = normalizedMessage;
}
function buildUnhandledStopReasonErrorStream(model, errorMessage) {
	const stream = createAssistantMessageEventStream();
	queueMicrotask(() => {
		stream.push({
			type: "error",
			reason: "error",
			error: buildStreamErrorAssistantMessage({
				model: {
					api: model.api,
					provider: model.provider,
					id: model.id
				},
				errorMessage
			})
		});
		stream.end();
	});
	return stream;
}
function wrapStreamHandleUnhandledStopReason(model, stream) {
	const originalResult = stream.result.bind(stream);
	stream.result = async () => {
		try {
			const message = await originalResult();
			patchUnhandledStopReasonInAssistantMessage(message);
			return message;
		} catch (err) {
			const normalizedMessage = normalizeUnhandledStopReasonMessage(formatErrorMessage(err));
			if (!normalizedMessage) throw err;
			return buildStreamErrorAssistantMessage({
				model: {
					api: model.api,
					provider: model.provider,
					id: model.id
				},
				errorMessage: normalizedMessage
			});
		}
	};
	const originalAsyncIterator = stream[Symbol.asyncIterator].bind(stream);
	stream[Symbol.asyncIterator] = function() {
		const iterator = originalAsyncIterator();
		let emittedSyntheticTerminal = false;
		return {
			async next() {
				if (emittedSyntheticTerminal) return {
					done: true,
					value: void 0
				};
				try {
					const result = await iterator.next();
					if (!result.done && result.value && typeof result.value === "object") {
						const event = result.value;
						patchUnhandledStopReasonInAssistantMessage(event.error);
					}
					return result;
				} catch (err) {
					const normalizedMessage = normalizeUnhandledStopReasonMessage(formatErrorMessage(err));
					if (!normalizedMessage) throw err;
					emittedSyntheticTerminal = true;
					return {
						done: false,
						value: {
							type: "error",
							reason: "error",
							error: buildStreamErrorAssistantMessage({
								model: {
									api: model.api,
									provider: model.provider,
									id: model.id
								},
								errorMessage: normalizedMessage
							})
						}
					};
				}
			},
			async return(value) {
				return iterator.return?.(value) ?? {
					done: true,
					value: void 0
				};
			},
			async throw(error) {
				return iterator.throw?.(error) ?? {
					done: true,
					value: void 0
				};
			},
			[Symbol.asyncIterator]() {
				return this;
			}
		};
	};
	return stream;
}
function wrapStreamFnHandleSensitiveStopReason(baseFn) {
	return (model, context, options) => {
		try {
			const maybeStream = baseFn(model, context, options);
			if (maybeStream && typeof maybeStream === "object" && "then" in maybeStream) return Promise.resolve(maybeStream).then((stream) => wrapStreamHandleUnhandledStopReason(model, stream), (err) => {
				const normalizedMessage = normalizeUnhandledStopReasonMessage(formatErrorMessage(err));
				if (!normalizedMessage) throw err;
				return buildUnhandledStopReasonErrorStream(model, normalizedMessage);
			});
			return wrapStreamHandleUnhandledStopReason(model, maybeStream);
		} catch (err) {
			const normalizedMessage = normalizeUnhandledStopReasonMessage(formatErrorMessage(err));
			if (!normalizedMessage) throw err;
			return buildUnhandledStopReasonErrorStream(model, normalizedMessage);
		}
	};
}
//#endregion
//#region src/agents/pi-embedded-runner/run/attempt.subscription-cleanup.ts
function buildEmbeddedSubscriptionParams(params) {
	return params;
}
async function cleanupEmbeddedAttemptResources(params) {
	try {
		try {
			params.removeToolResultContextGuard?.();
		} catch {}
		try {
			await params.flushPendingToolResultsAfterIdle({
				agent: params.session?.agent,
				sessionManager: params.sessionManager,
				clearPendingOnTimeout: true
			});
		} catch {}
		try {
			params.session?.dispose();
		} catch {}
		try {
			params.releaseWsSession(params.sessionId);
		} catch {}
		try {
			await params.bundleLspRuntime?.dispose();
		} catch {}
	} finally {
		await params.sessionLock.release();
	}
}
//#endregion
//#region src/agents/pi-embedded-runner/run/attempt.tool-call-argument-repair.ts
function isToolCallBlockType$1(type) {
	return type === "toolCall" || type === "toolUse" || type === "functionCall";
}
function extractBalancedJsonPrefix(raw) {
	let start = 0;
	while (start < raw.length) {
		const char = raw[start];
		if (char === "{" || char === "[") break;
		start += 1;
	}
	if (start >= raw.length) return null;
	let depth = 0;
	let inString = false;
	let escaped = false;
	for (let i = start; i < raw.length; i += 1) {
		const char = raw[i];
		if (char === void 0) break;
		if (inString) {
			if (escaped) escaped = false;
			else if (char === "\\") escaped = true;
			else if (char === "\"") inString = false;
			continue;
		}
		if (char === "\"") {
			inString = true;
			continue;
		}
		if (char === "{" || char === "[") {
			depth += 1;
			continue;
		}
		if (char === "}" || char === "]") {
			depth -= 1;
			if (depth === 0) return {
				json: raw.slice(start, i + 1),
				startIndex: start
			};
		}
	}
	return null;
}
const MAX_TOOLCALL_REPAIR_BUFFER_CHARS = 64e3;
const MAX_TOOLCALL_REPAIR_LEADING_CHARS = 96;
const MAX_TOOLCALL_REPAIR_TRAILING_CHARS = 3;
const TOOLCALL_REPAIR_ALLOWED_LEADING_RE = /^[a-z0-9\s"'`.:/_\\-]+$/i;
const TOOLCALL_REPAIR_ALLOWED_TRAILING_RE = /^[^\s{}[\]":,\\]{1,3}$/;
function shouldAttemptMalformedToolCallRepair(partialJson, delta) {
	if (/[}\]]/.test(delta)) return true;
	const trimmedDelta = delta.trim();
	return trimmedDelta.length > 0 && trimmedDelta.length <= MAX_TOOLCALL_REPAIR_TRAILING_CHARS && /[}\]]/.test(partialJson);
}
function isAllowedToolCallRepairLeadingPrefix(prefix) {
	if (!prefix) return true;
	if (prefix.length > MAX_TOOLCALL_REPAIR_LEADING_CHARS) return false;
	if (!TOOLCALL_REPAIR_ALLOWED_LEADING_RE.test(prefix)) return false;
	return /^[.:'"`-]/.test(prefix) || /^(?:functions?|tools?)[._:/-]?/i.test(prefix);
}
function tryExtractUsableToolCallArguments(raw) {
	if (!raw.trim()) return;
	try {
		const parsed = JSON.parse(raw);
		return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? {
			args: parsed,
			kind: "preserved",
			leadingPrefix: "",
			trailingSuffix: ""
		} : void 0;
	} catch {
		const extracted = extractBalancedJsonPrefix(raw);
		if (!extracted) return;
		const leadingPrefix = raw.slice(0, extracted.startIndex).trim();
		if (!isAllowedToolCallRepairLeadingPrefix(leadingPrefix)) return;
		const suffix = raw.slice(extracted.startIndex + extracted.json.length).trim();
		if (leadingPrefix.length === 0 && suffix.length === 0) return;
		if (suffix.length > MAX_TOOLCALL_REPAIR_TRAILING_CHARS || suffix.length > 0 && !TOOLCALL_REPAIR_ALLOWED_TRAILING_RE.test(suffix)) return;
		try {
			const parsed = JSON.parse(extracted.json);
			return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? {
				args: parsed,
				kind: "repaired",
				leadingPrefix,
				trailingSuffix: suffix
			} : void 0;
		} catch {
			return;
		}
	}
}
function repairToolCallArgumentsInMessage(message, contentIndex, repairedArgs) {
	if (!message || typeof message !== "object") return;
	const content = message.content;
	if (!Array.isArray(content)) return;
	const block = content[contentIndex];
	if (!block || typeof block !== "object") return;
	const typedBlock = block;
	if (!isToolCallBlockType$1(typedBlock.type)) return;
	typedBlock.arguments = repairedArgs;
}
function hasMeaningfulToolCallArgumentsInMessage(message, contentIndex) {
	if (!message || typeof message !== "object") return false;
	const content = message.content;
	if (!Array.isArray(content)) return false;
	const block = content[contentIndex];
	if (!block || typeof block !== "object") return false;
	const typedBlock = block;
	if (!isToolCallBlockType$1(typedBlock.type)) return false;
	return typedBlock.arguments !== null && typeof typedBlock.arguments === "object" && !Array.isArray(typedBlock.arguments) && Object.keys(typedBlock.arguments).length > 0;
}
function clearToolCallArgumentsInMessage(message, contentIndex) {
	if (!message || typeof message !== "object") return;
	const content = message.content;
	if (!Array.isArray(content)) return;
	const block = content[contentIndex];
	if (!block || typeof block !== "object") return;
	const typedBlock = block;
	if (!isToolCallBlockType$1(typedBlock.type)) return;
	typedBlock.arguments = {};
}
function repairMalformedToolCallArgumentsInMessage(message, repairedArgsByIndex) {
	if (!message || typeof message !== "object") return;
	const content = message.content;
	if (!Array.isArray(content)) return;
	for (const [index, repairedArgs] of repairedArgsByIndex.entries()) repairToolCallArgumentsInMessage(message, index, repairedArgs);
}
function wrapStreamRepairMalformedToolCallArguments(stream) {
	const partialJsonByIndex = /* @__PURE__ */ new Map();
	const repairedArgsByIndex = /* @__PURE__ */ new Map();
	const hadPreexistingArgsByIndex = /* @__PURE__ */ new Set();
	const disabledIndices = /* @__PURE__ */ new Set();
	const loggedRepairIndices = /* @__PURE__ */ new Set();
	const originalResult = stream.result.bind(stream);
	stream.result = async () => {
		const message = await originalResult();
		repairMalformedToolCallArgumentsInMessage(message, repairedArgsByIndex);
		partialJsonByIndex.clear();
		repairedArgsByIndex.clear();
		hadPreexistingArgsByIndex.clear();
		disabledIndices.clear();
		loggedRepairIndices.clear();
		return message;
	};
	const originalAsyncIterator = stream[Symbol.asyncIterator].bind(stream);
	stream[Symbol.asyncIterator] = function() {
		const iterator = originalAsyncIterator();
		return {
			async next() {
				const result = await iterator.next();
				if (!result.done && result.value && typeof result.value === "object") {
					const event = result.value;
					if (typeof event.contentIndex === "number" && Number.isInteger(event.contentIndex) && event.type === "toolcall_delta" && typeof event.delta === "string") {
						if (disabledIndices.has(event.contentIndex)) return result;
						const nextPartialJson = (partialJsonByIndex.get(event.contentIndex) ?? "") + event.delta;
						if (nextPartialJson.length > MAX_TOOLCALL_REPAIR_BUFFER_CHARS) {
							partialJsonByIndex.delete(event.contentIndex);
							repairedArgsByIndex.delete(event.contentIndex);
							disabledIndices.add(event.contentIndex);
							return result;
						}
						partialJsonByIndex.set(event.contentIndex, nextPartialJson);
						if (shouldAttemptMalformedToolCallRepair(nextPartialJson, event.delta) || repairedArgsByIndex.has(event.contentIndex)) {
							const hadRepairState = repairedArgsByIndex.has(event.contentIndex);
							const repair = tryExtractUsableToolCallArguments(nextPartialJson);
							if (repair) {
								if (!hadRepairState && (hasMeaningfulToolCallArgumentsInMessage(event.partial, event.contentIndex) || hasMeaningfulToolCallArgumentsInMessage(event.message, event.contentIndex))) hadPreexistingArgsByIndex.add(event.contentIndex);
								repairedArgsByIndex.set(event.contentIndex, repair.args);
								repairToolCallArgumentsInMessage(event.partial, event.contentIndex, repair.args);
								repairToolCallArgumentsInMessage(event.message, event.contentIndex, repair.args);
								if (!loggedRepairIndices.has(event.contentIndex) && repair.kind === "repaired") {
									loggedRepairIndices.add(event.contentIndex);
									log$3.warn(`repairing Kimi tool call arguments with ${repair.leadingPrefix.length} leading chars and ${repair.trailingSuffix.length} trailing chars`);
								}
							} else {
								repairedArgsByIndex.delete(event.contentIndex);
								if (!(hadPreexistingArgsByIndex.has(event.contentIndex) || !hadRepairState && (hasMeaningfulToolCallArgumentsInMessage(event.partial, event.contentIndex) || hasMeaningfulToolCallArgumentsInMessage(event.message, event.contentIndex)))) {
									clearToolCallArgumentsInMessage(event.partial, event.contentIndex);
									clearToolCallArgumentsInMessage(event.message, event.contentIndex);
								}
							}
						}
					}
					if (typeof event.contentIndex === "number" && Number.isInteger(event.contentIndex) && event.type === "toolcall_end") {
						const repairedArgs = repairedArgsByIndex.get(event.contentIndex);
						if (repairedArgs) {
							if (event.toolCall && typeof event.toolCall === "object") event.toolCall.arguments = repairedArgs;
							repairToolCallArgumentsInMessage(event.partial, event.contentIndex, repairedArgs);
							repairToolCallArgumentsInMessage(event.message, event.contentIndex, repairedArgs);
						}
						partialJsonByIndex.delete(event.contentIndex);
						hadPreexistingArgsByIndex.delete(event.contentIndex);
						disabledIndices.delete(event.contentIndex);
						loggedRepairIndices.delete(event.contentIndex);
					}
				}
				return result;
			},
			async return(value) {
				return iterator.return?.(value) ?? {
					done: true,
					value: void 0
				};
			},
			async throw(error) {
				return iterator.throw?.(error) ?? {
					done: true,
					value: void 0
				};
			}
		};
	};
	return stream;
}
function wrapStreamFnRepairMalformedToolCallArguments(baseFn) {
	return (model, context, options) => {
		const maybeStream = baseFn(model, context, options);
		if (maybeStream && typeof maybeStream === "object" && "then" in maybeStream) return Promise.resolve(maybeStream).then((stream) => wrapStreamRepairMalformedToolCallArguments(stream));
		return wrapStreamRepairMalformedToolCallArguments(maybeStream);
	};
}
function shouldRepairMalformedAnthropicToolCallArguments(provider) {
	return normalizeProviderId(provider ?? "") === "kimi";
}
function wrapStreamFnDecodeXaiToolCallArguments(baseFn) {
	return createHtmlEntityToolCallArgumentDecodingWrapper(baseFn);
}
//#endregion
//#region src/agents/pi-embedded-runner/run/attempt.tool-call-normalization.ts
function resolveCaseInsensitiveAllowedToolName(rawName, allowedToolNames) {
	if (!allowedToolNames || allowedToolNames.size === 0) return null;
	const folded = normalizeLowercaseStringOrEmpty(rawName);
	let caseInsensitiveMatch = null;
	for (const name of allowedToolNames) {
		if (normalizeLowercaseStringOrEmpty(name) !== folded) continue;
		if (caseInsensitiveMatch && caseInsensitiveMatch !== name) return null;
		caseInsensitiveMatch = name;
	}
	return caseInsensitiveMatch;
}
function resolveExactAllowedToolName(rawName, allowedToolNames) {
	if (!allowedToolNames || allowedToolNames.size === 0) return null;
	if (allowedToolNames.has(rawName)) return rawName;
	const normalized = normalizeToolName(rawName);
	if (allowedToolNames.has(normalized)) return normalized;
	return resolveCaseInsensitiveAllowedToolName(rawName, allowedToolNames) ?? resolveCaseInsensitiveAllowedToolName(normalized, allowedToolNames);
}
function buildStructuredToolNameCandidates(rawName) {
	const trimmed = rawName.trim();
	if (!trimmed) return [];
	const candidates = [];
	const seen = /* @__PURE__ */ new Set();
	const addCandidate = (value) => {
		const candidate = value.trim();
		if (!candidate || seen.has(candidate)) return;
		seen.add(candidate);
		candidates.push(candidate);
	};
	addCandidate(trimmed);
	addCandidate(normalizeToolName(trimmed));
	const normalizedDelimiter = trimmed.replace(/\//g, ".");
	addCandidate(normalizedDelimiter);
	addCandidate(normalizeToolName(normalizedDelimiter));
	const segments = normalizedDelimiter.split(".").map((segment) => segment.trim()).filter(Boolean);
	if (segments.length > 1) for (let index = 1; index < segments.length; index += 1) {
		const suffix = segments.slice(index).join(".");
		addCandidate(suffix);
		addCandidate(normalizeToolName(suffix));
	}
	return candidates;
}
function resolveStructuredAllowedToolName(rawName, allowedToolNames) {
	if (!allowedToolNames || allowedToolNames.size === 0) return null;
	const candidateNames = buildStructuredToolNameCandidates(rawName);
	for (const candidate of candidateNames) if (allowedToolNames.has(candidate)) return candidate;
	for (const candidate of candidateNames) {
		const caseInsensitiveMatch = resolveCaseInsensitiveAllowedToolName(candidate, allowedToolNames);
		if (caseInsensitiveMatch) return caseInsensitiveMatch;
	}
	return null;
}
function inferToolNameFromToolCallId(rawId, allowedToolNames) {
	if (!rawId || !allowedToolNames || allowedToolNames.size === 0) return null;
	const id = rawId.trim();
	if (!id) return null;
	const candidateTokens = /* @__PURE__ */ new Set();
	const addToken = (value) => {
		const trimmed = value.trim();
		if (!trimmed) return;
		candidateTokens.add(trimmed);
		candidateTokens.add(trimmed.replace(/[:._/-]\d+$/, ""));
		candidateTokens.add(trimmed.replace(/\d+$/, ""));
		const normalizedDelimiter = trimmed.replace(/\//g, ".");
		candidateTokens.add(normalizedDelimiter);
		candidateTokens.add(normalizedDelimiter.replace(/[:._-]\d+$/, ""));
		candidateTokens.add(normalizedDelimiter.replace(/\d+$/, ""));
		for (const prefixPattern of [/^functions?[._-]?/i, /^tools?[._-]?/i]) {
			const stripped = normalizedDelimiter.replace(prefixPattern, "");
			if (stripped !== normalizedDelimiter) {
				candidateTokens.add(stripped);
				candidateTokens.add(stripped.replace(/[:._-]\d+$/, ""));
				candidateTokens.add(stripped.replace(/\d+$/, ""));
			}
		}
	};
	const preColon = id.split(":")[0] ?? id;
	for (const seed of [id, preColon]) addToken(seed);
	let singleMatch = null;
	for (const candidate of candidateTokens) {
		const matched = resolveStructuredAllowedToolName(candidate, allowedToolNames);
		if (!matched) continue;
		if (singleMatch && singleMatch !== matched) return null;
		singleMatch = matched;
	}
	return singleMatch;
}
function looksLikeMalformedToolNameCounter(rawName) {
	const normalizedDelimiter = rawName.trim().replace(/\//g, ".");
	return /^(?:functions?|tools?)[._-]?/i.test(normalizedDelimiter) && /(?:[:._-]\d+|\d+)$/.test(normalizedDelimiter);
}
function normalizeToolCallNameForDispatch(rawName, allowedToolNames, rawToolCallId) {
	const trimmed = rawName.trim();
	if (!trimmed) return inferToolNameFromToolCallId(rawToolCallId, allowedToolNames) ?? rawName;
	if (!allowedToolNames || allowedToolNames.size === 0) return trimmed;
	const exact = resolveExactAllowedToolName(trimmed, allowedToolNames);
	if (exact) return exact;
	const inferredFromName = inferToolNameFromToolCallId(trimmed, allowedToolNames);
	if (inferredFromName) return inferredFromName;
	if (looksLikeMalformedToolNameCounter(trimmed)) return trimmed;
	return resolveStructuredAllowedToolName(trimmed, allowedToolNames) ?? trimmed;
}
function isToolCallBlockType(type) {
	return type === "toolCall" || type === "toolUse" || type === "functionCall";
}
const REPLAY_TOOL_CALL_NAME_MAX_CHARS = 64;
function isThinkingLikeReplayBlock(block) {
	if (!block || typeof block !== "object") return false;
	const type = block.type;
	return type === "thinking" || type === "redacted_thinking";
}
function hasUnredactedSessionsSpawnAttachments(block) {
	if (normalizeLowercaseStringOrEmpty(typeof block.name === "string" ? block.name.trim() : "") !== "sessions_spawn") return false;
	for (const payload of [block.arguments, block.input]) {
		if (!payload || typeof payload !== "object") continue;
		const attachments = payload.attachments;
		if (!Array.isArray(attachments)) continue;
		for (const attachment of attachments) if (!isRedactedSessionsSpawnAttachment(attachment)) return true;
	}
	return false;
}
function isReplaySafeThinkingTurn(content, allowedToolNames) {
	const seenToolCallIds = /* @__PURE__ */ new Set();
	for (const block of content) {
		if (!isReplayToolCallBlock(block)) continue;
		const replayBlock = block;
		const toolCallId = typeof replayBlock.id === "string" ? replayBlock.id.trim() : "";
		if (!replayToolCallHasInput(replayBlock) || !toolCallId || seenToolCallIds.has(toolCallId) || hasUnredactedSessionsSpawnAttachments(replayBlock)) return false;
		seenToolCallIds.add(toolCallId);
		const resolvedName = resolveReplayToolCallName(typeof replayBlock.name === "string" ? replayBlock.name : "", toolCallId, allowedToolNames);
		if (!resolvedName || replayBlock.name !== resolvedName) return false;
	}
	return true;
}
function isReplayToolCallBlock(block) {
	if (!block || typeof block !== "object") return false;
	return isToolCallBlockType(block.type);
}
function replayToolCallHasInput(block) {
	const hasInput = "input" in block ? block.input !== void 0 && block.input !== null : false;
	const hasArguments = "arguments" in block ? block.arguments !== void 0 && block.arguments !== null : false;
	return hasInput || hasArguments;
}
function replayToolCallNonEmptyString(value) {
	return typeof value === "string" && value.trim().length > 0;
}
function resolveReplayToolCallName(rawName, rawId, allowedToolNames) {
	if (rawName.length > REPLAY_TOOL_CALL_NAME_MAX_CHARS * 2) return null;
	const trimmed = normalizeToolCallNameForDispatch(rawName, allowedToolNames, rawId).trim();
	if (!trimmed || trimmed.length > REPLAY_TOOL_CALL_NAME_MAX_CHARS || /\s/.test(trimmed)) return null;
	if (!allowedToolNames || allowedToolNames.size === 0) return trimmed;
	return resolveExactAllowedToolName(trimmed, allowedToolNames);
}
function sanitizeReplayToolCallInputs(messages, allowedToolNames, allowProviderOwnedThinkingReplay) {
	let changed = false;
	let droppedAssistantMessages = 0;
	const out = [];
	const claimedReplaySafeToolCallIds = /* @__PURE__ */ new Set();
	for (const message of messages) {
		if (!message || typeof message !== "object" || message.role !== "assistant") {
			out.push(message);
			continue;
		}
		if (!Array.isArray(message.content)) {
			out.push(message);
			continue;
		}
		if (allowProviderOwnedThinkingReplay && message.content.some((block) => isThinkingLikeReplayBlock(block)) && message.content.some((block) => isReplayToolCallBlock(block))) {
			const replaySafeToolCalls = extractToolCallsFromAssistant(message);
			if (isReplaySafeThinkingTurn(message.content, allowedToolNames) && replaySafeToolCalls.every((toolCall) => !claimedReplaySafeToolCallIds.has(toolCall.id))) {
				for (const toolCall of replaySafeToolCalls) claimedReplaySafeToolCallIds.add(toolCall.id);
				out.push(message);
			} else {
				changed = true;
				droppedAssistantMessages += 1;
			}
			continue;
		}
		const nextContent = [];
		let messageChanged = false;
		for (const block of message.content) {
			if (!isReplayToolCallBlock(block)) {
				nextContent.push(block);
				continue;
			}
			const replayBlock = block;
			if (!replayToolCallHasInput(replayBlock) || !replayToolCallNonEmptyString(replayBlock.id)) {
				changed = true;
				messageChanged = true;
				continue;
			}
			const resolvedName = resolveReplayToolCallName(typeof replayBlock.name === "string" ? replayBlock.name : "", replayBlock.id, allowedToolNames);
			if (!resolvedName) {
				changed = true;
				messageChanged = true;
				continue;
			}
			if (replayBlock.name !== resolvedName) {
				nextContent.push({
					...block,
					name: resolvedName
				});
				changed = true;
				messageChanged = true;
				continue;
			}
			nextContent.push(block);
		}
		if (messageChanged) {
			changed = true;
			if (nextContent.length > 0) out.push({
				...message,
				content: nextContent
			});
			else droppedAssistantMessages += 1;
			continue;
		}
		out.push(message);
	}
	return {
		messages: changed ? out : messages,
		droppedAssistantMessages
	};
}
function extractAnthropicReplayToolResultIds(block) {
	const ids = [];
	for (const value of [
		block.toolUseId,
		block.toolCallId,
		block.tool_use_id,
		block.tool_call_id
	]) {
		if (typeof value !== "string") continue;
		const trimmed = value.trim();
		if (!trimmed || ids.includes(trimmed)) continue;
		ids.push(trimmed);
	}
	return ids;
}
function isSignedThinkingReplayAssistantSpan(message) {
	if (!message || typeof message !== "object" || message.role !== "assistant") return false;
	const content = message.content;
	if (!Array.isArray(content)) return false;
	return content.some((block) => isThinkingLikeReplayBlock(block)) && content.some((block) => isReplayToolCallBlock(block));
}
function sanitizeAnthropicReplayToolResults(messages, options) {
	let changed = false;
	const out = [];
	const disallowEmbeddedUserToolResultsForSignedThinkingReplay = options?.disallowEmbeddedUserToolResultsForSignedThinkingReplay === true;
	for (let index = 0; index < messages.length; index += 1) {
		const message = messages[index];
		if (!message || typeof message !== "object" || message.role !== "user") {
			out.push(message);
			continue;
		}
		if (!Array.isArray(message.content)) {
			out.push(message);
			continue;
		}
		const previous = messages[index - 1];
		const shouldStripEmbeddedToolResults = disallowEmbeddedUserToolResultsForSignedThinkingReplay && isSignedThinkingReplayAssistantSpan(previous);
		const validToolUseIds = /* @__PURE__ */ new Set();
		if (previous && typeof previous === "object" && previous.role === "assistant") {
			const previousContent = previous.content;
			if (Array.isArray(previousContent)) for (const block of previousContent) {
				if (!block || typeof block !== "object") continue;
				const typedBlock = block;
				if (!isToolCallBlockType(typedBlock.type) || typeof typedBlock.id !== "string") continue;
				const trimmedId = typedBlock.id.trim();
				if (trimmedId) validToolUseIds.add(trimmedId);
			}
		}
		const nextContent = message.content.filter((block) => {
			if (!block || typeof block !== "object") return true;
			const typedBlock = block;
			if (typedBlock.type !== "toolResult" && typedBlock.type !== "tool") return true;
			if (shouldStripEmbeddedToolResults) {
				changed = true;
				return false;
			}
			const resultIds = extractAnthropicReplayToolResultIds(typedBlock);
			if (resultIds.length === 0) {
				changed = true;
				return false;
			}
			return validToolUseIds.size > 0 && resultIds.some((id) => validToolUseIds.has(id));
		});
		if (nextContent.length === message.content.length) {
			out.push(message);
			continue;
		}
		changed = true;
		if (nextContent.length > 0) {
			out.push({
				...message,
				content: nextContent
			});
			continue;
		}
		out.push({
			...message,
			content: [{
				type: "text",
				text: "[tool results omitted]"
			}]
		});
	}
	return changed ? out : messages;
}
function normalizeToolCallIdsInMessage(message) {
	if (!message || typeof message !== "object") return;
	const content = message.content;
	if (!Array.isArray(content)) return;
	const usedIds = /* @__PURE__ */ new Set();
	for (const block of content) {
		if (!block || typeof block !== "object") continue;
		const typedBlock = block;
		if (!isToolCallBlockType(typedBlock.type) || typeof typedBlock.id !== "string") continue;
		const trimmedId = typedBlock.id.trim();
		if (!trimmedId) continue;
		usedIds.add(trimmedId);
	}
	let fallbackIndex = 1;
	const assignedIds = /* @__PURE__ */ new Set();
	for (const block of content) {
		if (!block || typeof block !== "object") continue;
		const typedBlock = block;
		if (!isToolCallBlockType(typedBlock.type)) continue;
		if (typeof typedBlock.id === "string") {
			const trimmedId = typedBlock.id.trim();
			if (trimmedId) {
				if (!assignedIds.has(trimmedId)) {
					if (typedBlock.id !== trimmedId) typedBlock.id = trimmedId;
					assignedIds.add(trimmedId);
					continue;
				}
			}
		}
		let fallbackId = "";
		while (!fallbackId || usedIds.has(fallbackId) || assignedIds.has(fallbackId)) fallbackId = `call_auto_${fallbackIndex++}`;
		typedBlock.id = fallbackId;
		usedIds.add(fallbackId);
		assignedIds.add(fallbackId);
	}
}
function trimWhitespaceFromToolCallNamesInMessage(message, allowedToolNames) {
	if (!message || typeof message !== "object") return;
	const content = message.content;
	if (!Array.isArray(content)) return;
	for (const block of content) {
		if (!block || typeof block !== "object") continue;
		const typedBlock = block;
		if (!isToolCallBlockType(typedBlock.type)) continue;
		const rawId = typeof typedBlock.id === "string" ? typedBlock.id : void 0;
		if (typeof typedBlock.name === "string") {
			const normalized = normalizeToolCallNameForDispatch(typedBlock.name, allowedToolNames, rawId);
			if (normalized !== typedBlock.name) typedBlock.name = normalized;
			continue;
		}
		const inferred = inferToolNameFromToolCallId(rawId, allowedToolNames);
		if (inferred) typedBlock.name = inferred;
	}
	normalizeToolCallIdsInMessage(message);
}
function classifyToolCallMessage(message, allowedToolNames) {
	if (!message || typeof message !== "object" || !allowedToolNames || allowedToolNames.size === 0) return { kind: "none" };
	const content = message.content;
	if (!Array.isArray(content)) return { kind: "none" };
	let unknownToolName;
	let sawToolCall = false;
	let sawAllowedToolCall = false;
	let sawIncompleteToolCall = false;
	for (const block of content) {
		if (!block || typeof block !== "object") continue;
		const typedBlock = block;
		if (!isToolCallBlockType(typedBlock.type)) continue;
		sawToolCall = true;
		const rawName = typeof typedBlock.name === "string" ? typedBlock.name.trim() : "";
		if (!rawName) {
			sawIncompleteToolCall = true;
			continue;
		}
		if (resolveExactAllowedToolName(rawName, allowedToolNames)) {
			sawAllowedToolCall = true;
			continue;
		}
		const normalizedUnknownToolName = normalizeToolName(rawName);
		if (!unknownToolName) {
			unknownToolName = normalizedUnknownToolName;
			continue;
		}
		if (unknownToolName !== normalizedUnknownToolName) sawIncompleteToolCall = true;
	}
	if (!sawToolCall) return { kind: "none" };
	if (sawAllowedToolCall) return { kind: "allowed" };
	if (sawIncompleteToolCall) return { kind: "incomplete" };
	return unknownToolName ? {
		kind: "unknown",
		toolName: unknownToolName
	} : { kind: "incomplete" };
}
function rewriteUnknownToolLoopMessage(message, toolName) {
	if (!message || typeof message !== "object") return;
	message.content = [{
		type: "text",
		text: `I can't use the tool "${toolName}" here because it isn't available. I need to stop retrying it and answer without that tool.`
	}];
}
function guardUnknownToolLoopInMessage(message, state, params) {
	const threshold = params.threshold;
	if (threshold === void 0 || threshold <= 0) return false;
	const toolCallState = classifyToolCallMessage(message, params.allowedToolNames);
	if (toolCallState.kind === "allowed") {
		if (params.resetOnAllowedTool === true) {
			state.lastUnknownToolName = void 0;
			state.count = 0;
		}
		return false;
	}
	if (toolCallState.kind !== "unknown") {
		if (params.countAttempt && params.resetOnMissingUnknownTool !== false) {
			state.lastUnknownToolName = void 0;
			state.count = 0;
		}
		return false;
	}
	const unknownToolName = toolCallState.toolName;
	if (!params.countAttempt) {
		if (state.lastUnknownToolName === unknownToolName && state.count > threshold) rewriteUnknownToolLoopMessage(message, unknownToolName);
		return false;
	}
	if (message && typeof message === "object") {
		if (state.countedMessages.has(message)) {
			if (state.lastUnknownToolName === unknownToolName && state.count > threshold) rewriteUnknownToolLoopMessage(message, unknownToolName);
			return true;
		}
		state.countedMessages.add(message);
	}
	if (state.lastUnknownToolName === unknownToolName) state.count += 1;
	else {
		state.lastUnknownToolName = unknownToolName;
		state.count = 1;
	}
	if (state.count > threshold) rewriteUnknownToolLoopMessage(message, unknownToolName);
	return true;
}
function wrapStreamTrimToolCallNames(stream, allowedToolNames, options) {
	const unknownToolGuardState = options?.state ?? {
		count: 0,
		countedMessages: /* @__PURE__ */ new WeakSet()
	};
	let streamAttemptAlreadyCounted = false;
	const originalResult = stream.result.bind(stream);
	stream.result = async () => {
		const message = await originalResult();
		trimWhitespaceFromToolCallNamesInMessage(message, allowedToolNames);
		guardUnknownToolLoopInMessage(message, unknownToolGuardState, {
			allowedToolNames,
			threshold: options?.unknownToolThreshold,
			countAttempt: !streamAttemptAlreadyCounted,
			resetOnAllowedTool: true
		});
		return message;
	};
	const originalAsyncIterator = stream[Symbol.asyncIterator].bind(stream);
	stream[Symbol.asyncIterator] = function() {
		const iterator = originalAsyncIterator();
		return {
			async next() {
				const result = await iterator.next();
				if (!result.done && result.value && typeof result.value === "object") {
					const event = result.value;
					trimWhitespaceFromToolCallNamesInMessage(event.partial, allowedToolNames);
					trimWhitespaceFromToolCallNamesInMessage(event.message, allowedToolNames);
					if (event.message && typeof event.message === "object") {
						const countedStreamAttempt = guardUnknownToolLoopInMessage(event.message, unknownToolGuardState, {
							allowedToolNames,
							threshold: options?.unknownToolThreshold,
							countAttempt: !streamAttemptAlreadyCounted,
							resetOnAllowedTool: true,
							resetOnMissingUnknownTool: false
						});
						streamAttemptAlreadyCounted ||= countedStreamAttempt;
					}
					guardUnknownToolLoopInMessage(event.partial, unknownToolGuardState, {
						allowedToolNames,
						threshold: options?.unknownToolThreshold,
						countAttempt: false
					});
				}
				return result;
			},
			async return(value) {
				return iterator.return?.(value) ?? {
					done: true,
					value: void 0
				};
			},
			async throw(error) {
				return iterator.throw?.(error) ?? {
					done: true,
					value: void 0
				};
			}
		};
	};
	return stream;
}
function wrapStreamFnTrimToolCallNames(baseFn, allowedToolNames, guardOptions) {
	const unknownToolGuardState = {
		count: 0,
		countedMessages: /* @__PURE__ */ new WeakSet()
	};
	return (model, context, streamOptions) => {
		const maybeStream = baseFn(model, context, streamOptions);
		if (maybeStream && typeof maybeStream === "object" && "then" in maybeStream) return Promise.resolve(maybeStream).then((stream) => wrapStreamTrimToolCallNames(stream, allowedToolNames, {
			unknownToolThreshold: guardOptions?.unknownToolThreshold,
			state: unknownToolGuardState
		}));
		return wrapStreamTrimToolCallNames(maybeStream, allowedToolNames, {
			unknownToolThreshold: guardOptions?.unknownToolThreshold,
			state: unknownToolGuardState
		});
	};
}
function sanitizeReplayToolCallIdsForStream(params) {
	const sanitized = sanitizeToolCallIdsForCloudCodeAssist(params.messages, params.mode, {
		preserveNativeAnthropicToolUseIds: params.preserveNativeAnthropicToolUseIds,
		preserveReplaySafeThinkingToolCallIds: params.preserveReplaySafeThinkingToolCallIds,
		allowedToolNames: params.allowedToolNames
	});
	if (!params.repairToolUseResultPairing) return sanitized;
	return sanitizeToolUseResultPairing(sanitized);
}
function wrapStreamFnSanitizeMalformedToolCalls(baseFn, allowedToolNames, transcriptPolicy) {
	return (model, context, options) => {
		const messages = context?.messages;
		if (!Array.isArray(messages)) return baseFn(model, context, options);
		const allowProviderOwnedThinkingReplay = shouldAllowProviderOwnedThinkingReplay({
			modelApi: model?.api,
			policy: {
				validateAnthropicTurns: transcriptPolicy?.validateAnthropicTurns === true,
				preserveSignatures: transcriptPolicy?.preserveSignatures === true,
				dropThinkingBlocks: transcriptPolicy?.dropThinkingBlocks === true
			}
		});
		const sanitized = sanitizeReplayToolCallInputs(messages, allowedToolNames, allowProviderOwnedThinkingReplay);
		let nextMessages = sanitized.messages !== messages ? sanitizeToolUseResultPairing(sanitized.messages) : sanitized.messages;
		if (transcriptPolicy?.validateAnthropicTurns) nextMessages = sanitizeAnthropicReplayToolResults(nextMessages, { disallowEmbeddedUserToolResultsForSignedThinkingReplay: allowProviderOwnedThinkingReplay });
		if (nextMessages === messages) return baseFn(model, context, options);
		if (sanitized.droppedAssistantMessages > 0 || transcriptPolicy?.validateAnthropicTurns) {
			if (transcriptPolicy?.validateGeminiTurns) nextMessages = validateGeminiTurns(nextMessages);
			if (transcriptPolicy?.validateAnthropicTurns) nextMessages = validateAnthropicTurns(nextMessages);
		}
		return baseFn(model, {
			...context,
			messages: nextMessages
		}, options);
	};
}
//#endregion
//#region src/agents/pi-embedded-runner/run/compaction-retry-aggregate-timeout.ts
/**
* Wait for compaction retry completion with an aggregate timeout to avoid
* holding a session lane indefinitely when retry resolution is lost.
*/
async function waitForCompactionRetryWithAggregateTimeout(params) {
	const timeoutMsRaw = params.aggregateTimeoutMs;
	const timeoutMs = Number.isFinite(timeoutMsRaw) ? Math.max(1, Math.floor(timeoutMsRaw)) : 1;
	let timedOut = false;
	const waitPromise = params.waitForCompactionRetry().then(() => ({ kind: "done" }), (error) => ({
		kind: "rejected",
		error
	}));
	while (true) {
		let timer;
		try {
			const result = await params.abortable(Promise.race([waitPromise, new Promise((resolve) => {
				timer = setTimeout(() => resolve("timeout"), timeoutMs);
			})]));
			if (result !== "timeout") {
				if (result.kind === "done") break;
				throw result.error;
			}
			if (params.isCompactionStillInFlight?.()) continue;
			timedOut = true;
			params.onTimeout?.();
			break;
		} finally {
			if (timer !== void 0) clearTimeout(timer);
		}
	}
	return { timedOut };
}
//#endregion
//#region src/agents/pi-embedded-runner/run/compaction-timeout.ts
function shouldFlagCompactionTimeout(signal) {
	if (!signal.isTimeout) return false;
	return signal.isCompactionPendingOrRetrying || signal.isCompactionInFlight;
}
function resolveRunTimeoutDuringCompaction(params) {
	if (!params.isCompactionPendingOrRetrying && !params.isCompactionInFlight) return "abort";
	return params.graceAlreadyUsed ? "abort" : "extend";
}
function resolveRunTimeoutWithCompactionGraceMs(params) {
	return params.runTimeoutMs + params.compactionTimeoutMs;
}
function selectCompactionTimeoutSnapshot(params) {
	if (!params.timedOutDuringCompaction) return {
		messagesSnapshot: params.currentSnapshot,
		sessionIdUsed: params.currentSessionId,
		source: "current"
	};
	if (params.preCompactionSnapshot) return {
		messagesSnapshot: params.preCompactionSnapshot,
		sessionIdUsed: params.preCompactionSessionId,
		source: "pre-compaction"
	};
	return {
		messagesSnapshot: params.currentSnapshot,
		sessionIdUsed: params.currentSessionId,
		source: "current"
	};
}
//#endregion
//#region src/agents/pi-embedded-runner/run/history-image-prune.ts
const PRUNED_HISTORY_IMAGE_MARKER = "[image data removed - already processed by model]";
/**
* Number of most-recent completed turns whose preceding user/toolResult image
* blocks are kept intact. Counts all completed turns, not just image-bearing
* ones, so text-only turns consume the window.
*/
const PRESERVE_RECENT_COMPLETED_TURNS = 3;
function resolvePruneBeforeIndex(messages) {
	const completedTurnStarts = [];
	let currentTurnStart = -1;
	let currentTurnHasAssistantReply = false;
	for (let i = 0; i < messages.length; i++) {
		const role = messages[i]?.role;
		if (role === "user") {
			if (currentTurnStart >= 0 && currentTurnHasAssistantReply) completedTurnStarts.push(currentTurnStart);
			currentTurnStart = i;
			currentTurnHasAssistantReply = false;
			continue;
		}
		if (role === "toolResult") {
			if (currentTurnStart < 0) currentTurnStart = i;
			continue;
		}
		if (role === "assistant" && currentTurnStart >= 0) currentTurnHasAssistantReply = true;
	}
	if (currentTurnStart >= 0 && currentTurnHasAssistantReply) completedTurnStarts.push(currentTurnStart);
	if (completedTurnStarts.length <= PRESERVE_RECENT_COMPLETED_TURNS) return -1;
	return completedTurnStarts[completedTurnStarts.length - PRESERVE_RECENT_COMPLETED_TURNS];
}
/**
* Idempotent cleanup: prune persisted image blocks from completed turns older
* than {@link PRESERVE_RECENT_COMPLETED_TURNS}. The delay also reduces
* prompt-cache churn, though prefix stability additionally depends on the
* replay sanitizer being idempotent.
*/
function pruneProcessedHistoryImages(messages) {
	const pruneBeforeIndex = resolvePruneBeforeIndex(messages);
	if (pruneBeforeIndex < 0) return false;
	let didMutate = false;
	for (let i = 0; i < pruneBeforeIndex; i++) {
		const message = messages[i];
		if (!message || message.role !== "user" && message.role !== "toolResult" || !Array.isArray(message.content)) continue;
		for (let j = 0; j < message.content.length; j++) {
			const block = message.content[j];
			if (!block || typeof block !== "object") continue;
			if (block.type !== "image") continue;
			message.content[j] = {
				type: "text",
				text: PRUNED_HISTORY_IMAGE_MARKER
			};
			didMutate = true;
		}
	}
	return didMutate;
}
//#endregion
//#region src/agents/pi-embedded-runner/run/llm-idle-timeout.ts
/**
* Default idle timeout for LLM streaming responses in milliseconds.
*/
const DEFAULT_LLM_IDLE_TIMEOUT_MS = 120 * 1e3;
/**
* Maximum safe timeout value (approximately 24.8 days).
*/
const MAX_SAFE_TIMEOUT_MS$1 = 2147e6;
/**
* Resolves the LLM idle timeout from configuration.
* @returns Idle timeout in milliseconds, or 0 to disable
*/
function resolveLlmIdleTimeoutMs(params) {
	const clampTimeoutMs = (valueMs) => Math.min(Math.floor(valueMs), MAX_SAFE_TIMEOUT_MS$1);
	const raw = params?.cfg?.agents?.defaults?.llm?.idleTimeoutSeconds;
	if (raw === 0) return 0;
	if (typeof raw === "number" && Number.isFinite(raw) && raw > 0) return clampTimeoutMs(raw * 1e3);
	const runTimeoutMs = params?.runTimeoutMs;
	if (typeof runTimeoutMs === "number" && Number.isFinite(runTimeoutMs) && runTimeoutMs > 0) {
		if (runTimeoutMs >= MAX_SAFE_TIMEOUT_MS$1) return 0;
		return clampTimeoutMs(runTimeoutMs);
	}
	const agentTimeoutSeconds = params?.cfg?.agents?.defaults?.timeoutSeconds;
	if (typeof agentTimeoutSeconds === "number" && Number.isFinite(agentTimeoutSeconds) && agentTimeoutSeconds > 0) return clampTimeoutMs(agentTimeoutSeconds * 1e3);
	if (params?.trigger === "cron") return 0;
	return DEFAULT_LLM_IDLE_TIMEOUT_MS;
}
/**
* Wraps a stream function with idle timeout detection.
* If no token is received within the specified timeout, the request is aborted.
*
* @param baseFn - The base stream function to wrap
* @param timeoutMs - Idle timeout in milliseconds
* @param onIdleTimeout - Optional callback invoked when idle timeout triggers
* @returns A wrapped stream function with idle timeout detection
*/
function streamWithIdleTimeout(baseFn, timeoutMs, onIdleTimeout) {
	return (model, context, options) => {
		const maybeStream = baseFn(model, context, options);
		const wrapStream = (stream) => {
			const originalAsyncIterator = stream[Symbol.asyncIterator].bind(stream);
			stream[Symbol.asyncIterator] = function() {
				const iterator = originalAsyncIterator();
				let idleTimer = null;
				const createTimeoutPromise = () => {
					return new Promise((_, reject) => {
						idleTimer = setTimeout(() => {
							const error = /* @__PURE__ */ new Error(`LLM idle timeout (${Math.floor(timeoutMs / 1e3)}s): no response from model`);
							onIdleTimeout?.(error);
							reject(error);
						}, timeoutMs);
					});
				};
				const clearTimer = () => {
					if (idleTimer) {
						clearTimeout(idleTimer);
						idleTimer = null;
					}
				};
				return {
					async next() {
						clearTimer();
						try {
							const result = await Promise.race([iterator.next(), createTimeoutPromise()]);
							if (result.done) {
								clearTimer();
								return result;
							}
							clearTimer();
							return result;
						} catch (error) {
							clearTimer();
							throw error;
						}
					},
					return() {
						clearTimer();
						return iterator.return?.() ?? Promise.resolve({
							done: true,
							value: void 0
						});
					},
					throw(error) {
						clearTimer();
						return iterator.throw?.(error) ?? Promise.reject(error);
					}
				};
			};
			return stream;
		};
		if (maybeStream && typeof maybeStream === "object" && "then" in maybeStream) return Promise.resolve(maybeStream).then(wrapStream);
		return wrapStream(maybeStream);
	};
}
//#endregion
//#region src/agents/pi-embedded-runner/run/preemptive-compaction.ts
const PREEMPTIVE_OVERFLOW_ERROR_TEXT = "Context overflow: prompt too large for the model (precheck).";
const ESTIMATED_CHARS_PER_TOKEN = 4;
const TRUNCATION_ROUTE_BUFFER_TOKENS = 512;
function estimatePrePromptTokens(params) {
	const { messages, systemPrompt, prompt } = params;
	const syntheticMessages = [];
	if (typeof systemPrompt === "string" && systemPrompt.trim().length > 0) syntheticMessages.push({
		role: "system",
		content: systemPrompt,
		timestamp: 0
	});
	syntheticMessages.push({
		role: "user",
		content: prompt,
		timestamp: 0
	});
	const estimated = estimateMessagesTokens(messages) + syntheticMessages.reduce((sum, message) => sum + estimateTokens(message), 0);
	return Math.max(0, Math.ceil(estimated * SAFETY_MARGIN));
}
function shouldPreemptivelyCompactBeforePrompt(params) {
	const estimatedPromptTokens = estimatePrePromptTokens(params);
	const contextTokenBudget = Math.max(1, Math.floor(params.contextTokenBudget));
	const requestedReserveTokens = Math.max(0, Math.floor(params.reserveTokens));
	const minPromptBudget = Math.min(MIN_PROMPT_BUDGET_TOKENS, Math.max(1, Math.floor(contextTokenBudget * MIN_PROMPT_BUDGET_RATIO)));
	const effectiveReserveTokens = Math.min(requestedReserveTokens, Math.max(0, contextTokenBudget - minPromptBudget));
	const promptBudgetBeforeReserve = Math.max(1, contextTokenBudget - effectiveReserveTokens);
	const overflowTokens = Math.max(0, estimatedPromptTokens - promptBudgetBeforeReserve);
	const toolResultPotential = estimateToolResultReductionPotential({
		messages: params.messages,
		contextWindowTokens: params.contextTokenBudget,
		maxCharsOverride: params.toolResultMaxChars
	});
	const overflowChars = overflowTokens * ESTIMATED_CHARS_PER_TOKEN;
	const truncationBufferChars = TRUNCATION_ROUTE_BUFFER_TOKENS * ESTIMATED_CHARS_PER_TOKEN;
	const truncateOnlyThresholdChars = Math.max(overflowChars + truncationBufferChars, Math.ceil(overflowChars * 1.5));
	const toolResultReducibleChars = toolResultPotential.maxReducibleChars;
	let route = "fits";
	if (overflowTokens > 0) if (toolResultReducibleChars <= 0) route = "compact_only";
	else if (toolResultReducibleChars >= truncateOnlyThresholdChars) route = "truncate_tool_results_only";
	else route = "compact_then_truncate";
	return {
		route,
		shouldCompact: route === "compact_only" || route === "compact_then_truncate",
		estimatedPromptTokens,
		promptBudgetBeforeReserve,
		overflowTokens,
		toolResultReducibleChars,
		effectiveReserveTokens
	};
}
//#endregion
//#region src/agents/pi-embedded-runner/run/attempt.ts
const MAX_BTW_SNAPSHOT_MESSAGES = 100;
function resolveUnknownToolGuardThreshold(loopDetection) {
	const raw = loopDetection?.unknownToolThreshold;
	if (typeof raw === "number" && Number.isFinite(raw) && raw > 0) return Math.floor(raw);
	return 10;
}
function summarizeMessagePayload(msg) {
	const content = msg.content;
	if (typeof content === "string") return {
		textChars: content.length,
		imageBlocks: 0
	};
	if (!Array.isArray(content)) return {
		textChars: 0,
		imageBlocks: 0
	};
	let textChars = 0;
	let imageBlocks = 0;
	for (const block of content) {
		if (!block || typeof block !== "object") continue;
		const typedBlock = block;
		if (typedBlock.type === "image") {
			imageBlocks++;
			continue;
		}
		if (typeof typedBlock.text === "string") textChars += typedBlock.text.length;
	}
	return {
		textChars,
		imageBlocks
	};
}
function summarizeSessionContext(messages) {
	const roleCounts = /* @__PURE__ */ new Map();
	let totalTextChars = 0;
	let totalImageBlocks = 0;
	let maxMessageTextChars = 0;
	for (const msg of messages) {
		const role = typeof msg.role === "string" ? msg.role : "unknown";
		roleCounts.set(role, (roleCounts.get(role) ?? 0) + 1);
		const payload = summarizeMessagePayload(msg);
		totalTextChars += payload.textChars;
		totalImageBlocks += payload.imageBlocks;
		if (payload.textChars > maxMessageTextChars) maxMessageTextChars = payload.textChars;
	}
	return {
		roleCounts: [...roleCounts.entries()].toSorted((a, b) => a[0].localeCompare(b[0])).map(([role, count]) => `${role}:${count}`).join(",") || "none",
		totalTextChars,
		totalImageBlocks,
		maxMessageTextChars
	};
}
async function runEmbeddedAttempt(params) {
	const resolvedWorkspace = resolveUserPath(params.workspaceDir);
	const runAbortController = new AbortController();
	ensureGlobalUndiciEnvProxyDispatcher();
	ensureGlobalUndiciStreamTimeouts({ timeoutMs: params.timeoutMs });
	log$3.debug(`embedded run start: runId=${params.runId} sessionId=${params.sessionId} provider=${params.provider} model=${params.modelId} thinking=${params.thinkLevel} messageChannel=${params.messageChannel ?? params.messageProvider ?? "unknown"}`);
	await fs$1.mkdir(resolvedWorkspace, { recursive: true });
	const sandboxSessionKey = params.sessionKey?.trim() || params.sessionId;
	const sandbox = await resolveSandboxContext({
		config: params.config,
		sessionKey: sandboxSessionKey,
		workspaceDir: resolvedWorkspace
	});
	const effectiveWorkspace = sandbox?.enabled ? sandbox.workspaceAccess === "rw" ? resolvedWorkspace : sandbox.workspaceDir : resolvedWorkspace;
	await fs$1.mkdir(effectiveWorkspace, { recursive: true });
	const { sessionAgentId } = resolveSessionAgentIds({
		sessionKey: params.sessionKey,
		config: params.config,
		agentId: params.agentId
	});
	let restoreSkillEnv;
	try {
		const { shouldLoadSkillEntries, skillEntries } = resolveEmbeddedRunSkillEntries({
			workspaceDir: effectiveWorkspace,
			config: params.config,
			agentId: sessionAgentId,
			skillsSnapshot: params.skillsSnapshot
		});
		restoreSkillEnv = params.skillsSnapshot ? applySkillEnvOverridesFromSnapshot({
			snapshot: params.skillsSnapshot,
			config: params.config
		}) : applySkillEnvOverrides({
			skills: skillEntries ?? [],
			config: params.config
		});
		const skillsPrompt = resolveSkillsPromptForRun({
			skillsSnapshot: params.skillsSnapshot,
			entries: shouldLoadSkillEntries ? skillEntries : void 0,
			config: params.config,
			workspaceDir: effectiveWorkspace,
			agentId: sessionAgentId
		});
		const sessionLock = await acquireSessionWriteLock({
			sessionFile: params.sessionFile,
			maxHoldMs: resolveSessionLockMaxHoldFromTimeout({ timeoutMs: resolveRunTimeoutWithCompactionGraceMs({
				runTimeoutMs: params.timeoutMs,
				compactionTimeoutMs: resolveCompactionTimeoutMs(params.config)
			}) })
		});
		const sessionLabel = params.sessionKey ?? params.sessionId;
		const { bootstrapFiles: hookAdjustedBootstrapFiles, contextFiles, shouldRecordCompletedBootstrapTurn } = await resolveAttemptBootstrapContext({
			contextInjectionMode: resolveContextInjectionMode(params.config),
			bootstrapContextMode: params.bootstrapContextMode,
			bootstrapContextRunKind: params.bootstrapContextRunKind,
			sessionFile: params.sessionFile,
			hasCompletedBootstrapTurn,
			resolveBootstrapContextForRun: async () => await resolveBootstrapContextForRun({
				workspaceDir: effectiveWorkspace,
				config: params.config,
				sessionKey: params.sessionKey,
				sessionId: params.sessionId,
				warn: makeBootstrapWarn({
					sessionLabel,
					warn: (message) => log$3.warn(message)
				}),
				contextMode: params.bootstrapContextMode,
				runKind: params.bootstrapContextRunKind
			})
		});
		const bootstrapMaxChars = resolveBootstrapMaxChars(params.config);
		const bootstrapTotalMaxChars = resolveBootstrapTotalMaxChars(params.config);
		const bootstrapAnalysis = analyzeBootstrapBudget({
			files: buildBootstrapInjectionStats({
				bootstrapFiles: hookAdjustedBootstrapFiles,
				injectedFiles: contextFiles
			}),
			bootstrapMaxChars,
			bootstrapTotalMaxChars
		});
		const bootstrapPromptWarningMode = resolveBootstrapPromptTruncationWarningMode(params.config);
		const bootstrapPromptWarning = buildBootstrapPromptWarning({
			analysis: bootstrapAnalysis,
			mode: bootstrapPromptWarningMode,
			seenSignatures: params.bootstrapPromptWarningSignaturesSeen,
			previousSignature: params.bootstrapPromptWarningSignature
		});
		const workspaceNotes = hookAdjustedBootstrapFiles.some((file) => file.name === "BOOTSTRAP.md" && !file.missing) ? ["Reminder: commit your changes in this workspace after edits."] : void 0;
		const agentDir = params.agentDir ?? resolveOpenClawAgentDir();
		const { defaultAgentId } = resolveSessionAgentIds({
			sessionKey: params.sessionKey,
			config: params.config,
			agentId: params.agentId
		});
		const effectiveFsWorkspaceOnly = resolveAttemptFsWorkspaceOnly({
			config: params.config,
			sessionAgentId
		});
		let yieldDetected = false;
		let yieldMessage = null;
		let abortSessionForYield = null;
		let queueYieldInterruptForSession = null;
		let yieldAbortSettled = null;
		const modelHasVision = params.model.input?.includes("image") ?? false;
		const toolsRaw = params.disableTools ? [] : (() => {
			const allTools = createOpenClawCodingTools({
				agentId: sessionAgentId,
				...buildEmbeddedAttemptToolRunContext(params),
				exec: {
					...params.execOverrides,
					elevated: params.bashElevated
				},
				sandbox,
				messageProvider: params.messageChannel ?? params.messageProvider,
				agentAccountId: params.agentAccountId,
				messageTo: params.messageTo,
				messageThreadId: params.messageThreadId,
				groupId: params.groupId,
				groupChannel: params.groupChannel,
				groupSpace: params.groupSpace,
				spawnedBy: params.spawnedBy,
				senderId: params.senderId,
				senderName: params.senderName,
				senderUsername: params.senderUsername,
				senderE164: params.senderE164,
				senderIsOwner: params.senderIsOwner,
				allowGatewaySubagentBinding: params.allowGatewaySubagentBinding,
				sessionKey: sandboxSessionKey,
				sessionId: params.sessionId,
				runId: params.runId,
				agentDir,
				workspaceDir: effectiveWorkspace,
				spawnWorkspaceDir: resolveAttemptSpawnWorkspaceDir({
					sandbox,
					resolvedWorkspace
				}),
				config: params.config,
				abortSignal: runAbortController.signal,
				modelProvider: params.model.provider,
				modelId: params.modelId,
				modelCompat: params.model.compat,
				modelApi: params.model.api,
				modelContextWindowTokens: params.model.contextWindow,
				modelAuthMode: resolveModelAuthMode(params.model.provider, params.config),
				currentChannelId: params.currentChannelId,
				currentThreadTs: params.currentThreadTs,
				currentMessageId: params.currentMessageId,
				replyToMode: params.replyToMode,
				hasRepliedRef: params.hasRepliedRef,
				modelHasVision,
				requireExplicitMessageTarget: params.requireExplicitMessageTarget ?? isSubagentSessionKey(params.sessionKey),
				disableMessageTool: params.disableMessageTool,
				onYield: (message) => {
					yieldDetected = true;
					yieldMessage = message;
					queueYieldInterruptForSession?.();
					runAbortController.abort("sessions_yield");
					abortSessionForYield?.();
				}
			});
			if (params.toolsAllow && params.toolsAllow.length > 0) {
				const allowSet = new Set(params.toolsAllow);
				return allTools.filter((tool) => allowSet.has(tool.name));
			}
			return allTools;
		})();
		const toolsEnabled = supportsModelTools(params.model);
		const tools = normalizeProviderToolSchemas({
			tools: toolsEnabled ? toolsRaw : [],
			provider: params.provider,
			config: params.config,
			workspaceDir: effectiveWorkspace,
			env: process.env,
			modelId: params.modelId,
			modelApi: params.model.api,
			model: params.model
		});
		const clientTools = toolsEnabled ? params.clientTools : void 0;
		const bundleMcpSessionRuntime = toolsEnabled ? await getOrCreateSessionMcpRuntime({
			sessionId: params.sessionId,
			sessionKey: params.sessionKey,
			workspaceDir: effectiveWorkspace,
			cfg: params.config
		}) : void 0;
		const bundleMcpRuntime = bundleMcpSessionRuntime ? await materializeBundleMcpToolsForRun({
			runtime: bundleMcpSessionRuntime,
			reservedToolNames: [...tools.map((tool) => tool.name), ...clientTools?.map((tool) => tool.function.name) ?? []]
		}) : void 0;
		const bundleLspRuntime = toolsEnabled ? await createBundleLspToolRuntime({
			workspaceDir: effectiveWorkspace,
			cfg: params.config,
			reservedToolNames: [
				...tools.map((tool) => tool.name),
				...clientTools?.map((tool) => tool.function.name) ?? [],
				...bundleMcpRuntime?.tools.map((tool) => tool.name) ?? []
			]
		}) : void 0;
		const effectiveTools = [
			...tools,
			...bundleMcpRuntime?.tools ?? [],
			...bundleLspRuntime?.tools ?? []
		];
		const allowedToolNames = collectAllowedToolNames({
			tools: effectiveTools,
			clientTools
		});
		logProviderToolSchemaDiagnostics({
			tools: effectiveTools,
			provider: params.provider,
			config: params.config,
			workspaceDir: effectiveWorkspace,
			env: process.env,
			modelId: params.modelId,
			modelApi: params.model.api,
			model: params.model
		});
		const machineName = await getMachineDisplayName();
		const runtimeChannel = normalizeMessageChannel(params.messageChannel ?? params.messageProvider);
		let runtimeCapabilities = runtimeChannel ? resolveChannelCapabilities({
			cfg: params.config,
			channel: runtimeChannel,
			accountId: params.agentAccountId
		}) ?? [] : void 0;
		const promptCapabilities = runtimeChannel && params.config ? resolveChannelMessageToolCapabilities({
			cfg: params.config,
			channel: runtimeChannel,
			accountId: params.agentAccountId
		}) : [];
		if (promptCapabilities.length > 0) {
			runtimeCapabilities ??= [];
			const seenCapabilities = new Set(runtimeCapabilities.map((cap) => normalizeOptionalLowercaseString(cap)).filter(Boolean));
			for (const capability of promptCapabilities) {
				const normalizedCapability = normalizeOptionalLowercaseString(capability);
				if (!normalizedCapability || seenCapabilities.has(normalizedCapability)) continue;
				seenCapabilities.add(normalizedCapability);
				runtimeCapabilities.push(capability);
			}
		}
		const reactionGuidance = runtimeChannel && params.config ? resolveChannelReactionGuidance({
			cfg: params.config,
			channel: runtimeChannel,
			accountId: params.agentAccountId
		}) : void 0;
		const sandboxInfo = buildEmbeddedSandboxInfo(sandbox, params.bashElevated);
		const reasoningTagHint = isReasoningTagProvider(params.provider, {
			config: params.config,
			workspaceDir: effectiveWorkspace,
			env: process.env,
			modelId: params.modelId,
			modelApi: params.model.api,
			model: params.model
		});
		const channelActions = runtimeChannel ? listChannelSupportedActions(buildEmbeddedMessageActionDiscoveryInput({
			cfg: params.config,
			channel: runtimeChannel,
			currentChannelId: params.currentChannelId,
			currentThreadTs: params.currentThreadTs,
			currentMessageId: params.currentMessageId,
			accountId: params.agentAccountId,
			sessionKey: params.sessionKey,
			sessionId: params.sessionId,
			agentId: sessionAgentId,
			senderId: params.senderId,
			senderIsOwner: params.senderIsOwner
		})) : void 0;
		const messageToolHints = runtimeChannel ? resolveChannelMessageToolHints({
			cfg: params.config,
			channel: runtimeChannel,
			accountId: params.agentAccountId
		}) : void 0;
		const defaultModelRef = resolveDefaultModelForAgent({
			cfg: params.config ?? {},
			agentId: sessionAgentId
		});
		const defaultModelLabel = `${defaultModelRef.provider}/${defaultModelRef.model}`;
		const { runtimeInfo, userTimezone, userTime, userTimeFormat } = buildSystemPromptParams({
			config: params.config,
			agentId: sessionAgentId,
			workspaceDir: effectiveWorkspace,
			cwd: effectiveWorkspace,
			runtime: {
				host: machineName,
				os: `${os.type()} ${os.release()}`,
				arch: os.arch(),
				node: process.version,
				model: `${params.provider}/${params.modelId}`,
				defaultModel: defaultModelLabel,
				shell: detectRuntimeShell(),
				channel: runtimeChannel,
				capabilities: runtimeCapabilities,
				channelActions
			}
		});
		const isDefaultAgent = sessionAgentId === defaultAgentId;
		const promptMode = resolvePromptModeForSession(params.sessionKey);
		const effectivePromptMode = params.toolsAllow?.length ? "minimal" : promptMode;
		const effectiveSkillsPrompt = params.toolsAllow?.length ? void 0 : skillsPrompt;
		const docsPath = await resolveOpenClawDocsPath({
			workspaceDir: effectiveWorkspace,
			argv1: process.argv[1],
			cwd: effectiveWorkspace,
			moduleUrl: import.meta.url
		});
		const ttsHint = params.config ? buildTtsSystemPromptHint(params.config) : void 0;
		const ownerDisplay = resolveOwnerDisplaySetting(params.config);
		const heartbeatPrompt = shouldInjectHeartbeatPrompt({
			config: params.config,
			agentId: sessionAgentId,
			defaultAgentId,
			isDefaultAgent,
			trigger: params.trigger
		}) ? resolveHeartbeatPromptForSystemPrompt({
			config: params.config,
			agentId: sessionAgentId,
			defaultAgentId
		}) : void 0;
		const promptContribution = resolveProviderSystemPromptContribution({
			provider: params.provider,
			config: params.config,
			workspaceDir: effectiveWorkspace,
			context: {
				config: params.config,
				agentDir: params.agentDir,
				workspaceDir: effectiveWorkspace,
				provider: params.provider,
				modelId: params.modelId,
				promptMode: effectivePromptMode,
				runtimeChannel,
				runtimeCapabilities,
				agentId: sessionAgentId
			}
		});
		const builtAppendPrompt = resolveSystemPromptOverride({
			config: params.config,
			agentId: sessionAgentId
		}) ?? buildEmbeddedSystemPrompt({
			workspaceDir: effectiveWorkspace,
			defaultThinkLevel: params.thinkLevel,
			reasoningLevel: params.reasoningLevel ?? "off",
			extraSystemPrompt: params.extraSystemPrompt,
			ownerNumbers: params.ownerNumbers,
			ownerDisplay: ownerDisplay.ownerDisplay,
			ownerDisplaySecret: ownerDisplay.ownerDisplaySecret,
			reasoningTagHint,
			heartbeatPrompt,
			skillsPrompt: effectiveSkillsPrompt,
			docsPath: docsPath ?? void 0,
			ttsHint,
			workspaceNotes,
			reactionGuidance,
			promptMode: effectivePromptMode,
			acpEnabled: params.config?.acp?.enabled !== false,
			runtimeInfo,
			messageToolHints,
			sandboxInfo,
			tools: effectiveTools,
			modelAliasLines: buildModelAliasLines(params.config),
			userTimezone,
			userTime,
			userTimeFormat,
			contextFiles,
			includeMemorySection: !params.contextEngine || params.contextEngine.info.id === "legacy",
			memoryCitationsMode: params.config?.memory?.citations,
			promptContribution
		});
		const appendPrompt = transformProviderSystemPrompt({
			provider: params.provider,
			config: params.config,
			workspaceDir: effectiveWorkspace,
			context: {
				config: params.config,
				agentDir: params.agentDir,
				workspaceDir: effectiveWorkspace,
				provider: params.provider,
				modelId: params.modelId,
				promptMode: effectivePromptMode,
				runtimeChannel,
				runtimeCapabilities,
				agentId: sessionAgentId,
				systemPrompt: builtAppendPrompt
			}
		});
		const systemPromptReport = buildSystemPromptReport({
			source: "run",
			generatedAt: Date.now(),
			sessionId: params.sessionId,
			sessionKey: params.sessionKey,
			provider: params.provider,
			model: params.modelId,
			workspaceDir: effectiveWorkspace,
			bootstrapMaxChars,
			bootstrapTotalMaxChars,
			bootstrapTruncation: buildBootstrapTruncationReportMeta({
				analysis: bootstrapAnalysis,
				warningMode: bootstrapPromptWarningMode,
				warning: bootstrapPromptWarning
			}),
			sandbox: (() => {
				const runtime = resolveSandboxRuntimeStatus({
					cfg: params.config,
					sessionKey: sandboxSessionKey
				});
				return {
					mode: runtime.mode,
					sandboxed: runtime.sandboxed
				};
			})(),
			systemPrompt: appendPrompt,
			bootstrapFiles: hookAdjustedBootstrapFiles,
			injectedFiles: contextFiles,
			skillsPrompt,
			tools: effectiveTools
		});
		let systemPromptText = createSystemPromptOverride(appendPrompt)();
		let sessionManager;
		let session;
		let removeToolResultContextGuard;
		try {
			await repairSessionFileIfNeeded({
				sessionFile: params.sessionFile,
				warn: (message) => log$3.warn(message)
			});
			const hadSessionFile = await fs$1.stat(params.sessionFile).then(() => true).catch(() => false);
			const transcriptPolicy = resolveTranscriptPolicy({
				modelApi: params.model?.api,
				provider: params.provider,
				modelId: params.modelId,
				config: params.config,
				workspaceDir: effectiveWorkspace,
				env: process.env,
				model: params.model
			});
			await prewarmSessionFile(params.sessionFile);
			sessionManager = guardSessionManager(SessionManager.open(params.sessionFile), {
				agentId: sessionAgentId,
				sessionKey: params.sessionKey,
				config: params.config,
				contextWindowTokens: params.contextTokenBudget,
				inputProvenance: params.inputProvenance,
				allowSyntheticToolResults: transcriptPolicy.allowSyntheticToolResults,
				allowedToolNames
			});
			trackSessionManagerAccess(params.sessionFile);
			await runAttemptContextEngineBootstrap({
				hadSessionFile,
				contextEngine: params.contextEngine,
				sessionId: params.sessionId,
				sessionKey: params.sessionKey,
				sessionFile: params.sessionFile,
				sessionManager,
				runtimeContext: buildAfterTurnRuntimeContext({
					attempt: params,
					workspaceDir: effectiveWorkspace,
					agentDir,
					tokenBudget: params.contextTokenBudget
				}),
				runMaintenance: async (contextParams) => await runContextEngineMaintenance({
					contextEngine: contextParams.contextEngine,
					sessionId: contextParams.sessionId,
					sessionKey: contextParams.sessionKey,
					sessionFile: contextParams.sessionFile,
					reason: contextParams.reason,
					sessionManager: contextParams.sessionManager,
					runtimeContext: contextParams.runtimeContext
				}),
				warn: (message) => log$3.warn(message)
			});
			await prepareSessionManagerForRun({
				sessionManager,
				sessionFile: params.sessionFile,
				hadSessionFile,
				sessionId: params.sessionId,
				cwd: effectiveWorkspace
			});
			const settingsManager = createPreparedEmbeddedPiSettingsManager({
				cwd: effectiveWorkspace,
				agentDir,
				cfg: params.config,
				contextTokenBudget: params.contextTokenBudget
			});
			applyPiAutoCompactionGuard({
				settingsManager,
				contextEngineInfo: params.contextEngine?.info
			});
			const extensionFactories = buildEmbeddedExtensionFactories({
				cfg: params.config,
				sessionManager,
				provider: params.provider,
				modelId: params.modelId,
				model: params.model
			});
			let resourceLoader;
			if (extensionFactories.length > 0) {
				resourceLoader = new DefaultResourceLoader({
					cwd: resolvedWorkspace,
					agentDir,
					settingsManager,
					extensionFactories
				});
				await resourceLoader.reload();
			}
			const hookRunner = getGlobalHookRunner();
			const { builtInTools, customTools } = splitSdkTools({
				tools: effectiveTools,
				sandboxEnabled: !!sandbox?.enabled
			});
			let clientToolCallDetected = null;
			const clientToolLoopDetection = resolveToolLoopDetectionConfig({
				cfg: params.config,
				agentId: sessionAgentId
			});
			const builtinToolNames = new Set(effectiveTools.flatMap((tool) => {
				const name = (tool.name ?? "").trim();
				return name ? [name] : [];
			}));
			const coreBuiltinToolNames = new Set(effectiveTools.flatMap((tool) => {
				const name = (tool.name ?? "").trim();
				if (!name || getPluginToolMeta(tool)) return [];
				return [name];
			}));
			const clientToolNameConflicts = findClientToolNameConflicts({
				tools: clientTools ?? [],
				existingToolNames: coreBuiltinToolNames
			});
			if (clientToolNameConflicts.length > 0) throw createClientToolNameConflictError(clientToolNameConflicts);
			const clientToolDefs = clientTools ? toClientToolDefinitions(clientTools, (toolName, toolParams) => {
				clientToolCallDetected = {
					name: toolName,
					params: toolParams
				};
			}, {
				agentId: sessionAgentId,
				sessionKey: sandboxSessionKey,
				sessionId: params.sessionId,
				runId: params.runId,
				loopDetection: clientToolLoopDetection
			}) : [];
			const allCustomTools = [...customTools, ...clientToolDefs];
			({session} = await createAgentSession({
				cwd: resolvedWorkspace,
				agentDir,
				authStorage: params.authStorage,
				modelRegistry: params.modelRegistry,
				model: params.model,
				thinkingLevel: mapThinkingLevel(params.thinkLevel),
				tools: builtInTools,
				customTools: allCustomTools,
				sessionManager,
				settingsManager,
				resourceLoader
			}));
			applySystemPromptOverrideToSession(session, systemPromptText);
			if (!session) throw new Error("Embedded agent session missing");
			const activeSession = session;
			let prePromptMessageCount = activeSession.messages.length;
			abortSessionForYield = () => {
				yieldAbortSettled = Promise.resolve(activeSession.abort());
			};
			queueYieldInterruptForSession = () => {
				queueSessionsYieldInterruptMessage(activeSession);
			};
			if (params.contextEngine?.info?.ownsCompaction !== true) removeToolResultContextGuard = installToolResultContextGuard({
				agent: activeSession.agent,
				contextWindowTokens: Math.max(1, Math.floor(params.model.contextWindow ?? params.model.maxTokens ?? 2e5))
			});
			else removeToolResultContextGuard = installContextEngineLoopHook({
				agent: activeSession.agent,
				contextEngine: params.contextEngine,
				sessionId: params.sessionId,
				sessionKey: params.sessionKey,
				sessionFile: params.sessionFile,
				tokenBudget: params.contextTokenBudget,
				modelId: params.modelId,
				getPrePromptMessageCount: () => prePromptMessageCount,
				getRuntimeContext: ({ messages, prePromptMessageCount: loopPrePromptMessageCount }) => buildAfterTurnRuntimeContext({
					attempt: params,
					workspaceDir: effectiveWorkspace,
					agentDir,
					tokenBudget: params.contextTokenBudget,
					promptCache: promptCache ?? buildLoopPromptCacheInfo({
						messagesSnapshot: messages,
						prePromptMessageCount: loopPrePromptMessageCount,
						retention: effectivePromptCacheRetention,
						fallbackLastCacheTouchAt: readLastCacheTtlTimestamp(sessionManager, {
							provider: params.provider,
							modelId: params.modelId
						})
					})
				})
			});
			const cacheTrace = createCacheTrace({
				cfg: params.config,
				env: process.env,
				runId: params.runId,
				sessionId: activeSession.sessionId,
				sessionKey: params.sessionKey,
				provider: params.provider,
				modelId: params.modelId,
				modelApi: params.model.api,
				workspaceDir: params.workspaceDir
			});
			const anthropicPayloadLogger = createAnthropicPayloadLogger({
				env: process.env,
				runId: params.runId,
				sessionId: activeSession.sessionId,
				sessionKey: params.sessionKey,
				provider: params.provider,
				modelId: params.modelId,
				modelApi: params.model.api,
				workspaceDir: params.workspaceDir
			});
			const defaultSessionStreamFn = resolveEmbeddedAgentBaseStreamFn({ session: activeSession });
			const providerStreamFn = registerProviderStreamForModel({
				model: params.model,
				cfg: params.config,
				agentDir,
				workspaceDir: effectiveWorkspace
			});
			const shouldUseWebSocketTransport = shouldUseOpenAIWebSocketTransport({
				provider: params.provider,
				modelApi: params.model.api
			});
			const wsApiKey = shouldUseWebSocketTransport ? await resolveEmbeddedAgentApiKey({
				provider: params.provider,
				resolvedApiKey: params.resolvedApiKey,
				authStorage: params.authStorage
			}) : void 0;
			if (shouldUseWebSocketTransport && !wsApiKey) log$3.warn(`[ws-stream] no API key for provider=${params.provider}; keeping session-managed HTTP transport`);
			const streamStrategy = describeEmbeddedAgentStreamStrategy({
				currentStreamFn: defaultSessionStreamFn,
				providerStreamFn,
				shouldUseWebSocketTransport,
				wsApiKey,
				model: params.model
			});
			activeSession.agent.streamFn = resolveEmbeddedAgentStreamFn({
				currentStreamFn: defaultSessionStreamFn,
				providerStreamFn,
				shouldUseWebSocketTransport,
				wsApiKey,
				sessionId: params.sessionId,
				signal: runAbortController.signal,
				model: params.model,
				resolvedApiKey: params.resolvedApiKey,
				authStorage: params.authStorage
			});
			const providerTextTransforms = resolveProviderTextTransforms({
				provider: params.provider,
				config: params.config,
				workspaceDir: effectiveWorkspace
			});
			if (providerTextTransforms) activeSession.agent.streamFn = wrapStreamFnTextTransforms({
				streamFn: activeSession.agent.streamFn,
				input: providerTextTransforms.input,
				output: providerTextTransforms.output,
				transformSystemPrompt: false
			});
			const { effectiveExtraParams } = applyExtraParamsToAgent(activeSession.agent, params.config, params.provider, params.modelId, {
				...params.streamParams,
				fastMode: params.fastMode
			}, params.thinkLevel, sessionAgentId, effectiveWorkspace, params.model, agentDir);
			const effectivePromptCacheRetention = resolveCacheRetention(effectiveExtraParams, params.provider, params.model.api, params.modelId);
			const agentTransportOverride = resolveAgentTransportOverride({
				settingsManager,
				effectiveExtraParams
			});
			const effectiveAgentTransport = agentTransportOverride ?? activeSession.agent.transport;
			if (agentTransportOverride && activeSession.agent.transport !== agentTransportOverride) {
				const previousTransport = activeSession.agent.transport;
				log$3.debug(`embedded agent transport override: ${previousTransport} -> ${agentTransportOverride} (${params.provider}/${params.modelId})`);
			}
			const cacheObservabilityEnabled = Boolean(cacheTrace) || log$3.isEnabled("debug");
			const promptCacheToolNames = collectPromptCacheToolNames([...builtInTools, ...allCustomTools]);
			let promptCacheChangesForTurn = null;
			if (cacheTrace) {
				cacheTrace.recordStage("session:loaded", {
					messages: activeSession.messages,
					system: systemPromptText,
					note: "after session create"
				});
				activeSession.agent.streamFn = cacheTrace.wrapStreamFn(activeSession.agent.streamFn);
			}
			if (transcriptPolicy.dropThinkingBlocks) {
				const inner = activeSession.agent.streamFn;
				activeSession.agent.streamFn = (model, context, options) => {
					const messages = context?.messages;
					if (!Array.isArray(messages)) return inner(model, context, options);
					const sanitized = dropThinkingBlocks(messages);
					if (sanitized === messages) return inner(model, context, options);
					return inner(model, {
						...context,
						messages: sanitized
					}, options);
				};
			}
			const isOpenAIResponsesApi = params.model.api === "openai-responses" || params.model.api === "azure-openai-responses" || params.model.api === "openai-codex-responses";
			if (transcriptPolicy.sanitizeToolCallIds && transcriptPolicy.toolCallIdMode && !isOpenAIResponsesApi) {
				const inner = activeSession.agent.streamFn;
				const mode = transcriptPolicy.toolCallIdMode;
				activeSession.agent.streamFn = (model, context, options) => {
					const messages = context?.messages;
					if (!Array.isArray(messages)) return inner(model, context, options);
					const nextMessages = sanitizeReplayToolCallIdsForStream({
						messages,
						mode,
						allowedToolNames,
						preserveNativeAnthropicToolUseIds: transcriptPolicy.preserveNativeAnthropicToolUseIds,
						preserveReplaySafeThinkingToolCallIds: shouldAllowProviderOwnedThinkingReplay({
							modelApi: model?.api,
							policy: transcriptPolicy
						}),
						repairToolUseResultPairing: transcriptPolicy.repairToolUseResultPairing
					});
					if (nextMessages === messages) return inner(model, context, options);
					return inner(model, {
						...context,
						messages: nextMessages
					}, options);
				};
			}
			if (isOpenAIResponsesApi) {
				const inner = activeSession.agent.streamFn;
				activeSession.agent.streamFn = (model, context, options) => {
					const messages = context?.messages;
					if (!Array.isArray(messages)) return inner(model, context, options);
					const sanitized = downgradeOpenAIFunctionCallReasoningPairs(messages);
					if (sanitized === messages) return inner(model, context, options);
					return inner(model, {
						...context,
						messages: sanitized
					}, options);
				};
			}
			const innerStreamFn = activeSession.agent.streamFn;
			activeSession.agent.streamFn = (model, context, options) => {
				const signal = runAbortController.signal;
				if (yieldDetected && signal.aborted && signal.reason === "sessions_yield") return createYieldAbortedResponse(model);
				return innerStreamFn(model, context, options);
			};
			activeSession.agent.streamFn = wrapStreamFnSanitizeMalformedToolCalls(activeSession.agent.streamFn, allowedToolNames, transcriptPolicy);
			activeSession.agent.streamFn = wrapStreamFnTrimToolCallNames(activeSession.agent.streamFn, allowedToolNames, { unknownToolThreshold: resolveUnknownToolGuardThreshold(clientToolLoopDetection) });
			if (params.model.api === "anthropic-messages" && shouldRepairMalformedAnthropicToolCallArguments(params.provider)) activeSession.agent.streamFn = wrapStreamFnRepairMalformedToolCallArguments(activeSession.agent.streamFn);
			if (resolveToolCallArgumentsEncoding(params.model) === "html-entities") activeSession.agent.streamFn = wrapStreamFnDecodeXaiToolCallArguments(activeSession.agent.streamFn);
			if (anthropicPayloadLogger) activeSession.agent.streamFn = anthropicPayloadLogger.wrapStreamFn(activeSession.agent.streamFn);
			activeSession.agent.streamFn = wrapStreamFnHandleSensitiveStopReason(activeSession.agent.streamFn);
			let idleTimeoutTrigger;
			const configuredRunTimeoutMs = resolveAgentTimeoutMs({ cfg: params.config });
			const idleTimeoutMs = resolveLlmIdleTimeoutMs({
				cfg: params.config,
				trigger: params.trigger,
				runTimeoutMs: params.timeoutMs !== configuredRunTimeoutMs ? params.timeoutMs : void 0
			});
			if (idleTimeoutMs > 0) activeSession.agent.streamFn = streamWithIdleTimeout(activeSession.agent.streamFn, idleTimeoutMs, (error) => idleTimeoutTrigger?.(error));
			try {
				const prior = await sanitizeSessionHistory({
					messages: activeSession.messages,
					modelApi: params.model.api,
					modelId: params.modelId,
					provider: params.provider,
					allowedToolNames,
					config: params.config,
					workspaceDir: effectiveWorkspace,
					env: process.env,
					model: params.model,
					sessionManager,
					sessionId: params.sessionId,
					policy: transcriptPolicy
				});
				cacheTrace?.recordStage("session:sanitized", { messages: prior });
				const validated = await validateReplayTurns({
					messages: prior,
					modelApi: params.model.api,
					modelId: params.modelId,
					provider: params.provider,
					config: params.config,
					workspaceDir: effectiveWorkspace,
					env: process.env,
					model: params.model,
					sessionId: params.sessionId,
					policy: transcriptPolicy
				});
				const heartbeatSummary = params.config && sessionAgentId ? resolveHeartbeatSummaryForAgent(params.config, sessionAgentId) : void 0;
				const truncated = limitHistoryTurns(filterHeartbeatPairs(validated, heartbeatSummary?.ackMaxChars, heartbeatSummary?.prompt), getDmHistoryLimitFromSessionKey(params.sessionKey, params.config));
				const limited = transcriptPolicy.repairToolUseResultPairing ? sanitizeToolUseResultPairing(truncated, { erroredAssistantResultPolicy: "drop" }) : truncated;
				cacheTrace?.recordStage("session:limited", { messages: limited });
				if (limited.length > 0) activeSession.agent.state.messages = limited;
				if (params.contextEngine) try {
					const assembled = await assembleAttemptContextEngine({
						contextEngine: params.contextEngine,
						sessionId: params.sessionId,
						sessionKey: params.sessionKey,
						messages: activeSession.messages,
						tokenBudget: params.contextTokenBudget,
						availableTools: new Set(effectiveTools.map((tool) => tool.name)),
						citationsMode: params.config?.memory?.citations,
						modelId: params.modelId,
						...params.prompt !== void 0 ? { prompt: params.prompt } : {}
					});
					if (!assembled) throw new Error("context engine assemble returned no result");
					if (assembled.messages !== activeSession.messages) activeSession.agent.state.messages = assembled.messages;
					if (assembled.systemPromptAddition) {
						systemPromptText = prependSystemPromptAddition({
							systemPrompt: systemPromptText,
							systemPromptAddition: assembled.systemPromptAddition
						});
						applySystemPromptOverrideToSession(activeSession, systemPromptText);
						log$3.debug(`context engine: prepended system prompt addition (${assembled.systemPromptAddition.length} chars)`);
					}
				} catch (assembleErr) {
					log$3.warn(`context engine assemble failed, using pipeline messages: ${String(assembleErr)}`);
				}
			} catch (err) {
				await flushPendingToolResultsAfterIdle({
					agent: activeSession?.agent,
					sessionManager,
					clearPendingOnTimeout: true
				});
				activeSession.dispose();
				throw err;
			}
			let aborted = Boolean(params.abortSignal?.aborted);
			let externalAbort = false;
			let yieldAborted = false;
			let timedOut = false;
			let idleTimedOut = false;
			let timedOutDuringCompaction = false;
			const getAbortReason = (signal) => "reason" in signal ? signal.reason : void 0;
			const makeTimeoutAbortReason = () => {
				const err = /* @__PURE__ */ new Error("request timed out");
				err.name = "TimeoutError";
				return err;
			};
			const makeAbortError = (signal) => {
				const reason = getAbortReason(signal);
				if (reason instanceof Error) {
					const err = new Error(reason.message, { cause: reason });
					err.name = "AbortError";
					return err;
				}
				const err = reason ? new Error("aborted", { cause: reason }) : /* @__PURE__ */ new Error("aborted");
				err.name = "AbortError";
				return err;
			};
			const abortCompaction = () => {
				if (!activeSession.isCompacting) return;
				try {
					activeSession.abortCompaction();
				} catch (err) {
					if (!isProbeSession) log$3.warn(`embedded run abortCompaction failed: runId=${params.runId} sessionId=${params.sessionId} err=${String(err)}`);
				}
			};
			const abortRun = (isTimeout = false, reason) => {
				aborted = true;
				if (isTimeout) timedOut = true;
				if (isTimeout) runAbortController.abort(reason ?? makeTimeoutAbortReason());
				else runAbortController.abort(reason);
				abortCompaction();
				activeSession.abort();
			};
			idleTimeoutTrigger = (error) => {
				idleTimedOut = true;
				abortRun(true, error);
			};
			const abortable = (promise) => {
				const signal = runAbortController.signal;
				if (signal.aborted) return Promise.reject(makeAbortError(signal));
				return new Promise((resolve, reject) => {
					const onAbort = () => {
						signal.removeEventListener("abort", onAbort);
						reject(makeAbortError(signal));
					};
					signal.addEventListener("abort", onAbort, { once: true });
					promise.then((value) => {
						signal.removeEventListener("abort", onAbort);
						resolve(value);
					}, (err) => {
						signal.removeEventListener("abort", onAbort);
						reject(err);
					});
				});
			};
			const subscription = subscribeEmbeddedPiSession(buildEmbeddedSubscriptionParams({
				session: activeSession,
				runId: params.runId,
				initialReplayState: params.initialReplayState,
				hookRunner: getGlobalHookRunner() ?? void 0,
				verboseLevel: params.verboseLevel,
				reasoningMode: params.reasoningLevel ?? "off",
				toolResultFormat: params.toolResultFormat,
				shouldEmitToolResult: params.shouldEmitToolResult,
				shouldEmitToolOutput: params.shouldEmitToolOutput,
				onToolResult: params.onToolResult,
				onReasoningStream: params.onReasoningStream,
				onReasoningEnd: params.onReasoningEnd,
				onBlockReply: params.onBlockReply,
				onBlockReplyFlush: params.onBlockReplyFlush,
				blockReplyBreak: params.blockReplyBreak,
				blockReplyChunking: params.blockReplyChunking,
				onPartialReply: params.onPartialReply,
				onAssistantMessageStart: params.onAssistantMessageStart,
				onAgentEvent: params.onAgentEvent,
				enforceFinalTag: params.enforceFinalTag,
				silentExpected: params.silentExpected,
				config: params.config,
				sessionKey: sandboxSessionKey,
				sessionId: params.sessionId,
				agentId: sessionAgentId,
				builtinToolNames,
				internalEvents: params.internalEvents
			}));
			const { assistantTexts, toolMetas, unsubscribe, waitForCompactionRetry, isCompactionInFlight, getItemLifecycle, getMessagingToolSentTexts, getMessagingToolSentMediaUrls, getMessagingToolSentTargets, getSuccessfulCronAdds, getReplayState, didSendViaMessagingTool, getLastToolError, setTerminalLifecycleMeta, getUsageTotals, getCompactionCount } = subscription;
			const queueHandle = {
				kind: "embedded",
				queueMessage: async (text) => {
					await activeSession.steer(text);
				},
				isStreaming: () => activeSession.isStreaming,
				isCompacting: () => subscription.isCompacting(),
				cancel: () => {
					abortRun();
				},
				abort: abortRun
			};
			let lastAssistant;
			let currentAttemptAssistant;
			let attemptUsage;
			let cacheBreak = null;
			let promptCache;
			let finalPromptText;
			if (params.replyOperation) params.replyOperation.attachBackend(queueHandle);
			setActiveEmbeddedRun(params.sessionId, queueHandle, params.sessionKey);
			let abortWarnTimer;
			const isProbeSession = params.sessionId?.startsWith("probe-") ?? false;
			const compactionTimeoutMs = resolveCompactionTimeoutMs(params.config);
			let abortTimer;
			let compactionGraceUsed = false;
			const scheduleAbortTimer = (delayMs, reason) => {
				abortTimer = setTimeout(() => {
					if (resolveRunTimeoutDuringCompaction({
						isCompactionPendingOrRetrying: subscription.isCompacting(),
						isCompactionInFlight: activeSession.isCompacting,
						graceAlreadyUsed: compactionGraceUsed
					}) === "extend") {
						compactionGraceUsed = true;
						if (!isProbeSession) log$3.warn(`embedded run timeout reached during compaction; extending deadline: runId=${params.runId} sessionId=${params.sessionId} extraMs=${compactionTimeoutMs}`);
						scheduleAbortTimer(compactionTimeoutMs, "compaction-grace");
						return;
					}
					if (!isProbeSession) log$3.warn(reason === "compaction-grace" ? `embedded run timeout after compaction grace: runId=${params.runId} sessionId=${params.sessionId} timeoutMs=${params.timeoutMs} compactionGraceMs=${compactionTimeoutMs}` : `embedded run timeout: runId=${params.runId} sessionId=${params.sessionId} timeoutMs=${params.timeoutMs}`);
					if (shouldFlagCompactionTimeout({
						isTimeout: true,
						isCompactionPendingOrRetrying: subscription.isCompacting(),
						isCompactionInFlight: activeSession.isCompacting
					})) timedOutDuringCompaction = true;
					abortRun(true);
					if (!abortWarnTimer) abortWarnTimer = setTimeout(() => {
						if (!activeSession.isStreaming) return;
						if (!isProbeSession) log$3.warn(`embedded run abort still streaming: runId=${params.runId} sessionId=${params.sessionId}`);
					}, 1e4);
				}, Math.max(1, delayMs));
			};
			scheduleAbortTimer(params.timeoutMs, "initial");
			let messagesSnapshot = [];
			let sessionIdUsed = activeSession.sessionId;
			const onAbort = () => {
				externalAbort = true;
				const reason = params.abortSignal ? getAbortReason(params.abortSignal) : void 0;
				const timeout = reason ? isTimeoutError(reason) : false;
				if (shouldFlagCompactionTimeout({
					isTimeout: timeout,
					isCompactionPendingOrRetrying: subscription.isCompacting(),
					isCompactionInFlight: activeSession.isCompacting
				})) timedOutDuringCompaction = true;
				abortRun(timeout, reason);
			};
			if (params.abortSignal) if (params.abortSignal.aborted) onAbort();
			else params.abortSignal.addEventListener("abort", onAbort, { once: true });
			const hookAgentId = sessionAgentId;
			let promptError = null;
			let preflightRecovery;
			let promptErrorSource = null;
			let skipPromptSubmission = false;
			try {
				const promptStartedAt = Date.now();
				let effectivePrompt = prependBootstrapPromptWarning(params.prompt, bootstrapPromptWarning.lines, { preserveExactPrompt: heartbeatPrompt });
				const hookCtx = {
					runId: params.runId,
					agentId: hookAgentId,
					sessionKey: params.sessionKey,
					sessionId: params.sessionId,
					workspaceDir: params.workspaceDir,
					modelProviderId: params.model.provider,
					modelId: params.model.id,
					messageProvider: params.messageProvider ?? void 0,
					trigger: params.trigger,
					channelId: params.messageChannel ?? params.messageProvider ?? void 0
				};
				const hookResult = await resolvePromptBuildHookResult({
					prompt: params.prompt,
					messages: activeSession.messages,
					hookCtx,
					hookRunner,
					legacyBeforeAgentStartResult: params.legacyBeforeAgentStartResult
				});
				{
					if (hookResult?.prependContext) {
						effectivePrompt = `${hookResult.prependContext}\n\n${effectivePrompt}`;
						log$3.debug(`hooks: prepended context to prompt (${hookResult.prependContext.length} chars)`);
					}
					const legacySystemPrompt = normalizeOptionalString(hookResult?.systemPrompt) ?? "";
					if (legacySystemPrompt) {
						applySystemPromptOverrideToSession(activeSession, legacySystemPrompt);
						systemPromptText = legacySystemPrompt;
						log$3.debug(`hooks: applied systemPrompt override (${legacySystemPrompt.length} chars)`);
					}
					const prependedOrAppendedSystemPrompt = composeSystemPromptWithHookContext({
						baseSystemPrompt: systemPromptText,
						prependSystemContext: resolveAttemptPrependSystemContext({
							sessionKey: params.sessionKey,
							trigger: params.trigger,
							hookPrependSystemContext: hookResult?.prependSystemContext
						}),
						appendSystemContext: hookResult?.appendSystemContext
					});
					if (prependedOrAppendedSystemPrompt) {
						const prependSystemLen = hookResult?.prependSystemContext?.trim().length ?? 0;
						const appendSystemLen = hookResult?.appendSystemContext?.trim().length ?? 0;
						applySystemPromptOverrideToSession(activeSession, prependedOrAppendedSystemPrompt);
						systemPromptText = prependedOrAppendedSystemPrompt;
						log$3.debug(`hooks: applied prependSystemContext/appendSystemContext (${prependSystemLen}+${appendSystemLen} chars)`);
					}
				}
				if (cacheObservabilityEnabled) {
					const cacheObservation = beginPromptCacheObservation({
						sessionId: params.sessionId,
						sessionKey: params.sessionKey,
						provider: params.provider,
						modelId: params.modelId,
						modelApi: params.model.api,
						cacheRetention: effectivePromptCacheRetention,
						streamStrategy,
						transport: effectiveAgentTransport,
						systemPrompt: systemPromptText,
						toolNames: promptCacheToolNames
					});
					promptCacheChangesForTurn = cacheObservation.changes;
					cacheTrace?.recordStage("cache:state", { options: {
						snapshot: cacheObservation.snapshot,
						previousCacheRead: cacheObservation.previousCacheRead ?? void 0,
						changes: cacheObservation.changes?.map((change) => ({
							code: change.code,
							detail: change.detail
						})) ?? void 0
					} });
				}
				const googlePromptCacheStreamFn = await prepareGooglePromptCacheStreamFn({
					apiKey: await resolveEmbeddedAgentApiKey({
						provider: params.provider,
						resolvedApiKey: params.resolvedApiKey,
						authStorage: params.authStorage
					}),
					extraParams: effectiveExtraParams,
					model: params.model,
					modelId: params.modelId,
					provider: params.provider,
					sessionManager,
					signal: runAbortController.signal,
					streamFn: activeSession.agent.streamFn,
					systemPrompt: systemPromptText
				});
				if (googlePromptCacheStreamFn) activeSession.agent.streamFn = googlePromptCacheStreamFn;
				const routingSummary = describeProviderRequestRoutingSummary({
					provider: params.provider,
					api: params.model.api,
					baseUrl: params.model.baseUrl,
					capability: "llm",
					transport: "stream"
				});
				log$3.debug(`embedded run prompt start: runId=${params.runId} sessionId=${params.sessionId} ` + routingSummary);
				cacheTrace?.recordStage("prompt:before", {
					prompt: effectivePrompt,
					messages: activeSession.messages
				});
				const leafEntry = sessionManager.getLeafEntry();
				if (leafEntry?.type === "message" && leafEntry.message.role === "user") {
					const orphanPromptMerge = mergeOrphanedTrailingUserPrompt({
						prompt: effectivePrompt,
						trigger: params.trigger,
						leafMessage: leafEntry.message
					});
					effectivePrompt = orphanPromptMerge.prompt;
					if (leafEntry.parentId) sessionManager.branch(leafEntry.parentId);
					else sessionManager.resetLeaf();
					const sessionContext = sessionManager.buildSessionContext();
					activeSession.agent.state.messages = sessionContext.messages;
					const orphanRepairMessage = `${orphanPromptMerge.merged ? "Merged and removed" : "Removed"} orphaned user message to prevent consecutive user turns. runId=${params.runId} sessionId=${params.sessionId} trigger=${params.trigger}`;
					if (shouldWarnOnOrphanedUserRepair(params.trigger)) log$3.warn(orphanRepairMessage);
					else log$3.debug(orphanRepairMessage);
				}
				const transcriptLeafId = sessionManager.getLeafEntry()?.id ?? null;
				const heartbeatSummary = params.config && sessionAgentId ? resolveHeartbeatSummaryForAgent(params.config, sessionAgentId) : void 0;
				try {
					if (pruneProcessedHistoryImages(activeSession.messages)) activeSession.agent.state.messages = activeSession.messages;
					const filteredMessages = filterHeartbeatPairs(activeSession.messages, heartbeatSummary?.ackMaxChars, heartbeatSummary?.prompt);
					if (filteredMessages.length < activeSession.messages.length) activeSession.agent.state.messages = filteredMessages;
					prePromptMessageCount = activeSession.messages.length;
					const imageResult = await detectAndLoadPromptImages({
						prompt: effectivePrompt,
						workspaceDir: effectiveWorkspace,
						model: params.model,
						existingImages: params.images,
						imageOrder: params.imageOrder,
						maxBytes: MAX_IMAGE_BYTES,
						maxDimensionPx: resolveImageSanitizationLimits(params.config).maxDimensionPx,
						workspaceOnly: effectiveFsWorkspaceOnly,
						sandbox: sandbox?.enabled && sandbox?.fsBridge ? {
							root: sandbox.workspaceDir,
							bridge: sandbox.fsBridge
						} : void 0
					});
					cacheTrace?.recordStage("prompt:images", {
						prompt: effectivePrompt,
						messages: activeSession.messages,
						note: `images: prompt=${imageResult.images.length}`
					});
					if (log$3.isEnabled("debug")) {
						const msgCount = activeSession.messages.length;
						const systemLen = systemPromptText?.length ?? 0;
						const promptLen = effectivePrompt.length;
						const sessionSummary = summarizeSessionContext(activeSession.messages);
						log$3.debug(`[context-diag] pre-prompt: sessionKey=${params.sessionKey ?? params.sessionId} messages=${msgCount} roleCounts=${sessionSummary.roleCounts} historyTextChars=${sessionSummary.totalTextChars} maxMessageTextChars=${sessionSummary.maxMessageTextChars} historyImageBlocks=${sessionSummary.totalImageBlocks} systemPromptChars=${systemLen} promptChars=${promptLen} promptImages=${imageResult.images.length} provider=${params.provider}/${params.modelId} sessionFile=${params.sessionFile}`);
					}
					if (hookRunner?.hasHooks("llm_input")) hookRunner.runLlmInput({
						runId: params.runId,
						sessionId: params.sessionId,
						provider: params.provider,
						model: params.modelId,
						systemPrompt: systemPromptText,
						prompt: effectivePrompt,
						historyMessages: activeSession.messages,
						imagesCount: imageResult.images.length
					}, {
						runId: params.runId,
						agentId: hookAgentId,
						sessionKey: params.sessionKey,
						sessionId: params.sessionId,
						workspaceDir: params.workspaceDir,
						messageProvider: params.messageProvider ?? void 0,
						trigger: params.trigger,
						channelId: params.messageChannel ?? params.messageProvider ?? void 0
					}).catch((err) => {
						log$3.warn(`llm_input hook failed: ${String(err)}`);
					});
					const reserveTokens = settingsManager.getCompactionReserveTokens();
					const contextTokenBudget = params.contextTokenBudget ?? 2e5;
					const preemptiveCompaction = params.contextEngine?.info?.ownsCompaction === true ? {
						route: "fits",
						shouldCompact: false,
						estimatedPromptTokens: 0,
						promptBudgetBeforeReserve: 0,
						overflowTokens: 0,
						toolResultReducibleChars: 0,
						effectiveReserveTokens: reserveTokens
					} : shouldPreemptivelyCompactBeforePrompt({
						messages: activeSession.messages,
						systemPrompt: systemPromptText,
						prompt: effectivePrompt,
						contextTokenBudget,
						reserveTokens,
						toolResultMaxChars: resolveLiveToolResultMaxChars({
							contextWindowTokens: contextTokenBudget,
							cfg: params.config,
							agentId: sessionAgentId
						})
					});
					if (preemptiveCompaction.route === "truncate_tool_results_only") {
						const toolResultMaxChars = resolveLiveToolResultMaxChars({
							contextWindowTokens: contextTokenBudget,
							cfg: params.config,
							agentId: sessionAgentId
						});
						const truncationResult = truncateOversizedToolResultsInSessionManager({
							sessionManager,
							contextWindowTokens: contextTokenBudget,
							maxCharsOverride: toolResultMaxChars,
							sessionFile: params.sessionFile,
							sessionId: params.sessionId,
							sessionKey: params.sessionKey
						});
						if (truncationResult.truncated) {
							preflightRecovery = {
								route: "truncate_tool_results_only",
								handled: true,
								truncatedCount: truncationResult.truncatedCount
							};
							log$3.info(`[context-overflow-precheck] early tool-result truncation succeeded for ${params.provider}/${params.modelId} route=${preemptiveCompaction.route} truncatedCount=${truncationResult.truncatedCount} estimatedPromptTokens=${preemptiveCompaction.estimatedPromptTokens} promptBudgetBeforeReserve=${preemptiveCompaction.promptBudgetBeforeReserve} overflowTokens=${preemptiveCompaction.overflowTokens} toolResultReducibleChars=${preemptiveCompaction.toolResultReducibleChars} effectiveReserveTokens=${preemptiveCompaction.effectiveReserveTokens} sessionFile=${params.sessionFile}`);
							skipPromptSubmission = true;
						}
						if (!skipPromptSubmission) {
							log$3.warn(`[context-overflow-precheck] early tool-result truncation did not help for ${params.provider}/${params.modelId}; falling back to compaction reason=${truncationResult.reason ?? "unknown"} sessionFile=${params.sessionFile}`);
							preflightRecovery = { route: "compact_only" };
							promptError = new Error(PREEMPTIVE_OVERFLOW_ERROR_TEXT);
							promptErrorSource = "precheck";
							skipPromptSubmission = true;
						}
					}
					if (preemptiveCompaction.shouldCompact) {
						preflightRecovery = preemptiveCompaction.route === "compact_then_truncate" ? { route: "compact_then_truncate" } : { route: "compact_only" };
						promptError = new Error(PREEMPTIVE_OVERFLOW_ERROR_TEXT);
						promptErrorSource = "precheck";
						log$3.warn(`[context-overflow-precheck] sessionKey=${params.sessionKey ?? params.sessionId} provider=${params.provider}/${params.modelId} route=${preemptiveCompaction.route} estimatedPromptTokens=${preemptiveCompaction.estimatedPromptTokens} promptBudgetBeforeReserve=${preemptiveCompaction.promptBudgetBeforeReserve} overflowTokens=${preemptiveCompaction.overflowTokens} toolResultReducibleChars=${preemptiveCompaction.toolResultReducibleChars} reserveTokens=${reserveTokens} effectiveReserveTokens=${preemptiveCompaction.effectiveReserveTokens} sessionFile=${params.sessionFile}`);
						skipPromptSubmission = true;
					}
					if (!skipPromptSubmission) {
						finalPromptText = effectivePrompt;
						const btwSnapshotMessages = activeSession.messages.slice(-MAX_BTW_SNAPSHOT_MESSAGES);
						updateActiveEmbeddedRunSnapshot(params.sessionId, {
							transcriptLeafId,
							messages: btwSnapshotMessages,
							inFlightPrompt: effectivePrompt
						});
						if (imageResult.images.length > 0) await abortable(activeSession.prompt(effectivePrompt, { images: imageResult.images }));
						else await abortable(activeSession.prompt(effectivePrompt));
					}
				} catch (err) {
					yieldAborted = yieldDetected && isRunnerAbortError(err) && err instanceof Error && err.cause === "sessions_yield";
					if (yieldAborted) {
						aborted = false;
						await waitForSessionsYieldAbortSettle({
							settlePromise: yieldAbortSettled,
							runId: params.runId,
							sessionId: params.sessionId
						});
						stripSessionsYieldArtifacts(activeSession);
						if (yieldMessage) await persistSessionsYieldContextMessage(activeSession, yieldMessage);
					} else {
						promptError = err;
						promptErrorSource = "prompt";
					}
				} finally {
					log$3.debug(`embedded run prompt end: runId=${params.runId} sessionId=${params.sessionId} durationMs=${Date.now() - promptStartedAt}`);
				}
				const wasCompactingBefore = activeSession.isCompacting;
				const snapshot = activeSession.messages.slice();
				const wasCompactingAfter = activeSession.isCompacting;
				const preCompactionSnapshot = wasCompactingBefore || wasCompactingAfter ? null : snapshot;
				const preCompactionSessionId = activeSession.sessionId;
				const COMPACTION_RETRY_AGGREGATE_TIMEOUT_MS = 6e4;
				try {
					if (params.onBlockReplyFlush) await params.onBlockReplyFlush();
					if ((yieldAborted ? { timedOut: false } : await waitForCompactionRetryWithAggregateTimeout({
						waitForCompactionRetry,
						abortable,
						aggregateTimeoutMs: COMPACTION_RETRY_AGGREGATE_TIMEOUT_MS,
						isCompactionStillInFlight: isCompactionInFlight
					})).timedOut) {
						timedOutDuringCompaction = true;
						if (!isProbeSession) log$3.warn(`compaction retry aggregate timeout (${COMPACTION_RETRY_AGGREGATE_TIMEOUT_MS}ms): proceeding with pre-compaction state runId=${params.runId} sessionId=${params.sessionId}`);
					}
				} catch (err) {
					if (isRunnerAbortError(err)) {
						if (!promptError) {
							promptError = err;
							promptErrorSource = "compaction";
						}
						if (!isProbeSession) log$3.debug(`compaction wait aborted: runId=${params.runId} sessionId=${params.sessionId}`);
					} else throw err;
				}
				const compactionOccurredThisAttempt = getCompactionCount() > 0;
				appendAttemptCacheTtlIfNeeded({
					sessionManager,
					timedOutDuringCompaction,
					compactionOccurredThisAttempt,
					config: params.config,
					provider: params.provider,
					modelId: params.modelId,
					modelApi: params.model.api,
					isCacheTtlEligibleProvider
				});
				const snapshotSelection = selectCompactionTimeoutSnapshot({
					timedOutDuringCompaction,
					preCompactionSnapshot,
					preCompactionSessionId,
					currentSnapshot: activeSession.messages.slice(),
					currentSessionId: activeSession.sessionId
				});
				if (timedOutDuringCompaction) {
					if (!isProbeSession) log$3.warn(`using ${snapshotSelection.source} snapshot: timed out during compaction runId=${params.runId} sessionId=${params.sessionId}`);
				}
				messagesSnapshot = snapshotSelection.messagesSnapshot;
				sessionIdUsed = snapshotSelection.sessionIdUsed;
				lastAssistant = messagesSnapshot.slice().toReversed().find((m) => m.role === "assistant");
				currentAttemptAssistant = findCurrentAttemptAssistantMessage({
					messagesSnapshot,
					prePromptMessageCount
				});
				attemptUsage = getUsageTotals();
				cacheBreak = cacheObservabilityEnabled ? completePromptCacheObservation({
					sessionId: params.sessionId,
					sessionKey: params.sessionKey,
					usage: attemptUsage
				}) : null;
				const lastCallUsage = normalizeUsage(currentAttemptAssistant?.usage);
				const promptCacheObservation = cacheObservabilityEnabled && (cacheBreak || promptCacheChangesForTurn || typeof attemptUsage?.cacheRead === "number") ? {
					broke: Boolean(cacheBreak),
					...typeof cacheBreak?.previousCacheRead === "number" ? { previousCacheRead: cacheBreak.previousCacheRead } : {},
					...typeof cacheBreak?.cacheRead === "number" ? { cacheRead: cacheBreak.cacheRead } : typeof attemptUsage?.cacheRead === "number" ? { cacheRead: attemptUsage.cacheRead } : {},
					changes: cacheBreak?.changes ?? promptCacheChangesForTurn
				} : void 0;
				const fallbackLastCacheTouchAt = readLastCacheTtlTimestamp(sessionManager, {
					provider: params.provider,
					modelId: params.modelId
				});
				promptCache = buildContextEnginePromptCacheInfo({
					retention: effectivePromptCacheRetention,
					lastCallUsage,
					observation: promptCacheObservation,
					lastCacheTouchAt: resolvePromptCacheTouchTimestamp({
						lastCallUsage,
						assistantTimestamp: currentAttemptAssistant?.timestamp,
						fallbackLastCacheTouchAt
					})
				});
				if (promptError && promptErrorSource === "prompt" && !compactionOccurredThisAttempt) try {
					sessionManager.appendCustomEntry("openclaw:prompt-error", {
						timestamp: Date.now(),
						runId: params.runId,
						sessionId: params.sessionId,
						provider: params.provider,
						model: params.modelId,
						api: params.model.api,
						error: formatErrorMessage(promptError)
					});
				} catch (entryErr) {
					log$3.warn(`failed to persist prompt error entry: ${String(entryErr)}`);
				}
				if (params.contextEngine) {
					const runtimeCurrentTokenCount = derivePromptTokens(lastCallUsage);
					const afterTurnRuntimeContext = buildAfterTurnRuntimeContext({
						attempt: params,
						workspaceDir: effectiveWorkspace,
						agentDir,
						tokenBudget: params.contextTokenBudget,
						currentTokenCount: runtimeCurrentTokenCount,
						promptCache
					});
					await finalizeAttemptContextEngineTurn({
						contextEngine: params.contextEngine,
						promptError: Boolean(promptError),
						aborted,
						yieldAborted,
						sessionIdUsed,
						sessionKey: params.sessionKey,
						sessionFile: params.sessionFile,
						messagesSnapshot,
						prePromptMessageCount,
						tokenBudget: params.contextTokenBudget,
						runtimeContext: afterTurnRuntimeContext,
						runMaintenance: async (contextParams) => await runContextEngineMaintenance({
							contextEngine: contextParams.contextEngine,
							sessionId: contextParams.sessionId,
							sessionKey: contextParams.sessionKey,
							sessionFile: contextParams.sessionFile,
							reason: contextParams.reason,
							sessionManager: contextParams.sessionManager,
							runtimeContext: contextParams.runtimeContext
						}),
						sessionManager,
						warn: (message) => log$3.warn(message)
					});
				}
				if (shouldPersistCompletedBootstrapTurn({
					shouldRecordCompletedBootstrapTurn,
					promptError,
					aborted,
					timedOutDuringCompaction,
					compactionOccurredThisAttempt
				})) try {
					sessionManager.appendCustomEntry(FULL_BOOTSTRAP_COMPLETED_CUSTOM_TYPE, {
						timestamp: Date.now(),
						runId: params.runId,
						sessionId: params.sessionId
					});
				} catch (entryErr) {
					log$3.warn(`failed to persist bootstrap completion entry: ${String(entryErr)}`);
				}
				cacheTrace?.recordStage("session:after", {
					messages: messagesSnapshot,
					note: timedOutDuringCompaction ? "compaction timeout" : promptError ? "prompt error" : void 0
				});
				anthropicPayloadLogger?.recordUsage(messagesSnapshot, promptError);
				if (hookRunner?.hasHooks("agent_end")) hookRunner.runAgentEnd({
					messages: messagesSnapshot,
					success: !aborted && !promptError,
					error: promptError ? formatErrorMessage(promptError) : void 0,
					durationMs: Date.now() - promptStartedAt
				}, {
					runId: params.runId,
					agentId: hookAgentId,
					sessionKey: params.sessionKey,
					sessionId: params.sessionId,
					workspaceDir: params.workspaceDir,
					messageProvider: params.messageProvider ?? void 0,
					trigger: params.trigger,
					channelId: params.messageChannel ?? params.messageProvider ?? void 0
				}).catch((err) => {
					log$3.warn(`agent_end hook failed: ${err}`);
				});
			} finally {
				clearTimeout(abortTimer);
				if (abortWarnTimer) clearTimeout(abortWarnTimer);
				if (!isProbeSession && (aborted || timedOut) && !timedOutDuringCompaction) log$3.debug(`run cleanup: runId=${params.runId} sessionId=${params.sessionId} aborted=${aborted} timedOut=${timedOut}`);
				try {
					unsubscribe();
				} catch (err) {
					log$3.error(`CRITICAL: unsubscribe failed, possible resource leak: runId=${params.runId} ${String(err)}`);
				}
				if (params.replyOperation) params.replyOperation.detachBackend(queueHandle);
				clearActiveEmbeddedRun(params.sessionId, queueHandle, params.sessionKey);
				params.abortSignal?.removeEventListener?.("abort", onAbort);
			}
			const toolMetasNormalized = toolMetas.filter((entry) => typeof entry.toolName === "string" && entry.toolName.trim().length > 0).map((entry) => ({
				toolName: entry.toolName,
				meta: entry.meta
			}));
			if (cacheObservabilityEnabled) {
				if (cacheBreak) {
					const changeSummary = cacheBreak.changes?.map((change) => `${change.code}(${change.detail})`).join(", ") ?? "no tracked cache input change";
					log$3.warn(`[prompt-cache] cache read dropped ${cacheBreak.previousCacheRead} -> ${cacheBreak.cacheRead} for ${params.provider}/${params.modelId} via ${streamStrategy}; ${changeSummary}`);
					cacheTrace?.recordStage("cache:result", { options: {
						previousCacheRead: cacheBreak.previousCacheRead,
						cacheRead: cacheBreak.cacheRead,
						changes: cacheBreak.changes?.map((change) => ({
							code: change.code,
							detail: change.detail
						})) ?? void 0
					} });
				} else if (cacheTrace && promptCacheChangesForTurn) cacheTrace.recordStage("cache:result", {
					note: "state changed without a cache-read break",
					options: {
						cacheRead: attemptUsage?.cacheRead ?? 0,
						changes: promptCacheChangesForTurn.map((change) => ({
							code: change.code,
							detail: change.detail
						}))
					}
				});
				else if (cacheTrace) cacheTrace.recordStage("cache:result", {
					note: "stable cache inputs",
					options: { cacheRead: attemptUsage?.cacheRead ?? 0 }
				});
			}
			if (hookRunner?.hasHooks("llm_output")) hookRunner.runLlmOutput({
				runId: params.runId,
				sessionId: params.sessionId,
				provider: params.provider,
				model: params.modelId,
				assistantTexts,
				lastAssistant,
				usage: attemptUsage
			}, {
				runId: params.runId,
				agentId: hookAgentId,
				sessionKey: params.sessionKey,
				sessionId: params.sessionId,
				workspaceDir: params.workspaceDir,
				messageProvider: params.messageProvider ?? void 0,
				trigger: params.trigger,
				channelId: params.messageChannel ?? params.messageProvider ?? void 0
			}).catch((err) => {
				log$3.warn(`llm_output hook failed: ${String(err)}`);
			});
			const observedReplayMetadata = buildAttemptReplayMetadata({
				toolMetas: toolMetasNormalized,
				didSendViaMessagingTool: didSendViaMessagingTool(),
				successfulCronAdds: getSuccessfulCronAdds()
			});
			return {
				replayMetadata: replayMetadataFromState(observeReplayMetadata(getReplayState(), observedReplayMetadata)),
				itemLifecycle: getItemLifecycle(),
				setTerminalLifecycleMeta,
				aborted,
				externalAbort,
				timedOut,
				idleTimedOut,
				timedOutDuringCompaction,
				promptError,
				promptErrorSource,
				preflightRecovery,
				sessionIdUsed,
				bootstrapPromptWarningSignaturesSeen: bootstrapPromptWarning.warningSignaturesSeen,
				bootstrapPromptWarningSignature: bootstrapPromptWarning.signature,
				systemPromptReport,
				finalPromptText,
				messagesSnapshot,
				assistantTexts,
				toolMetas: toolMetasNormalized,
				lastAssistant,
				currentAttemptAssistant,
				lastToolError: getLastToolError?.(),
				didSendViaMessagingTool: didSendViaMessagingTool(),
				messagingToolSentTexts: getMessagingToolSentTexts(),
				messagingToolSentMediaUrls: getMessagingToolSentMediaUrls(),
				messagingToolSentTargets: getMessagingToolSentTargets(),
				successfulCronAdds: getSuccessfulCronAdds(),
				cloudCodeAssistFormatError: Boolean(lastAssistant?.errorMessage && isCloudCodeAssistFormatError(lastAssistant.errorMessage)),
				attemptUsage,
				promptCache,
				compactionCount: getCompactionCount(),
				clientToolCall: clientToolCallDetected ?? void 0,
				yieldDetected: yieldDetected || void 0
			};
		} finally {
			await cleanupEmbeddedAttemptResources({
				removeToolResultContextGuard,
				flushPendingToolResultsAfterIdle,
				session,
				sessionManager,
				releaseWsSession,
				sessionId: params.sessionId,
				bundleLspRuntime,
				sessionLock
			});
		}
	} finally {
		restoreSkillEnv?.();
	}
}
//#endregion
//#region src/agents/harness/builtin-pi.ts
function createPiAgentHarness() {
	return {
		id: "pi",
		label: "PI embedded agent",
		supports: () => ({
			supported: true,
			priority: 0
		}),
		runAttempt: runEmbeddedAttempt
	};
}
//#endregion
//#region src/agents/harness/selection.ts
const log = createSubsystemLogger("agents/harness");
function listPluginAgentHarnesses() {
	return listRegisteredAgentHarnesses().map((entry) => entry.harness);
}
function compareHarnessSupport(left, right) {
	const priorityDelta = (right.support.priority ?? 0) - (left.support.priority ?? 0);
	if (priorityDelta !== 0) return priorityDelta;
	return left.harness.id.localeCompare(right.harness.id);
}
function selectAgentHarness(params) {
	const policy = resolveAgentHarnessPolicy(params);
	const pluginHarnesses = listPluginAgentHarnesses();
	const piHarness = createPiAgentHarness();
	const runtime = policy.runtime;
	if (runtime === "pi") return piHarness;
	if (runtime !== "auto") {
		const forced = pluginHarnesses.find((entry) => entry.id === runtime);
		if (forced) return forced;
		if (policy.fallback === "none") throw new Error(`Requested agent harness "${runtime}" is not registered and PI fallback is disabled.`);
		log.warn("requested agent harness is not registered; falling back to embedded PI backend", { requestedRuntime: runtime });
		return piHarness;
	}
	const selected = pluginHarnesses.map((harness) => ({
		harness,
		support: harness.supports({
			provider: params.provider,
			modelId: params.modelId,
			requestedRuntime: runtime
		})
	})).filter((entry) => entry.support.supported).toSorted(compareHarnessSupport)[0]?.harness;
	if (selected) return selected;
	if (policy.fallback === "none") throw new Error(`No registered agent harness supports ${formatProviderModel(params)} and PI fallback is disabled.`);
	return piHarness;
}
async function runAgentHarnessAttemptWithFallback(params) {
	const policy = resolveAgentHarnessPolicy({
		provider: params.provider,
		modelId: params.modelId,
		config: params.config,
		agentId: params.agentId,
		sessionKey: params.sessionKey
	});
	const harness = selectAgentHarness({
		provider: params.provider,
		modelId: params.modelId,
		config: params.config,
		agentId: params.agentId,
		sessionKey: params.sessionKey
	});
	if (harness.id === "pi") return harness.runAttempt(params);
	try {
		return await harness.runAttempt(params);
	} catch (error) {
		if (policy.runtime !== "auto" || policy.fallback === "none") throw error;
		log.warn(`${harness.label} failed; falling back to embedded PI backend`, { error });
		return createPiAgentHarness().runAttempt(params);
	}
}
async function maybeCompactAgentHarnessSession(params) {
	const harness = selectAgentHarness({
		provider: params.provider ?? "",
		modelId: params.model,
		config: params.config,
		sessionKey: params.sessionKey
	});
	if (!harness.compact) return;
	return harness.compact(params);
}
function resolveAgentHarnessPolicy(params) {
	const env = params.env ?? process.env;
	const agentPolicy = resolveAgentEmbeddedHarnessConfig(params.config, {
		agentId: params.agentId,
		sessionKey: params.sessionKey
	});
	const defaultsPolicy = params.config?.agents?.defaults?.embeddedHarness;
	return {
		runtime: env.OPENCLAW_AGENT_RUNTIME?.trim() ? resolveEmbeddedAgentRuntime(env) : normalizeEmbeddedAgentRuntime(agentPolicy?.runtime ?? defaultsPolicy?.runtime),
		fallback: resolveEmbeddedAgentHarnessFallback(env) ?? normalizeAgentHarnessFallback(agentPolicy?.fallback ?? defaultsPolicy?.fallback)
	};
}
function resolveAgentEmbeddedHarnessConfig(config, params) {
	if (!config) return;
	const { sessionAgentId } = resolveSessionAgentIds({
		config,
		agentId: params.agentId,
		sessionKey: params.sessionKey
	});
	return listAgentEntries(config).find((entry) => normalizeAgentId(entry.id) === sessionAgentId)?.embeddedHarness;
}
function normalizeAgentHarnessFallback(value) {
	return value === "none" ? "none" : "pi";
}
function formatProviderModel(params) {
	return params.modelId ? `${params.provider}/${params.modelId}` : params.provider;
}
//#endregion
//#region src/agents/pi-embedded-runner/compact.queued.ts
/**
* Compacts a session with lane queueing (session lane + global lane).
* Use this from outside a lane context. If already inside a lane, use
* `compactEmbeddedPiSessionDirect` to avoid deadlocks.
*/
async function compactEmbeddedPiSession(params) {
	const harnessResult = await maybeCompactAgentHarnessSession(params);
	if (harnessResult) return harnessResult;
	const sessionLane = resolveSessionLane(params.sessionKey?.trim() || params.sessionId);
	const globalLane = resolveGlobalLane(params.lane);
	const enqueueGlobal = params.enqueue ?? ((task, opts) => enqueueCommandInLane(globalLane, task, opts));
	return enqueueCommandInLane(sessionLane, () => enqueueGlobal(async () => {
		ensureRuntimePluginsLoaded({
			config: params.config,
			workspaceDir: params.workspaceDir,
			allowGatewaySubagentBinding: params.allowGatewaySubagentBinding
		});
		ensureContextEnginesInitialized();
		const contextEngine = await resolveContextEngine(params.config);
		let checkpointSnapshot = null;
		let checkpointSnapshotRetained = false;
		try {
			const agentDir = params.agentDir ?? resolveOpenClawAgentDir();
			const resolvedCompactionTarget = resolveEmbeddedCompactionTarget({
				config: params.config,
				provider: params.provider,
				modelId: params.model,
				authProfileId: params.authProfileId,
				defaultProvider: DEFAULT_PROVIDER,
				defaultModel: DEFAULT_MODEL
			});
			const ceProvider = resolvedCompactionTarget.provider ?? "openai";
			const ceModelId = resolvedCompactionTarget.model ?? "gpt-5.4";
			const { model: ceModel } = await resolveModelAsync(ceProvider, ceModelId, agentDir, params.config);
			const ceRuntimeModel = ceModel;
			const ceCtxInfo = resolveContextWindowInfo({
				cfg: params.config,
				provider: ceProvider,
				modelId: ceModelId,
				modelContextTokens: readPiModelContextTokens(ceModel),
				modelContextWindow: ceRuntimeModel?.contextWindow,
				defaultTokens: DEFAULT_CONTEXT_TOKENS
			});
			const engineOwnsCompaction = contextEngine.info.ownsCompaction === true;
			checkpointSnapshot = engineOwnsCompaction ? captureCompactionCheckpointSnapshot({
				sessionManager: SessionManager.open(params.sessionFile),
				sessionFile: params.sessionFile
			}) : null;
			const hookRunner = engineOwnsCompaction ? asCompactionHookRunner(getGlobalHookRunner()) : null;
			const hookSessionKey = params.sessionKey?.trim() || params.sessionId;
			const { sessionAgentId } = resolveSessionAgentIds({
				sessionKey: params.sessionKey,
				config: params.config
			});
			const resolvedMessageProvider = params.messageChannel ?? params.messageProvider;
			const hookCtx = {
				sessionId: params.sessionId,
				agentId: sessionAgentId,
				sessionKey: hookSessionKey,
				workspaceDir: resolveUserPath(params.workspaceDir),
				messageProvider: resolvedMessageProvider
			};
			const runtimeContext = {
				...params,
				...buildEmbeddedCompactionRuntimeContext({
					sessionKey: params.sessionKey,
					messageChannel: params.messageChannel,
					messageProvider: params.messageProvider,
					agentAccountId: params.agentAccountId,
					currentChannelId: params.currentChannelId,
					currentThreadTs: params.currentThreadTs,
					currentMessageId: params.currentMessageId,
					authProfileId: params.authProfileId,
					workspaceDir: params.workspaceDir,
					agentDir,
					config: params.config,
					skillsSnapshot: params.skillsSnapshot,
					senderIsOwner: params.senderIsOwner,
					senderId: params.senderId,
					provider: params.provider,
					modelId: params.model,
					thinkLevel: params.thinkLevel,
					reasoningLevel: params.reasoningLevel,
					bashElevated: params.bashElevated,
					extraSystemPrompt: params.extraSystemPrompt,
					ownerNumbers: params.ownerNumbers
				})
			};
			if (hookRunner?.hasHooks?.("before_compaction") && hookRunner.runBeforeCompaction) try {
				await hookRunner.runBeforeCompaction({
					messageCount: -1,
					sessionFile: params.sessionFile
				}, hookCtx);
			} catch (err) {
				log$3.warn("before_compaction hook failed", { errorMessage: formatErrorMessage(err) });
			}
			const result = await contextEngine.compact({
				sessionId: params.sessionId,
				sessionKey: params.sessionKey,
				sessionFile: params.sessionFile,
				tokenBudget: ceCtxInfo.tokens,
				currentTokenCount: params.currentTokenCount,
				compactionTarget: params.trigger === "manual" ? "threshold" : "budget",
				customInstructions: params.customInstructions,
				force: params.trigger === "manual",
				runtimeContext
			});
			if (result.ok && result.compacted) {
				if (params.config && params.sessionKey && checkpointSnapshot) try {
					const postLeafId = SessionManager.open(params.sessionFile).getLeafId() ?? void 0;
					checkpointSnapshotRetained = await persistSessionCompactionCheckpoint({
						cfg: params.config,
						sessionKey: params.sessionKey,
						sessionId: params.sessionId,
						reason: resolveSessionCompactionCheckpointReason({ trigger: params.trigger }),
						snapshot: checkpointSnapshot,
						summary: result.result?.summary,
						firstKeptEntryId: result.result?.firstKeptEntryId,
						tokensBefore: result.result?.tokensBefore,
						tokensAfter: result.result?.tokensAfter,
						postSessionFile: params.sessionFile,
						postLeafId,
						postEntryId: postLeafId
					}) !== null;
				} catch (err) {
					log$3.warn("failed to persist compaction checkpoint", { errorMessage: formatErrorMessage(err) });
				}
				await runContextEngineMaintenance({
					contextEngine,
					sessionId: params.sessionId,
					sessionKey: params.sessionKey,
					sessionFile: params.sessionFile,
					reason: "compaction",
					runtimeContext
				});
			}
			if (engineOwnsCompaction && result.ok && result.compacted) await runPostCompactionSideEffects({
				config: params.config,
				sessionKey: params.sessionKey,
				sessionFile: params.sessionFile
			});
			if (result.ok && result.compacted && hookRunner?.hasHooks?.("after_compaction") && hookRunner.runAfterCompaction) try {
				await hookRunner.runAfterCompaction({
					messageCount: -1,
					compactedCount: -1,
					tokenCount: result.result?.tokensAfter,
					sessionFile: params.sessionFile
				}, hookCtx);
			} catch (err) {
				log$3.warn("after_compaction hook failed", { errorMessage: formatErrorMessage(err) });
			}
			return {
				ok: result.ok,
				compacted: result.compacted,
				reason: result.reason,
				result: result.result ? {
					summary: result.result.summary ?? "",
					firstKeptEntryId: result.result.firstKeptEntryId ?? "",
					tokensBefore: result.result.tokensBefore,
					tokensAfter: result.result.tokensAfter,
					details: result.result.details
				} : void 0
			};
		} finally {
			if (!checkpointSnapshotRetained) await cleanupCompactionCheckpointSnapshot(checkpointSnapshot);
			await contextEngine.dispose?.();
		}
	}));
}
//#endregion
//#region src/agents/pi-embedded-runner/run/failover-policy.ts
function shouldEscalateRetryLimit(reason) {
	return Boolean(reason && reason !== "timeout" && reason !== "model_not_found" && reason !== "format" && reason !== "session_expired");
}
function shouldRotatePrompt(params) {
	return params.failoverFailure && params.failoverReason !== "timeout";
}
function shouldRotateAssistant(params) {
	return !params.aborted && (params.failoverFailure || params.failoverReason !== null) || params.timedOut && !params.timedOutDuringCompaction;
}
function mergeRetryFailoverReason(params) {
	return params.failoverReason ?? (params.timedOut ? "timeout" : null) ?? params.previous;
}
function resolveRunFailoverDecision(params) {
	if (params.stage === "retry_limit") {
		if (params.fallbackConfigured && shouldEscalateRetryLimit(params.failoverReason)) return {
			action: "fallback_model",
			reason: params.failoverReason ?? "unknown"
		};
		return { action: "return_error_payload" };
	}
	if (params.stage === "prompt") {
		if (params.externalAbort) return {
			action: "surface_error",
			reason: params.failoverReason
		};
		if (!params.profileRotated && shouldRotatePrompt(params)) return {
			action: "rotate_profile",
			reason: params.failoverReason
		};
		if (params.fallbackConfigured && params.failoverFailure) return {
			action: "fallback_model",
			reason: params.failoverReason ?? "unknown"
		};
		return {
			action: "surface_error",
			reason: params.failoverReason
		};
	}
	if (params.externalAbort) return {
		action: "surface_error",
		reason: params.failoverReason
	};
	const assistantShouldRotate = shouldRotateAssistant(params);
	if (!params.profileRotated && assistantShouldRotate) return {
		action: "rotate_profile",
		reason: params.failoverReason
	};
	if (assistantShouldRotate && params.fallbackConfigured) return {
		action: "fallback_model",
		reason: params.timedOut ? "timeout" : params.failoverReason ?? "unknown"
	};
	if (!assistantShouldRotate) return { action: "continue_normal" };
	return {
		action: "surface_error",
		reason: params.failoverReason
	};
}
//#endregion
//#region src/agents/pi-embedded-runner/run/assistant-failover.ts
async function handleAssistantFailover(params) {
	let overloadProfileRotations = params.overloadProfileRotations;
	let decision = params.initialDecision;
	const sameModelIdleTimeoutRetry = () => {
		params.warn(`[llm-idle-timeout] ${sanitizeForLog(params.provider)}/${sanitizeForLog(params.modelId)} produced no reply before the idle watchdog; retrying same model`);
		return {
			action: "retry",
			overloadProfileRotations,
			retryKind: "same_model_idle_timeout",
			lastRetryFailoverReason: mergeRetryFailoverReason({
				previous: params.previousRetryFailoverReason,
				failoverReason: params.failoverReason,
				timedOut: true
			})
		};
	};
	if (decision.action === "rotate_profile") {
		if (params.lastProfileId) {
			const reason = params.timedOut ? "timeout" : params.assistantProfileFailureReason;
			await params.maybeMarkAuthProfileFailure({
				profileId: params.lastProfileId,
				reason,
				modelId: params.modelId
			});
			if (params.timedOut && !params.isProbeSession) params.warn(`Profile ${params.lastProfileId} timed out. Trying next account...`);
			if (params.cloudCodeAssistFormatError) params.warn(`Profile ${params.lastProfileId} hit Cloud Code Assist format error. Tool calls will be sanitized on retry.`);
		}
		if (params.failoverReason === "overloaded") {
			overloadProfileRotations += 1;
			if (overloadProfileRotations > params.overloadProfileRotationLimit && params.fallbackConfigured) {
				const status = resolveFailoverStatus("overloaded");
				params.warn(`overload profile rotation cap reached for ${sanitizeForLog(params.provider)}/${sanitizeForLog(params.modelId)} after ${overloadProfileRotations} rotations; escalating to model fallback`);
				params.logAssistantFailoverDecision("fallback_model", { status });
				return {
					action: "throw",
					overloadProfileRotations,
					error: new FailoverError("The AI service is temporarily overloaded. Please try again in a moment.", {
						reason: "overloaded",
						provider: params.activeErrorContext.provider,
						model: params.activeErrorContext.model,
						profileId: params.lastProfileId,
						status
					})
				};
			}
		}
		if (params.failoverReason === "rate_limit") params.maybeEscalateRateLimitProfileFallback({
			failoverProvider: params.activeErrorContext.provider,
			failoverModel: params.activeErrorContext.model,
			logFallbackDecision: params.logAssistantFailoverDecision
		});
		if (await params.advanceAuthProfile()) {
			params.logAssistantFailoverDecision("rotate_profile");
			await params.maybeBackoffBeforeOverloadFailover(params.failoverReason);
			return {
				action: "retry",
				overloadProfileRotations,
				lastRetryFailoverReason: mergeRetryFailoverReason({
					previous: params.previousRetryFailoverReason,
					failoverReason: params.failoverReason,
					timedOut: params.timedOut
				})
			};
		}
		if (params.idleTimedOut && params.allowSameModelIdleTimeoutRetry) return sameModelIdleTimeoutRetry();
		decision = resolveRunFailoverDecision({
			stage: "assistant",
			aborted: params.aborted,
			externalAbort: params.externalAbort,
			fallbackConfigured: params.fallbackConfigured,
			failoverFailure: params.failoverFailure,
			failoverReason: params.failoverReason,
			timedOut: params.timedOut,
			timedOutDuringCompaction: params.timedOutDuringCompaction,
			profileRotated: true
		});
	}
	if (decision.action === "fallback_model") {
		await params.maybeBackoffBeforeOverloadFailover(params.failoverReason);
		const message = (params.lastAssistant ? formatAssistantErrorText(params.lastAssistant, {
			cfg: params.config,
			sessionKey: params.sessionKey,
			provider: params.activeErrorContext.provider,
			model: params.activeErrorContext.model
		}) : void 0) || params.lastAssistant?.errorMessage?.trim() || (params.timedOut ? "LLM request timed out." : params.rateLimitFailure ? "LLM request rate limited." : params.billingFailure ? formatBillingErrorMessage(params.activeErrorContext.provider, params.activeErrorContext.model) : params.authFailure ? "LLM request unauthorized." : "LLM request failed.");
		const status = resolveFailoverStatus(decision.reason) ?? (isTimeoutErrorMessage(message) ? 408 : void 0);
		params.logAssistantFailoverDecision("fallback_model", { status });
		return {
			action: "throw",
			overloadProfileRotations,
			error: new FailoverError(message, {
				reason: decision.reason,
				provider: params.activeErrorContext.provider,
				model: params.activeErrorContext.model,
				profileId: params.lastProfileId,
				status
			})
		};
	}
	if (decision.action === "surface_error") {
		if (!params.externalAbort && params.idleTimedOut && params.allowSameModelIdleTimeoutRetry) return sameModelIdleTimeoutRetry();
		params.logAssistantFailoverDecision("surface_error");
	}
	return {
		action: "continue_normal",
		overloadProfileRotations
	};
}
//#endregion
//#region src/agents/runtime-auth-refresh.ts
const MAX_SAFE_TIMEOUT_MS = 2147483647;
function clampRuntimeAuthRefreshDelayMs(params) {
	return Math.min(MAX_SAFE_TIMEOUT_MS, Math.max(params.minDelayMs, params.refreshAt - params.now));
}
//#endregion
//#region src/agents/pi-embedded-runner/usage-accumulator.ts
const createUsageAccumulator = () => ({
	input: 0,
	output: 0,
	cacheRead: 0,
	cacheWrite: 0,
	total: 0,
	lastInput: 0,
	lastOutput: 0,
	lastCacheRead: 0,
	lastCacheWrite: 0,
	lastTotal: 0
});
const hasUsageValues = (usage) => !!usage && [
	usage.input,
	usage.output,
	usage.cacheRead,
	usage.cacheWrite,
	usage.total
].some((value) => typeof value === "number" && Number.isFinite(value) && value > 0);
const mergeUsageIntoAccumulator = (target, usage) => {
	if (!hasUsageValues(usage)) return;
	const callTotal = usage.total ?? (usage.input ?? 0) + (usage.output ?? 0) + (usage.cacheRead ?? 0) + (usage.cacheWrite ?? 0);
	target.input += usage.input ?? 0;
	target.output += usage.output ?? 0;
	target.cacheRead += usage.cacheRead ?? 0;
	target.cacheWrite += usage.cacheWrite ?? 0;
	target.total += callTotal;
	target.lastInput = usage.input ?? 0;
	target.lastOutput = usage.output ?? 0;
	target.lastCacheRead = usage.cacheRead ?? 0;
	target.lastCacheWrite = usage.cacheWrite ?? 0;
	target.lastTotal = callTotal;
};
const toNormalizedUsage = (usage) => {
	if (!(usage.input > 0 || usage.output > 0 || usage.cacheRead > 0 || usage.cacheWrite > 0 || usage.total > 0)) return;
	return {
		input: usage.input || void 0,
		output: usage.output || void 0,
		cacheRead: usage.cacheRead || void 0,
		cacheWrite: usage.cacheWrite || void 0,
		total: usage.total || void 0
	};
};
const toLastCallUsage = (usage) => {
	if (!(usage.lastInput > 0 || usage.lastOutput > 0 || usage.lastCacheRead > 0 || usage.lastCacheWrite > 0 || usage.lastTotal > 0)) return;
	return {
		input: usage.lastInput || void 0,
		output: usage.lastOutput || void 0,
		cacheRead: usage.lastCacheRead || void 0,
		cacheWrite: usage.lastCacheWrite || void 0,
		total: usage.lastTotal || void 0
	};
};
//#endregion
//#region src/agents/pi-embedded-runner/run/helpers.ts
const RUNTIME_AUTH_REFRESH_MARGIN_MS = 300 * 1e3;
const RUNTIME_AUTH_REFRESH_RETRY_MS = 60 * 1e3;
const RUNTIME_AUTH_REFRESH_MIN_DELAY_MS = 5 * 1e3;
function resolveOverloadFailoverBackoffMs(cfg) {
	return cfg?.auth?.cooldowns?.overloadedBackoffMs ?? 0;
}
function resolveOverloadProfileRotationLimit(cfg) {
	return cfg?.auth?.cooldowns?.overloadedProfileRotations ?? 1;
}
function resolveRateLimitProfileRotationLimit(cfg) {
	return cfg?.auth?.cooldowns?.rateLimitedProfileRotations ?? 1;
}
const ANTHROPIC_MAGIC_STRING_TRIGGER_REFUSAL = "ANTHROPIC_MAGIC_STRING_TRIGGER_REFUSAL";
const ANTHROPIC_MAGIC_STRING_REPLACEMENT = "ANTHROPIC MAGIC STRING TRIGGER REFUSAL (redacted)";
function scrubAnthropicRefusalMagic(prompt) {
	if (!prompt.includes(ANTHROPIC_MAGIC_STRING_TRIGGER_REFUSAL)) return prompt;
	return prompt.replaceAll(ANTHROPIC_MAGIC_STRING_TRIGGER_REFUSAL, ANTHROPIC_MAGIC_STRING_REPLACEMENT);
}
function createCompactionDiagId() {
	return `ovf-${Date.now().toString(36)}-${generateSecureToken(4)}`;
}
const BASE_RUN_RETRY_ITERATIONS = 24;
const RUN_RETRY_ITERATIONS_PER_PROFILE = 8;
const MIN_RUN_RETRY_ITERATIONS = 32;
const MAX_RUN_RETRY_ITERATIONS = 160;
function resolveMaxRunRetryIterations(profileCandidateCount) {
	const scaled = BASE_RUN_RETRY_ITERATIONS + Math.max(1, profileCandidateCount) * RUN_RETRY_ITERATIONS_PER_PROFILE;
	return Math.min(MAX_RUN_RETRY_ITERATIONS, Math.max(MIN_RUN_RETRY_ITERATIONS, scaled));
}
function resolveActiveErrorContext(params) {
	const assistantProvider = params.assistant?.provider?.trim();
	const assistantModel = params.assistant?.model?.trim();
	return {
		provider: assistantProvider || params.provider,
		model: assistantModel || params.model
	};
}
function buildUsageAgentMetaFields(params) {
	const usage = toNormalizedUsage(params.usageAccumulator);
	if (usage && params.lastTurnTotal && params.lastTurnTotal > 0) usage.total = params.lastTurnTotal;
	return {
		usage,
		lastCallUsage: normalizeUsage(params.lastAssistantUsage) ?? toLastCallUsage(params.usageAccumulator),
		promptTokens: derivePromptTokens(params.lastRunPromptUsage)
	};
}
/**
* Build agentMeta for error return paths, preserving accumulated usage so that
* session totalTokens reflects the actual context size rather than going stale.
* Without this, error returns omit usage and the session keeps whatever
* totalTokens was set by the previous successful run.
*/
function buildErrorAgentMeta(params) {
	const usageMeta = buildUsageAgentMetaFields({
		usageAccumulator: params.usageAccumulator,
		lastAssistantUsage: params.lastAssistant?.usage,
		lastRunPromptUsage: params.lastRunPromptUsage,
		lastTurnTotal: params.lastTurnTotal
	});
	return {
		sessionId: params.sessionId,
		provider: params.provider,
		model: params.model,
		...usageMeta.usage ? { usage: usageMeta.usage } : {},
		...usageMeta.lastCallUsage ? { lastCallUsage: usageMeta.lastCallUsage } : {},
		...usageMeta.promptTokens ? { promptTokens: usageMeta.promptTokens } : {}
	};
}
function resolveFinalAssistantVisibleText(lastAssistant) {
	if (!lastAssistant) return;
	return extractAssistantVisibleText(lastAssistant).trim() || void 0;
}
function resolveFinalAssistantRawText(lastAssistant) {
	if (!lastAssistant) return;
	return (extractAssistantTextForPhase(lastAssistant, { phase: "final_answer" }) ?? extractAssistantTextForPhase(lastAssistant) ?? "").trim() || void 0;
}
//#endregion
//#region src/agents/pi-embedded-runner/run/auth-controller.ts
function createEmbeddedRunAuthController(params) {
	const applyPreparedRuntimeRequestOverrides = (paramsForApply) => {
		if (!paramsForApply.preparedAuth.baseUrl && !paramsForApply.preparedAuth.request) return;
		const runtimeRequestConfig = resolveProviderRequestConfig({
			provider: paramsForApply.runtimeModel.provider,
			api: paramsForApply.runtimeModel.api,
			baseUrl: paramsForApply.preparedAuth.baseUrl ?? paramsForApply.runtimeModel.baseUrl,
			providerHeaders: paramsForApply.runtimeModel.headers && typeof paramsForApply.runtimeModel.headers === "object" ? paramsForApply.runtimeModel.headers : void 0,
			request: sanitizeRuntimeProviderRequestOverrides(paramsForApply.preparedAuth.request),
			capability: "llm",
			transport: "stream"
		});
		params.setRuntimeModel({
			...paramsForApply.runtimeModel,
			...paramsForApply.preparedAuth.baseUrl ? { baseUrl: paramsForApply.preparedAuth.baseUrl } : {},
			...runtimeRequestConfig.headers ? { headers: runtimeRequestConfig.headers } : {}
		});
		params.setEffectiveModel({
			...params.getEffectiveModel(),
			...paramsForApply.preparedAuth.baseUrl ? { baseUrl: paramsForApply.preparedAuth.baseUrl } : {},
			...runtimeRequestConfig.headers ? { headers: runtimeRequestConfig.headers } : {}
		});
	};
	const hasRefreshableRuntimeAuth = () => Boolean(params.getRuntimeAuthState()?.sourceApiKey.trim());
	const nextRuntimeAuthGeneration = () => (params.getRuntimeAuthState()?.generation ?? 0) + 1;
	const clearRuntimeAuthRefreshTimer = () => {
		const runtimeAuthState = params.getRuntimeAuthState();
		if (!runtimeAuthState?.refreshTimer) return;
		clearTimeout(runtimeAuthState.refreshTimer);
		runtimeAuthState.refreshTimer = void 0;
	};
	const stopRuntimeAuthRefreshTimer = () => {
		if (!params.getRuntimeAuthState()) return;
		params.setRuntimeAuthRefreshCancelled(true);
		clearRuntimeAuthRefreshTimer();
	};
	const refreshRuntimeAuth = async (reason) => {
		const runtimeAuthState = params.getRuntimeAuthState();
		if (!runtimeAuthState) return;
		if (runtimeAuthState.refreshInFlight) {
			await runtimeAuthState.refreshInFlight;
			return;
		}
		const refreshGeneration = runtimeAuthState.generation;
		const refreshProfileId = runtimeAuthState.profileId;
		let refreshPromise;
		refreshPromise = (async () => {
			const currentRuntimeAuthState = params.getRuntimeAuthState();
			const sourceApiKey = currentRuntimeAuthState?.sourceApiKey.trim() ?? "";
			if (!sourceApiKey) throw new Error(`Runtime auth refresh requires a source credential.`);
			const runtimeModel = params.getRuntimeModel();
			params.log.debug(`Refreshing runtime auth for ${runtimeModel.provider} (${reason})...`);
			const preparedAuth = await prepareProviderRuntimeAuth({
				provider: runtimeModel.provider,
				config: params.config,
				workspaceDir: params.workspaceDir,
				env: process.env,
				context: {
					config: params.config,
					agentDir: params.agentDir,
					workspaceDir: params.workspaceDir,
					env: process.env,
					provider: runtimeModel.provider,
					modelId: params.getModelId(),
					model: runtimeModel,
					apiKey: sourceApiKey,
					authMode: currentRuntimeAuthState?.authMode ?? "unknown",
					profileId: currentRuntimeAuthState?.profileId
				}
			});
			if (!preparedAuth?.apiKey) throw new Error(`Provider "${runtimeModel.provider}" does not support runtime auth refresh.`);
			const activeRuntimeAuthState = params.getRuntimeAuthState();
			if (!activeRuntimeAuthState || activeRuntimeAuthState.generation !== refreshGeneration || activeRuntimeAuthState.profileId !== refreshProfileId || activeRuntimeAuthState.sourceApiKey.trim() !== sourceApiKey) {
				params.log.debug(`Ignoring stale runtime auth refresh for ${runtimeModel.provider}; auth state advanced before ${reason} refresh completed.`);
				return;
			}
			params.authStorage.setRuntimeApiKey(runtimeModel.provider, preparedAuth.apiKey);
			applyPreparedRuntimeRequestOverrides({
				runtimeModel,
				preparedAuth
			});
			params.setRuntimeAuthState({
				...activeRuntimeAuthState,
				expiresAt: preparedAuth.expiresAt
			});
			if (preparedAuth.expiresAt) {
				const remaining = preparedAuth.expiresAt - Date.now();
				params.log.debug(`Runtime auth refreshed for ${runtimeModel.provider}; expires in ${Math.max(0, Math.floor(remaining / 1e3))}s.`);
			}
		})().catch((err) => {
			const runtimeModel = params.getRuntimeModel();
			params.log.warn(`Runtime auth refresh failed for ${runtimeModel.provider}: ${formatErrorMessage(err)}`);
			throw err;
		}).finally(() => {
			const activeState = params.getRuntimeAuthState();
			if (activeState && activeState.generation === refreshGeneration && activeState.refreshInFlight === refreshPromise) activeState.refreshInFlight = void 0;
		});
		runtimeAuthState.refreshInFlight = refreshPromise;
		await refreshPromise;
	};
	const scheduleRuntimeAuthRefresh = () => {
		const runtimeAuthState = params.getRuntimeAuthState();
		if (!runtimeAuthState || params.getRuntimeAuthRefreshCancelled()) return;
		const runtimeModel = params.getRuntimeModel();
		if (!hasRefreshableRuntimeAuth()) {
			params.log.warn(`Skipping runtime auth refresh scheduling for ${runtimeModel.provider}; source credential missing.`);
			return;
		}
		if (!runtimeAuthState.expiresAt) return;
		clearRuntimeAuthRefreshTimer();
		const now = Date.now();
		const delayMs = clampRuntimeAuthRefreshDelayMs({
			refreshAt: runtimeAuthState.expiresAt - RUNTIME_AUTH_REFRESH_MARGIN_MS,
			now,
			minDelayMs: RUNTIME_AUTH_REFRESH_MIN_DELAY_MS
		});
		const timer = setTimeout(() => {
			if (params.getRuntimeAuthRefreshCancelled()) return;
			refreshRuntimeAuth("scheduled").then(() => scheduleRuntimeAuthRefresh()).catch(() => {
				if (params.getRuntimeAuthRefreshCancelled()) return;
				const retryTimer = setTimeout(() => {
					if (params.getRuntimeAuthRefreshCancelled()) return;
					refreshRuntimeAuth("scheduled-retry").then(() => scheduleRuntimeAuthRefresh()).catch(() => void 0);
				}, RUNTIME_AUTH_REFRESH_RETRY_MS);
				const activeRuntimeAuthState = params.getRuntimeAuthState();
				if (activeRuntimeAuthState) activeRuntimeAuthState.refreshTimer = retryTimer;
				if (params.getRuntimeAuthRefreshCancelled() && activeRuntimeAuthState) {
					clearTimeout(retryTimer);
					activeRuntimeAuthState.refreshTimer = void 0;
				}
			});
		}, delayMs);
		runtimeAuthState.refreshTimer = timer;
		if (params.getRuntimeAuthRefreshCancelled()) {
			clearTimeout(timer);
			runtimeAuthState.refreshTimer = void 0;
		}
	};
	const resolveAuthProfileFailoverReason = (failoverParams) => {
		if (failoverParams.allInCooldown) {
			const profileIds = (failoverParams.profileIds ?? params.profileCandidates).filter((id) => typeof id === "string" && id.length > 0);
			return resolveProfilesUnavailableReason({
				store: params.authStore,
				profileIds
			}) ?? "unknown";
		}
		return classifyFailoverReason(failoverParams.message, { provider: params.getProvider() }) ?? "auth";
	};
	const throwAuthProfileFailover = (failoverParams) => {
		const provider = params.getProvider();
		const modelId = params.getModelId();
		const fallbackMessage = `No available auth profile for ${provider} (all in cooldown or unavailable).`;
		const message = failoverParams.message?.trim() || (failoverParams.error ? formatErrorMessage(failoverParams.error).trim() : "") || fallbackMessage;
		const reason = resolveAuthProfileFailoverReason({
			allInCooldown: failoverParams.allInCooldown,
			message,
			profileIds: params.profileCandidates
		});
		if (params.fallbackConfigured) throw new FailoverError(message, {
			reason,
			provider,
			model: modelId,
			status: resolveFailoverStatus(reason),
			cause: failoverParams.error
		});
		if (failoverParams.error instanceof Error) throw failoverParams.error;
		throw new Error(message);
	};
	const resolveApiKeyForCandidate = async (candidate) => {
		return getApiKeyForModel({
			model: params.getRuntimeModel(),
			cfg: params.config,
			profileId: candidate,
			store: params.authStore,
			agentDir: params.agentDir,
			lockedProfile: candidate != null && candidate === params.lockedProfileId
		});
	};
	const applyApiKeyInfo = async (candidate) => {
		const apiKeyInfo = await resolveApiKeyForCandidate(candidate);
		params.setApiKeyInfo(apiKeyInfo);
		const resolvedProfileId = apiKeyInfo.profileId ?? candidate;
		if (!apiKeyInfo.apiKey) {
			if (apiKeyInfo.mode !== "aws-sdk") {
				const runtimeModel = params.getRuntimeModel();
				throw new Error(`No API key resolved for provider "${runtimeModel.provider}" (auth mode: ${apiKeyInfo.mode}).`);
			}
			params.setLastProfileId(resolvedProfileId);
			return;
		}
		let runtimeAuthHandled = false;
		const runtimeModel = params.getRuntimeModel();
		const preparedAuth = await prepareProviderRuntimeAuth({
			provider: runtimeModel.provider,
			config: params.config,
			workspaceDir: params.workspaceDir,
			env: process.env,
			context: {
				config: params.config,
				agentDir: params.agentDir,
				workspaceDir: params.workspaceDir,
				env: process.env,
				provider: runtimeModel.provider,
				modelId: params.getModelId(),
				model: runtimeModel,
				apiKey: apiKeyInfo.apiKey,
				authMode: apiKeyInfo.mode,
				profileId: apiKeyInfo.profileId
			}
		});
		applyPreparedRuntimeRequestOverrides({
			runtimeModel,
			preparedAuth: preparedAuth ?? {}
		});
		if (preparedAuth?.apiKey) {
			clearRuntimeAuthRefreshTimer();
			params.authStorage.setRuntimeApiKey(runtimeModel.provider, preparedAuth.apiKey);
			params.setRuntimeAuthState({
				generation: nextRuntimeAuthGeneration(),
				sourceApiKey: apiKeyInfo.apiKey,
				authMode: apiKeyInfo.mode,
				profileId: apiKeyInfo.profileId,
				expiresAt: preparedAuth.expiresAt
			});
			if (preparedAuth.expiresAt) scheduleRuntimeAuthRefresh();
			runtimeAuthHandled = true;
		}
		if (!runtimeAuthHandled) {
			clearRuntimeAuthRefreshTimer();
			params.authStorage.setRuntimeApiKey(runtimeModel.provider, apiKeyInfo.apiKey);
			params.setRuntimeAuthState(null);
		}
		params.setLastProfileId(apiKeyInfo.profileId);
	};
	const advanceAuthProfile = async () => {
		if (params.lockedProfileId) return false;
		let nextIndex = params.getProfileIndex() + 1;
		while (nextIndex < params.profileCandidates.length) {
			const candidate = params.profileCandidates[nextIndex];
			if (candidate && isProfileInCooldown(params.authStore, candidate, void 0, params.getModelId())) {
				nextIndex += 1;
				continue;
			}
			try {
				await applyApiKeyInfo(candidate);
				params.setProfileIndex(nextIndex);
				params.setThinkLevel(params.initialThinkLevel);
				params.attemptedThinking.clear();
				return true;
			} catch (err) {
				if (candidate && candidate === params.lockedProfileId) throw err;
				nextIndex += 1;
			}
		}
		return false;
	};
	const initializeAuthProfile = async () => {
		try {
			const autoProfileCandidates = params.profileCandidates.filter((candidate) => typeof candidate === "string" && candidate.length > 0 && candidate !== params.lockedProfileId);
			const modelId = params.getModelId();
			const allAutoProfilesInCooldown = autoProfileCandidates.length > 0 && autoProfileCandidates.every((candidate) => isProfileInCooldown(params.authStore, candidate, void 0, modelId));
			const unavailableReason = allAutoProfilesInCooldown ? resolveProfilesUnavailableReason({
				store: params.authStore,
				profileIds: autoProfileCandidates
			}) ?? "unknown" : null;
			const allowTransientCooldownProbe = params.allowTransientCooldownProbe && allAutoProfilesInCooldown && shouldAllowCooldownProbeForReason(unavailableReason);
			let didTransientCooldownProbe = false;
			while (params.getProfileIndex() < params.profileCandidates.length) {
				const candidate = params.profileCandidates[params.getProfileIndex()];
				if (candidate && candidate !== params.lockedProfileId && isProfileInCooldown(params.authStore, candidate, void 0, modelId)) if (allowTransientCooldownProbe && !didTransientCooldownProbe) {
					didTransientCooldownProbe = true;
					params.log.warn(`probing cooldowned auth profile for ${params.getProvider()}/${modelId} due to ${unavailableReason ?? "transient"} unavailability`);
				} else {
					params.setProfileIndex(params.getProfileIndex() + 1);
					continue;
				}
				await applyApiKeyInfo(params.profileCandidates[params.getProfileIndex()]);
				break;
			}
			if (params.getProfileIndex() >= params.profileCandidates.length) throwAuthProfileFailover({ allInCooldown: true });
		} catch (err) {
			if (err instanceof FailoverError) throw err;
			if (params.profileCandidates[params.getProfileIndex()] === params.lockedProfileId) throwAuthProfileFailover({
				allInCooldown: false,
				error: err
			});
			if (!await advanceAuthProfile()) throwAuthProfileFailover({
				allInCooldown: false,
				error: err
			});
		}
	};
	const maybeRefreshRuntimeAuthForAuthError = async (errorText, retried) => {
		if (!params.getRuntimeAuthState() || retried) return false;
		if (!isFailoverErrorMessage(errorText, { provider: params.getProvider() })) return false;
		if (classifyFailoverReason(errorText, { provider: params.getProvider() }) !== "auth") return false;
		try {
			await refreshRuntimeAuth("auth-error");
			scheduleRuntimeAuthRefresh();
			return true;
		} catch {
			return false;
		}
	};
	return {
		advanceAuthProfile,
		initializeAuthProfile,
		maybeRefreshRuntimeAuthForAuthError,
		stopRuntimeAuthRefreshTimer
	};
}
//#endregion
//#region src/agents/pi-embedded-runner/run/backend.ts
async function runEmbeddedAttemptWithBackend(params) {
	return runAgentHarnessAttemptWithFallback(params);
}
//#endregion
//#region src/agents/pi-embedded-runner/run/failover-observation.ts
function normalizeFailoverDecisionObservationBase(base) {
	return {
		...base,
		failoverReason: base.failoverReason ?? (base.timedOut ? "timeout" : null),
		profileFailureReason: base.profileFailureReason ?? (base.timedOut ? "timeout" : null)
	};
}
function createFailoverDecisionLogger(base) {
	const normalizedBase = normalizeFailoverDecisionObservationBase(base);
	const safeProfileId = normalizedBase.profileId ? redactIdentifier(normalizedBase.profileId, { len: 12 }) : void 0;
	const safeRunId = sanitizeForConsole(normalizedBase.runId) ?? "-";
	const safeProvider = sanitizeForConsole(normalizedBase.provider) ?? "-";
	const safeModel = sanitizeForConsole(normalizedBase.model) ?? "-";
	const safeSourceProvider = sanitizeForConsole(normalizedBase.sourceProvider) ?? safeProvider;
	const safeSourceModel = sanitizeForConsole(normalizedBase.sourceModel) ?? safeModel;
	const profileText = safeProfileId ?? "-";
	const reasonText = normalizedBase.failoverReason ?? "none";
	const sourceChanged = safeSourceProvider !== safeProvider || safeSourceModel !== safeModel;
	return (decision, extra) => {
		const observedError = buildApiErrorObservationFields(normalizedBase.rawError);
		log$3.warn("embedded run failover decision", {
			event: "embedded_run_failover_decision",
			tags: [
				"error_handling",
				"failover",
				normalizedBase.stage,
				decision
			],
			runId: normalizedBase.runId,
			stage: normalizedBase.stage,
			decision,
			failoverReason: normalizedBase.failoverReason,
			profileFailureReason: normalizedBase.profileFailureReason,
			provider: normalizedBase.provider,
			model: normalizedBase.model,
			sourceProvider: normalizedBase.sourceProvider ?? normalizedBase.provider,
			sourceModel: normalizedBase.sourceModel ?? normalizedBase.model,
			profileId: safeProfileId,
			fallbackConfigured: normalizedBase.fallbackConfigured,
			timedOut: normalizedBase.timedOut,
			aborted: normalizedBase.aborted,
			status: extra?.status,
			...observedError,
			consoleMessage: `embedded run failover decision: runId=${safeRunId} stage=${normalizedBase.stage} decision=${decision} reason=${reasonText} from=${safeSourceProvider}/${safeSourceModel}${sourceChanged ? ` to=${safeProvider}/${safeModel}` : ""} profile=${profileText}`
		});
	};
}
//#endregion
//#region src/agents/tool-error-summary.ts
const EXEC_LIKE_TOOL_NAMES = new Set(["exec", "bash"]);
function isExecLikeToolName(toolName) {
	return EXEC_LIKE_TOOL_NAMES.has(normalizeOptionalLowercaseString(toolName) ?? "");
}
//#endregion
//#region src/agents/pi-embedded-runner/run/payloads.ts
const RECOVERABLE_TOOL_ERROR_KEYWORDS = [
	"required",
	"missing",
	"invalid",
	"must be",
	"must have",
	"needs",
	"requires"
];
function isRecoverableToolError(error) {
	const errorLower = normalizeOptionalLowercaseString(error) ?? "";
	return RECOVERABLE_TOOL_ERROR_KEYWORDS.some((keyword) => errorLower.includes(keyword));
}
function isVerboseToolDetailEnabled(level) {
	return level === "on" || level === "full";
}
function shouldIncludeToolErrorDetails(params) {
	if (isVerboseToolDetailEnabled(params.verboseLevel)) return true;
	return isExecLikeToolName(params.lastToolError.toolName) && params.lastToolError.timedOut === true && (params.isCronTrigger === true || isCronSessionKey(params.sessionKey));
}
function resolveToolErrorWarningPolicy(params) {
	const normalizedToolName = normalizeOptionalLowercaseString(params.lastToolError.toolName) ?? "";
	const includeDetails = shouldIncludeToolErrorDetails(params);
	if (params.suppressToolErrorWarnings) return {
		showWarning: false,
		includeDetails
	};
	if (isExecLikeToolName(params.lastToolError.toolName) && !includeDetails) return {
		showWarning: false,
		includeDetails
	};
	if (normalizedToolName === "sessions_send") return {
		showWarning: false,
		includeDetails
	};
	if (params.lastToolError.mutatingAction ?? isLikelyMutatingToolName(params.lastToolError.toolName)) return {
		showWarning: true,
		includeDetails
	};
	if (params.suppressToolErrors) return {
		showWarning: false,
		includeDetails
	};
	return {
		showWarning: !params.hasUserFacingReply && !isRecoverableToolError(params.lastToolError.error),
		includeDetails
	};
}
function buildEmbeddedRunPayloads(params) {
	const replyItems = [];
	const useMarkdown = params.toolResultFormat === "markdown";
	const suppressAssistantArtifacts = params.didSendDeterministicApprovalPrompt === true;
	const lastAssistantErrored = params.lastAssistant?.stopReason === "error";
	const errorText = params.lastAssistant && lastAssistantErrored ? suppressAssistantArtifacts ? void 0 : formatAssistantErrorText(params.lastAssistant, {
		cfg: params.config,
		sessionKey: params.sessionKey,
		provider: params.provider,
		model: params.model
	}) : void 0;
	const rawErrorMessage = lastAssistantErrored ? normalizeOptionalString(params.lastAssistant?.errorMessage) : void 0;
	const rawErrorFingerprint = rawErrorMessage ? getApiErrorPayloadFingerprint(rawErrorMessage) : null;
	const formattedRawErrorMessage = rawErrorMessage ? formatRawAssistantErrorForUi(rawErrorMessage) : null;
	const normalizedFormattedRawErrorMessage = formattedRawErrorMessage ? normalizeTextForComparison(formattedRawErrorMessage) : null;
	const normalizedRawErrorText = rawErrorMessage ? normalizeTextForComparison(rawErrorMessage) : null;
	const normalizedErrorText = errorText ? normalizeTextForComparison(errorText) : null;
	const normalizedGenericBillingErrorText = normalizeTextForComparison(BILLING_ERROR_USER_MESSAGE);
	const genericErrorText = "The AI service returned an error. Please try again.";
	if (errorText) replyItems.push({
		text: errorText,
		isError: true
	});
	if (params.inlineToolResultsAllowed && params.verboseLevel !== "off" && params.toolMetas.length > 0) for (const { toolName, meta } of params.toolMetas) {
		const { text: cleanedText, mediaUrls, audioAsVoice, replyToId, replyToTag, replyToCurrent } = parseReplyDirectives(formatToolAggregate(toolName, meta ? [meta] : [], { markdown: useMarkdown }));
		if (cleanedText) replyItems.push({
			text: cleanedText,
			media: mediaUrls,
			audioAsVoice,
			replyToId,
			replyToTag,
			replyToCurrent
		});
	}
	const reasoningText = suppressAssistantArtifacts ? "" : params.lastAssistant && params.reasoningLevel === "on" ? formatReasoningMessage(extractAssistantThinking(params.lastAssistant)) : "";
	if (reasoningText) replyItems.push({
		text: reasoningText,
		isReasoning: true
	});
	const fallbackAnswerText = params.lastAssistant ? extractAssistantVisibleText(params.lastAssistant) : "";
	const shouldSuppressRawErrorText = (text) => {
		if (!lastAssistantErrored) return false;
		const trimmed = text.trim();
		if (!trimmed) return false;
		if (errorText) {
			const normalized = normalizeTextForComparison(trimmed);
			if (normalized && normalizedErrorText && normalized === normalizedErrorText) return true;
			if (trimmed === genericErrorText) return true;
			if (normalized && normalizedGenericBillingErrorText && normalized === normalizedGenericBillingErrorText) return true;
		}
		if (rawErrorMessage && trimmed === rawErrorMessage) return true;
		if (formattedRawErrorMessage && trimmed === formattedRawErrorMessage) return true;
		if (normalizedRawErrorText) {
			const normalized = normalizeTextForComparison(trimmed);
			if (normalized && normalized === normalizedRawErrorText) return true;
		}
		if (normalizedFormattedRawErrorMessage) {
			const normalized = normalizeTextForComparison(trimmed);
			if (normalized && normalized === normalizedFormattedRawErrorMessage) return true;
		}
		if (rawErrorFingerprint) {
			const fingerprint = getApiErrorPayloadFingerprint(trimmed);
			if (fingerprint && fingerprint === rawErrorFingerprint) return true;
		}
		return isRawApiErrorPayload(trimmed);
	};
	const answerTexts = suppressAssistantArtifacts ? [] : (params.assistantTexts.length ? params.assistantTexts : fallbackAnswerText ? [fallbackAnswerText] : []).filter((text) => !shouldSuppressRawErrorText(text));
	let hasUserFacingAssistantReply = false;
	for (const text of answerTexts) {
		const { text: cleanedText, mediaUrls, audioAsVoice, replyToId, replyToTag, replyToCurrent } = parseReplyDirectives(text);
		if (!cleanedText && (!mediaUrls || mediaUrls.length === 0) && !audioAsVoice) continue;
		replyItems.push({
			text: cleanedText,
			media: mediaUrls,
			audioAsVoice,
			replyToId,
			replyToTag,
			replyToCurrent
		});
		hasUserFacingAssistantReply = true;
	}
	if (params.lastToolError) {
		const warningPolicy = resolveToolErrorWarningPolicy({
			lastToolError: params.lastToolError,
			hasUserFacingReply: hasUserFacingAssistantReply,
			suppressToolErrors: Boolean(params.config?.messages?.suppressToolErrors),
			suppressToolErrorWarnings: params.suppressToolErrorWarnings,
			isCronTrigger: params.isCronTrigger,
			sessionKey: params.sessionKey,
			verboseLevel: params.verboseLevel
		});
		if (warningPolicy.showWarning) {
			const warningText = `⚠️ ${formatToolAggregate(params.lastToolError.toolName, params.lastToolError.meta ? [params.lastToolError.meta] : void 0, { markdown: useMarkdown })} failed${warningPolicy.includeDetails && params.lastToolError.error ? `: ${params.lastToolError.error}` : ""}`;
			const normalizedWarning = normalizeTextForComparison(warningText);
			if (!(normalizedWarning ? replyItems.some((item) => {
				if (!item.text) return false;
				const normalizedExisting = normalizeTextForComparison(item.text);
				return normalizedExisting.length > 0 && normalizedExisting === normalizedWarning;
			}) : false)) replyItems.push({
				text: warningText,
				isError: true
			});
		}
	}
	const hasAudioAsVoiceTag = replyItems.some((item) => item.audioAsVoice);
	return replyItems.map((item) => ({
		text: normalizeOptionalString(item.text),
		mediaUrls: item.media?.length ? item.media : void 0,
		mediaUrl: item.media?.[0],
		isError: item.isError,
		replyToId: item.replyToId,
		replyToTag: item.replyToTag,
		replyToCurrent: item.replyToCurrent,
		audioAsVoice: item.audioAsVoice || Boolean(hasAudioAsVoiceTag && item.media?.length)
	})).filter((p) => {
		if (!hasOutboundReplyContent(p)) return false;
		if (p.text && isSilentReplyPayloadText(p.text, "NO_REPLY")) return false;
		return true;
	});
}
//#endregion
//#region src/agents/pi-embedded-runner/run/retry-limit.ts
function handleRetryLimitExhaustion(params) {
	if (params.decision.action === "fallback_model") throw new FailoverError(params.message, {
		reason: params.decision.reason,
		provider: params.provider,
		model: params.model,
		profileId: params.profileId,
		status: resolveFailoverStatus(params.decision.reason)
	});
	return {
		payloads: [{
			text: "Request failed after repeated internal retries. Please try again, or use /new to start a fresh session.",
			isError: true
		}],
		meta: {
			durationMs: params.durationMs,
			agentMeta: params.agentMeta,
			...params.replayInvalid ? { replayInvalid: true } : {},
			...params.livenessState ? { livenessState: params.livenessState } : {},
			error: {
				kind: "retry_limit",
				message: params.message
			}
		}
	};
}
//#endregion
//#region src/agents/pi-embedded-runner/run/setup.ts
async function resolveHookModelSelection(params) {
	let provider = params.provider;
	let modelId = params.modelId;
	let modelResolveOverride;
	let legacyBeforeAgentStartResult;
	const hookRunner = params.hookRunner;
	if (hookRunner?.hasHooks("before_model_resolve")) try {
		modelResolveOverride = await hookRunner.runBeforeModelResolve({ prompt: params.prompt }, params.hookContext);
	} catch (hookErr) {
		log$3.warn(`before_model_resolve hook failed: ${String(hookErr)}`);
	}
	if (hookRunner?.hasHooks("before_agent_start")) try {
		legacyBeforeAgentStartResult = await hookRunner.runBeforeAgentStart({ prompt: params.prompt }, params.hookContext);
		modelResolveOverride = {
			providerOverride: modelResolveOverride?.providerOverride ?? legacyBeforeAgentStartResult?.providerOverride,
			modelOverride: modelResolveOverride?.modelOverride ?? legacyBeforeAgentStartResult?.modelOverride
		};
	} catch (hookErr) {
		log$3.warn(`before_agent_start hook (legacy model resolve path) failed: ${String(hookErr)}`);
	}
	if (modelResolveOverride?.providerOverride) {
		provider = modelResolveOverride.providerOverride;
		log$3.info(`[hooks] provider overridden to ${provider}`);
	}
	if (modelResolveOverride?.modelOverride) {
		modelId = modelResolveOverride.modelOverride;
		log$3.info(`[hooks] model overridden to ${modelId}`);
	}
	return {
		provider,
		modelId,
		legacyBeforeAgentStartResult
	};
}
function resolveEffectiveRuntimeModel(params) {
	const ctxInfo = resolveContextWindowInfo({
		cfg: params.cfg,
		provider: params.provider,
		modelId: params.modelId,
		modelContextTokens: readPiModelContextTokens(params.runtimeModel),
		modelContextWindow: params.runtimeModel.contextWindow,
		defaultTokens: DEFAULT_CONTEXT_TOKENS
	});
	const effectiveModel = ctxInfo.tokens < (params.runtimeModel.contextWindow ?? Infinity) ? {
		...params.runtimeModel,
		contextWindow: ctxInfo.tokens
	} : params.runtimeModel;
	const ctxGuard = evaluateContextWindowGuard({
		info: ctxInfo,
		warnBelowTokens: CONTEXT_WINDOW_WARN_BELOW_TOKENS,
		hardMinTokens: CONTEXT_WINDOW_HARD_MIN_TOKENS
	});
	const runtimeBaseUrl = typeof params.runtimeModel.baseUrl === "string" ? params.runtimeModel.baseUrl : void 0;
	if (ctxGuard.shouldWarn) log$3.warn(formatContextWindowWarningMessage({
		provider: params.provider,
		modelId: params.modelId,
		guard: ctxGuard,
		runtimeBaseUrl
	}));
	if (ctxGuard.shouldBlock) {
		const message = formatContextWindowBlockMessage({
			guard: ctxGuard,
			runtimeBaseUrl
		});
		log$3.error(`blocked model (context window too small): ${params.provider}/${params.modelId} ctx=${ctxGuard.tokens} (min=${CONTEXT_WINDOW_HARD_MIN_TOKENS}) source=${ctxGuard.source}; ${message}`);
		throw new FailoverError(message, {
			reason: "unknown",
			provider: params.provider,
			model: params.modelId
		});
	}
	return {
		ctxInfo,
		effectiveModel
	};
}
//#endregion
//#region src/agents/pi-embedded-runner/run/tool-media-payloads.ts
function mergeAttemptToolMediaPayloads(params) {
	const mediaUrls = Array.from(new Set(params.toolMediaUrls?.map((url) => url.trim()).filter(Boolean) ?? []));
	if (mediaUrls.length === 0 && !params.toolAudioAsVoice) return params.payloads;
	const payloads = params.payloads?.length ? [...params.payloads] : [];
	const payloadIndex = payloads.findIndex((payload) => !payload.isReasoning);
	if (payloadIndex >= 0) {
		const payload = payloads[payloadIndex];
		const mergedMediaUrls = Array.from(new Set([...payload.mediaUrls ?? [], ...mediaUrls]));
		payloads[payloadIndex] = {
			...payload,
			mediaUrls: mergedMediaUrls.length ? mergedMediaUrls : void 0,
			mediaUrl: payload.mediaUrl ?? mergedMediaUrls[0],
			audioAsVoice: payload.audioAsVoice || params.toolAudioAsVoice || void 0
		};
		return payloads;
	}
	return [...payloads, {
		mediaUrls: mediaUrls.length ? mediaUrls : void 0,
		mediaUrl: mediaUrls[0],
		audioAsVoice: params.toolAudioAsVoice || void 0
	}];
}
//#endregion
//#region src/agents/pi-embedded-runner/run.ts
const MAX_SAME_MODEL_IDLE_TIMEOUT_RETRIES = 1;
function buildTraceToolSummary(params) {
	if (params.toolMetas.length === 0) return;
	const tools = [];
	const seen = /* @__PURE__ */ new Set();
	for (const entry of params.toolMetas) {
		const toolName = normalizeOptionalString(entry.toolName);
		if (!toolName || seen.has(toolName)) continue;
		seen.add(toolName);
		tools.push(toolName);
	}
	return {
		calls: params.toolMetas.length,
		tools,
		failures: params.hadFailure ? 1 : 0
	};
}
/**
* Best-effort backfill of sessionKey from sessionId when not explicitly provided.
* The return value is normalized: whitespace-only inputs collapse to undefined, and
* successful resolution returns a trimmed session key. This is a read-only lookup
* with no side effects.
* See: https://github.com/openclaw/openclaw/issues/60552
*/
function backfillSessionKey(params) {
	const trimmed = normalizeOptionalString(params.sessionKey);
	if (trimmed) return trimmed;
	if (!params.config || !params.sessionId) return;
	try {
		return normalizeOptionalString((normalizeOptionalString(params.agentId) ? resolveStoredSessionKeyForSessionId({
			cfg: params.config,
			sessionId: params.sessionId,
			agentId: params.agentId
		}) : resolveSessionKeyForRequest({
			cfg: params.config,
			sessionId: params.sessionId
		})).sessionKey);
	} catch (err) {
		log$3.warn(`[backfillSessionKey] Failed to resolve sessionKey for sessionId=${redactRunIdentifier(sanitizeForLog(params.sessionId))}: ${formatErrorMessage(err)}`);
		return;
	}
}
async function runEmbeddedPiAgent(params) {
	const effectiveSessionKey = backfillSessionKey({
		config: params.config,
		sessionId: params.sessionId,
		sessionKey: params.sessionKey,
		agentId: params.agentId
	});
	if (effectiveSessionKey !== params.sessionKey) params = {
		...params,
		sessionKey: effectiveSessionKey
	};
	const sessionLane = resolveSessionLane(params.sessionKey?.trim() || params.sessionId);
	const globalLane = resolveGlobalLane(params.lane);
	const enqueueGlobal = params.enqueue ?? ((task, opts) => enqueueCommandInLane(globalLane, task, opts));
	const enqueueSession = params.enqueue ?? ((task, opts) => enqueueCommandInLane(sessionLane, task, opts));
	const channelHint = params.messageChannel ?? params.messageProvider;
	const resolvedToolResultFormat = params.toolResultFormat ?? (channelHint ? isMarkdownCapableMessageChannel(channelHint) ? "markdown" : "plain" : "markdown");
	const isProbeSession = params.sessionId?.startsWith("probe-") ?? false;
	const throwIfAborted = () => {
		if (!params.abortSignal?.aborted) return;
		const reason = params.abortSignal.reason;
		if (reason instanceof Error) throw reason;
		const abortErr = reason !== void 0 ? new Error("Operation aborted", { cause: reason }) : /* @__PURE__ */ new Error("Operation aborted");
		abortErr.name = "AbortError";
		throw abortErr;
	};
	throwIfAborted();
	return enqueueSession(() => {
		throwIfAborted();
		return enqueueGlobal(async () => {
			throwIfAborted();
			const started = Date.now();
			const workspaceResolution = resolveRunWorkspaceDir({
				workspaceDir: params.workspaceDir,
				sessionKey: params.sessionKey,
				agentId: params.agentId,
				config: params.config
			});
			const resolvedWorkspace = workspaceResolution.workspaceDir;
			const redactedSessionId = redactRunIdentifier(params.sessionId);
			const redactedSessionKey = redactRunIdentifier(params.sessionKey);
			const redactedWorkspace = redactRunIdentifier(resolvedWorkspace);
			if (workspaceResolution.usedFallback) log$3.warn(`[workspace-fallback] caller=runEmbeddedPiAgent reason=${workspaceResolution.fallbackReason} run=${params.runId} session=${redactedSessionId} sessionKey=${redactedSessionKey} agent=${workspaceResolution.agentId} workspace=${redactedWorkspace}`);
			ensureRuntimePluginsLoaded({
				config: params.config,
				workspaceDir: resolvedWorkspace,
				allowGatewaySubagentBinding: params.allowGatewaySubagentBinding
			});
			let provider = (params.provider ?? "openai").trim() || "openai";
			let modelId = (params.model ?? "gpt-5.4").trim() || "gpt-5.4";
			const agentDir = params.agentDir ?? resolveOpenClawAgentDir();
			const normalizedSessionKey = params.sessionKey?.trim();
			const fallbackConfigured = hasConfiguredModelFallbacks({
				cfg: params.config,
				agentId: params.agentId,
				sessionKey: normalizedSessionKey
			});
			await ensureOpenClawModelsJson(params.config, agentDir);
			const resolvedSessionKey = normalizedSessionKey;
			const hookRunner = getGlobalHookRunner();
			const hookCtx = {
				runId: params.runId,
				agentId: workspaceResolution.agentId,
				sessionKey: resolvedSessionKey,
				sessionId: params.sessionId,
				workspaceDir: resolvedWorkspace,
				modelProviderId: provider,
				modelId,
				messageProvider: params.messageProvider ?? void 0,
				trigger: params.trigger,
				channelId: params.messageChannel ?? params.messageProvider ?? void 0
			};
			const hookSelection = await resolveHookModelSelection({
				prompt: params.prompt,
				provider,
				modelId,
				hookRunner,
				hookContext: hookCtx
			});
			provider = hookSelection.provider;
			modelId = hookSelection.modelId;
			const legacyBeforeAgentStartResult = hookSelection.legacyBeforeAgentStartResult;
			const { model, error, authStorage, modelRegistry } = await resolveModelAsync(provider, modelId, agentDir, params.config);
			if (!model) throw new FailoverError(error ?? `Unknown model: ${provider}/${modelId}`, {
				reason: "model_not_found",
				provider,
				model: modelId
			});
			let runtimeModel = model;
			const resolvedRuntimeModel = resolveEffectiveRuntimeModel({
				cfg: params.config,
				provider,
				modelId,
				runtimeModel
			});
			const ctxInfo = resolvedRuntimeModel.ctxInfo;
			let effectiveModel = resolvedRuntimeModel.effectiveModel;
			const authStore = ensureAuthProfileStore(agentDir, { allowKeychainPrompt: false });
			const preferredProfileId = params.authProfileId?.trim();
			let lockedProfileId = params.authProfileIdSource === "user" ? preferredProfileId : void 0;
			if (lockedProfileId) {
				const lockedProfile = authStore.profiles[lockedProfileId];
				if (!lockedProfile || normalizeProviderId(lockedProfile.provider) !== normalizeProviderId(provider)) lockedProfileId = void 0;
			}
			if (lockedProfileId) {
				if (!resolveAuthProfileEligibility({
					cfg: params.config,
					store: authStore,
					provider,
					profileId: lockedProfileId
				}).eligible) throw new Error(`Auth profile "${lockedProfileId}" is not configured for ${provider}.`);
			}
			const profileOrder = shouldPreferExplicitConfigApiKeyAuth(params.config, provider) ? [] : resolveAuthProfileOrder({
				cfg: params.config,
				store: authStore,
				provider,
				preferredProfile: preferredProfileId
			});
			const profileCandidates = lockedProfileId ? [lockedProfileId] : profileOrder.length > 0 ? profileOrder : [void 0];
			let profileIndex = 0;
			const traceAttempts = [];
			const initialThinkLevel = params.thinkLevel ?? "off";
			let thinkLevel = initialThinkLevel;
			const attemptedThinking = /* @__PURE__ */ new Set();
			let apiKeyInfo = null;
			let lastProfileId;
			let runtimeAuthState = null;
			let runtimeAuthRefreshCancelled = false;
			const { advanceAuthProfile, initializeAuthProfile, maybeRefreshRuntimeAuthForAuthError, stopRuntimeAuthRefreshTimer } = createEmbeddedRunAuthController({
				config: params.config,
				agentDir,
				workspaceDir: resolvedWorkspace,
				authStore,
				authStorage,
				profileCandidates,
				lockedProfileId,
				initialThinkLevel,
				attemptedThinking,
				fallbackConfigured,
				allowTransientCooldownProbe: params.allowTransientCooldownProbe === true,
				getProvider: () => provider,
				getModelId: () => modelId,
				getRuntimeModel: () => runtimeModel,
				setRuntimeModel: (next) => {
					runtimeModel = next;
				},
				getEffectiveModel: () => effectiveModel,
				setEffectiveModel: (next) => {
					effectiveModel = next;
				},
				getApiKeyInfo: () => apiKeyInfo,
				setApiKeyInfo: (next) => {
					apiKeyInfo = next;
				},
				getLastProfileId: () => lastProfileId,
				setLastProfileId: (next) => {
					lastProfileId = next;
				},
				getRuntimeAuthState: () => runtimeAuthState,
				setRuntimeAuthState: (next) => {
					runtimeAuthState = next;
				},
				getRuntimeAuthRefreshCancelled: () => runtimeAuthRefreshCancelled,
				setRuntimeAuthRefreshCancelled: (next) => {
					runtimeAuthRefreshCancelled = next;
				},
				getProfileIndex: () => profileIndex,
				setProfileIndex: (next) => {
					profileIndex = next;
				},
				setThinkLevel: (next) => {
					thinkLevel = next;
				},
				log: log$3
			});
			await initializeAuthProfile();
			const { sessionAgentId } = resolveSessionAgentIds({
				sessionKey: params.sessionKey,
				config: params.config,
				agentId: params.agentId
			});
			const configuredExecutionContract = resolveAgentExecutionContract(params.config, sessionAgentId) ?? "default";
			const strictAgenticActive = isStrictAgenticExecutionContractActive({
				config: params.config,
				sessionKey: params.sessionKey,
				agentId: params.agentId,
				provider,
				modelId
			});
			const executionContract = strictAgenticActive ? "strict-agentic" : "default";
			const maxPlanningOnlyRetryAttempts = resolvePlanningOnlyRetryLimit(executionContract);
			const maxReasoningOnlyRetryAttempts = 2;
			const maxEmptyResponseRetryAttempts = 1;
			const MAX_TIMEOUT_COMPACTION_ATTEMPTS = 2;
			const MAX_OVERFLOW_COMPACTION_ATTEMPTS = 3;
			const MAX_RUN_LOOP_ITERATIONS = resolveMaxRunRetryIterations(profileCandidates.length);
			let overflowCompactionAttempts = 0;
			let toolResultTruncationAttempted = false;
			let bootstrapPromptWarningSignaturesSeen = params.bootstrapPromptWarningSignaturesSeen ?? (params.bootstrapPromptWarningSignature ? [params.bootstrapPromptWarningSignature] : []);
			const usageAccumulator = createUsageAccumulator();
			let lastRunPromptUsage;
			let autoCompactionCount = 0;
			let runLoopIterations = 0;
			let overloadProfileRotations = 0;
			let planningOnlyRetryAttempts = 0;
			let reasoningOnlyRetryAttempts = 0;
			let emptyResponseRetryAttempts = 0;
			let sameModelIdleTimeoutRetries = 0;
			let lastRetryFailoverReason = null;
			let planningOnlyRetryInstruction = null;
			let reasoningOnlyRetryInstruction = null;
			let emptyResponseRetryInstruction = null;
			const ackExecutionFastPathInstruction = resolveAckExecutionFastPathInstruction({
				provider,
				modelId,
				prompt: params.prompt
			});
			let rateLimitProfileRotations = 0;
			let timeoutCompactionAttempts = 0;
			const overloadFailoverBackoffMs = resolveOverloadFailoverBackoffMs(params.config);
			const overloadProfileRotationLimit = resolveOverloadProfileRotationLimit(params.config);
			const rateLimitProfileRotationLimit = resolveRateLimitProfileRotationLimit(params.config);
			const maybeEscalateRateLimitProfileFallback = (params) => {
				rateLimitProfileRotations += 1;
				if (rateLimitProfileRotations <= rateLimitProfileRotationLimit || !fallbackConfigured) return;
				const status = resolveFailoverStatus("rate_limit");
				log$3.warn(`rate-limit profile rotation cap reached for ${sanitizeForLog(provider)}/${sanitizeForLog(modelId)} after ${rateLimitProfileRotations} rotations; escalating to model fallback`);
				params.logFallbackDecision("fallback_model", { status });
				throw new FailoverError("The AI service is temporarily rate-limited. Please try again in a moment.", {
					reason: "rate_limit",
					provider: params.failoverProvider,
					model: params.failoverModel,
					profileId: lastProfileId,
					status
				});
			};
			const maybeMarkAuthProfileFailure = async (failure) => {
				const { profileId, reason } = failure;
				if (!profileId || !reason || reason === "timeout") return;
				await markAuthProfileFailure({
					store: authStore,
					profileId,
					reason,
					cfg: params.config,
					agentDir,
					runId: params.runId,
					modelId: failure.modelId
				});
			};
			const resolveAuthProfileFailureReason = (failoverReason) => {
				if (!failoverReason || failoverReason === "timeout") return null;
				return failoverReason;
			};
			const maybeBackoffBeforeOverloadFailover = async (reason) => {
				if (reason !== "overloaded" || overloadFailoverBackoffMs <= 0) return;
				log$3.warn(`overload backoff before failover for ${provider}/${modelId}: delayMs=${overloadFailoverBackoffMs}`);
				try {
					await sleepWithAbort(overloadFailoverBackoffMs, params.abortSignal);
				} catch (err) {
					if (params.abortSignal?.aborted) {
						const abortErr = new Error("Operation aborted", { cause: err });
						abortErr.name = "AbortError";
						throw abortErr;
					}
					throw err;
				}
			};
			ensureContextEnginesInitialized();
			const contextEngine = await resolveContextEngine(params.config);
			try {
				const runOwnsCompactionBeforeHook = async (reason) => {
					if (contextEngine.info.ownsCompaction !== true || !hookRunner?.hasHooks("before_compaction")) return;
					try {
						await hookRunner.runBeforeCompaction({
							messageCount: -1,
							sessionFile: params.sessionFile
						}, hookCtx);
					} catch (hookErr) {
						log$3.warn(`before_compaction hook failed during ${reason}: ${String(hookErr)}`);
					}
				};
				const runOwnsCompactionAfterHook = async (reason, compactResult) => {
					if (contextEngine.info.ownsCompaction !== true || !compactResult.ok || !compactResult.compacted || !hookRunner?.hasHooks("after_compaction")) return;
					try {
						await hookRunner.runAfterCompaction({
							messageCount: -1,
							compactedCount: -1,
							tokenCount: compactResult.result?.tokensAfter,
							sessionFile: params.sessionFile
						}, hookCtx);
					} catch (hookErr) {
						log$3.warn(`after_compaction hook failed during ${reason}: ${String(hookErr)}`);
					}
				};
				let authRetryPending = false;
				let accumulatedReplayState = createEmbeddedRunReplayState();
				let lastTurnTotal;
				while (true) {
					if (runLoopIterations >= MAX_RUN_LOOP_ITERATIONS) {
						const message = `Exceeded retry limit after ${runLoopIterations} attempts (max=${MAX_RUN_LOOP_ITERATIONS}).`;
						log$3.error(`[run-retry-limit] sessionKey=${params.sessionKey ?? params.sessionId} provider=${provider}/${modelId} attempts=${runLoopIterations} maxAttempts=${MAX_RUN_LOOP_ITERATIONS}`);
						return handleRetryLimitExhaustion({
							message,
							decision: resolveRunFailoverDecision({
								stage: "retry_limit",
								fallbackConfigured,
								failoverReason: lastRetryFailoverReason
							}),
							provider,
							model: modelId,
							profileId: lastProfileId,
							durationMs: Date.now() - started,
							agentMeta: buildErrorAgentMeta({
								sessionId: params.sessionId,
								provider,
								model: model.id,
								usageAccumulator,
								lastRunPromptUsage,
								lastTurnTotal
							}),
							replayInvalid: accumulatedReplayState.replayInvalid ? true : void 0,
							livenessState: "blocked"
						});
					}
					runLoopIterations += 1;
					const runtimeAuthRetry = authRetryPending;
					authRetryPending = false;
					attemptedThinking.add(thinkLevel);
					await fs$1.mkdir(resolvedWorkspace, { recursive: true });
					const basePrompt = provider === "anthropic" ? scrubAnthropicRefusalMagic(params.prompt) : params.prompt;
					const promptAdditions = [
						ackExecutionFastPathInstruction,
						planningOnlyRetryInstruction,
						reasoningOnlyRetryInstruction,
						emptyResponseRetryInstruction
					].filter((value) => typeof value === "string" && value.trim().length > 0);
					const prompt = promptAdditions.length > 0 ? `${basePrompt}\n\n${promptAdditions.join("\n\n")}` : basePrompt;
					let resolvedStreamApiKey;
					if (!runtimeAuthState && apiKeyInfo) resolvedStreamApiKey = apiKeyInfo.apiKey;
					const attempt = await runEmbeddedAttemptWithBackend({
						sessionId: params.sessionId,
						sessionKey: resolvedSessionKey,
						trigger: params.trigger,
						memoryFlushWritePath: params.memoryFlushWritePath,
						messageChannel: params.messageChannel,
						messageProvider: params.messageProvider,
						agentAccountId: params.agentAccountId,
						messageTo: params.messageTo,
						messageThreadId: params.messageThreadId,
						groupId: params.groupId,
						groupChannel: params.groupChannel,
						groupSpace: params.groupSpace,
						spawnedBy: params.spawnedBy,
						senderId: params.senderId,
						senderName: params.senderName,
						senderUsername: params.senderUsername,
						senderE164: params.senderE164,
						senderIsOwner: params.senderIsOwner,
						currentChannelId: params.currentChannelId,
						currentThreadTs: params.currentThreadTs,
						currentMessageId: params.currentMessageId,
						replyToMode: params.replyToMode,
						hasRepliedRef: params.hasRepliedRef,
						sessionFile: params.sessionFile,
						workspaceDir: resolvedWorkspace,
						agentDir,
						config: params.config,
						allowGatewaySubagentBinding: params.allowGatewaySubagentBinding,
						contextEngine,
						contextTokenBudget: ctxInfo.tokens,
						skillsSnapshot: params.skillsSnapshot,
						prompt,
						images: params.images,
						imageOrder: params.imageOrder,
						clientTools: params.clientTools,
						disableTools: params.disableTools,
						provider,
						modelId,
						model: applyAuthHeaderOverride(applyLocalNoAuthHeaderOverride(effectiveModel, apiKeyInfo), runtimeAuthState ? null : apiKeyInfo, params.config),
						resolvedApiKey: resolvedStreamApiKey,
						authProfileId: lastProfileId,
						authProfileIdSource: lockedProfileId ? "user" : "auto",
						initialReplayState: accumulatedReplayState,
						authStorage,
						modelRegistry,
						agentId: workspaceResolution.agentId,
						legacyBeforeAgentStartResult,
						thinkLevel,
						fastMode: params.fastMode,
						verboseLevel: params.verboseLevel,
						reasoningLevel: params.reasoningLevel,
						toolResultFormat: resolvedToolResultFormat,
						execOverrides: params.execOverrides,
						bashElevated: params.bashElevated,
						timeoutMs: params.timeoutMs,
						runId: params.runId,
						abortSignal: params.abortSignal,
						replyOperation: params.replyOperation,
						shouldEmitToolResult: params.shouldEmitToolResult,
						shouldEmitToolOutput: params.shouldEmitToolOutput,
						onPartialReply: params.onPartialReply,
						onAssistantMessageStart: params.onAssistantMessageStart,
						onBlockReply: params.onBlockReply,
						onBlockReplyFlush: params.onBlockReplyFlush,
						blockReplyBreak: params.blockReplyBreak,
						blockReplyChunking: params.blockReplyChunking,
						onReasoningStream: params.onReasoningStream,
						onReasoningEnd: params.onReasoningEnd,
						onToolResult: params.onToolResult,
						onAgentEvent: params.onAgentEvent,
						extraSystemPrompt: params.extraSystemPrompt,
						inputProvenance: params.inputProvenance,
						streamParams: params.streamParams,
						ownerNumbers: params.ownerNumbers,
						enforceFinalTag: params.enforceFinalTag,
						silentExpected: params.silentExpected,
						bootstrapContextMode: params.bootstrapContextMode,
						bootstrapContextRunKind: params.bootstrapContextRunKind,
						toolsAllow: params.toolsAllow,
						disableMessageTool: params.disableMessageTool,
						requireExplicitMessageTarget: params.requireExplicitMessageTarget,
						internalEvents: params.internalEvents,
						bootstrapPromptWarningSignaturesSeen,
						bootstrapPromptWarningSignature: bootstrapPromptWarningSignaturesSeen[bootstrapPromptWarningSignaturesSeen.length - 1]
					});
					const { aborted, externalAbort, promptError, promptErrorSource, preflightRecovery, timedOut, idleTimedOut, timedOutDuringCompaction, sessionIdUsed, lastAssistant: sessionLastAssistant, currentAttemptAssistant } = attempt;
					bootstrapPromptWarningSignaturesSeen = attempt.bootstrapPromptWarningSignaturesSeen ?? (attempt.bootstrapPromptWarningSignature ? Array.from(new Set([...bootstrapPromptWarningSignaturesSeen, attempt.bootstrapPromptWarningSignature])) : bootstrapPromptWarningSignaturesSeen);
					const lastAssistantUsage = normalizeUsage(sessionLastAssistant?.usage);
					const attemptUsage = attempt.attemptUsage ?? lastAssistantUsage;
					mergeUsageIntoAccumulator(usageAccumulator, attemptUsage);
					lastRunPromptUsage = lastAssistantUsage ?? attemptUsage;
					lastTurnTotal = lastAssistantUsage?.total ?? attemptUsage?.total;
					const attemptCompactionCount = Math.max(0, attempt.compactionCount ?? 0);
					autoCompactionCount += attemptCompactionCount;
					const activeErrorContext = resolveActiveErrorContext({
						provider,
						model: modelId,
						assistant: currentAttemptAssistant ?? sessionLastAssistant
					});
					const resolveReplayInvalidForAttempt = (incompleteTurnText) => accumulatedReplayState.replayInvalid || resolveReplayInvalidFlag({
						attempt,
						incompleteTurnText
					});
					if (resolveReplayInvalidForAttempt(null)) accumulatedReplayState.replayInvalid = true;
					accumulatedReplayState = observeReplayMetadata(accumulatedReplayState, attempt.replayMetadata);
					const formattedAssistantErrorText = sessionLastAssistant ? formatAssistantErrorText(sessionLastAssistant, {
						cfg: params.config,
						sessionKey: resolvedSessionKey ?? params.sessionId,
						provider: activeErrorContext.provider,
						model: activeErrorContext.model
					}) : void 0;
					const assistantErrorText = sessionLastAssistant?.stopReason === "error" ? sessionLastAssistant.errorMessage?.trim() || formattedAssistantErrorText : void 0;
					const canRestartForLiveSwitch = !attempt.didSendViaMessagingTool && !attempt.didSendDeterministicApprovalPrompt && !attempt.lastToolError && attempt.toolMetas.length === 0 && attempt.assistantTexts.length === 0;
					if (preflightRecovery?.handled) {
						log$3.info(`[context-overflow-precheck] early recovery route=${preflightRecovery.route} completed for ${provider}/${modelId}; retrying prompt`);
						continue;
					}
					const requestedSelection = shouldSwitchToLiveModel({
						cfg: params.config,
						sessionKey: resolvedSessionKey,
						agentId: params.agentId,
						defaultProvider: DEFAULT_PROVIDER,
						defaultModel: DEFAULT_MODEL,
						currentProvider: provider,
						currentModel: modelId,
						currentAuthProfileId: preferredProfileId,
						currentAuthProfileIdSource: params.authProfileIdSource
					});
					if (requestedSelection && canRestartForLiveSwitch) {
						await clearLiveModelSwitchPending({
							cfg: params.config,
							sessionKey: resolvedSessionKey,
							agentId: params.agentId
						});
						log$3.info(`live session model switch requested during active attempt for ${params.sessionId}: ${provider}/${modelId} -> ${requestedSelection.provider}/${requestedSelection.model}`);
						throw new LiveSessionModelSwitchError(requestedSelection);
					}
					if (timedOut && !timedOutDuringCompaction) {
						const lastTurnPromptTokens = derivePromptTokens(lastRunPromptUsage);
						const tokenUsedRatio = lastTurnPromptTokens != null && ctxInfo.tokens > 0 ? lastTurnPromptTokens / ctxInfo.tokens : 0;
						if (timeoutCompactionAttempts >= MAX_TIMEOUT_COMPACTION_ATTEMPTS) log$3.warn(`[timeout-compaction] already attempted timeout compaction ${timeoutCompactionAttempts} time(s); falling through to failover rotation`);
						else if (tokenUsedRatio > .65) {
							const timeoutDiagId = createCompactionDiagId();
							timeoutCompactionAttempts++;
							log$3.warn(`[timeout-compaction] LLM timed out with high prompt token usage (${Math.round(tokenUsedRatio * 100)}%); attempting compaction before retry (attempt ${timeoutCompactionAttempts}/${MAX_TIMEOUT_COMPACTION_ATTEMPTS}) diagId=${timeoutDiagId}`);
							let timeoutCompactResult;
							await runOwnsCompactionBeforeHook("timeout recovery");
							try {
								const timeoutCompactionRuntimeContext = {
									...buildEmbeddedCompactionRuntimeContext({
										sessionKey: params.sessionKey,
										messageChannel: params.messageChannel,
										messageProvider: params.messageProvider,
										agentAccountId: params.agentAccountId,
										currentChannelId: params.currentChannelId,
										currentThreadTs: params.currentThreadTs,
										currentMessageId: params.currentMessageId,
										authProfileId: lastProfileId,
										workspaceDir: resolvedWorkspace,
										agentDir,
										config: params.config,
										skillsSnapshot: params.skillsSnapshot,
										senderIsOwner: params.senderIsOwner,
										senderId: params.senderId,
										provider,
										modelId,
										thinkLevel,
										reasoningLevel: params.reasoningLevel,
										bashElevated: params.bashElevated,
										extraSystemPrompt: params.extraSystemPrompt,
										ownerNumbers: params.ownerNumbers
									}),
									...attempt.promptCache ? { promptCache: attempt.promptCache } : {},
									runId: params.runId,
									trigger: "timeout_recovery",
									diagId: timeoutDiagId,
									attempt: timeoutCompactionAttempts,
									maxAttempts: MAX_TIMEOUT_COMPACTION_ATTEMPTS
								};
								timeoutCompactResult = await contextEngine.compact({
									sessionId: params.sessionId,
									sessionKey: params.sessionKey,
									sessionFile: params.sessionFile,
									tokenBudget: ctxInfo.tokens,
									force: true,
									compactionTarget: "budget",
									runtimeContext: timeoutCompactionRuntimeContext
								});
							} catch (compactErr) {
								log$3.warn(`[timeout-compaction] contextEngine.compact() threw during timeout recovery for ${provider}/${modelId}: ${String(compactErr)}`);
								timeoutCompactResult = {
									ok: false,
									compacted: false,
									reason: String(compactErr)
								};
							}
							await runOwnsCompactionAfterHook("timeout recovery", timeoutCompactResult);
							if (timeoutCompactResult.compacted) {
								autoCompactionCount += 1;
								if (contextEngine.info.ownsCompaction === true) await runPostCompactionSideEffects({
									config: params.config,
									sessionKey: params.sessionKey,
									sessionFile: params.sessionFile
								});
								log$3.info(`[timeout-compaction] compaction succeeded for ${provider}/${modelId}; retrying prompt`);
								continue;
							} else log$3.warn(`[timeout-compaction] compaction did not reduce context for ${provider}/${modelId}; falling through to normal handling`);
						}
					}
					const contextOverflowError = !aborted ? (() => {
						if (promptError) {
							const errorText = formatErrorMessage(promptError);
							if (isLikelyContextOverflowError(errorText)) return {
								text: errorText,
								source: "promptError"
							};
							return null;
						}
						if (assistantErrorText && isLikelyContextOverflowError(assistantErrorText)) return {
							text: assistantErrorText,
							source: "assistantError"
						};
						return null;
					})() : null;
					if (contextOverflowError) {
						const overflowDiagId = createCompactionDiagId();
						const errorText = contextOverflowError.text;
						const msgCount = attempt.messagesSnapshot?.length ?? 0;
						const observedOverflowTokens = extractObservedOverflowTokenCount(errorText);
						log$3.warn(`[context-overflow-diag] sessionKey=${params.sessionKey ?? params.sessionId} provider=${provider}/${modelId} source=${contextOverflowError.source} messages=${msgCount} sessionFile=${params.sessionFile} diagId=${overflowDiagId} compactionAttempts=${overflowCompactionAttempts} observedTokens=${observedOverflowTokens ?? "unknown"} error=${errorText.slice(0, 200)}`);
						const isCompactionFailure = isCompactionFailureError(errorText);
						const hadAttemptLevelCompaction = attemptCompactionCount > 0;
						if (!isCompactionFailure && hadAttemptLevelCompaction && overflowCompactionAttempts < MAX_OVERFLOW_COMPACTION_ATTEMPTS) {
							overflowCompactionAttempts++;
							log$3.warn(`context overflow persisted after in-attempt compaction (attempt ${overflowCompactionAttempts}/${MAX_OVERFLOW_COMPACTION_ATTEMPTS}); retrying prompt without additional compaction for ${provider}/${modelId}`);
							continue;
						}
						if (!isCompactionFailure && !hadAttemptLevelCompaction && overflowCompactionAttempts < MAX_OVERFLOW_COMPACTION_ATTEMPTS) {
							if (log$3.isEnabled("debug")) log$3.debug(`[compaction-diag] decision diagId=${overflowDiagId} branch=compact isCompactionFailure=${isCompactionFailure} hasOversizedToolResults=unknown attempt=${overflowCompactionAttempts + 1} maxAttempts=${MAX_OVERFLOW_COMPACTION_ATTEMPTS}`);
							overflowCompactionAttempts++;
							log$3.warn(`context overflow detected (attempt ${overflowCompactionAttempts}/${MAX_OVERFLOW_COMPACTION_ATTEMPTS}); attempting auto-compaction for ${provider}/${modelId}`);
							let compactResult;
							await runOwnsCompactionBeforeHook("overflow recovery");
							try {
								const overflowCompactionRuntimeContext = {
									...buildEmbeddedCompactionRuntimeContext({
										sessionKey: params.sessionKey,
										messageChannel: params.messageChannel,
										messageProvider: params.messageProvider,
										agentAccountId: params.agentAccountId,
										currentChannelId: params.currentChannelId,
										currentThreadTs: params.currentThreadTs,
										currentMessageId: params.currentMessageId,
										authProfileId: lastProfileId,
										workspaceDir: resolvedWorkspace,
										agentDir,
										config: params.config,
										skillsSnapshot: params.skillsSnapshot,
										senderIsOwner: params.senderIsOwner,
										senderId: params.senderId,
										provider,
										modelId,
										thinkLevel,
										reasoningLevel: params.reasoningLevel,
										bashElevated: params.bashElevated,
										extraSystemPrompt: params.extraSystemPrompt,
										ownerNumbers: params.ownerNumbers
									}),
									...attempt.promptCache ? { promptCache: attempt.promptCache } : {},
									runId: params.runId,
									trigger: "overflow",
									...observedOverflowTokens !== void 0 ? { currentTokenCount: observedOverflowTokens } : {},
									diagId: overflowDiagId,
									attempt: overflowCompactionAttempts,
									maxAttempts: MAX_OVERFLOW_COMPACTION_ATTEMPTS
								};
								compactResult = await contextEngine.compact({
									sessionId: params.sessionId,
									sessionKey: params.sessionKey,
									sessionFile: params.sessionFile,
									tokenBudget: ctxInfo.tokens,
									...observedOverflowTokens !== void 0 ? { currentTokenCount: observedOverflowTokens } : {},
									force: true,
									compactionTarget: "budget",
									runtimeContext: overflowCompactionRuntimeContext
								});
								if (compactResult.ok && compactResult.compacted) await runContextEngineMaintenance({
									contextEngine,
									sessionId: params.sessionId,
									sessionKey: params.sessionKey,
									sessionFile: params.sessionFile,
									reason: "compaction",
									runtimeContext: overflowCompactionRuntimeContext
								});
							} catch (compactErr) {
								log$3.warn(`contextEngine.compact() threw during overflow recovery for ${provider}/${modelId}: ${String(compactErr)}`);
								compactResult = {
									ok: false,
									compacted: false,
									reason: String(compactErr)
								};
							}
							await runOwnsCompactionAfterHook("overflow recovery", compactResult);
							if (compactResult.compacted) {
								if (preflightRecovery?.route === "compact_then_truncate") {
									const truncResult = await truncateOversizedToolResultsInSession({
										sessionFile: params.sessionFile,
										contextWindowTokens: ctxInfo.tokens,
										maxCharsOverride: resolveLiveToolResultMaxChars({
											contextWindowTokens: ctxInfo.tokens,
											cfg: params.config,
											agentId: sessionAgentId
										}),
										sessionId: params.sessionId,
										sessionKey: params.sessionKey
									});
									if (truncResult.truncated) log$3.info(`[context-overflow-precheck] post-compaction tool-result truncation succeeded for ${provider}/${modelId}; truncated ${truncResult.truncatedCount} tool result(s)`);
									else log$3.warn(`[context-overflow-precheck] post-compaction tool-result truncation did not help for ${provider}/${modelId}: ${truncResult.reason ?? "unknown"}`);
								}
								autoCompactionCount += 1;
								log$3.info(`auto-compaction succeeded for ${provider}/${modelId}; retrying prompt`);
								continue;
							}
							log$3.warn(`auto-compaction failed for ${provider}/${modelId}: ${compactResult.reason ?? "nothing to compact"}`);
						}
						if (!toolResultTruncationAttempted) {
							const contextWindowTokens = ctxInfo.tokens;
							const toolResultMaxChars = resolveLiveToolResultMaxChars({
								contextWindowTokens,
								cfg: params.config,
								agentId: sessionAgentId
							});
							if (attempt.messagesSnapshot ? sessionLikelyHasOversizedToolResults({
								messages: attempt.messagesSnapshot,
								contextWindowTokens,
								maxCharsOverride: toolResultMaxChars
							}) : false) {
								toolResultTruncationAttempted = true;
								log$3.warn(`[context-overflow-recovery] Attempting tool result truncation for ${provider}/${modelId} (contextWindow=${contextWindowTokens} tokens)`);
								const truncResult = await truncateOversizedToolResultsInSession({
									sessionFile: params.sessionFile,
									contextWindowTokens,
									maxCharsOverride: toolResultMaxChars,
									sessionId: params.sessionId,
									sessionKey: params.sessionKey
								});
								if (truncResult.truncated) {
									log$3.info(`[context-overflow-recovery] Truncated ${truncResult.truncatedCount} tool result(s); retrying prompt`);
									continue;
								}
								log$3.warn(`[context-overflow-recovery] Tool result truncation did not help: ${truncResult.reason ?? "unknown"}`);
							}
						}
						if ((isCompactionFailure || overflowCompactionAttempts >= MAX_OVERFLOW_COMPACTION_ATTEMPTS) && log$3.isEnabled("debug")) log$3.debug(`[compaction-diag] decision diagId=${overflowDiagId} branch=give_up isCompactionFailure=${isCompactionFailure} hasOversizedToolResults=unknown attempt=${overflowCompactionAttempts} maxAttempts=${MAX_OVERFLOW_COMPACTION_ATTEMPTS}`);
						const kind = isCompactionFailure ? "compaction_failure" : "context_overflow";
						attempt.setTerminalLifecycleMeta?.({
							replayInvalid: resolveReplayInvalidForAttempt(),
							livenessState: "blocked"
						});
						return {
							payloads: [{
								text: "Context overflow: prompt too large for the model. Try /reset (or /new) to start a fresh session, or use a larger-context model.",
								isError: true
							}],
							meta: {
								durationMs: Date.now() - started,
								agentMeta: buildErrorAgentMeta({
									sessionId: sessionIdUsed,
									provider,
									model: model.id,
									usageAccumulator,
									lastRunPromptUsage,
									lastAssistant: sessionLastAssistant,
									lastTurnTotal
								}),
								systemPromptReport: attempt.systemPromptReport,
								finalPromptText: attempt.finalPromptText,
								replayInvalid: resolveReplayInvalidForAttempt(),
								livenessState: "blocked",
								error: {
									kind,
									message: errorText
								}
							}
						};
					}
					if (promptError && !aborted && promptErrorSource !== "compaction") {
						const normalizedPromptFailover = coerceToFailoverError(promptError, {
							provider: activeErrorContext.provider,
							model: activeErrorContext.model,
							profileId: lastProfileId
						});
						const promptErrorDetails = normalizedPromptFailover ? describeFailoverError(normalizedPromptFailover) : describeFailoverError(promptError);
						const errorText = promptErrorDetails.message || formatErrorMessage(promptError);
						if (await maybeRefreshRuntimeAuthForAuthError(errorText, runtimeAuthRetry)) {
							authRetryPending = true;
							continue;
						}
						if (/incorrect role information|roles must alternate/i.test(errorText)) {
							attempt.setTerminalLifecycleMeta?.({
								replayInvalid: resolveReplayInvalidForAttempt(),
								livenessState: "blocked"
							});
							return {
								payloads: [{
									text: "Message ordering conflict - please try again. If this persists, use /new to start a fresh session.",
									isError: true
								}],
								meta: {
									durationMs: Date.now() - started,
									agentMeta: buildErrorAgentMeta({
										sessionId: sessionIdUsed,
										provider,
										model: model.id,
										usageAccumulator,
										lastRunPromptUsage,
										lastAssistant: sessionLastAssistant,
										lastTurnTotal
									}),
									systemPromptReport: attempt.systemPromptReport,
									finalPromptText: attempt.finalPromptText,
									replayInvalid: resolveReplayInvalidForAttempt(),
									livenessState: "blocked",
									error: {
										kind: "role_ordering",
										message: errorText
									}
								}
							};
						}
						const imageSizeError = parseImageSizeError(errorText);
						if (imageSizeError) {
							const maxMb = imageSizeError.maxMb;
							const maxMbLabel = typeof maxMb === "number" && Number.isFinite(maxMb) ? `${maxMb}` : null;
							const maxBytesHint = maxMbLabel ? ` (max ${maxMbLabel}MB)` : "";
							attempt.setTerminalLifecycleMeta?.({
								replayInvalid: resolveReplayInvalidForAttempt(),
								livenessState: "blocked"
							});
							return {
								payloads: [{
									text: `Image too large for the model${maxBytesHint}. Please compress or resize the image and try again.`,
									isError: true
								}],
								meta: {
									durationMs: Date.now() - started,
									agentMeta: buildErrorAgentMeta({
										sessionId: sessionIdUsed,
										provider,
										model: model.id,
										usageAccumulator,
										lastRunPromptUsage,
										lastAssistant: sessionLastAssistant,
										lastTurnTotal
									}),
									systemPromptReport: attempt.systemPromptReport,
									finalPromptText: attempt.finalPromptText,
									replayInvalid: resolveReplayInvalidForAttempt(),
									livenessState: "blocked",
									error: {
										kind: "image_size",
										message: errorText
									}
								}
							};
						}
						const promptFailoverReason = promptErrorDetails.reason ?? classifyFailoverReason(errorText, { provider });
						const promptProfileFailureReason = resolveAuthProfileFailureReason(promptFailoverReason);
						await maybeMarkAuthProfileFailure({
							profileId: lastProfileId,
							reason: promptProfileFailureReason,
							modelId
						});
						const promptFailoverFailure = promptFailoverReason !== null || isFailoverErrorMessage(errorText, { provider });
						const failedPromptProfileId = lastProfileId;
						const logPromptFailoverDecision = createFailoverDecisionLogger({
							stage: "prompt",
							runId: params.runId,
							rawError: errorText,
							failoverReason: promptFailoverReason,
							profileFailureReason: promptProfileFailureReason,
							provider,
							model: modelId,
							sourceProvider: provider,
							sourceModel: modelId,
							profileId: failedPromptProfileId,
							fallbackConfigured,
							aborted
						});
						if (promptFailoverReason === "rate_limit") maybeEscalateRateLimitProfileFallback({
							failoverProvider: provider,
							failoverModel: modelId,
							logFallbackDecision: logPromptFailoverDecision
						});
						let promptFailoverDecision = resolveRunFailoverDecision({
							stage: "prompt",
							aborted,
							externalAbort,
							fallbackConfigured,
							failoverFailure: promptFailoverFailure,
							failoverReason: promptFailoverReason,
							profileRotated: false
						});
						if (promptFailoverDecision.action === "rotate_profile" && await advanceAuthProfile()) {
							traceAttempts.push({
								provider,
								model: modelId,
								result: promptFailoverReason === "timeout" ? "timeout" : "rotate_profile",
								...promptFailoverReason ? { reason: promptFailoverReason } : {},
								stage: "prompt"
							});
							lastRetryFailoverReason = mergeRetryFailoverReason({
								previous: lastRetryFailoverReason,
								failoverReason: promptFailoverReason
							});
							logPromptFailoverDecision("rotate_profile");
							await maybeBackoffBeforeOverloadFailover(promptFailoverReason);
							continue;
						}
						if (promptFailoverDecision.action === "rotate_profile") promptFailoverDecision = resolveRunFailoverDecision({
							stage: "prompt",
							aborted,
							externalAbort,
							fallbackConfigured,
							failoverFailure: promptFailoverFailure,
							failoverReason: promptFailoverReason,
							profileRotated: true
						});
						const fallbackThinking = pickFallbackThinkingLevel({
							message: errorText,
							attempted: attemptedThinking
						});
						if (fallbackThinking) {
							log$3.warn(`unsupported thinking level for ${provider}/${modelId}; retrying with ${fallbackThinking}`);
							thinkLevel = fallbackThinking;
							continue;
						}
						if (promptFailoverDecision.action === "fallback_model") {
							const fallbackReason = promptFailoverDecision.reason ?? "unknown";
							const status = resolveFailoverStatus(fallbackReason);
							traceAttempts.push({
								provider,
								model: modelId,
								result: promptFailoverReason === "timeout" ? "timeout" : "fallback_model",
								reason: fallbackReason,
								stage: "prompt",
								...typeof status === "number" ? { status } : {}
							});
							logPromptFailoverDecision("fallback_model", { status });
							await maybeBackoffBeforeOverloadFailover(promptFailoverReason);
							throw normalizedPromptFailover ?? new FailoverError(errorText, {
								reason: fallbackReason,
								provider,
								model: modelId,
								profileId: lastProfileId,
								status
							});
						}
						if (promptFailoverDecision.action === "surface_error") {
							traceAttempts.push({
								provider,
								model: modelId,
								result: promptFailoverReason === "timeout" ? "timeout" : "surface_error",
								...promptFailoverReason ? { reason: promptFailoverReason } : {},
								stage: "prompt"
							});
							logPromptFailoverDecision("surface_error");
						}
						throw promptError;
					}
					const assistantForFailover = currentAttemptAssistant ?? sessionLastAssistant;
					const fallbackThinking = pickFallbackThinkingLevel({
						message: assistantForFailover?.errorMessage,
						attempted: attemptedThinking
					});
					if (fallbackThinking && !aborted) {
						log$3.warn(`unsupported thinking level for ${provider}/${modelId}; retrying with ${fallbackThinking}`);
						thinkLevel = fallbackThinking;
						continue;
					}
					const authFailure = isAuthAssistantError(assistantForFailover);
					const rateLimitFailure = isRateLimitAssistantError(assistantForFailover);
					const billingFailure = isBillingAssistantError(assistantForFailover);
					const failoverFailure = isFailoverAssistantError(assistantForFailover);
					const assistantFailoverReason = classifyFailoverReason(assistantForFailover?.errorMessage ?? "", { provider: assistantForFailover?.provider });
					const assistantProfileFailureReason = resolveAuthProfileFailureReason(assistantFailoverReason);
					const cloudCodeAssistFormatError = attempt.cloudCodeAssistFormatError;
					const imageDimensionError = parseImageDimensionError(assistantForFailover?.errorMessage ?? "");
					const failedAssistantProfileId = lastProfileId;
					const logAssistantFailoverDecision = createFailoverDecisionLogger({
						stage: "assistant",
						runId: params.runId,
						rawError: assistantForFailover?.errorMessage?.trim(),
						failoverReason: assistantFailoverReason,
						profileFailureReason: assistantProfileFailureReason,
						provider: activeErrorContext.provider,
						model: activeErrorContext.model,
						sourceProvider: assistantForFailover?.provider ?? provider,
						sourceModel: assistantForFailover?.model ?? modelId,
						profileId: failedAssistantProfileId,
						fallbackConfigured,
						timedOut,
						aborted
					});
					if (authFailure && await maybeRefreshRuntimeAuthForAuthError(assistantForFailover?.errorMessage ?? "", runtimeAuthRetry)) {
						authRetryPending = true;
						continue;
					}
					if (imageDimensionError && lastProfileId) {
						const details = [
							imageDimensionError.messageIndex !== void 0 ? `message=${imageDimensionError.messageIndex}` : null,
							imageDimensionError.contentIndex !== void 0 ? `content=${imageDimensionError.contentIndex}` : null,
							imageDimensionError.maxDimensionPx !== void 0 ? `limit=${imageDimensionError.maxDimensionPx}px` : null
						].filter(Boolean).join(" ");
						log$3.warn(`Profile ${lastProfileId} rejected image payload${details ? ` (${details})` : ""}.`);
					}
					const assistantFailoverDecision = resolveRunFailoverDecision({
						stage: "assistant",
						aborted,
						externalAbort,
						fallbackConfigured,
						failoverFailure,
						failoverReason: assistantFailoverReason,
						timedOut,
						timedOutDuringCompaction,
						profileRotated: false
					});
					const assistantFailoverOutcome = await handleAssistantFailover({
						initialDecision: assistantFailoverDecision,
						aborted,
						externalAbort,
						fallbackConfigured,
						failoverFailure,
						failoverReason: assistantFailoverReason,
						timedOut,
						idleTimedOut,
						timedOutDuringCompaction,
						allowSameModelIdleTimeoutRetry: timedOut && idleTimedOut && !timedOutDuringCompaction && !fallbackConfigured && canRestartForLiveSwitch && sameModelIdleTimeoutRetries < MAX_SAME_MODEL_IDLE_TIMEOUT_RETRIES,
						assistantProfileFailureReason,
						lastProfileId,
						modelId,
						provider,
						activeErrorContext,
						lastAssistant: assistantForFailover,
						config: params.config,
						sessionKey: params.sessionKey ?? params.sessionId,
						authFailure,
						rateLimitFailure,
						billingFailure,
						cloudCodeAssistFormatError,
						isProbeSession,
						overloadProfileRotations,
						overloadProfileRotationLimit,
						previousRetryFailoverReason: lastRetryFailoverReason,
						logAssistantFailoverDecision,
						warn: (message) => log$3.warn(message),
						maybeMarkAuthProfileFailure,
						maybeEscalateRateLimitProfileFallback,
						maybeBackoffBeforeOverloadFailover,
						advanceAuthProfile
					});
					overloadProfileRotations = assistantFailoverOutcome.overloadProfileRotations;
					if (assistantFailoverOutcome.action === "retry") {
						traceAttempts.push({
							provider: activeErrorContext.provider,
							model: activeErrorContext.model,
							result: assistantFailoverOutcome.retryKind === "same_model_idle_timeout" || assistantFailoverReason === "timeout" ? "timeout" : "rotate_profile",
							...assistantFailoverReason ? { reason: assistantFailoverReason } : {},
							stage: "assistant"
						});
						if (assistantFailoverOutcome.retryKind === "same_model_idle_timeout") sameModelIdleTimeoutRetries += 1;
						lastRetryFailoverReason = assistantFailoverOutcome.lastRetryFailoverReason;
						continue;
					}
					if (assistantFailoverOutcome.action === "throw") {
						traceAttempts.push({
							provider: activeErrorContext.provider,
							model: activeErrorContext.model,
							result: assistantFailoverReason === "timeout" ? "timeout" : assistantFailoverDecision.action === "fallback_model" ? "fallback_model" : "error",
							...assistantFailoverReason ? { reason: assistantFailoverReason } : {},
							stage: "assistant",
							...typeof assistantFailoverOutcome.error.status === "number" ? { status: assistantFailoverOutcome.error.status } : {}
						});
						throw assistantFailoverOutcome.error;
					}
					const usageMeta = buildUsageAgentMetaFields({
						usageAccumulator,
						lastAssistantUsage: sessionLastAssistant?.usage,
						lastRunPromptUsage,
						lastTurnTotal
					});
					const agentMeta = {
						sessionId: sessionIdUsed,
						provider: sessionLastAssistant?.provider ?? provider,
						model: sessionLastAssistant?.model ?? model.id,
						usage: usageMeta.usage,
						lastCallUsage: usageMeta.lastCallUsage,
						promptTokens: usageMeta.promptTokens,
						compactionCount: autoCompactionCount > 0 ? autoCompactionCount : void 0
					};
					const finalAssistantVisibleText = resolveFinalAssistantVisibleText(sessionLastAssistant);
					const finalAssistantRawText = resolveFinalAssistantRawText(sessionLastAssistant);
					const payloads = buildEmbeddedRunPayloads({
						assistantTexts: attempt.assistantTexts,
						toolMetas: attempt.toolMetas,
						lastAssistant: attempt.lastAssistant,
						lastToolError: attempt.lastToolError,
						config: params.config,
						isCronTrigger: params.trigger === "cron",
						sessionKey: params.sessionKey ?? params.sessionId,
						provider: activeErrorContext.provider,
						model: activeErrorContext.model,
						verboseLevel: params.verboseLevel,
						reasoningLevel: params.reasoningLevel,
						toolResultFormat: resolvedToolResultFormat,
						suppressToolErrorWarnings: params.suppressToolErrorWarnings,
						inlineToolResultsAllowed: false,
						didSendViaMessagingTool: attempt.didSendViaMessagingTool,
						didSendDeterministicApprovalPrompt: attempt.didSendDeterministicApprovalPrompt
					});
					const payloadsWithToolMedia = mergeAttemptToolMediaPayloads({
						payloads,
						toolMediaUrls: attempt.toolMediaUrls,
						toolAudioAsVoice: attempt.toolAudioAsVoice
					});
					if (timedOut && !timedOutDuringCompaction && !payloadsWithToolMedia?.length) {
						const timeoutText = idleTimedOut ? "The model did not produce a response before the LLM idle timeout. Please try again, or increase `agents.defaults.llm.idleTimeoutSeconds` in your config (set to 0 to disable)." : "Request timed out before a response was generated. Please try again, or increase `agents.defaults.timeoutSeconds` in your config.";
						const replayInvalid = resolveReplayInvalidForAttempt(null);
						const livenessState = resolveRunLivenessState({
							payloadCount: payloads.length,
							aborted,
							timedOut,
							attempt,
							incompleteTurnText: null
						});
						attempt.setTerminalLifecycleMeta?.({
							replayInvalid,
							livenessState
						});
						return {
							payloads: [{
								text: timeoutText,
								isError: true
							}],
							meta: {
								durationMs: Date.now() - started,
								agentMeta,
								aborted,
								systemPromptReport: attempt.systemPromptReport,
								finalPromptText: attempt.finalPromptText,
								finalAssistantVisibleText,
								finalAssistantRawText,
								replayInvalid,
								livenessState
							},
							didSendViaMessagingTool: attempt.didSendViaMessagingTool,
							didSendDeterministicApprovalPrompt: attempt.didSendDeterministicApprovalPrompt,
							messagingToolSentTexts: attempt.messagingToolSentTexts,
							messagingToolSentMediaUrls: attempt.messagingToolSentMediaUrls,
							messagingToolSentTargets: attempt.messagingToolSentTargets,
							successfulCronAdds: attempt.successfulCronAdds
						};
					}
					const payloadCount = payloadsWithToolMedia?.length ?? 0;
					const nextPlanningOnlyRetryInstruction = resolvePlanningOnlyRetryInstruction({
						provider,
						modelId,
						prompt: params.prompt,
						aborted,
						timedOut,
						attempt
					});
					const nextReasoningOnlyRetryInstruction = resolveReasoningOnlyRetryInstruction({
						provider: activeErrorContext.provider,
						modelId: activeErrorContext.model,
						aborted,
						timedOut,
						attempt
					});
					const nextEmptyResponseRetryInstruction = resolveEmptyResponseRetryInstruction({
						provider: activeErrorContext.provider,
						modelId: activeErrorContext.model,
						payloadCount,
						aborted,
						timedOut,
						attempt
					});
					if (nextPlanningOnlyRetryInstruction && planningOnlyRetryAttempts < maxPlanningOnlyRetryAttempts) {
						const planDetails = extractPlanningOnlyPlanDetails(attempt.assistantTexts.join("\n\n").trim());
						if (planDetails) {
							emitAgentPlanEvent({
								runId: params.runId,
								...params.sessionKey ? { sessionKey: params.sessionKey } : {},
								data: {
									phase: "update",
									title: "Assistant proposed a plan",
									explanation: planDetails.explanation,
									steps: planDetails.steps,
									source: "planning_only_retry"
								}
							});
							params.onAgentEvent?.({
								stream: "plan",
								data: {
									phase: "update",
									title: "Assistant proposed a plan",
									explanation: planDetails.explanation,
									steps: planDetails.steps,
									source: "planning_only_retry"
								}
							});
						}
						planningOnlyRetryAttempts += 1;
						planningOnlyRetryInstruction = nextPlanningOnlyRetryInstruction;
						log$3.warn(`planning-only turn detected: runId=${params.runId} sessionId=${params.sessionId} provider=${provider}/${modelId} contract=${executionContract} configured=${configuredExecutionContract} — retrying ${planningOnlyRetryAttempts}/${maxPlanningOnlyRetryAttempts} with act-now steer`);
						continue;
					}
					if (!nextPlanningOnlyRetryInstruction && nextReasoningOnlyRetryInstruction && reasoningOnlyRetryAttempts < maxReasoningOnlyRetryAttempts) {
						reasoningOnlyRetryAttempts += 1;
						reasoningOnlyRetryInstruction = nextReasoningOnlyRetryInstruction;
						log$3.warn(`reasoning-only assistant turn detected: runId=${params.runId} sessionId=${params.sessionId} provider=${activeErrorContext.provider}/${activeErrorContext.model} — retrying ${reasoningOnlyRetryAttempts}/${maxReasoningOnlyRetryAttempts} with visible-answer continuation`);
						continue;
					}
					const reasoningOnlyRetriesExhausted = !nextPlanningOnlyRetryInstruction && nextReasoningOnlyRetryInstruction && reasoningOnlyRetryAttempts >= maxReasoningOnlyRetryAttempts;
					if (!nextPlanningOnlyRetryInstruction && !nextReasoningOnlyRetryInstruction && nextEmptyResponseRetryInstruction && emptyResponseRetryAttempts < maxEmptyResponseRetryAttempts) {
						emptyResponseRetryAttempts += 1;
						emptyResponseRetryInstruction = nextEmptyResponseRetryInstruction;
						log$3.warn(`empty response detected: runId=${params.runId} sessionId=${params.sessionId} provider=${activeErrorContext.provider}/${activeErrorContext.model} — retrying ${emptyResponseRetryAttempts}/${maxEmptyResponseRetryAttempts} with visible-answer continuation`);
						continue;
					}
					const incompleteTurnText = resolveIncompleteTurnPayloadText({
						payloadCount,
						aborted,
						timedOut,
						attempt
					});
					if (reasoningOnlyRetriesExhausted && !finalAssistantVisibleText) log$3.warn(`reasoning-only retries exhausted: runId=${params.runId} sessionId=${params.sessionId} provider=${activeErrorContext.provider}/${activeErrorContext.model} attempts=${reasoningOnlyRetryAttempts}/${maxReasoningOnlyRetryAttempts} — surfacing incomplete-turn error`);
					if (!incompleteTurnText && nextPlanningOnlyRetryInstruction && strictAgenticActive) {
						log$3.warn(`strict-agentic run exhausted planning-only retries: runId=${params.runId} sessionId=${params.sessionId} provider=${provider}/${modelId} configured=${configuredExecutionContract} — surfacing blocked state`);
						const replayInvalid = resolveReplayInvalidForAttempt(null);
						const livenessState = "blocked";
						attempt.setTerminalLifecycleMeta?.({
							replayInvalid,
							livenessState
						});
						return {
							payloads: [{
								text: STRICT_AGENTIC_BLOCKED_TEXT,
								isError: true
							}],
							meta: {
								durationMs: Date.now() - started,
								agentMeta,
								aborted,
								systemPromptReport: attempt.systemPromptReport,
								finalPromptText: attempt.finalPromptText,
								finalAssistantVisibleText,
								finalAssistantRawText,
								replayInvalid,
								livenessState
							},
							didSendViaMessagingTool: attempt.didSendViaMessagingTool,
							didSendDeterministicApprovalPrompt: attempt.didSendDeterministicApprovalPrompt,
							messagingToolSentTexts: attempt.messagingToolSentTexts,
							messagingToolSentMediaUrls: attempt.messagingToolSentMediaUrls,
							messagingToolSentTargets: attempt.messagingToolSentTargets,
							successfulCronAdds: attempt.successfulCronAdds
						};
					}
					if (reasoningOnlyRetriesExhausted && !finalAssistantVisibleText) {
						const replayInvalid = resolveReplayInvalidForAttempt("⚠️ Agent couldn't generate a response. Please try again.");
						const livenessState = resolveRunLivenessState({
							payloadCount: 0,
							aborted,
							timedOut,
							attempt,
							incompleteTurnText: "⚠️ Agent couldn't generate a response. Please try again."
						});
						attempt.setTerminalLifecycleMeta?.({
							replayInvalid,
							livenessState
						});
						if (lastProfileId) await maybeMarkAuthProfileFailure({
							profileId: lastProfileId,
							reason: resolveAuthProfileFailureReason(assistantFailoverReason)
						});
						return {
							payloads: [{
								text: "⚠️ Agent couldn't generate a response. Please try again.",
								isError: true
							}],
							meta: {
								durationMs: Date.now() - started,
								agentMeta,
								aborted,
								systemPromptReport: attempt.systemPromptReport,
								finalPromptText: attempt.finalPromptText,
								finalAssistantVisibleText,
								finalAssistantRawText,
								replayInvalid,
								livenessState
							},
							didSendViaMessagingTool: attempt.didSendViaMessagingTool,
							didSendDeterministicApprovalPrompt: attempt.didSendDeterministicApprovalPrompt,
							messagingToolSentTexts: attempt.messagingToolSentTexts,
							messagingToolSentMediaUrls: attempt.messagingToolSentMediaUrls,
							messagingToolSentTargets: attempt.messagingToolSentTargets,
							successfulCronAdds: attempt.successfulCronAdds
						};
					}
					if (!nextPlanningOnlyRetryInstruction && !nextReasoningOnlyRetryInstruction && nextEmptyResponseRetryInstruction && emptyResponseRetryAttempts >= maxEmptyResponseRetryAttempts) log$3.warn(`empty response retries exhausted: runId=${params.runId} sessionId=${params.sessionId} provider=${activeErrorContext.provider}/${activeErrorContext.model} attempts=${emptyResponseRetryAttempts}/${maxEmptyResponseRetryAttempts} — surfacing incomplete-turn error`);
					if (incompleteTurnText) {
						const replayInvalid = resolveReplayInvalidForAttempt(incompleteTurnText);
						const livenessState = resolveRunLivenessState({
							payloadCount: payloads.length,
							aborted,
							timedOut,
							attempt,
							incompleteTurnText
						});
						attempt.setTerminalLifecycleMeta?.({
							replayInvalid,
							livenessState
						});
						const incompleteStopReason = attempt.lastAssistant?.stopReason;
						log$3.warn(`incomplete turn detected: runId=${params.runId} sessionId=${params.sessionId} stopReason=${incompleteStopReason} payloads=0 — surfacing error to user`);
						if (lastProfileId) await maybeMarkAuthProfileFailure({
							profileId: lastProfileId,
							reason: resolveAuthProfileFailureReason(assistantFailoverReason)
						});
						return {
							payloads: [{
								text: incompleteTurnText,
								isError: true
							}],
							meta: {
								durationMs: Date.now() - started,
								agentMeta,
								aborted,
								systemPromptReport: attempt.systemPromptReport,
								finalPromptText: attempt.finalPromptText,
								finalAssistantVisibleText,
								finalAssistantRawText,
								replayInvalid,
								livenessState
							},
							didSendViaMessagingTool: attempt.didSendViaMessagingTool,
							didSendDeterministicApprovalPrompt: attempt.didSendDeterministicApprovalPrompt,
							messagingToolSentTexts: attempt.messagingToolSentTexts,
							messagingToolSentMediaUrls: attempt.messagingToolSentMediaUrls,
							messagingToolSentTargets: attempt.messagingToolSentTargets,
							successfulCronAdds: attempt.successfulCronAdds
						};
					}
					log$3.debug(`embedded run done: runId=${params.runId} sessionId=${params.sessionId} durationMs=${Date.now() - started} aborted=${aborted}`);
					if (lastProfileId) {
						await markAuthProfileGood({
							store: authStore,
							provider,
							profileId: lastProfileId,
							agentDir: params.agentDir
						});
						await markAuthProfileUsed({
							store: authStore,
							profileId: lastProfileId,
							agentDir: params.agentDir
						});
					}
					const replayInvalid = resolveReplayInvalidForAttempt(null);
					const livenessState = resolveRunLivenessState({
						payloadCount: payloads.length,
						aborted,
						timedOut,
						attempt,
						incompleteTurnText: null
					});
					const stopReason = attempt.clientToolCall ? "tool_calls" : attempt.yieldDetected ? "end_turn" : sessionLastAssistant?.stopReason;
					attempt.setTerminalLifecycleMeta?.({
						replayInvalid,
						livenessState
					});
					return {
						payloads: payloadsWithToolMedia?.length ? payloadsWithToolMedia : void 0,
						meta: {
							durationMs: Date.now() - started,
							agentMeta,
							aborted,
							systemPromptReport: attempt.systemPromptReport,
							finalPromptText: attempt.finalPromptText,
							finalAssistantVisibleText,
							finalAssistantRawText,
							replayInvalid,
							livenessState,
							stopReason,
							pendingToolCalls: attempt.clientToolCall ? [{
								id: randomBytes(5).toString("hex").slice(0, 9),
								name: attempt.clientToolCall.name,
								arguments: JSON.stringify(attempt.clientToolCall.params)
							}] : void 0,
							executionTrace: {
								winnerProvider: sessionLastAssistant?.provider ?? provider,
								winnerModel: sessionLastAssistant?.model ?? model.id,
								attempts: traceAttempts.length > 0 || sessionLastAssistant?.provider || sessionLastAssistant?.model ? [...traceAttempts, {
									provider: sessionLastAssistant?.provider ?? provider,
									model: sessionLastAssistant?.model ?? model.id,
									result: "success",
									stage: "assistant"
								}] : void 0,
								fallbackUsed: traceAttempts.length > 0,
								runner: "embedded"
							},
							requestShaping: {
								...lastProfileId ? { authMode: "auth-profile" } : {},
								...thinkLevel ? { thinking: thinkLevel } : {},
								...params.reasoningLevel ? { reasoning: params.reasoningLevel } : {},
								...params.verboseLevel ? { verbose: params.verboseLevel } : {},
								...params.blockReplyBreak ? { blockStreaming: params.blockReplyBreak } : {}
							},
							toolSummary: buildTraceToolSummary({
								toolMetas: attempt.toolMetas,
								hadFailure: Boolean(attempt.lastToolError)
							}),
							completion: {
								...stopReason ? { stopReason } : {},
								...stopReason ? { finishReason: stopReason } : {},
								...stopReason?.toLowerCase().includes("refusal") ? { refusal: true } : {}
							},
							contextManagement: autoCompactionCount > 0 ? { lastTurnCompactions: autoCompactionCount } : void 0
						},
						didSendViaMessagingTool: attempt.didSendViaMessagingTool,
						didSendDeterministicApprovalPrompt: attempt.didSendDeterministicApprovalPrompt,
						messagingToolSentTexts: attempt.messagingToolSentTexts,
						messagingToolSentMediaUrls: attempt.messagingToolSentMediaUrls,
						messagingToolSentTargets: attempt.messagingToolSentTargets,
						successfulCronAdds: attempt.successfulCronAdds
					};
				}
			} finally {
				await contextEngine.dispose?.();
				stopRuntimeAuthRefreshTimer();
				if (params.cleanupBundleMcpOnRunEnd === true) await disposeSessionMcpRuntime(params.sessionId).catch((error) => {
					log$3.warn(`bundle-mcp cleanup failed after run for ${params.sessionId}: ${formatErrorMessage(error)}`);
				});
			}
		});
	});
}
//#endregion
export { isLikelyExecutionAckPrompt as a, prepareSessionManagerForRun as i, compactEmbeddedPiSession as n, selectAgentHarness as r, runEmbeddedPiAgent as t };
