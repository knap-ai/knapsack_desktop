import { m as defaultRuntime } from "./subsystem-CJEvHE2o.js";
import { n as resolveGlobalSingleton, t as resolveGlobalMap } from "./global-singleton-BuWJMSMa.js";
import { s as normalizeFastMode } from "./thinking.shared-B8IAgSi8.js";
import { i as resolveAgentConfig } from "./agent-scope-CYXg_wTS.js";
import { t as parseDurationMs } from "./parse-duration-CYo1PS8c.js";
import { t as getChannelPlugin } from "./registry-fiJfPVib.js";
import "./plugins-DF32jmMU.js";
import { n as resolveGlobalDedupeCache } from "./dedupe-_6bbS8VC.js";
import { a as logLaneEnqueue, i as logLaneDequeue, t as diag } from "./diagnostic-vmeqdUnS.js";
import { t as isRoutableChannel } from "./route-reply-BBjY9kE8.js";
//#region src/process/lanes.ts
let CommandLane = /* @__PURE__ */ function(CommandLane) {
	CommandLane["Main"] = "main";
	CommandLane["Cron"] = "cron";
	CommandLane["Subagent"] = "subagent";
	CommandLane["Nested"] = "nested";
	return CommandLane;
}({});
//#endregion
//#region src/process/command-queue.ts
/**
* Dedicated error type thrown when a queued command is rejected because
* its lane was cleared.  Callers that fire-and-forget enqueued tasks can
* catch (or ignore) this specific type to avoid unhandled-rejection noise.
*/
var CommandLaneClearedError = class extends Error {
	constructor(lane) {
		super(lane ? `Command lane "${lane}" cleared` : "Command lane cleared");
		this.name = "CommandLaneClearedError";
	}
};
/**
* Dedicated error type thrown when a new command is rejected because the
* gateway is currently draining for restart.
*/
var GatewayDrainingError = class extends Error {
	constructor() {
		super("Gateway is draining for restart; new tasks are not accepted");
		this.name = "GatewayDrainingError";
	}
};
function isExpectedNonErrorLaneFailure(err) {
	return err instanceof Error && err.name === "LiveSessionModelSwitchError";
}
/**
* Keep queue runtime state on globalThis so every bundled entry/chunk shares
* the same lanes, counters, and draining flag in production builds.
*/
const COMMAND_QUEUE_STATE_KEY = Symbol.for("openclaw.commandQueueState");
function getQueueState() {
	return resolveGlobalSingleton(COMMAND_QUEUE_STATE_KEY, () => ({
		gatewayDraining: false,
		lanes: /* @__PURE__ */ new Map(),
		nextTaskId: 1
	}));
}
function normalizeLane(lane) {
	return lane.trim() || CommandLane.Main;
}
function getLaneDepth(state) {
	return state.queue.length + state.activeTaskIds.size;
}
function getLaneState(lane) {
	const queueState = getQueueState();
	const existing = queueState.lanes.get(lane);
	if (existing) return existing;
	const created = {
		lane,
		queue: [],
		activeTaskIds: /* @__PURE__ */ new Set(),
		maxConcurrent: 1,
		draining: false,
		generation: 0
	};
	queueState.lanes.set(lane, created);
	return created;
}
function completeTask(state, taskId, taskGeneration) {
	if (taskGeneration !== state.generation) return false;
	state.activeTaskIds.delete(taskId);
	return true;
}
function drainLane(lane) {
	const state = getLaneState(lane);
	if (state.draining) {
		if (state.activeTaskIds.size === 0 && state.queue.length > 0) diag.warn(`drainLane blocked: lane=${lane} draining=true active=0 queue=${state.queue.length}`);
		return;
	}
	state.draining = true;
	const pump = () => {
		try {
			while (state.activeTaskIds.size < state.maxConcurrent && state.queue.length > 0) {
				const entry = state.queue.shift();
				const waitedMs = Date.now() - entry.enqueuedAt;
				if (waitedMs >= entry.warnAfterMs) {
					try {
						entry.onWait?.(waitedMs, state.queue.length);
					} catch (err) {
						diag.error(`lane onWait callback failed: lane=${lane} error="${String(err)}"`);
					}
					diag.warn(`lane wait exceeded: lane=${lane} waitedMs=${waitedMs} queueAhead=${state.queue.length}`);
				}
				logLaneDequeue(lane, waitedMs, state.queue.length);
				const taskId = getQueueState().nextTaskId++;
				const taskGeneration = state.generation;
				state.activeTaskIds.add(taskId);
				(async () => {
					const startTime = Date.now();
					try {
						const result = await entry.task();
						if (completeTask(state, taskId, taskGeneration)) {
							diag.debug(`lane task done: lane=${lane} durationMs=${Date.now() - startTime} active=${state.activeTaskIds.size} queued=${state.queue.length}`);
							pump();
						}
						entry.resolve(result);
					} catch (err) {
						const completedCurrentGeneration = completeTask(state, taskId, taskGeneration);
						const isProbeLane = lane.startsWith("auth-probe:") || lane.startsWith("session:probe-");
						if (!isProbeLane && !isExpectedNonErrorLaneFailure(err)) diag.error(`lane task error: lane=${lane} durationMs=${Date.now() - startTime} error="${String(err)}"`);
						else if (!isProbeLane) diag.debug(`lane task interrupted: lane=${lane} durationMs=${Date.now() - startTime} reason="${String(err)}"`);
						if (completedCurrentGeneration) pump();
						entry.reject(err);
					}
				})();
			}
		} finally {
			state.draining = false;
		}
	};
	pump();
}
/**
* Mark gateway as draining for restart so new enqueues fail fast with
* `GatewayDrainingError` instead of being silently killed on shutdown.
*/
function markGatewayDraining() {
	getQueueState().gatewayDraining = true;
}
function setCommandLaneConcurrency(lane, maxConcurrent) {
	const cleaned = normalizeLane(lane);
	const state = getLaneState(cleaned);
	state.maxConcurrent = Math.max(1, Math.floor(maxConcurrent));
	drainLane(cleaned);
}
function enqueueCommandInLane(lane, task, opts) {
	if (getQueueState().gatewayDraining) return Promise.reject(new GatewayDrainingError());
	const cleaned = normalizeLane(lane);
	const warnAfterMs = opts?.warnAfterMs ?? 2e3;
	const state = getLaneState(cleaned);
	return new Promise((resolve, reject) => {
		state.queue.push({
			task: () => task(),
			resolve: (value) => resolve(value),
			reject,
			enqueuedAt: Date.now(),
			warnAfterMs,
			onWait: opts?.onWait
		});
		logLaneEnqueue(cleaned, getLaneDepth(state));
		drainLane(cleaned);
	});
}
function getQueueSize(lane = CommandLane.Main) {
	const resolved = normalizeLane(lane);
	const state = getQueueState().lanes.get(resolved);
	if (!state) return 0;
	return getLaneDepth(state);
}
function getTotalQueueSize() {
	let total = 0;
	for (const s of getQueueState().lanes.values()) total += getLaneDepth(s);
	return total;
}
function clearCommandLane(lane = CommandLane.Main) {
	const cleaned = normalizeLane(lane);
	const state = getQueueState().lanes.get(cleaned);
	if (!state) return 0;
	const removed = state.queue.length;
	const pending = state.queue.splice(0);
	for (const entry of pending) entry.reject(new CommandLaneClearedError(cleaned));
	return removed;
}
/**
* Reset all lane runtime state to idle. Used after SIGUSR1 in-process
* restarts where interrupted tasks' finally blocks may not run, leaving
* stale active task IDs that permanently block new work from draining.
*
* Bumps lane generation and clears execution counters so stale completions
* from old in-flight tasks are ignored. Queued entries are intentionally
* preserved — they represent pending user work that should still execute
* after restart.
*
* After resetting, drains any lanes that still have queued entries so
* preserved work is pumped immediately rather than waiting for a future
* `enqueueCommandInLane()` call (which may never come).
*/
function resetAllLanes() {
	const queueState = getQueueState();
	queueState.gatewayDraining = false;
	const lanesToDrain = [];
	for (const state of queueState.lanes.values()) {
		state.generation += 1;
		state.activeTaskIds.clear();
		state.draining = false;
		if (state.queue.length > 0) lanesToDrain.push(state.lane);
	}
	for (const lane of lanesToDrain) drainLane(lane);
}
/**
* Returns the total number of actively executing tasks across all lanes
* (excludes queued-but-not-started entries).
*/
function getActiveTaskCount() {
	const queueState = getQueueState();
	let total = 0;
	for (const s of queueState.lanes.values()) total += s.activeTaskIds.size;
	return total;
}
/**
* Wait for all currently active tasks across all lanes to finish.
* Polls at a short interval; resolves when no tasks are active or
* when `timeoutMs` elapses (whichever comes first).
*
* New tasks enqueued after this call are ignored — only tasks that are
* already executing are waited on.
*/
function waitForActiveTasks(timeoutMs) {
	const POLL_INTERVAL_MS = 50;
	const deadline = Date.now() + timeoutMs;
	const queueState = getQueueState();
	const activeAtStart = /* @__PURE__ */ new Set();
	for (const state of queueState.lanes.values()) for (const taskId of state.activeTaskIds) activeAtStart.add(taskId);
	return new Promise((resolve) => {
		const check = () => {
			if (activeAtStart.size === 0) {
				resolve({ drained: true });
				return;
			}
			let hasPending = false;
			for (const state of queueState.lanes.values()) {
				for (const taskId of state.activeTaskIds) if (activeAtStart.has(taskId)) {
					hasPending = true;
					break;
				}
				if (hasPending) break;
			}
			if (!hasPending) {
				resolve({ drained: true });
				return;
			}
			if (Date.now() >= deadline) {
				resolve({ drained: false });
				return;
			}
			setTimeout(check, POLL_INTERVAL_MS);
		};
		check();
	});
}
//#endregion
//#region src/agents/fast-mode.ts
function resolveConfiguredFastModeRaw(params) {
	const modelKey = `${params.provider}/${params.model}`;
	const modelConfig = params.cfg?.agents?.defaults?.models?.[modelKey];
	return modelConfig?.params?.fastMode ?? modelConfig?.params?.fast_mode;
}
function resolveFastModeState(params) {
	const sessionOverride = normalizeFastMode(params.sessionEntry?.fastMode);
	if (sessionOverride !== void 0) return {
		enabled: sessionOverride,
		source: "session"
	};
	const agentDefault = params.agentId && params.cfg ? resolveAgentConfig(params.cfg, params.agentId)?.fastModeDefault : void 0;
	if (typeof agentDefault === "boolean") return {
		enabled: agentDefault,
		source: "agent"
	};
	const configured = normalizeFastMode(resolveConfiguredFastModeRaw(params));
	if (configured !== void 0) return {
		enabled: configured,
		source: "config"
	};
	return {
		enabled: false,
		source: "default"
	};
}
//#endregion
//#region src/auto-reply/reply/directive-parsing.ts
function skipDirectiveArgPrefix(raw) {
	let i = 0;
	const len = raw.length;
	while (i < len && /\s/.test(raw[i])) i += 1;
	if (raw[i] === ":") {
		i += 1;
		while (i < len && /\s/.test(raw[i])) i += 1;
	}
	return i;
}
function takeDirectiveToken(raw, startIndex) {
	let i = startIndex;
	const len = raw.length;
	while (i < len && /\s/.test(raw[i])) i += 1;
	if (i >= len) return {
		token: null,
		nextIndex: i
	};
	const start = i;
	while (i < len && !/\s/.test(raw[i])) i += 1;
	if (start === i) return {
		token: null,
		nextIndex: i
	};
	const token = raw.slice(start, i);
	while (i < len && /\s/.test(raw[i])) i += 1;
	return {
		token,
		nextIndex: i
	};
}
//#endregion
//#region src/auto-reply/reply/queue/normalize.ts
function normalizeQueueMode(raw) {
	if (!raw) return;
	const cleaned = raw.trim().toLowerCase();
	if (cleaned === "queue" || cleaned === "queued") return "steer";
	if (cleaned === "interrupt" || cleaned === "interrupts" || cleaned === "abort") return "interrupt";
	if (cleaned === "steer" || cleaned === "steering") return "steer";
	if (cleaned === "followup" || cleaned === "follow-ups" || cleaned === "followups") return "followup";
	if (cleaned === "collect" || cleaned === "coalesce") return "collect";
	if (cleaned === "steer+backlog" || cleaned === "steer-backlog" || cleaned === "steer_backlog") return "steer-backlog";
}
function normalizeQueueDropPolicy(raw) {
	if (!raw) return;
	const cleaned = raw.trim().toLowerCase();
	if (cleaned === "old" || cleaned === "oldest") return "old";
	if (cleaned === "new" || cleaned === "newest") return "new";
	if (cleaned === "summarize" || cleaned === "summary") return "summarize";
}
//#endregion
//#region src/auto-reply/reply/queue/directive.ts
function parseQueueDebounce(raw) {
	if (!raw) return;
	try {
		const parsed = parseDurationMs(raw.trim(), { defaultUnit: "ms" });
		if (!parsed || parsed < 0) return;
		return Math.round(parsed);
	} catch {
		return;
	}
}
function parseQueueCap(raw) {
	if (!raw) return;
	const num = Number(raw);
	if (!Number.isFinite(num)) return;
	const cap = Math.floor(num);
	if (cap < 1) return;
	return cap;
}
function parseQueueDirectiveArgs(raw) {
	const len = raw.length;
	let i = skipDirectiveArgPrefix(raw);
	let consumed = i;
	let queueMode;
	let queueReset = false;
	let rawMode;
	let debounceMs;
	let cap;
	let dropPolicy;
	let rawDebounce;
	let rawCap;
	let rawDrop;
	let hasOptions = false;
	const takeToken = () => {
		const res = takeDirectiveToken(raw, i);
		i = res.nextIndex;
		return res.token;
	};
	while (i < len) {
		const token = takeToken();
		if (!token) break;
		const lowered = token.trim().toLowerCase();
		if (lowered === "default" || lowered === "reset" || lowered === "clear") {
			queueReset = true;
			consumed = i;
			break;
		}
		if (lowered.startsWith("debounce:") || lowered.startsWith("debounce=")) {
			rawDebounce = token.split(/[:=]/)[1] ?? "";
			debounceMs = parseQueueDebounce(rawDebounce);
			hasOptions = true;
			consumed = i;
			continue;
		}
		if (lowered.startsWith("cap:") || lowered.startsWith("cap=")) {
			rawCap = token.split(/[:=]/)[1] ?? "";
			cap = parseQueueCap(rawCap);
			hasOptions = true;
			consumed = i;
			continue;
		}
		if (lowered.startsWith("drop:") || lowered.startsWith("drop=")) {
			rawDrop = token.split(/[:=]/)[1] ?? "";
			dropPolicy = normalizeQueueDropPolicy(rawDrop);
			hasOptions = true;
			consumed = i;
			continue;
		}
		const mode = normalizeQueueMode(token);
		if (mode) {
			queueMode = mode;
			rawMode = token;
			consumed = i;
			continue;
		}
		break;
	}
	return {
		consumed,
		queueMode,
		queueReset,
		rawMode,
		debounceMs,
		cap,
		dropPolicy,
		rawDebounce,
		rawCap,
		rawDrop,
		hasOptions
	};
}
function extractQueueDirective(body) {
	if (!body) return {
		cleaned: "",
		hasDirective: false,
		queueReset: false,
		hasOptions: false
	};
	const match = /(?:^|\s)\/queue(?=$|\s|:)/i.exec(body);
	if (!match) return {
		cleaned: body.trim(),
		hasDirective: false,
		queueReset: false,
		hasOptions: false
	};
	const start = match.index + match[0].indexOf("/queue");
	const argsStart = start + 6;
	const parsed = parseQueueDirectiveArgs(body.slice(argsStart));
	return {
		cleaned: `${body.slice(0, start)} ${body.slice(argsStart + parsed.consumed)}`.replace(/\s+/g, " ").trim(),
		queueMode: parsed.queueMode,
		queueReset: parsed.queueReset,
		rawMode: parsed.rawMode,
		debounceMs: parsed.debounceMs,
		cap: parsed.cap,
		dropPolicy: parsed.dropPolicy,
		rawDebounce: parsed.rawDebounce,
		rawCap: parsed.rawCap,
		rawDrop: parsed.rawDrop,
		hasDirective: true,
		hasOptions: parsed.hasOptions
	};
}
//#endregion
//#region src/agents/pi-embedded-runner/lanes.ts
function resolveSessionLane(key) {
	const cleaned = key.trim() || CommandLane.Main;
	return cleaned.startsWith("session:") ? cleaned : `session:${cleaned}`;
}
function resolveGlobalLane(lane) {
	const cleaned = lane?.trim();
	if (cleaned === CommandLane.Cron) return CommandLane.Nested;
	return cleaned ? cleaned : CommandLane.Main;
}
function resolveEmbeddedSessionLane(key) {
	return resolveSessionLane(key);
}
//#endregion
//#region src/utils/queue-helpers.ts
function clearQueueSummaryState(state) {
	state.droppedCount = 0;
	state.summaryLines = [];
}
function previewQueueSummaryPrompt(params) {
	return buildQueueSummaryPrompt({
		state: {
			dropPolicy: params.state.dropPolicy,
			droppedCount: params.state.droppedCount,
			summaryLines: [...params.state.summaryLines]
		},
		noun: params.noun,
		title: params.title
	});
}
function applyQueueRuntimeSettings(params) {
	params.target.mode = params.settings.mode;
	params.target.debounceMs = typeof params.settings.debounceMs === "number" ? Math.max(0, params.settings.debounceMs) : params.target.debounceMs;
	params.target.cap = typeof params.settings.cap === "number" && params.settings.cap > 0 ? Math.floor(params.settings.cap) : params.target.cap;
	params.target.dropPolicy = params.settings.dropPolicy ?? params.target.dropPolicy;
}
function elideQueueText(text, limit = 140) {
	if (text.length <= limit) return text;
	return `${text.slice(0, Math.max(0, limit - 1)).trimEnd()}…`;
}
function buildQueueSummaryLine(text, limit = 160) {
	return elideQueueText(text.replace(/\s+/g, " ").trim(), limit);
}
function shouldSkipQueueItem(params) {
	if (!params.dedupe) return false;
	return params.dedupe(params.item, params.items);
}
function applyQueueDropPolicy(params) {
	const cap = params.queue.cap;
	if (cap <= 0 || params.queue.items.length < cap) return true;
	if (params.queue.dropPolicy === "new") return false;
	const dropCount = params.queue.items.length - cap + 1;
	const dropped = params.queue.items.splice(0, dropCount);
	if (params.queue.dropPolicy === "summarize") {
		for (const item of dropped) {
			params.queue.droppedCount += 1;
			params.queue.summaryLines.push(buildQueueSummaryLine(params.summarize(item)));
		}
		const limit = Math.max(0, params.summaryLimit ?? cap);
		while (params.queue.summaryLines.length > limit) params.queue.summaryLines.shift();
	}
	return true;
}
function waitForQueueDebounce(queue) {
	if (process.env.OPENCLAW_TEST_FAST === "1") return Promise.resolve();
	const debounceMs = Math.max(0, queue.debounceMs);
	if (debounceMs <= 0) return Promise.resolve();
	return new Promise((resolve) => {
		const check = () => {
			const since = Date.now() - queue.lastEnqueuedAt;
			if (since >= debounceMs) {
				resolve();
				return;
			}
			setTimeout(check, debounceMs - since);
		};
		check();
	});
}
function beginQueueDrain(map, key) {
	const queue = map.get(key);
	if (!queue || queue.draining) return;
	queue.draining = true;
	return queue;
}
async function drainNextQueueItem(items, run) {
	const next = items[0];
	if (!next) return false;
	await run(next);
	items.shift();
	return true;
}
async function drainCollectItemIfNeeded(params) {
	if (!params.forceIndividualCollect && !params.isCrossChannel) return "skipped";
	if (params.isCrossChannel) params.setForceIndividualCollect?.(true);
	return await drainNextQueueItem(params.items, params.run) ? "drained" : "empty";
}
async function drainCollectQueueStep(params) {
	return await drainCollectItemIfNeeded({
		forceIndividualCollect: params.collectState.forceIndividualCollect,
		isCrossChannel: params.isCrossChannel,
		setForceIndividualCollect: (next) => {
			params.collectState.forceIndividualCollect = next;
		},
		items: params.items,
		run: params.run
	});
}
function buildQueueSummaryPrompt(params) {
	if (params.state.dropPolicy !== "summarize" || params.state.droppedCount <= 0) return;
	const noun = params.noun;
	const lines = [params.title ?? `[Queue overflow] Dropped ${params.state.droppedCount} ${noun}${params.state.droppedCount === 1 ? "" : "s"} due to cap.`];
	if (params.state.summaryLines.length > 0) {
		lines.push("Summary:");
		for (const line of params.state.summaryLines) lines.push(`- ${line}`);
	}
	clearQueueSummaryState(params.state);
	return lines.join("\n");
}
function buildCollectPrompt(params) {
	const blocks = [params.title];
	if (params.summary) blocks.push(params.summary);
	params.items.forEach((item, idx) => {
		blocks.push(params.renderItem(item, idx));
	});
	return blocks.join("\n\n");
}
function hasCrossChannelItems(items, resolveKey) {
	const keys = /* @__PURE__ */ new Set();
	let hasUnkeyed = false;
	for (const item of items) {
		const resolved = resolveKey(item);
		if (resolved.cross) return true;
		if (!resolved.key) {
			hasUnkeyed = true;
			continue;
		}
		keys.add(resolved.key);
	}
	if (keys.size === 0) return false;
	if (hasUnkeyed) return true;
	return keys.size > 1;
}
//#endregion
//#region src/auto-reply/reply/queue/state.ts
const DEFAULT_QUEUE_DEBOUNCE_MS = 1e3;
const FOLLOWUP_QUEUES = resolveGlobalMap(Symbol.for("openclaw.followupQueues"));
function getExistingFollowupQueue(key) {
	const cleaned = key.trim();
	if (!cleaned) return;
	return FOLLOWUP_QUEUES.get(cleaned);
}
function getFollowupQueue(key, settings) {
	const existing = FOLLOWUP_QUEUES.get(key);
	if (existing) {
		applyQueueRuntimeSettings({
			target: existing,
			settings
		});
		return existing;
	}
	const created = {
		items: [],
		draining: false,
		lastEnqueuedAt: 0,
		mode: settings.mode,
		debounceMs: typeof settings.debounceMs === "number" ? Math.max(0, settings.debounceMs) : DEFAULT_QUEUE_DEBOUNCE_MS,
		cap: typeof settings.cap === "number" && settings.cap > 0 ? Math.floor(settings.cap) : 20,
		dropPolicy: settings.dropPolicy ?? "summarize",
		droppedCount: 0,
		summaryLines: []
	};
	applyQueueRuntimeSettings({
		target: created,
		settings
	});
	FOLLOWUP_QUEUES.set(key, created);
	return created;
}
function clearFollowupQueue(key) {
	const cleaned = key.trim();
	const queue = getExistingFollowupQueue(cleaned);
	if (!queue) return 0;
	const cleared = queue.items.length + queue.droppedCount;
	queue.items.length = 0;
	queue.droppedCount = 0;
	queue.summaryLines = [];
	queue.lastRun = void 0;
	queue.lastEnqueuedAt = 0;
	FOLLOWUP_QUEUES.delete(cleaned);
	return cleared;
}
function refreshQueuedFollowupSession(params) {
	const cleaned = params.key.trim();
	if (!cleaned) return;
	const queue = getExistingFollowupQueue(cleaned);
	if (!queue) return;
	const shouldRewriteSession = Boolean(params.previousSessionId) && Boolean(params.nextSessionId) && params.previousSessionId !== params.nextSessionId;
	const shouldRewriteSelection = typeof params.nextProvider === "string" || typeof params.nextModel === "string" || Object.hasOwn(params, "nextAuthProfileId") || Object.hasOwn(params, "nextAuthProfileIdSource");
	if (!shouldRewriteSession && !shouldRewriteSelection) return;
	const rewriteRun = (run) => {
		if (!run) return;
		if (shouldRewriteSession && run.sessionId === params.previousSessionId) {
			run.sessionId = params.nextSessionId;
			if (params.nextSessionFile?.trim()) run.sessionFile = params.nextSessionFile;
		}
		if (shouldRewriteSelection) {
			if (typeof params.nextProvider === "string") run.provider = params.nextProvider;
			if (typeof params.nextModel === "string") run.model = params.nextModel;
			if (Object.hasOwn(params, "nextAuthProfileId")) run.authProfileId = params.nextAuthProfileId?.trim() || void 0;
			if (Object.hasOwn(params, "nextAuthProfileIdSource")) run.authProfileIdSource = run.authProfileId ? params.nextAuthProfileIdSource : void 0;
		}
	};
	rewriteRun(queue.lastRun);
	for (const item of queue.items) rewriteRun(item.run);
}
//#endregion
//#region src/auto-reply/reply/queue/drain.ts
const FOLLOWUP_RUN_CALLBACKS = resolveGlobalMap(Symbol.for("openclaw.followupDrainCallbacks"));
function rememberFollowupDrainCallback(key, runFollowup) {
	FOLLOWUP_RUN_CALLBACKS.set(key, runFollowup);
}
function clearFollowupDrainCallback(key) {
	FOLLOWUP_RUN_CALLBACKS.delete(key);
}
/** Restart the drain for `key` if it is currently idle, using the stored callback. */
function kickFollowupDrainIfIdle(key) {
	const cb = FOLLOWUP_RUN_CALLBACKS.get(key);
	if (!cb) return;
	scheduleFollowupDrain(key, cb);
}
function resolveOriginRoutingMetadata(items) {
	return {
		originatingChannel: items.find((item) => item.originatingChannel)?.originatingChannel,
		originatingTo: items.find((item) => item.originatingTo)?.originatingTo,
		originatingAccountId: items.find((item) => item.originatingAccountId)?.originatingAccountId,
		originatingThreadId: items.find((item) => item.originatingThreadId != null && item.originatingThreadId !== "")?.originatingThreadId
	};
}
function resolveCrossChannelKey(item) {
	const { originatingChannel: channel, originatingTo: to, originatingAccountId: accountId } = item;
	const threadId = item.originatingThreadId;
	if (!channel && !to && !accountId && (threadId == null || threadId === "")) return {};
	if (!isRoutableChannel(channel) || !to) return { cross: true };
	return { key: [
		channel,
		to,
		accountId || "",
		threadId != null && threadId !== "" ? String(threadId) : ""
	].join("|") };
}
function scheduleFollowupDrain(key, runFollowup) {
	const queue = beginQueueDrain(FOLLOWUP_QUEUES, key);
	if (!queue) return;
	const effectiveRunFollowup = FOLLOWUP_RUN_CALLBACKS.get(key) ?? runFollowup;
	rememberFollowupDrainCallback(key, effectiveRunFollowup);
	(async () => {
		try {
			const collectState = { forceIndividualCollect: false };
			while (queue.items.length > 0 || queue.droppedCount > 0) {
				await waitForQueueDebounce(queue);
				if (queue.mode === "collect") {
					const collectDrainResult = await drainCollectQueueStep({
						collectState,
						isCrossChannel: hasCrossChannelItems(queue.items, resolveCrossChannelKey),
						items: queue.items,
						run: effectiveRunFollowup
					});
					if (collectDrainResult === "empty") break;
					if (collectDrainResult === "drained") continue;
					const items = queue.items.slice();
					const summary = previewQueueSummaryPrompt({
						state: queue,
						noun: "message"
					});
					const run = items.at(-1)?.run ?? queue.lastRun;
					if (!run) break;
					const routing = resolveOriginRoutingMetadata(items);
					await effectiveRunFollowup({
						prompt: buildCollectPrompt({
							title: "[Queued messages while agent was busy]",
							items,
							summary,
							renderItem: (item, idx) => `---\nQueued #${idx + 1}\n${item.prompt}`.trim()
						}),
						run,
						enqueuedAt: Date.now(),
						...routing
					});
					queue.items.splice(0, items.length);
					if (summary) clearQueueSummaryState(queue);
					continue;
				}
				const summaryPrompt = previewQueueSummaryPrompt({
					state: queue,
					noun: "message"
				});
				if (summaryPrompt) {
					const run = queue.lastRun;
					if (!run) break;
					if (!await drainNextQueueItem(queue.items, async (item) => {
						await effectiveRunFollowup({
							prompt: summaryPrompt,
							run,
							enqueuedAt: Date.now(),
							originatingChannel: item.originatingChannel,
							originatingTo: item.originatingTo,
							originatingAccountId: item.originatingAccountId,
							originatingThreadId: item.originatingThreadId
						});
					})) break;
					clearQueueSummaryState(queue);
					continue;
				}
				if (!await drainNextQueueItem(queue.items, effectiveRunFollowup)) break;
			}
		} catch (err) {
			queue.lastEnqueuedAt = Date.now();
			defaultRuntime.error?.(`followup queue drain failed for ${key}: ${String(err)}`);
		} finally {
			queue.draining = false;
			if (queue.items.length === 0 && queue.droppedCount === 0) {
				FOLLOWUP_QUEUES.delete(key);
				clearFollowupDrainCallback(key);
			} else scheduleFollowupDrain(key, effectiveRunFollowup);
		}
	})();
}
//#endregion
//#region src/auto-reply/reply/queue/cleanup.ts
const defaultQueueCleanupDeps = {
	resolveEmbeddedSessionLane,
	clearCommandLane
};
const queueCleanupDeps = { ...defaultQueueCleanupDeps };
function resolveQueueCleanupLaneResolver() {
	return typeof queueCleanupDeps.resolveEmbeddedSessionLane === "function" ? queueCleanupDeps.resolveEmbeddedSessionLane : defaultQueueCleanupDeps.resolveEmbeddedSessionLane;
}
function resolveQueueCleanupLaneClearer() {
	return typeof queueCleanupDeps.clearCommandLane === "function" ? queueCleanupDeps.clearCommandLane : defaultQueueCleanupDeps.clearCommandLane;
}
function clearSessionQueues(keys) {
	const seen = /* @__PURE__ */ new Set();
	let followupCleared = 0;
	let laneCleared = 0;
	const clearedKeys = [];
	const resolveLane = resolveQueueCleanupLaneResolver();
	const clearLane = resolveQueueCleanupLaneClearer();
	for (const key of keys) {
		const cleaned = key?.trim();
		if (!cleaned || seen.has(cleaned)) continue;
		seen.add(cleaned);
		clearedKeys.push(cleaned);
		followupCleared += clearFollowupQueue(cleaned);
		clearFollowupDrainCallback(cleaned);
		laneCleared += clearLane(resolveLane(cleaned));
	}
	return {
		followupCleared,
		laneCleared,
		keys: clearedKeys
	};
}
//#endregion
//#region src/auto-reply/reply/queue/enqueue.ts
const RECENT_QUEUE_MESSAGE_IDS = resolveGlobalDedupeCache(Symbol.for("openclaw.recentQueueMessageIds"), {
	ttlMs: 300 * 1e3,
	maxSize: 1e4
});
function buildRecentMessageIdKey(run, queueKey) {
	const messageId = run.messageId?.trim();
	if (!messageId) return;
	return JSON.stringify([
		"queue",
		queueKey,
		run.originatingChannel ?? "",
		run.originatingTo ?? "",
		run.originatingAccountId ?? "",
		run.originatingThreadId == null ? "" : String(run.originatingThreadId),
		messageId
	]);
}
function isRunAlreadyQueued(run, items, allowPromptFallback = false) {
	const hasSameRouting = (item) => item.originatingChannel === run.originatingChannel && item.originatingTo === run.originatingTo && item.originatingAccountId === run.originatingAccountId && item.originatingThreadId === run.originatingThreadId;
	const messageId = run.messageId?.trim();
	if (messageId) return items.some((item) => item.messageId?.trim() === messageId && hasSameRouting(item));
	if (!allowPromptFallback) return false;
	return items.some((item) => item.prompt === run.prompt && hasSameRouting(item));
}
function enqueueFollowupRun(key, run, settings, dedupeMode = "message-id", runFollowup, restartIfIdle = true) {
	const queue = getFollowupQueue(key, settings);
	const recentMessageIdKey = dedupeMode !== "none" ? buildRecentMessageIdKey(run, key) : void 0;
	if (recentMessageIdKey && RECENT_QUEUE_MESSAGE_IDS.peek(recentMessageIdKey)) return false;
	const dedupe = dedupeMode === "none" ? void 0 : (item, items) => isRunAlreadyQueued(item, items, dedupeMode === "prompt");
	if (shouldSkipQueueItem({
		item: run,
		items: queue.items,
		dedupe
	})) return false;
	queue.lastEnqueuedAt = Date.now();
	queue.lastRun = run.run;
	if (!applyQueueDropPolicy({
		queue,
		summarize: (item) => item.summaryLine?.trim() || item.prompt.trim()
	})) return false;
	queue.items.push(run);
	if (recentMessageIdKey) RECENT_QUEUE_MESSAGE_IDS.check(recentMessageIdKey);
	if (runFollowup) rememberFollowupDrainCallback(key, runFollowup);
	if (restartIfIdle && !queue.draining) kickFollowupDrainIfIdle(key);
	return true;
}
function getFollowupQueueDepth(key) {
	const queue = getExistingFollowupQueue(key);
	if (!queue) return 0;
	return queue.items.length;
}
//#endregion
//#region src/auto-reply/reply/queue/settings.ts
function defaultQueueModeForChannel(_channel) {
	return "collect";
}
/** Resolve per-channel debounce override from debounceMsByChannel map. */
function resolveChannelDebounce(byChannel, channelKey) {
	if (!channelKey || !byChannel) return;
	const value = byChannel[channelKey];
	return typeof value === "number" && Number.isFinite(value) ? Math.max(0, value) : void 0;
}
function resolvePluginDebounce(channelKey) {
	if (!channelKey) return;
	const value = getChannelPlugin(channelKey)?.defaults?.queue?.debounceMs;
	return typeof value === "number" && Number.isFinite(value) ? Math.max(0, value) : void 0;
}
function resolveQueueSettings(params) {
	const channelKey = params.channel?.trim().toLowerCase();
	const queueCfg = params.cfg.messages?.queue;
	const providerModeRaw = channelKey && queueCfg?.byChannel ? queueCfg.byChannel[channelKey] : void 0;
	const resolvedMode = params.inlineMode ?? normalizeQueueMode(params.sessionEntry?.queueMode) ?? normalizeQueueMode(providerModeRaw) ?? normalizeQueueMode(queueCfg?.mode) ?? defaultQueueModeForChannel(channelKey);
	const debounceRaw = params.inlineOptions?.debounceMs ?? params.sessionEntry?.queueDebounceMs ?? resolveChannelDebounce(queueCfg?.debounceMsByChannel, channelKey) ?? resolvePluginDebounce(channelKey) ?? queueCfg?.debounceMs ?? 1e3;
	const capRaw = params.inlineOptions?.cap ?? params.sessionEntry?.queueCap ?? queueCfg?.cap ?? 20;
	const dropRaw = params.inlineOptions?.dropPolicy ?? params.sessionEntry?.queueDrop ?? normalizeQueueDropPolicy(queueCfg?.drop) ?? "summarize";
	return {
		mode: resolvedMode,
		debounceMs: typeof debounceRaw === "number" ? Math.max(0, debounceRaw) : void 0,
		cap: typeof capRaw === "number" ? Math.max(1, Math.floor(capRaw)) : void 0,
		dropPolicy: dropRaw
	};
}
//#endregion
export { resetAllLanes as A, resolveFastModeState as C, getQueueSize as D, getActiveTaskCount as E, waitForActiveTasks as M, CommandLane as N, getTotalQueueSize as O, takeDirectiveToken as S, enqueueCommandInLane as T, resolveEmbeddedSessionLane as _, scheduleFollowupDrain as a, extractQueueDirective as b, applyQueueRuntimeSettings as c, clearQueueSummaryState as d, drainCollectQueueStep as f, waitForQueueDebounce as g, previewQueueSummaryPrompt as h, clearSessionQueues as i, setCommandLaneConcurrency as j, markGatewayDraining as k, beginQueueDrain as l, hasCrossChannelItems as m, enqueueFollowupRun as n, refreshQueuedFollowupSession as o, drainNextQueueItem as p, getFollowupQueueDepth as r, applyQueueDropPolicy as s, resolveQueueSettings as t, buildCollectPrompt as u, resolveGlobalLane as v, clearCommandLane as w, skipDirectiveArgPrefix as x, resolveSessionLane as y };
