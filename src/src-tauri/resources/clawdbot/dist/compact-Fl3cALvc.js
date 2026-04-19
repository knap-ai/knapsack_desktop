import { i as formatErrorMessage } from "./errors-D8p6rxH8.js";
import { i as normalizeLowercaseStringOrEmpty, o as normalizeOptionalLowercaseString } from "./string-coerce-BUSzWgUA.js";
import { m as resolveUserPath } from "./utils-D5DtWkEu.js";
import { n as resolveOwnerDisplaySetting } from "./owner-display-CR4JL3B8.js";
import { b as isSubagentSessionKey, y as isCronSessionKey } from "./session-key-Bh1lMwK5.js";
import { n as DEFAULT_MODEL, r as DEFAULT_PROVIDER, t as DEFAULT_CONTEXT_TOKENS } from "./defaults-CiQa3xnX.js";
import { m as resolveSessionAgentIds } from "./agent-scope-KFH9bkHi.js";
import { u as normalizeMessageChannel } from "./message-channel-CBqCPFa_.js";
import { r as wrapStreamFnTextTransforms } from "./plugin-text-transforms-BQzFygd9.js";
import { t as getGlobalHookRunner } from "./hook-runner-global-CYvQf43U.js";
import { F as resolveProviderSystemPromptContribution, I as resolveProviderTextTransforms, K as transformProviderSystemPrompt, x as prepareProviderRuntimeAuth } from "./provider-runtime-khVgWetm.js";
import { t as resolveOpenClawAgentDir } from "./agent-paths-JWlHCT48.js";
import { t as ensureOpenClawModelsJson } from "./models-config-CkfuLe-V.js";
import { t as ensureRuntimePluginsLoaded } from "./runtime-plugins-CSOygVdm.js";
import { i as resolveSessionLockMaxHoldFromTimeout, t as acquireSessionWriteLock } from "./session-write-lock-CcI4KSH8.js";
import { C as trackSessionManagerAccess, D as getDmHistoryLimitFromSessionKey, E as buildEmbeddedMessageActionDiscoveryInput, F as consumeCompactionSafeguardCancelReason, I as setCompactionSafeguardCancelReason, L as compactWithSafetyTimeout, M as hasMeaningfulConversationContent, N as isRealConversationMessage, O as limitHistoryTurns, Q as createPreparedEmbeddedPiSettingsManager, R as resolveCompactionTimeoutMs, S as prewarmSessionFile, T as validateReplayTurns, U as guardSessionManager, V as resolveTranscriptPolicy, Z as repairSessionFileIfNeeded, a as runAfterCompactionHooks, at as resolveChannelCapabilities, b as resolveEmbeddedAgentStreamFn, ct as isHeartbeatUserMessage, d as mapThinkingLevel, f as splitSdkTools, g as createSystemPromptOverride, h as buildEmbeddedSystemPrompt, i as estimateTokensAfterCompaction, k as buildEmbeddedExtensionFactories, l as resolveEmbeddedCompactionTarget, lt as captureCompactionCheckpointSnapshot, m as applySystemPromptOverrideToSession, mt as resolveSessionCompactionCheckpointReason, n as asCompactionHookRunner, o as runBeforeCompactionHooks, p as collectAllowedToolNames, pt as persistSessionCompactionCheckpoint, r as buildBeforeCompactionHookMetrics, s as runPostCompactionSideEffects, st as isHeartbeatOkResponse, t as readPiModelContextTokens, tt as createBundleLspToolRuntime, u as flushPendingToolResultsAfterIdle, ut as cleanupCompactionCheckpointSnapshot, v as resolveEmbeddedAgentApiKey, w as sanitizeSessionHistory, x as resolveEmbeddedRunSkillEntries, y as resolveEmbeddedAgentBaseStreamFn } from "./model-context-tokens-z5hvDVkk.js";
import { o as resolveContextWindowInfo } from "./context-window-guard-CERNVERH.js";
import { r as resolveHeartbeatSummaryForAgent } from "./heartbeat-summary-Cgk1PVlc.js";
import { t as getMachineDisplayName } from "./machine-name-dWhRKMd-.js";
import { a as listChannelSupportedActions, c as resolveChannelReactionGuidance, o as resolveChannelMessageToolCapabilities, s as resolveChannelMessageToolHints } from "./channel-tools-DdZyHuyK.js";
import { n as buildTtsSystemPromptHint } from "./tts-m-RAIr7w.js";
import { t as isReasoningTagProvider } from "./provider-utils-DNY7A_rU.js";
import { i as resolveBootstrapContextForRun, o as resolveHeartbeatPromptForSystemPrompt, r as makeBootstrapWarn } from "./bootstrap-files-ZYTN7n8L.js";
import { h as ensureSessionHeader, r as pickFallbackThinkingLevel } from "./pi-embedded-helpers-6UMMUO8y.js";
import { t as resolveOpenClawDocsPath } from "./docs-path-cNW4ADLB.js";
import { t as buildModelAliasLines } from "./model-alias-lines-C__EBjO0.js";
import { c as resolveModelAuthMode, n as applyLocalNoAuthHeaderOverride, r as getApiKeyForModel, t as applyAuthHeaderOverride } from "./model-auth-KKLbMBGv.js";
import { a as shouldUseOpenAIWebSocketTransport, c as supportsModelTools, o as logProviderToolSchemaDiagnostics, s as normalizeProviderToolSchemas } from "./attempt.thread-helpers-DleRYb_O.js";
import { n as registerProviderStreamForModel } from "./anthropic-vertex-stream-BpkPWKP9.js";
import { t as log } from "./logger-CMwqWyWx.js";
import { t as createBundleMcpToolRuntime } from "./pi-bundle-mcp-tools-vusm-AE2.js";
import { t as createOpenClawCodingTools } from "./pi-tools-BXpX0SpG.js";
import { i as generateSecureToken } from "./secure-random-DHoiZOqc.js";
import { c as resolveSkillsPromptForRun } from "./skills-Cwx5TftI.js";
import { n as applySkillEnvOverridesFromSnapshot, t as applySkillEnvOverrides } from "./env-overrides-CqQvDQ3v.js";
import { t as detectRuntimeShell } from "./shell-utils-7dy62Zl_.js";
import { o as resolveSandboxContext } from "./sandbox-BBeXIB2_.js";
import { a as sanitizeToolUseResultPairing } from "./session-transcript-repair-DyGWFT1O.js";
import { t as resolveSystemPromptOverride } from "./system-prompt-override-CuDxkMuk.js";
import { i as resolveUserTimezone, r as resolveUserTimeFormat, t as formatUserTime } from "./date-time-CH5CpFpu.js";
import { t as applyExtraParamsToAgent } from "./extra-params-DFVfEeA7.js";
import { t as buildEmbeddedSandboxInfo } from "./sandbox-info-DFrJghWk.js";
import { n as resolveModelAsync } from "./model-Bl_gU5g0.js";
import path from "node:path";
import os from "node:os";
import fs from "node:fs/promises";
import { DefaultResourceLoader, SessionManager, createAgentSession, estimateTokens } from "@mariozechner/pi-coding-agent";
//#region src/agents/pi-embedded-runner/compact-reasons.ts
function isGenericCompactionCancelledReason(reason) {
	const normalized = normalizeLowercaseStringOrEmpty(reason);
	return normalized === "compaction cancelled" || normalized === "error: compaction cancelled";
}
function resolveCompactionFailureReason(params) {
	if (isGenericCompactionCancelledReason(params.reason) && params.safeguardCancelReason) return params.safeguardCancelReason;
	return params.reason;
}
function classifyCompactionReason(reason) {
	const text = normalizeLowercaseStringOrEmpty(reason);
	if (!text) return "unknown";
	if (text.includes("nothing to compact")) return "no_compactable_entries";
	if (text.includes("below threshold")) return "below_threshold";
	if (text.includes("already compacted")) return "already_compacted_recently";
	if (text.includes("still exceeds target")) return "live_context_still_exceeds_target";
	if (text.includes("guard")) return "guard_blocked";
	if (text.includes("summary")) return "summary_failed";
	if (text.includes("timed out") || text.includes("timeout")) return "timeout";
	if (text.includes("400") || text.includes("401") || text.includes("403") || text.includes("429")) return "provider_error_4xx";
	if (text.includes("500") || text.includes("502") || text.includes("503") || text.includes("504")) return "provider_error_5xx";
	return "unknown";
}
//#endregion
//#region src/agents/pi-embedded-runner/manual-compaction-boundary.ts
function serializeSessionFile(header, entries) {
	return [JSON.stringify(header), ...entries.map((entry) => JSON.stringify(entry))].join("\n") + "\n";
}
function replaceLatestCompactionBoundary(params) {
	return params.entries.map((entry) => {
		if (entry.type !== "compaction" || entry.id !== params.compactionEntryId) return entry;
		return {
			...entry,
			firstKeptEntryId: entry.id
		};
	});
}
async function hardenManualCompactionBoundary(params) {
	const sessionManager = SessionManager.open(params.sessionFile);
	if (typeof sessionManager.getHeader !== "function" || typeof sessionManager.getLeafEntry !== "function" || typeof sessionManager.buildSessionContext !== "function" || typeof sessionManager.getEntries !== "function") return {
		applied: false,
		messages: []
	};
	const header = sessionManager.getHeader();
	const leaf = sessionManager.getLeafEntry();
	if (!header || leaf?.type !== "compaction") {
		const sessionContext = sessionManager.buildSessionContext();
		return {
			applied: false,
			leafId: typeof sessionManager.getLeafId === "function" ? sessionManager.getLeafId() ?? void 0 : void 0,
			messages: sessionContext.messages
		};
	}
	if (leaf.firstKeptEntryId === leaf.id) {
		const sessionContext = sessionManager.buildSessionContext();
		return {
			applied: false,
			firstKeptEntryId: leaf.id,
			leafId: typeof sessionManager.getLeafId === "function" ? sessionManager.getLeafId() ?? void 0 : void 0,
			messages: sessionContext.messages
		};
	}
	const content = serializeSessionFile(header, replaceLatestCompactionBoundary({
		entries: sessionManager.getEntries(),
		compactionEntryId: leaf.id
	}));
	const tmpFile = `${params.sessionFile}.manual-compaction-tmp`;
	await fs.writeFile(tmpFile, content, "utf-8");
	await fs.rename(tmpFile, params.sessionFile);
	const refreshed = SessionManager.open(params.sessionFile);
	const sessionContext = refreshed.buildSessionContext();
	return {
		applied: true,
		firstKeptEntryId: leaf.id,
		leafId: refreshed.getLeafId() ?? void 0,
		messages: sessionContext.messages
	};
}
//#endregion
//#region src/agents/pi-embedded-runner/session-truncation.ts
/**
* Truncate a session JSONL file after compaction by removing only the
* message entries that the compaction actually summarized.
*
* After compaction, the session file still contains all historical entries
* even though `buildSessionContext()` logically skips entries before
* `firstKeptEntryId`. Over many compaction cycles this causes unbounded
* file growth (issue #39953).
*
* This function rewrites the file keeping:
* 1. The session header
* 2. All non-message session state (custom, model_change, thinking_level_change,
*    session_info, custom_message, compaction entries)
*    Note: label and branch_summary entries referencing removed messages are
*    also dropped to avoid dangling metadata.
* 3. All entries from sibling branches not covered by the compaction
* 4. The unsummarized tail: entries from `firstKeptEntryId` through (and
*    including) the compaction entry, plus all entries after it
*
* Only `message` entries in the current branch that precede the compaction's
* `firstKeptEntryId` are removed — they are the entries the compaction
* actually summarized. Entries from `firstKeptEntryId` onward are preserved
* because `buildSessionContext()` expects them when reconstructing the
* session. Entries whose parent was removed are re-parented to the nearest
* kept ancestor (or become roots).
*/
async function truncateSessionAfterCompaction(params) {
	const { sessionFile } = params;
	let sm;
	try {
		sm = SessionManager.open(sessionFile);
	} catch (err) {
		const reason = formatErrorMessage(err);
		log.warn(`[session-truncation] Failed to open session file: ${reason}`);
		return {
			truncated: false,
			entriesRemoved: 0,
			reason
		};
	}
	const header = sm.getHeader();
	if (!header) return {
		truncated: false,
		entriesRemoved: 0,
		reason: "missing session header"
	};
	const branch = sm.getBranch();
	if (branch.length === 0) return {
		truncated: false,
		entriesRemoved: 0,
		reason: "empty session"
	};
	let latestCompactionIdx = -1;
	for (let i = branch.length - 1; i >= 0; i--) if (branch[i].type === "compaction") {
		latestCompactionIdx = i;
		break;
	}
	if (latestCompactionIdx < 0) return {
		truncated: false,
		entriesRemoved: 0,
		reason: "no compaction entry found"
	};
	if (latestCompactionIdx === 0) return {
		truncated: false,
		entriesRemoved: 0,
		reason: "compaction already at root"
	};
	const { firstKeptEntryId } = branch[latestCompactionIdx];
	const summarizedBranchIds = /* @__PURE__ */ new Set();
	for (let i = 0; i < latestCompactionIdx; i++) {
		if (firstKeptEntryId && branch[i].id === firstKeptEntryId) break;
		summarizedBranchIds.add(branch[i].id);
	}
	const allEntries = sm.getEntries();
	const removedIds = /* @__PURE__ */ new Set();
	for (const entry of allEntries) if (summarizedBranchIds.has(entry.id) && entry.type === "message") removedIds.add(entry.id);
	for (let i = 0; i < branch.length - 1; i++) {
		const userEntry = branch[i];
		const assistantEntry = branch[i + 1];
		if (userEntry.type === "message" && assistantEntry.type === "message" && summarizedBranchIds.has(userEntry.id) && summarizedBranchIds.has(assistantEntry.id) && !removedIds.has(userEntry.id) && !removedIds.has(assistantEntry.id) && isHeartbeatUserMessage(userEntry.message, params.heartbeatPrompt) && isHeartbeatOkResponse(assistantEntry.message, params.ackMaxChars)) {
			removedIds.add(userEntry.id);
			removedIds.add(assistantEntry.id);
			i++;
		}
	}
	for (const entry of allEntries) {
		if (entry.type === "label" && removedIds.has(entry.targetId)) {
			removedIds.add(entry.id);
			continue;
		}
		if (entry.type === "branch_summary" && entry.parentId !== null && removedIds.has(entry.parentId)) removedIds.add(entry.id);
	}
	if (removedIds.size === 0) return {
		truncated: false,
		entriesRemoved: 0,
		reason: "no entries to remove"
	};
	const entryById = /* @__PURE__ */ new Map();
	for (const entry of allEntries) entryById.set(entry.id, entry);
	const keptEntries = [];
	for (const entry of allEntries) {
		if (removedIds.has(entry.id)) continue;
		let newParentId = entry.parentId;
		while (newParentId !== null && removedIds.has(newParentId)) newParentId = entryById.get(newParentId)?.parentId ?? null;
		if (newParentId !== entry.parentId) keptEntries.push({
			...entry,
			parentId: newParentId
		});
		else keptEntries.push(entry);
	}
	const entriesRemoved = removedIds.size;
	const totalEntriesBefore = allEntries.length;
	let bytesBefore = 0;
	try {
		bytesBefore = (await fs.stat(sessionFile)).size;
	} catch {}
	if (params.archivePath) try {
		const archiveDir = path.dirname(params.archivePath);
		await fs.mkdir(archiveDir, { recursive: true });
		await fs.copyFile(sessionFile, params.archivePath);
		log.info(`[session-truncation] Archived pre-truncation file to ${params.archivePath}`);
	} catch (err) {
		const reason = formatErrorMessage(err);
		log.warn(`[session-truncation] Failed to archive: ${reason}`);
	}
	const content = [JSON.stringify(header), ...keptEntries.map((e) => JSON.stringify(e))].join("\n") + "\n";
	const tmpFile = `${sessionFile}.truncate-tmp`;
	try {
		await fs.writeFile(tmpFile, content, "utf-8");
		await fs.rename(tmpFile, sessionFile);
	} catch (err) {
		try {
			await fs.unlink(tmpFile);
		} catch {}
		const reason = formatErrorMessage(err);
		log.warn(`[session-truncation] Failed to write truncated file: ${reason}`);
		return {
			truncated: false,
			entriesRemoved: 0,
			reason
		};
	}
	const bytesAfter = Buffer.byteLength(content, "utf-8");
	log.info(`[session-truncation] Truncated session file: entriesBefore=${totalEntriesBefore} entriesAfter=${keptEntries.length} removed=${entriesRemoved} bytesBefore=${bytesBefore} bytesAfter=${bytesAfter} reduction=${bytesBefore > 0 ? ((1 - bytesAfter / bytesBefore) * 100).toFixed(1) : "?"}%`);
	return {
		truncated: true,
		entriesRemoved,
		bytesBefore,
		bytesAfter
	};
}
//#endregion
//#region src/agents/pi-embedded-runner/compact.ts
function hasRealConversationContent(msg, messages, index) {
	return isRealConversationMessage(msg, messages, index);
}
function createCompactionDiagId() {
	return `cmp-${Date.now().toString(36)}-${generateSecureToken(4)}`;
}
function prepareCompactionSessionAgent(params) {
	params.session.agent.streamFn = resolveEmbeddedAgentStreamFn({
		currentStreamFn: resolveEmbeddedAgentBaseStreamFn({ session: params.session }),
		providerStreamFn: params.providerStreamFn,
		shouldUseWebSocketTransport: params.shouldUseWebSocketTransport,
		wsApiKey: params.wsApiKey,
		sessionId: params.sessionId,
		signal: params.signal,
		model: params.effectiveModel,
		resolvedApiKey: params.resolvedApiKey,
		authStorage: params.authStorage
	});
	const providerTextTransforms = resolveProviderTextTransforms({
		provider: params.provider,
		config: params.config,
		workspaceDir: params.effectiveWorkspace
	});
	if (providerTextTransforms) params.session.agent.streamFn = wrapStreamFnTextTransforms({
		streamFn: params.session.agent.streamFn,
		input: providerTextTransforms.input,
		output: providerTextTransforms.output,
		transformSystemPrompt: false
	});
	return applyExtraParamsToAgent(params.session.agent, params.config, params.provider, params.modelId, void 0, params.thinkLevel, params.sessionAgentId, params.effectiveWorkspace, params.effectiveModel, params.agentDir);
}
function resolveCompactionProviderStream(params) {
	return registerProviderStreamForModel({
		model: params.effectiveModel,
		cfg: params.config,
		agentDir: params.agentDir,
		workspaceDir: params.effectiveWorkspace
	});
}
function normalizeObservedTokenCount(value) {
	return typeof value === "number" && Number.isFinite(value) && value > 0 ? Math.floor(value) : void 0;
}
function getMessageTextChars(msg) {
	const content = msg.content;
	if (typeof content === "string") return content.length;
	if (!Array.isArray(content)) return 0;
	let total = 0;
	for (const block of content) {
		if (!block || typeof block !== "object") continue;
		const text = block.text;
		if (typeof text === "string") total += text.length;
	}
	return total;
}
function resolveMessageToolLabel(msg) {
	const candidate = msg.toolName ?? msg.name ?? msg.tool;
	return typeof candidate === "string" && candidate.trim().length > 0 ? candidate : void 0;
}
function summarizeCompactionMessages(messages) {
	let historyTextChars = 0;
	let toolResultChars = 0;
	const contributors = [];
	let estTokens = 0;
	let tokenEstimationFailed = false;
	for (const msg of messages) {
		const role = typeof msg.role === "string" ? msg.role : "unknown";
		const chars = getMessageTextChars(msg);
		historyTextChars += chars;
		if (role === "toolResult") toolResultChars += chars;
		contributors.push({
			role,
			chars,
			tool: resolveMessageToolLabel(msg)
		});
		if (!tokenEstimationFailed) try {
			estTokens += estimateTokens(msg);
		} catch {
			tokenEstimationFailed = true;
		}
	}
	return {
		messages: messages.length,
		historyTextChars,
		toolResultChars,
		estTokens: tokenEstimationFailed ? void 0 : estTokens,
		contributors: contributors.toSorted((a, b) => b.chars - a.chars).slice(0, 3)
	};
}
function containsRealConversationMessages(messages) {
	return messages.some((message, index, allMessages) => hasRealConversationContent(message, allMessages, index));
}
/**
* Core compaction logic without lane queueing.
* Use this when already inside a session/global lane to avoid deadlocks.
*/
async function compactEmbeddedPiSessionDirect(params) {
	const startedAt = Date.now();
	const diagId = params.diagId?.trim() || createCompactionDiagId();
	const trigger = params.trigger ?? "manual";
	const attempt = params.attempt ?? 1;
	const maxAttempts = params.maxAttempts ?? 1;
	const runId = params.runId ?? params.sessionId;
	const resolvedWorkspace = resolveUserPath(params.workspaceDir);
	ensureRuntimePluginsLoaded({
		config: params.config,
		workspaceDir: resolvedWorkspace,
		allowGatewaySubagentBinding: params.allowGatewaySubagentBinding
	});
	const resolvedCompactionTarget = resolveEmbeddedCompactionTarget({
		config: params.config,
		provider: params.provider,
		modelId: params.model,
		authProfileId: params.authProfileId,
		defaultProvider: DEFAULT_PROVIDER,
		defaultModel: DEFAULT_MODEL
	});
	const provider = resolvedCompactionTarget.provider ?? "openai";
	const modelId = resolvedCompactionTarget.model ?? "gpt-5.4";
	const authProfileId = resolvedCompactionTarget.authProfileId;
	let thinkLevel = params.thinkLevel ?? "off";
	const attemptedThinking = /* @__PURE__ */ new Set();
	const fail = (reason) => {
		log.warn(`[compaction-diag] end runId=${runId} sessionKey=${params.sessionKey ?? params.sessionId} diagId=${diagId} trigger=${trigger} provider=${provider}/${modelId} attempt=${attempt} maxAttempts=${maxAttempts} outcome=failed reason=${classifyCompactionReason(reason)} durationMs=${Date.now() - startedAt}`);
		return {
			ok: false,
			compacted: false,
			reason
		};
	};
	const agentDir = params.agentDir ?? resolveOpenClawAgentDir();
	await ensureOpenClawModelsJson(params.config, agentDir);
	const { model, error, authStorage, modelRegistry } = await resolveModelAsync(provider, modelId, agentDir, params.config);
	if (!model) return fail(error ?? `Unknown model: ${provider}/${modelId}`);
	let runtimeModel = model;
	let apiKeyInfo = null;
	let hasRuntimeAuthExchange = false;
	try {
		apiKeyInfo = await getApiKeyForModel({
			model: runtimeModel,
			cfg: params.config,
			profileId: authProfileId,
			agentDir
		});
		if (!apiKeyInfo.apiKey) {
			if (apiKeyInfo.mode !== "aws-sdk") throw new Error(`No API key resolved for provider "${runtimeModel.provider}" (auth mode: ${apiKeyInfo.mode}).`);
		} else {
			const preparedAuth = await prepareProviderRuntimeAuth({
				provider: runtimeModel.provider,
				config: params.config,
				workspaceDir: resolvedWorkspace,
				env: process.env,
				context: {
					config: params.config,
					agentDir,
					workspaceDir: resolvedWorkspace,
					env: process.env,
					provider: runtimeModel.provider,
					modelId,
					model: runtimeModel,
					apiKey: apiKeyInfo.apiKey,
					authMode: apiKeyInfo.mode,
					profileId: apiKeyInfo.profileId
				}
			});
			if (preparedAuth?.baseUrl) runtimeModel = {
				...runtimeModel,
				baseUrl: preparedAuth.baseUrl
			};
			const runtimeApiKey = preparedAuth?.apiKey ?? apiKeyInfo.apiKey;
			hasRuntimeAuthExchange = Boolean(preparedAuth?.apiKey);
			if (!runtimeApiKey) throw new Error(`Provider "${runtimeModel.provider}" runtime auth returned no apiKey.`);
			authStorage.setRuntimeApiKey(runtimeModel.provider, runtimeApiKey);
		}
	} catch (err) {
		return fail(formatErrorMessage(err));
	}
	await fs.mkdir(resolvedWorkspace, { recursive: true });
	const sandboxSessionKey = params.sessionKey?.trim() || params.sessionId;
	const sandbox = await resolveSandboxContext({
		config: params.config,
		sessionKey: sandboxSessionKey,
		workspaceDir: resolvedWorkspace
	});
	const effectiveWorkspace = sandbox?.enabled ? sandbox.workspaceAccess === "rw" ? resolvedWorkspace : sandbox.workspaceDir : resolvedWorkspace;
	await fs.mkdir(effectiveWorkspace, { recursive: true });
	await ensureSessionHeader({
		sessionFile: params.sessionFile,
		sessionId: params.sessionId,
		cwd: effectiveWorkspace
	});
	const { sessionAgentId: effectiveSkillAgentId } = resolveSessionAgentIds({
		sessionKey: params.sessionKey,
		config: params.config
	});
	let restoreSkillEnv;
	let compactionSessionManager = null;
	let checkpointSnapshot = null;
	let checkpointSnapshotRetained = false;
	try {
		const { shouldLoadSkillEntries, skillEntries } = resolveEmbeddedRunSkillEntries({
			workspaceDir: effectiveWorkspace,
			config: params.config,
			agentId: effectiveSkillAgentId,
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
			agentId: effectiveSkillAgentId
		});
		const sessionLabel = params.sessionKey ?? params.sessionId;
		const resolvedMessageProvider = params.messageChannel ?? params.messageProvider;
		const { contextFiles } = await resolveBootstrapContextForRun({
			workspaceDir: effectiveWorkspace,
			config: params.config,
			sessionKey: params.sessionKey,
			sessionId: params.sessionId,
			warn: makeBootstrapWarn({
				sessionLabel,
				warn: (message) => log.warn(message)
			})
		});
		const runtimeModelWithContext = runtimeModel;
		const ctxInfo = resolveContextWindowInfo({
			cfg: params.config,
			provider,
			modelId,
			modelContextTokens: readPiModelContextTokens(runtimeModel),
			modelContextWindow: runtimeModelWithContext.contextWindow,
			defaultTokens: DEFAULT_CONTEXT_TOKENS
		});
		const effectiveModel = applyAuthHeaderOverride(applyLocalNoAuthHeaderOverride(ctxInfo.tokens < (runtimeModelWithContext.contextWindow ?? Infinity) ? {
			...runtimeModelWithContext,
			contextWindow: ctxInfo.tokens
		} : runtimeModelWithContext, apiKeyInfo), hasRuntimeAuthExchange ? null : apiKeyInfo, params.config);
		const runAbortController = new AbortController();
		const toolsRaw = createOpenClawCodingTools({
			exec: { elevated: params.bashElevated },
			sandbox,
			messageProvider: resolvedMessageProvider,
			agentAccountId: params.agentAccountId,
			sessionKey: sandboxSessionKey,
			sessionId: params.sessionId,
			runId: params.runId,
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
			agentDir,
			workspaceDir: effectiveWorkspace,
			config: params.config,
			abortSignal: runAbortController.signal,
			modelProvider: model.provider,
			modelId,
			modelCompat: effectiveModel.compat,
			modelApi: model.api,
			modelContextWindowTokens: ctxInfo.tokens,
			modelAuthMode: resolveModelAuthMode(model.provider, params.config)
		});
		const toolsEnabled = supportsModelTools(runtimeModel);
		const tools = normalizeProviderToolSchemas({
			tools: toolsEnabled ? toolsRaw : [],
			provider,
			config: params.config,
			workspaceDir: effectiveWorkspace,
			env: process.env,
			modelId,
			modelApi: model.api,
			model
		});
		const bundleMcpRuntime = toolsEnabled ? await createBundleMcpToolRuntime({
			workspaceDir: effectiveWorkspace,
			cfg: params.config,
			reservedToolNames: tools.map((tool) => tool.name)
		}) : void 0;
		const bundleLspRuntime = toolsEnabled ? await createBundleLspToolRuntime({
			workspaceDir: effectiveWorkspace,
			cfg: params.config,
			reservedToolNames: [...tools.map((tool) => tool.name), ...bundleMcpRuntime?.tools.map((tool) => tool.name) ?? []]
		}) : void 0;
		const effectiveTools = [
			...tools,
			...bundleMcpRuntime?.tools ?? [],
			...bundleLspRuntime?.tools ?? []
		];
		const allowedToolNames = collectAllowedToolNames({ tools: effectiveTools });
		logProviderToolSchemaDiagnostics({
			tools: effectiveTools,
			provider,
			config: params.config,
			workspaceDir: effectiveWorkspace,
			env: process.env,
			modelId,
			modelApi: model.api,
			model
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
		const { defaultAgentId, sessionAgentId } = resolveSessionAgentIds({
			sessionKey: params.sessionKey,
			config: params.config
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
		const runtimeInfo = {
			host: machineName,
			os: `${os.type()} ${os.release()}`,
			arch: os.arch(),
			node: process.version,
			model: `${provider}/${modelId}`,
			shell: detectRuntimeShell(),
			channel: runtimeChannel,
			capabilities: runtimeCapabilities,
			channelActions
		};
		const sandboxInfo = buildEmbeddedSandboxInfo(sandbox, params.bashElevated);
		const reasoningTagHint = isReasoningTagProvider(provider, {
			config: params.config,
			workspaceDir: effectiveWorkspace,
			env: process.env,
			modelId,
			modelApi: model.api,
			model
		});
		const userTimezone = resolveUserTimezone(params.config?.agents?.defaults?.userTimezone);
		const userTimeFormat = resolveUserTimeFormat(params.config?.agents?.defaults?.timeFormat);
		const userTime = formatUserTime(/* @__PURE__ */ new Date(), userTimezone, userTimeFormat);
		const promptMode = isSubagentSessionKey(params.sessionKey) || isCronSessionKey(params.sessionKey) ? "minimal" : "full";
		const docsPath = await resolveOpenClawDocsPath({
			workspaceDir: effectiveWorkspace,
			argv1: process.argv[1],
			cwd: effectiveWorkspace,
			moduleUrl: import.meta.url
		});
		const ttsHint = params.config ? buildTtsSystemPromptHint(params.config) : void 0;
		const ownerDisplay = resolveOwnerDisplaySetting(params.config);
		const promptContribution = resolveProviderSystemPromptContribution({
			provider,
			config: params.config,
			workspaceDir: effectiveWorkspace,
			context: {
				config: params.config,
				agentDir,
				workspaceDir: effectiveWorkspace,
				provider,
				modelId,
				promptMode,
				runtimeChannel,
				runtimeCapabilities,
				agentId: sessionAgentId
			}
		});
		const buildSystemPromptOverride = (defaultThinkLevel) => {
			const builtSystemPrompt = resolveSystemPromptOverride({
				config: params.config,
				agentId: sessionAgentId
			}) ?? buildEmbeddedSystemPrompt({
				workspaceDir: effectiveWorkspace,
				defaultThinkLevel,
				reasoningLevel: params.reasoningLevel ?? "off",
				extraSystemPrompt: params.extraSystemPrompt,
				ownerNumbers: params.ownerNumbers,
				ownerDisplay: ownerDisplay.ownerDisplay,
				ownerDisplaySecret: ownerDisplay.ownerDisplaySecret,
				reasoningTagHint,
				heartbeatPrompt: resolveHeartbeatPromptForSystemPrompt({
					config: params.config,
					agentId: sessionAgentId,
					defaultAgentId
				}),
				skillsPrompt,
				docsPath: docsPath ?? void 0,
				ttsHint,
				promptMode,
				acpEnabled: params.config?.acp?.enabled !== false,
				runtimeInfo,
				reactionGuidance,
				messageToolHints,
				sandboxInfo,
				tools: effectiveTools,
				modelAliasLines: buildModelAliasLines(params.config),
				userTimezone,
				userTime,
				userTimeFormat,
				contextFiles,
				memoryCitationsMode: params.config?.memory?.citations,
				promptContribution
			});
			return createSystemPromptOverride(transformProviderSystemPrompt({
				provider,
				config: params.config,
				workspaceDir: effectiveWorkspace,
				context: {
					config: params.config,
					agentDir,
					workspaceDir: effectiveWorkspace,
					provider,
					modelId,
					promptMode,
					runtimeChannel,
					runtimeCapabilities,
					agentId: sessionAgentId,
					systemPrompt: builtSystemPrompt
				}
			}));
		};
		const compactionTimeoutMs = resolveCompactionTimeoutMs(params.config);
		const sessionLock = await acquireSessionWriteLock({
			sessionFile: params.sessionFile,
			maxHoldMs: resolveSessionLockMaxHoldFromTimeout({ timeoutMs: compactionTimeoutMs })
		});
		try {
			await repairSessionFileIfNeeded({
				sessionFile: params.sessionFile,
				warn: (message) => log.warn(message)
			});
			await prewarmSessionFile(params.sessionFile);
			const transcriptPolicy = resolveTranscriptPolicy({
				modelApi: model.api,
				provider,
				modelId,
				config: params.config,
				workspaceDir: effectiveWorkspace,
				env: process.env,
				model
			});
			const sessionManager = guardSessionManager(SessionManager.open(params.sessionFile), {
				agentId: sessionAgentId,
				sessionKey: params.sessionKey,
				config: params.config,
				contextWindowTokens: ctxInfo.tokens,
				allowSyntheticToolResults: transcriptPolicy.allowSyntheticToolResults,
				allowedToolNames
			});
			checkpointSnapshot = captureCompactionCheckpointSnapshot({
				sessionManager,
				sessionFile: params.sessionFile
			});
			compactionSessionManager = sessionManager;
			trackSessionManagerAccess(params.sessionFile);
			const settingsManager = createPreparedEmbeddedPiSettingsManager({
				cwd: effectiveWorkspace,
				agentDir,
				cfg: params.config,
				contextTokenBudget: ctxInfo.tokens
			});
			const extensionFactories = buildEmbeddedExtensionFactories({
				cfg: params.config,
				sessionManager,
				provider,
				modelId,
				model
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
			const { builtInTools, customTools } = splitSdkTools({
				tools: effectiveTools,
				sandboxEnabled: !!sandbox?.enabled
			});
			const providerStreamFn = resolveCompactionProviderStream({
				effectiveModel,
				config: params.config,
				agentDir,
				effectiveWorkspace
			});
			const shouldUseWebSocketTransport = shouldUseOpenAIWebSocketTransport({
				provider,
				modelApi: effectiveModel.api
			});
			const wsApiKey = shouldUseWebSocketTransport ? await resolveEmbeddedAgentApiKey({
				provider,
				resolvedApiKey: hasRuntimeAuthExchange ? void 0 : apiKeyInfo?.apiKey,
				authStorage
			}) : void 0;
			if (shouldUseWebSocketTransport && !wsApiKey) log.warn(`[ws-stream] no API key for provider=${provider}; keeping compaction HTTP transport`);
			while (true) {
				attemptedThinking.add(thinkLevel);
				let session;
				try {
					session = (await createAgentSession({
						cwd: effectiveWorkspace,
						agentDir,
						authStorage,
						modelRegistry,
						model: effectiveModel,
						thinkingLevel: mapThinkingLevel(thinkLevel),
						tools: builtInTools,
						customTools,
						sessionManager,
						settingsManager,
						resourceLoader
					})).session;
					applySystemPromptOverrideToSession(session, buildSystemPromptOverride(thinkLevel)());
					prepareCompactionSessionAgent({
						session,
						providerStreamFn,
						shouldUseWebSocketTransport,
						wsApiKey,
						sessionId: params.sessionId,
						signal: runAbortController.signal,
						effectiveModel,
						resolvedApiKey: hasRuntimeAuthExchange ? void 0 : apiKeyInfo?.apiKey,
						authStorage,
						config: params.config,
						provider,
						modelId,
						thinkLevel,
						sessionAgentId,
						effectiveWorkspace,
						agentDir
					});
					const validated = await validateReplayTurns({
						messages: await sanitizeSessionHistory({
							messages: session.messages,
							modelApi: model.api,
							modelId,
							provider,
							allowedToolNames,
							config: params.config,
							workspaceDir: effectiveWorkspace,
							env: process.env,
							model,
							sessionManager,
							sessionId: params.sessionId,
							policy: transcriptPolicy
						}),
						modelApi: model.api,
						modelId,
						provider,
						config: params.config,
						workspaceDir: effectiveWorkspace,
						env: process.env,
						model,
						sessionId: params.sessionId,
						policy: transcriptPolicy
					});
					session.agent.state.messages = validated;
					const originalMessages = session.messages.slice();
					const truncated = limitHistoryTurns(session.messages, getDmHistoryLimitFromSessionKey(params.sessionKey, params.config));
					const limited = transcriptPolicy.repairToolUseResultPairing ? sanitizeToolUseResultPairing(truncated, { erroredAssistantResultPolicy: "drop" }) : truncated;
					if (limited.length > 0) session.agent.state.messages = limited;
					const hookRunner = asCompactionHookRunner(getGlobalHookRunner());
					const observedTokenCount = normalizeObservedTokenCount(params.currentTokenCount);
					const beforeHookMetrics = buildBeforeCompactionHookMetrics({
						originalMessages,
						currentMessages: session.messages,
						observedTokenCount,
						estimateTokensFn: estimateTokens
					});
					const { hookSessionKey, missingSessionKey } = await runBeforeCompactionHooks({
						hookRunner,
						sessionId: params.sessionId,
						sessionKey: params.sessionKey,
						sessionAgentId,
						workspaceDir: effectiveWorkspace,
						messageProvider: resolvedMessageProvider,
						metrics: beforeHookMetrics
					});
					const { messageCountOriginal } = beforeHookMetrics;
					const diagEnabled = log.isEnabled("debug");
					const preMetrics = diagEnabled ? summarizeCompactionMessages(session.messages) : void 0;
					if (diagEnabled && preMetrics) {
						log.debug(`[compaction-diag] start runId=${runId} sessionKey=${params.sessionKey ?? params.sessionId} diagId=${diagId} trigger=${trigger} provider=${provider}/${modelId} attempt=${attempt} maxAttempts=${maxAttempts} pre.messages=${preMetrics.messages} pre.historyTextChars=${preMetrics.historyTextChars} pre.toolResultChars=${preMetrics.toolResultChars} pre.estTokens=${preMetrics.estTokens ?? "unknown"}`);
						log.debug(`[compaction-diag] contributors diagId=${diagId} top=${JSON.stringify(preMetrics.contributors)}`);
					}
					if (!containsRealConversationMessages(session.messages)) {
						log.info(`[compaction] skipping — no real conversation messages (sessionKey=${params.sessionKey ?? params.sessionId})`);
						return {
							ok: true,
							compacted: false,
							reason: "no real conversation messages"
						};
					}
					const compactStartedAt = Date.now();
					const messageCountCompactionInput = messageCountOriginal;
					let fullSessionTokensBefore = 0;
					try {
						fullSessionTokensBefore = limited.reduce((sum, msg) => sum + estimateTokens(msg), 0);
					} catch {}
					const activeSession = session;
					const result = await compactWithSafetyTimeout(() => {
						setCompactionSafeguardCancelReason(compactionSessionManager, void 0);
						return activeSession.compact(params.customInstructions);
					}, compactionTimeoutMs, {
						abortSignal: params.abortSignal,
						onCancel: () => {
							activeSession.abortCompaction();
						}
					});
					await runPostCompactionSideEffects({
						config: params.config,
						sessionKey: params.sessionKey,
						sessionFile: params.sessionFile
					});
					let effectiveFirstKeptEntryId = result.firstKeptEntryId;
					let postCompactionLeafId = typeof sessionManager.getLeafId === "function" ? sessionManager.getLeafId() ?? void 0 : void 0;
					if (params.trigger === "manual") try {
						const hardenedBoundary = await hardenManualCompactionBoundary({ sessionFile: params.sessionFile });
						if (hardenedBoundary.applied) {
							effectiveFirstKeptEntryId = hardenedBoundary.firstKeptEntryId ?? effectiveFirstKeptEntryId;
							postCompactionLeafId = hardenedBoundary.leafId ?? postCompactionLeafId;
							session.agent.state.messages = hardenedBoundary.messages;
						}
					} catch (err) {
						log.warn("[compaction] failed to harden manual compaction boundary", { errorMessage: formatErrorMessage(err) });
					}
					const tokensAfter = estimateTokensAfterCompaction({
						messagesAfter: session.messages,
						observedTokenCount,
						fullSessionTokensBefore,
						estimateTokensFn: estimateTokens
					});
					const messageCountAfter = session.messages.length;
					const compactedCount = Math.max(0, messageCountCompactionInput - messageCountAfter);
					if (params.config && params.sessionKey && checkpointSnapshot) try {
						checkpointSnapshotRetained = await persistSessionCompactionCheckpoint({
							cfg: params.config,
							sessionKey: params.sessionKey,
							sessionId: params.sessionId,
							reason: resolveSessionCompactionCheckpointReason({ trigger: params.trigger }),
							snapshot: checkpointSnapshot,
							summary: result.summary,
							firstKeptEntryId: effectiveFirstKeptEntryId,
							tokensBefore: observedTokenCount ?? result.tokensBefore,
							tokensAfter,
							postSessionFile: params.sessionFile,
							postLeafId: postCompactionLeafId,
							postEntryId: postCompactionLeafId,
							createdAt: compactStartedAt
						}) !== null;
					} catch (err) {
						log.warn("failed to persist compaction checkpoint", { errorMessage: formatErrorMessage(err) });
					}
					const postMetrics = diagEnabled ? summarizeCompactionMessages(session.messages) : void 0;
					if (diagEnabled && preMetrics && postMetrics) log.debug(`[compaction-diag] end runId=${runId} sessionKey=${params.sessionKey ?? params.sessionId} diagId=${diagId} trigger=${trigger} provider=${provider}/${modelId} attempt=${attempt} maxAttempts=${maxAttempts} outcome=compacted reason=none durationMs=${Date.now() - compactStartedAt} retrying=false post.messages=${postMetrics.messages} post.historyTextChars=${postMetrics.historyTextChars} post.toolResultChars=${postMetrics.toolResultChars} post.estTokens=${postMetrics.estTokens ?? "unknown"} delta.messages=${postMetrics.messages - preMetrics.messages} delta.historyTextChars=${postMetrics.historyTextChars - preMetrics.historyTextChars} delta.toolResultChars=${postMetrics.toolResultChars - preMetrics.toolResultChars} delta.estTokens=${typeof preMetrics.estTokens === "number" && typeof postMetrics.estTokens === "number" ? postMetrics.estTokens - preMetrics.estTokens : "unknown"}`);
					await runAfterCompactionHooks({
						hookRunner,
						sessionId: params.sessionId,
						sessionAgentId,
						hookSessionKey,
						missingSessionKey,
						workspaceDir: effectiveWorkspace,
						messageProvider: resolvedMessageProvider,
						messageCountAfter,
						tokensAfter,
						compactedCount,
						sessionFile: params.sessionFile,
						summaryLength: typeof result.summary === "string" ? result.summary.length : void 0,
						tokensBefore: result.tokensBefore,
						firstKeptEntryId: effectiveFirstKeptEntryId
					});
					if (params.config?.agents?.defaults?.compaction?.truncateAfterCompaction) try {
						const heartbeatSummary = resolveHeartbeatSummaryForAgent(params.config, sessionAgentId);
						const truncResult = await truncateSessionAfterCompaction({
							sessionFile: params.sessionFile,
							ackMaxChars: heartbeatSummary.ackMaxChars,
							heartbeatPrompt: heartbeatSummary.prompt
						});
						if (truncResult.truncated) log.info(`[compaction] post-compaction truncation removed ${truncResult.entriesRemoved} entries (sessionKey=${params.sessionKey ?? params.sessionId})`);
					} catch (err) {
						log.warn("[compaction] post-compaction truncation failed", {
							errorMessage: formatErrorMessage(err),
							errorStack: err instanceof Error ? err.stack : void 0
						});
					}
					return {
						ok: true,
						compacted: true,
						result: {
							summary: result.summary,
							firstKeptEntryId: effectiveFirstKeptEntryId,
							tokensBefore: observedTokenCount ?? result.tokensBefore,
							tokensAfter,
							details: result.details
						}
					};
				} catch (err) {
					const fallbackThinking = pickFallbackThinkingLevel({
						message: formatErrorMessage(err),
						attempted: attemptedThinking
					});
					if (fallbackThinking) {
						log.warn(`[compaction] request rejected for ${provider}/${modelId}; retrying with ${fallbackThinking}`);
						thinkLevel = fallbackThinking;
						continue;
					}
					throw err;
				} finally {
					try {
						await flushPendingToolResultsAfterIdle({
							agent: session?.agent,
							sessionManager,
							clearPendingOnTimeout: true
						});
					} catch {}
					try {
						session?.dispose();
					} catch {}
				}
			}
		} finally {
			try {
				await bundleMcpRuntime?.dispose();
			} catch {}
			try {
				await bundleLspRuntime?.dispose();
			} catch {}
			await sessionLock.release();
		}
	} catch (err) {
		return fail(resolveCompactionFailureReason({
			reason: formatErrorMessage(err),
			safeguardCancelReason: consumeCompactionSafeguardCancelReason(compactionSessionManager)
		}));
	} finally {
		if (!checkpointSnapshotRetained) await cleanupCompactionCheckpointSnapshot(checkpointSnapshot);
		restoreSkillEnv?.();
	}
}
const __testing = {
	hasRealConversationContent,
	hasMeaningfulConversationContent,
	containsRealConversationMessages,
	estimateTokensAfterCompaction,
	buildBeforeCompactionHookMetrics,
	hardenManualCompactionBoundary,
	resolveCompactionProviderStream,
	prepareCompactionSessionAgent,
	runBeforeCompactionHooks,
	runAfterCompactionHooks,
	runPostCompactionSideEffects
};
//#endregion
export { __testing, compactEmbeddedPiSessionDirect, runPostCompactionSideEffects };
