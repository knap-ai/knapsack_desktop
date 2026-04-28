import { _ as resolveStateDir } from "./paths-B2cMK-wd.js";
import { t as registerFatalErrorHook } from "./fatal-error-hooks-4xzPL8p8.js";
import { a as onDiagnosticEvent } from "./diagnostic-events-B5Jlu4QM.js";
import process from "node:process";
import fs from "node:fs";
import path from "node:path";
//#region src/logging/diagnostic-stability.ts
const DEFAULT_DIAGNOSTIC_STABILITY_CAPACITY = 1e3;
const MAX_DIAGNOSTIC_STABILITY_LIMIT = DEFAULT_DIAGNOSTIC_STABILITY_CAPACITY;
const SAFE_REASON_CODE$1 = /^[A-Za-z0-9_.:-]{1,120}$/u;
function createState(capacity = DEFAULT_DIAGNOSTIC_STABILITY_CAPACITY) {
	return {
		records: Array.from({ length: capacity }),
		capacity,
		nextIndex: 0,
		count: 0,
		dropped: 0,
		unsubscribe: null
	};
}
function getDiagnosticStabilityState() {
	const globalStore = globalThis;
	globalStore.__openclawDiagnosticStabilityState ??= createState();
	return globalStore.__openclawDiagnosticStabilityState;
}
function copyMemory(memory) {
	return { ...memory };
}
function copyReasonCode(reason) {
	if (!reason || !SAFE_REASON_CODE$1.test(reason)) return;
	return reason;
}
function assignReasonCode(record, reason) {
	const reasonCode = copyReasonCode(reason);
	if (reasonCode) record.reason = reasonCode;
}
function isRecord(record) {
	return record !== void 0;
}
function sanitizeDiagnosticEvent(event) {
	const record = {
		seq: event.seq,
		ts: event.ts,
		type: event.type
	};
	switch (event.type) {
		case "model.usage":
			record.channel = event.channel;
			record.provider = event.provider;
			record.model = event.model;
			record.usage = { ...event.usage };
			record.context = event.context ? { ...event.context } : void 0;
			record.costUsd = event.costUsd;
			record.durationMs = event.durationMs;
			break;
		case "webhook.received":
			record.channel = event.channel;
			break;
		case "webhook.processed":
			record.channel = event.channel;
			record.durationMs = event.durationMs;
			break;
		case "webhook.error":
			record.channel = event.channel;
			break;
		case "message.queued":
			record.channel = event.channel;
			record.source = event.source;
			record.queueDepth = event.queueDepth;
			break;
		case "message.processed":
			record.channel = event.channel;
			record.durationMs = event.durationMs;
			record.outcome = event.outcome;
			assignReasonCode(record, event.reason);
			break;
		case "message.delivery.started":
			record.channel = event.channel;
			record.deliveryKind = event.deliveryKind;
			break;
		case "message.delivery.completed":
			record.channel = event.channel;
			record.deliveryKind = event.deliveryKind;
			record.durationMs = event.durationMs;
			record.resultCount = event.resultCount;
			record.outcome = "completed";
			break;
		case "message.delivery.error":
			record.channel = event.channel;
			record.deliveryKind = event.deliveryKind;
			record.durationMs = event.durationMs;
			record.outcome = "error";
			assignReasonCode(record, event.errorCategory);
			break;
		case "session.state":
			record.outcome = event.state;
			assignReasonCode(record, event.reason);
			record.queueDepth = event.queueDepth;
			break;
		case "session.stuck":
			record.outcome = event.state;
			record.ageMs = event.ageMs;
			record.queueDepth = event.queueDepth;
			break;
		case "queue.lane.enqueue":
			record.source = event.lane;
			record.queueSize = event.queueSize;
			break;
		case "queue.lane.dequeue":
			record.source = event.lane;
			record.queueSize = event.queueSize;
			record.waitMs = event.waitMs;
			break;
		case "run.attempt":
			record.count = event.attempt;
			break;
		case "context.assembled":
			record.channel = event.channel;
			record.provider = event.provider;
			record.model = event.model;
			record.count = event.messageCount;
			record.bytes = event.promptChars;
			record.context = event.contextTokenBudget !== void 0 ? { limit: event.contextTokenBudget } : void 0;
			record.bytes = event.promptChars;
			break;
		case "diagnostic.heartbeat":
			record.webhooks = { ...event.webhooks };
			record.active = event.active;
			record.waiting = event.waiting;
			record.queued = event.queued;
			break;
		case "tool.loop":
			record.toolName = event.toolName;
			record.level = event.level;
			record.action = event.action;
			record.detector = event.detector;
			record.count = event.count;
			record.pairedToolName = event.pairedToolName;
			break;
		case "tool.execution.started":
			record.toolName = event.toolName;
			break;
		case "tool.execution.completed":
			record.toolName = event.toolName;
			record.durationMs = event.durationMs;
			break;
		case "tool.execution.error":
			record.toolName = event.toolName;
			record.durationMs = event.durationMs;
			assignReasonCode(record, event.errorCategory);
			break;
		case "exec.process.completed":
			record.target = event.target;
			record.mode = event.mode;
			record.outcome = event.outcome;
			record.durationMs = event.durationMs;
			record.commandLength = event.commandLength;
			record.exitCode = event.exitCode;
			record.timedOut = event.timedOut;
			record.failureKind = event.failureKind;
			assignReasonCode(record, event.failureKind);
			break;
		case "run.started":
			record.provider = event.provider;
			record.model = event.model;
			record.channel = event.channel;
			break;
		case "run.completed":
			record.provider = event.provider;
			record.model = event.model;
			record.channel = event.channel;
			record.durationMs = event.durationMs;
			record.outcome = event.outcome;
			assignReasonCode(record, event.errorCategory);
			break;
		case "harness.run.started":
			record.source = event.harnessId;
			record.pluginId = event.pluginId;
			record.provider = event.provider;
			record.model = event.model;
			record.channel = event.channel;
			break;
		case "harness.run.completed":
			record.source = event.harnessId;
			record.pluginId = event.pluginId;
			record.provider = event.provider;
			record.model = event.model;
			record.channel = event.channel;
			record.durationMs = event.durationMs;
			record.outcome = event.outcome;
			record.count = event.itemLifecycle?.completedCount;
			break;
		case "harness.run.error":
			record.source = event.harnessId;
			record.pluginId = event.pluginId;
			record.provider = event.provider;
			record.model = event.model;
			record.channel = event.channel;
			record.durationMs = event.durationMs;
			record.outcome = "error";
			record.action = event.phase;
			assignReasonCode(record, event.errorCategory);
			break;
		case "model.call.started":
			record.provider = event.provider;
			record.model = event.model;
			break;
		case "model.call.completed":
			record.provider = event.provider;
			record.model = event.model;
			record.durationMs = event.durationMs;
			record.requestBytes = event.requestPayloadBytes;
			record.responseBytes = event.responseStreamBytes;
			record.timeToFirstByteMs = event.timeToFirstByteMs;
			break;
		case "model.call.error":
			record.provider = event.provider;
			record.model = event.model;
			record.durationMs = event.durationMs;
			record.requestBytes = event.requestPayloadBytes;
			record.responseBytes = event.responseStreamBytes;
			record.timeToFirstByteMs = event.timeToFirstByteMs;
			record.failureKind = event.failureKind;
			record.memory = event.memory ? copyMemory(event.memory) : void 0;
			assignReasonCode(record, event.errorCategory);
			break;
		case "log.record":
			record.level = event.level;
			record.source = event.loggerName;
			break;
		case "diagnostic.memory.sample":
			record.memory = copyMemory(event.memory);
			break;
		case "diagnostic.memory.pressure":
			record.level = event.level;
			assignReasonCode(record, event.reason);
			record.memory = copyMemory(event.memory);
			record.thresholdBytes = event.thresholdBytes;
			record.rssGrowthBytes = event.rssGrowthBytes;
			record.windowMs = event.windowMs;
			break;
		case "payload.large":
			record.surface = event.surface;
			record.action = event.action;
			record.bytes = event.bytes;
			record.limitBytes = event.limitBytes;
			record.count = event.count;
			record.channel = event.channel;
			record.pluginId = event.pluginId;
			assignReasonCode(record, event.reason);
			break;
		case "telemetry.exporter":
			record.source = event.exporter;
			record.target = event.signal;
			record.outcome = event.status;
			assignReasonCode(record, event.reason ?? event.errorCategory);
			break;
	}
	return record;
}
function appendRecord(record) {
	const state = getDiagnosticStabilityState();
	state.records[state.nextIndex] = record;
	state.nextIndex = (state.nextIndex + 1) % state.capacity;
	if (state.count < state.capacity) {
		state.count += 1;
		return;
	}
	state.dropped += 1;
}
function listRecords() {
	const state = getDiagnosticStabilityState();
	if (state.count === 0) return [];
	if (state.count < state.capacity) return state.records.slice(0, state.count).filter(isRecord);
	return [...state.records.slice(state.nextIndex), ...state.records.slice(0, state.nextIndex)].filter(isRecord);
}
function summarizeRecords(records) {
	const byType = {};
	let latestMemory;
	let maxRssBytes;
	let maxHeapUsedBytes;
	let pressureCount = 0;
	const payloadLarge = {
		count: 0,
		rejected: 0,
		truncated: 0,
		chunked: 0,
		bySurface: {}
	};
	for (const record of records) {
		byType[record.type] = (byType[record.type] ?? 0) + 1;
		if (record.memory) {
			latestMemory = record.memory;
			maxRssBytes = maxRssBytes === void 0 ? record.memory.rssBytes : Math.max(maxRssBytes, record.memory.rssBytes);
			maxHeapUsedBytes = maxHeapUsedBytes === void 0 ? record.memory.heapUsedBytes : Math.max(maxHeapUsedBytes, record.memory.heapUsedBytes);
		}
		if (record.type === "diagnostic.memory.pressure") pressureCount += 1;
		if (record.type === "payload.large") {
			payloadLarge.count += 1;
			if (record.action === "rejected") payloadLarge.rejected += 1;
			else if (record.action === "truncated") payloadLarge.truncated += 1;
			else if (record.action === "chunked") payloadLarge.chunked += 1;
			const surface = record.surface ?? "unknown";
			payloadLarge.bySurface[surface] = (payloadLarge.bySurface[surface] ?? 0) + 1;
		}
	}
	return {
		byType,
		...latestMemory || pressureCount > 0 ? { memory: {
			latest: latestMemory,
			maxRssBytes,
			maxHeapUsedBytes,
			pressureCount
		} } : {},
		...payloadLarge.count > 0 ? { payloadLarge } : {}
	};
}
function selectRecords(records, options) {
	const { limit, type, sinceSeq } = normalizeDiagnosticStabilityQuery(options);
	const filtered = records.filter((record) => {
		if (type && record.type !== type) return false;
		if (sinceSeq !== void 0 && record.seq <= sinceSeq) return false;
		return true;
	});
	return {
		filtered,
		events: filtered.slice(Math.max(0, filtered.length - limit))
	};
}
function parseOptionalNonNegativeInteger(value, field) {
	if (value === void 0 || value === null || value === "") return;
	const parsed = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
	if (!Number.isInteger(parsed) || parsed < 0) throw new Error(`${field} must be a non-negative integer`);
	return parsed;
}
function parseOptionalType(value) {
	if (value === void 0 || value === null || value === "") return;
	if (typeof value !== "string" || value.trim() === "") throw new Error("type must be a non-empty string");
	return value.trim();
}
function normalizeLimit(limit, defaultLimit = 50) {
	const parsed = parseOptionalNonNegativeInteger(limit, "limit");
	if (parsed === void 0) return defaultLimit;
	if (parsed < 1 || parsed > 1e3) throw new Error(`limit must be between 1 and ${MAX_DIAGNOSTIC_STABILITY_LIMIT}`);
	return parsed;
}
function normalizeDiagnosticStabilityQuery(input = {}, options) {
	return {
		limit: normalizeLimit(input.limit, options?.defaultLimit),
		type: parseOptionalType(input.type),
		sinceSeq: parseOptionalNonNegativeInteger(input.sinceSeq, "sinceSeq")
	};
}
function startDiagnosticStabilityRecorder() {
	const state = getDiagnosticStabilityState();
	if (state.unsubscribe) return;
	state.unsubscribe = onDiagnosticEvent((event) => {
		appendRecord(sanitizeDiagnosticEvent(event));
	});
}
function stopDiagnosticStabilityRecorder() {
	const state = getDiagnosticStabilityState();
	state.unsubscribe?.();
	state.unsubscribe = null;
}
function getDiagnosticStabilitySnapshot(options) {
	const state = getDiagnosticStabilityState();
	const { filtered, events } = selectRecords(listRecords(), options);
	return {
		generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
		capacity: state.capacity,
		count: filtered.length,
		dropped: state.dropped,
		firstSeq: filtered[0]?.seq,
		lastSeq: filtered.at(-1)?.seq,
		events,
		summary: summarizeRecords(filtered)
	};
}
function selectDiagnosticStabilitySnapshot(snapshot, options) {
	const { filtered, events } = selectRecords(snapshot.events, options);
	return {
		...snapshot,
		count: filtered.length,
		firstSeq: filtered[0]?.seq,
		lastSeq: filtered.at(-1)?.seq,
		events,
		summary: summarizeRecords(filtered)
	};
}
function resetDiagnosticStabilityRecorderForTest() {
	const state = getDiagnosticStabilityState();
	state.unsubscribe?.();
	const next = createState(state.capacity);
	const globalStore = globalThis;
	globalStore.__openclawDiagnosticStabilityState = next;
}
//#endregion
//#region src/logging/diagnostic-stability-bundle.ts
const DIAGNOSTIC_STABILITY_BUNDLE_VERSION = 1;
const DEFAULT_DIAGNOSTIC_STABILITY_BUNDLE_LIMIT = MAX_DIAGNOSTIC_STABILITY_LIMIT;
const DEFAULT_DIAGNOSTIC_STABILITY_BUNDLE_RETENTION = 20;
const MAX_DIAGNOSTIC_STABILITY_BUNDLE_BYTES = 5 * 1024 * 1024;
const SAFE_REASON_CODE = /^[A-Za-z0-9_.:-]{1,120}$/u;
const BUNDLE_PREFIX = "openclaw-stability-";
const BUNDLE_SUFFIX = ".json";
const REDACTED_HOSTNAME = "<redacted-hostname>";
let fatalHookUnsubscribe = null;
function normalizeReason(reason) {
	return SAFE_REASON_CODE.test(reason) ? reason : "unknown";
}
function formatBundleTimestamp(now) {
	return now.toISOString().replace(/[:.]/g, "-");
}
function readErrorCode(error) {
	if (!error || typeof error !== "object" || !("code" in error)) return;
	const code = error.code;
	if (typeof code === "string" && SAFE_REASON_CODE.test(code)) return code;
	if (typeof code === "number" && Number.isFinite(code)) return String(code);
}
function readErrorName(error) {
	if (!error || typeof error !== "object" || !("name" in error)) return;
	const name = error.name;
	return typeof name === "string" && SAFE_REASON_CODE.test(name) ? name : void 0;
}
function readSafeErrorMetadata(error) {
	const name = readErrorName(error);
	const code = readErrorCode(error);
	if (!name && !code) return;
	return {
		...name ? { name } : {},
		...code ? { code } : {}
	};
}
function resolveDiagnosticStabilityBundleDir(options = {}) {
	return path.join(options.stateDir ?? resolveStateDir(options.env ?? process.env), "logs", "stability");
}
function buildBundlePath(dir, now, reason) {
	return path.join(dir, `${BUNDLE_PREFIX}${formatBundleTimestamp(now)}-${process.pid}-${normalizeReason(reason)}${BUNDLE_SUFFIX}`);
}
function isBundleFile(name) {
	return name.startsWith(BUNDLE_PREFIX) && name.endsWith(BUNDLE_SUFFIX);
}
function isMissingFileError(error) {
	return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
}
function readObject(value, label) {
	if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`Invalid stability bundle: ${label} must be an object`);
	return value;
}
function readNumber(value, label) {
	if (typeof value !== "number" || !Number.isFinite(value)) throw new Error(`Invalid stability bundle: ${label} must be a finite number`);
	return value;
}
function readTimestampMs(value, label) {
	const timestamp = readNumber(value, label);
	if (Number.isNaN(new Date(timestamp).getTime())) throw new Error(`Invalid stability bundle: ${label} must be a valid timestamp`);
	return timestamp;
}
function readOptionalNumber(value, label) {
	if (value === void 0) return;
	return readNumber(value, label);
}
function readString(value, label) {
	if (typeof value !== "string") throw new Error(`Invalid stability bundle: ${label} must be a string`);
	return value;
}
function readTimestampString(value, label) {
	const timestamp = readString(value, label);
	if (Number.isNaN(new Date(timestamp).getTime())) throw new Error(`Invalid stability bundle: ${label} must be a valid timestamp`);
	return timestamp;
}
function readCodeString(value, label) {
	const code = readString(value, label);
	if (!SAFE_REASON_CODE.test(code)) throw new Error(`Invalid stability bundle: ${label} must be a safe diagnostic code`);
	return code;
}
function readOptionalCodeString(value, label) {
	if (value === void 0) return;
	const code = readString(value, label);
	return SAFE_REASON_CODE.test(code) ? code : void 0;
}
function assignOptionalNumber(target, key, value, label) {
	const parsed = readOptionalNumber(value, label);
	if (parsed !== void 0) target[key] = parsed;
}
function assignOptionalCodeString(target, key, value, label) {
	const parsed = readOptionalCodeString(value, label);
	if (parsed !== void 0) target[key] = parsed;
}
function readMemoryUsage(value, label) {
	const memory = readObject(value, label);
	return {
		rssBytes: readNumber(memory.rssBytes, `${label}.rssBytes`),
		heapTotalBytes: readNumber(memory.heapTotalBytes, `${label}.heapTotalBytes`),
		heapUsedBytes: readNumber(memory.heapUsedBytes, `${label}.heapUsedBytes`),
		externalBytes: readNumber(memory.externalBytes, `${label}.externalBytes`),
		arrayBuffersBytes: readNumber(memory.arrayBuffersBytes, `${label}.arrayBuffersBytes`)
	};
}
function readNumberMap(value, label) {
	const source = readObject(value, label);
	const result = {};
	for (const [key, entry] of Object.entries(source)) {
		if (!SAFE_REASON_CODE.test(key)) continue;
		result[key] = readNumber(entry, `${label}.${key}`);
	}
	return result;
}
function readOptionalMemorySummary(value) {
	if (value === void 0) return;
	const memory = readObject(value, "snapshot.summary.memory");
	const latest = memory.latest === void 0 ? void 0 : readMemoryUsage(memory.latest, "snapshot.summary.memory.latest");
	return {
		...latest ? { latest } : {},
		...memory.maxRssBytes !== void 0 ? { maxRssBytes: readNumber(memory.maxRssBytes, "snapshot.summary.memory.maxRssBytes") } : {},
		...memory.maxHeapUsedBytes !== void 0 ? { maxHeapUsedBytes: readNumber(memory.maxHeapUsedBytes, "snapshot.summary.memory.maxHeapUsedBytes") } : {},
		pressureCount: readNumber(memory.pressureCount, "snapshot.summary.memory.pressureCount")
	};
}
function readOptionalPayloadLargeSummary(value) {
	if (value === void 0) return;
	const payloadLarge = readObject(value, "snapshot.summary.payloadLarge");
	return {
		count: readNumber(payloadLarge.count, "snapshot.summary.payloadLarge.count"),
		rejected: readNumber(payloadLarge.rejected, "snapshot.summary.payloadLarge.rejected"),
		truncated: readNumber(payloadLarge.truncated, "snapshot.summary.payloadLarge.truncated"),
		chunked: readNumber(payloadLarge.chunked, "snapshot.summary.payloadLarge.chunked"),
		bySurface: readNumberMap(payloadLarge.bySurface, "snapshot.summary.payloadLarge.bySurface")
	};
}
function readStabilityEventRecord(value, label) {
	const record = readObject(value, label);
	const sanitized = {
		seq: readNumber(record.seq, `${label}.seq`),
		ts: readTimestampMs(record.ts, `${label}.ts`),
		type: readCodeString(record.type, `${label}.type`)
	};
	assignOptionalCodeString(sanitized, "channel", record.channel, `${label}.channel`);
	assignOptionalCodeString(sanitized, "pluginId", record.pluginId, `${label}.pluginId`);
	assignOptionalCodeString(sanitized, "source", record.source, `${label}.source`);
	assignOptionalCodeString(sanitized, "surface", record.surface, `${label}.surface`);
	assignOptionalCodeString(sanitized, "action", record.action, `${label}.action`);
	assignOptionalCodeString(sanitized, "reason", record.reason, `${label}.reason`);
	assignOptionalCodeString(sanitized, "outcome", record.outcome, `${label}.outcome`);
	assignOptionalCodeString(sanitized, "level", record.level, `${label}.level`);
	assignOptionalCodeString(sanitized, "detector", record.detector, `${label}.detector`);
	assignOptionalCodeString(sanitized, "toolName", record.toolName, `${label}.toolName`);
	assignOptionalCodeString(sanitized, "pairedToolName", record.pairedToolName, `${label}.pairedToolName`);
	assignOptionalCodeString(sanitized, "provider", record.provider, `${label}.provider`);
	assignOptionalCodeString(sanitized, "model", record.model, `${label}.model`);
	assignOptionalNumber(sanitized, "durationMs", record.durationMs, `${label}.durationMs`);
	assignOptionalNumber(sanitized, "requestBytes", record.requestBytes, `${label}.requestBytes`);
	assignOptionalNumber(sanitized, "responseBytes", record.responseBytes, `${label}.responseBytes`);
	assignOptionalNumber(sanitized, "timeToFirstByteMs", record.timeToFirstByteMs, `${label}.timeToFirstByteMs`);
	assignOptionalNumber(sanitized, "costUsd", record.costUsd, `${label}.costUsd`);
	assignOptionalNumber(sanitized, "count", record.count, `${label}.count`);
	assignOptionalNumber(sanitized, "bytes", record.bytes, `${label}.bytes`);
	assignOptionalNumber(sanitized, "limitBytes", record.limitBytes, `${label}.limitBytes`);
	assignOptionalNumber(sanitized, "thresholdBytes", record.thresholdBytes, `${label}.thresholdBytes`);
	assignOptionalNumber(sanitized, "rssGrowthBytes", record.rssGrowthBytes, `${label}.rssGrowthBytes`);
	assignOptionalNumber(sanitized, "windowMs", record.windowMs, `${label}.windowMs`);
	assignOptionalNumber(sanitized, "ageMs", record.ageMs, `${label}.ageMs`);
	assignOptionalNumber(sanitized, "queueDepth", record.queueDepth, `${label}.queueDepth`);
	assignOptionalNumber(sanitized, "queueSize", record.queueSize, `${label}.queueSize`);
	assignOptionalNumber(sanitized, "waitMs", record.waitMs, `${label}.waitMs`);
	assignOptionalNumber(sanitized, "active", record.active, `${label}.active`);
	assignOptionalNumber(sanitized, "waiting", record.waiting, `${label}.waiting`);
	assignOptionalNumber(sanitized, "queued", record.queued, `${label}.queued`);
	if (record.webhooks !== void 0) {
		const webhooks = readObject(record.webhooks, `${label}.webhooks`);
		sanitized.webhooks = {
			received: readNumber(webhooks.received, `${label}.webhooks.received`),
			processed: readNumber(webhooks.processed, `${label}.webhooks.processed`),
			errors: readNumber(webhooks.errors, `${label}.webhooks.errors`)
		};
	}
	if (record.memory !== void 0) sanitized.memory = readMemoryUsage(record.memory, `${label}.memory`);
	if (record.usage !== void 0) {
		const usage = readObject(record.usage, `${label}.usage`);
		sanitized.usage = {
			...usage.input !== void 0 ? { input: readNumber(usage.input, `${label}.usage.input`) } : {},
			...usage.output !== void 0 ? { output: readNumber(usage.output, `${label}.usage.output`) } : {},
			...usage.cacheRead !== void 0 ? { cacheRead: readNumber(usage.cacheRead, `${label}.usage.cacheRead`) } : {},
			...usage.cacheWrite !== void 0 ? { cacheWrite: readNumber(usage.cacheWrite, `${label}.usage.cacheWrite`) } : {},
			...usage.promptTokens !== void 0 ? { promptTokens: readNumber(usage.promptTokens, `${label}.usage.promptTokens`) } : {},
			...usage.total !== void 0 ? { total: readNumber(usage.total, `${label}.usage.total`) } : {}
		};
	}
	if (record.context !== void 0) {
		const context = readObject(record.context, `${label}.context`);
		sanitized.context = {
			...context.limit !== void 0 ? { limit: readNumber(context.limit, `${label}.context.limit`) } : {},
			...context.used !== void 0 ? { used: readNumber(context.used, `${label}.context.used`) } : {}
		};
	}
	return sanitized;
}
function readStabilitySnapshot(value) {
	const snapshot = readObject(value, "snapshot");
	const generatedAt = readTimestampString(snapshot.generatedAt, "snapshot.generatedAt");
	const capacity = readNumber(snapshot.capacity, "snapshot.capacity");
	const count = readNumber(snapshot.count, "snapshot.count");
	const dropped = readNumber(snapshot.dropped, "snapshot.dropped");
	const firstSeq = readOptionalNumber(snapshot.firstSeq, "snapshot.firstSeq");
	const lastSeq = readOptionalNumber(snapshot.lastSeq, "snapshot.lastSeq");
	if (!Array.isArray(snapshot.events)) throw new Error("Invalid stability bundle: snapshot.events must be an array");
	const events = snapshot.events.map((event, index) => readStabilityEventRecord(event, `snapshot.events[${index}]`));
	const summary = readObject(snapshot.summary, "snapshot.summary");
	return {
		generatedAt,
		capacity,
		count,
		dropped,
		...firstSeq !== void 0 ? { firstSeq } : {},
		...lastSeq !== void 0 ? { lastSeq } : {},
		events,
		summary: {
			byType: readNumberMap(summary.byType, "snapshot.summary.byType"),
			...summary.memory !== void 0 ? { memory: readOptionalMemorySummary(summary.memory) } : {},
			...summary.payloadLarge !== void 0 ? { payloadLarge: readOptionalPayloadLargeSummary(summary.payloadLarge) } : {}
		}
	};
}
function parseDiagnosticStabilityBundle(value) {
	const bundle = readObject(value, "bundle");
	if (bundle.version !== 1) throw new Error(`Unsupported stability bundle version: ${String(bundle.version)}`);
	const processInfo = readObject(bundle.process, "process");
	readObject(bundle.host, "host");
	const error = bundle.error === void 0 ? void 0 : readSafeErrorMetadata(bundle.error);
	return {
		version: 1,
		generatedAt: readTimestampString(bundle.generatedAt, "generatedAt"),
		reason: normalizeReason(readString(bundle.reason, "reason")),
		process: {
			pid: readNumber(processInfo.pid, "process.pid"),
			platform: readCodeString(processInfo.platform, "process.platform"),
			arch: readCodeString(processInfo.arch, "process.arch"),
			node: readCodeString(processInfo.node, "process.node"),
			uptimeMs: readNumber(processInfo.uptimeMs, "process.uptimeMs")
		},
		host: { hostname: REDACTED_HOSTNAME },
		...error ? { error } : {},
		snapshot: readStabilitySnapshot(bundle.snapshot)
	};
}
function listDiagnosticStabilityBundleFilesSync(options = {}) {
	const dir = resolveDiagnosticStabilityBundleDir(options);
	try {
		return fs.readdirSync(dir, { withFileTypes: true }).filter((entry) => entry.isFile() && isBundleFile(entry.name)).map((entry) => {
			const file = path.join(dir, entry.name);
			return {
				path: file,
				mtimeMs: fs.statSync(file).mtimeMs
			};
		}).toSorted((a, b) => b.mtimeMs - a.mtimeMs || b.path.localeCompare(a.path));
	} catch (error) {
		if (isMissingFileError(error)) return [];
		throw error;
	}
}
function readDiagnosticStabilityBundleFileSync(file) {
	try {
		const stat = fs.statSync(file);
		if (stat.size > 5242880) throw new Error(`Stability bundle is too large: ${stat.size} bytes exceeds ${MAX_DIAGNOSTIC_STABILITY_BUNDLE_BYTES}`);
		const raw = fs.readFileSync(file, "utf8");
		const bundle = parseDiagnosticStabilityBundle(JSON.parse(raw));
		return {
			status: "found",
			path: file,
			mtimeMs: stat.mtimeMs,
			bundle
		};
	} catch (error) {
		return {
			status: "failed",
			path: file,
			error
		};
	}
}
function readLatestDiagnosticStabilityBundleSync(options = {}) {
	try {
		const latest = listDiagnosticStabilityBundleFilesSync(options)[0];
		if (!latest) return {
			status: "missing",
			dir: resolveDiagnosticStabilityBundleDir(options)
		};
		return readDiagnosticStabilityBundleFileSync(latest.path);
	} catch (error) {
		return {
			status: "failed",
			error
		};
	}
}
function pruneOldBundles(dir, retention) {
	if (!Number.isFinite(retention) || retention < 1) return;
	try {
		const entries = fs.readdirSync(dir, { withFileTypes: true }).filter((entry) => entry.isFile() && isBundleFile(entry.name)).map((entry) => {
			const file = path.join(dir, entry.name);
			let mtimeMs = 0;
			try {
				mtimeMs = fs.statSync(file).mtimeMs;
			} catch {}
			return {
				file,
				mtimeMs
			};
		}).toSorted((a, b) => b.mtimeMs - a.mtimeMs || b.file.localeCompare(a.file));
		for (const entry of entries.slice(retention)) try {
			fs.unlinkSync(entry.file);
		} catch {}
	} catch {}
}
function writeDiagnosticStabilityBundleSync(options) {
	try {
		const now = options.now ?? /* @__PURE__ */ new Date();
		const snapshot = getDiagnosticStabilitySnapshot({ limit: options.limit ?? DEFAULT_DIAGNOSTIC_STABILITY_BUNDLE_LIMIT });
		if (!options.includeEmpty && snapshot.count === 0) return {
			status: "skipped",
			reason: "empty"
		};
		const reason = normalizeReason(options.reason);
		const error = options.error ? readSafeErrorMetadata(options.error) : void 0;
		const bundle = {
			version: 1,
			generatedAt: now.toISOString(),
			reason,
			process: {
				pid: process.pid,
				platform: process.platform,
				arch: process.arch,
				node: process.versions.node,
				uptimeMs: Math.round(process.uptime() * 1e3)
			},
			host: { hostname: REDACTED_HOSTNAME },
			...error ? { error } : {},
			snapshot
		};
		const dir = resolveDiagnosticStabilityBundleDir(options);
		fs.mkdirSync(dir, {
			recursive: true,
			mode: 448
		});
		const file = buildBundlePath(dir, now, reason);
		const tmpFile = `${file}.${process.pid}.tmp`;
		fs.writeFileSync(tmpFile, `${JSON.stringify(bundle, null, 2)}\n`, {
			encoding: "utf8",
			mode: 384
		});
		fs.renameSync(tmpFile, file);
		pruneOldBundles(dir, options.retention ?? 20);
		return {
			status: "written",
			path: file,
			bundle
		};
	} catch (error) {
		return {
			status: "failed",
			error
		};
	}
}
function writeDiagnosticStabilityBundleForFailureSync(reason, error, options = {}) {
	const result = writeDiagnosticStabilityBundleSync({
		...options,
		reason,
		error,
		includeEmpty: true
	});
	if (result.status === "written") return {
		status: "written",
		path: result.path,
		message: `wrote stability bundle: ${result.path}`
	};
	if (result.status === "failed") return {
		status: "failed",
		error: result.error,
		message: `failed to write stability bundle: ${String(result.error)}`
	};
	return result;
}
function installDiagnosticStabilityFatalHook(options = {}) {
	if (fatalHookUnsubscribe) return;
	fatalHookUnsubscribe = registerFatalErrorHook(({ reason, error }) => {
		const result = writeDiagnosticStabilityBundleForFailureSync(reason, error, options);
		return "message" in result ? result.message : void 0;
	});
}
function uninstallDiagnosticStabilityFatalHook() {
	fatalHookUnsubscribe?.();
	fatalHookUnsubscribe = null;
}
function resetDiagnosticStabilityBundleForTest() {
	uninstallDiagnosticStabilityFatalHook();
}
//#endregion
export { selectDiagnosticStabilitySnapshot as _, installDiagnosticStabilityFatalHook as a, readLatestDiagnosticStabilityBundleSync as c, uninstallDiagnosticStabilityFatalHook as d, writeDiagnosticStabilityBundleForFailureSync as f, resetDiagnosticStabilityRecorderForTest as g, normalizeDiagnosticStabilityQuery as h, MAX_DIAGNOSTIC_STABILITY_BUNDLE_BYTES as i, resetDiagnosticStabilityBundleForTest as l, getDiagnosticStabilitySnapshot as m, DEFAULT_DIAGNOSTIC_STABILITY_BUNDLE_RETENTION as n, listDiagnosticStabilityBundleFilesSync as o, writeDiagnosticStabilityBundleSync as p, DIAGNOSTIC_STABILITY_BUNDLE_VERSION as r, readDiagnosticStabilityBundleFileSync as s, DEFAULT_DIAGNOSTIC_STABILITY_BUNDLE_LIMIT as t, resolveDiagnosticStabilityBundleDir as u, startDiagnosticStabilityRecorder as v, stopDiagnosticStabilityRecorder as y };
