import { i as formatErrorMessage, o as hasErrnoCode } from "./errors-D8p6rxH8.js";
import { i as normalizeLowercaseStringOrEmpty, s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { c as escapeRegExp } from "./utils-D5DtWkEu.js";
import { n as defaultRuntime } from "./runtime-Dx7oeLYq.js";
import { t as createSubsystemLogger } from "./subsystem-Cgmckbux.js";
import { a as loadConfig } from "./io-5pxHCi7V.js";
import { b as isSubagentSessionKey, c as normalizeAgentId, h as toAgentStoreSessionKey, u as resolveAgentIdFromSessionKey, x as parseAgentSessionKey } from "./session-key-Bh1lMwK5.js";
import { t as getChannelPlugin } from "./registry-Delpa74L.js";
import { i as DEFAULT_HEARTBEAT_FILENAME } from "./workspace-hhTlRYqM.js";
import { _ as resolveAgentConfig, b as resolveAgentWorkspaceDir, x as resolveDefaultAgentId } from "./agent-scope-KFH9bkHi.js";
import "./config-Q9XZc_2I.js";
import { n as loadOrCreateDeviceIdentity } from "./device-identity-TBOlRcQx.js";
import "./plugins-D4ODSIPT.js";
import { r as resolveEffectiveMessagesConfig } from "./identity-B_Q39IGW.js";
import { c as updateSessionStore, o as saveSessionStore, t as archiveRemovedSessionTranscripts } from "./store-DFXcceZJ.js";
import { n as resolveAgentMainSessionKey, t as canonicalizeMainSessionAlias } from "./main-session-DtefsIzj.js";
import { u as resolveStorePath } from "./paths-CZMxg3hs.js";
import { c as resolveSessionResetPolicy, o as evaluateSessionFreshness } from "./reset-CkBotYFL.js";
import { t as loadSessionStore } from "./store-load-DjLNEIy9.js";
import { t as CommandLane } from "./lanes-CU7Ll8dR.js";
import { o as getQueueSize } from "./command-queue-BLDIg9zn.js";
import { t as HEARTBEAT_TOKEN } from "./tokens-CKM4Lddu.js";
import { a as parseHeartbeatTasks, i as isTaskDue, o as resolveHeartbeatPrompt$1, r as isHeartbeatContentEffectivelyEmpty, s as stripHeartbeatToken } from "./heartbeat-DYyKvnDp.js";
import { n as resolveHeartbeatIntervalMs, t as isHeartbeatEnabledForAgent } from "./heartbeat-summary-Cgk1PVlc.js";
import "./pi-embedded-runner-DN0VbqlW.js";
import { n as clearBootstrapSnapshotOnSessionRollover } from "./bootstrap-cache-DunTQvFV.js";
import { t as deliverOutboundPayloads } from "./deliver-BNvlWd4P.js";
import { p as resolveSendableOutboundReplyParts, s as hasOutboundReplyContent } from "./reply-payload-Db_8BQiX.js";
import { t as buildOutboundSessionContext } from "./session-context--WJ2aq2e.js";
import { n as resolveHeartbeatSenderContext, t as resolveHeartbeatDeliveryTarget } from "./targets-DbBSGhxR.js";
import { a as resolveHeartbeatReasonKind, n as requestHeartbeatNow, r as setHeartbeatWakeHandler, t as areHeartbeatsEnabled } from "./heartbeat-wake-a3GAt85y.js";
import { s as peekSystemEventEntries, t as consumeSystemEventEntries, u as resolveSystemEventDeliveryContext } from "./system-events-Dq_M0n12.js";
import { a as resolveEmbeddedSessionLane } from "./queue-bNmQjdDV.js";
import { i as resolveUserTimezone } from "./date-time-CH5CpFpu.js";
import { t as appendCronStyleCurrentTimeLine } from "./current-time-DumgMhEz.js";
import { t as resolveHeartbeatReplyPayload } from "./heartbeat-reply-payload-CkvYHqfG.js";
import { n as emitHeartbeatEvent, o as resolveIndicatorType, t as resolveHeartbeatVisibility } from "./heartbeat-visibility-K-nKdcA-.js";
import path from "node:path";
import fs from "node:fs/promises";
import crypto, { createHash } from "node:crypto";
//#region src/cron/isolated-agent/session.ts
function resolveCronSession(params) {
	const sessionCfg = params.cfg.session;
	const storePath = resolveStorePath(sessionCfg?.store, { agentId: params.agentId });
	const store = loadSessionStore(storePath);
	const entry = store[params.sessionKey];
	let sessionId;
	let isNewSession;
	let systemSent;
	if (!params.forceNew && entry?.sessionId) {
		const resetPolicy = resolveSessionResetPolicy({
			sessionCfg,
			resetType: "direct"
		});
		if (evaluateSessionFreshness({
			updatedAt: entry.updatedAt,
			now: params.nowMs,
			policy: resetPolicy
		}).fresh) {
			sessionId = entry.sessionId;
			isNewSession = false;
			systemSent = entry.systemSent ?? false;
		} else {
			sessionId = crypto.randomUUID();
			isNewSession = true;
			systemSent = false;
		}
	} else {
		sessionId = crypto.randomUUID();
		isNewSession = true;
		systemSent = false;
	}
	clearBootstrapSnapshotOnSessionRollover({
		sessionKey: params.sessionKey,
		previousSessionId: isNewSession ? entry?.sessionId : void 0
	});
	return {
		storePath,
		store,
		sessionEntry: {
			...entry,
			sessionId,
			updatedAt: params.nowMs,
			systemSent,
			...isNewSession && {
				lastChannel: void 0,
				lastTo: void 0,
				lastAccountId: void 0,
				lastThreadId: void 0,
				deliveryContext: void 0,
				sessionFile: void 0
			}
		},
		systemSent,
		isNewSession
	};
}
//#endregion
//#region src/infra/heartbeat-active-hours.ts
const ACTIVE_HOURS_TIME_PATTERN = /^(?:([01]\d|2[0-3]):([0-5]\d)|24:00)$/;
function resolveActiveHoursTimezone(cfg, raw) {
	const trimmed = raw?.trim();
	if (!trimmed || trimmed === "user") return resolveUserTimezone(cfg.agents?.defaults?.userTimezone);
	if (trimmed === "local") return Intl.DateTimeFormat().resolvedOptions().timeZone?.trim() || "UTC";
	try {
		new Intl.DateTimeFormat("en-US", { timeZone: trimmed }).format(/* @__PURE__ */ new Date());
		return trimmed;
	} catch {
		return resolveUserTimezone(cfg.agents?.defaults?.userTimezone);
	}
}
function parseActiveHoursTime(opts, raw) {
	if (!raw || !ACTIVE_HOURS_TIME_PATTERN.test(raw)) return null;
	const [hourStr, minuteStr] = raw.split(":");
	const hour = Number(hourStr);
	const minute = Number(minuteStr);
	if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
	if (hour === 24) {
		if (!opts.allow24 || minute !== 0) return null;
		return 1440;
	}
	return hour * 60 + minute;
}
function resolveMinutesInTimeZone(nowMs, timeZone) {
	try {
		const parts = new Intl.DateTimeFormat("en-US", {
			timeZone,
			hour: "2-digit",
			minute: "2-digit",
			hourCycle: "h23"
		}).formatToParts(new Date(nowMs));
		const map = {};
		for (const part of parts) if (part.type !== "literal") map[part.type] = part.value;
		const hour = Number(map.hour);
		const minute = Number(map.minute);
		if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
		return hour * 60 + minute;
	} catch {
		return null;
	}
}
function isWithinActiveHours(cfg, heartbeat, nowMs) {
	const active = heartbeat?.activeHours;
	if (!active) return true;
	const startMin = parseActiveHoursTime({ allow24: false }, active.start);
	const endMin = parseActiveHoursTime({ allow24: true }, active.end);
	if (startMin === null || endMin === null) return true;
	if (startMin === endMin) return false;
	const timeZone = resolveActiveHoursTimezone(cfg, active.timezone);
	const currentMin = resolveMinutesInTimeZone(nowMs ?? Date.now(), timeZone);
	if (currentMin === null) return true;
	if (endMin > startMin) return currentMin >= startMin && currentMin < endMin;
	return currentMin >= startMin || currentMin < endMin;
}
//#endregion
//#region src/infra/heartbeat-events-filter.ts
function buildCronEventPrompt(pendingEvents, opts) {
	const deliverToUser = opts?.deliverToUser ?? true;
	const eventText = pendingEvents.join("\n").trim();
	if (!eventText) {
		if (!deliverToUser) return "A scheduled cron event was triggered, but no event content was found. Handle this internally and reply HEARTBEAT_OK when nothing needs user-facing follow-up.";
		return "A scheduled cron event was triggered, but no event content was found. Reply HEARTBEAT_OK.";
	}
	if (!deliverToUser) return "A scheduled reminder has been triggered. The reminder content is:\n\n" + eventText + "\n\nHandle this reminder internally. Do not relay it to the user unless explicitly requested.";
	return "A scheduled reminder has been triggered. The reminder content is:\n\n" + eventText + "\n\nPlease relay this reminder to the user in a helpful and friendly way.";
}
function buildExecEventPrompt(opts) {
	if (!(opts?.deliverToUser ?? true)) return "An async command you ran earlier has completed. The result is shown in the system messages above. Handle the result internally. Do not relay it to the user unless explicitly requested.";
	return "An async command you ran earlier has completed. The result is shown in the system messages above. Please relay the command output to the user in a helpful way. If the command succeeded, share the relevant output. If it failed, explain what went wrong.";
}
const HEARTBEAT_OK_PREFIX = normalizeLowercaseStringOrEmpty(HEARTBEAT_TOKEN);
function isHeartbeatAckEvent(evt) {
	const trimmed = evt.trim();
	if (!trimmed) return false;
	const lower = normalizeLowercaseStringOrEmpty(trimmed);
	if (!lower.startsWith(HEARTBEAT_OK_PREFIX)) return false;
	const suffix = lower.slice(HEARTBEAT_OK_PREFIX.length);
	if (suffix.length === 0) return true;
	return !/[a-z0-9_]/.test(suffix[0]);
}
function isHeartbeatNoiseEvent(evt) {
	const lower = normalizeLowercaseStringOrEmpty(evt);
	if (!lower) return false;
	return isHeartbeatAckEvent(lower) || lower.includes("heartbeat poll") || lower.includes("heartbeat wake");
}
function isExecCompletionEvent(evt) {
	const normalized = normalizeLowercaseStringOrEmpty(evt).trimStart();
	return /^exec finished(?::|\s*\()/.test(normalized) || /^exec (completed|failed) \([a-z0-9_-]{1,64}, (code -?\d+|signal [^)]+)\)( :: .*)?$/.test(normalized);
}
function isCronSystemEvent(evt) {
	if (!evt.trim()) return false;
	return !isHeartbeatNoiseEvent(evt) && !isExecCompletionEvent(evt);
}
//#endregion
//#region src/infra/heartbeat-schedule.ts
function normalizeModulo(value, divisor) {
	return (value % divisor + divisor) % divisor;
}
function resolveHeartbeatPhaseMs(params) {
	const intervalMs = Math.max(1, Math.floor(params.intervalMs));
	return createHash("sha256").update(`${params.schedulerSeed}:${params.agentId}`).digest().readUInt32BE(0) % intervalMs;
}
function computeNextHeartbeatPhaseDueMs(params) {
	const intervalMs = Math.max(1, Math.floor(params.intervalMs));
	const nowMs = Math.floor(params.nowMs);
	let deltaMs = normalizeModulo(normalizeModulo(Math.floor(params.phaseMs), intervalMs) - normalizeModulo(nowMs, intervalMs), intervalMs);
	if (deltaMs === 0) deltaMs = intervalMs;
	return nowMs + deltaMs;
}
function resolveNextHeartbeatDueMs(params) {
	const intervalMs = Math.max(1, Math.floor(params.intervalMs));
	const phaseMs = normalizeModulo(Math.floor(params.phaseMs), intervalMs);
	const prev = params.prev;
	if (prev && prev.intervalMs === intervalMs && prev.phaseMs === phaseMs && prev.nextDueMs > params.nowMs) return prev.nextDueMs;
	return computeNextHeartbeatPhaseDueMs({
		nowMs: params.nowMs,
		intervalMs,
		phaseMs
	});
}
//#endregion
//#region src/infra/heartbeat-runner.ts
const log = createSubsystemLogger("gateway/heartbeat");
let heartbeatRunnerRuntimePromise = null;
function loadHeartbeatRunnerRuntime() {
	heartbeatRunnerRuntimePromise ??= import("./heartbeat-runner.runtime-bDSnBvfE.js");
	return heartbeatRunnerRuntimePromise;
}
function resolveHeartbeatSchedulerSeed(explicitSeed) {
	const normalized = normalizeOptionalString(explicitSeed);
	if (normalized) return normalized;
	try {
		return loadOrCreateDeviceIdentity().deviceId;
	} catch {
		return createHash("sha256").update(process.env.HOME ?? "").update("\0").update(process.cwd()).digest("hex");
	}
}
function hasExplicitHeartbeatAgents(cfg) {
	return (cfg.agents?.list ?? []).some((entry) => Boolean(entry?.heartbeat));
}
function resolveHeartbeatConfig(cfg, agentId) {
	const defaults = cfg.agents?.defaults?.heartbeat;
	if (!agentId) return defaults;
	const overrides = resolveAgentConfig(cfg, agentId)?.heartbeat;
	if (!defaults && !overrides) return overrides;
	return {
		...defaults,
		...overrides
	};
}
function resolveHeartbeatAgents(cfg) {
	const list = cfg.agents?.list ?? [];
	if (hasExplicitHeartbeatAgents(cfg)) return list.filter((entry) => entry?.heartbeat).map((entry) => {
		const id = normalizeAgentId(entry.id);
		return {
			agentId: id,
			heartbeat: resolveHeartbeatConfig(cfg, id)
		};
	}).filter((entry) => entry.agentId);
	const fallbackId = resolveDefaultAgentId(cfg);
	return [{
		agentId: fallbackId,
		heartbeat: resolveHeartbeatConfig(cfg, fallbackId)
	}];
}
function resolveHeartbeatPrompt(cfg, heartbeat) {
	return resolveHeartbeatPrompt$1(heartbeat?.prompt ?? cfg.agents?.defaults?.heartbeat?.prompt);
}
function resolveHeartbeatAckMaxChars(cfg, heartbeat) {
	return Math.max(0, heartbeat?.ackMaxChars ?? cfg.agents?.defaults?.heartbeat?.ackMaxChars ?? 300);
}
function resolveHeartbeatSession(cfg, agentId, heartbeat, forcedSessionKey) {
	const sessionCfg = cfg.session;
	const scope = sessionCfg?.scope ?? "per-sender";
	const resolvedAgentId = normalizeAgentId(agentId ?? resolveDefaultAgentId(cfg));
	const mainSessionKey = scope === "global" ? "global" : resolveAgentMainSessionKey({
		cfg,
		agentId: resolvedAgentId
	});
	const storeAgentId = scope === "global" ? resolveDefaultAgentId(cfg) : resolvedAgentId;
	const storePath = resolveStorePath(sessionCfg?.store, { agentId: storeAgentId });
	const store = loadSessionStore(storePath);
	const mainEntry = store[mainSessionKey];
	if (scope === "global") return {
		sessionKey: mainSessionKey,
		storePath,
		store,
		entry: mainEntry,
		suppressOriginatingContext: false
	};
	const forced = forcedSessionKey?.trim();
	if (forced && isSubagentSessionKey(forced)) return {
		sessionKey: mainSessionKey,
		storePath,
		store,
		entry: mainEntry,
		suppressOriginatingContext: true
	};
	if (forced && !isSubagentSessionKey(forced)) {
		const forcedCandidate = toAgentStoreSessionKey({
			agentId: resolvedAgentId,
			requestKey: forced,
			mainKey: cfg.session?.mainKey
		});
		if (!isSubagentSessionKey(forcedCandidate)) {
			const forcedCanonical = canonicalizeMainSessionAlias({
				cfg,
				agentId: resolvedAgentId,
				sessionKey: forcedCandidate
			});
			if (forcedCanonical !== "global" && !isSubagentSessionKey(forcedCanonical)) {
				if (resolveAgentIdFromSessionKey(forcedCanonical) === normalizeAgentId(resolvedAgentId)) return {
					sessionKey: forcedCanonical,
					storePath,
					store,
					entry: store[forcedCanonical],
					suppressOriginatingContext: false
				};
			}
		}
	}
	const trimmed = heartbeat?.session?.trim() ?? "";
	if (!trimmed || isSubagentSessionKey(trimmed)) return {
		sessionKey: mainSessionKey,
		storePath,
		store,
		entry: mainEntry,
		suppressOriginatingContext: false
	};
	const normalized = normalizeLowercaseStringOrEmpty(trimmed);
	if (normalized === "main" || normalized === "global") return {
		sessionKey: mainSessionKey,
		storePath,
		store,
		entry: mainEntry,
		suppressOriginatingContext: false
	};
	const candidate = toAgentStoreSessionKey({
		agentId: resolvedAgentId,
		requestKey: trimmed,
		mainKey: cfg.session?.mainKey
	});
	if (isSubagentSessionKey(candidate)) return {
		sessionKey: mainSessionKey,
		storePath,
		store,
		entry: mainEntry,
		suppressOriginatingContext: false
	};
	const canonical = canonicalizeMainSessionAlias({
		cfg,
		agentId: resolvedAgentId,
		sessionKey: candidate
	});
	if (canonical !== "global" && !isSubagentSessionKey(canonical)) {
		if (resolveAgentIdFromSessionKey(canonical) === normalizeAgentId(resolvedAgentId)) return {
			sessionKey: canonical,
			storePath,
			store,
			entry: store[canonical],
			suppressOriginatingContext: false
		};
	}
	return {
		sessionKey: mainSessionKey,
		storePath,
		store,
		entry: mainEntry,
		suppressOriginatingContext: false
	};
}
function resolveIsolatedHeartbeatSessionKey(params) {
	const storedBaseSessionKey = params.sessionEntry?.heartbeatIsolatedBaseSessionKey?.trim();
	if (storedBaseSessionKey) {
		const suffix = params.sessionKey.slice(storedBaseSessionKey.length);
		if (params.sessionKey.startsWith(storedBaseSessionKey) && suffix.length > 0 && /^(:heartbeat)+$/.test(suffix)) return {
			isolatedSessionKey: `${storedBaseSessionKey}:heartbeat`,
			isolatedBaseSessionKey: storedBaseSessionKey
		};
	}
	const configuredSuffix = params.sessionKey.slice(params.configuredSessionKey.length);
	if (params.sessionKey.startsWith(params.configuredSessionKey) && /^(:heartbeat)+$/.test(configuredSuffix) && !params.configuredSessionKey.endsWith(":heartbeat")) return {
		isolatedSessionKey: `${params.configuredSessionKey}:heartbeat`,
		isolatedBaseSessionKey: params.configuredSessionKey
	};
	return {
		isolatedSessionKey: `${params.sessionKey}:heartbeat`,
		isolatedBaseSessionKey: params.sessionKey
	};
}
function resolveStaleHeartbeatIsolatedSessionKey(params) {
	if (params.sessionKey === params.isolatedSessionKey) return;
	const suffix = params.sessionKey.slice(params.isolatedBaseSessionKey.length);
	if (params.sessionKey.startsWith(params.isolatedBaseSessionKey) && suffix.length > 0 && /^(:heartbeat)+$/.test(suffix)) return params.sessionKey;
}
function resolveHeartbeatReasoningPayloads(replyResult) {
	return (Array.isArray(replyResult) ? replyResult : replyResult ? [replyResult] : []).filter((payload) => {
		return (typeof payload.text === "string" ? payload.text : "").trimStart().startsWith("Reasoning:");
	});
}
async function restoreHeartbeatUpdatedAt(params) {
	const { storePath, sessionKey, updatedAt } = params;
	if (typeof updatedAt !== "number") return;
	const entry = loadSessionStore(storePath)[sessionKey];
	if (!entry) return;
	const nextUpdatedAt = Math.max(entry.updatedAt ?? 0, updatedAt);
	if (entry.updatedAt === nextUpdatedAt) return;
	await updateSessionStore(storePath, (nextStore) => {
		const nextEntry = nextStore[sessionKey] ?? entry;
		if (!nextEntry) return;
		const resolvedUpdatedAt = Math.max(nextEntry.updatedAt ?? 0, updatedAt);
		if (nextEntry.updatedAt === resolvedUpdatedAt) return;
		nextStore[sessionKey] = {
			...nextEntry,
			updatedAt: resolvedUpdatedAt
		};
	});
}
function stripLeadingHeartbeatResponsePrefix(text, responsePrefix) {
	const normalizedPrefix = responsePrefix?.trim();
	if (!normalizedPrefix) return text;
	const prefixPattern = new RegExp(`^${escapeRegExp(normalizedPrefix)}(?=$|\\s|[\\p{P}\\p{S}])\\s*`, "iu");
	return text.replace(prefixPattern, "");
}
function normalizeHeartbeatReply(payload, responsePrefix, ackMaxChars) {
	const stripped = stripHeartbeatToken(stripLeadingHeartbeatResponsePrefix(typeof payload.text === "string" ? payload.text : "", responsePrefix), {
		mode: "heartbeat",
		maxAckChars: ackMaxChars
	});
	const hasMedia = resolveSendableOutboundReplyParts(payload).hasMedia;
	if (stripped.shouldSkip && !hasMedia) return {
		shouldSkip: true,
		text: "",
		hasMedia
	};
	let finalText = stripped.text;
	if (responsePrefix && finalText && !finalText.startsWith(responsePrefix)) finalText = `${responsePrefix} ${finalText}`;
	return {
		shouldSkip: false,
		text: finalText,
		hasMedia
	};
}
function resolveHeartbeatReasonFlags(reason) {
	const reasonKind = resolveHeartbeatReasonKind(reason);
	return {
		isExecEventReason: reasonKind === "exec-event",
		isCronEventReason: reasonKind === "cron",
		isWakeReason: reasonKind === "wake" || reasonKind === "hook"
	};
}
async function resolveHeartbeatPreflight(params) {
	const reasonFlags = resolveHeartbeatReasonFlags(params.reason);
	const session = resolveHeartbeatSession(params.cfg, params.agentId, params.heartbeat, params.forcedSessionKey);
	const pendingEventEntries = peekSystemEventEntries(session.sessionKey);
	const turnSourceDeliveryContext = resolveSystemEventDeliveryContext(pendingEventEntries);
	const hasTaggedCronEvents = pendingEventEntries.some((event) => event.contextKey?.startsWith("cron:"));
	const shouldInspectWakePendingEvents = (() => {
		if (!reasonFlags.isWakeReason) return false;
		if (params.heartbeat?.isolatedSession !== true) return true;
		const configuredSession = resolveHeartbeatSession(params.cfg, params.agentId, params.heartbeat);
		const { isolatedSessionKey } = resolveIsolatedHeartbeatSessionKey({
			sessionKey: session.sessionKey,
			configuredSessionKey: configuredSession.sessionKey,
			sessionEntry: session.entry
		});
		return isolatedSessionKey === session.sessionKey;
	})();
	const shouldInspectPendingEvents = reasonFlags.isExecEventReason || reasonFlags.isCronEventReason || shouldInspectWakePendingEvents || hasTaggedCronEvents;
	const shouldBypassFileGates = reasonFlags.isExecEventReason || reasonFlags.isCronEventReason || reasonFlags.isWakeReason || hasTaggedCronEvents;
	const basePreflight = {
		...reasonFlags,
		session,
		pendingEventEntries,
		turnSourceDeliveryContext,
		hasTaggedCronEvents,
		shouldInspectPendingEvents
	};
	if (shouldBypassFileGates) return basePreflight;
	const workspaceDir = resolveAgentWorkspaceDir(params.cfg, params.agentId);
	const heartbeatFilePath = path.join(workspaceDir, DEFAULT_HEARTBEAT_FILENAME);
	let heartbeatFileContent;
	try {
		heartbeatFileContent = await fs.readFile(heartbeatFilePath, "utf-8");
		const tasks = parseHeartbeatTasks(heartbeatFileContent);
		if (isHeartbeatContentEffectivelyEmpty(heartbeatFileContent) && tasks.length === 0) return {
			...basePreflight,
			skipReason: "empty-heartbeat-file",
			tasks: [],
			heartbeatFileContent
		};
		return {
			...basePreflight,
			tasks,
			heartbeatFileContent
		};
	} catch (err) {
		if (hasErrnoCode(err, "ENOENT")) return basePreflight;
	}
	return basePreflight;
}
function appendHeartbeatWorkspacePathHint(prompt, workspaceDir) {
	if (!/heartbeat\.md/i.test(prompt)) return prompt;
	const hint = `When reading HEARTBEAT.md, use workspace file ${path.join(workspaceDir, DEFAULT_HEARTBEAT_FILENAME).replace(/\\/g, "/")} (exact case). Do not read docs/heartbeat.md.`;
	if (prompt.includes(hint)) return prompt;
	return `${prompt}\n${hint}`;
}
function resolveHeartbeatRunPrompt(params) {
	const pendingEventEntries = params.preflight.pendingEventEntries;
	const pendingEvents = params.preflight.shouldInspectPendingEvents ? pendingEventEntries.map((event) => event.text) : [];
	const cronEvents = pendingEventEntries.filter((event) => (params.preflight.isCronEventReason || event.contextKey?.startsWith("cron:")) && isCronSystemEvent(event.text)).map((event) => event.text);
	const hasExecCompletion = pendingEvents.some(isExecCompletionEvent);
	const hasCronEvents = cronEvents.length > 0;
	if (params.preflight.tasks && params.preflight.tasks.length > 0) {
		const dueTasks = params.preflight.tasks.filter((task) => isTaskDue((params.preflight.session.entry?.heartbeatTaskState)?.[task.name], task.interval, params.startedAt));
		if (dueTasks.length > 0) {
			let prompt = `Run the following periodic tasks (only those due based on their intervals):

${dueTasks.map((task) => `- ${task.name}: ${task.prompt}`).join("\n")}

After completing all due tasks, reply HEARTBEAT_OK.`;
			if (params.heartbeatFileContent) {
				const directives = params.heartbeatFileContent.replace(/^[\s\S]*?^tasks:[\s\S]*?(?=^[^\s]|^$)/m, "").trim();
				if (directives) prompt += `\n\nAdditional context from HEARTBEAT.md:\n${directives}`;
			}
			return {
				prompt,
				hasExecCompletion: false,
				hasCronEvents: false
			};
		}
		return {
			prompt: null,
			hasExecCompletion: false,
			hasCronEvents: false
		};
	}
	return {
		prompt: appendHeartbeatWorkspacePathHint(hasExecCompletion ? buildExecEventPrompt({ deliverToUser: params.canRelayToUser }) : hasCronEvents ? buildCronEventPrompt(cronEvents, { deliverToUser: params.canRelayToUser }) : resolveHeartbeatPrompt(params.cfg, params.heartbeat), params.workspaceDir),
		hasExecCompletion,
		hasCronEvents
	};
}
async function runHeartbeatOnce(opts) {
	const cfg = opts.cfg ?? loadConfig();
	const explicitAgentId = typeof opts.agentId === "string" ? opts.agentId.trim() : "";
	const forcedSessionAgentId = explicitAgentId.length > 0 ? void 0 : parseAgentSessionKey(opts.sessionKey)?.agentId;
	const agentId = normalizeAgentId(explicitAgentId || forcedSessionAgentId || resolveDefaultAgentId(cfg));
	const heartbeat = opts.heartbeat ?? resolveHeartbeatConfig(cfg, agentId);
	if (!areHeartbeatsEnabled()) return {
		status: "skipped",
		reason: "disabled"
	};
	if (!isHeartbeatEnabledForAgent(cfg, agentId)) return {
		status: "skipped",
		reason: "disabled"
	};
	if (!resolveHeartbeatIntervalMs(cfg, void 0, heartbeat)) return {
		status: "skipped",
		reason: "disabled"
	};
	const startedAt = opts.deps?.nowMs?.() ?? Date.now();
	if (!isWithinActiveHours(cfg, heartbeat, startedAt)) return {
		status: "skipped",
		reason: "quiet-hours"
	};
	if ((opts.deps?.getQueueSize ?? getQueueSize)(CommandLane.Main) > 0) return {
		status: "skipped",
		reason: "requests-in-flight"
	};
	const preflight = await resolveHeartbeatPreflight({
		cfg,
		agentId,
		heartbeat,
		forcedSessionKey: opts.sessionKey,
		reason: opts.reason
	});
	if (preflight.skipReason) {
		emitHeartbeatEvent({
			status: "skipped",
			reason: preflight.skipReason,
			durationMs: Date.now() - startedAt
		});
		return {
			status: "skipped",
			reason: preflight.skipReason
		};
	}
	const { entry, sessionKey, storePath, suppressOriginatingContext } = preflight.session;
	const sessionLaneKey = resolveEmbeddedSessionLane(sessionKey);
	if ((opts.deps?.getQueueSize ?? getQueueSize)(sessionLaneKey) > 0) {
		emitHeartbeatEvent({
			status: "skipped",
			reason: "requests-in-flight",
			durationMs: Date.now() - startedAt
		});
		return {
			status: "skipped",
			reason: "requests-in-flight"
		};
	}
	const previousUpdatedAt = entry?.updatedAt;
	const useIsolatedSession = heartbeat?.isolatedSession === true;
	const delivery = resolveHeartbeatDeliveryTarget({
		cfg,
		entry,
		heartbeat,
		turnSource: useIsolatedSession ? void 0 : preflight.turnSourceDeliveryContext
	});
	const heartbeatAccountId = heartbeat?.accountId?.trim();
	if (delivery.reason === "unknown-account") log.warn("heartbeat: unknown accountId", {
		accountId: delivery.accountId ?? heartbeatAccountId ?? null,
		target: heartbeat?.target ?? "none"
	});
	else if (heartbeatAccountId) log.info("heartbeat: using explicit accountId", {
		accountId: delivery.accountId ?? heartbeatAccountId,
		target: heartbeat?.target ?? "none",
		channel: delivery.channel
	});
	const visibility = delivery.channel !== "none" ? resolveHeartbeatVisibility({
		cfg,
		channel: delivery.channel,
		accountId: delivery.accountId
	}) : {
		showOk: false,
		showAlerts: true,
		useIndicator: true
	};
	const { sender } = resolveHeartbeatSenderContext({
		cfg,
		entry,
		delivery
	});
	const responsePrefix = resolveEffectiveMessagesConfig(cfg, agentId, {
		channel: delivery.channel !== "none" ? delivery.channel : void 0,
		accountId: delivery.accountId
	}).responsePrefix;
	const { prompt, hasExecCompletion, hasCronEvents } = resolveHeartbeatRunPrompt({
		cfg,
		heartbeat,
		preflight,
		canRelayToUser: Boolean(delivery.channel !== "none" && delivery.to && visibility.showAlerts),
		workspaceDir: resolveAgentWorkspaceDir(cfg, agentId),
		startedAt,
		heartbeatFileContent: preflight.heartbeatFileContent
	});
	if (prompt === null) {
		if (!preflight.isWakeReason && preflight.shouldInspectPendingEvents && preflight.pendingEventEntries.length > 0) consumeSystemEventEntries(sessionKey, preflight.pendingEventEntries);
		return {
			status: "skipped",
			reason: "no-tasks-due"
		};
	}
	let runSessionKey = sessionKey;
	if (useIsolatedSession) {
		const { isolatedSessionKey, isolatedBaseSessionKey } = resolveIsolatedHeartbeatSessionKey({
			sessionKey,
			configuredSessionKey: resolveHeartbeatSession(cfg, agentId, heartbeat).sessionKey,
			sessionEntry: entry
		});
		const cronSession = resolveCronSession({
			cfg,
			sessionKey: isolatedSessionKey,
			agentId,
			nowMs: startedAt,
			forceNew: true
		});
		const staleIsolatedSessionKey = resolveStaleHeartbeatIsolatedSessionKey({
			sessionKey,
			isolatedSessionKey,
			isolatedBaseSessionKey
		});
		const removedSessionFiles = /* @__PURE__ */ new Map();
		if (staleIsolatedSessionKey) {
			const staleEntry = cronSession.store[staleIsolatedSessionKey];
			if (staleEntry?.sessionId) removedSessionFiles.set(staleEntry.sessionId, staleEntry.sessionFile);
			delete cronSession.store[staleIsolatedSessionKey];
		}
		cronSession.sessionEntry.heartbeatIsolatedBaseSessionKey = isolatedBaseSessionKey;
		cronSession.store[isolatedSessionKey] = cronSession.sessionEntry;
		await saveSessionStore(cronSession.storePath, cronSession.store);
		if (removedSessionFiles.size > 0) try {
			await archiveRemovedSessionTranscripts({
				removedSessionFiles,
				referencedSessionIds: new Set(Object.values(cronSession.store).map((sessionEntry) => sessionEntry?.sessionId).filter((sessionId) => Boolean(sessionId))),
				storePath: cronSession.storePath,
				reason: "deleted",
				restrictToStoreDir: true
			});
		} catch (err) {
			log.warn("heartbeat: failed to archive stale isolated session transcript", {
				err: String(err),
				sessionKey: staleIsolatedSessionKey
			});
		}
		runSessionKey = isolatedSessionKey;
	}
	const activeSessionPendingEventEntries = runSessionKey === sessionKey ? preflight.pendingEventEntries : peekSystemEventEntries(runSessionKey);
	const hasUntrustedInspectedEvents = preflight.shouldInspectPendingEvents && preflight.pendingEventEntries.some((event) => event.trusted === false);
	const hasUntrustedActiveSessionEvents = activeSessionPendingEventEntries.some((event) => event.trusted === false);
	const hasUntrustedPendingEvents = hasUntrustedInspectedEvents || hasUntrustedActiveSessionEvents;
	const updateTaskTimestamps = async () => {
		if (!preflight.tasks || preflight.tasks.length === 0) return;
		const store = loadSessionStore(storePath);
		const base = store[sessionKey] ?? {
			sessionId: sessionKey.replace(/:/g, "_"),
			updatedAt: startedAt,
			createdAt: startedAt,
			messageCount: 0,
			lastMessageAt: startedAt,
			heartbeatTaskState: {}
		};
		const taskState = { ...base.heartbeatTaskState };
		for (const task of preflight.tasks) if (isTaskDue(taskState[task.name], task.interval, startedAt)) taskState[task.name] = startedAt;
		store[sessionKey] = {
			...base,
			heartbeatTaskState: taskState
		};
		await saveSessionStore(storePath, store);
	};
	const consumeInspectedSystemEvents = () => {
		if (!preflight.shouldInspectPendingEvents || preflight.pendingEventEntries.length === 0) return;
		consumeSystemEventEntries(sessionKey, preflight.pendingEventEntries);
	};
	const ctx = {
		Body: appendCronStyleCurrentTimeLine(prompt, cfg, startedAt),
		From: sender,
		To: sender,
		OriginatingChannel: !suppressOriginatingContext && delivery.channel !== "none" ? delivery.channel : void 0,
		OriginatingTo: !suppressOriginatingContext ? delivery.to : void 0,
		AccountId: delivery.accountId,
		MessageThreadId: delivery.threadId,
		Provider: hasExecCompletion ? "exec-event" : hasCronEvents ? "cron-event" : "heartbeat",
		SessionKey: runSessionKey,
		ForceSenderIsOwnerFalse: hasExecCompletion || hasUntrustedPendingEvents
	};
	if (!visibility.showAlerts && !visibility.showOk && !visibility.useIndicator) {
		emitHeartbeatEvent({
			status: "skipped",
			reason: "alerts-disabled",
			durationMs: Date.now() - startedAt,
			channel: delivery.channel !== "none" ? delivery.channel : void 0,
			accountId: delivery.accountId
		});
		return {
			status: "skipped",
			reason: "alerts-disabled"
		};
	}
	const heartbeatOkText = responsePrefix ? `${responsePrefix} ${HEARTBEAT_TOKEN}` : HEARTBEAT_TOKEN;
	const outboundSession = buildOutboundSessionContext({
		cfg,
		agentId,
		sessionKey
	});
	const canAttemptHeartbeatOk = Boolean(visibility.showOk && delivery.channel !== "none" && delivery.to);
	const maybeSendHeartbeatOk = async () => {
		if (!canAttemptHeartbeatOk || delivery.channel === "none" || !delivery.to) return false;
		const heartbeatPlugin = getChannelPlugin(delivery.channel);
		if (heartbeatPlugin?.heartbeat?.checkReady) {
			if (!(await heartbeatPlugin.heartbeat.checkReady({
				cfg,
				accountId: delivery.accountId,
				deps: opts.deps
			})).ok) return false;
		}
		await deliverOutboundPayloads({
			cfg,
			channel: delivery.channel,
			to: delivery.to,
			accountId: delivery.accountId,
			threadId: delivery.threadId,
			payloads: [{ text: heartbeatOkText }],
			session: outboundSession,
			deps: opts.deps
		});
		return true;
	};
	try {
		const heartbeatModelOverride = normalizeOptionalString(heartbeat?.model);
		const suppressToolErrorWarnings = heartbeat?.suppressToolErrorWarnings === true;
		const timeoutOverrideSeconds = typeof heartbeat?.timeoutSeconds === "number" ? heartbeat.timeoutSeconds : void 0;
		const bootstrapContextMode = heartbeat?.lightContext === true ? "lightweight" : void 0;
		const replyOpts = {
			isHeartbeat: true,
			...heartbeatModelOverride ? { heartbeatModelOverride } : {},
			suppressToolErrorWarnings,
			timeoutOverrideSeconds,
			bootstrapContextMode
		};
		const replyResult = await (opts.deps?.getReplyFromConfig ?? (await loadHeartbeatRunnerRuntime()).getReplyFromConfig)(ctx, replyOpts, cfg);
		const replyPayload = resolveHeartbeatReplyPayload(replyResult);
		const reasoningPayloads = heartbeat?.includeReasoning === true ? resolveHeartbeatReasoningPayloads(replyResult).filter((payload) => payload !== replyPayload) : [];
		if (!replyPayload || !hasOutboundReplyContent(replyPayload)) {
			await restoreHeartbeatUpdatedAt({
				storePath,
				sessionKey,
				updatedAt: previousUpdatedAt
			});
			const okSent = await maybeSendHeartbeatOk();
			emitHeartbeatEvent({
				status: "ok-empty",
				reason: opts.reason,
				durationMs: Date.now() - startedAt,
				channel: delivery.channel !== "none" ? delivery.channel : void 0,
				accountId: delivery.accountId,
				silent: !okSent,
				indicatorType: visibility.useIndicator ? resolveIndicatorType("ok-empty") : void 0
			});
			await updateTaskTimestamps();
			consumeInspectedSystemEvents();
			return {
				status: "ran",
				durationMs: Date.now() - startedAt
			};
		}
		const normalized = normalizeHeartbeatReply(replyPayload, responsePrefix, resolveHeartbeatAckMaxChars(cfg, heartbeat));
		const execFallbackText = hasExecCompletion && !normalized.text.trim() && replyPayload.text?.trim() ? replyPayload.text.trim() : null;
		if (execFallbackText) {
			normalized.text = execFallbackText;
			normalized.shouldSkip = false;
		}
		const shouldSkipMain = normalized.shouldSkip && !normalized.hasMedia && !hasExecCompletion;
		if (shouldSkipMain && reasoningPayloads.length === 0) {
			await restoreHeartbeatUpdatedAt({
				storePath,
				sessionKey,
				updatedAt: previousUpdatedAt
			});
			const okSent = await maybeSendHeartbeatOk();
			emitHeartbeatEvent({
				status: "ok-token",
				reason: opts.reason,
				durationMs: Date.now() - startedAt,
				channel: delivery.channel !== "none" ? delivery.channel : void 0,
				accountId: delivery.accountId,
				silent: !okSent,
				indicatorType: visibility.useIndicator ? resolveIndicatorType("ok-token") : void 0
			});
			await updateTaskTimestamps();
			consumeInspectedSystemEvents();
			return {
				status: "ran",
				durationMs: Date.now() - startedAt
			};
		}
		const mediaUrls = resolveSendableOutboundReplyParts(replyPayload).mediaUrls;
		const prevHeartbeatText = typeof entry?.lastHeartbeatText === "string" ? entry.lastHeartbeatText : "";
		const prevHeartbeatAt = typeof entry?.lastHeartbeatSentAt === "number" ? entry.lastHeartbeatSentAt : void 0;
		if (!shouldSkipMain && !mediaUrls.length && Boolean(prevHeartbeatText.trim()) && normalized.text.trim() === prevHeartbeatText.trim() && typeof prevHeartbeatAt === "number" && startedAt - prevHeartbeatAt < 1440 * 60 * 1e3) {
			await restoreHeartbeatUpdatedAt({
				storePath,
				sessionKey,
				updatedAt: previousUpdatedAt
			});
			emitHeartbeatEvent({
				status: "skipped",
				reason: "duplicate",
				preview: normalized.text.slice(0, 200),
				durationMs: Date.now() - startedAt,
				hasMedia: false,
				channel: delivery.channel !== "none" ? delivery.channel : void 0,
				accountId: delivery.accountId
			});
			await updateTaskTimestamps();
			consumeInspectedSystemEvents();
			return {
				status: "ran",
				durationMs: Date.now() - startedAt
			};
		}
		const previewText = shouldSkipMain ? reasoningPayloads.map((payload) => payload.text).filter((text) => Boolean(text?.trim())).join("\n") : normalized.text;
		if (delivery.channel === "none" || !delivery.to) {
			emitHeartbeatEvent({
				status: "skipped",
				reason: delivery.reason ?? "no-target",
				preview: previewText?.slice(0, 200),
				durationMs: Date.now() - startedAt,
				hasMedia: mediaUrls.length > 0,
				accountId: delivery.accountId
			});
			await updateTaskTimestamps();
			consumeInspectedSystemEvents();
			return {
				status: "ran",
				durationMs: Date.now() - startedAt
			};
		}
		if (!visibility.showAlerts) {
			await updateTaskTimestamps();
			await restoreHeartbeatUpdatedAt({
				storePath,
				sessionKey,
				updatedAt: previousUpdatedAt
			});
			emitHeartbeatEvent({
				status: "skipped",
				reason: "alerts-disabled",
				preview: previewText?.slice(0, 200),
				durationMs: Date.now() - startedAt,
				channel: delivery.channel,
				hasMedia: mediaUrls.length > 0,
				accountId: delivery.accountId,
				indicatorType: visibility.useIndicator ? resolveIndicatorType("sent") : void 0
			});
			consumeInspectedSystemEvents();
			return {
				status: "ran",
				durationMs: Date.now() - startedAt
			};
		}
		const deliveryAccountId = delivery.accountId;
		const heartbeatPlugin = getChannelPlugin(delivery.channel);
		if (heartbeatPlugin?.heartbeat?.checkReady) {
			const readiness = await heartbeatPlugin.heartbeat.checkReady({
				cfg,
				accountId: deliveryAccountId,
				deps: opts.deps
			});
			if (!readiness.ok) {
				emitHeartbeatEvent({
					status: "skipped",
					reason: readiness.reason,
					preview: previewText?.slice(0, 200),
					durationMs: Date.now() - startedAt,
					hasMedia: mediaUrls.length > 0,
					channel: delivery.channel,
					accountId: delivery.accountId
				});
				log.info("heartbeat: channel not ready", {
					channel: delivery.channel,
					reason: readiness.reason
				});
				return {
					status: "skipped",
					reason: readiness.reason
				};
			}
		}
		await deliverOutboundPayloads({
			cfg,
			channel: delivery.channel,
			to: delivery.to,
			accountId: deliveryAccountId,
			session: outboundSession,
			threadId: delivery.threadId,
			payloads: [...reasoningPayloads, ...shouldSkipMain ? [] : [{
				text: normalized.text,
				mediaUrls
			}]],
			deps: opts.deps
		});
		if (!shouldSkipMain && normalized.text.trim()) {
			const store = loadSessionStore(storePath);
			const current = store[sessionKey];
			if (current) {
				store[sessionKey] = {
					...current,
					lastHeartbeatText: normalized.text,
					lastHeartbeatSentAt: startedAt
				};
				await saveSessionStore(storePath, store);
			}
		}
		emitHeartbeatEvent({
			status: "sent",
			to: delivery.to,
			preview: previewText?.slice(0, 200),
			durationMs: Date.now() - startedAt,
			hasMedia: mediaUrls.length > 0,
			channel: delivery.channel,
			accountId: delivery.accountId,
			indicatorType: visibility.useIndicator ? resolveIndicatorType("sent") : void 0
		});
		await updateTaskTimestamps();
		consumeInspectedSystemEvents();
		return {
			status: "ran",
			durationMs: Date.now() - startedAt
		};
	} catch (err) {
		const reason = formatErrorMessage(err);
		emitHeartbeatEvent({
			status: "failed",
			reason,
			durationMs: Date.now() - startedAt,
			channel: delivery.channel !== "none" ? delivery.channel : void 0,
			accountId: delivery.accountId,
			indicatorType: visibility.useIndicator ? resolveIndicatorType("failed") : void 0
		});
		log.error(`heartbeat failed: ${reason}`, { error: reason });
		return {
			status: "failed",
			reason
		};
	}
}
function startHeartbeatRunner(opts) {
	const runtime = opts.runtime ?? defaultRuntime;
	const runOnce = opts.runOnce ?? runHeartbeatOnce;
	const state = {
		cfg: opts.cfg ?? loadConfig(),
		runtime,
		schedulerSeed: resolveHeartbeatSchedulerSeed(opts.stableSchedulerSeed),
		agents: /* @__PURE__ */ new Map(),
		timer: null,
		stopped: false
	};
	let initialized = false;
	const resolveNextDue = (now, intervalMs, phaseMs, prevState) => resolveNextHeartbeatDueMs({
		nowMs: now,
		intervalMs,
		phaseMs,
		prev: prevState ? {
			intervalMs: prevState.intervalMs,
			phaseMs: prevState.phaseMs,
			nextDueMs: prevState.nextDueMs
		} : void 0
	});
	const advanceAgentSchedule = (agent, now, reason) => {
		agent.nextDueMs = reason === "interval" ? computeNextHeartbeatPhaseDueMs({
			nowMs: now,
			intervalMs: agent.intervalMs,
			phaseMs: agent.phaseMs
		}) : now + agent.intervalMs;
	};
	const scheduleNext = () => {
		if (state.stopped) return;
		if (state.timer) {
			clearTimeout(state.timer);
			state.timer = null;
		}
		if (state.agents.size === 0) return;
		const now = Date.now();
		let nextDue = Number.POSITIVE_INFINITY;
		for (const agent of state.agents.values()) if (agent.nextDueMs < nextDue) nextDue = agent.nextDueMs;
		if (!Number.isFinite(nextDue)) return;
		const delay = Math.max(0, nextDue - now);
		state.timer = setTimeout(() => {
			state.timer = null;
			requestHeartbeatNow({
				reason: "interval",
				coalesceMs: 0
			});
		}, delay);
		state.timer.unref?.();
	};
	const updateConfig = (cfg) => {
		if (state.stopped) return;
		const now = Date.now();
		const prevAgents = state.agents;
		const prevEnabled = prevAgents.size > 0;
		const nextAgents = /* @__PURE__ */ new Map();
		const intervals = [];
		for (const agent of resolveHeartbeatAgents(cfg)) {
			const intervalMs = resolveHeartbeatIntervalMs(cfg, void 0, agent.heartbeat);
			if (!intervalMs) continue;
			const phaseMs = resolveHeartbeatPhaseMs({
				schedulerSeed: state.schedulerSeed,
				agentId: agent.agentId,
				intervalMs
			});
			intervals.push(intervalMs);
			const nextDueMs = resolveNextDue(now, intervalMs, phaseMs, prevAgents.get(agent.agentId));
			nextAgents.set(agent.agentId, {
				agentId: agent.agentId,
				heartbeat: agent.heartbeat,
				intervalMs,
				phaseMs,
				nextDueMs
			});
		}
		state.cfg = cfg;
		state.agents = nextAgents;
		const nextEnabled = nextAgents.size > 0;
		if (!initialized) {
			if (!nextEnabled) log.info("heartbeat: disabled", { enabled: false });
			else log.info("heartbeat: started", { intervalMs: Math.min(...intervals) });
			initialized = true;
		} else if (prevEnabled !== nextEnabled) if (!nextEnabled) log.info("heartbeat: disabled", { enabled: false });
		else log.info("heartbeat: started", { intervalMs: Math.min(...intervals) });
		scheduleNext();
	};
	const run = async (params) => {
		if (state.stopped) return {
			status: "skipped",
			reason: "disabled"
		};
		if (!areHeartbeatsEnabled()) return {
			status: "skipped",
			reason: "disabled"
		};
		if (state.agents.size === 0) return {
			status: "skipped",
			reason: "disabled"
		};
		const reason = params?.reason;
		const requestedAgentId = params?.agentId ? normalizeAgentId(params.agentId) : void 0;
		const requestedSessionKey = normalizeOptionalString(params?.sessionKey);
		const isInterval = reason === "interval";
		const startedAt = Date.now();
		const now = startedAt;
		let ran = false;
		let requestsInFlight = false;
		try {
			if (requestedSessionKey || requestedAgentId) {
				const targetAgentId = requestedAgentId ?? resolveAgentIdFromSessionKey(requestedSessionKey);
				const targetAgent = state.agents.get(targetAgentId);
				if (!targetAgent) return {
					status: "skipped",
					reason: "disabled"
				};
				try {
					const res = await runOnce({
						cfg: state.cfg,
						agentId: targetAgent.agentId,
						heartbeat: targetAgent.heartbeat,
						reason,
						sessionKey: requestedSessionKey,
						deps: { runtime: state.runtime }
					});
					if (res.status !== "skipped" || res.reason !== "disabled") advanceAgentSchedule(targetAgent, now, reason);
					return res.status === "ran" ? {
						status: "ran",
						durationMs: Date.now() - startedAt
					} : res;
				} catch (err) {
					const errMsg = formatErrorMessage(err);
					log.error(`heartbeat runner: targeted runOnce threw unexpectedly: ${errMsg}`, { error: errMsg });
					advanceAgentSchedule(targetAgent, now, reason);
					return {
						status: "failed",
						reason: errMsg
					};
				}
			}
			for (const agent of state.agents.values()) {
				if (isInterval && now < agent.nextDueMs) continue;
				let res;
				try {
					res = await runOnce({
						cfg: state.cfg,
						agentId: agent.agentId,
						heartbeat: agent.heartbeat,
						reason,
						deps: { runtime: state.runtime }
					});
				} catch (err) {
					const errMsg = formatErrorMessage(err);
					log.error(`heartbeat runner: runOnce threw unexpectedly: ${errMsg}`, { error: errMsg });
					advanceAgentSchedule(agent, now, reason);
					continue;
				}
				if (res.status === "skipped" && res.reason === "requests-in-flight") {
					requestsInFlight = true;
					return res;
				}
				if (res.status !== "skipped" || res.reason !== "disabled") advanceAgentSchedule(agent, now, reason);
				if (res.status === "ran") ran = true;
			}
			if (ran) return {
				status: "ran",
				durationMs: Date.now() - startedAt
			};
			return {
				status: "skipped",
				reason: isInterval ? "not-due" : "disabled"
			};
		} finally {
			if (!requestsInFlight) scheduleNext();
		}
	};
	const wakeHandler = async (params) => run({
		reason: params.reason,
		agentId: params.agentId,
		sessionKey: params.sessionKey
	});
	const disposeWakeHandler = setHeartbeatWakeHandler(wakeHandler);
	updateConfig(state.cfg);
	const cleanup = () => {
		if (state.stopped) return;
		state.stopped = true;
		disposeWakeHandler();
		if (state.timer) clearTimeout(state.timer);
		state.timer = null;
	};
	opts.abortSignal?.addEventListener("abort", cleanup, { once: true });
	return {
		stop: cleanup,
		updateConfig
	};
}
//#endregion
export { resolveCronSession as a, isCronSystemEvent as i, runHeartbeatOnce as n, startHeartbeatRunner as r, resolveHeartbeatPrompt as t };
