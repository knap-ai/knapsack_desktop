import { c as normalizeOptionalString, s as normalizeOptionalLowercaseString } from "./string-coerce-Bje8XVt9.js";
import { t as sanitizeForLog } from "./ansi-Dqm1lzVL.js";
import { i as formatErrorMessage } from "./errors-CDFVCV9D.js";
import { p as resolveUserPath } from "./utils-DvkbxKCZ.js";
import { f as freezeDiagnosticTraceContext } from "./diagnostic-events-B5Jlu4QM.js";
import { i as isCronSessionKey } from "./session-key-utils-naHBWFyS.js";
import { m as resolveSessionAgentIds, r as resolveAgentExecutionContract, t as hasConfiguredModelFallbacks, x as resolveAgentWorkspaceDir } from "./agent-scope-i10se9ty.js";
import { n as DEFAULT_MODEL, r as DEFAULT_PROVIDER, t as DEFAULT_CONTEXT_TOKENS } from "./defaults-CRz26M83.js";
import { r as resolveProviderIdForAuth } from "./provider-auth-aliases-DNk_M8am.js";
import { n as resolveSafeTimeoutDelayMs } from "./timer-delay-CXN8AYgX.js";
import { i as isMarkdownCapableMessageChannel } from "./message-channel-B32dwK-Q.js";
import { n as ensureAuthProfileStore } from "./store-D-8DaAtv.js";
import { t as getGlobalHookRunner } from "./hook-runner-global-_PCECtwt.js";
import { i as resolveContextEngine } from "./registry-C0FSoFN6.js";
import { $ as resolveProviderAuthProfileId, S as prepareProviderRuntimeAuth } from "./provider-runtime-CwkNkui5.js";
import { t as resolveOpenClawAgentDir } from "./agent-paths-Cvhc4iGK.js";
import { n as ensureOpenClawModelsJson } from "./models-config-Bv7OnXdx.js";
import { t as ensureContextEnginesInitialized } from "./init-PgRdwJ6V.js";
import { t as ensureRuntimePluginsLoaded } from "./runtime-plugins-DDnRvEqc.js";
import { d as sanitizeRuntimeProviderRequestOverrides, s as resolveProviderRequestConfig } from "./provider-request-config-R6tp_Cvt.js";
import { n as extractAssistantTextForPhase } from "./chat-message-content-yS6GJLKi.js";
import { n as sleepWithAbort } from "./backoff-BbA8HJTf.js";
import { s as emitAgentPlanEvent } from "./agent-events-1--MOtpo.js";
import { n as derivePromptTokens, o as normalizeUsage } from "./usage-7Pk1eenJ.js";
import { _ as resolveSessionCompactionCheckpointReason, a as readPiModelContextTokens, d as runPostCompactionSideEffects, f as captureCompactionCheckpointSnapshot, g as persistSessionCompactionCheckpoint, i as buildAgentRuntimeAuthPlan, o as asCompactionHookRunner, p as cleanupCompactionCheckpointSnapshot, r as buildAgentRuntimePlan } from "./build-DuvTWnZM.js";
import { i as enqueueCommandInLane } from "./command-queue-O7Nzaeee.js";
import { a as formatContextWindowWarningMessage, i as formatContextWindowBlockMessage, n as CONTEXT_WINDOW_WARN_BELOW_TOKENS, o as resolveContextWindowInfo, r as evaluateContextWindowGuard, t as CONTEXT_WINDOW_HARD_MIN_TOKENS } from "./context-window-guard-BIgyEo4u.js";
import { n as SILENT_REPLY_TOKEN, r as isSilentReplyPayloadText } from "./tokens-D3yEVrkk.js";
import { n as shouldRotateCompactionTranscript, t as rotateTranscriptAfterCompaction } from "./compaction-successor-transcript-CFukhZtt.js";
import { d as isStrictAgenticExecutionContractActive } from "./openclaw-tools-C7Or31if.js";
import { _ as resolveRunLivenessState, b as createEmbeddedRunReplayState, d as resolveEmptyResponseRetryInstruction, f as resolveIncompleteTurnPayloadText, g as resolveReplayInvalidFlag, h as resolveReasoningOnlyRetryInstruction, i as selectAgentHarness, l as resolveAckExecutionFastPathInstruction, m as resolvePlanningOnlyRetryLimit, o as STRICT_AGENTIC_BLOCKED_TEXT, p as resolvePlanningOnlyRetryInstruction, r as runAgentHarnessAttemptWithFallback, s as extractPlanningOnlyPlanDetails, t as maybeCompactAgentHarnessSession, u as resolveAttemptReplayMetadata, v as resolveSilentToolResultReplyPayload, x as observeReplayMetadata, y as shouldTreatEmptyAssistantReplyAsSilent } from "./selection-D9uTvvsw.js";
import { o as normalizeTextForComparison, r as pickFallbackThinkingLevel } from "./pi-embedded-helpers-QjS8cMrW.js";
import { D as formatRawAssistantErrorForUi, l as isRawApiErrorPayload, n as formatBillingErrorMessage, o as getApiErrorPayloadFingerprint, t as BILLING_ERROR_USER_MESSAGE, x as isTimeoutErrorMessage } from "./sanitize-user-facing-text-DgEphtot.js";
import { a as formatAssistantErrorText, b as parseImageSizeError, c as isBillingAssistantError, f as isFailoverAssistantError, h as isRateLimitAssistantError, i as extractObservedOverflowTokenCount, m as isLikelyContextOverflowError, p as isFailoverErrorMessage, s as isAuthAssistantError, t as classifyFailoverReason, u as isCompactionFailureError, y as parseImageDimensionError } from "./errors-CZgkAaRj.js";
import { n as coerceToFailoverError, r as describeFailoverError, s as resolveFailoverStatus, t as FailoverError } from "./failover-error-DQkWPkYr.js";
import "./auth-profiles-BOEvF4Rg.js";
import { a as isProfileInCooldown } from "./usage-state-2s2jxac0.js";
import { n as resolveAuthProfileOrder, t as resolveAuthProfileEligibility } from "./order-Din7_cCm.js";
import { t as markAuthProfileGood } from "./profiles-CrHNjqxk.js";
import { t as redactIdentifier } from "./redact-identifier-B5IHD9B4.js";
import { t as sanitizeForConsole } from "./console-sanitize-C8JXD5Yc.js";
import { a as markAuthProfileUsed, i as markAuthProfileFailure, s as resolveProfilesUnavailableReason } from "./usage-BxJGDEXo.js";
import { n as applyLocalNoAuthHeaderOverride, r as getApiKeyForModel, t as applyAuthHeaderOverride, u as shouldPreferExplicitConfigApiKeyAuth } from "./model-auth-Bic7ggHC.js";
import { t as log } from "./logger-8xw2ZKab.js";
import { c as retireSessionMcpRuntime, l as retireSessionMcpRuntimeForSessionKey } from "./pi-bundle-mcp-runtime-HGvJp58Y.js";
import "./pi-bundle-mcp-tools-Bck95tFX.js";
import { u as parseReplyDirectives } from "./payloads-Br5VEYXq.js";
import { s as hasOutboundReplyContent } from "./reply-payload-Cy4FCQXC.js";
import { x as formatToolAggregate } from "./attempt.tool-run-context-BO5J6jJJ.js";
import { a as shouldAllowCooldownProbeForReason, i as LiveSessionModelSwitchError, o as buildApiErrorObservationFields } from "./model-fallback-Bo9VOdZK.js";
import { n as isLikelyMutatingToolName } from "./tool-mutation-DQgoDbaa.js";
import { i as extractAssistantVisibleText, r as extractAssistantThinking, s as formatReasoningMessage } from "./pi-embedded-utils-BQKVwAP4.js";
import { a as truncateOversizedToolResultsInSession, i as sessionLikelyHasOversizedToolResults, r as resolveLiveToolResultMaxChars } from "./tool-result-truncation-Dgja2yqK.js";
import { i as generateSecureToken } from "./secure-random-BJA7KabS.js";
import { n as resolveGlobalLane, r as resolveSessionLane } from "./lanes-fG_GXmco.js";
import "./runs-CCsjme9h.js";
import "./extra-params-umsBOK3Q.js";
import { t as runContextEngineMaintenance } from "./context-engine-maintenance-Bq7hIoub.js";
import { n as resolveEmbeddedCompactionTarget, t as buildEmbeddedCompactionRuntimeContext } from "./compaction-runtime-context-DKVjVf22.js";
import { n as resolveModelAsync } from "./model-CkUlgtmi.js";
import { a as resolveStoredSessionKeyForSessionId, i as resolveSessionKeyForRequest, n as shouldSwitchToLiveModel, t as clearLiveModelSwitchPending } from "./live-model-switch-Pt5pFOfL.js";
import { n as resolveRunWorkspaceDir, t as redactRunIdentifier } from "./workspace-run-DvKDyJYO.js";
import fs from "node:fs/promises";
import { randomBytes } from "node:crypto";
import { SessionManager } from "@mariozechner/pi-coding-agent";
//#region src/agents/pi-embedded-runner/compact.queued.ts
/**
* Compacts a session with lane queueing (session lane + global lane).
* Use this from outside a lane context. If already inside a lane, use
* `compactEmbeddedPiSessionDirect` to avoid deadlocks.
*/
async function compactEmbeddedPiSession(params) {
	ensureRuntimePluginsLoaded({
		config: params.config,
		workspaceDir: params.workspaceDir,
		allowGatewaySubagentBinding: params.allowGatewaySubagentBinding
	});
	ensureContextEnginesInitialized();
	const contextEngine = await resolveContextEngine(params.config);
	const agentDir = params.agentDir ?? resolveOpenClawAgentDir();
	let contextTokenBudget = params.contextTokenBudget;
	if (!contextTokenBudget || !Number.isFinite(contextTokenBudget) || contextTokenBudget <= 0) {
		const resolvedCompactionTarget = resolveEmbeddedCompactionTarget({
			config: params.config,
			provider: params.provider,
			modelId: params.model,
			authProfileId: params.authProfileId,
			defaultProvider: DEFAULT_PROVIDER,
			defaultModel: DEFAULT_MODEL
		});
		const ceProvider = resolvedCompactionTarget.provider ?? "openai";
		const ceModelId = resolvedCompactionTarget.model ?? "gpt-5.5";
		const { model: ceModel } = await resolveModelAsync(ceProvider, ceModelId, agentDir, params.config);
		const ceRuntimeModel = ceModel;
		contextTokenBudget = resolveContextWindowInfo({
			cfg: params.config,
			provider: ceProvider,
			modelId: ceModelId,
			modelContextTokens: readPiModelContextTokens(ceModel),
			modelContextWindow: ceRuntimeModel?.contextWindow,
			defaultTokens: DEFAULT_CONTEXT_TOKENS
		}).tokens;
	}
	const contextEngineRuntimeContext = buildCompactionContextEngineRuntimeContext({
		params,
		agentDir,
		contextTokenBudget
	});
	const harnessResult = await maybeCompactAgentHarnessSession({
		...params,
		contextEngine,
		contextTokenBudget,
		contextEngineRuntimeContext
	});
	if (harnessResult) {
		await contextEngine.dispose?.();
		return harnessResult;
	}
	const sessionLane = resolveSessionLane(params.sessionKey?.trim() || params.sessionId);
	const globalLane = resolveGlobalLane(params.lane);
	const enqueueGlobal = params.enqueue ?? ((task, opts) => enqueueCommandInLane(globalLane, task, opts));
	return enqueueCommandInLane(sessionLane, () => enqueueGlobal(async () => {
		let checkpointSnapshot = null;
		let checkpointSnapshotRetained = false;
		try {
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
			const runtimeContext = contextEngineRuntimeContext;
			if (hookRunner?.hasHooks?.("before_compaction") && hookRunner.runBeforeCompaction) try {
				await hookRunner.runBeforeCompaction({
					messageCount: -1,
					sessionFile: params.sessionFile
				}, hookCtx);
			} catch (err) {
				log.warn("before_compaction hook failed", { errorMessage: formatErrorMessage(err) });
			}
			const result = await contextEngine.compact({
				sessionId: params.sessionId,
				sessionKey: params.sessionKey,
				sessionFile: params.sessionFile,
				tokenBudget: contextTokenBudget,
				currentTokenCount: params.currentTokenCount,
				compactionTarget: params.trigger === "manual" ? "threshold" : "budget",
				customInstructions: params.customInstructions,
				force: params.trigger === "manual",
				runtimeContext
			});
			const delegatedSessionId = result.result?.sessionId;
			const delegatedSessionFile = result.result?.sessionFile;
			const delegatedRotatedTranscript = typeof delegatedSessionId === "string" && delegatedSessionId !== params.sessionId || typeof delegatedSessionFile === "string" && delegatedSessionFile !== params.sessionFile;
			let postCompactionSessionId = delegatedSessionId ?? params.sessionId;
			let postCompactionSessionFile = delegatedSessionFile ?? params.sessionFile;
			let postCompactionLeafId;
			if (result.ok && result.compacted) {
				if (shouldRotateCompactionTranscript(params.config) && !delegatedRotatedTranscript) try {
					const rotation = await rotateTranscriptAfterCompaction({
						sessionManager: SessionManager.open(params.sessionFile),
						sessionFile: params.sessionFile
					});
					if (rotation.rotated) {
						postCompactionSessionId = rotation.sessionId ?? postCompactionSessionId;
						postCompactionSessionFile = rotation.sessionFile ?? postCompactionSessionFile;
						postCompactionLeafId = rotation.leafId;
						log.info(`[compaction] rotated active transcript after context-engine compaction (sessionKey=${params.sessionKey ?? params.sessionId})`);
					}
				} catch (err) {
					log.warn("failed to rotate compacted transcript", { errorMessage: formatErrorMessage(err) });
				}
				if (params.config && params.sessionKey && checkpointSnapshot) try {
					const postLeafId = postCompactionLeafId ?? SessionManager.open(postCompactionSessionFile).getLeafId() ?? void 0;
					checkpointSnapshotRetained = await persistSessionCompactionCheckpoint({
						cfg: params.config,
						sessionKey: params.sessionKey,
						sessionId: postCompactionSessionId,
						reason: resolveSessionCompactionCheckpointReason({ trigger: params.trigger }),
						snapshot: checkpointSnapshot,
						summary: result.result?.summary,
						firstKeptEntryId: result.result?.firstKeptEntryId,
						tokensBefore: result.result?.tokensBefore,
						tokensAfter: result.result?.tokensAfter,
						postSessionFile: postCompactionSessionFile,
						postLeafId,
						postEntryId: postLeafId
					}) !== null;
				} catch (err) {
					log.warn("failed to persist compaction checkpoint", { errorMessage: formatErrorMessage(err) });
				}
				await runContextEngineMaintenance({
					contextEngine,
					sessionId: postCompactionSessionId,
					sessionKey: params.sessionKey,
					sessionFile: postCompactionSessionFile,
					reason: "compaction",
					runtimeContext
				});
			}
			if (engineOwnsCompaction && result.ok && result.compacted) await runPostCompactionSideEffects({
				config: params.config,
				sessionKey: params.sessionKey,
				sessionFile: postCompactionSessionFile
			});
			if (result.ok && result.compacted && hookRunner?.hasHooks?.("after_compaction") && hookRunner.runAfterCompaction) try {
				const afterHookCtx = {
					...hookCtx,
					sessionId: postCompactionSessionId
				};
				await hookRunner.runAfterCompaction({
					messageCount: -1,
					compactedCount: -1,
					tokenCount: result.result?.tokensAfter,
					sessionFile: postCompactionSessionFile
				}, afterHookCtx);
			} catch (err) {
				log.warn("after_compaction hook failed", { errorMessage: formatErrorMessage(err) });
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
					details: result.result.details,
					...postCompactionSessionId !== params.sessionId ? { sessionId: postCompactionSessionId } : {},
					...postCompactionSessionFile !== params.sessionFile ? { sessionFile: postCompactionSessionFile } : {}
				} : void 0
			};
		} finally {
			if (!checkpointSnapshotRetained) await cleanupCompactionCheckpointSnapshot(checkpointSnapshot);
			await contextEngine.dispose?.();
		}
	}));
}
function buildCompactionContextEngineRuntimeContext(params) {
	return {
		...params.params,
		...buildEmbeddedCompactionRuntimeContext({
			sessionKey: params.params.sessionKey,
			messageChannel: params.params.messageChannel,
			messageProvider: params.params.messageProvider,
			agentAccountId: params.params.agentAccountId,
			currentChannelId: params.params.currentChannelId,
			currentThreadTs: params.params.currentThreadTs,
			currentMessageId: params.params.currentMessageId,
			authProfileId: params.params.authProfileId,
			workspaceDir: params.params.workspaceDir,
			agentDir: params.agentDir,
			config: params.params.config,
			skillsSnapshot: params.params.skillsSnapshot,
			senderIsOwner: params.params.senderIsOwner,
			senderId: params.params.senderId,
			provider: params.params.provider,
			modelId: params.params.model,
			thinkLevel: params.params.thinkLevel,
			reasoningLevel: params.params.reasoningLevel,
			bashElevated: params.params.bashElevated,
			extraSystemPrompt: params.params.extraSystemPrompt,
			ownerNumbers: params.params.ownerNumbers
		}),
		tokenBudget: params.contextTokenBudget,
		currentTokenCount: params.params.currentTokenCount
	};
}
//#endregion
//#region src/agents/tool-error-summary.ts
const EXEC_LIKE_TOOL_NAMES = new Set(["exec", "bash"]);
function isExecLikeToolName(toolName) {
	return EXEC_LIKE_TOOL_NAMES.has(normalizeOptionalLowercaseString(toolName) ?? "");
}
//#endregion
//#region src/agents/pi-embedded-runner/failure-signal.ts
const FAILURE_SIGNAL_CODES = ["SYSTEM_RUN_DENIED", "INVALID_REQUEST"];
function resolveFailureSignalCode(message) {
	for (const code of FAILURE_SIGNAL_CODES) if (message.includes(code)) return code;
	if (message.toLowerCase().includes("approval cannot safely bind")) return "SYSTEM_RUN_DENIED";
}
function resolveEmbeddedRunFailureSignal(params) {
	if (params.trigger !== "cron") return;
	const lastToolError = params.lastToolError;
	if (!lastToolError || !isExecLikeToolName(lastToolError.toolName)) return;
	const message = normalizeOptionalString(lastToolError.error);
	if (!message) return;
	const code = resolveFailureSignalCode(message);
	if (!code) return;
	return {
		kind: "execution_denied",
		source: "tool",
		...lastToolError.toolName ? { toolName: lastToolError.toolName } : {},
		code,
		message,
		fatalForCron: true
	};
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
						status,
						rawError: params.lastAssistant?.errorMessage?.trim()
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
		const message = resolveAssistantFailoverErrorMessage(params);
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
				status,
				rawError: params.lastAssistant?.errorMessage?.trim()
			})
		};
	}
	if (decision.action === "surface_error") {
		if (!params.externalAbort && params.idleTimedOut && params.allowSameModelIdleTimeoutRetry) return sameModelIdleTimeoutRetry();
		params.logAssistantFailoverDecision("surface_error");
		if (!params.externalAbort && !params.timedOut) {
			const message = resolveAssistantFailoverErrorMessage(params);
			const reason = resolveSurfaceErrorReason(decision.reason, params);
			const status = resolveFailoverStatus(reason) ?? (isTimeoutErrorMessage(message) ? 408 : void 0);
			return {
				action: "throw",
				overloadProfileRotations,
				error: new FailoverError(message, {
					reason,
					provider: params.activeErrorContext.provider,
					model: params.activeErrorContext.model,
					profileId: params.lastProfileId,
					status,
					rawError: params.lastAssistant?.errorMessage?.trim()
				})
			};
		}
	}
	return {
		action: "continue_normal",
		overloadProfileRotations
	};
}
function resolveAssistantFailoverErrorMessage(params) {
	return (params.lastAssistant ? formatAssistantErrorText(params.lastAssistant, {
		cfg: params.config,
		sessionKey: params.sessionKey,
		provider: params.activeErrorContext.provider,
		model: params.activeErrorContext.model
	}) : void 0) || params.lastAssistant?.errorMessage?.trim() || (params.timedOut ? "LLM request timed out." : params.rateLimitFailure ? "LLM request rate limited." : params.billingFailure ? formatBillingErrorMessage(params.activeErrorContext.provider, params.activeErrorContext.model) : params.authFailure ? "LLM request unauthorized." : "LLM request failed.");
}
function resolveSurfaceErrorReason(declared, params) {
	if (declared) return declared;
	if (params.billingFailure) return "billing";
	if (params.authFailure) return "auth";
	if (params.rateLimitFailure) return "rate_limit";
	return "unknown";
}
//#endregion
//#region src/agents/runtime-auth-refresh.ts
function clampRuntimeAuthRefreshDelayMs(params) {
	return resolveSafeTimeoutDelayMs(params.refreshAt - params.now, { minMs: params.minDelayMs });
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
		...params.contextTokens ? { contextTokens: params.contextTokens } : {},
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
	const prepareRuntimeAuthForModel = async (prepareParams) => prepareProviderRuntimeAuth({
		provider: prepareParams.runtimeModel.provider,
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: process.env,
		context: {
			config: params.config,
			agentDir: params.agentDir,
			workspaceDir: params.workspaceDir,
			env: process.env,
			provider: prepareParams.runtimeModel.provider,
			modelId: params.getModelId(),
			model: prepareParams.runtimeModel,
			apiKey: prepareParams.apiKey,
			authMode: prepareParams.authMode,
			profileId: prepareParams.profileId
		}
	});
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
			const preparedAuth = await prepareRuntimeAuthForModel({
				runtimeModel,
				apiKey: sourceApiKey,
				authMode: currentRuntimeAuthState?.authMode ?? "unknown",
				profileId: currentRuntimeAuthState?.profileId
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
			const runtimeModel = params.getRuntimeModel();
			const AWS_SDK_AUTH_SENTINEL = "__aws_sdk_auth__";
			try {
				const preparedAuth = await prepareRuntimeAuthForModel({
					runtimeModel,
					apiKey: AWS_SDK_AUTH_SENTINEL,
					authMode: apiKeyInfo.mode,
					profileId: apiKeyInfo.profileId
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
						sourceApiKey: AWS_SDK_AUTH_SENTINEL,
						authMode: apiKeyInfo.mode,
						profileId: resolvedProfileId,
						expiresAt: preparedAuth.expiresAt
					});
					if (preparedAuth.expiresAt) scheduleRuntimeAuthRefresh();
					params.setLastProfileId(resolvedProfileId);
					return;
				}
			} catch (error) {
				params.log.warn(`prepareProviderRuntimeAuth failed for ${runtimeModel.provider}, falling back to sentinel: ${formatErrorMessage(error)}`);
			}
			clearRuntimeAuthRefreshTimer();
			params.authStorage.setRuntimeApiKey(runtimeModel.provider, AWS_SDK_AUTH_SENTINEL);
			params.setRuntimeAuthState(null);
			params.setLastProfileId(resolvedProfileId);
			return;
		}
		let runtimeAuthHandled = false;
		const runtimeModel = params.getRuntimeModel();
		const preparedAuth = await prepareRuntimeAuthForModel({
			runtimeModel,
			apiKey: apiKeyInfo.apiKey,
			authMode: apiKeyInfo.mode,
			profileId: apiKeyInfo.profileId
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
//#region src/agents/pi-embedded-runner/run/auth-profile-failure-policy.ts
function resolveAuthProfileFailureReason(params) {
	if (params.policy === "local" || !params.failoverReason || params.failoverReason === "timeout") return null;
	return params.failoverReason;
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
		const safeRawErrorPreview = sanitizeForConsole(observedError.rawErrorPreview);
		const shouldSuppressRawErrorConsoleSuffix = observedError.providerRuntimeFailureKind === "auth_html_403" || observedError.providerRuntimeFailureKind === "auth_scope" || observedError.providerRuntimeFailureKind === "auth_refresh";
		const rawErrorConsoleSuffix = safeRawErrorPreview && !shouldSuppressRawErrorConsoleSuffix ? ` rawError=${safeRawErrorPreview}` : "";
		log.warn("embedded run failover decision", {
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
			consoleMessage: `embedded run failover decision: runId=${safeRunId} stage=${normalizedBase.stage} decision=${decision} reason=${reasonText} from=${safeSourceProvider}/${safeSourceModel}${sourceChanged ? ` to=${safeProvider}/${safeModel}` : ""} profile=${profileText}${rawErrorConsoleSuffix}`
		});
	};
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
const MUTATING_FAILURE_ACTION_PATTERN = "(?:write|edit|update|save|create|delete|remove|modify|change|apply|patch|move|rename|send|reply|message|tool|action|operation)";
const MUTATING_FAILURE_INABILITY_PATTERN = new RegExp(`\\b(?:couldn't|could not|can't|cannot|unable to|am unable to|wasn't able to|was not able to|were unable to)\\b.{0,100}\\b${MUTATING_FAILURE_ACTION_PATTERN}\\b`, "u");
const MUTATING_FAILURE_ACTION_THEN_FAILURE_PATTERN = new RegExp(`\\b${MUTATING_FAILURE_ACTION_PATTERN}\\b.{0,100}\\b(?:failed|failure|errored)\\b`, "u");
const MUTATING_FAILURE_FAILURE_THEN_ACTION_PATTERN = new RegExp(`\\b(?:failed|failure)\\b.{0,100}\\b${MUTATING_FAILURE_ACTION_PATTERN}\\b`, "u");
const MUTATING_FAILURE_ERROR_WHILE_ACTION_PATTERN = new RegExp(`\\b(?:hit|encountered|ran into)\\b.{0,60}\\berror\\b.{0,100}\\b(?:while|trying to|when)\\b.{0,100}\\b${MUTATING_FAILURE_ACTION_PATTERN}\\b`, "u");
const DID_NOT_FAIL_PATTERN = /\b(?:did not|didn't)\s+fail\b/u;
const NEGATED_FAILURE_PATTERN = /\b(?:no|not|without)\s+(?:failures?|errors?)\b/u;
function isRecoverableToolError(error) {
	const errorLower = normalizeOptionalLowercaseString(error) ?? "";
	return RECOVERABLE_TOOL_ERROR_KEYWORDS.some((keyword) => errorLower.includes(keyword));
}
function hasExplicitMutatingToolFailureAcknowledgement(text) {
	const normalizedText = normalizeTextForComparison(text);
	if (!normalizedText) return false;
	if (DID_NOT_FAIL_PATTERN.test(normalizedText)) return false;
	if (MUTATING_FAILURE_INABILITY_PATTERN.test(normalizedText)) return true;
	if (NEGATED_FAILURE_PATTERN.test(normalizedText)) return false;
	return MUTATING_FAILURE_ACTION_THEN_FAILURE_PATTERN.test(normalizedText) || MUTATING_FAILURE_FAILURE_THEN_ACTION_PATTERN.test(normalizedText) || MUTATING_FAILURE_ERROR_WHILE_ACTION_PATTERN.test(normalizedText);
}
function isVerboseToolDetailEnabled(level) {
	return level === "on" || level === "full";
}
function resolveRawAssistantAnswerText(lastAssistant) {
	if (!lastAssistant) return "";
	return normalizeOptionalString(extractAssistantTextForPhase(lastAssistant, { phase: "final_answer" }) ?? extractAssistantTextForPhase(lastAssistant)) ?? "";
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
		showWarning: !params.hasUserFacingFailureAcknowledgement,
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
	const reasoningText = suppressAssistantArtifacts ? "" : params.lastAssistant && params.reasoningLevel === "on" && params.thinkingLevel !== "off" ? formatReasoningMessage(extractAssistantThinking(params.lastAssistant)) : "";
	if (reasoningText) replyItems.push({
		text: reasoningText,
		isReasoning: true
	});
	const fallbackAnswerText = params.lastAssistant ? extractAssistantVisibleText(params.lastAssistant) : "";
	const fallbackRawAnswerText = resolveRawAssistantAnswerText(params.lastAssistant);
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
	const rawAnswerDirectiveState = fallbackRawAnswerText ? parseReplyDirectives(fallbackRawAnswerText) : null;
	const rawAnswerHasMedia = (rawAnswerDirectiveState?.mediaUrls?.length ?? 0) > 0 || rawAnswerDirectiveState?.audioAsVoice;
	const assistantTextsHaveMedia = params.assistantTexts.some((text) => {
		const parsed = parseReplyDirectives(text);
		return (parsed.mediaUrls?.length ?? 0) > 0 || parsed.audioAsVoice;
	});
	const nonEmptyAssistantTexts = params.assistantTexts.filter((text) => text.trim().length > 0);
	const normalizedAssistantTexts = normalizeTextForComparison(nonEmptyAssistantTexts.join("\n\n"));
	const normalizedRawAnswerText = normalizeTextForComparison(rawAnswerDirectiveState?.text ?? "");
	const shouldPreferRawAnswerText = rawAnswerHasMedia && (!nonEmptyAssistantTexts.length || !assistantTextsHaveMedia && normalizedAssistantTexts.length > 0 && normalizedAssistantTexts === normalizedRawAnswerText);
	const hasAssistantTextPayload = nonEmptyAssistantTexts.length > 0;
	const answerTexts = suppressAssistantArtifacts ? [] : (shouldPreferRawAnswerText && fallbackRawAnswerText ? [fallbackRawAnswerText] : hasAssistantTextPayload ? nonEmptyAssistantTexts : fallbackAnswerText ? [fallbackAnswerText] : []).filter((text) => !shouldSuppressRawErrorText(text));
	let hasUserFacingAssistantReply = false;
	let hasUserFacingFailureAcknowledgement = false;
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
		if (cleanedText && hasExplicitMutatingToolFailureAcknowledgement(cleanedText)) hasUserFacingFailureAcknowledgement = true;
	}
	if (params.lastToolError) {
		const warningPolicy = resolveToolErrorWarningPolicy({
			lastToolError: params.lastToolError,
			hasUserFacingReply: hasUserFacingAssistantReply,
			hasUserFacingFailureAcknowledgement,
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
	return replyItems.map((item) => {
		const payload = {
			text: normalizeOptionalString(item.text),
			mediaUrls: item.media?.length ? item.media : void 0,
			mediaUrl: item.media?.[0],
			isError: item.isError,
			replyToId: item.replyToId,
			replyToTag: item.replyToTag,
			replyToCurrent: item.replyToCurrent,
			audioAsVoice: item.audioAsVoice || Boolean(hasAudioAsVoiceTag && item.media?.length)
		};
		if (payload.text && isSilentReplyPayloadText(payload.text, "NO_REPLY")) {
			const silentText = payload.text;
			payload.text = void 0;
			if (hasOutboundReplyContent(payload)) return payload;
			payload.text = silentText;
		}
		return payload;
	}).filter((p) => {
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
		const event = params.attachments ? {
			prompt: params.prompt,
			attachments: params.attachments
		} : { prompt: params.prompt };
		modelResolveOverride = await hookRunner.runBeforeModelResolve(event, params.hookContext);
	} catch (hookErr) {
		log.warn(`before_model_resolve hook failed: ${String(hookErr)}`);
	}
	if (hookRunner?.hasHooks("before_agent_start")) try {
		legacyBeforeAgentStartResult = await hookRunner.runBeforeAgentStart({ prompt: params.prompt }, params.hookContext);
		modelResolveOverride = {
			providerOverride: modelResolveOverride?.providerOverride ?? legacyBeforeAgentStartResult?.providerOverride,
			modelOverride: modelResolveOverride?.modelOverride ?? legacyBeforeAgentStartResult?.modelOverride
		};
	} catch (hookErr) {
		log.warn(`before_agent_start hook (legacy model resolve path) failed: ${String(hookErr)}`);
	}
	if (modelResolveOverride?.providerOverride) {
		provider = modelResolveOverride.providerOverride;
		log.info(`[hooks] provider overridden to ${provider}`);
	}
	if (modelResolveOverride?.modelOverride) {
		modelId = modelResolveOverride.modelOverride;
		log.info(`[hooks] model overridden to ${modelId}`);
	}
	return {
		provider,
		modelId,
		legacyBeforeAgentStartResult
	};
}
function buildBeforeModelResolveAttachments(images) {
	if (!images?.length) return;
	return images.map((img) => ({
		kind: "image",
		mimeType: img.mimeType
	}));
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
	if (ctxGuard.shouldWarn) log.warn(formatContextWindowWarningMessage({
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
		log.error(`blocked model (context window too small): ${params.provider}/${params.modelId} ctx=${ctxGuard.tokens} (min=${CONTEXT_WINDOW_HARD_MIN_TOKENS}) source=${ctxGuard.source}; ${message}`);
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
function normalizeEmbeddedRunAttemptResult(attempt) {
	const raw = attempt;
	return {
		...attempt,
		assistantTexts: raw.assistantTexts ?? [],
		toolMetas: raw.toolMetas ?? [],
		messagesSnapshot: raw.messagesSnapshot ?? [],
		messagingToolSentTexts: raw.messagingToolSentTexts ?? [],
		messagingToolSentMediaUrls: raw.messagingToolSentMediaUrls ?? [],
		messagingToolSentTargets: raw.messagingToolSentTargets ?? [],
		itemLifecycle: raw.itemLifecycle ?? {
			startedCount: 0,
			completedCount: 0,
			activeCount: 0
		},
		replayMetadata: resolveAttemptReplayMetadata(raw)
	};
}
function createEmptyAuthProfileStore() {
	return {
		version: 1,
		profiles: {}
	};
}
function buildTraceToolSummary(params) {
	if (!params.toolMetas?.length) return;
	const tools = [];
	const seen = /* @__PURE__ */ new Set();
	for (const entry of params.toolMetas) {
		const toolName = normalizeOptionalString(entry.toolName);
		if (!toolName || seen.has(toolName)) continue;
		seen.add(toolName);
		tools.push(toolName);
	}
	return {
		calls: params.toolMetas?.length ?? 0,
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
		log.warn(`[backfillSessionKey] Failed to resolve sessionKey for sessionId=${redactRunIdentifier(sanitizeForLog(params.sessionId))}: ${formatErrorMessage(err)}`);
		return;
	}
}
function buildHandledReplyPayloads(reply) {
	const normalized = reply ?? { text: "NO_REPLY" };
	return [{
		text: normalized.text,
		mediaUrl: normalized.mediaUrl,
		mediaUrls: normalized.mediaUrls,
		replyToId: normalized.replyToId,
		audioAsVoice: normalized.audioAsVoice,
		isError: normalized.isError,
		isReasoning: normalized.isReasoning
	}];
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
			params.onExecutionStarted?.();
			const workspaceResolution = resolveRunWorkspaceDir({
				workspaceDir: params.workspaceDir,
				sessionKey: params.sessionKey,
				agentId: params.agentId,
				config: params.config
			});
			const resolvedWorkspace = workspaceResolution.workspaceDir;
			const isCanonicalWorkspace = resolveUserPath(resolveAgentWorkspaceDir(params.config ?? {}, workspaceResolution.agentId)) === resolvedWorkspace;
			const redactedSessionId = redactRunIdentifier(params.sessionId);
			const redactedSessionKey = redactRunIdentifier(params.sessionKey);
			const redactedWorkspace = redactRunIdentifier(resolvedWorkspace);
			if (workspaceResolution.usedFallback) log.warn(`[workspace-fallback] caller=runEmbeddedPiAgent reason=${workspaceResolution.fallbackReason} run=${params.runId} session=${redactedSessionId} sessionKey=${redactedSessionKey} agent=${workspaceResolution.agentId} workspace=${redactedWorkspace}`);
			ensureRuntimePluginsLoaded({
				config: params.config,
				workspaceDir: resolvedWorkspace,
				allowGatewaySubagentBinding: params.allowGatewaySubagentBinding
			});
			let provider = (params.provider ?? "openai").trim() || "openai";
			let modelId = (params.model ?? "gpt-5.5").trim() || "gpt-5.5";
			const agentDir = params.agentDir ?? resolveOpenClawAgentDir();
			const normalizedSessionKey = params.sessionKey?.trim();
			const fallbackConfigured = hasConfiguredModelFallbacks({
				cfg: params.config,
				agentId: params.agentId,
				sessionKey: normalizedSessionKey
			});
			const resolvedSessionKey = normalizedSessionKey;
			const hookRunner = getGlobalHookRunner();
			const hookCtx = {
				runId: params.runId,
				jobId: params.jobId,
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
			if (params.trigger === "cron" && hookRunner?.hasHooks("before_agent_reply")) {
				const hookResult = await hookRunner.runBeforeAgentReply({ cleanedBody: params.prompt }, hookCtx);
				if (hookResult?.handled) return {
					payloads: buildHandledReplyPayloads(hookResult.reply),
					meta: {
						durationMs: Date.now() - started,
						agentMeta: {
							sessionId: params.sessionId,
							provider,
							model: modelId
						},
						finalAssistantVisibleText: hookResult.reply?.text ?? "NO_REPLY",
						finalAssistantRawText: hookResult.reply?.text ?? "NO_REPLY"
					}
				};
			}
			const hookSelection = await resolveHookModelSelection({
				prompt: params.prompt,
				attachments: buildBeforeModelResolveAttachments(params.images),
				provider,
				modelId,
				hookRunner,
				hookContext: hookCtx
			});
			provider = hookSelection.provider;
			modelId = hookSelection.modelId;
			const legacyBeforeAgentStartResult = hookSelection.legacyBeforeAgentStartResult;
			const agentHarness = selectAgentHarness({
				provider,
				modelId,
				config: params.config,
				agentId: params.agentId,
				sessionKey: params.sessionKey,
				agentHarnessId: params.agentHarnessId
			});
			const pluginHarnessOwnsTransport = agentHarness.id !== "pi";
			const dynamicModelResolution = await resolveModelAsync(provider, modelId, agentDir, params.config, { skipPiDiscovery: true });
			const { model, error, authStorage, modelRegistry } = dynamicModelResolution.model || pluginHarnessOwnsTransport ? dynamicModelResolution : await (async () => {
				await ensureOpenClawModelsJson(params.config, agentDir);
				return await resolveModelAsync(provider, modelId, agentDir, params.config);
			})();
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
			const authStore = pluginHarnessOwnsTransport ? createEmptyAuthProfileStore() : ensureAuthProfileStore(agentDir, { allowKeychainPrompt: false });
			const preferredProfileId = params.authProfileId?.trim();
			let lockedProfileId = params.authProfileIdSource === "user" ? preferredProfileId : void 0;
			if (lockedProfileId) if (pluginHarnessOwnsTransport) {
				if (!buildAgentRuntimeAuthPlan({
					provider,
					authProfileProvider: lockedProfileId.split(":", 1)[0],
					sessionAuthProfileId: lockedProfileId,
					config: params.config,
					workspaceDir: resolvedWorkspace,
					harnessId: agentHarness.id
				}).forwardedAuthProfileId) lockedProfileId = void 0;
			} else {
				const lockedProfile = authStore.profiles[lockedProfileId];
				const lockedProfileProvider = lockedProfile ? resolveProviderIdForAuth(lockedProfile.provider, {
					config: params.config,
					workspaceDir: resolvedWorkspace
				}) : void 0;
				const runProvider = resolveProviderIdForAuth(provider, {
					config: params.config,
					workspaceDir: resolvedWorkspace
				});
				if (!lockedProfile || !lockedProfileProvider || lockedProfileProvider !== runProvider) lockedProfileId = void 0;
			}
			if (lockedProfileId && !pluginHarnessOwnsTransport) {
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
			const providerPreferredProfileId = lockedProfileId ? void 0 : resolveProviderAuthProfileId({
				provider,
				config: params.config,
				workspaceDir: resolvedWorkspace,
				context: {
					config: params.config,
					agentDir,
					workspaceDir: resolvedWorkspace,
					provider,
					modelId,
					preferredProfileId,
					lockedProfileId,
					profileOrder,
					authStore
				}
			});
			const providerOrderedProfiles = providerPreferredProfileId && profileOrder.includes(providerPreferredProfileId) ? [providerPreferredProfileId, ...profileOrder.filter((profileId) => profileId !== providerPreferredProfileId)] : profileOrder;
			const profileCandidates = lockedProfileId ? [lockedProfileId] : providerOrderedProfiles.length > 0 ? providerOrderedProfiles : [void 0];
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
				log
			});
			if (!pluginHarnessOwnsTransport) await initializeAuthProfile();
			else if (lockedProfileId) lastProfileId = lockedProfileId;
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
			let lastCompactionTokensAfter;
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
			const MAX_EMPTY_ERROR_RETRIES = 3;
			let emptyErrorRetries = 0;
			const overloadFailoverBackoffMs = resolveOverloadFailoverBackoffMs(params.config);
			const overloadProfileRotationLimit = resolveOverloadProfileRotationLimit(params.config);
			const rateLimitProfileRotationLimit = resolveRateLimitProfileRotationLimit(params.config);
			const maybeEscalateRateLimitProfileFallback = (params) => {
				rateLimitProfileRotations += 1;
				if (rateLimitProfileRotations <= rateLimitProfileRotationLimit || !fallbackConfigured) return;
				const status = resolveFailoverStatus("rate_limit");
				log.warn(`rate-limit profile rotation cap reached for ${sanitizeForLog(provider)}/${sanitizeForLog(modelId)} after ${rateLimitProfileRotations} rotations; escalating to model fallback`);
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
			const resolveRunAuthProfileFailureReason = (failoverReason) => resolveAuthProfileFailureReason({
				failoverReason,
				policy: params.authProfileFailurePolicy
			});
			const maybeBackoffBeforeOverloadFailover = async (reason) => {
				if (reason !== "overloaded" || overloadFailoverBackoffMs <= 0) return;
				log.warn(`overload backoff before failover for ${provider}/${modelId}: delayMs=${overloadFailoverBackoffMs}`);
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
				let activeSessionId = params.sessionId;
				let activeSessionFile = params.sessionFile;
				const resolveActiveHookContext = () => ({
					...hookCtx,
					sessionId: activeSessionId
				});
				const adoptCompactionTranscript = (compactResult) => {
					const nextSessionId = compactResult.result?.sessionId;
					const nextSessionFile = compactResult.result?.sessionFile;
					if (nextSessionId && nextSessionId !== activeSessionId) activeSessionId = nextSessionId;
					if (nextSessionFile && nextSessionFile !== activeSessionFile) activeSessionFile = nextSessionFile;
				};
				const runOwnsCompactionBeforeHook = async (reason) => {
					if (contextEngine.info.ownsCompaction !== true || !hookRunner?.hasHooks("before_compaction")) return;
					try {
						await hookRunner.runBeforeCompaction({
							messageCount: -1,
							sessionFile: activeSessionFile
						}, resolveActiveHookContext());
					} catch (hookErr) {
						log.warn(`before_compaction hook failed during ${reason}: ${String(hookErr)}`);
					}
				};
				const runOwnsCompactionAfterHook = async (reason, compactResult) => {
					if (contextEngine.info.ownsCompaction !== true || !compactResult.ok || !compactResult.compacted || !hookRunner?.hasHooks("after_compaction")) return;
					try {
						await hookRunner.runAfterCompaction({
							messageCount: -1,
							compactedCount: -1,
							tokenCount: compactResult.result?.tokensAfter,
							sessionFile: compactResult.result?.sessionFile ?? activeSessionFile
						}, resolveActiveHookContext());
					} catch (hookErr) {
						log.warn(`after_compaction hook failed during ${reason}: ${String(hookErr)}`);
					}
				};
				let authRetryPending = false;
				let accumulatedReplayState = createEmbeddedRunReplayState();
				let lastTurnTotal;
				while (true) {
					if (runLoopIterations >= MAX_RUN_LOOP_ITERATIONS) {
						const message = `Exceeded retry limit after ${runLoopIterations} attempts (max=${MAX_RUN_LOOP_ITERATIONS}).`;
						log.error(`[run-retry-limit] sessionKey=${params.sessionKey ?? params.sessionId} provider=${provider}/${modelId} attempts=${runLoopIterations} maxAttempts=${MAX_RUN_LOOP_ITERATIONS}`);
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
								sessionId: activeSessionId,
								provider,
								model: model.id,
								contextTokens: ctxInfo.tokens,
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
					await fs.mkdir(resolvedWorkspace, { recursive: true });
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
					const runtimePlan = buildAgentRuntimePlan({
						provider,
						modelId,
						model: effectiveModel,
						modelApi: effectiveModel.api,
						harnessId: agentHarness.id,
						harnessRuntime: agentHarness.id,
						allowHarnessAuthProfileForwarding: pluginHarnessOwnsTransport,
						authProfileProvider: lastProfileId?.split(":", 1)[0],
						sessionAuthProfileId: lastProfileId,
						config: params.config,
						workspaceDir: resolvedWorkspace,
						agentDir,
						agentId: workspaceResolution.agentId,
						thinkingLevel: thinkLevel,
						extraParamsOverride: {
							...params.streamParams,
							fastMode: params.fastMode
						}
					});
					const attempt = normalizeEmbeddedRunAttemptResult(await runEmbeddedAttemptWithBackend({
						sessionId: activeSessionId,
						sessionKey: resolvedSessionKey,
						sandboxSessionKey: params.sandboxSessionKey,
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
						memberRoleIds: params.memberRoleIds,
						spawnedBy: params.spawnedBy,
						isCanonicalWorkspace,
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
						sessionFile: activeSessionFile,
						workspaceDir: resolvedWorkspace,
						agentDir,
						config: params.config,
						allowGatewaySubagentBinding: params.allowGatewaySubagentBinding,
						contextEngine,
						contextTokenBudget: ctxInfo.tokens,
						skillsSnapshot: params.skillsSnapshot,
						prompt,
						transcriptPrompt: params.transcriptPrompt,
						images: params.images,
						imageOrder: params.imageOrder,
						clientTools: params.clientTools,
						disableTools: params.disableTools,
						provider,
						modelId,
						agentHarnessId: agentHarness.id,
						runtimePlan,
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
						forceMessageTool: params.forceMessageTool,
						requireExplicitMessageTarget: params.requireExplicitMessageTarget,
						internalEvents: params.internalEvents,
						bootstrapPromptWarningSignaturesSeen,
						bootstrapPromptWarningSignature: bootstrapPromptWarningSignaturesSeen[bootstrapPromptWarningSignaturesSeen.length - 1]
					}));
					const { aborted, externalAbort, promptError, promptErrorSource, preflightRecovery, timedOut, idleTimedOut, timedOutDuringCompaction, sessionIdUsed, sessionFileUsed, lastAssistant: sessionLastAssistant, currentAttemptAssistant } = attempt;
					if (sessionIdUsed && sessionIdUsed !== activeSessionId) activeSessionId = sessionIdUsed;
					if (sessionFileUsed && sessionFileUsed !== activeSessionFile) activeSessionFile = sessionFileUsed;
					bootstrapPromptWarningSignaturesSeen = attempt.bootstrapPromptWarningSignaturesSeen ?? (attempt.bootstrapPromptWarningSignature ? Array.from(new Set([...bootstrapPromptWarningSignaturesSeen, attempt.bootstrapPromptWarningSignature])) : bootstrapPromptWarningSignaturesSeen);
					const lastAssistantUsage = normalizeUsage(sessionLastAssistant?.usage);
					const attemptUsage = attempt.attemptUsage ?? lastAssistantUsage;
					mergeUsageIntoAccumulator(usageAccumulator, attemptUsage);
					lastRunPromptUsage = lastAssistantUsage ?? attemptUsage;
					lastTurnTotal = lastAssistantUsage?.total ?? attemptUsage?.total;
					const attemptCompactionCount = Math.max(0, attempt.compactionCount ?? 0);
					autoCompactionCount += attemptCompactionCount;
					if (typeof attempt.compactionTokensAfter === "number" && Number.isFinite(attempt.compactionTokensAfter) && attempt.compactionTokensAfter > 0) lastCompactionTokensAfter = Math.floor(attempt.compactionTokensAfter);
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
					const canRestartForLiveSwitch = !attempt.didSendViaMessagingTool && !attempt.didSendDeterministicApprovalPrompt && !attempt.lastToolError && (attempt.toolMetas?.length ?? 0) === 0 && (attempt.assistantTexts?.length ?? 0) === 0;
					if (preflightRecovery?.handled) {
						log.info(`[context-overflow-precheck] early recovery route=${preflightRecovery.route} completed for ${provider}/${modelId}; retrying prompt`);
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
						log.info(`live session model switch requested during active attempt for ${params.sessionId}: ${provider}/${modelId} -> ${requestedSelection.provider}/${requestedSelection.model}`);
						throw new LiveSessionModelSwitchError(requestedSelection);
					}
					if (timedOut && !timedOutDuringCompaction) {
						const lastTurnPromptTokens = derivePromptTokens(lastRunPromptUsage);
						const tokenUsedRatio = lastTurnPromptTokens != null && ctxInfo.tokens > 0 ? lastTurnPromptTokens / ctxInfo.tokens : 0;
						if (timeoutCompactionAttempts >= MAX_TIMEOUT_COMPACTION_ATTEMPTS) log.warn(`[timeout-compaction] already attempted timeout compaction ${timeoutCompactionAttempts} time(s); falling through to failover rotation`);
						else if (tokenUsedRatio > .65) {
							const timeoutDiagId = createCompactionDiagId();
							timeoutCompactionAttempts++;
							log.warn(`[timeout-compaction] LLM timed out with high prompt token usage (${Math.round(tokenUsedRatio * 100)}%); attempting compaction before retry (attempt ${timeoutCompactionAttempts}/${MAX_TIMEOUT_COMPACTION_ATTEMPTS}) diagId=${timeoutDiagId}`);
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
									sessionId: activeSessionId,
									sessionKey: params.sessionKey,
									sessionFile: activeSessionFile,
									tokenBudget: ctxInfo.tokens,
									force: true,
									compactionTarget: "budget",
									runtimeContext: timeoutCompactionRuntimeContext
								});
							} catch (compactErr) {
								log.warn(`[timeout-compaction] contextEngine.compact() threw during timeout recovery for ${provider}/${modelId}: ${String(compactErr)}`);
								timeoutCompactResult = {
									ok: false,
									compacted: false,
									reason: String(compactErr)
								};
							}
							if (timeoutCompactResult.compacted) adoptCompactionTranscript(timeoutCompactResult);
							await runOwnsCompactionAfterHook("timeout recovery", timeoutCompactResult);
							if (timeoutCompactResult.compacted) {
								autoCompactionCount += 1;
								if (typeof timeoutCompactResult.result?.tokensAfter === "number" && Number.isFinite(timeoutCompactResult.result.tokensAfter) && timeoutCompactResult.result.tokensAfter > 0) lastCompactionTokensAfter = Math.floor(timeoutCompactResult.result.tokensAfter);
								if (contextEngine.info.ownsCompaction === true) await runPostCompactionSideEffects({
									config: params.config,
									sessionKey: params.sessionKey,
									sessionFile: activeSessionFile
								});
								log.info(`[timeout-compaction] compaction succeeded for ${provider}/${modelId}; retrying prompt`);
								continue;
							} else log.warn(`[timeout-compaction] compaction did not reduce context for ${provider}/${modelId}; falling through to normal handling`);
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
						log.warn(`[context-overflow-diag] sessionKey=${params.sessionKey ?? params.sessionId} provider=${provider}/${modelId} source=${contextOverflowError.source} messages=${msgCount} sessionFile=${activeSessionFile} diagId=${overflowDiagId} compactionAttempts=${overflowCompactionAttempts} observedTokens=${observedOverflowTokens ?? "unknown"} error=${errorText.slice(0, 200)}`);
						const isCompactionFailure = isCompactionFailureError(errorText);
						const hadAttemptLevelCompaction = attemptCompactionCount > 0;
						if (!isCompactionFailure && hadAttemptLevelCompaction && overflowCompactionAttempts < MAX_OVERFLOW_COMPACTION_ATTEMPTS) {
							overflowCompactionAttempts++;
							log.warn(`context overflow persisted after in-attempt compaction (attempt ${overflowCompactionAttempts}/${MAX_OVERFLOW_COMPACTION_ATTEMPTS}); retrying prompt without additional compaction for ${provider}/${modelId}`);
							continue;
						}
						if (!isCompactionFailure && !hadAttemptLevelCompaction && overflowCompactionAttempts < MAX_OVERFLOW_COMPACTION_ATTEMPTS) {
							if (log.isEnabled("debug")) log.debug(`[compaction-diag] decision diagId=${overflowDiagId} branch=compact isCompactionFailure=${isCompactionFailure} hasOversizedToolResults=unknown attempt=${overflowCompactionAttempts + 1} maxAttempts=${MAX_OVERFLOW_COMPACTION_ATTEMPTS}`);
							overflowCompactionAttempts++;
							log.warn(`context overflow detected (attempt ${overflowCompactionAttempts}/${MAX_OVERFLOW_COMPACTION_ATTEMPTS}); attempting auto-compaction for ${provider}/${modelId}`);
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
									sessionId: activeSessionId,
									sessionKey: params.sessionKey,
									sessionFile: activeSessionFile,
									tokenBudget: ctxInfo.tokens,
									...observedOverflowTokens !== void 0 ? { currentTokenCount: observedOverflowTokens } : {},
									force: true,
									compactionTarget: "budget",
									runtimeContext: overflowCompactionRuntimeContext
								});
								if (compactResult.ok && compactResult.compacted) {
									adoptCompactionTranscript(compactResult);
									await runContextEngineMaintenance({
										contextEngine,
										sessionId: activeSessionId,
										sessionKey: params.sessionKey,
										sessionFile: activeSessionFile,
										reason: "compaction",
										runtimeContext: overflowCompactionRuntimeContext
									});
								}
							} catch (compactErr) {
								log.warn(`contextEngine.compact() threw during overflow recovery for ${provider}/${modelId}: ${String(compactErr)}`);
								compactResult = {
									ok: false,
									compacted: false,
									reason: String(compactErr)
								};
							}
							await runOwnsCompactionAfterHook("overflow recovery", compactResult);
							if (compactResult.compacted) {
								adoptCompactionTranscript(compactResult);
								if (typeof compactResult.result?.tokensAfter === "number" && Number.isFinite(compactResult.result.tokensAfter) && compactResult.result.tokensAfter > 0) lastCompactionTokensAfter = Math.floor(compactResult.result.tokensAfter);
								if (preflightRecovery?.route === "compact_then_truncate") {
									const truncResult = await truncateOversizedToolResultsInSession({
										sessionFile: activeSessionFile,
										contextWindowTokens: ctxInfo.tokens,
										maxCharsOverride: resolveLiveToolResultMaxChars({
											contextWindowTokens: ctxInfo.tokens,
											cfg: params.config,
											agentId: sessionAgentId
										}),
										sessionId: activeSessionId,
										sessionKey: params.sessionKey
									});
									if (truncResult.truncated) log.info(`[context-overflow-precheck] post-compaction tool-result truncation succeeded for ${provider}/${modelId}; truncated ${truncResult.truncatedCount} tool result(s)`);
									else log.warn(`[context-overflow-precheck] post-compaction tool-result truncation did not help for ${provider}/${modelId}: ${truncResult.reason ?? "unknown"}`);
								}
								autoCompactionCount += 1;
								log.info(`auto-compaction succeeded for ${provider}/${modelId}; retrying prompt`);
								continue;
							}
							log.warn(`auto-compaction failed for ${provider}/${modelId}: ${compactResult.reason ?? "nothing to compact"}`);
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
								log.warn(`[context-overflow-recovery] Attempting tool result truncation for ${provider}/${modelId} (contextWindow=${contextWindowTokens} tokens)`);
								const truncResult = await truncateOversizedToolResultsInSession({
									sessionFile: activeSessionFile,
									contextWindowTokens,
									maxCharsOverride: toolResultMaxChars,
									sessionId: activeSessionId,
									sessionKey: params.sessionKey
								});
								if (truncResult.truncated) {
									log.info(`[context-overflow-recovery] Truncated ${truncResult.truncatedCount} tool result(s); retrying prompt`);
									continue;
								}
								log.warn(`[context-overflow-recovery] Tool result truncation did not help: ${truncResult.reason ?? "unknown"}`);
							}
						}
						if ((isCompactionFailure || overflowCompactionAttempts >= MAX_OVERFLOW_COMPACTION_ATTEMPTS) && log.isEnabled("debug")) log.debug(`[compaction-diag] decision diagId=${overflowDiagId} branch=give_up isCompactionFailure=${isCompactionFailure} hasOversizedToolResults=unknown attempt=${overflowCompactionAttempts} maxAttempts=${MAX_OVERFLOW_COMPACTION_ATTEMPTS}`);
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
									contextTokens: ctxInfo.tokens,
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
										contextTokens: ctxInfo.tokens,
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
										contextTokens: ctxInfo.tokens,
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
						const promptProfileFailureReason = resolveRunAuthProfileFailureReason(promptFailoverReason);
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
							log.warn(`unsupported thinking level for ${provider}/${modelId}; retrying with ${fallbackThinking}`);
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
						log.warn(`unsupported thinking level for ${provider}/${modelId}; retrying with ${fallbackThinking}`);
						thinkLevel = fallbackThinking;
						continue;
					}
					const authFailure = isAuthAssistantError(assistantForFailover);
					const rateLimitFailure = isRateLimitAssistantError(assistantForFailover);
					const billingFailure = isBillingAssistantError(assistantForFailover);
					const failoverFailure = isFailoverAssistantError(assistantForFailover);
					const assistantFailoverReason = classifyFailoverReason(assistantForFailover?.errorMessage ?? "", { provider: assistantForFailover?.provider });
					const assistantProfileFailureReason = resolveRunAuthProfileFailureReason(assistantFailoverReason);
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
						log.warn(`Profile ${lastProfileId} rejected image payload${details ? ` (${details})` : ""}.`);
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
						warn: (message) => log.warn(message),
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
						sessionFile: sessionFileUsed,
						provider: sessionLastAssistant?.provider ?? provider,
						model: sessionLastAssistant?.model ?? model.id,
						contextTokens: ctxInfo.tokens,
						agentHarnessId: attempt.agentHarnessId,
						usage: usageMeta.usage,
						lastCallUsage: usageMeta.lastCallUsage,
						promptTokens: usageMeta.promptTokens,
						compactionCount: autoCompactionCount > 0 ? autoCompactionCount : void 0,
						compactionTokensAfter: lastCompactionTokensAfter
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
						thinkingLevel: params.thinkLevel,
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
					const attemptToolSummary = buildTraceToolSummary({
						toolMetas: attempt.toolMetas,
						hadFailure: Boolean(attempt.lastToolError)
					});
					const failureSignal = resolveEmbeddedRunFailureSignal({
						trigger: params.trigger,
						lastToolError: attempt.lastToolError
					});
					if (timedOut && !timedOutDuringCompaction && !payloadsWithToolMedia?.length) {
						const timeoutText = idleTimedOut ? "The model did not produce a response before the model idle timeout. Please try again, or increase `models.providers.<id>.timeoutSeconds` for slow local or self-hosted providers." : "Request timed out before a response was generated. Please try again, or increase `agents.defaults.timeoutSeconds` in your config.";
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
								livenessState,
								toolSummary: attemptToolSummary,
								...failureSignal ? { failureSignal } : {},
								agentHarnessResultClassification: attempt.agentHarnessResultClassification
							},
							didSendViaMessagingTool: attempt.didSendViaMessagingTool,
							didSendDeterministicApprovalPrompt: attempt.didSendDeterministicApprovalPrompt,
							messagingToolSentTexts: attempt.messagingToolSentTexts,
							messagingToolSentMediaUrls: attempt.messagingToolSentMediaUrls,
							messagingToolSentTargets: attempt.messagingToolSentTargets,
							successfulCronAdds: attempt.successfulCronAdds
						};
					}
					const silentToolResultReplyPayload = resolveSilentToolResultReplyPayload({
						isCronTrigger: params.trigger === "cron",
						payloadCount: payloadsWithToolMedia?.length ?? 0,
						aborted,
						timedOut,
						attempt
					});
					const payloadsForTerminalPath = payloadsWithToolMedia?.length ? payloadsWithToolMedia : silentToolResultReplyPayload ? [silentToolResultReplyPayload] : payloadsWithToolMedia;
					const payloadCount = payloadsForTerminalPath?.length ?? 0;
					const emptyAssistantReplyIsSilent = shouldTreatEmptyAssistantReplyAsSilent({
						allowEmptyAssistantReplyAsSilent: params.allowEmptyAssistantReplyAsSilent,
						payloadCount,
						aborted,
						timedOut,
						attempt
					});
					const nextPlanningOnlyRetryInstruction = emptyAssistantReplyIsSilent ? null : resolvePlanningOnlyRetryInstruction({
						provider,
						modelId,
						executionContract,
						prompt: params.prompt,
						aborted,
						timedOut,
						attempt
					});
					const nextReasoningOnlyRetryInstruction = emptyAssistantReplyIsSilent ? null : resolveReasoningOnlyRetryInstruction({
						provider: activeErrorContext.provider,
						modelId: activeErrorContext.model,
						modelApi: effectiveModel.api,
						executionContract,
						aborted,
						timedOut,
						attempt
					});
					const nextEmptyResponseRetryInstruction = emptyAssistantReplyIsSilent ? null : resolveEmptyResponseRetryInstruction({
						provider: activeErrorContext.provider,
						modelId: activeErrorContext.model,
						modelApi: effectiveModel.api,
						executionContract,
						payloadCount,
						aborted,
						timedOut,
						attempt
					});
					if (nextPlanningOnlyRetryInstruction && planningOnlyRetryAttempts < maxPlanningOnlyRetryAttempts) {
						const planDetails = extractPlanningOnlyPlanDetails((attempt.assistantTexts ?? []).join("\n\n").trim());
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
						log.warn(`planning-only turn detected: runId=${params.runId} sessionId=${params.sessionId} provider=${provider}/${modelId} contract=${executionContract} configured=${configuredExecutionContract} — retrying ${planningOnlyRetryAttempts}/${maxPlanningOnlyRetryAttempts} with act-now steer`);
						continue;
					}
					if (!nextPlanningOnlyRetryInstruction && nextReasoningOnlyRetryInstruction && reasoningOnlyRetryAttempts < maxReasoningOnlyRetryAttempts) {
						reasoningOnlyRetryAttempts += 1;
						reasoningOnlyRetryInstruction = nextReasoningOnlyRetryInstruction;
						log.warn(`reasoning-only assistant turn detected: runId=${params.runId} sessionId=${params.sessionId} provider=${activeErrorContext.provider}/${activeErrorContext.model} — retrying ${reasoningOnlyRetryAttempts}/${maxReasoningOnlyRetryAttempts} with visible-answer continuation`);
						continue;
					}
					const reasoningOnlyRetriesExhausted = !nextPlanningOnlyRetryInstruction && nextReasoningOnlyRetryInstruction && reasoningOnlyRetryAttempts >= maxReasoningOnlyRetryAttempts;
					if (!nextPlanningOnlyRetryInstruction && !nextReasoningOnlyRetryInstruction && nextEmptyResponseRetryInstruction && emptyResponseRetryAttempts < maxEmptyResponseRetryAttempts) {
						emptyResponseRetryAttempts += 1;
						emptyResponseRetryInstruction = nextEmptyResponseRetryInstruction;
						log.warn(`empty response detected: runId=${params.runId} sessionId=${params.sessionId} provider=${activeErrorContext.provider}/${activeErrorContext.model} — retrying ${emptyResponseRetryAttempts}/${maxEmptyResponseRetryAttempts} with visible-answer continuation`);
						continue;
					}
					const incompleteTurnText = emptyAssistantReplyIsSilent ? null : resolveIncompleteTurnPayloadText({
						payloadCount,
						aborted,
						timedOut,
						attempt
					});
					if (reasoningOnlyRetriesExhausted && !finalAssistantVisibleText) log.warn(`reasoning-only retries exhausted: runId=${params.runId} sessionId=${params.sessionId} provider=${activeErrorContext.provider}/${activeErrorContext.model} attempts=${reasoningOnlyRetryAttempts}/${maxReasoningOnlyRetryAttempts} — surfacing incomplete-turn error`);
					if (!incompleteTurnText && nextPlanningOnlyRetryInstruction && strictAgenticActive) {
						log.warn(`strict-agentic run exhausted planning-only retries: runId=${params.runId} sessionId=${params.sessionId} provider=${provider}/${modelId} configured=${configuredExecutionContract} — surfacing blocked state`);
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
								livenessState,
								toolSummary: attemptToolSummary,
								...failureSignal ? { failureSignal } : {},
								agentHarnessResultClassification: attempt.agentHarnessResultClassification
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
							reason: resolveRunAuthProfileFailureReason(assistantFailoverReason)
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
								livenessState,
								toolSummary: attemptToolSummary,
								...failureSignal ? { failureSignal } : {},
								agentHarnessResultClassification: attempt.agentHarnessResultClassification
							},
							didSendViaMessagingTool: attempt.didSendViaMessagingTool,
							didSendDeterministicApprovalPrompt: attempt.didSendDeterministicApprovalPrompt,
							messagingToolSentTexts: attempt.messagingToolSentTexts,
							messagingToolSentMediaUrls: attempt.messagingToolSentMediaUrls,
							messagingToolSentTargets: attempt.messagingToolSentTargets,
							successfulCronAdds: attempt.successfulCronAdds
						};
					}
					if (!nextPlanningOnlyRetryInstruction && !nextReasoningOnlyRetryInstruction && nextEmptyResponseRetryInstruction && emptyResponseRetryAttempts >= maxEmptyResponseRetryAttempts) log.warn(`empty response retries exhausted: runId=${params.runId} sessionId=${params.sessionId} provider=${activeErrorContext.provider}/${activeErrorContext.model} attempts=${emptyResponseRetryAttempts}/${maxEmptyResponseRetryAttempts} — surfacing incomplete-turn error`);
					const silentErrorContent = sessionLastAssistant?.content;
					if (incompleteTurnText && !aborted && !promptError && !timedOut && sessionLastAssistant?.stopReason === "error" && ((sessionLastAssistant?.usage)?.output ?? 0) === 0 && (silentErrorContent?.length ?? 0) === 0 && (attempt.replayMetadata ? !attempt.replayMetadata.hadPotentialSideEffects : false) && emptyErrorRetries < MAX_EMPTY_ERROR_RETRIES) {
						emptyErrorRetries += 1;
						log.warn(`[empty-error-retry] stopReason=error output=0; resubmitting attempt=${emptyErrorRetries}/${MAX_EMPTY_ERROR_RETRIES} provider=${sessionLastAssistant?.provider ?? provider} model=${sessionLastAssistant?.model ?? model.id} sessionKey=${params.sessionKey ?? params.sessionId}`);
						continue;
					}
					if (incompleteTurnText) {
						const replayInvalid = resolveReplayInvalidForAttempt(incompleteTurnText);
						const livenessState = resolveRunLivenessState({
							payloadCount,
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
						log.warn(`incomplete turn detected: runId=${params.runId} sessionId=${params.sessionId} stopReason=${incompleteStopReason} payloads=${payloadCount} — surfacing error to user`);
						if (lastProfileId) await maybeMarkAuthProfileFailure({
							profileId: lastProfileId,
							reason: resolveRunAuthProfileFailureReason(assistantFailoverReason)
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
								livenessState,
								toolSummary: attemptToolSummary,
								...failureSignal ? { failureSignal } : {},
								agentHarnessResultClassification: attempt.agentHarnessResultClassification
							},
							didSendViaMessagingTool: attempt.didSendViaMessagingTool,
							didSendDeterministicApprovalPrompt: attempt.didSendDeterministicApprovalPrompt,
							messagingToolSentTexts: attempt.messagingToolSentTexts,
							messagingToolSentMediaUrls: attempt.messagingToolSentMediaUrls,
							messagingToolSentTargets: attempt.messagingToolSentTargets,
							successfulCronAdds: attempt.successfulCronAdds
						};
					}
					log.debug(`embedded run done: runId=${params.runId} sessionId=${params.sessionId} durationMs=${Date.now() - started} aborted=${aborted}`);
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
						payloadCount,
						aborted,
						timedOut,
						attempt,
						incompleteTurnText: null
					});
					const stopReason = attempt.clientToolCall ? "tool_calls" : attempt.yieldDetected ? "end_turn" : sessionLastAssistant?.stopReason;
					const terminalPayloads = emptyAssistantReplyIsSilent ? [{ text: SILENT_REPLY_TOKEN }] : payloadsForTerminalPath;
					attempt.setTerminalLifecycleMeta?.({
						replayInvalid,
						livenessState
					});
					return {
						payloads: terminalPayloads?.length ? terminalPayloads : void 0,
						...attempt.diagnosticTrace ? { diagnosticTrace: freezeDiagnosticTraceContext(attempt.diagnosticTrace) } : {},
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
							agentHarnessResultClassification: attempt.agentHarnessResultClassification,
							...emptyAssistantReplyIsSilent ? { terminalReplyKind: "silent-empty" } : {},
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
							toolSummary: attemptToolSummary,
							...failureSignal ? { failureSignal } : {},
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
				if (params.cleanupBundleMcpOnRunEnd === true) {
					const onError = (error, sessionId) => {
						log.warn(`bundle-mcp cleanup failed after run for ${sessionId}: ${formatErrorMessage(error)}`);
					};
					if (!await retireSessionMcpRuntimeForSessionKey({
						sessionKey: params.sessionKey,
						reason: "embedded-run-end",
						onError
					})) await retireSessionMcpRuntime({
						sessionId: params.sessionId,
						reason: "embedded-run-end",
						onError
					});
				}
			}
		});
	});
}
//#endregion
export { compactEmbeddedPiSession as n, runEmbeddedPiAgent as t };
