import { s as normalizeOptionalLowercaseString } from "./string-coerce-Bje8XVt9.js";
import { S as resolveDefaultAgentId, b as resolveAgentDir, p as resolveSessionAgentId, s as resolveAgentModelFallbacksOverride, v as resolveAgentConfig } from "./agent-scope-i10se9ty.js";
import { i as toAgentModelListLike } from "./model-input-Bac2nsYA.js";
import { i as selectAgentHarness } from "./selection-D9uTvvsw.js";
import { c as resolveMainSessionAlias, s as resolveInternalSessionKey } from "./sessions-helpers-Dpv8k6Hg.js";
import { n as formatTaskStatusDetail, r as formatTaskStatusTitle, t as buildTaskStatusSnapshot } from "./task-status-B_agTNy0.js";
import { d as listTasksForAgentId, h as listTasksForSessionKey } from "./task-registry-y5PQSAS1.js";
import { t as normalizeGroupActivation } from "./group-activation-CCArcZ5m.js";
import { t as resolveFastModeState } from "./fast-mode-_3gtSJl4.js";
import { t as resolveModelAuthLabel } from "./model-auth-label-DYfm3kfZ.js";
import { o as resolveUsageProviderId } from "./provider-usage.shared-DbAk3IUd.js";
import { n as resolveSelectedAndActiveModel } from "./model-runtime-BkeajivL.js";
import { i as formatUsageWindowSummary, t as loadProviderUsageSummary } from "./provider-usage-C86sU_2t.js";
//#region src/tasks/task-status-access.ts
function listTasksForSessionKeyForStatus(sessionKey) {
	return listTasksForSessionKey(sessionKey);
}
function listTasksForAgentIdForStatus(agentId) {
	return listTasksForAgentId(agentId);
}
//#endregion
//#region src/status/status-text.ts
const USAGE_OAUTH_ONLY_PROVIDERS = new Set([
	"anthropic",
	"github-copilot",
	"google-gemini-cli",
	"openai-codex"
]);
let statusMessageRuntimePromise = null;
let statusQueueRuntimePromise = null;
let statusSubagentsRuntimePromise = null;
function loadStatusMessageRuntime() {
	return statusMessageRuntimePromise ??= import("./status-message.runtime-BfyCh7RX.js").then((module) => module.loadStatusMessageRuntimeModule());
}
function loadStatusSubagentsRuntime() {
	return statusSubagentsRuntimePromise ??= import("./status-subagents.runtime-Bhivijo6.js");
}
function loadStatusQueueRuntime() {
	return statusQueueRuntimePromise ??= import("./status-queue.runtime-BQDufDp_.js");
}
function shouldLoadUsageSummary(params) {
	if (!params.provider) return false;
	if (!USAGE_OAUTH_ONLY_PROVIDERS.has(params.provider)) return true;
	const auth = normalizeOptionalLowercaseString(params.selectedModelAuth);
	return Boolean(auth?.startsWith("oauth") || auth?.startsWith("token"));
}
function formatSessionTaskLine(sessionKey) {
	const snapshot = buildTaskStatusSnapshot(listTasksForSessionKeyForStatus(sessionKey));
	const task = snapshot.focus;
	if (!task) return;
	const headline = snapshot.activeCount > 0 ? `${snapshot.activeCount} active · ${snapshot.totalCount} total` : snapshot.recentFailureCount > 0 ? `${snapshot.recentFailureCount} recent failure${snapshot.recentFailureCount === 1 ? "" : "s"}` : "recently finished";
	const title = formatTaskStatusTitle(task);
	const detail = formatTaskStatusDetail(task);
	const parts = [
		headline,
		task.runtime,
		title,
		detail
	].filter(Boolean);
	return parts.length ? `📌 Tasks: ${parts.join(" · ")}` : void 0;
}
function resolveStatusHarnessId(params) {
	try {
		const id = normalizeOptionalLowercaseString(selectAgentHarness({
			provider: params.provider,
			modelId: params.model,
			config: params.cfg,
			agentId: params.agentId,
			sessionKey: params.sessionKey,
			agentHarnessId: params.sessionEntry?.agentHarnessId
		}).id);
		return id && id !== "pi" ? id : void 0;
	} catch {
		return;
	}
}
function formatAgentTaskCountsLine(agentId) {
	const snapshot = buildTaskStatusSnapshot(listTasksForAgentIdForStatus(agentId));
	if (snapshot.totalCount === 0) return;
	return `📌 Tasks: ${snapshot.activeCount} active · ${snapshot.totalCount} total · agent-local`;
}
async function buildStatusText(params) {
	const { cfg, sessionEntry, sessionKey, parentSessionKey, sessionScope, storePath, statusChannel, provider, model, contextTokens, resolvedThinkLevel, resolvedFastMode, resolvedVerboseLevel, resolvedReasoningLevel, resolvedElevatedLevel, resolveDefaultThinkingLevel, isGroup, defaultGroupActivation } = params;
	const statusAgentId = sessionKey ? resolveSessionAgentId({
		sessionKey,
		config: cfg
	}) : resolveDefaultAgentId(cfg);
	const statusAgentDir = resolveAgentDir(cfg, statusAgentId);
	const modelRefs = resolveSelectedAndActiveModel({
		selectedProvider: provider,
		selectedModel: model,
		sessionEntry
	});
	const selectedModelAuth = Object.hasOwn(params, "modelAuthOverride") ? params.modelAuthOverride : resolveModelAuthLabel({
		provider,
		cfg,
		sessionEntry,
		agentDir: statusAgentDir,
		includeExternalProfiles: false
	});
	const activeModelAuth = Object.hasOwn(params, "activeModelAuthOverride") ? params.activeModelAuthOverride : modelRefs.activeDiffers ? resolveModelAuthLabel({
		provider: modelRefs.active.provider,
		cfg,
		sessionEntry,
		agentDir: statusAgentDir,
		includeExternalProfiles: false
	}) : selectedModelAuth;
	const currentUsageProvider = (() => {
		try {
			return resolveUsageProviderId(provider);
		} catch {
			return;
		}
	})();
	let usageLine = null;
	if (currentUsageProvider && shouldLoadUsageSummary({
		provider: currentUsageProvider,
		selectedModelAuth
	})) try {
		const usageSummaryTimeoutMs = 3500;
		let usageTimeout;
		const usageEntry = (await Promise.race([loadProviderUsageSummary({
			timeoutMs: usageSummaryTimeoutMs,
			providers: [currentUsageProvider],
			agentDir: statusAgentDir
		}), new Promise((_, reject) => {
			usageTimeout = setTimeout(() => reject(/* @__PURE__ */ new Error("usage summary timeout")), usageSummaryTimeoutMs);
		})]).finally(() => {
			if (usageTimeout) clearTimeout(usageTimeout);
		})).providers[0];
		if (usageEntry && !usageEntry.error && usageEntry.windows.length > 0) {
			const summaryLine = formatUsageWindowSummary(usageEntry, {
				now: Date.now(),
				maxWindows: 2,
				includeResets: true
			});
			if (summaryLine) usageLine = `📊 Usage: ${summaryLine}`;
		}
	} catch {
		usageLine = null;
	}
	const { getFollowupQueueDepth, resolveQueueSettings } = await loadStatusQueueRuntime();
	const queueSettings = resolveQueueSettings({
		cfg,
		channel: statusChannel,
		sessionEntry
	});
	const queueKey = sessionKey ?? sessionEntry?.sessionId;
	const queueDepth = queueKey ? getFollowupQueueDepth(queueKey) : 0;
	const queueOverrides = Boolean(sessionEntry?.queueDebounceMs ?? sessionEntry?.queueCap ?? sessionEntry?.queueDrop);
	let subagentsLine;
	let taskLine;
	if (sessionKey) {
		const { mainKey, alias } = resolveMainSessionAlias(cfg);
		const requesterKey = resolveInternalSessionKey({
			key: sessionKey,
			alias,
			mainKey
		});
		taskLine = params.skipDefaultTaskLookup ? params.taskLineOverride : params.taskLineOverride ?? formatSessionTaskLine(requesterKey);
		if (!taskLine && !params.skipDefaultTaskLookup) taskLine = formatAgentTaskCountsLine(statusAgentId);
		const { buildSubagentsStatusLine, countPendingDescendantRuns, listControlledSubagentRuns } = await loadStatusSubagentsRuntime();
		subagentsLine = buildSubagentsStatusLine({
			runs: listControlledSubagentRuns(requesterKey),
			verboseEnabled: resolvedVerboseLevel && resolvedVerboseLevel !== "off",
			pendingDescendantsForRun: (entry) => countPendingDescendantRuns(entry.childSessionKey)
		});
	}
	const groupActivation = isGroup ? normalizeGroupActivation(sessionEntry?.groupActivation) ?? defaultGroupActivation() : void 0;
	const agentDefaults = cfg.agents?.defaults ?? {};
	const agentConfig = resolveAgentConfig(cfg, statusAgentId);
	const effectiveFastMode = resolvedFastMode ?? resolveFastModeState({
		cfg,
		provider,
		model,
		agentId: statusAgentId,
		sessionEntry
	}).enabled;
	const effectiveHarness = params.resolvedHarness ?? resolveStatusHarnessId({
		cfg,
		provider,
		model,
		agentId: statusAgentId,
		sessionKey,
		sessionEntry
	});
	const agentFallbacksOverride = resolveAgentModelFallbacksOverride(cfg, statusAgentId);
	const { buildStatusMessage } = await loadStatusMessageRuntime();
	const explicitThinkingDefault = agentConfig?.thinkingDefault ?? agentDefaults.thinkingDefault;
	return buildStatusMessage({
		config: cfg,
		agent: {
			...agentDefaults,
			model: {
				...toAgentModelListLike(agentDefaults.model),
				primary: params.primaryModelLabelOverride ?? `${provider}/${model}`,
				...agentFallbacksOverride === void 0 ? {} : { fallbacks: agentFallbacksOverride }
			},
			...typeof contextTokens === "number" && contextTokens > 0 ? { contextTokens } : {},
			thinkingDefault: explicitThinkingDefault,
			verboseDefault: agentDefaults.verboseDefault,
			elevatedDefault: agentDefaults.elevatedDefault
		},
		agentId: statusAgentId,
		explicitConfiguredContextTokens: typeof agentDefaults.contextTokens === "number" && agentDefaults.contextTokens > 0 ? agentDefaults.contextTokens : void 0,
		sessionEntry,
		sessionKey,
		parentSessionKey,
		sessionScope,
		sessionStorePath: storePath,
		groupActivation,
		resolvedThink: resolvedThinkLevel ?? explicitThinkingDefault ?? await resolveDefaultThinkingLevel(),
		resolvedFast: effectiveFastMode,
		resolvedHarness: effectiveHarness,
		resolvedVerbose: resolvedVerboseLevel,
		resolvedReasoning: resolvedReasoningLevel,
		resolvedElevated: resolvedElevatedLevel,
		modelAuth: selectedModelAuth,
		activeModelAuth,
		usageLine: usageLine ?? void 0,
		queue: {
			mode: queueSettings.mode,
			depth: queueDepth,
			debounceMs: queueSettings.debounceMs,
			cap: queueSettings.cap,
			dropPolicy: queueSettings.dropPolicy,
			showDetails: queueOverrides
		},
		subagentsLine,
		taskLine,
		mediaDecisions: params.mediaDecisions,
		includeTranscriptUsage: params.includeTranscriptUsage ?? true
	});
}
//#endregion
export { listTasksForAgentIdForStatus as n, listTasksForSessionKeyForStatus as r, buildStatusText as t };
