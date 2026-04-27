import { a as normalizeLowercaseStringOrEmpty } from "./string-coerce-C1IzJjqi.js";
import { l as isRecord$1 } from "./utils-BMRcljdi.js";
import { n as resolvePreferredOpenClawTmpDir } from "./tmp-openclaw-dir-CoGSA-7K.js";
import { t as isTruthyEnvValue } from "./env-BgREcPbG.js";
import { o as sanitizeHostExecEnv } from "./host-env-security-Btzm9BXg.js";
import { a as shouldLogVerbose } from "./globals-DeRFSEIV.js";
import { p as scopedHeartbeatWakeOptions } from "./session-key-EpIbK3Oz.js";
import { t as applyPluginTextReplacements } from "./plugin-text-transforms-CSfpsdqt.js";
import { i as emitAgentEvent } from "./agent-events-DMk-SEBA.js";
import { a as prependBootstrapPromptWarning } from "./bootstrap-budget-Daai1iOb.js";
import "./pi-embedded-helpers-C0R2W0ZW.js";
import { t as classifyFailoverReason } from "./errors-DnpKeLbn.js";
import { s as resolveFailoverStatus, t as FailoverError } from "./failover-error-D72vttCv.js";
import { i as stripSystemPromptCacheBoundary } from "./system-prompt-cache-boundary-CeY_ZCdW.js";
import { n as requestHeartbeatNow } from "./heartbeat-wake-gACR6ANS.js";
import { i as enqueueSystemEvent } from "./system-events-B6vO-QxY.js";
import { n as applySkillEnvOverridesFromSnapshot } from "./env-overrides-rjhjtupn.js";
import "./skills-ClcFefyl.js";
import { t as extractBalancedJsonFragments } from "./balanced-json-CusTgQZH.js";
import { t as getProcessSupervisor } from "./supervisor-C-TehxnY.js";
import { a as prepareCliPromptImagePayload, c as resolveSessionIdToSend, d as buildCliSupervisorScopeKey, f as resolveCliNoOutputTimeoutMs, g as cliBackendLog, l as resolveSystemPromptUsage, o as resolveCliRunQueueKey, r as enqueueCliRun, s as resolvePromptInput, t as buildCliArgs, u as writeCliSystemPromptFile } from "./helpers-XO1YmTSh.js";
import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";
//#region src/agents/cli-output.ts
function isClaudeCliProvider(providerId) {
	return normalizeLowercaseStringOrEmpty(providerId) === "claude-cli";
}
function usesClaudeStreamJsonDialect(params) {
	return params.backend.jsonlDialect === "claude-stream-json" || isClaudeCliProvider(params.providerId);
}
function extractJsonObjectCandidates(raw) {
	return extractBalancedJsonFragments(raw, { openers: ["{"] }).map((fragment) => fragment.json);
}
function parseJsonRecordCandidates(raw) {
	const parsedRecords = [];
	const trimmed = raw.trim();
	if (!trimmed) return parsedRecords;
	try {
		const parsed = JSON.parse(trimmed);
		if (isRecord$1(parsed)) {
			parsedRecords.push(parsed);
			return parsedRecords;
		}
	} catch {}
	for (const candidate of extractJsonObjectCandidates(trimmed)) try {
		const parsed = JSON.parse(candidate);
		if (isRecord$1(parsed)) parsedRecords.push(parsed);
	} catch {}
	return parsedRecords;
}
function readNestedErrorMessage(parsed) {
	if (isRecord$1(parsed.error)) {
		const errorMessage = readNestedErrorMessage(parsed.error);
		if (errorMessage) return errorMessage;
	}
	if (typeof parsed.message === "string") {
		const trimmed = parsed.message.trim();
		if (trimmed) return trimmed;
	}
	if (typeof parsed.error === "string") {
		const trimmed = parsed.error.trim();
		if (trimmed) return trimmed;
	}
}
function unwrapCliErrorText(raw) {
	const trimmed = raw.trim();
	if (!trimmed) return "";
	for (const parsed of parseJsonRecordCandidates(trimmed)) {
		const nested = readNestedErrorMessage(parsed);
		if (nested) return nested;
	}
	return trimmed;
}
function toCliUsage(raw) {
	const readNestedCached = (key) => {
		const nested = raw[key];
		if (!isRecord$1(nested)) return;
		return typeof nested.cached_tokens === "number" && nested.cached_tokens > 0 ? nested.cached_tokens : void 0;
	};
	const pick = (key) => typeof raw[key] === "number" && raw[key] > 0 ? raw[key] : void 0;
	const totalInput = pick("input_tokens") ?? pick("inputTokens");
	const output = pick("output_tokens") ?? pick("outputTokens");
	const nestedCached = readNestedCached("input_tokens_details") ?? readNestedCached("prompt_tokens_details");
	const cacheRead = pick("cache_read_input_tokens") ?? pick("cached_input_tokens") ?? pick("cacheRead") ?? pick("cached") ?? nestedCached;
	const input = pick("input") ?? ((Object.hasOwn(raw, "cached") || nestedCached !== void 0) && typeof totalInput === "number" ? Math.max(0, totalInput - (cacheRead ?? 0)) : totalInput);
	const cacheWrite = pick("cache_creation_input_tokens") ?? pick("cache_write_input_tokens") ?? pick("cacheWrite");
	const total = pick("total_tokens") ?? pick("total");
	if (!input && !output && !cacheRead && !cacheWrite && !total) return;
	return {
		input,
		output,
		cacheRead,
		cacheWrite,
		total
	};
}
function readCliUsage(parsed) {
	if (isRecord$1(parsed.usage)) {
		const usage = toCliUsage(parsed.usage);
		if (usage) return usage;
	}
	if (isRecord$1(parsed.stats)) return toCliUsage(parsed.stats);
}
function collectCliText(value) {
	if (!value) return "";
	if (typeof value === "string") return value;
	if (Array.isArray(value)) return value.map((entry) => collectCliText(entry)).join("");
	if (!isRecord$1(value)) return "";
	if (typeof value.response === "string") return value.response;
	if (typeof value.text === "string") return value.text;
	if (typeof value.result === "string") return value.result;
	if (typeof value.content === "string") return value.content;
	if (Array.isArray(value.content)) return value.content.map((entry) => collectCliText(entry)).join("");
	if (isRecord$1(value.message)) return collectCliText(value.message);
	return "";
}
function collectExplicitCliErrorText(parsed) {
	const nested = readNestedErrorMessage(parsed);
	if (nested) return unwrapCliErrorText(nested);
	if (parsed.is_error === true && typeof parsed.result === "string") return unwrapCliErrorText(parsed.result);
	if (parsed.type === "assistant") {
		const text = collectCliText(parsed.message);
		if (/^\s*API Error:/i.test(text)) return unwrapCliErrorText(text);
	}
	if (parsed.type === "error") return unwrapCliErrorText(collectCliText(parsed.message) || collectCliText(parsed.content) || collectCliText(parsed.result) || collectCliText(parsed));
	return "";
}
function pickCliSessionId(parsed, backend) {
	const fields = backend.sessionIdFields ?? [
		"session_id",
		"sessionId",
		"conversation_id",
		"conversationId"
	];
	for (const field of fields) {
		const value = parsed[field];
		if (typeof value === "string" && value.trim()) return value.trim();
	}
}
function parseCliJson(raw, backend) {
	const parsedRecords = parseJsonRecordCandidates(raw);
	if (parsedRecords.length === 0) return null;
	let sessionId;
	let usage;
	let text = "";
	let sawStructuredOutput = false;
	for (const parsed of parsedRecords) {
		sessionId = pickCliSessionId(parsed, backend) ?? sessionId;
		usage = readCliUsage(parsed) ?? usage;
		const trimmedText = (collectCliText(parsed.message) || collectCliText(parsed.content) || collectCliText(parsed.result) || collectCliText(parsed.response) || collectCliText(parsed)).trim();
		if (trimmedText) {
			text = trimmedText;
			sawStructuredOutput = true;
			continue;
		}
		if (sessionId || usage) sawStructuredOutput = true;
	}
	if (!text && !sawStructuredOutput) return null;
	return {
		text,
		sessionId,
		usage
	};
}
function parseClaudeCliJsonlResult(params) {
	if (!usesClaudeStreamJsonDialect(params)) return null;
	if (typeof params.parsed.type === "string" && params.parsed.type === "result" && typeof params.parsed.result === "string") {
		const resultText = params.parsed.result.trim();
		if (resultText) return {
			text: resultText,
			sessionId: params.sessionId,
			usage: params.usage
		};
		return {
			text: "",
			sessionId: params.sessionId,
			usage: params.usage
		};
	}
	return null;
}
function parseClaudeCliStreamingDelta(params) {
	if (!usesClaudeStreamJsonDialect(params)) return null;
	if (params.parsed.type !== "stream_event" || !isRecord$1(params.parsed.event)) return null;
	const event = params.parsed.event;
	if (event.type !== "content_block_delta" || !isRecord$1(event.delta)) return null;
	const delta = event.delta;
	if (delta.type !== "text_delta" || typeof delta.text !== "string") return null;
	if (!delta.text) return null;
	return {
		text: `${params.textSoFar}${delta.text}`,
		delta: delta.text,
		sessionId: params.sessionId,
		usage: params.usage
	};
}
function createCliJsonlStreamingParser(params) {
	let lineBuffer = "";
	let assistantText = "";
	let sessionId;
	let usage;
	const handleParsedRecord = (parsed) => {
		sessionId = pickCliSessionId(parsed, params.backend) ?? sessionId;
		if (!sessionId && typeof parsed.thread_id === "string") sessionId = parsed.thread_id.trim();
		if (isRecord$1(parsed.usage)) usage = toCliUsage(parsed.usage) ?? usage;
		const delta = parseClaudeCliStreamingDelta({
			backend: params.backend,
			providerId: params.providerId,
			parsed,
			textSoFar: assistantText,
			sessionId,
			usage
		});
		if (!delta) return;
		assistantText = delta.text;
		params.onAssistantDelta(delta);
	};
	const flushLines = (flushPartial) => {
		while (true) {
			const newlineIndex = lineBuffer.indexOf("\n");
			if (newlineIndex < 0) break;
			const line = lineBuffer.slice(0, newlineIndex).trim();
			lineBuffer = lineBuffer.slice(newlineIndex + 1);
			if (!line) continue;
			for (const parsed of parseJsonRecordCandidates(line)) handleParsedRecord(parsed);
		}
		if (!flushPartial) return;
		const tail = lineBuffer.trim();
		lineBuffer = "";
		if (!tail) return;
		for (const parsed of parseJsonRecordCandidates(tail)) handleParsedRecord(parsed);
	};
	return {
		push(chunk) {
			if (!chunk) return;
			lineBuffer += chunk;
			flushLines(false);
		},
		finish() {
			flushLines(true);
		}
	};
}
function parseCliJsonl(raw, backend, providerId) {
	const lines = raw.split(/\r?\n/g).map((line) => line.trim()).filter(Boolean);
	if (lines.length === 0) return null;
	let sessionId;
	let usage;
	const texts = [];
	for (const line of lines) for (const parsed of parseJsonRecordCandidates(line)) {
		if (!sessionId) sessionId = pickCliSessionId(parsed, backend);
		if (!sessionId && typeof parsed.thread_id === "string") sessionId = parsed.thread_id.trim();
		usage = readCliUsage(parsed) ?? usage;
		const claudeResult = parseClaudeCliJsonlResult({
			backend,
			providerId,
			parsed,
			sessionId,
			usage
		});
		if (claudeResult) return claudeResult;
		const item = isRecord$1(parsed.item) ? parsed.item : null;
		if (item && typeof item.text === "string") {
			const type = normalizeLowercaseStringOrEmpty(item.type);
			if (!type || type.includes("message")) texts.push(item.text);
		}
	}
	const text = texts.join("\n").trim();
	if (!text) return null;
	return {
		text,
		sessionId,
		usage
	};
}
function parseCliOutput(params) {
	const outputMode = params.outputMode ?? "text";
	if (outputMode === "text") return {
		text: params.raw.trim(),
		sessionId: params.fallbackSessionId
	};
	if (outputMode === "jsonl") return parseCliJsonl(params.raw, params.backend, params.providerId) ?? {
		text: params.raw.trim(),
		sessionId: params.fallbackSessionId
	};
	return parseCliJson(params.raw, params.backend) ?? {
		text: params.raw.trim(),
		sessionId: params.fallbackSessionId
	};
}
function extractCliErrorMessage(raw) {
	const parsedRecords = parseJsonRecordCandidates(raw);
	if (parsedRecords.length === 0) return null;
	let errorText = "";
	for (const parsed of parsedRecords) {
		const next = collectExplicitCliErrorText(parsed);
		if (next) errorText = next;
	}
	return errorText || null;
}
//#endregion
//#region src/agents/cli-runner/claude-live-session.ts
const CLAUDE_LIVE_IDLE_TIMEOUT_MS = 600 * 1e3;
const CLAUDE_LIVE_MAX_SESSIONS = 16;
const CLAUDE_LIVE_MAX_STDOUT_BUFFER_CHARS = 256 * 1024;
const CLAUDE_LIVE_MAX_STDERR_CHARS = 64 * 1024;
const CLAUDE_LIVE_MAX_TURN_RAW_CHARS = 2 * 1024 * 1024;
const CLAUDE_LIVE_MAX_TURN_LINES = 5e3;
const liveSessions = /* @__PURE__ */ new Map();
const liveSessionCreates = /* @__PURE__ */ new Map();
function sha256(value) {
	return crypto.createHash("sha256").update(value).digest("hex");
}
function shouldUseClaudeLiveSession(context) {
	return context.backendResolved.id === "claude-cli" && context.preparedBackend.backend.liveSession === "claude-stdio" && context.preparedBackend.backend.output === "jsonl" && context.preparedBackend.backend.input === "stdin";
}
function upsertArgValue(args, flag, value) {
	const normalized = [];
	for (let i = 0; i < args.length; i += 1) {
		const arg = args[i] ?? "";
		if (arg === flag) {
			i += 1;
			continue;
		}
		if (arg.startsWith(`${flag}=`)) continue;
		normalized.push(arg);
	}
	normalized.push(flag, value);
	return normalized;
}
function appendArg(args, flag) {
	return args.includes(flag) ? args : [...args, flag];
}
function stripLiveProcessArgs(args, backend) {
	const liveProcessFlags = new Set([
		backend.sessionArg,
		backend.systemPromptArg,
		"--session-id"
	].filter((entry) => typeof entry === "string" && entry.length > 0));
	const stripped = [];
	for (let i = 0; i < args.length; i += 1) {
		const arg = args[i] ?? "";
		if (liveProcessFlags.has(arg)) {
			i += 1;
			continue;
		}
		if ([...liveProcessFlags].some((flag) => arg.startsWith(`${flag}=`))) continue;
		stripped.push(arg);
	}
	return stripped;
}
function appendSystemPromptArg(args, backend, systemPrompt) {
	const prompt = systemPrompt.trim();
	if (!backend.systemPromptArg || !prompt) return args;
	return upsertArgValue(args, backend.systemPromptArg, stripSystemPromptCacheBoundary(prompt));
}
function buildClaudeLiveArgs(params) {
	return appendArg(upsertArgValue(upsertArgValue(params.useResume ? stripLiveProcessArgs(params.args, params.backend) : appendSystemPromptArg(stripLiveProcessArgs(params.args, params.backend), params.backend, params.systemPrompt), "--input-format", "stream-json"), "--permission-prompt-tool", "stdio"), "--replay-user-messages");
}
function buildClaudeLiveKey(context) {
	return `${context.backendResolved.id}:${sha256(JSON.stringify({
		agentAccountId: context.params.agentAccountId,
		agentId: context.params.agentId,
		authProfileId: context.effectiveAuthProfileId,
		sessionId: context.params.sessionId,
		sessionKey: context.params.sessionKey
	}))}`;
}
function buildClaudeLiveFingerprint(params) {
	const normalizeMcpConfigPath = Boolean(params.context.preparedBackend.mcpConfigHash);
	const skillSnapshot = params.context.params.skillsSnapshot;
	const skillsFingerprint = skillSnapshot ? sha256(JSON.stringify({
		promptHash: sha256(skillSnapshot.prompt),
		skillFilter: skillSnapshot.skillFilter,
		skills: skillSnapshot.skills,
		resolvedSkills: (skillSnapshot.resolvedSkills ?? []).map((skill) => ({
			name: skill.name,
			description: skill.description,
			filePath: skill.filePath,
			sourceInfo: skill.sourceInfo
		})),
		version: skillSnapshot.version
	})) : void 0;
	const normalizePluginDir = Boolean(skillsFingerprint);
	const omittedValueFlags = new Set([
		params.context.preparedBackend.backend.systemPromptArg,
		"--resume",
		"-r"
	].filter((entry) => typeof entry === "string" && entry.length > 0));
	const unstableValueFlags = new Set([
		params.context.preparedBackend.backend.sessionArg,
		"--session-id",
		normalizeMcpConfigPath ? "--mcp-config" : void 0,
		normalizePluginDir ? "--plugin-dir" : void 0
	].filter((entry) => typeof entry === "string" && entry.length > 0));
	const stableArgv = [];
	for (let i = 0; i < params.argv.length; i += 1) {
		const entry = params.argv[i] ?? "";
		if (omittedValueFlags.has(entry)) {
			i += 1;
			continue;
		}
		if ([...omittedValueFlags].some((flag) => entry.startsWith(`${flag}=`))) continue;
		if (unstableValueFlags.has(entry)) {
			stableArgv.push("<unstable>");
			i += 1;
			continue;
		}
		if ([...unstableValueFlags].some((flag) => entry.startsWith(`${flag}=`))) {
			stableArgv.push("<unstable>");
			continue;
		}
		stableArgv.push(entry);
	}
	return JSON.stringify({
		command: params.context.preparedBackend.backend.command,
		workspaceDirHash: sha256(params.context.workspaceDir),
		provider: params.context.params.provider,
		model: params.context.normalizedModel,
		systemPromptHash: sha256(params.context.systemPrompt),
		authProfileIdHash: params.context.effectiveAuthProfileId ? sha256(params.context.effectiveAuthProfileId) : void 0,
		authEpochHash: params.context.authEpoch ? sha256(params.context.authEpoch) : void 0,
		extraSystemPromptHash: params.context.extraSystemPromptHash,
		mcpConfigHash: params.context.preparedBackend.mcpConfigHash,
		skillsFingerprint,
		argv: stableArgv,
		env: Object.keys(params.env).toSorted().map((key) => [key, params.env[key] ? sha256(params.env[key]) : ""])
	});
}
function createAbortError() {
	const error = /* @__PURE__ */ new Error("CLI run aborted");
	error.name = "AbortError";
	return error;
}
function clearTurnTimers(turn) {
	if (turn.noOutputTimer) {
		clearTimeout(turn.noOutputTimer);
		turn.noOutputTimer = null;
	}
	if (turn.timeoutTimer) {
		clearTimeout(turn.timeoutTimer);
		turn.timeoutTimer = null;
	}
}
function clearDrainTimer(session) {
	if (session.drainTimer) {
		clearTimeout(session.drainTimer);
		session.drainTimer = null;
	}
}
function finishTurn(session, output) {
	const turn = session.currentTurn;
	if (!turn) return;
	cliBackendLog.info(`claude live session turn: provider=${session.providerId} model=${session.modelId} durationMs=${Date.now() - turn.startedAtMs} rawLines=${turn.rawLines.length}`);
	clearTurnTimers(turn);
	turn.streamingParser.finish();
	session.currentTurn = null;
	turn.resolve(output);
	scheduleIdleClose(session);
}
function failTurn(session, error) {
	const turn = session.currentTurn;
	if (!turn) return;
	const errorKind = error instanceof Error ? error.name : typeof error;
	cliBackendLog.warn(`claude live session turn failed: provider=${session.providerId} model=${session.modelId} durationMs=${Date.now() - turn.startedAtMs} error=${errorKind}`);
	clearTurnTimers(turn);
	turn.streamingParser.finish();
	session.currentTurn = null;
	turn.reject(error);
}
function abortTurn(session, error) {
	if (!session.currentTurn) return;
	closeLiveSession(session, "abort", error);
}
function cleanupLiveSession(session) {
	if (session.cleanupDone) return;
	session.cleanupDone = true;
	session.cleanup();
}
function closeLiveSession(session, reason, error) {
	if (session.closing) return;
	cliBackendLog.info(`claude live session close: provider=${session.providerId} model=${session.modelId} reason=${reason}`);
	session.closing = true;
	if (session.idleTimer) {
		clearTimeout(session.idleTimer);
		session.idleTimer = null;
	}
	clearDrainTimer(session);
	if (liveSessions.get(session.key) === session) liveSessions.delete(session.key);
	if (error) failTurn(session, error);
	session.managedRun.cancel("manual-cancel");
	cleanupLiveSession(session);
}
function scheduleIdleClose(session) {
	if (session.idleTimer) clearTimeout(session.idleTimer);
	session.idleTimer = setTimeout(() => {
		if (!session.currentTurn) closeLiveSession(session, "idle");
	}, CLAUDE_LIVE_IDLE_TIMEOUT_MS);
}
function createTimeoutError(session, message) {
	return new FailoverError(message, {
		reason: "timeout",
		provider: session.providerId,
		model: session.modelId,
		status: resolveFailoverStatus("timeout")
	});
}
function createOutputLimitError(session, message) {
	return new FailoverError(message, {
		reason: "format",
		provider: session.providerId,
		model: session.modelId,
		status: resolveFailoverStatus("format")
	});
}
function resetNoOutputTimer(session) {
	const turn = session.currentTurn;
	if (!turn) return;
	if (turn.noOutputTimer) clearTimeout(turn.noOutputTimer);
	turn.noOutputTimer = setTimeout(() => {
		closeLiveSession(session, "abort", createTimeoutError(session, `CLI produced no output for ${Math.round(session.noOutputTimeoutMs / 1e3)}s and was terminated.`));
	}, session.noOutputTimeoutMs);
}
function parseSessionId(parsed) {
	return (typeof parsed.session_id === "string" ? parsed.session_id.trim() : typeof parsed.sessionId === "string" ? parsed.sessionId.trim() : "") || void 0;
}
function isRecord(value) {
	return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
function parseClaudeLiveJsonLine(session, trimmed) {
	if (trimmed.length > CLAUDE_LIVE_MAX_STDOUT_BUFFER_CHARS) {
		closeLiveSession(session, "abort", createOutputLimitError(session, "Claude CLI JSONL line exceeded output limit."));
		return null;
	}
	let parsed;
	try {
		parsed = JSON.parse(trimmed);
	} catch {
		return null;
	}
	return isRecord(parsed) ? parsed : null;
}
function createResultError(session, parsed, raw) {
	const result = typeof parsed.result === "string" ? parsed.result.trim() : "";
	const message = extractCliErrorMessage(raw) ?? (result || "Claude CLI failed.");
	const reason = classifyFailoverReason(message, { provider: session.providerId }) ?? "unknown";
	return new FailoverError(message, {
		reason,
		provider: session.providerId,
		model: session.modelId,
		status: resolveFailoverStatus(reason)
	});
}
function handleClaudeLiveLine(session, line) {
	const turn = session.currentTurn;
	const trimmed = line.trim();
	if (!trimmed) return;
	const parsed = parseClaudeLiveJsonLine(session, trimmed);
	if (!parsed) return;
	if (session.drainingAbortedTurn) {
		if (parsed.type === "result") {
			const turnToClear = session.currentTurn;
			if (turnToClear) {
				clearTurnTimers(turnToClear);
				session.currentTurn = null;
			}
			session.drainingAbortedTurn = false;
			clearDrainTimer(session);
			scheduleIdleClose(session);
		}
		return;
	}
	if (!turn) return;
	turn.rawChars += trimmed.length + 1;
	if (turn.rawChars > CLAUDE_LIVE_MAX_TURN_RAW_CHARS || turn.rawLines.length >= CLAUDE_LIVE_MAX_TURN_LINES) {
		closeLiveSession(session, "abort", createOutputLimitError(session, "Claude CLI turn output exceeded limit."));
		return;
	}
	turn.rawLines.push(trimmed);
	turn.streamingParser.push(`${trimmed}\n`);
	turn.sessionId = parseSessionId(parsed) ?? turn.sessionId;
	if (parsed.type !== "result") return;
	const raw = turn.rawLines.join("\n");
	if (parsed.is_error === true) {
		failTurn(session, createResultError(session, parsed, raw));
		scheduleIdleClose(session);
		return;
	}
	finishTurn(session, parseCliOutput({
		raw,
		backend: turn.backend,
		providerId: session.providerId,
		outputMode: "jsonl",
		fallbackSessionId: turn.sessionId
	}));
}
function handleClaudeStdout(session, chunk) {
	resetNoOutputTimer(session);
	session.stdoutBuffer += chunk;
	if (session.stdoutBuffer.length > CLAUDE_LIVE_MAX_STDOUT_BUFFER_CHARS) {
		closeLiveSession(session, "abort", createOutputLimitError(session, "Claude CLI stdout buffer exceeded limit."));
		return;
	}
	const lines = session.stdoutBuffer.split(/\r?\n/g);
	session.stdoutBuffer = lines.pop() ?? "";
	try {
		for (const line of lines) handleClaudeLiveLine(session, line);
	} catch (error) {
		closeLiveSession(session, "abort", error);
	}
}
function handleClaudeExit(session, exitCode) {
	session.closing = true;
	if (session.idleTimer) {
		clearTimeout(session.idleTimer);
		session.idleTimer = null;
	}
	clearDrainTimer(session);
	if (liveSessions.get(session.key) === session) liveSessions.delete(session.key);
	cleanupLiveSession(session);
	if (!session.currentTurn) return;
	if (session.stdoutBuffer.trim()) {
		try {
			handleClaudeLiveLine(session, session.stdoutBuffer);
		} catch (error) {
			session.stdoutBuffer = "";
			failTurn(session, error);
			return;
		}
		session.stdoutBuffer = "";
	}
	if (!session.currentTurn) return;
	const stderr = session.stderr.trim();
	const fallbackMessage = exitCode === 0 ? "Claude CLI exited before completing the turn." : "Claude CLI failed.";
	const message = extractCliErrorMessage(stderr) ?? (stderr || fallbackMessage);
	if (exitCode === 0) {
		failTurn(session, new Error(message));
		return;
	}
	const reason = classifyFailoverReason(message, { provider: session.providerId }) ?? "unknown";
	failTurn(session, new FailoverError(message, {
		reason,
		provider: session.providerId,
		model: session.modelId,
		status: resolveFailoverStatus(reason)
	}));
}
function createClaudeUserInputMessage(content) {
	return `${JSON.stringify({
		type: "user",
		session_id: "",
		parent_tool_use_id: null,
		message: {
			role: "user",
			content
		}
	})}\n`;
}
async function writeTurnInput(session, prompt) {
	const stdin = session.managedRun.stdin;
	if (!stdin) throw new Error("Claude CLI live session stdin is unavailable");
	await new Promise((resolve, reject) => {
		stdin.write(createClaudeUserInputMessage(prompt), (error) => {
			if (error) {
				reject(error);
				return;
			}
			resolve();
		});
	});
}
async function createClaudeLiveSession(params) {
	let session = null;
	const managedRun = await params.supervisor.spawn({
		sessionId: params.context.params.sessionId,
		backendId: params.context.backendResolved.id,
		scopeKey: `claude-live:${params.key}`,
		replaceExistingScope: true,
		mode: "child",
		argv: params.argv,
		cwd: params.context.workspaceDir,
		env: params.env,
		stdinMode: "pipe-open",
		captureOutput: false,
		onStdout: (chunk) => {
			if (session) handleClaudeStdout(session, chunk);
		},
		onStderr: (chunk) => {
			if (session) {
				session.stderr += chunk;
				if (session.stderr.length > CLAUDE_LIVE_MAX_STDERR_CHARS) {
					closeLiveSession(session, "abort", createOutputLimitError(session, "Claude CLI stderr exceeded limit."));
					return;
				}
				resetNoOutputTimer(session);
			}
		}
	});
	session = {
		key: params.key,
		fingerprint: params.fingerprint,
		managedRun,
		providerId: params.context.params.provider,
		modelId: params.context.modelId,
		noOutputTimeoutMs: params.noOutputTimeoutMs,
		stderr: "",
		stdoutBuffer: "",
		currentTurn: null,
		drainTimer: null,
		drainingAbortedTurn: false,
		idleTimer: null,
		cleanup: params.cleanup,
		cleanupDone: false,
		closing: false
	};
	managedRun.wait().then((exit) => handleClaudeExit(session, exit.exitCode), (error) => {
		if (session) closeLiveSession(session, "abort", error);
	});
	liveSessions.set(params.key, session);
	cliBackendLog.info(`claude live session start: provider=${session.providerId} model=${session.modelId} activeSessions=${liveSessions.size}`);
	return session;
}
function createTurn(params) {
	const turn = {
		backend: params.context.preparedBackend.backend,
		startedAtMs: Date.now(),
		rawLines: [],
		rawChars: 0,
		noOutputTimer: null,
		timeoutTimer: null,
		streamingParser: createCliJsonlStreamingParser({
			backend: params.context.preparedBackend.backend,
			providerId: params.context.backendResolved.id,
			onAssistantDelta: params.onAssistantDelta
		}),
		resolve: params.resolve,
		reject: params.reject
	};
	turn.noOutputTimer = setTimeout(() => {
		closeLiveSession(params.session, "abort", createTimeoutError(params.session, `CLI produced no output for ${Math.round(params.noOutputTimeoutMs / 1e3)}s and was terminated.`));
	}, params.noOutputTimeoutMs);
	turn.timeoutTimer = setTimeout(() => {
		closeLiveSession(params.session, "abort", createTimeoutError(params.session, `CLI exceeded timeout (${Math.round(params.context.params.timeoutMs / 1e3)}s) and was terminated.`));
	}, params.context.params.timeoutMs);
	return turn;
}
function closeOldestIdleSession() {
	for (const session of liveSessions.values()) if (!session.currentTurn && !session.drainingAbortedTurn) {
		closeLiveSession(session, "idle");
		return true;
	}
	return false;
}
function ensureLiveSessionCapacity(key, context) {
	if (liveSessions.has(key) || liveSessionCreates.has(key) || liveSessions.size + liveSessionCreates.size < CLAUDE_LIVE_MAX_SESSIONS) return;
	if (closeOldestIdleSession()) return;
	throw new FailoverError("Too many Claude CLI live sessions are active.", {
		reason: "rate_limit",
		provider: context.params.provider,
		model: context.modelId,
		status: resolveFailoverStatus("rate_limit")
	});
}
async function runClaudeLiveSessionTurn(params) {
	const key = buildClaudeLiveKey(params.context);
	const resumeCapable = Boolean(params.context.preparedBackend.backend.resumeArgs?.length);
	const argv = [params.context.preparedBackend.backend.command, ...buildClaudeLiveArgs({
		args: params.args,
		backend: params.context.preparedBackend.backend,
		systemPrompt: params.context.systemPrompt,
		useResume: params.useResume
	})];
	const fingerprint = buildClaudeLiveFingerprint({
		context: params.context,
		argv,
		env: params.env
	});
	let cleanupDone = false;
	const cleanup = async () => {
		if (cleanupDone) return;
		cleanupDone = true;
		await params.cleanup();
	};
	let session = liveSessions.get(key) ?? null;
	if (session && resumeCapable && !params.useResume) {
		closeLiveSession(session, "restart");
		session = null;
	}
	if (session && session.fingerprint !== fingerprint) {
		closeLiveSession(session, "restart");
		session = null;
	}
	let cleanupTurnArtifacts = Boolean(session);
	try {
		ensureLiveSessionCapacity(key, params.context);
	} catch (error) {
		await cleanup();
		throw error;
	}
	if (!session) {
		const pendingSession = liveSessionCreates.get(key);
		if (pendingSession) {
			try {
				session = await pendingSession;
			} catch (error) {
				await cleanup();
				throw error;
			}
			if (session.fingerprint !== fingerprint) {
				closeLiveSession(session, "restart");
				session = null;
			} else if (resumeCapable && !params.useResume) {
				closeLiveSession(session, "restart");
				session = null;
			} else cleanupTurnArtifacts = true;
		}
		if (!session) {
			const createSession = createClaudeLiveSession({
				context: params.context,
				argv,
				env: params.env,
				fingerprint,
				key,
				noOutputTimeoutMs: params.noOutputTimeoutMs,
				supervisor: params.getProcessSupervisor(),
				cleanup
			}).finally(() => {
				if (liveSessionCreates.get(key) === createSession) liveSessionCreates.delete(key);
			});
			liveSessionCreates.set(key, createSession);
			try {
				session = await createSession;
			} catch (error) {
				await cleanup();
				throw error;
			}
		}
	}
	if (cleanupTurnArtifacts && session) {
		await cleanup();
		if (session.idleTimer) {
			clearTimeout(session.idleTimer);
			session.idleTimer = null;
		}
		cliBackendLog.info(`claude live session reuse: provider=${session.providerId} model=${session.modelId}`);
	}
	if (session.closing) {
		await cleanup();
		throw new Error("Claude CLI live session closed before handling the turn");
	}
	if (session.currentTurn || session.drainingAbortedTurn) throw new Error("Claude CLI live session is already handling a turn");
	const liveSession = session;
	liveSession.noOutputTimeoutMs = params.noOutputTimeoutMs;
	liveSession.stderr = "";
	const outputPromise = new Promise((resolve, reject) => {
		liveSession.currentTurn = createTurn({
			context: params.context,
			noOutputTimeoutMs: params.noOutputTimeoutMs,
			onAssistantDelta: params.onAssistantDelta,
			session: liveSession,
			resolve,
			reject
		});
	});
	const abort = () => abortTurn(liveSession, createAbortError());
	let replyBackendCompleted = false;
	const replyBackendHandle = params.context.params.replyOperation ? {
		kind: "cli",
		cancel: abort,
		isStreaming: () => !replyBackendCompleted
	} : void 0;
	params.context.params.abortSignal?.addEventListener("abort", abort, { once: true });
	if (replyBackendHandle) params.context.params.replyOperation?.attachBackend(replyBackendHandle);
	try {
		if (params.context.params.abortSignal?.aborted) abort();
		else try {
			await writeTurnInput(liveSession, params.prompt);
		} catch (error) {
			closeLiveSession(liveSession, "abort", error);
		}
		return { output: await outputPromise };
	} finally {
		replyBackendCompleted = true;
		params.context.params.abortSignal?.removeEventListener("abort", abort);
		if (replyBackendHandle) params.context.params.replyOperation?.detachBackend(replyBackendHandle);
	}
}
//#endregion
//#region src/agents/cli-runner/claude-skills-plugin.ts
const CLAUDE_CLI_BACKEND_ID = "claude-cli";
const OPENCLAW_CLAUDE_PLUGIN_NAME = "openclaw-skills";
function sanitizeSkillDirName(name, used) {
	const base = name.trim().replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "skill";
	const safeBase = base.startsWith(".") ? `skill-${base.replace(/^\.+/, "") || "skill"}` : base;
	let candidate = safeBase;
	for (let index = 2; used.has(candidate); index += 1) candidate = `${safeBase}-${index}`;
	used.add(candidate);
	return candidate;
}
async function collectClaudePluginSkills(snapshot) {
	const skills = snapshot?.resolvedSkills ?? [];
	if (skills.length === 0) return [];
	const usedTargetNames = /* @__PURE__ */ new Set();
	const materialized = [];
	for (const skill of skills) {
		const name = skill.name?.trim();
		const skillFilePath = skill.filePath?.trim();
		if (!name || !skillFilePath) continue;
		try {
			await fs.access(skillFilePath);
		} catch {
			cliBackendLog.warn(`claude skill plugin skipped missing skill file: ${skillFilePath}`);
			continue;
		}
		materialized.push({
			name,
			sourceDir: path.dirname(skillFilePath),
			targetDirName: sanitizeSkillDirName(name, usedTargetNames)
		});
	}
	return materialized;
}
async function linkOrCopySkillDir(params) {
	try {
		await fs.symlink(params.sourceDir, params.targetDir, process.platform === "win32" ? "junction" : "dir");
	} catch {
		await fs.cp(params.sourceDir, params.targetDir, {
			recursive: true,
			force: true,
			verbatimSymlinks: true
		});
	}
}
async function prepareClaudeCliSkillsPlugin(params) {
	if (normalizeLowercaseStringOrEmpty(params.backendId) !== CLAUDE_CLI_BACKEND_ID) return {
		args: [],
		cleanup: async () => {}
	};
	const skills = await collectClaudePluginSkills(params.skillsSnapshot);
	if (skills.length === 0) return {
		args: [],
		cleanup: async () => {}
	};
	const tempDir = await fs.mkdtemp(path.join(resolvePreferredOpenClawTmpDir(), "openclaw-claude-skills-"));
	const pluginDir = path.join(tempDir, OPENCLAW_CLAUDE_PLUGIN_NAME);
	const manifestDir = path.join(pluginDir, ".claude-plugin");
	const skillsDir = path.join(pluginDir, "skills");
	await fs.mkdir(manifestDir, {
		recursive: true,
		mode: 448
	});
	await fs.mkdir(skillsDir, {
		recursive: true,
		mode: 448
	});
	const manifest = {
		name: OPENCLAW_CLAUDE_PLUGIN_NAME,
		version: "0.0.0",
		description: "Session-scoped OpenClaw skills selected for this agent run.",
		skills: "./skills"
	};
	await fs.writeFile(path.join(manifestDir, "plugin.json"), `${JSON.stringify(manifest, null, 2)}\n`, {
		encoding: "utf-8",
		mode: 384
	});
	let linkedSkillCount = 0;
	for (const skill of skills) try {
		await linkOrCopySkillDir({
			sourceDir: skill.sourceDir,
			targetDir: path.join(skillsDir, skill.targetDirName)
		});
		linkedSkillCount += 1;
	} catch (error) {
		cliBackendLog.warn(`claude skill plugin skipped ${skill.name}: ${error instanceof Error ? error.message : String(error)}`);
	}
	if (linkedSkillCount === 0) {
		await fs.rm(tempDir, {
			recursive: true,
			force: true
		});
		return {
			args: [],
			cleanup: async () => {}
		};
	}
	return {
		args: ["--plugin-dir", pluginDir],
		pluginDir,
		cleanup: async () => {
			await fs.rm(tempDir, {
				recursive: true,
				force: true
			});
		}
	};
}
//#endregion
//#region src/agents/cli-runner/execute.ts
const executeDeps = {
	getProcessSupervisor,
	enqueueSystemEvent,
	requestHeartbeatNow
};
function createCliAbortError() {
	const error = /* @__PURE__ */ new Error("CLI run aborted");
	error.name = "AbortError";
	return error;
}
function buildCliLogArgs(params) {
	const logArgs = [];
	for (let i = 0; i < params.args.length; i += 1) {
		const arg = params.args[i] ?? "";
		if (arg === params.systemPromptArg) {
			const systemPromptValue = params.args[i + 1] ?? "";
			logArgs.push(arg, `<systemPrompt:${systemPromptValue.length} chars>`);
			i += 1;
			continue;
		}
		if (arg === params.sessionArg) {
			logArgs.push(arg, params.args[i + 1] ?? "");
			i += 1;
			continue;
		}
		if (arg === params.modelArg) {
			logArgs.push(arg, params.args[i + 1] ?? "");
			i += 1;
			continue;
		}
		if (arg === params.imageArg) {
			logArgs.push(arg, "<image>");
			i += 1;
			continue;
		}
		logArgs.push(arg);
	}
	if (params.argsPrompt) {
		const promptIndex = logArgs.indexOf(params.argsPrompt);
		if (promptIndex >= 0) logArgs[promptIndex] = `<prompt:${params.argsPrompt.length} chars>`;
	}
	return logArgs;
}
const CLI_ENV_AUTH_LOG_KEYS = [
	"AI_GATEWAY_API_KEY",
	"ANTHROPIC_API_KEY",
	"ANTHROPIC_API_KEY_OLD",
	"ANTHROPIC_API_TOKEN",
	"ANTHROPIC_AUTH_TOKEN",
	"ANTHROPIC_BASE_URL",
	"ANTHROPIC_CUSTOM_HEADERS",
	"ANTHROPIC_OAUTH_TOKEN",
	"ANTHROPIC_UNIX_SOCKET",
	"AZURE_OPENAI_API_KEY",
	"CLAUDE_CODE_OAUTH_TOKEN",
	"CLAUDE_CODE_PROVIDER_MANAGED_BY_HOST",
	"OPENAI_API_KEY",
	"OPENAI_STEIPETE_API_KEY",
	"OPENROUTER_API_KEY"
];
const CLI_BACKEND_PRESERVE_ENV = "OPENCLAW_LIVE_CLI_BACKEND_PRESERVE_ENV";
function parseCliBackendPreserveEnv(raw) {
	const trimmed = raw?.trim();
	if (!trimmed) return /* @__PURE__ */ new Set();
	if (trimmed.startsWith("[")) try {
		const parsed = JSON.parse(trimmed);
		return new Set(Array.isArray(parsed) ? parsed.filter((entry) => typeof entry === "string") : []);
	} catch {
		return /* @__PURE__ */ new Set();
	}
	return new Set(trimmed.split(/[,\s]+/).map((entry) => entry.trim()).filter((entry) => entry.length > 0));
}
function listPresentCliAuthEnvKeys(env) {
	return CLI_ENV_AUTH_LOG_KEYS.filter((key) => {
		const value = env[key];
		return typeof value === "string" && value.length > 0;
	});
}
function formatCliEnvKeyList(keys) {
	return keys.length > 0 ? keys.join(",") : "none";
}
function buildCliEnvMcpLog(childEnv) {
	return [
		`token=${childEnv.OPENCLAW_MCP_TOKEN ? "set" : "missing"}`,
		`sessionKey=${childEnv.OPENCLAW_MCP_SESSION_KEY ? "set" : "<empty>"}`,
		`agentId=${childEnv.OPENCLAW_MCP_AGENT_ID || "<empty>"}`,
		`accountId=${childEnv.OPENCLAW_MCP_ACCOUNT_ID || "<empty>"}`,
		`messageChannel=${childEnv.OPENCLAW_MCP_MESSAGE_CHANNEL || "<empty>"}`,
		`senderIsOwner=${childEnv.OPENCLAW_MCP_SENDER_IS_OWNER || "<empty>"}`
	].join(" ");
}
function buildCliEnvAuthLog(childEnv) {
	const hostKeys = listPresentCliAuthEnvKeys(process.env);
	const childKeys = listPresentCliAuthEnvKeys(childEnv);
	const childKeySet = new Set(childKeys);
	const clearedKeys = hostKeys.filter((key) => !childKeySet.has(key));
	return [
		`host=${formatCliEnvKeyList(hostKeys)}`,
		`child=${formatCliEnvKeyList(childKeys)}`,
		`cleared=${formatCliEnvKeyList(clearedKeys)}`
	].join(" ");
}
async function executePreparedCliRun(context, cliSessionIdToUse) {
	const params = context.params;
	if (params.abortSignal?.aborted) throw createCliAbortError();
	const backend = context.preparedBackend.backend;
	const { sessionId: resolvedSessionId, isNew } = resolveSessionIdToSend({
		backend,
		cliSessionId: cliSessionIdToUse
	});
	const useResume = Boolean(cliSessionIdToUse && resolvedSessionId && backend.resumeArgs && backend.resumeArgs.length > 0);
	const systemPromptArg = resolveSystemPromptUsage({
		backend,
		isNewSession: isNew,
		systemPrompt: context.systemPrompt
	});
	const systemPromptFile = !useResume && systemPromptArg ? await writeCliSystemPromptFile({
		backend,
		systemPrompt: systemPromptArg
	}) : void 0;
	let prompt = applyPluginTextReplacements(prependBootstrapPromptWarning(params.prompt, context.bootstrapPromptWarningLines, { preserveExactPrompt: context.heartbeatPrompt }), context.backendResolved.textTransforms?.input);
	const { prompt: promptWithImages, imagePaths, cleanupImages } = await prepareCliPromptImagePayload({
		backend,
		prompt,
		workspaceDir: context.workspaceDir,
		images: params.images
	});
	prompt = promptWithImages;
	const { argsPrompt, stdin } = resolvePromptInput({
		backend,
		prompt
	});
	const stdinPayload = stdin ?? "";
	const baseArgs = useResume ? backend.resumeArgs ?? backend.args ?? [] : backend.args ?? [];
	const resolvedArgs = useResume ? baseArgs.map((entry) => entry.replaceAll("{sessionId}", resolvedSessionId ?? "")) : baseArgs;
	const claudeSkillsPlugin = await prepareClaudeCliSkillsPlugin({
		backendId: context.backendResolved.id,
		skillsSnapshot: params.skillsSnapshot
	});
	let claudeSkillsPluginCleanupOwned = false;
	const args = buildCliArgs({
		backend,
		baseArgs: claudeSkillsPlugin.args.length > 0 ? [...resolvedArgs, ...claudeSkillsPlugin.args] : resolvedArgs,
		modelId: context.normalizedModel,
		sessionId: resolvedSessionId,
		systemPrompt: systemPromptArg,
		systemPromptFilePath: systemPromptFile?.filePath,
		imagePaths,
		promptArg: argsPrompt,
		useResume
	});
	const queueKey = resolveCliRunQueueKey({
		backendId: context.backendResolved.id,
		serialize: backend.serialize,
		runId: params.runId,
		workspaceDir: context.workspaceDir,
		cliSessionId: useResume ? resolvedSessionId : void 0
	});
	try {
		return await enqueueCliRun(queueKey, async () => {
			const restoreSkillEnv = params.skillsSnapshot ? applySkillEnvOverridesFromSnapshot({
				snapshot: params.skillsSnapshot,
				config: params.config
			}) : void 0;
			try {
				cliBackendLog.info(`cli exec: provider=${params.provider} model=${context.normalizedModel} promptChars=${params.prompt.length}`);
				const logOutputText = isTruthyEnvValue(process.env["OPENCLAW_CLI_BACKEND_LOG_OUTPUT"]) || isTruthyEnvValue(process.env["OPENCLAW_CLAUDE_CLI_LOG_OUTPUT"]);
				const env = (() => {
					const next = sanitizeHostExecEnv({
						baseEnv: process.env,
						blockPathOverrides: true
					});
					const preservedEnv = parseCliBackendPreserveEnv(process.env[CLI_BACKEND_PRESERVE_ENV]);
					for (const key of backend.clearEnv ?? []) {
						if (preservedEnv.has(key)) continue;
						delete next[key];
					}
					if (backend.env && Object.keys(backend.env).length > 0) Object.assign(next, sanitizeHostExecEnv({
						baseEnv: {},
						overrides: backend.env,
						blockPathOverrides: true
					}));
					Object.assign(next, context.preparedBackend.env);
					delete next["CLAUDE_CODE_PROVIDER_MANAGED_BY_HOST"];
					return next;
				})();
				if (logOutputText) {
					const logArgs = buildCliLogArgs({
						args,
						systemPromptArg: backend.systemPromptArg,
						sessionArg: backend.sessionArg,
						modelArg: backend.modelArg,
						imageArg: backend.imageArg,
						argsPrompt
					});
					cliBackendLog.info(`cli argv: ${backend.command} ${logArgs.join(" ")}`);
					cliBackendLog.info(`cli env auth: ${buildCliEnvAuthLog(env)}`);
					if (env.OPENCLAW_MCP_TOKEN || env.OPENCLAW_MCP_SESSION_KEY || env.OPENCLAW_MCP_SENDER_IS_OWNER) cliBackendLog.info(`cli env mcp: ${buildCliEnvMcpLog(env)}`);
				}
				const noOutputTimeoutMs = resolveCliNoOutputTimeoutMs({
					backend,
					timeoutMs: params.timeoutMs,
					useResume
				});
				const hasJsonlOutput = backend.output === "jsonl";
				if (shouldUseClaudeLiveSession(context)) {
					if (!hasJsonlOutput) throw new Error("Claude live session requires JSONL streaming parser");
					claudeSkillsPluginCleanupOwned = true;
					const liveResult = await runClaudeLiveSessionTurn({
						context,
						args,
						env,
						prompt,
						useResume,
						noOutputTimeoutMs,
						getProcessSupervisor: executeDeps.getProcessSupervisor,
						onAssistantDelta: ({ text, delta }) => {
							emitAgentEvent({
								runId: params.runId,
								stream: "assistant",
								data: {
									text: applyPluginTextReplacements(text, context.backendResolved.textTransforms?.output),
									delta: applyPluginTextReplacements(delta, context.backendResolved.textTransforms?.output)
								}
							});
						},
						cleanup: claudeSkillsPlugin.cleanup
					});
					const rawText = liveResult.output.text;
					return {
						...liveResult.output,
						rawText,
						finalPromptText: prompt,
						text: applyPluginTextReplacements(rawText, context.backendResolved.textTransforms?.output)
					};
				}
				const streamingParser = hasJsonlOutput ? createCliJsonlStreamingParser({
					backend,
					providerId: context.backendResolved.id,
					onAssistantDelta: ({ text, delta }) => {
						emitAgentEvent({
							runId: params.runId,
							stream: "assistant",
							data: {
								text: applyPluginTextReplacements(text, context.backendResolved.textTransforms?.output),
								delta: applyPluginTextReplacements(delta, context.backendResolved.textTransforms?.output)
							}
						});
					}
				}) : null;
				const supervisor = executeDeps.getProcessSupervisor();
				const scopeKey = buildCliSupervisorScopeKey({
					backend,
					backendId: context.backendResolved.id,
					cliSessionId: useResume ? resolvedSessionId : void 0
				});
				const managedRun = await supervisor.spawn({
					sessionId: params.sessionId,
					backendId: context.backendResolved.id,
					scopeKey,
					replaceExistingScope: Boolean(useResume && scopeKey),
					mode: "child",
					argv: [backend.command, ...args],
					timeoutMs: params.timeoutMs,
					noOutputTimeoutMs,
					cwd: context.workspaceDir,
					env,
					input: stdinPayload,
					onStdout: streamingParser ? (chunk) => streamingParser.push(chunk) : void 0
				});
				let replyBackendCompleted = false;
				const replyBackendHandle = params.replyOperation ? {
					kind: "cli",
					cancel: () => {
						managedRun.cancel("manual-cancel");
					},
					isStreaming: () => !replyBackendCompleted
				} : void 0;
				if (replyBackendHandle) params.replyOperation?.attachBackend(replyBackendHandle);
				const abortManagedRun = () => {
					managedRun.cancel("manual-cancel");
				};
				params.abortSignal?.addEventListener("abort", abortManagedRun, { once: true });
				if (params.abortSignal?.aborted) abortManagedRun();
				let result;
				try {
					result = await managedRun.wait();
				} finally {
					replyBackendCompleted = true;
					if (replyBackendHandle) params.replyOperation?.detachBackend(replyBackendHandle);
					params.abortSignal?.removeEventListener("abort", abortManagedRun);
				}
				streamingParser?.finish();
				if (params.abortSignal?.aborted && result.reason === "manual-cancel") throw createCliAbortError();
				const stdout = result.stdout.trim();
				const stderr = result.stderr.trim();
				if (logOutputText) {
					if (stdout) cliBackendLog.info(`cli stdout:\n${stdout}`);
					if (stderr) cliBackendLog.info(`cli stderr:\n${stderr}`);
				}
				if (shouldLogVerbose()) {
					if (stdout) cliBackendLog.debug(`cli stdout:\n${stdout}`);
					if (stderr) cliBackendLog.debug(`cli stderr:\n${stderr}`);
				}
				if (result.exitCode !== 0 || result.reason !== "exit") {
					if (result.reason === "no-output-timeout" || result.noOutputTimedOut) {
						const timeoutReason = `CLI produced no output for ${Math.round(noOutputTimeoutMs / 1e3)}s and was terminated.`;
						cliBackendLog.warn(`cli watchdog timeout: provider=${params.provider} model=${context.modelId} session=${resolvedSessionId ?? params.sessionId} noOutputTimeoutMs=${noOutputTimeoutMs} pid=${managedRun.pid ?? "unknown"}`);
						if (params.sessionKey) {
							const stallNotice = [
								`CLI agent (${params.provider}) produced no output for ${Math.round(noOutputTimeoutMs / 1e3)}s and was terminated.`,
								"It may have been waiting for interactive input or an approval prompt.",
								"For Claude Code, prefer --permission-mode bypassPermissions --print."
							].join(" ");
							executeDeps.enqueueSystemEvent(stallNotice, { sessionKey: params.sessionKey });
							executeDeps.requestHeartbeatNow(scopedHeartbeatWakeOptions(params.sessionKey, { reason: "cli:watchdog:stall" }));
						}
						throw new FailoverError(timeoutReason, {
							reason: "timeout",
							provider: params.provider,
							model: context.modelId,
							status: resolveFailoverStatus("timeout")
						});
					}
					if (result.reason === "overall-timeout") throw new FailoverError(`CLI exceeded timeout (${Math.round(params.timeoutMs / 1e3)}s) and was terminated.`, {
						reason: "timeout",
						provider: params.provider,
						model: context.modelId,
						status: resolveFailoverStatus("timeout")
					});
					const primaryErrorText = stderr || stdout;
					const err = (extractCliErrorMessage(primaryErrorText) ?? (stderr ? extractCliErrorMessage(stdout) : null)) || primaryErrorText || "CLI failed.";
					const reason = classifyFailoverReason(err, { provider: params.provider }) ?? "unknown";
					const status = resolveFailoverStatus(reason);
					throw new FailoverError(err, {
						reason,
						provider: params.provider,
						model: context.modelId,
						status
					});
				}
				const parsed = parseCliOutput({
					raw: stdout,
					backend,
					providerId: context.backendResolved.id,
					outputMode: useResume ? backend.resumeOutput ?? backend.output : backend.output,
					fallbackSessionId: resolvedSessionId
				});
				const rawText = parsed.text;
				return {
					...parsed,
					rawText,
					finalPromptText: prompt,
					text: applyPluginTextReplacements(rawText, context.backendResolved.textTransforms?.output)
				};
			} finally {
				restoreSkillEnv?.();
			}
		});
	} finally {
		if (!claudeSkillsPluginCleanupOwned) await claudeSkillsPlugin.cleanup();
		if (systemPromptFile) await systemPromptFile.cleanup();
		if (cleanupImages) await cleanupImages();
	}
}
//#endregion
export { executePreparedCliRun };
