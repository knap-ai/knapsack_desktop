import { n as DEFAULT_MODEL, r as DEFAULT_PROVIDER } from "./defaults-BwiMD7ye.js";
import { t as resolveAgentModelFallbackValues } from "./model-input-DR9jgad-.js";
import { f as parseModelRef, g as resolveDefaultModelForAgent, h as resolveConfiguredModelRef, o as inferUniqueProviderFromConfiguredModels } from "./model-selection-8a6zD_aX.js";
import { _ as resolveStateDir } from "./paths-CD8i0MSg.js";
import { S as isCronRunSessionKey, T as parseAgentSessionKey, c as normalizeAgentId, l as normalizeMainKey } from "./session-key-D7XpmyVq.js";
import { m as resolveDefaultAgentId, o as resolveAgentEffectiveModelPrimary, p as resolveAgentWorkspaceDir, u as resolveAgentModelFallbacksOverride } from "./agent-scope-CYXg_wTS.js";
import { i as openBoundaryFileSync } from "./boundary-file-read-LPHTYrMX.js";
import { c as loadConfig } from "./io-DhtVmzAJ.js";
import { d as resolveAvatarMime, i as isAvatarHttpUrl, l as isWorkspaceRelativeAvatarPath, o as isPathWithinRoot, r as isAvatarDataUrl, t as AVATAR_MAX_BYTES } from "./avatar-policy-CgdIx-AA.js";
import "./config-CJQx-9zo.js";
import { n as saveJsonFile, t as loadJsonFile } from "./json-file-Cl6_4Szy.js";
import { S as buildGroupDisplayName, i as loadSessionStore } from "./store-BGmy-Wot.js";
import { i as resolveMainSessionKey, n as resolveAgentMainSessionKey, t as canonicalizeMainSessionAlias } from "./main-session-CFwamLE8.js";
import { n as resolveAllAgentSessionStoreTargetsSync } from "./sessions-DC7OiAdD.js";
import { l as resolveStorePath } from "./paths-DBIQqSpZ.js";
import { a as resolveFreshSessionTotalTokens } from "./types-KyI2zD1Y.js";
import { a as normalizeDeliveryContext, o as normalizeSessionDeliveryFields } from "./delivery-context-BV8uXbJ1.js";
import { r as hasInterSessionUserProvenance } from "./input-provenance-dFlyjP2J.js";
import { r as stripInlineDirectiveTagsForDisplay } from "./directive-tags-DiTMItsK.js";
import { n as resolveContextTokensForModel, t as lookupContextTokens } from "./context-awuvPcZd.js";
import { a as hasToolCall, c as hasNonzeroUsage, i as extractToolCallNames, n as stripMessageIdHints, s as deriveSessionTotalTokens, t as stripEnvelope, u as normalizeUsage } from "./chat-envelope-BIAAz1Jw.js";
import { i as resolveModelCostConfig, t as estimateUsageCost } from "./usage-format-DD-9lWqe.js";
import { n as stripInboundMetadata, t as extractInboundSenderLabel } from "./strip-inbound-meta-C9HIEAIs.js";
import { i as resolveSessionTranscriptCandidates } from "./session-transcript-files.fs-dASFx6Vt.js";
import fsSync from "node:fs";
import path from "node:path";
import os from "node:os";
//#region src/agents/subagent-lifecycle-events.ts
const SUBAGENT_TARGET_KIND_SUBAGENT = "subagent";
const SUBAGENT_ENDED_REASON_COMPLETE = "subagent-complete";
const SUBAGENT_ENDED_REASON_ERROR = "subagent-error";
const SUBAGENT_ENDED_REASON_KILLED = "subagent-killed";
const SUBAGENT_ENDED_OUTCOME_ERROR = "error";
const SUBAGENT_ENDED_OUTCOME_TIMEOUT = "timeout";
const SUBAGENT_ENDED_OUTCOME_KILLED = "killed";
//#endregion
//#region src/agents/subagent-registry-memory.ts
const subagentRuns = /* @__PURE__ */ new Map();
//#endregion
//#region src/agents/subagent-registry-queries.ts
function resolveControllerSessionKey(entry) {
	return entry.controllerSessionKey?.trim() || entry.requesterSessionKey;
}
function findRunIdsByChildSessionKeyFromRuns(runs, childSessionKey) {
	const key = childSessionKey.trim();
	if (!key) return [];
	const runIds = [];
	for (const [runId, entry] of runs.entries()) if (entry.childSessionKey === key) runIds.push(runId);
	return runIds;
}
function listRunsForRequesterFromRuns(runs, requesterSessionKey, options) {
	const key = requesterSessionKey.trim();
	if (!key) return [];
	const requesterRunId = options?.requesterRunId?.trim();
	const requesterRun = requesterRunId ? runs.get(requesterRunId) : void 0;
	const requesterRunMatchesScope = requesterRun && requesterRun.childSessionKey === key ? requesterRun : void 0;
	const lowerBound = requesterRunMatchesScope?.startedAt ?? requesterRunMatchesScope?.createdAt;
	const upperBound = requesterRunMatchesScope?.endedAt;
	return [...runs.values()].filter((entry) => {
		if (entry.requesterSessionKey !== key) return false;
		if (typeof lowerBound === "number" && entry.createdAt < lowerBound) return false;
		if (typeof upperBound === "number" && entry.createdAt > upperBound) return false;
		return true;
	});
}
function listRunsForControllerFromRuns(runs, controllerSessionKey) {
	const key = controllerSessionKey.trim();
	if (!key) return [];
	return [...runs.values()].filter((entry) => resolveControllerSessionKey(entry) === key);
}
function findLatestRunForChildSession(runs, childSessionKey) {
	const key = childSessionKey.trim();
	if (!key) return;
	let latest;
	for (const entry of runs.values()) {
		if (entry.childSessionKey !== key) continue;
		if (!latest || entry.createdAt > latest.createdAt) latest = entry;
	}
	return latest;
}
function resolveRequesterForChildSessionFromRuns(runs, childSessionKey) {
	const latest = findLatestRunForChildSession(runs, childSessionKey);
	if (!latest) return null;
	return {
		requesterSessionKey: latest.requesterSessionKey,
		requesterOrigin: latest.requesterOrigin
	};
}
function shouldIgnorePostCompletionAnnounceForSessionFromRuns(runs, childSessionKey) {
	const latest = findLatestRunForChildSession(runs, childSessionKey);
	return Boolean(latest && latest.spawnMode !== "session" && typeof latest.endedAt === "number" && typeof latest.cleanupCompletedAt === "number" && latest.cleanupCompletedAt >= latest.endedAt);
}
function countActiveRunsForSessionFromRuns(runs, controllerSessionKey) {
	const key = controllerSessionKey.trim();
	if (!key) return 0;
	const pendingDescendantCache = /* @__PURE__ */ new Map();
	const pendingDescendantCount = (sessionKey) => {
		if (pendingDescendantCache.has(sessionKey)) return pendingDescendantCache.get(sessionKey) ?? 0;
		const pending = countPendingDescendantRunsInternal(runs, sessionKey);
		pendingDescendantCache.set(sessionKey, pending);
		return pending;
	};
	const latestByChildSessionKey = /* @__PURE__ */ new Map();
	for (const entry of runs.values()) {
		if (resolveControllerSessionKey(entry) !== key) continue;
		const existing = latestByChildSessionKey.get(entry.childSessionKey);
		if (!existing || entry.createdAt > existing.createdAt) latestByChildSessionKey.set(entry.childSessionKey, entry);
	}
	let count = 0;
	for (const entry of latestByChildSessionKey.values()) {
		if (typeof entry.endedAt !== "number") {
			count += 1;
			continue;
		}
		if (pendingDescendantCount(entry.childSessionKey) > 0) count += 1;
	}
	return count;
}
function forEachDescendantRun(runs, rootSessionKey, visitor) {
	const root = rootSessionKey.trim();
	if (!root) return false;
	const pending = [root];
	const visited = new Set([root]);
	for (let index = 0; index < pending.length; index += 1) {
		const requester = pending[index];
		if (!requester) continue;
		const latestByChildSessionKey = /* @__PURE__ */ new Map();
		for (const [runId, entry] of runs.entries()) {
			if (entry.requesterSessionKey !== requester) continue;
			const childKey = entry.childSessionKey.trim();
			const existing = latestByChildSessionKey.get(childKey);
			if (!existing || entry.createdAt > existing[1].createdAt) latestByChildSessionKey.set(childKey, [runId, entry]);
		}
		for (const [runId, entry] of latestByChildSessionKey.values()) {
			const latestForChildSession = findLatestRunForChildSession(runs, entry.childSessionKey);
			if (!latestForChildSession || latestForChildSession.runId !== runId || latestForChildSession.requesterSessionKey !== requester) continue;
			visitor(runId, entry);
			const childKey = entry.childSessionKey.trim();
			if (!childKey || visited.has(childKey)) continue;
			visited.add(childKey);
			pending.push(childKey);
		}
	}
	return true;
}
function countActiveDescendantRunsFromRuns(runs, rootSessionKey) {
	let count = 0;
	if (!forEachDescendantRun(runs, rootSessionKey, (_runId, entry) => {
		if (typeof entry.endedAt !== "number") count += 1;
	})) return 0;
	return count;
}
function countPendingDescendantRunsInternal(runs, rootSessionKey, excludeRunId) {
	const excludedRunId = excludeRunId?.trim();
	let count = 0;
	if (!forEachDescendantRun(runs, rootSessionKey, (runId, entry) => {
		const runEnded = typeof entry.endedAt === "number";
		const cleanupCompleted = typeof entry.cleanupCompletedAt === "number";
		if ((!runEnded || !cleanupCompleted) && runId !== excludedRunId) count += 1;
	})) return 0;
	return count;
}
function countPendingDescendantRunsFromRuns(runs, rootSessionKey) {
	return countPendingDescendantRunsInternal(runs, rootSessionKey);
}
function countPendingDescendantRunsExcludingRunFromRuns(runs, rootSessionKey, excludeRunId) {
	return countPendingDescendantRunsInternal(runs, rootSessionKey, excludeRunId);
}
function listDescendantRunsForRequesterFromRuns(runs, rootSessionKey) {
	const descendants = [];
	if (!forEachDescendantRun(runs, rootSessionKey, (_runId, entry) => {
		descendants.push(entry);
	})) return [];
	return descendants;
}
//#endregion
//#region src/agents/subagent-registry.store.ts
const REGISTRY_VERSION = 2;
function resolveSubagentStateDir(env = process.env) {
	if (env.OPENCLAW_STATE_DIR?.trim()) return resolveStateDir(env);
	if (env.VITEST || env.NODE_ENV === "test") return path.join(os.tmpdir(), "openclaw-test-state", String(process.pid));
	return resolveStateDir(env);
}
function resolveSubagentRegistryPath() {
	return path.join(resolveSubagentStateDir(process.env), "subagents", "runs.json");
}
function loadSubagentRegistryFromDisk() {
	const raw = loadJsonFile(resolveSubagentRegistryPath());
	if (!raw || typeof raw !== "object") return /* @__PURE__ */ new Map();
	const record = raw;
	if (record.version !== 1 && record.version !== 2) return /* @__PURE__ */ new Map();
	const runsRaw = record.runs;
	if (!runsRaw || typeof runsRaw !== "object") return /* @__PURE__ */ new Map();
	const out = /* @__PURE__ */ new Map();
	const isLegacy = record.version === 1;
	let migrated = false;
	for (const [runId, entry] of Object.entries(runsRaw)) {
		if (!entry || typeof entry !== "object") continue;
		const typed = entry;
		if (!typed.runId || typeof typed.runId !== "string") continue;
		const legacyCompletedAt = isLegacy && typeof typed.announceCompletedAt === "number" ? typed.announceCompletedAt : void 0;
		const cleanupCompletedAt = typeof typed.cleanupCompletedAt === "number" ? typed.cleanupCompletedAt : legacyCompletedAt;
		const cleanupHandled = typeof typed.cleanupHandled === "boolean" ? typed.cleanupHandled : isLegacy ? Boolean(typed.announceHandled ?? cleanupCompletedAt) : void 0;
		const requesterOrigin = normalizeDeliveryContext(typed.requesterOrigin ?? {
			channel: typeof typed.requesterChannel === "string" ? typed.requesterChannel : void 0,
			accountId: typeof typed.requesterAccountId === "string" ? typed.requesterAccountId : void 0
		});
		const { announceCompletedAt: _announceCompletedAt, announceHandled: _announceHandled, requesterChannel: _channel, requesterAccountId: _accountId, ...rest } = typed;
		out.set(runId, {
			...rest,
			requesterOrigin,
			cleanupCompletedAt,
			cleanupHandled,
			spawnMode: typed.spawnMode === "session" ? "session" : "run"
		});
		if (isLegacy) migrated = true;
	}
	if (migrated) try {
		saveSubagentRegistryToDisk(out);
	} catch {}
	return out;
}
function saveSubagentRegistryToDisk(runs) {
	const pathname = resolveSubagentRegistryPath();
	const serialized = {};
	for (const [runId, entry] of runs.entries()) serialized[runId] = entry;
	saveJsonFile(pathname, {
		version: REGISTRY_VERSION,
		runs: serialized
	});
}
//#endregion
//#region src/agents/subagent-registry-state.ts
function persistSubagentRunsToDisk(runs) {
	try {
		saveSubagentRegistryToDisk(runs);
	} catch {}
}
function restoreSubagentRunsFromDisk(params) {
	const restored = loadSubagentRegistryFromDisk();
	if (restored.size === 0) return 0;
	let added = 0;
	for (const [runId, entry] of restored.entries()) {
		if (!runId || !entry) continue;
		if (params.mergeOnly && params.runs.has(runId)) continue;
		params.runs.set(runId, entry);
		added += 1;
	}
	return added;
}
function getSubagentRunsSnapshotForRead(inMemoryRuns) {
	const merged = /* @__PURE__ */ new Map();
	if (process.env.OPENCLAW_TEST_READ_SUBAGENT_RUNS_FROM_DISK === "1" || !(process.env.VITEST || false)) try {
		for (const [runId, entry] of loadSubagentRegistryFromDisk().entries()) merged.set(runId, entry);
	} catch {}
	for (const [runId, entry] of inMemoryRuns.entries()) merged.set(runId, entry);
	return merged;
}
//#endregion
//#region src/agents/subagent-registry-read.ts
function resolveSubagentSessionStartedAt(entry) {
	if (typeof entry.sessionStartedAt === "number" && Number.isFinite(entry.sessionStartedAt)) return entry.sessionStartedAt;
	if (typeof entry.startedAt === "number" && Number.isFinite(entry.startedAt)) return entry.startedAt;
	return typeof entry.createdAt === "number" && Number.isFinite(entry.createdAt) ? entry.createdAt : void 0;
}
function getSubagentSessionStartedAt(entry) {
	return entry ? resolveSubagentSessionStartedAt(entry) : void 0;
}
function getSubagentSessionRuntimeMs(entry, now = Date.now()) {
	if (!entry) return;
	const accumulatedRuntimeMs = typeof entry.accumulatedRuntimeMs === "number" && Number.isFinite(entry.accumulatedRuntimeMs) ? Math.max(0, entry.accumulatedRuntimeMs) : 0;
	if (typeof entry.startedAt !== "number" || !Number.isFinite(entry.startedAt)) return entry.accumulatedRuntimeMs != null ? accumulatedRuntimeMs : void 0;
	const currentRunEndedAt = typeof entry.endedAt === "number" && Number.isFinite(entry.endedAt) ? entry.endedAt : now;
	return Math.max(0, accumulatedRuntimeMs + Math.max(0, currentRunEndedAt - entry.startedAt));
}
function resolveSubagentSessionStatus(entry) {
	if (!entry) return;
	if (!entry.endedAt) return "running";
	if (entry.endedReason === "subagent-killed") return "killed";
	const status = entry.outcome?.status;
	if (status === "error") return "failed";
	if (status === "timeout") return "timeout";
	return "done";
}
function listSubagentRunsForController(controllerSessionKey) {
	return listRunsForControllerFromRuns(getSubagentRunsSnapshotForRead(subagentRuns), controllerSessionKey);
}
function getSubagentRunByChildSessionKey(childSessionKey) {
	const key = childSessionKey.trim();
	if (!key) return null;
	let latestActive = null;
	let latestEnded = null;
	for (const entry of getSubagentRunsSnapshotForRead(subagentRuns).values()) {
		if (entry.childSessionKey !== key) continue;
		if (typeof entry.endedAt !== "number") {
			if (!latestActive || entry.createdAt > latestActive.createdAt) latestActive = entry;
			continue;
		}
		if (!latestEnded || entry.createdAt > latestEnded.createdAt) latestEnded = entry;
	}
	return latestActive ?? latestEnded;
}
function getSessionDisplaySubagentRunByChildSessionKey(childSessionKey) {
	const key = childSessionKey.trim();
	if (!key) return null;
	let latestInMemoryActive = null;
	let latestInMemoryEnded = null;
	for (const entry of subagentRuns.values()) {
		if (entry.childSessionKey !== key) continue;
		if (typeof entry.endedAt === "number") {
			if (!latestInMemoryEnded || entry.createdAt > latestInMemoryEnded.createdAt) latestInMemoryEnded = entry;
			continue;
		}
		if (!latestInMemoryActive || entry.createdAt > latestInMemoryActive.createdAt) latestInMemoryActive = entry;
	}
	if (latestInMemoryEnded || latestInMemoryActive) {
		if (latestInMemoryEnded && (!latestInMemoryActive || latestInMemoryEnded.createdAt > latestInMemoryActive.createdAt)) return latestInMemoryEnded;
		return latestInMemoryActive ?? latestInMemoryEnded;
	}
	return getSubagentRunByChildSessionKey(key);
}
function getLatestSubagentRunByChildSessionKey(childSessionKey) {
	const key = childSessionKey.trim();
	if (!key) return null;
	let latest = null;
	for (const entry of getSubagentRunsSnapshotForRead(subagentRuns).values()) {
		if (entry.childSessionKey !== key) continue;
		if (!latest || entry.createdAt > latest.createdAt) latest = entry;
	}
	return latest;
}
//#endregion
//#region src/infra/json-utf8-bytes.ts
function jsonUtf8Bytes(value) {
	try {
		return Buffer.byteLength(JSON.stringify(value), "utf8");
	} catch {
		return Buffer.byteLength(String(value), "utf8");
	}
}
//#endregion
//#region src/gateway/chat-sanitize.ts
function extractMessageSenderLabel(entry) {
	if (typeof entry.senderLabel === "string" && entry.senderLabel.trim()) return entry.senderLabel.trim();
	if (typeof entry.content === "string") return extractInboundSenderLabel(entry.content);
	if (Array.isArray(entry.content)) for (const item of entry.content) {
		if (!item || typeof item !== "object") continue;
		const text = item.text;
		if (typeof text !== "string") continue;
		const senderLabel = extractInboundSenderLabel(text);
		if (senderLabel) return senderLabel;
	}
	if (typeof entry.text === "string") return extractInboundSenderLabel(entry.text);
	return null;
}
function stripEnvelopeFromContentWithRole(content, stripUserEnvelope) {
	let changed = false;
	return {
		content: content.map((item) => {
			if (!item || typeof item !== "object") return item;
			const entry = item;
			if (entry.type !== "text" || typeof entry.text !== "string") return item;
			const inboundStripped = stripInboundMetadata(entry.text);
			const stripped = stripUserEnvelope ? stripMessageIdHints(stripEnvelope(inboundStripped)) : inboundStripped;
			if (stripped === entry.text) return item;
			changed = true;
			return {
				...entry,
				text: stripped
			};
		}),
		changed
	};
}
function stripEnvelopeFromMessage(message) {
	if (!message || typeof message !== "object") return message;
	const entry = message;
	const stripUserEnvelope = (typeof entry.role === "string" ? entry.role.toLowerCase() : "") === "user";
	let changed = false;
	const next = { ...entry };
	const senderLabel = stripUserEnvelope ? extractMessageSenderLabel(entry) : null;
	if (senderLabel && entry.senderLabel !== senderLabel) {
		next.senderLabel = senderLabel;
		changed = true;
	}
	if (typeof entry.content === "string") {
		const inboundStripped = stripInboundMetadata(entry.content);
		const stripped = stripUserEnvelope ? stripMessageIdHints(stripEnvelope(inboundStripped)) : inboundStripped;
		if (stripped !== entry.content) {
			next.content = stripped;
			changed = true;
		}
	} else if (Array.isArray(entry.content)) {
		const updated = stripEnvelopeFromContentWithRole(entry.content, stripUserEnvelope);
		if (updated.changed) {
			next.content = updated.content;
			changed = true;
		}
	} else if (typeof entry.text === "string") {
		const inboundStripped = stripInboundMetadata(entry.text);
		const stripped = stripUserEnvelope ? stripMessageIdHints(stripEnvelope(inboundStripped)) : inboundStripped;
		if (stripped !== entry.text) {
			next.text = stripped;
			changed = true;
		}
	}
	return changed ? next : message;
}
function stripEnvelopeFromMessages(messages) {
	if (messages.length === 0) return messages;
	let changed = false;
	const next = messages.map((message) => {
		const stripped = stripEnvelopeFromMessage(message);
		if (stripped !== message) changed = true;
		return stripped;
	});
	return changed ? next : messages;
}
//#endregion
//#region src/gateway/session-utils.fs.ts
const sessionTitleFieldsCache = /* @__PURE__ */ new Map();
const MAX_SESSION_TITLE_FIELDS_CACHE_ENTRIES = 5e3;
function readSessionTitleFieldsCacheKey(filePath, opts) {
	return `${filePath}\t${opts?.includeInterSession === true ? "1" : "0"}`;
}
function getCachedSessionTitleFields(cacheKey, stat) {
	const cached = sessionTitleFieldsCache.get(cacheKey);
	if (!cached) return null;
	if (cached.mtimeMs !== stat.mtimeMs || cached.size !== stat.size) {
		sessionTitleFieldsCache.delete(cacheKey);
		return null;
	}
	sessionTitleFieldsCache.delete(cacheKey);
	sessionTitleFieldsCache.set(cacheKey, cached);
	return {
		firstUserMessage: cached.firstUserMessage,
		lastMessagePreview: cached.lastMessagePreview
	};
}
function setCachedSessionTitleFields(cacheKey, stat, value) {
	sessionTitleFieldsCache.set(cacheKey, {
		...value,
		mtimeMs: stat.mtimeMs,
		size: stat.size
	});
	while (sessionTitleFieldsCache.size > MAX_SESSION_TITLE_FIELDS_CACHE_ENTRIES) {
		const oldestKey = sessionTitleFieldsCache.keys().next().value;
		if (typeof oldestKey !== "string" || !oldestKey) break;
		sessionTitleFieldsCache.delete(oldestKey);
	}
}
function attachOpenClawTranscriptMeta(message, meta) {
	if (!message || typeof message !== "object" || Array.isArray(message)) return message;
	const record = message;
	const existing = record.__openclaw && typeof record.__openclaw === "object" && !Array.isArray(record.__openclaw) ? record.__openclaw : {};
	return {
		...record,
		__openclaw: {
			...existing,
			...meta
		}
	};
}
function readSessionMessages(sessionId, storePath, sessionFile) {
	const filePath = resolveSessionTranscriptCandidates(sessionId, storePath, sessionFile).find((p) => fsSync.existsSync(p));
	if (!filePath) return [];
	const lines = fsSync.readFileSync(filePath, "utf-8").split(/\r?\n/);
	const messages = [];
	let messageSeq = 0;
	for (const line of lines) {
		if (!line.trim()) continue;
		try {
			const parsed = JSON.parse(line);
			if (parsed?.message) {
				messageSeq += 1;
				messages.push(attachOpenClawTranscriptMeta(parsed.message, {
					...typeof parsed.id === "string" ? { id: parsed.id } : {},
					seq: messageSeq
				}));
				continue;
			}
			if (parsed?.type === "compaction") {
				const ts = typeof parsed.timestamp === "string" ? Date.parse(parsed.timestamp) : NaN;
				const timestamp = Number.isFinite(ts) ? ts : Date.now();
				messageSeq += 1;
				messages.push({
					role: "system",
					content: [{
						type: "text",
						text: "Compaction"
					}],
					timestamp,
					__openclaw: {
						kind: "compaction",
						id: typeof parsed.id === "string" ? parsed.id : void 0,
						seq: messageSeq
					}
				});
			}
		} catch {}
	}
	return messages;
}
function capArrayByJsonBytes(items, maxBytes) {
	if (items.length === 0) return {
		items,
		bytes: 2
	};
	const parts = items.map((item) => jsonUtf8Bytes(item));
	let bytes = 2 + parts.reduce((a, b) => a + b, 0) + (items.length - 1);
	let start = 0;
	while (bytes > maxBytes && start < items.length - 1) {
		bytes -= parts[start] + 1;
		start += 1;
	}
	return {
		items: start > 0 ? items.slice(start) : items,
		bytes
	};
}
const MAX_LINES_TO_SCAN = 10;
function readSessionTitleFieldsFromTranscript(sessionId, storePath, sessionFile, agentId, opts) {
	const filePath = resolveSessionTranscriptCandidates(sessionId, storePath, sessionFile, agentId).find((p) => fsSync.existsSync(p));
	if (!filePath) return {
		firstUserMessage: null,
		lastMessagePreview: null
	};
	let stat;
	try {
		stat = fsSync.statSync(filePath);
	} catch {
		return {
			firstUserMessage: null,
			lastMessagePreview: null
		};
	}
	const cacheKey = readSessionTitleFieldsCacheKey(filePath, opts);
	const cached = getCachedSessionTitleFields(cacheKey, stat);
	if (cached) return cached;
	if (stat.size === 0) {
		const empty = {
			firstUserMessage: null,
			lastMessagePreview: null
		};
		setCachedSessionTitleFields(cacheKey, stat, empty);
		return empty;
	}
	let fd = null;
	try {
		fd = fsSync.openSync(filePath, "r");
		const size = stat.size;
		let firstUserMessage = null;
		try {
			const chunk = readTranscriptHeadChunk(fd);
			if (chunk) firstUserMessage = extractFirstUserMessageFromTranscriptChunk(chunk, opts);
		} catch {}
		let lastMessagePreview = null;
		try {
			lastMessagePreview = readLastMessagePreviewFromOpenTranscript({
				fd,
				size
			});
		} catch {}
		const result = {
			firstUserMessage,
			lastMessagePreview
		};
		setCachedSessionTitleFields(cacheKey, stat, result);
		return result;
	} catch {
		return {
			firstUserMessage: null,
			lastMessagePreview: null
		};
	} finally {
		if (fd !== null) try {
			fsSync.closeSync(fd);
		} catch {}
	}
}
function extractTextFromContent(content) {
	if (typeof content === "string") return stripInlineDirectiveTagsForDisplay(content).text.trim() || null;
	if (!Array.isArray(content)) return null;
	for (const part of content) {
		if (!part || typeof part.text !== "string") continue;
		if (part.type === "text" || part.type === "output_text" || part.type === "input_text") {
			const normalized = stripInlineDirectiveTagsForDisplay(part.text).text.trim();
			if (normalized) return normalized;
		}
	}
	return null;
}
function readTranscriptHeadChunk(fd, maxBytes = 8192) {
	const buf = Buffer.alloc(maxBytes);
	const bytesRead = fsSync.readSync(fd, buf, 0, buf.length, 0);
	if (bytesRead <= 0) return null;
	return buf.toString("utf-8", 0, bytesRead);
}
function extractFirstUserMessageFromTranscriptChunk(chunk, opts) {
	const lines = chunk.split(/\r?\n/).slice(0, MAX_LINES_TO_SCAN);
	for (const line of lines) {
		if (!line.trim()) continue;
		try {
			const msg = JSON.parse(line)?.message;
			if (msg?.role !== "user") continue;
			if (opts?.includeInterSession !== true && hasInterSessionUserProvenance(msg)) continue;
			const text = extractTextFromContent(msg.content);
			if (text) return text;
		} catch {}
	}
	return null;
}
function findExistingTranscriptPath(sessionId, storePath, sessionFile, agentId) {
	return resolveSessionTranscriptCandidates(sessionId, storePath, sessionFile, agentId).find((p) => fsSync.existsSync(p)) ?? null;
}
function withOpenTranscriptFd(filePath, read) {
	let fd = null;
	try {
		fd = fsSync.openSync(filePath, "r");
		return read(fd);
	} catch {} finally {
		if (fd !== null) fsSync.closeSync(fd);
	}
	return null;
}
const LAST_MSG_MAX_BYTES = 16384;
const LAST_MSG_MAX_LINES = 20;
function readLastMessagePreviewFromOpenTranscript(params) {
	const readStart = Math.max(0, params.size - LAST_MSG_MAX_BYTES);
	const readLen = Math.min(params.size, LAST_MSG_MAX_BYTES);
	const buf = Buffer.alloc(readLen);
	fsSync.readSync(params.fd, buf, 0, readLen, readStart);
	const tailLines = buf.toString("utf-8").split(/\r?\n/).filter((l) => l.trim()).slice(-LAST_MSG_MAX_LINES);
	for (let i = tailLines.length - 1; i >= 0; i--) {
		const line = tailLines[i];
		try {
			const msg = JSON.parse(line)?.message;
			if (msg?.role !== "user" && msg?.role !== "assistant") continue;
			const text = extractTextFromContent(msg.content);
			if (text) return text;
		} catch {}
	}
	return null;
}
function extractTranscriptUsageCost(raw) {
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) return;
	const cost = raw.cost;
	if (!cost || typeof cost !== "object" || Array.isArray(cost)) return;
	const total = cost.total;
	return typeof total === "number" && Number.isFinite(total) && total >= 0 ? total : void 0;
}
function resolvePositiveUsageNumber(value) {
	return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : void 0;
}
function extractLatestUsageFromTranscriptChunk(chunk) {
	const lines = chunk.split(/\r?\n/).filter((line) => line.trim().length > 0);
	const snapshot = {};
	let sawSnapshot = false;
	let inputTokens = 0;
	let outputTokens = 0;
	let cacheRead = 0;
	let cacheWrite = 0;
	let sawInputTokens = false;
	let sawOutputTokens = false;
	let sawCacheRead = false;
	let sawCacheWrite = false;
	let costUsdTotal = 0;
	let sawCost = false;
	for (const line of lines) try {
		const parsed = JSON.parse(line);
		const message = parsed.message && typeof parsed.message === "object" && !Array.isArray(parsed.message) ? parsed.message : void 0;
		if (!message) continue;
		const role = typeof message.role === "string" ? message.role : void 0;
		if (role && role !== "assistant") continue;
		const usageRaw = message.usage && typeof message.usage === "object" && !Array.isArray(message.usage) ? message.usage : parsed.usage && typeof parsed.usage === "object" && !Array.isArray(parsed.usage) ? parsed.usage : void 0;
		const usage = normalizeUsage(usageRaw);
		const totalTokens = resolvePositiveUsageNumber(deriveSessionTotalTokens({ usage }));
		const costUsd = extractTranscriptUsageCost(usageRaw);
		const modelProvider = typeof message.provider === "string" ? message.provider.trim() : typeof parsed.provider === "string" ? parsed.provider.trim() : void 0;
		const model = typeof message.model === "string" ? message.model.trim() : typeof parsed.model === "string" ? parsed.model.trim() : void 0;
		const isDeliveryMirror = modelProvider === "openclaw" && model === "delivery-mirror";
		const hasMeaningfulUsage = hasNonzeroUsage(usage) || typeof totalTokens === "number" || typeof costUsd === "number" && Number.isFinite(costUsd);
		if (!hasMeaningfulUsage && !Boolean(modelProvider || model)) continue;
		if (isDeliveryMirror && !hasMeaningfulUsage) continue;
		sawSnapshot = true;
		if (!isDeliveryMirror) {
			if (modelProvider) snapshot.modelProvider = modelProvider;
			if (model) snapshot.model = model;
		}
		if (typeof usage?.input === "number" && Number.isFinite(usage.input)) {
			inputTokens += usage.input;
			sawInputTokens = true;
		}
		if (typeof usage?.output === "number" && Number.isFinite(usage.output)) {
			outputTokens += usage.output;
			sawOutputTokens = true;
		}
		if (typeof usage?.cacheRead === "number" && Number.isFinite(usage.cacheRead)) {
			cacheRead += usage.cacheRead;
			sawCacheRead = true;
		}
		if (typeof usage?.cacheWrite === "number" && Number.isFinite(usage.cacheWrite)) {
			cacheWrite += usage.cacheWrite;
			sawCacheWrite = true;
		}
		if (typeof totalTokens === "number") {
			snapshot.totalTokens = totalTokens;
			snapshot.totalTokensFresh = true;
		}
		if (typeof costUsd === "number" && Number.isFinite(costUsd)) {
			costUsdTotal += costUsd;
			sawCost = true;
		}
	} catch {}
	if (!sawSnapshot) return null;
	if (sawInputTokens) snapshot.inputTokens = inputTokens;
	if (sawOutputTokens) snapshot.outputTokens = outputTokens;
	if (sawCacheRead) snapshot.cacheRead = cacheRead;
	if (sawCacheWrite) snapshot.cacheWrite = cacheWrite;
	if (sawCost) snapshot.costUsd = costUsdTotal;
	return snapshot;
}
function readLatestSessionUsageFromTranscript(sessionId, storePath, sessionFile, agentId) {
	const filePath = findExistingTranscriptPath(sessionId, storePath, sessionFile, agentId);
	if (!filePath) return null;
	return withOpenTranscriptFd(filePath, (fd) => {
		if (fsSync.fstatSync(fd).size === 0) return null;
		return extractLatestUsageFromTranscriptChunk(fsSync.readFileSync(fd, "utf-8"));
	});
}
const PREVIEW_READ_SIZES = [
	64 * 1024,
	256 * 1024,
	1024 * 1024
];
const PREVIEW_MAX_LINES = 200;
function normalizeRole(role, isTool) {
	if (isTool) return "tool";
	switch ((role ?? "").toLowerCase()) {
		case "user": return "user";
		case "assistant": return "assistant";
		case "system": return "system";
		case "tool": return "tool";
		default: return "other";
	}
}
function truncatePreviewText(text, maxChars) {
	if (maxChars <= 0 || text.length <= maxChars) return text;
	if (maxChars <= 3) return text.slice(0, maxChars);
	return `${text.slice(0, maxChars - 3)}...`;
}
function extractPreviewText(message) {
	if (typeof message.content === "string") {
		const normalized = stripInlineDirectiveTagsForDisplay(message.content).text.trim();
		return normalized ? normalized : null;
	}
	if (Array.isArray(message.content)) {
		const parts = message.content.map((entry) => typeof entry?.text === "string" ? stripInlineDirectiveTagsForDisplay(entry.text).text : "").filter((text) => text.trim().length > 0);
		if (parts.length > 0) return parts.join("\n").trim();
	}
	if (typeof message.text === "string") {
		const normalized = stripInlineDirectiveTagsForDisplay(message.text).text.trim();
		return normalized ? normalized : null;
	}
	return null;
}
function isToolCall(message) {
	return hasToolCall(message);
}
function extractToolNames(message) {
	return extractToolCallNames(message);
}
function extractMediaSummary(message) {
	if (!Array.isArray(message.content)) return null;
	for (const entry of message.content) {
		const raw = typeof entry?.type === "string" ? entry.type.trim().toLowerCase() : "";
		if (!raw || raw === "text" || raw === "toolcall" || raw === "tool_call") continue;
		return `[${raw}]`;
	}
	return null;
}
function buildPreviewItems(messages, maxItems, maxChars) {
	const items = [];
	for (const message of messages) {
		const toolCall = isToolCall(message);
		const role = normalizeRole(message.role, toolCall);
		let text = extractPreviewText(message);
		if (!text) {
			const toolNames = extractToolNames(message);
			if (toolNames.length > 0) {
				const shown = toolNames.slice(0, 2);
				const overflow = toolNames.length - shown.length;
				text = `call ${shown.join(", ")}`;
				if (overflow > 0) text += ` +${overflow}`;
			}
		}
		if (!text) text = extractMediaSummary(message);
		if (!text) continue;
		let trimmed = text.trim();
		if (!trimmed) continue;
		if (role === "user") trimmed = stripEnvelope(trimmed);
		trimmed = truncatePreviewText(trimmed, maxChars);
		items.push({
			role,
			text: trimmed
		});
	}
	if (items.length <= maxItems) return items;
	return items.slice(-maxItems);
}
function readRecentMessagesFromTranscript(filePath, maxMessages, readBytes) {
	let fd = null;
	try {
		fd = fsSync.openSync(filePath, "r");
		const size = fsSync.fstatSync(fd).size;
		if (size === 0) return [];
		const readStart = Math.max(0, size - readBytes);
		const readLen = Math.min(size, readBytes);
		const buf = Buffer.alloc(readLen);
		fsSync.readSync(fd, buf, 0, readLen, readStart);
		const tailLines = buf.toString("utf-8").split(/\r?\n/).filter((l) => l.trim()).slice(-PREVIEW_MAX_LINES);
		const collected = [];
		for (let i = tailLines.length - 1; i >= 0; i--) {
			const line = tailLines[i];
			try {
				const msg = JSON.parse(line)?.message;
				if (msg && typeof msg === "object") {
					collected.push(msg);
					if (collected.length >= maxMessages) break;
				}
			} catch {}
		}
		return collected.toReversed();
	} catch {
		return [];
	} finally {
		if (fd !== null) fsSync.closeSync(fd);
	}
}
function readSessionPreviewItemsFromTranscript(sessionId, storePath, sessionFile, agentId, maxItems, maxChars) {
	const filePath = resolveSessionTranscriptCandidates(sessionId, storePath, sessionFile, agentId).find((p) => fsSync.existsSync(p));
	if (!filePath) return [];
	const boundedItems = Math.max(1, Math.min(maxItems, 50));
	const boundedChars = Math.max(20, Math.min(maxChars, 2e3));
	for (const readSize of PREVIEW_READ_SIZES) {
		const messages = readRecentMessagesFromTranscript(filePath, boundedItems, readSize);
		if (messages.length > 0 || readSize === PREVIEW_READ_SIZES[PREVIEW_READ_SIZES.length - 1]) return buildPreviewItems(messages, boundedItems, boundedChars);
	}
	return [];
}
//#endregion
//#region src/gateway/session-utils.ts
const DERIVED_TITLE_MAX_LEN = 60;
function tryResolveExistingPath(value) {
	try {
		return fsSync.realpathSync(value);
	} catch {
		return null;
	}
}
function resolveIdentityAvatarUrl(cfg, agentId, avatar) {
	if (!avatar) return;
	const trimmed = avatar.trim();
	if (!trimmed) return;
	if (isAvatarDataUrl(trimmed) || isAvatarHttpUrl(trimmed)) return trimmed;
	if (!isWorkspaceRelativeAvatarPath(trimmed)) return;
	const workspaceDir = resolveAgentWorkspaceDir(cfg, agentId);
	const workspaceRoot = tryResolveExistingPath(workspaceDir) ?? path.resolve(workspaceDir);
	const resolvedCandidate = path.resolve(workspaceRoot, trimmed);
	if (!isPathWithinRoot(workspaceRoot, resolvedCandidate)) return;
	try {
		const opened = openBoundaryFileSync({
			absolutePath: resolvedCandidate,
			rootPath: workspaceRoot,
			rootRealPath: workspaceRoot,
			boundaryLabel: "workspace root",
			maxBytes: AVATAR_MAX_BYTES,
			skipLexicalRootCheck: true
		});
		if (!opened.ok) return;
		try {
			const buffer = fsSync.readFileSync(opened.fd);
			return `data:${resolveAvatarMime(resolvedCandidate)};base64,${buffer.toString("base64")}`;
		} finally {
			fsSync.closeSync(opened.fd);
		}
	} catch {
		return;
	}
}
function formatSessionIdPrefix(sessionId, updatedAt) {
	const prefix = sessionId.slice(0, 8);
	if (updatedAt && updatedAt > 0) return `${prefix} (${new Date(updatedAt).toISOString().slice(0, 10)})`;
	return prefix;
}
function truncateTitle(text, maxLen) {
	if (text.length <= maxLen) return text;
	const cut = text.slice(0, maxLen - 1);
	const lastSpace = cut.lastIndexOf(" ");
	if (lastSpace > maxLen * .6) return cut.slice(0, lastSpace) + "…";
	return cut + "…";
}
function deriveSessionTitle(entry, firstUserMessage) {
	if (!entry) return;
	if (entry.displayName?.trim()) return entry.displayName.trim();
	if (entry.subject?.trim()) return entry.subject.trim();
	if (firstUserMessage?.trim()) return truncateTitle(firstUserMessage.replace(/\s+/g, " ").trim(), DERIVED_TITLE_MAX_LEN);
	if (entry.sessionId) return formatSessionIdPrefix(entry.sessionId, entry.updatedAt);
}
function resolveSessionRuntimeMs(run, now) {
	return getSubagentSessionRuntimeMs(run, now);
}
function resolvePositiveNumber(value) {
	return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : void 0;
}
function resolveNonNegativeNumber(value) {
	return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : void 0;
}
function resolveEstimatedSessionCostUsd(params) {
	const explicitCostUsd = resolveNonNegativeNumber(params.explicitCostUsd ?? params.entry?.estimatedCostUsd);
	if (explicitCostUsd !== void 0) return explicitCostUsd;
	const input = resolvePositiveNumber(params.entry?.inputTokens);
	const output = resolvePositiveNumber(params.entry?.outputTokens);
	const cacheRead = resolvePositiveNumber(params.entry?.cacheRead);
	const cacheWrite = resolvePositiveNumber(params.entry?.cacheWrite);
	if (input === void 0 && output === void 0 && cacheRead === void 0 && cacheWrite === void 0) return;
	const cost = resolveModelCostConfig({
		provider: params.provider,
		model: params.model,
		config: params.cfg
	});
	if (!cost) return;
	return resolveNonNegativeNumber(estimateUsageCost({
		usage: {
			...input !== void 0 ? { input } : {},
			...output !== void 0 ? { output } : {},
			...cacheRead !== void 0 ? { cacheRead } : {},
			...cacheWrite !== void 0 ? { cacheWrite } : {}
		},
		cost
	}));
}
function resolveChildSessionKeys(controllerSessionKey, store) {
	const childSessionKeys = /* @__PURE__ */ new Set();
	for (const entry of listSubagentRunsForController(controllerSessionKey)) {
		const childSessionKey = entry.childSessionKey?.trim();
		if (!childSessionKey) continue;
		const latest = getSessionDisplaySubagentRunByChildSessionKey(childSessionKey);
		if ((latest?.controllerSessionKey?.trim() || latest?.requesterSessionKey?.trim()) !== controllerSessionKey) continue;
		childSessionKeys.add(childSessionKey);
	}
	for (const [key, entry] of Object.entries(store)) {
		if (!entry || key === controllerSessionKey) continue;
		const spawnedBy = entry.spawnedBy?.trim();
		const parentSessionKey = entry.parentSessionKey?.trim();
		if (spawnedBy !== controllerSessionKey && parentSessionKey !== controllerSessionKey) continue;
		const latest = getSessionDisplaySubagentRunByChildSessionKey(key);
		if (latest) {
			if ((latest.controllerSessionKey?.trim() || latest.requesterSessionKey?.trim()) !== controllerSessionKey) continue;
		}
		childSessionKeys.add(key);
	}
	const childSessions = Array.from(childSessionKeys);
	return childSessions.length > 0 ? childSessions : void 0;
}
function resolveTranscriptUsageFallback(params) {
	const entry = params.entry;
	if (!entry?.sessionId) return null;
	const parsed = parseAgentSessionKey(params.key);
	const agentId = parsed?.agentId ? normalizeAgentId(parsed.agentId) : resolveDefaultAgentId(params.cfg);
	const snapshot = readLatestSessionUsageFromTranscript(entry.sessionId, params.storePath, entry.sessionFile, agentId);
	if (!snapshot) return null;
	const modelProvider = snapshot.modelProvider ?? params.fallbackProvider;
	const model = snapshot.model ?? params.fallbackModel;
	const contextTokens = resolveContextTokensForModel({
		cfg: params.cfg,
		provider: modelProvider,
		model,
		allowAsyncLoad: false
	});
	const estimatedCostUsd = resolveEstimatedSessionCostUsd({
		cfg: params.cfg,
		provider: modelProvider,
		model,
		explicitCostUsd: snapshot.costUsd,
		entry: {
			inputTokens: snapshot.inputTokens,
			outputTokens: snapshot.outputTokens,
			cacheRead: snapshot.cacheRead,
			cacheWrite: snapshot.cacheWrite
		}
	});
	return {
		modelProvider,
		model,
		totalTokens: resolvePositiveNumber(snapshot.totalTokens),
		totalTokensFresh: snapshot.totalTokensFresh === true,
		contextTokens: resolvePositiveNumber(contextTokens),
		estimatedCostUsd
	};
}
function loadSessionEntry(sessionKey) {
	const cfg = loadConfig();
	const canonicalKey = resolveSessionStoreKey({
		cfg,
		sessionKey
	});
	const agentId = resolveSessionStoreAgentId(cfg, canonicalKey);
	const { storePath, store } = resolveGatewaySessionStoreLookup({
		cfg,
		key: sessionKey.trim(),
		canonicalKey,
		agentId
	});
	const freshestMatch = resolveFreshestSessionStoreMatchFromStoreKeys(store, resolveGatewaySessionStoreTarget({
		cfg,
		key: sessionKey.trim(),
		store
	}).storeKeys);
	const legacyKey = freshestMatch?.key !== canonicalKey ? freshestMatch?.key : void 0;
	return {
		cfg,
		storePath,
		store,
		entry: freshestMatch?.entry,
		canonicalKey,
		legacyKey
	};
}
function resolveFreshestSessionStoreMatchFromStoreKeys(store, storeKeys) {
	const matches = storeKeys.map((key) => {
		const entry = store[key];
		return entry ? {
			key,
			entry
		} : void 0;
	}).filter((match) => match !== void 0);
	if (matches.length === 0) return;
	if (matches.length === 1) return matches[0];
	return [...matches].toSorted((a, b) => (b.entry.updatedAt ?? 0) - (a.entry.updatedAt ?? 0))[0];
}
function resolveFreshestSessionEntryFromStoreKeys(store, storeKeys) {
	return resolveFreshestSessionStoreMatchFromStoreKeys(store, storeKeys)?.entry;
}
function findFreshestStoreMatch(store, ...candidates) {
	const matches = /* @__PURE__ */ new Map();
	for (const candidate of candidates) {
		const trimmed = candidate.trim();
		if (!trimmed) continue;
		const exact = store[trimmed];
		if (exact) matches.set(trimmed, {
			entry: exact,
			key: trimmed
		});
		for (const key of findStoreKeysIgnoreCase(store, trimmed)) {
			const entry = store[key];
			if (entry) matches.set(key, {
				entry,
				key
			});
		}
	}
	if (matches.size === 0) return;
	return [...matches.values()].toSorted((a, b) => (b.entry.updatedAt ?? 0) - (a.entry.updatedAt ?? 0))[0];
}
/**
* Find all on-disk store keys that match the given key case-insensitively.
* Returns every key from the store whose lowercased form equals the target's lowercased form.
*/
function findStoreKeysIgnoreCase(store, targetKey) {
	const lowered = targetKey.toLowerCase();
	const matches = [];
	for (const key of Object.keys(store)) if (key.toLowerCase() === lowered) matches.push(key);
	return matches;
}
/**
* Remove legacy key variants for one canonical session key.
* Candidates can include aliases (for example, "agent:ops:main" when canonical is "agent:ops:work").
*/
function pruneLegacyStoreKeys(params) {
	const keysToDelete = /* @__PURE__ */ new Set();
	for (const candidate of params.candidates) {
		const trimmed = String(candidate ?? "").trim();
		if (!trimmed) continue;
		if (trimmed !== params.canonicalKey) keysToDelete.add(trimmed);
		for (const match of findStoreKeysIgnoreCase(params.store, trimmed)) if (match !== params.canonicalKey) keysToDelete.add(match);
	}
	for (const key of keysToDelete) delete params.store[key];
}
function migrateAndPruneGatewaySessionStoreKey(params) {
	const target = resolveGatewaySessionStoreTarget({
		cfg: params.cfg,
		key: params.key,
		store: params.store
	});
	const primaryKey = target.canonicalKey;
	const freshestMatch = resolveFreshestSessionStoreMatchFromStoreKeys(params.store, target.storeKeys);
	if (freshestMatch) {
		const currentPrimary = params.store[primaryKey];
		if (!currentPrimary || (freshestMatch.entry.updatedAt ?? 0) > (currentPrimary.updatedAt ?? 0)) params.store[primaryKey] = freshestMatch.entry;
	}
	pruneLegacyStoreKeys({
		store: params.store,
		canonicalKey: primaryKey,
		candidates: target.storeKeys
	});
	return {
		target,
		primaryKey,
		entry: params.store[primaryKey]
	};
}
function classifySessionKey(key, entry) {
	if (key === "global") return "global";
	if (key === "unknown") return "unknown";
	if (entry?.chatType === "group" || entry?.chatType === "channel") return "group";
	if (key.includes(":group:") || key.includes(":channel:")) return "group";
	return "direct";
}
function parseGroupKey(key) {
	const parts = (parseAgentSessionKey(key)?.rest ?? key).split(":").filter(Boolean);
	if (parts.length >= 3) {
		const [channel, kind, ...rest] = parts;
		if (kind === "group" || kind === "channel") return {
			channel,
			kind,
			id: rest.join(":")
		};
	}
	return null;
}
function isStorePathTemplate(store) {
	return typeof store === "string" && store.includes("{agentId}");
}
function listExistingAgentIdsFromDisk() {
	const root = resolveStateDir();
	const agentsDir = path.join(root, "agents");
	try {
		return fsSync.readdirSync(agentsDir, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => normalizeAgentId(entry.name)).filter(Boolean);
	} catch {
		return [];
	}
}
function listConfiguredAgentIds(cfg) {
	const ids = /* @__PURE__ */ new Set();
	const defaultId = normalizeAgentId(resolveDefaultAgentId(cfg));
	ids.add(defaultId);
	for (const entry of cfg.agents?.list ?? []) if (entry?.id) ids.add(normalizeAgentId(entry.id));
	for (const id of listExistingAgentIdsFromDisk()) ids.add(id);
	const sorted = Array.from(ids).filter(Boolean);
	sorted.sort((a, b) => a.localeCompare(b));
	return sorted.includes(defaultId) ? [defaultId, ...sorted.filter((id) => id !== defaultId)] : sorted;
}
function normalizeFallbackList(values) {
	const out = [];
	const seen = /* @__PURE__ */ new Set();
	for (const value of values) {
		const trimmed = value.trim();
		if (!trimmed) continue;
		const key = trimmed.toLowerCase();
		if (seen.has(key)) continue;
		seen.add(key);
		out.push(trimmed);
	}
	return out;
}
function resolveGatewayAgentModel(cfg, agentId) {
	const primary = resolveAgentEffectiveModelPrimary(cfg, agentId)?.trim();
	const fallbackOverride = resolveAgentModelFallbacksOverride(cfg, agentId);
	const defaultFallbacks = resolveAgentModelFallbackValues(cfg.agents?.defaults?.model);
	const fallbacks = normalizeFallbackList(fallbackOverride ?? defaultFallbacks);
	if (!primary && fallbacks.length === 0) return;
	return {
		...primary ? { primary } : {},
		...fallbacks.length > 0 ? { fallbacks } : {}
	};
}
function listAgentsForGateway(cfg) {
	const defaultId = normalizeAgentId(resolveDefaultAgentId(cfg));
	const mainKey = normalizeMainKey(cfg.session?.mainKey);
	const scope = cfg.session?.scope ?? "per-sender";
	const configuredById = /* @__PURE__ */ new Map();
	for (const entry of cfg.agents?.list ?? []) {
		if (!entry?.id) continue;
		const identity = entry.identity ? {
			name: entry.identity.name?.trim() || void 0,
			theme: entry.identity.theme?.trim() || void 0,
			emoji: entry.identity.emoji?.trim() || void 0,
			avatar: entry.identity.avatar?.trim() || void 0,
			avatarUrl: resolveIdentityAvatarUrl(cfg, normalizeAgentId(entry.id), entry.identity.avatar?.trim())
		} : void 0;
		configuredById.set(normalizeAgentId(entry.id), {
			name: typeof entry.name === "string" && entry.name.trim() ? entry.name.trim() : void 0,
			identity
		});
	}
	const explicitIds = new Set((cfg.agents?.list ?? []).map((entry) => entry?.id ? normalizeAgentId(entry.id) : "").filter(Boolean));
	const allowedIds = explicitIds.size > 0 ? new Set([...explicitIds, defaultId]) : null;
	let agentIds = listConfiguredAgentIds(cfg).filter((id) => allowedIds ? allowedIds.has(id) : true);
	if (mainKey && !agentIds.includes(mainKey) && (!allowedIds || allowedIds.has(mainKey))) agentIds = [...agentIds, mainKey];
	return {
		defaultId,
		mainKey,
		scope,
		agents: agentIds.map((id) => {
			const meta = configuredById.get(id);
			const model = resolveGatewayAgentModel(cfg, id);
			return {
				id,
				name: meta?.name,
				identity: meta?.identity,
				workspace: resolveAgentWorkspaceDir(cfg, id),
				...model ? { model } : {}
			};
		})
	};
}
function canonicalizeSessionKeyForAgent(agentId, key) {
	const lowered = key.toLowerCase();
	if (lowered === "global" || lowered === "unknown") return lowered;
	if (lowered.startsWith("agent:")) return lowered;
	return `agent:${normalizeAgentId(agentId)}:${lowered}`;
}
function resolveDefaultStoreAgentId(cfg) {
	return normalizeAgentId(resolveDefaultAgentId(cfg));
}
function resolveSessionStoreKey(params) {
	const raw = (params.sessionKey ?? "").trim();
	if (!raw) return raw;
	const rawLower = raw.toLowerCase();
	if (rawLower === "global" || rawLower === "unknown") return rawLower;
	const parsed = parseAgentSessionKey(raw);
	if (parsed) {
		const agentId = normalizeAgentId(parsed.agentId);
		const lowered = raw.toLowerCase();
		const canonical = canonicalizeMainSessionAlias({
			cfg: params.cfg,
			agentId,
			sessionKey: lowered
		});
		if (canonical !== lowered) return canonical;
		return lowered;
	}
	const lowered = raw.toLowerCase();
	const rawMainKey = normalizeMainKey(params.cfg.session?.mainKey);
	if (lowered === "main" || lowered === rawMainKey) return resolveMainSessionKey(params.cfg);
	return canonicalizeSessionKeyForAgent(resolveDefaultStoreAgentId(params.cfg), lowered);
}
function resolveSessionStoreAgentId(cfg, canonicalKey) {
	if (canonicalKey === "global" || canonicalKey === "unknown") return resolveDefaultStoreAgentId(cfg);
	const parsed = parseAgentSessionKey(canonicalKey);
	if (parsed?.agentId) return normalizeAgentId(parsed.agentId);
	return resolveDefaultStoreAgentId(cfg);
}
function canonicalizeSpawnedByForAgent(cfg, agentId, spawnedBy) {
	const raw = spawnedBy?.trim();
	if (!raw) return;
	const lower = raw.toLowerCase();
	if (lower === "global" || lower === "unknown") return lower;
	let result;
	if (raw.toLowerCase().startsWith("agent:")) result = raw.toLowerCase();
	else result = `agent:${normalizeAgentId(agentId)}:${lower}`;
	const parsed = parseAgentSessionKey(result);
	return canonicalizeMainSessionAlias({
		cfg,
		agentId: parsed?.agentId ? normalizeAgentId(parsed.agentId) : agentId,
		sessionKey: result
	});
}
function buildGatewaySessionStoreScanTargets(params) {
	const targets = /* @__PURE__ */ new Set();
	if (params.canonicalKey) targets.add(params.canonicalKey);
	if (params.key && params.key !== params.canonicalKey) targets.add(params.key);
	if (params.canonicalKey === "global" || params.canonicalKey === "unknown") return [...targets];
	const agentMainKey = resolveAgentMainSessionKey({
		cfg: params.cfg,
		agentId: params.agentId
	});
	if (params.canonicalKey === agentMainKey) targets.add(`agent:${params.agentId}:main`);
	return [...targets];
}
function resolveGatewaySessionStoreCandidates(cfg, agentId) {
	const storeConfig = cfg.session?.store;
	const defaultTarget = {
		agentId,
		storePath: resolveStorePath(storeConfig, { agentId })
	};
	if (!isStorePathTemplate(storeConfig)) return [defaultTarget];
	const targets = /* @__PURE__ */ new Map();
	targets.set(defaultTarget.storePath, defaultTarget);
	for (const target of resolveAllAgentSessionStoreTargetsSync(cfg)) if (target.agentId === agentId) targets.set(target.storePath, target);
	return [...targets.values()];
}
function resolveGatewaySessionStoreLookup(params) {
	const scanTargets = buildGatewaySessionStoreScanTargets(params);
	const candidates = resolveGatewaySessionStoreCandidates(params.cfg, params.agentId);
	const fallback = candidates[0] ?? {
		agentId: params.agentId,
		storePath: resolveStorePath(params.cfg.session?.store, { agentId: params.agentId })
	};
	let selectedStorePath = fallback.storePath;
	let selectedStore = params.initialStore ?? loadSessionStore(fallback.storePath);
	let selectedMatch = findFreshestStoreMatch(selectedStore, ...scanTargets);
	let selectedUpdatedAt = selectedMatch?.entry.updatedAt ?? Number.NEGATIVE_INFINITY;
	for (let index = 1; index < candidates.length; index += 1) {
		const candidate = candidates[index];
		if (!candidate) continue;
		const store = loadSessionStore(candidate.storePath);
		const match = findFreshestStoreMatch(store, ...scanTargets);
		if (!match) continue;
		const updatedAt = match.entry.updatedAt ?? 0;
		if (!selectedMatch || updatedAt >= selectedUpdatedAt) {
			selectedStorePath = candidate.storePath;
			selectedStore = store;
			selectedMatch = match;
			selectedUpdatedAt = updatedAt;
		}
	}
	return {
		storePath: selectedStorePath,
		store: selectedStore,
		match: selectedMatch
	};
}
function resolveGatewaySessionStoreTarget(params) {
	const key = params.key.trim();
	const canonicalKey = resolveSessionStoreKey({
		cfg: params.cfg,
		sessionKey: key
	});
	const agentId = resolveSessionStoreAgentId(params.cfg, canonicalKey);
	const { storePath, store } = resolveGatewaySessionStoreLookup({
		cfg: params.cfg,
		key,
		canonicalKey,
		agentId,
		initialStore: params.store
	});
	if (canonicalKey === "global" || canonicalKey === "unknown") return {
		agentId,
		storePath,
		canonicalKey,
		storeKeys: key && key !== canonicalKey ? [canonicalKey, key] : [key]
	};
	const storeKeys = /* @__PURE__ */ new Set();
	storeKeys.add(canonicalKey);
	if (key && key !== canonicalKey) storeKeys.add(key);
	if (params.scanLegacyKeys !== false) {
		const scanTargets = buildGatewaySessionStoreScanTargets({
			cfg: params.cfg,
			key,
			canonicalKey,
			agentId
		});
		for (const seed of scanTargets) for (const legacyKey of findStoreKeysIgnoreCase(store, seed)) storeKeys.add(legacyKey);
	}
	return {
		agentId,
		storePath,
		canonicalKey,
		storeKeys: Array.from(storeKeys)
	};
}
function mergeSessionEntryIntoCombined(params) {
	const { cfg, combined, entry, agentId, canonicalKey } = params;
	const existing = combined[canonicalKey];
	if (existing && (existing.updatedAt ?? 0) > (entry.updatedAt ?? 0)) combined[canonicalKey] = {
		...entry,
		...existing,
		spawnedBy: canonicalizeSpawnedByForAgent(cfg, agentId, existing.spawnedBy ?? entry.spawnedBy)
	};
	else combined[canonicalKey] = {
		...existing,
		...entry,
		spawnedBy: canonicalizeSpawnedByForAgent(cfg, agentId, entry.spawnedBy ?? existing?.spawnedBy)
	};
}
function loadCombinedSessionStoreForGateway(cfg) {
	const storeConfig = cfg.session?.store;
	if (storeConfig && !isStorePathTemplate(storeConfig)) {
		const storePath = resolveStorePath(storeConfig);
		const defaultAgentId = normalizeAgentId(resolveDefaultAgentId(cfg));
		const store = loadSessionStore(storePath);
		const combined = {};
		for (const [key, entry] of Object.entries(store)) mergeSessionEntryIntoCombined({
			cfg,
			combined,
			entry,
			agentId: defaultAgentId,
			canonicalKey: canonicalizeSessionKeyForAgent(defaultAgentId, key)
		});
		return {
			storePath,
			store: combined
		};
	}
	const targets = resolveAllAgentSessionStoreTargetsSync(cfg);
	const combined = {};
	for (const target of targets) {
		const agentId = target.agentId;
		const storePath = target.storePath;
		const store = loadSessionStore(storePath);
		for (const [key, entry] of Object.entries(store)) mergeSessionEntryIntoCombined({
			cfg,
			combined,
			entry,
			agentId,
			canonicalKey: canonicalizeSessionKeyForAgent(agentId, key)
		});
	}
	return {
		storePath: typeof storeConfig === "string" && storeConfig.trim() ? storeConfig.trim() : "(multiple)",
		store: combined
	};
}
function getSessionDefaults(cfg) {
	const resolved = resolveConfiguredModelRef({
		cfg,
		defaultProvider: DEFAULT_PROVIDER,
		defaultModel: DEFAULT_MODEL
	});
	const contextTokens = cfg.agents?.defaults?.contextTokens ?? lookupContextTokens(resolved.model, { allowAsyncLoad: false }) ?? 2e5;
	return {
		modelProvider: resolved.provider ?? null,
		model: resolved.model ?? null,
		contextTokens: contextTokens ?? null
	};
}
function resolveSessionModelRef(cfg, entry, agentId) {
	const resolved = agentId ? resolveDefaultModelForAgent({
		cfg,
		agentId
	}) : resolveConfiguredModelRef({
		cfg,
		defaultProvider: DEFAULT_PROVIDER,
		defaultModel: DEFAULT_MODEL
	});
	let provider = resolved.provider;
	let model = resolved.model;
	const runtimeModel = entry?.model?.trim();
	const runtimeProvider = entry?.modelProvider?.trim();
	if (runtimeModel) {
		if (runtimeProvider) return {
			provider: runtimeProvider,
			model: runtimeModel
		};
		const parsedRuntime = parseModelRef(runtimeModel, provider || "anthropic");
		if (parsedRuntime) {
			provider = parsedRuntime.provider;
			model = parsedRuntime.model;
		} else model = runtimeModel;
		return {
			provider,
			model
		};
	}
	const storedModelOverride = entry?.modelOverride?.trim();
	if (storedModelOverride) {
		const overrideProvider = entry?.providerOverride?.trim() || provider || "anthropic";
		const parsedOverride = parseModelRef(storedModelOverride, overrideProvider);
		if (parsedOverride) {
			provider = parsedOverride.provider;
			model = parsedOverride.model;
		} else {
			provider = overrideProvider;
			model = storedModelOverride;
		}
	}
	return {
		provider,
		model
	};
}
async function resolveGatewayModelSupportsImages(params) {
	if (!params.model) return true;
	try {
		const modelEntry = (await params.loadGatewayModelCatalog()).find((entry) => entry.id === params.model && (!params.provider || entry.provider === params.provider));
		return modelEntry ? modelEntry.input?.includes("image") ?? false : false;
	} catch {
		return false;
	}
}
function resolveSessionModelIdentityRef(cfg, entry, agentId, fallbackModelRef) {
	const runtimeModel = entry?.model?.trim();
	const runtimeProvider = entry?.modelProvider?.trim();
	if (runtimeModel) {
		if (runtimeProvider) return {
			provider: runtimeProvider,
			model: runtimeModel
		};
		const inferredProvider = inferUniqueProviderFromConfiguredModels({
			cfg,
			model: runtimeModel
		});
		if (inferredProvider) return {
			provider: inferredProvider,
			model: runtimeModel
		};
		if (runtimeModel.includes("/")) {
			const parsedRuntime = parseModelRef(runtimeModel, DEFAULT_PROVIDER);
			if (parsedRuntime) return {
				provider: parsedRuntime.provider,
				model: parsedRuntime.model
			};
			return { model: runtimeModel };
		}
		return { model: runtimeModel };
	}
	const fallbackRef = fallbackModelRef?.trim();
	if (fallbackRef) {
		const parsedFallback = parseModelRef(fallbackRef, DEFAULT_PROVIDER);
		if (parsedFallback) return {
			provider: parsedFallback.provider,
			model: parsedFallback.model
		};
		const inferredProvider = inferUniqueProviderFromConfiguredModels({
			cfg,
			model: fallbackRef
		});
		if (inferredProvider) return {
			provider: inferredProvider,
			model: fallbackRef
		};
		return { model: fallbackRef };
	}
	const resolved = resolveSessionModelRef(cfg, entry, agentId);
	return {
		provider: resolved.provider,
		model: resolved.model
	};
}
function buildGatewaySessionRow(params) {
	const { cfg, storePath, store, key, entry } = params;
	const now = params.now ?? Date.now();
	const updatedAt = entry?.updatedAt ?? null;
	const parsed = parseGroupKey(key);
	const channel = entry?.channel ?? parsed?.channel;
	const subject = entry?.subject;
	const groupChannel = entry?.groupChannel;
	const space = entry?.space;
	const id = parsed?.id;
	const origin = entry?.origin;
	const originLabel = origin?.label;
	const displayName = entry?.displayName ?? (channel ? buildGroupDisplayName({
		provider: channel,
		subject,
		groupChannel,
		space,
		id,
		key
	}) : void 0) ?? entry?.label ?? originLabel;
	const deliveryFields = normalizeSessionDeliveryFields(entry);
	const sessionAgentId = normalizeAgentId(parseAgentSessionKey(key)?.agentId ?? resolveDefaultAgentId(cfg));
	const subagentRun = getSessionDisplaySubagentRunByChildSessionKey(key);
	const subagentOwner = subagentRun?.controllerSessionKey?.trim() || subagentRun?.requesterSessionKey?.trim();
	const subagentStatus = subagentRun ? resolveSubagentSessionStatus(subagentRun) : void 0;
	const subagentStartedAt = subagentRun ? getSubagentSessionStartedAt(subagentRun) : void 0;
	const subagentEndedAt = subagentRun ? subagentRun.endedAt : void 0;
	const subagentRuntimeMs = subagentRun ? resolveSessionRuntimeMs(subagentRun, now) : void 0;
	const resolvedModel = resolveSessionModelIdentityRef(cfg, entry, sessionAgentId, subagentRun?.model);
	const runtimeModelPresent = Boolean(entry?.model?.trim()) || Boolean(entry?.modelProvider?.trim());
	const needsTranscriptTotalTokens = resolvePositiveNumber(resolveFreshSessionTotalTokens(entry)) === void 0;
	const needsTranscriptContextTokens = resolvePositiveNumber(entry?.contextTokens) === void 0;
	const needsTranscriptEstimatedCostUsd = resolveEstimatedSessionCostUsd({
		cfg,
		provider: resolvedModel.provider,
		model: resolvedModel.model ?? "claude-opus-4-6",
		entry
	}) === void 0;
	const transcriptUsage = needsTranscriptTotalTokens || needsTranscriptContextTokens || needsTranscriptEstimatedCostUsd ? resolveTranscriptUsageFallback({
		cfg,
		key,
		entry,
		storePath,
		fallbackProvider: resolvedModel.provider,
		fallbackModel: resolvedModel.model ?? "claude-opus-4-6"
	}) : null;
	const preferLiveSubagentModelIdentity = Boolean(subagentRun?.model?.trim()) && subagentStatus === "running";
	const shouldUseTranscriptModelIdentity = runtimeModelPresent && !preferLiveSubagentModelIdentity && (needsTranscriptTotalTokens || needsTranscriptContextTokens);
	const resolvedModelIdentity = {
		provider: resolvedModel.provider,
		model: resolvedModel.model ?? "claude-opus-4-6"
	};
	const { provider: modelProvider, model } = shouldUseTranscriptModelIdentity ? {
		provider: transcriptUsage?.modelProvider ?? resolvedModelIdentity.provider,
		model: transcriptUsage?.model ?? resolvedModelIdentity.model
	} : resolvedModelIdentity;
	const totalTokens = resolvePositiveNumber(resolveFreshSessionTotalTokens(entry)) ?? resolvePositiveNumber(transcriptUsage?.totalTokens);
	const totalTokensFresh = typeof totalTokens === "number" && Number.isFinite(totalTokens) && totalTokens > 0 ? true : transcriptUsage?.totalTokensFresh === true;
	const childSessions = resolveChildSessionKeys(key, store);
	const estimatedCostUsd = resolveEstimatedSessionCostUsd({
		cfg,
		provider: modelProvider,
		model,
		entry
	}) ?? resolveNonNegativeNumber(transcriptUsage?.estimatedCostUsd);
	const contextTokens = resolvePositiveNumber(entry?.contextTokens) ?? resolvePositiveNumber(transcriptUsage?.contextTokens) ?? resolvePositiveNumber(resolveContextTokensForModel({
		cfg,
		provider: modelProvider,
		model,
		allowAsyncLoad: false
	}));
	let derivedTitle;
	let lastMessagePreview;
	if (entry?.sessionId && (params.includeDerivedTitles || params.includeLastMessage)) {
		const fields = readSessionTitleFieldsFromTranscript(entry.sessionId, storePath, entry.sessionFile, sessionAgentId);
		if (params.includeDerivedTitles) derivedTitle = deriveSessionTitle(entry, fields.firstUserMessage);
		if (params.includeLastMessage && fields.lastMessagePreview) lastMessagePreview = fields.lastMessagePreview;
	}
	return {
		key,
		spawnedBy: subagentOwner || entry?.spawnedBy,
		spawnedWorkspaceDir: entry?.spawnedWorkspaceDir,
		forkedFromParent: entry?.forkedFromParent,
		spawnDepth: entry?.spawnDepth,
		subagentRole: entry?.subagentRole,
		subagentControlScope: entry?.subagentControlScope,
		kind: classifySessionKey(key, entry),
		label: entry?.label,
		displayName,
		derivedTitle,
		lastMessagePreview,
		channel,
		subject,
		groupChannel,
		space,
		chatType: entry?.chatType,
		origin,
		updatedAt,
		sessionId: entry?.sessionId,
		systemSent: entry?.systemSent,
		abortedLastRun: entry?.abortedLastRun,
		thinkingLevel: entry?.thinkingLevel,
		fastMode: entry?.fastMode,
		verboseLevel: entry?.verboseLevel,
		reasoningLevel: entry?.reasoningLevel,
		elevatedLevel: entry?.elevatedLevel,
		sendPolicy: entry?.sendPolicy,
		inputTokens: entry?.inputTokens,
		outputTokens: entry?.outputTokens,
		totalTokens,
		totalTokensFresh,
		estimatedCostUsd,
		status: subagentRun ? subagentStatus : entry?.status,
		startedAt: subagentRun ? subagentStartedAt : entry?.startedAt,
		endedAt: subagentRun ? subagentEndedAt : entry?.endedAt,
		runtimeMs: subagentRun ? subagentRuntimeMs : entry?.runtimeMs,
		parentSessionKey: subagentOwner || entry?.parentSessionKey,
		childSessions,
		responseUsage: entry?.responseUsage,
		modelProvider,
		model,
		contextTokens,
		deliveryContext: deliveryFields.deliveryContext,
		lastChannel: deliveryFields.lastChannel ?? entry?.lastChannel,
		lastTo: deliveryFields.lastTo ?? entry?.lastTo,
		lastAccountId: deliveryFields.lastAccountId ?? entry?.lastAccountId,
		lastThreadId: deliveryFields.lastThreadId ?? entry?.lastThreadId
	};
}
function loadGatewaySessionRow(sessionKey, options) {
	const { cfg, storePath, store, entry, canonicalKey } = loadSessionEntry(sessionKey);
	if (!entry) return null;
	return buildGatewaySessionRow({
		cfg,
		storePath,
		store,
		key: canonicalKey,
		entry,
		now: options?.now,
		includeDerivedTitles: options?.includeDerivedTitles,
		includeLastMessage: options?.includeLastMessage
	});
}
function listSessionsFromStore(params) {
	const { cfg, storePath, store, opts } = params;
	const now = Date.now();
	const includeGlobal = opts.includeGlobal === true;
	const includeUnknown = opts.includeUnknown === true;
	const includeDerivedTitles = opts.includeDerivedTitles === true;
	const includeLastMessage = opts.includeLastMessage === true;
	const spawnedBy = typeof opts.spawnedBy === "string" ? opts.spawnedBy : "";
	const label = typeof opts.label === "string" ? opts.label.trim() : "";
	const agentId = typeof opts.agentId === "string" ? normalizeAgentId(opts.agentId) : "";
	const search = typeof opts.search === "string" ? opts.search.trim().toLowerCase() : "";
	const activeMinutes = typeof opts.activeMinutes === "number" && Number.isFinite(opts.activeMinutes) ? Math.max(1, Math.floor(opts.activeMinutes)) : void 0;
	let sessions = Object.entries(store).filter(([key]) => {
		if (isCronRunSessionKey(key)) return false;
		if (!includeGlobal && key === "global") return false;
		if (!includeUnknown && key === "unknown") return false;
		if (agentId) {
			if (key === "global" || key === "unknown") return false;
			const parsed = parseAgentSessionKey(key);
			if (!parsed) return false;
			return normalizeAgentId(parsed.agentId) === agentId;
		}
		return true;
	}).filter(([key, entry]) => {
		if (!spawnedBy) return true;
		if (key === "unknown" || key === "global") return false;
		const latest = getSessionDisplaySubagentRunByChildSessionKey(key);
		if (latest) return (latest.controllerSessionKey?.trim() || latest.requesterSessionKey?.trim()) === spawnedBy;
		return entry?.spawnedBy === spawnedBy || entry?.parentSessionKey === spawnedBy;
	}).filter(([, entry]) => {
		if (!label) return true;
		return entry?.label === label;
	}).map(([key, entry]) => buildGatewaySessionRow({
		cfg,
		storePath,
		store,
		key,
		entry,
		now,
		includeDerivedTitles,
		includeLastMessage
	})).toSorted((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
	if (search) sessions = sessions.filter((s) => {
		return [
			s.displayName,
			s.label,
			s.subject,
			s.sessionId,
			s.key
		].some((f) => typeof f === "string" && f.toLowerCase().includes(search));
	});
	if (activeMinutes !== void 0) {
		const cutoff = now - activeMinutes * 6e4;
		sessions = sessions.filter((s) => (s.updatedAt ?? 0) >= cutoff);
	}
	if (typeof opts.limit === "number" && Number.isFinite(opts.limit)) {
		const limit = Math.max(1, Math.floor(opts.limit));
		sessions = sessions.slice(0, limit);
	}
	return {
		ts: now,
		path: storePath,
		count: sessions.length,
		defaults: getSessionDefaults(cfg),
		sessions
	};
}
//#endregion
export { findRunIdsByChildSessionKeyFromRuns as A, SUBAGENT_ENDED_REASON_COMPLETE as B, getSubagentRunsSnapshotForRead as C, countActiveRunsForSessionFromRuns as D, countActiveDescendantRunsFromRuns as E, shouldIgnorePostCompletionAnnounceForSessionFromRuns as F, SUBAGENT_ENDED_REASON_KILLED as H, subagentRuns as I, SUBAGENT_ENDED_OUTCOME_ERROR as L, listRunsForControllerFromRuns as M, listRunsForRequesterFromRuns as N, countPendingDescendantRunsExcludingRunFromRuns as O, resolveRequesterForChildSessionFromRuns as P, SUBAGENT_ENDED_OUTCOME_KILLED as R, getLatestSubagentRunByChildSessionKey as S, restoreSubagentRunsFromDisk as T, SUBAGENT_TARGET_KIND_SUBAGENT as U, SUBAGENT_ENDED_REASON_ERROR as V, readSessionMessages as _, loadCombinedSessionStoreForGateway as a, stripEnvelopeFromMessages as b, migrateAndPruneGatewaySessionStoreKey as c, resolveGatewayModelSupportsImages as d, resolveGatewaySessionStoreTarget as f, capArrayByJsonBytes as g, attachOpenClawTranscriptMeta as h, listSessionsFromStore as i, listDescendantRunsForRequesterFromRuns as j, countPendingDescendantRunsFromRuns as k, pruneLegacyStoreKeys as l, resolveSessionModelRef as m, classifySessionKey as n, loadGatewaySessionRow as o, resolveSessionModelIdentityRef as p, listAgentsForGateway as r, loadSessionEntry as s, canonicalizeSpawnedByForAgent as t, resolveFreshestSessionEntryFromStoreKeys as u, readSessionPreviewItemsFromTranscript as v, persistSubagentRunsToDisk as w, jsonUtf8Bytes as x, stripEnvelopeFromMessage as y, SUBAGENT_ENDED_OUTCOME_TIMEOUT as z };
