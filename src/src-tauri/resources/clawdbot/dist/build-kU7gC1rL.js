import { i as formatErrorMessage } from "./errors-Jbvi20TW.js";
import { t as createSubsystemLogger } from "./subsystem-CWI_MDy_.js";
import { n as resolveProviderIdForAuth } from "./provider-auth-aliases-MMrQv2w3.js";
import { p as resolveSessionAgentId } from "./agent-scope-_6dFncNS.js";
import { r as isGpt5ModelId } from "./gpt5-prompt-overlay-DIaFSR3O.js";
import { m as triggerInternalHook, n as createInternalHookEvent } from "./internal-hooks-BxzYnhn4.js";
import { F as resolveProviderSystemPromptContribution, tt as resolveProviderFollowupFallbackRoute } from "./provider-runtime-C1HXSRlX.js";
import { o as updateSessionStore } from "./store-Bm25Mivo.js";
import "./sessions-DIdqAx7y.js";
import { t as emitSessionTranscriptUpdate } from "./transcript-events-ofiGBxi_.js";
import { d as resolveGatewaySessionStoreTarget } from "./session-utils-0WhEvb4B.js";
import { t as normalizeEmbeddedAgentRuntime } from "./runtime-mIW-LQTp.js";
import { r as isSilentReplyPayloadText } from "./tokens-C_v_J0E7.js";
import { L as resolveTranscriptPolicy } from "./wait-for-idle-before-flush-CkZJsBmY.js";
import { n as normalizeProviderToolSchemas, t as logProviderToolSchemaDiagnostics } from "./tool-schema-runtime-B9xsYCmd.js";
import { t as log$1 } from "./logger-Cq8_pd8S.js";
import { m as resolveSendableOutboundReplyParts } from "./reply-payload-COWCxmsk.js";
import { a as resolvePreparedExtraParams } from "./extra-params-BSCrTsfs.js";
import { n as getActiveMemorySearchManager } from "./memory-runtime-CKatHNRH.js";
import { t as resolveMemorySearchConfig } from "./memory-search--kG5KoFE.js";
import fs from "node:fs";
import path from "node:path";
import fs$1 from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { SessionManager } from "@mariozechner/pi-coding-agent";
//#region src/gateway/session-compaction-checkpoints.ts
const log = createSubsystemLogger("gateway/session-compaction-checkpoints");
const MAX_COMPACTION_CHECKPOINTS_PER_SESSION = 25;
function trimSessionCheckpoints(checkpoints) {
	if (!Array.isArray(checkpoints) || checkpoints.length === 0) return;
	return checkpoints.slice(-MAX_COMPACTION_CHECKPOINTS_PER_SESSION);
}
function sessionStoreCheckpoints(entry) {
	return Array.isArray(entry?.compactionCheckpoints) ? [...entry.compactionCheckpoints] : [];
}
function resolveSessionCompactionCheckpointReason(params) {
	if (params.trigger === "manual") return "manual";
	if (params.timedOut) return "timeout-retry";
	if (params.trigger === "overflow") return "overflow-retry";
	return "auto-threshold";
}
function captureCompactionCheckpointSnapshot(params) {
	const getLeafId = params.sessionManager && typeof params.sessionManager.getLeafId === "function" ? params.sessionManager.getLeafId.bind(params.sessionManager) : null;
	const sessionFile = params.sessionFile.trim();
	if (!getLeafId || !sessionFile) return null;
	const leafId = getLeafId();
	if (!leafId) return null;
	const parsedSessionFile = path.parse(sessionFile);
	const snapshotFile = path.join(parsedSessionFile.dir, `${parsedSessionFile.name}.checkpoint.${randomUUID()}${parsedSessionFile.ext || ".jsonl"}`);
	try {
		fs.copyFileSync(sessionFile, snapshotFile);
	} catch {
		return null;
	}
	let snapshotSession;
	try {
		snapshotSession = SessionManager.open(snapshotFile, path.dirname(snapshotFile));
	} catch {
		try {
			fs.unlinkSync(snapshotFile);
		} catch {}
		return null;
	}
	const getSessionId = snapshotSession && typeof snapshotSession.getSessionId === "function" ? snapshotSession.getSessionId.bind(snapshotSession) : null;
	if (!getSessionId) return null;
	return {
		sessionId: getSessionId(),
		sessionFile: snapshotFile,
		leafId
	};
}
async function cleanupCompactionCheckpointSnapshot(snapshot) {
	if (!snapshot?.sessionFile) return;
	try {
		await fs$1.unlink(snapshot.sessionFile);
	} catch {}
}
async function persistSessionCompactionCheckpoint(params) {
	const target = resolveGatewaySessionStoreTarget({
		cfg: params.cfg,
		key: params.sessionKey
	});
	const createdAt = params.createdAt ?? Date.now();
	const checkpoint = {
		checkpointId: randomUUID(),
		sessionKey: target.canonicalKey,
		sessionId: params.sessionId,
		createdAt,
		reason: params.reason,
		...typeof params.tokensBefore === "number" ? { tokensBefore: params.tokensBefore } : {},
		...typeof params.tokensAfter === "number" ? { tokensAfter: params.tokensAfter } : {},
		...params.summary?.trim() ? { summary: params.summary.trim() } : {},
		...params.firstKeptEntryId?.trim() ? { firstKeptEntryId: params.firstKeptEntryId.trim() } : {},
		preCompaction: {
			sessionId: params.snapshot.sessionId,
			sessionFile: params.snapshot.sessionFile,
			leafId: params.snapshot.leafId
		},
		postCompaction: {
			sessionId: params.sessionId,
			...params.postSessionFile?.trim() ? { sessionFile: params.postSessionFile.trim() } : {},
			...params.postLeafId?.trim() ? { leafId: params.postLeafId.trim() } : {},
			...params.postEntryId?.trim() ? { entryId: params.postEntryId.trim() } : {}
		}
	};
	let stored = false;
	await updateSessionStore(target.storePath, (store) => {
		const existing = store[target.canonicalKey];
		if (!existing?.sessionId) return;
		const checkpoints = sessionStoreCheckpoints(existing);
		checkpoints.push(checkpoint);
		store[target.canonicalKey] = {
			...existing,
			updatedAt: Math.max(existing.updatedAt ?? 0, createdAt),
			compactionCheckpoints: trimSessionCheckpoints(checkpoints)
		};
		stored = true;
	});
	if (!stored) {
		log.warn("skipping compaction checkpoint persist: session not found", { sessionKey: params.sessionKey });
		return null;
	}
	return checkpoint;
}
function listSessionCompactionCheckpoints(entry) {
	return sessionStoreCheckpoints(entry).toSorted((a, b) => b.createdAt - a.createdAt);
}
function getSessionCompactionCheckpoint(params) {
	const checkpointId = params.checkpointId.trim();
	if (!checkpointId) return;
	return listSessionCompactionCheckpoints(params.entry).find((checkpoint) => checkpoint.checkpointId === checkpointId);
}
//#endregion
//#region src/agents/pi-embedded-runner/compaction-hooks.ts
function resolvePostCompactionIndexSyncMode(config) {
	const mode = config?.agents?.defaults?.compaction?.postIndexSync;
	if (mode === "off" || mode === "async" || mode === "await") return mode;
	return "async";
}
async function runPostCompactionSessionMemorySync(params) {
	if (!params.config) return;
	try {
		const sessionFile = params.sessionFile.trim();
		if (!sessionFile) return;
		const agentId = resolveSessionAgentId({
			sessionKey: params.sessionKey,
			config: params.config
		});
		const resolvedMemory = resolveMemorySearchConfig(params.config, agentId);
		if (!resolvedMemory || !resolvedMemory.sources.includes("sessions")) return;
		if (!resolvedMemory.sync.sessions.postCompactionForce) return;
		const { manager } = await getActiveMemorySearchManager({
			cfg: params.config,
			agentId
		});
		if (!manager?.sync) return;
		await manager.sync({
			reason: "post-compaction",
			sessionFiles: [sessionFile]
		});
	} catch (err) {
		log$1.warn(`memory sync skipped (post-compaction): ${formatErrorMessage(err)}`);
	}
}
function syncPostCompactionSessionMemory(params) {
	if (params.mode === "off" || !params.config) return Promise.resolve();
	const syncTask = runPostCompactionSessionMemorySync({
		config: params.config,
		sessionKey: params.sessionKey,
		sessionFile: params.sessionFile
	});
	if (params.mode === "await") return syncTask;
	return Promise.resolve();
}
async function runPostCompactionSideEffects(params) {
	const sessionFile = params.sessionFile.trim();
	if (!sessionFile) return;
	emitSessionTranscriptUpdate(sessionFile);
	await syncPostCompactionSessionMemory({
		config: params.config,
		sessionKey: params.sessionKey,
		sessionFile,
		mode: resolvePostCompactionIndexSyncMode(params.config)
	});
}
function asCompactionHookRunner(hookRunner) {
	if (!hookRunner) return null;
	return {
		hasHooks: (hookName) => hookRunner.hasHooks?.(hookName) ?? false,
		runBeforeCompaction: hookRunner.runBeforeCompaction?.bind(hookRunner),
		runAfterCompaction: hookRunner.runAfterCompaction?.bind(hookRunner)
	};
}
function estimateTokenCountSafe(messages, estimateTokensFn) {
	try {
		let total = 0;
		for (const message of messages) total += estimateTokensFn(message);
		return total;
	} catch {
		return;
	}
}
function buildBeforeCompactionHookMetrics(params) {
	return {
		messageCountOriginal: params.originalMessages.length,
		tokenCountOriginal: estimateTokenCountSafe(params.originalMessages, params.estimateTokensFn),
		messageCountBefore: params.currentMessages.length,
		tokenCountBefore: params.observedTokenCount ?? estimateTokenCountSafe(params.currentMessages, params.estimateTokensFn)
	};
}
async function runBeforeCompactionHooks(params) {
	const missingSessionKey = !params.sessionKey || !params.sessionKey.trim();
	const hookSessionKey = params.sessionKey?.trim() || params.sessionId;
	try {
		await triggerInternalHook(createInternalHookEvent("session", "compact:before", hookSessionKey, {
			sessionId: params.sessionId,
			missingSessionKey,
			messageCount: params.metrics.messageCountBefore,
			tokenCount: params.metrics.tokenCountBefore,
			messageCountOriginal: params.metrics.messageCountOriginal,
			tokenCountOriginal: params.metrics.tokenCountOriginal
		}));
	} catch (err) {
		log$1.warn("session:compact:before hook failed", {
			errorMessage: formatErrorMessage(err),
			errorStack: err instanceof Error ? err.stack : void 0
		});
	}
	if (params.hookRunner?.hasHooks?.("before_compaction")) try {
		await params.hookRunner.runBeforeCompaction?.({
			messageCount: params.metrics.messageCountBefore,
			tokenCount: params.metrics.tokenCountBefore
		}, {
			sessionId: params.sessionId,
			agentId: params.sessionAgentId,
			sessionKey: hookSessionKey,
			workspaceDir: params.workspaceDir,
			messageProvider: params.messageProvider
		});
	} catch (err) {
		log$1.warn("before_compaction hook failed", {
			errorMessage: formatErrorMessage(err),
			errorStack: err instanceof Error ? err.stack : void 0
		});
	}
	return {
		hookSessionKey,
		missingSessionKey
	};
}
function estimateTokensAfterCompaction(params) {
	const tokensAfter = estimateTokenCountSafe(params.messagesAfter, params.estimateTokensFn);
	if (tokensAfter === void 0) return;
	const sanityCheckBaseline = params.observedTokenCount ?? params.fullSessionTokensBefore;
	if (sanityCheckBaseline > 0 && tokensAfter > (params.observedTokenCount !== void 0 ? sanityCheckBaseline : sanityCheckBaseline * 1.1)) return;
	return tokensAfter;
}
async function runAfterCompactionHooks(params) {
	try {
		await triggerInternalHook(createInternalHookEvent("session", "compact:after", params.hookSessionKey, {
			sessionId: params.sessionId,
			missingSessionKey: params.missingSessionKey,
			messageCount: params.messageCountAfter,
			tokenCount: params.tokensAfter,
			compactedCount: params.compactedCount,
			summaryLength: params.summaryLength,
			tokensBefore: params.tokensBefore,
			tokensAfter: params.tokensAfter,
			firstKeptEntryId: params.firstKeptEntryId
		}));
	} catch (err) {
		log$1.warn("session:compact:after hook failed", {
			errorMessage: formatErrorMessage(err),
			errorStack: err instanceof Error ? err.stack : void 0
		});
	}
	if (params.hookRunner?.hasHooks?.("after_compaction")) try {
		await params.hookRunner.runAfterCompaction?.({
			messageCount: params.messageCountAfter,
			tokenCount: params.tokensAfter,
			compactedCount: params.compactedCount,
			sessionFile: params.sessionFile
		}, {
			sessionId: params.sessionId,
			agentId: params.sessionAgentId,
			sessionKey: params.hookSessionKey,
			workspaceDir: params.workspaceDir,
			messageProvider: params.messageProvider
		});
	} catch (err) {
		log$1.warn("after_compaction hook failed", {
			errorMessage: formatErrorMessage(err),
			errorStack: err instanceof Error ? err.stack : void 0
		});
	}
}
//#endregion
//#region src/agents/pi-embedded-runner/model-context-tokens.ts
function readPiModelContextTokens(model) {
	const value = model?.contextTokens;
	return typeof value === "number" && Number.isFinite(value) ? value : void 0;
}
//#endregion
//#region src/agents/runtime-plan/auth.ts
const CODEX_HARNESS_AUTH_PROVIDER = "openai-codex";
function resolveHarnessAuthProvider(params) {
	const harnessId = normalizeEmbeddedAgentRuntime(params.harnessId);
	const runtime = normalizeEmbeddedAgentRuntime(params.harnessRuntime);
	return harnessId === "codex" || runtime === "codex" ? CODEX_HARNESS_AUTH_PROVIDER : void 0;
}
function buildAgentRuntimeAuthPlan(params) {
	const aliasLookupParams = {
		config: params.config,
		workspaceDir: params.workspaceDir
	};
	const providerForAuth = resolveProviderIdForAuth(params.provider, aliasLookupParams);
	const authProfileProviderForAuth = resolveProviderIdForAuth(params.authProfileProvider ?? params.provider, aliasLookupParams);
	const harnessAuthProvider = resolveHarnessAuthProvider(params);
	const harnessProviderForAuth = harnessAuthProvider ? resolveProviderIdForAuth(harnessAuthProvider, aliasLookupParams) : void 0;
	const harnessCanForwardProfile = params.allowHarnessAuthProfileForwarding !== false && harnessProviderForAuth && harnessProviderForAuth === authProfileProviderForAuth;
	const canForwardProfile = providerForAuth === authProfileProviderForAuth || harnessCanForwardProfile;
	return {
		providerForAuth,
		authProfileProviderForAuth,
		...harnessProviderForAuth ? { harnessAuthProvider: harnessProviderForAuth } : {},
		...canForwardProfile ? { forwardedAuthProfileId: params.sessionAuthProfileId } : {}
	};
}
//#endregion
//#region src/agents/pi-embedded-runner/result-fallback-classifier.ts
const EMPTY_TERMINAL_REPLY_RE = /Agent couldn't generate a response/i;
const PLAN_ONLY_TERMINAL_REPLY_RE = /Agent stopped after repeated plan-only turns/i;
function isEmbeddedPiRunResult(value) {
	return Boolean(value && typeof value === "object" && "meta" in value && value.meta && typeof value.meta === "object");
}
function hasVisibleNonErrorPayload(result) {
	return (result.payloads ?? []).some((payload) => {
		if (!payload || payload.isError === true || payload.isReasoning === true) return false;
		return (typeof payload.text === "string" ? payload.text.trim() : "").length > 0 || Boolean(payload.mediaUrl) || Array.isArray(payload.mediaUrls) && payload.mediaUrls.length > 0;
	});
}
function hasOutboundSideEffects(result) {
	return result.didSendViaMessagingTool === true || (result.messagingToolSentTexts?.length ?? 0) > 0 || (result.messagingToolSentMediaUrls?.length ?? 0) > 0 || (result.messagingToolSentTargets?.length ?? 0) > 0 || (result.successfulCronAdds ?? 0) > 0 || (result.meta.toolSummary?.calls ?? 0) > 0;
}
function hasDeliberateSilentTerminalReply(result) {
	return [result.meta.finalAssistantRawText, result.meta.finalAssistantVisibleText].some((text) => typeof text === "string" && isSilentReplyPayloadText(text));
}
function classifyHarnessResult(params) {
	switch (params.result.meta.agentHarnessResultClassification) {
		case "empty": return {
			message: `${params.provider}/${params.model} ended without a visible assistant reply`,
			reason: "format",
			code: "empty_result"
		};
		case "reasoning-only": return {
			message: `${params.provider}/${params.model} ended with reasoning only`,
			reason: "format",
			code: "reasoning_only_result"
		};
		case "planning-only": return {
			message: `${params.provider}/${params.model} exhausted plan-only retries without taking action`,
			reason: "format",
			code: "planning_only_result"
		};
		default: return null;
	}
}
function classifyEmbeddedPiRunResultForModelFallback(params) {
	if (!isGpt5ModelId(params.model) || !isEmbeddedPiRunResult(params.result)) return null;
	if (params.result.meta.aborted || params.hasDirectlySentBlockReply === true || params.hasBlockReplyPipelineOutput === true || hasVisibleNonErrorPayload(params.result)) return null;
	if (hasOutboundSideEffects(params.result)) return null;
	const harnessClassification = classifyHarnessResult({
		provider: params.provider,
		model: params.model,
		result: params.result
	});
	if (harnessClassification) return harnessClassification;
	const payloads = params.result.payloads ?? [];
	if (payloads.length === 0 && hasDeliberateSilentTerminalReply(params.result)) return null;
	if (payloads.length === 0) return {
		message: `${params.provider}/${params.model} ended without a visible assistant reply`,
		reason: "format",
		code: "empty_result"
	};
	if (payloads.every((payload) => payload.isReasoning === true)) return {
		message: `${params.provider}/${params.model} ended with reasoning only`,
		reason: "format",
		code: "reasoning_only_result"
	};
	const errorText = payloads.filter((payload) => payload?.isError === true).map((payload) => typeof payload.text === "string" ? payload.text : "").join("\n");
	if (PLAN_ONLY_TERMINAL_REPLY_RE.test(errorText)) return {
		message: `${params.provider}/${params.model} exhausted plan-only retries without taking action`,
		reason: "format",
		code: "planning_only_result"
	};
	if (!EMPTY_TERMINAL_REPLY_RE.test(errorText)) return null;
	return {
		message: `${params.provider}/${params.model} ended with an incomplete terminal response`,
		reason: "format",
		code: "incomplete_result"
	};
}
//#endregion
//#region src/agents/runtime-plan/build.ts
function formatResolvedRef(params) {
	return `${params.provider}/${params.modelId}`;
}
function hasMedia(payload) {
	return resolveSendableOutboundReplyParts(payload).hasMedia;
}
function buildAgentRuntimeDeliveryPlan(params) {
	return {
		isSilentPayload(payload) {
			return isSilentReplyPayloadText(payload.text, "NO_REPLY") && !hasMedia(payload);
		},
		resolveFollowupRoute(routeParams) {
			return resolveProviderFollowupFallbackRoute({
				provider: params.provider,
				config: params.config,
				workspaceDir: params.workspaceDir,
				context: {
					config: params.config,
					agentDir: params.agentDir,
					workspaceDir: params.workspaceDir,
					provider: params.provider,
					modelId: params.modelId,
					payload: routeParams.payload,
					originatingChannel: routeParams.originatingChannel,
					originatingTo: routeParams.originatingTo,
					originRoutable: routeParams.originRoutable,
					dispatcherAvailable: routeParams.dispatcherAvailable
				}
			});
		}
	};
}
function buildAgentRuntimeOutcomePlan() {
	return { classifyRunResult: classifyEmbeddedPiRunResultForModelFallback };
}
function buildAgentRuntimePlan(params) {
	const modelApi = params.modelApi ?? params.model?.api ?? void 0;
	const transport = params.resolvedTransport;
	const auth = buildAgentRuntimeAuthPlan({
		provider: params.provider,
		authProfileProvider: params.authProfileProvider,
		sessionAuthProfileId: params.sessionAuthProfileId,
		config: params.config,
		workspaceDir: params.workspaceDir,
		harnessId: params.harnessId,
		harnessRuntime: params.harnessRuntime,
		allowHarnessAuthProfileForwarding: params.allowHarnessAuthProfileForwarding
	});
	const resolvedRef = {
		provider: params.provider,
		modelId: params.modelId,
		...modelApi ? { modelApi } : {},
		...params.harnessId ? { harnessId: params.harnessId } : {},
		...transport ? { transport } : {}
	};
	const toolContext = {
		provider: params.provider,
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: process.env,
		modelId: params.modelId,
		modelApi,
		model: params.model
	};
	const resolveToolContext = (overrides) => ({
		...toolContext,
		...overrides?.workspaceDir !== void 0 ? { workspaceDir: overrides.workspaceDir } : {},
		...overrides?.modelApi !== void 0 ? { modelApi: overrides.modelApi } : {},
		...overrides?.model !== void 0 ? { model: overrides.model } : {}
	});
	const resolveTranscriptRuntimePolicy = (overrides) => resolveTranscriptPolicy({
		provider: params.provider,
		modelId: params.modelId,
		config: params.config,
		workspaceDir: overrides?.workspaceDir ?? params.workspaceDir,
		env: process.env,
		modelApi: overrides?.modelApi ?? modelApi,
		model: overrides?.model ?? params.model
	});
	const resolveTransportExtraParams = (overrides = {}) => resolvePreparedExtraParams({
		cfg: params.config,
		provider: params.provider,
		modelId: params.modelId,
		agentDir: params.agentDir,
		workspaceDir: overrides.workspaceDir ?? params.workspaceDir,
		extraParamsOverride: overrides.extraParamsOverride ?? params.extraParamsOverride,
		thinkingLevel: overrides.thinkingLevel ?? params.thinkingLevel,
		agentId: overrides.agentId ?? params.agentId,
		model: overrides.model ?? params.model,
		resolvedTransport: overrides.resolvedTransport ?? transport
	});
	return {
		resolvedRef,
		auth,
		prompt: {
			provider: params.provider,
			modelId: params.modelId,
			resolveSystemPromptContribution(context) {
				return resolveProviderSystemPromptContribution({
					provider: params.provider,
					config: params.config,
					workspaceDir: context.workspaceDir ?? params.workspaceDir,
					context
				});
			}
		},
		tools: {
			normalize(tools, overrides) {
				return normalizeProviderToolSchemas({
					...resolveToolContext(overrides),
					tools
				});
			},
			logDiagnostics(tools, overrides) {
				logProviderToolSchemaDiagnostics({
					...resolveToolContext(overrides),
					tools
				});
			}
		},
		transcript: {
			policy: resolveTranscriptRuntimePolicy(),
			resolvePolicy: resolveTranscriptRuntimePolicy
		},
		delivery: buildAgentRuntimeDeliveryPlan(params),
		outcome: buildAgentRuntimeOutcomePlan(),
		transport: {
			extraParams: resolveTransportExtraParams(),
			resolveExtraParams: resolveTransportExtraParams
		},
		observability: {
			resolvedRef: formatResolvedRef({
				provider: params.provider,
				modelId: params.modelId
			}),
			provider: params.provider,
			modelId: params.modelId,
			...modelApi ? { modelApi } : {},
			...params.harnessId ? { harnessId: params.harnessId } : {},
			...auth.forwardedAuthProfileId ? { authProfileId: auth.forwardedAuthProfileId } : {},
			...transport ? { transport } : {}
		}
	};
}
//#endregion
export { resolveSessionCompactionCheckpointReason as _, readPiModelContextTokens as a, estimateTokensAfterCompaction as c, runPostCompactionSideEffects as d, captureCompactionCheckpointSnapshot as f, persistSessionCompactionCheckpoint as g, listSessionCompactionCheckpoints as h, buildAgentRuntimeAuthPlan as i, runAfterCompactionHooks as l, getSessionCompactionCheckpoint as m, buildAgentRuntimeOutcomePlan as n, asCompactionHookRunner as o, cleanupCompactionCheckpointSnapshot as p, buildAgentRuntimePlan as r, buildBeforeCompactionHookMetrics as s, buildAgentRuntimeDeliveryPlan as t, runBeforeCompactionHooks as u };
