import { i as formatErrorMessage } from "./errors-Jbvi20TW.js";
import { a as normalizeLowercaseStringOrEmpty, c as normalizeOptionalString, f as readStringValue, s as normalizeOptionalLowercaseString } from "./string-coerce-C1IzJjqi.js";
import { b as truncateUtf16Safe, g as shortenHomeInString } from "./utils-BMRcljdi.js";
import { i as freezeDiagnosticTraceContext } from "./diagnostic-trace-context-D6vXBN1-.js";
import { i as normalizeChannelId, t as getChannelPlugin } from "./registry-B2TRwbJD.js";
import "./plugins-BZ_I3cWH.js";
import { n as sleepWithAbort } from "./backoff-BLL15JmM.js";
import { i as enqueueCommandInLane, o as getQueueSize } from "./command-queue-B716cKY1.js";
import { p as normalizeToolName } from "./tool-policy-DArLXMH2.js";
import { t as log } from "./logger-Cq8_pd8S.js";
import { r as splitMediaFromOutput } from "./parse-sRKDduJ4.js";
import { r as resolveToolDisplay } from "./tool-display-DahNA8kW.js";
import { a as normalizeTargetForProvider } from "./target-normalization-BK-i3Qz5.js";
import { t as pluginRegistrationContractRegistry } from "./registry-ppbCjCWg.js";
import { t as collectTextContentBlocks } from "./content-blocks-yDpFZ6IX.js";
import { d as findActiveSessionTask } from "./video-generation-task-status-Dzob1Tqm.js";
import { a as recordTaskRunProgressByRunId, i as failTaskRunByRunId, n as createQueuedTaskRun, o as setDetachedTaskDeliveryStatusByRunId, s as startTaskRunByRunId, t as completeTaskRunByRunId } from "./detached-task-runtime-D2eWnRin.js";
import { r as resolveSessionLane } from "./lanes-foeF2E4h.js";
import { c as updateTaskNotifyPolicyForOwner, i as findTaskByRunIdForOwner, n as cancelTaskByIdForOwner } from "./task-owner-access-CN9Sdqx6.js";
import { n as rewriteTranscriptEntriesInSessionManager, t as rewriteTranscriptEntriesInSessionFile } from "./transcript-rewrite-DEfbMkgI.js";
import { n as buildAfterTurnRuntimeContextFromUsage, t as buildAfterTurnRuntimeContext } from "./attempt.prompt-helpers-BGzsB6M9.js";
import { randomUUID } from "node:crypto";
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
	const delimiter = "`".repeat(longestBacktickRun(value) + 1);
	const padding = value.startsWith("`") || value.endsWith("`") || value.includes("\n") ? " " : "";
	return `${delimiter}${padding}${value}${padding}${delimiter}`;
}
function longestBacktickRun(value) {
	let longest = 0;
	let current = 0;
	for (const char of value) {
		if (char === "`") {
			current += 1;
			longest = Math.max(longest, current);
			continue;
		}
		current = 0;
	}
	return longest;
}
//#endregion
//#region src/agents/pi-embedded-messaging.ts
const CORE_MESSAGING_TOOLS = new Set(["sessions_send", "message"]);
function isMessagingTool(toolName) {
	if (CORE_MESSAGING_TOOLS.has(toolName)) return true;
	const providerId = normalizeChannelId(toolName);
	return Boolean(providerId && getChannelPlugin(providerId)?.actions);
}
function isMessagingToolSendAction(toolName, args) {
	const action = normalizeOptionalString(args.action) ?? "";
	if (toolName === "sessions_send") return true;
	if (toolName === "message") return action === "send" || action === "thread-reply";
	const providerId = normalizeChannelId(toolName);
	if (!providerId) return false;
	const plugin = getChannelPlugin(providerId);
	if (!plugin?.actions?.extractToolSend) return false;
	return Boolean(plugin.actions.extractToolSend({ args })?.to);
}
//#endregion
//#region src/agents/pi-embedded-subscribe.tools.ts
const TOOL_RESULT_MAX_CHARS = 8e3;
const TOOL_ERROR_MAX_CHARS = 400;
function truncateToolText(text) {
	if (text.length <= TOOL_RESULT_MAX_CHARS) return text;
	return `${truncateUtf16Safe(text, TOOL_RESULT_MAX_CHARS)}\n…(truncated)…`;
}
function normalizeToolErrorText(text) {
	const trimmed = text.trim();
	if (!trimmed) return;
	const firstLine = trimmed.split(/\r?\n/)[0]?.trim() ?? "";
	if (!firstLine) return;
	return firstLine.length > TOOL_ERROR_MAX_CHARS ? `${truncateUtf16Safe(firstLine, TOOL_ERROR_MAX_CHARS)}…` : firstLine;
}
function isErrorLikeStatus(status) {
	const normalized = normalizeOptionalLowercaseString(status);
	if (!normalized) return false;
	if (normalized === "0" || normalized === "ok" || normalized === "success" || normalized === "completed" || normalized === "running") return false;
	return /error|fail|timeout|timed[_\s-]?out|denied|cancel|invalid|forbidden/.test(normalized);
}
function readErrorCandidate(value) {
	if (typeof value === "string") return normalizeToolErrorText(value);
	if (!value || typeof value !== "object") return;
	const record = value;
	if (typeof record.message === "string") return normalizeToolErrorText(record.message);
	if (typeof record.error === "string") return normalizeToolErrorText(record.error);
}
function extractErrorField(value) {
	if (!value || typeof value !== "object") return;
	const record = value;
	const direct = readErrorCandidate(record.error) ?? readErrorCandidate(record.message) ?? readErrorCandidate(record.reason);
	if (direct) return direct;
	const status = normalizeOptionalString(record.status) ?? "";
	if (!status || !isErrorLikeStatus(status)) return;
	return normalizeToolErrorText(status);
}
function sanitizeToolResult(result) {
	if (!result || typeof result !== "object") return result;
	const record = result;
	const content = Array.isArray(record.content) ? record.content : null;
	if (!content) return record;
	const sanitized = content.map((item) => {
		if (!item || typeof item !== "object") return item;
		const entry = item;
		const type = readStringValue(entry.type);
		if (type === "text" && typeof entry.text === "string") return Object.assign({}, entry, { text: truncateToolText(entry.text) });
		if (type === "image") {
			const data = readStringValue(entry.data);
			const bytes = data ? data.length : void 0;
			const cleaned = { ...entry };
			delete cleaned.data;
			return Object.assign({}, cleaned, {
				bytes,
				omitted: true
			});
		}
		return entry;
	});
	return {
		...record,
		content: sanitized
	};
}
function extractToolResultText(result) {
	if (!result || typeof result !== "object") return;
	const texts = collectTextContentBlocks(result.content).map((item) => {
		const trimmed = item.trim();
		return trimmed ? trimmed : void 0;
	}).filter((value) => Boolean(value));
	if (texts.length === 0) return;
	return texts.join("\n");
}
const TRUSTED_TOOL_RESULT_MEDIA = new Set([
	"agents_list",
	"apply_patch",
	"browser",
	"canvas",
	"cron",
	"edit",
	"exec",
	"gateway",
	"image",
	"image_generate",
	"memory_get",
	"memory_search",
	"message",
	"music_generate",
	"nodes",
	"process",
	"read",
	"session_status",
	"sessions_history",
	"sessions_list",
	"sessions_send",
	"sessions_spawn",
	"subagents",
	"tts",
	"video_generate",
	"web_fetch",
	"web_search",
	"x_search",
	"write"
]);
const TRUSTED_BUNDLED_PLUGIN_MEDIA_TOOLS = new Set(pluginRegistrationContractRegistry.flatMap((entry) => entry.toolNames));
const HTTP_URL_RE = /^https?:\/\//i;
function readToolResultDetails(result) {
	if (!result || typeof result !== "object") return;
	const record = result;
	return record.details && typeof record.details === "object" && !Array.isArray(record.details) ? record.details : void 0;
}
function readToolResultStatus(result) {
	const status = readToolResultDetails(result)?.status;
	return normalizeOptionalLowercaseString(status);
}
function isExternalToolResult(result) {
	const details = readToolResultDetails(result);
	if (!details) return false;
	return typeof details.mcpServer === "string" || typeof details.mcpTool === "string";
}
function isToolResultMediaTrusted(toolName, result) {
	if (!toolName || isExternalToolResult(result)) return false;
	const normalized = normalizeToolName(toolName);
	return TRUSTED_TOOL_RESULT_MEDIA.has(normalized) || TRUSTED_BUNDLED_PLUGIN_MEDIA_TOOLS.has(normalized);
}
function filterToolResultMediaUrls(toolName, mediaUrls, result, builtinToolNames) {
	if (mediaUrls.length === 0) return mediaUrls;
	if (isToolResultMediaTrusted(toolName, result)) {
		if (builtinToolNames !== void 0) {
			const registeredName = toolName?.trim();
			if (!registeredName || !builtinToolNames.has(registeredName)) return mediaUrls.filter((url) => HTTP_URL_RE.test(url.trim()));
		}
		return mediaUrls;
	}
	return mediaUrls.filter((url) => HTTP_URL_RE.test(url.trim()));
}
function readToolResultDetailsMedia(result) {
	const details = readToolResultDetails(result);
	return details?.media && typeof details.media === "object" && !Array.isArray(details.media) ? details.media : void 0;
}
function collectStructuredMediaUrls(media) {
	const urls = [];
	if (typeof media.mediaUrl === "string" && media.mediaUrl.trim()) urls.push(media.mediaUrl.trim());
	if (Array.isArray(media.mediaUrls)) urls.push(...media.mediaUrls.filter((value) => typeof value === "string").map((value) => value.trim()).filter(Boolean));
	return Array.from(new Set(urls));
}
function extractToolResultMediaArtifact(result) {
	if (!result || typeof result !== "object") return;
	const record = result;
	const detailsMedia = readToolResultDetailsMedia(record);
	if (detailsMedia) {
		const mediaUrls = collectStructuredMediaUrls(detailsMedia);
		if (mediaUrls.length > 0) return {
			mediaUrls,
			...detailsMedia.audioAsVoice === true ? { audioAsVoice: true } : {},
			...detailsMedia.trustedLocalMedia === true ? { trustedLocalMedia: true } : {}
		};
	}
	const content = Array.isArray(record.content) ? record.content : null;
	if (!content) return;
	const paths = [];
	let hasImageContent = false;
	for (const item of content) {
		if (!item || typeof item !== "object") continue;
		const entry = item;
		if (entry.type === "image") {
			hasImageContent = true;
			continue;
		}
		if (entry.type === "text" && typeof entry.text === "string") {
			const parsed = splitMediaFromOutput(entry.text);
			if (parsed.mediaUrls?.length) paths.push(...parsed.mediaUrls);
		}
	}
	if (paths.length > 0) return { mediaUrls: paths };
	if (hasImageContent) {
		const details = record.details;
		const p = normalizeOptionalString(details?.path) ?? "";
		if (p) return { mediaUrls: [p] };
	}
}
function isToolResultError(result) {
	const normalized = readToolResultStatus(result);
	if (!normalized) return false;
	return normalized === "error" || normalized === "timeout";
}
function isToolResultTimedOut(result) {
	if (readToolResultStatus(result) === "timeout") return true;
	return readToolResultDetails(result)?.timedOut === true;
}
function extractToolErrorMessage(result) {
	if (!result || typeof result !== "object") return;
	const record = result;
	const fromDetails = extractErrorField(record.details);
	if (fromDetails) return fromDetails;
	const fromRoot = extractErrorField(record);
	if (fromRoot) return fromRoot;
	const text = extractToolResultText(result);
	if (!text) return;
	try {
		const fromJson = extractErrorField(JSON.parse(text));
		if (fromJson) return fromJson;
	} catch {}
	return normalizeToolErrorText(text);
}
function resolveMessageToolTarget(args) {
	const toRaw = readStringValue(args.to);
	if (toRaw) return toRaw;
	return readStringValue(args.target);
}
function extractMessagingToolSend(toolName, args) {
	const action = normalizeOptionalString(args.action) ?? "";
	const accountId = normalizeOptionalString(args.accountId);
	if (toolName === "message") {
		if (action !== "send" && action !== "thread-reply") return;
		const toRaw = resolveMessageToolTarget(args);
		if (!toRaw) return;
		const providerRaw = normalizeOptionalString(args.provider) ?? "";
		const channelRaw = normalizeOptionalString(args.channel) ?? "";
		const providerHint = providerRaw || channelRaw;
		const provider = (providerHint ? normalizeChannelId(providerHint) : null) ?? normalizeOptionalLowercaseString(providerHint) ?? "message";
		const to = normalizeTargetForProvider(provider, toRaw);
		return to ? {
			tool: toolName,
			provider,
			accountId,
			to
		} : void 0;
	}
	const providerId = normalizeChannelId(toolName);
	if (!providerId) return;
	const extracted = getChannelPlugin(providerId)?.actions?.extractToolSend?.({ args });
	if (!extracted?.to) return;
	const to = normalizeTargetForProvider(providerId, extracted.to);
	return to ? {
		tool: toolName,
		provider: providerId,
		accountId: extracted.accountId ?? accountId,
		to
	} : void 0;
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
	log.warn(`failed to schedule deferred context engine maintenance: ${errorMessage}`);
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
	if (result.changed) log.info(`[context-engine] maintenance(${params.reason}) changed transcript rewrittenEntries=${result.rewrittenEntries} bytesFreed=${result.bytesFreed} sessionKey=${params.sessionKey ?? params.sessionId ?? "unknown"}`);
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
				log.warn(`failed to surface deferred maintenance progress: ${String(error)}`);
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
		log.warn(`deferred context engine maintenance failed: ${reason}`);
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
	log.info(`[context-engine] deferred turn maintenance ${reusableTask ? "resuming" : "queued"} taskId=${task.taskId} sessionKey=${sessionKey} lane=${resolveDeferredTurnMaintenanceLane(sessionKey)}`);
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
			log.warn(`failed to schedule deferred context engine maintenance: ${String(err)}`);
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
		log.warn(`context engine maintain failed (${params.reason}): ${String(err)}`);
		return;
	}
}
//#endregion
//#region src/agents/harness/context-engine-lifecycle.ts
/**
* Run optional bootstrap + bootstrap maintenance for a harness-owned context engine.
*/
async function bootstrapHarnessContextEngine(params) {
	if (!params.hadSessionFile || !(params.contextEngine?.bootstrap || params.contextEngine?.maintain)) return;
	try {
		if (typeof params.contextEngine?.bootstrap === "function") await params.contextEngine.bootstrap({
			sessionId: params.sessionId,
			sessionKey: params.sessionKey,
			sessionFile: params.sessionFile
		});
		await (params.runMaintenance ?? runHarnessContextEngineMaintenance)({
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
/**
* Assemble model context through the active harness-owned context engine.
*/
async function assembleHarnessContextEngine(params) {
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
/**
* Finalize a completed harness turn via afterTurn or ingest fallbacks.
*/
async function finalizeHarnessContextEngineTurn(params) {
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
	if (!params.promptError && !params.aborted && !params.yieldAborted && postTurnFinalizationSucceeded) await (params.runMaintenance ?? runHarnessContextEngineMaintenance)({
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
/**
* Build runtime context passed into harness context-engine hooks.
*/
function buildHarnessContextEngineRuntimeContext(params) {
	return buildAfterTurnRuntimeContext(params);
}
/**
* Build runtime context passed into harness context-engine hooks from usage data.
*/
function buildHarnessContextEngineRuntimeContextFromUsage(params) {
	return buildAfterTurnRuntimeContextFromUsage(params);
}
/**
* Run optional transcript maintenance for a harness-owned context engine.
*/
async function runHarnessContextEngineMaintenance(params) {
	return await runContextEngineMaintenance({
		contextEngine: params.contextEngine,
		sessionId: params.sessionId,
		sessionKey: params.sessionKey,
		sessionFile: params.sessionFile,
		reason: params.reason,
		sessionManager: params.sessionManager,
		runtimeContext: params.runtimeContext,
		executionMode: params.executionMode
	});
}
/**
* Return true when a non-legacy context engine should affect plugin harness behavior.
*/
function isActiveHarnessContextEngine(contextEngine) {
	return Boolean(contextEngine && contextEngine.info.id !== "legacy");
}
//#endregion
//#region src/agents/pi-embedded-runner/run/attempt.tool-run-context.ts
function buildEmbeddedAttemptToolRunContext(params) {
	return {
		trigger: params.trigger,
		memoryFlushWritePath: params.memoryFlushWritePath,
		...params.trace ? { trace: freezeDiagnosticTraceContext(params.trace) } : {}
	};
}
//#endregion
export { sanitizeToolResult as _, buildHarnessContextEngineRuntimeContextFromUsage as a, formatToolAggregate as b, runHarnessContextEngineMaintenance as c, extractToolErrorMessage as d, extractToolResultMediaArtifact as f, isToolResultTimedOut as g, isToolResultError as h, buildHarnessContextEngineRuntimeContext as i, runContextEngineMaintenance as l, filterToolResultMediaUrls as m, assembleHarnessContextEngine as n, finalizeHarnessContextEngineTurn as o, extractToolResultText as p, bootstrapHarnessContextEngine as r, isActiveHarnessContextEngine as s, buildEmbeddedAttemptToolRunContext as t, extractMessagingToolSend as u, isMessagingTool as v, isMessagingToolSendAction as y };
