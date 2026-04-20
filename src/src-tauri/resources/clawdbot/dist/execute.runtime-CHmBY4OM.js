import { i as normalizeLowercaseStringOrEmpty } from "./string-coerce-BUSzWgUA.js";
import { l as isRecord } from "./utils-D5DtWkEu.js";
import { n as resolvePreferredOpenClawTmpDir } from "./tmp-openclaw-dir-eyAoWbVe.js";
import { t as isTruthyEnvValue } from "./env-BiSxzotM.js";
import { o as sanitizeHostExecEnv } from "./host-env-security-C2piJKe2.js";
import { a as shouldLogVerbose } from "./globals-De6QTwLG.js";
import { p as scopedHeartbeatWakeOptions } from "./session-key-Bh1lMwK5.js";
import { t as applyPluginTextReplacements } from "./plugin-text-transforms-BQzFygd9.js";
import { a as prependBootstrapPromptWarning } from "./bootstrap-budget-BfULAZ3v.js";
import "./pi-embedded-helpers-6UMMUO8y.js";
import { t as classifyFailoverReason } from "./errors-CJULmF31.js";
import { s as resolveFailoverStatus, t as FailoverError } from "./failover-error-CqpA2cGv.js";
import { i as emitAgentEvent } from "./agent-events-BLJ1mmc3.js";
import { n as requestHeartbeatNow } from "./heartbeat-wake-a3GAt85y.js";
import { i as enqueueSystemEvent } from "./system-events-Dq_M0n12.js";
import "./skills-Cwx5TftI.js";
import { n as applySkillEnvOverridesFromSnapshot } from "./env-overrides-CqQvDQ3v.js";
import { t as getProcessSupervisor } from "./supervisor-DxNFYOdH.js";
import { a as prepareCliPromptImagePayload, c as resolveSessionIdToSend, d as buildCliSupervisorScopeKey, f as resolveCliNoOutputTimeoutMs, g as cliBackendLog, l as resolveSystemPromptUsage, o as resolveCliRunQueueKey, r as enqueueCliRun, s as resolvePromptInput, t as buildCliArgs, u as writeCliSystemPromptFile } from "./helpers-BSxabu9q.js";
import path from "node:path";
import fs from "node:fs/promises";
//#region src/agents/cli-output.ts
function isClaudeCliProvider(providerId) {
	return normalizeLowercaseStringOrEmpty(providerId) === "claude-cli";
}
function usesClaudeStreamJsonDialect(params) {
	return params.backend.jsonlDialect === "claude-stream-json" || isClaudeCliProvider(params.providerId);
}
function extractJsonObjectCandidates(raw) {
	const candidates = [];
	let depth = 0;
	let start = -1;
	let inString = false;
	let escaped = false;
	for (let index = 0; index < raw.length; index += 1) {
		const char = raw[index] ?? "";
		if (escaped) {
			escaped = false;
			continue;
		}
		if (char === "\\") {
			if (inString) escaped = true;
			continue;
		}
		if (char === "\"") {
			inString = !inString;
			continue;
		}
		if (inString) continue;
		if (char === "{") {
			if (depth === 0) start = index;
			depth += 1;
			continue;
		}
		if (char === "}" && depth > 0) {
			depth -= 1;
			if (depth === 0 && start >= 0) {
				candidates.push(raw.slice(start, index + 1));
				start = -1;
			}
		}
	}
	return candidates;
}
function parseJsonRecordCandidates(raw) {
	const parsedRecords = [];
	const trimmed = raw.trim();
	if (!trimmed) return parsedRecords;
	try {
		const parsed = JSON.parse(trimmed);
		if (isRecord(parsed)) {
			parsedRecords.push(parsed);
			return parsedRecords;
		}
	} catch {}
	for (const candidate of extractJsonObjectCandidates(trimmed)) try {
		const parsed = JSON.parse(candidate);
		if (isRecord(parsed)) parsedRecords.push(parsed);
	} catch {}
	return parsedRecords;
}
function readNestedErrorMessage(parsed) {
	if (isRecord(parsed.error)) {
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
		if (!isRecord(nested)) return;
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
	if (isRecord(parsed.usage)) {
		const usage = toCliUsage(parsed.usage);
		if (usage) return usage;
	}
	if (isRecord(parsed.stats)) return toCliUsage(parsed.stats);
}
function collectCliText(value) {
	if (!value) return "";
	if (typeof value === "string") return value;
	if (Array.isArray(value)) return value.map((entry) => collectCliText(entry)).join("");
	if (!isRecord(value)) return "";
	if (typeof value.response === "string") return value.response;
	if (typeof value.text === "string") return value.text;
	if (typeof value.result === "string") return value.result;
	if (typeof value.content === "string") return value.content;
	if (Array.isArray(value.content)) return value.content.map((entry) => collectCliText(entry)).join("");
	if (isRecord(value.message)) return collectCliText(value.message);
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
	if (params.parsed.type !== "stream_event" || !isRecord(params.parsed.event)) return null;
	const event = params.parsed.event;
	if (event.type !== "content_block_delta" || !isRecord(event.delta)) return null;
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
		if (isRecord(parsed.usage)) usage = toCliUsage(parsed.usage) ?? usage;
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
		const item = isRecord(parsed.item) ? parsed.item : null;
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
				}
				const noOutputTimeoutMs = resolveCliNoOutputTimeoutMs({
					backend,
					timeoutMs: params.timeoutMs,
					useResume
				});
				const streamingParser = backend.output === "jsonl" ? createCliJsonlStreamingParser({
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
				const replyBackendHandle = params.replyOperation ? {
					kind: "cli",
					cancel: () => {
						managedRun.cancel("manual-cancel");
					},
					isStreaming: () => false
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
		await claudeSkillsPlugin.cleanup();
		if (systemPromptFile) await systemPromptFile.cleanup();
		if (cleanupImages) await cleanupImages();
	}
}
//#endregion
export { executePreparedCliRun };
