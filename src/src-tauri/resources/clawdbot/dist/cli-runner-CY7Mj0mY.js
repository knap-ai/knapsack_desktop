import { t as createSubsystemLogger } from "./subsystem-CJEvHE2o.js";
import { t as isTruthyEnvValue } from "./env-CjUKd1aw.js";
import { u as isRecord } from "./utils-CE3P21nG.js";
import { r as normalizeProviderId } from "./provider-id-CTiEzT1T.js";
import { g as resolveDefaultModelForAgent } from "./model-selection-8a6zD_aX.js";
import { p as scopedHeartbeatWakeOptions } from "./session-key-D7XpmyVq.js";
import { a as shouldLogVerbose } from "./globals-BJZkpw-q.js";
import { y as resolveSessionAgentIds } from "./agent-scope-CYXg_wTS.js";
import { $t as resolveOwnerDisplaySetting } from "./io-DhtVmzAJ.js";
import { o as sanitizeHostExecEnv } from "./host-env-security-B2w9UVHS.js";
import { r as getActivePluginRegistry } from "./runtime-DZz1f0_h.js";
import { t as applyMergePatch } from "./merge-patch-B__RZvcw.js";
import { a as loadBundledPluginPublicSurfaceModuleSync } from "./facade-runtime-D_0VC8Qr.js";
import { c as loadEnabledBundleMcpConfig, o as extractMcpServerMap } from "./loader-BkOjign1.js";
import { i as resolveHeartbeatPrompt } from "./heartbeat-CguHGkad.js";
import { Kr as makeBootstrapWarn, Wr as resolveOpenClawDocsPath, a as buildSystemPromptReport, c as analyzeBootstrapBudget, d as buildBootstrapTruncationReportMeta, f as prependBootstrapPromptWarning, h as resolveRunWorkspaceDir, l as buildBootstrapInjectionStats, m as redactRunIdentifier, n as detectImageReferences, o as buildSystemPromptParams, qr as resolveBootstrapContextForRun, r as loadImageFromRef, u as buildBootstrapPromptWarning, y as buildAgentSystemPrompt } from "./pi-embedded-BYdcxQ5A.js";
import { n as buildTtsSystemPromptHint } from "./speech-runtime-DncpdrLW.js";
import "./tts-DmlPQvyr.js";
import { D as isFailoverErrorMessage, X as resolveBootstrapPromptTruncationWarningMode, Y as resolveBootstrapMaxChars, Z as resolveBootstrapTotalMaxChars, h as classifyFailoverReason } from "./pi-embedded-helpers-CGU2Pfj9.js";
import { n as sanitizeImageBlocks } from "./tool-images-DNVtj23_.js";
import "./mime-C9472kP8.js";
import { S as requestHeartbeatNow, _ as getProcessSupervisor, v as detectRuntimeShell } from "./model-runtime-D4KJqIwp.js";
import { r as enqueueSystemEvent } from "./system-events-DOxYwk9w.js";
import { s as resolveFailoverStatus, t as FailoverError } from "./failover-error-qR7EPsdr.js";
import { t as KeyedAsyncQueue } from "./keyed-async-queue-BkMLZAw9.js";
import { a as buildModelAliasLines } from "./anthropic-vertex-stream-DeiIH5Mp.js";
import { n as CLI_RESUME_WATCHDOG_DEFAULTS, r as CLI_WATCHDOG_MIN_TIMEOUT_MS, t as CLI_FRESH_WATCHDOG_DEFAULTS } from "./cli-watchdog-defaults-CUbfwsQr.js";
import path from "node:path";
import os from "node:os";
import fs from "node:fs/promises";
import crypto from "node:crypto";
//#region src/plugin-sdk/anthropic-cli.ts
function loadFacadeModule() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "anthropic",
		artifactBasename: "api.js"
	});
}
loadFacadeModule()["CLAUDE_CLI_BACKEND_ID"];
const isClaudeCliProvider = ((...args) => loadFacadeModule()["isClaudeCliProvider"](...args));
//#endregion
//#region src/agents/cli-output.ts
function toCliUsage(raw) {
	const pick = (key) => typeof raw[key] === "number" && raw[key] > 0 ? raw[key] : void 0;
	const input = pick("input_tokens") ?? pick("inputTokens");
	const output = pick("output_tokens") ?? pick("outputTokens");
	const cacheRead = pick("cache_read_input_tokens") ?? pick("cached_input_tokens") ?? pick("cacheRead");
	const cacheWrite = pick("cache_write_input_tokens") ?? pick("cacheWrite");
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
function collectCliText(value) {
	if (!value) return "";
	if (typeof value === "string") return value;
	if (Array.isArray(value)) return value.map((entry) => collectCliText(entry)).join("");
	if (!isRecord(value)) return "";
	if (typeof value.text === "string") return value.text;
	if (typeof value.content === "string") return value.content;
	if (Array.isArray(value.content)) return value.content.map((entry) => collectCliText(entry)).join("");
	if (isRecord(value.message)) return collectCliText(value.message);
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
	const trimmed = raw.trim();
	if (!trimmed) return null;
	let parsed;
	try {
		parsed = JSON.parse(trimmed);
	} catch {
		return null;
	}
	if (!isRecord(parsed)) return null;
	const sessionId = pickCliSessionId(parsed, backend);
	const usage = isRecord(parsed.usage) ? toCliUsage(parsed.usage) : void 0;
	return {
		text: (collectCliText(parsed.message) || collectCliText(parsed.content) || collectCliText(parsed.result) || collectCliText(parsed)).trim(),
		sessionId,
		usage
	};
}
function parseClaudeCliJsonlResult(params) {
	if (!isClaudeCliProvider(params.providerId)) return null;
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
function parseCliJsonl(raw, backend, providerId) {
	const lines = raw.split(/\r?\n/g).map((line) => line.trim()).filter(Boolean);
	if (lines.length === 0) return null;
	let sessionId;
	let usage;
	const texts = [];
	for (const line of lines) {
		let parsed;
		try {
			parsed = JSON.parse(line);
		} catch {
			continue;
		}
		if (!isRecord(parsed)) continue;
		if (!sessionId) sessionId = pickCliSessionId(parsed, backend);
		if (!sessionId && typeof parsed.thread_id === "string") sessionId = parsed.thread_id.trim();
		if (isRecord(parsed.usage)) usage = toCliUsage(parsed.usage) ?? usage;
		const claudeResult = parseClaudeCliJsonlResult({
			providerId,
			parsed,
			sessionId,
			usage
		});
		if (claudeResult) return claudeResult;
		const item = isRecord(parsed.item) ? parsed.item : null;
		if (item && typeof item.text === "string") {
			const type = typeof item.type === "string" ? item.type.toLowerCase() : "";
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
//#endregion
//#region src/agents/cli-runner/reliability.ts
function pickWatchdogProfile(backend, useResume) {
	const defaults = useResume ? CLI_RESUME_WATCHDOG_DEFAULTS : CLI_FRESH_WATCHDOG_DEFAULTS;
	const configured = useResume ? backend.reliability?.watchdog?.resume : backend.reliability?.watchdog?.fresh;
	const ratio = (() => {
		const value = configured?.noOutputTimeoutRatio;
		if (typeof value !== "number" || !Number.isFinite(value)) return defaults.noOutputTimeoutRatio;
		return Math.max(.05, Math.min(.95, value));
	})();
	const minMs = (() => {
		const value = configured?.minMs;
		if (typeof value !== "number" || !Number.isFinite(value)) return defaults.minMs;
		return Math.max(CLI_WATCHDOG_MIN_TIMEOUT_MS, Math.floor(value));
	})();
	const maxMs = (() => {
		const value = configured?.maxMs;
		if (typeof value !== "number" || !Number.isFinite(value)) return defaults.maxMs;
		return Math.max(CLI_WATCHDOG_MIN_TIMEOUT_MS, Math.floor(value));
	})();
	return {
		noOutputTimeoutMs: typeof configured?.noOutputTimeoutMs === "number" && Number.isFinite(configured.noOutputTimeoutMs) ? Math.max(CLI_WATCHDOG_MIN_TIMEOUT_MS, Math.floor(configured.noOutputTimeoutMs)) : void 0,
		noOutputTimeoutRatio: ratio,
		minMs: Math.min(minMs, maxMs),
		maxMs: Math.max(minMs, maxMs)
	};
}
function resolveCliNoOutputTimeoutMs(params) {
	const profile = pickWatchdogProfile(params.backend, params.useResume);
	const cap = Math.max(CLI_WATCHDOG_MIN_TIMEOUT_MS, params.timeoutMs - 1e3);
	if (profile.noOutputTimeoutMs !== void 0) return Math.min(profile.noOutputTimeoutMs, cap);
	const computed = Math.floor(params.timeoutMs * profile.noOutputTimeoutRatio);
	const bounded = Math.min(profile.maxMs, Math.max(profile.minMs, computed));
	return Math.min(bounded, cap);
}
function buildCliSupervisorScopeKey(params) {
	const commandToken = path.basename(params.backend.command ?? "").trim().toLowerCase();
	const backendToken = params.backendId.trim().toLowerCase();
	const sessionToken = params.cliSessionId?.trim();
	if (!sessionToken) return;
	return `cli:${backendToken}:${commandToken}:${sessionToken}`;
}
//#endregion
//#region src/agents/cli-runner/helpers.ts
const CLI_RUN_QUEUE = new KeyedAsyncQueue();
function enqueueCliRun(key, task) {
	return CLI_RUN_QUEUE.enqueue(key, task);
}
function buildSystemPrompt(params) {
	const defaultModelRef = resolveDefaultModelForAgent({
		cfg: params.config ?? {},
		agentId: params.agentId
	});
	const defaultModelLabel = `${defaultModelRef.provider}/${defaultModelRef.model}`;
	const { runtimeInfo, userTimezone, userTime, userTimeFormat } = buildSystemPromptParams({
		config: params.config,
		agentId: params.agentId,
		workspaceDir: params.workspaceDir,
		cwd: process.cwd(),
		runtime: {
			host: "openclaw",
			os: `${os.type()} ${os.release()}`,
			arch: os.arch(),
			node: process.version,
			model: params.modelDisplay,
			defaultModel: defaultModelLabel,
			shell: detectRuntimeShell()
		}
	});
	const ttsHint = params.config ? buildTtsSystemPromptHint(params.config) : void 0;
	const ownerDisplay = resolveOwnerDisplaySetting(params.config);
	return buildAgentSystemPrompt({
		workspaceDir: params.workspaceDir,
		defaultThinkLevel: params.defaultThinkLevel,
		extraSystemPrompt: params.extraSystemPrompt,
		ownerNumbers: params.ownerNumbers,
		ownerDisplay: ownerDisplay.ownerDisplay,
		ownerDisplaySecret: ownerDisplay.ownerDisplaySecret,
		reasoningTagHint: false,
		heartbeatPrompt: params.heartbeatPrompt,
		docsPath: params.docsPath,
		acpEnabled: params.config?.acp?.enabled !== false,
		runtimeInfo,
		toolNames: params.tools.map((tool) => tool.name),
		modelAliasLines: buildModelAliasLines(params.config),
		userTimezone,
		userTime,
		userTimeFormat,
		contextFiles: params.contextFiles,
		ttsHint,
		memoryCitationsMode: params.config?.memory?.citations
	});
}
function normalizeCliModel(modelId, backend) {
	const trimmed = modelId.trim();
	if (!trimmed) return trimmed;
	const direct = backend.modelAliases?.[trimmed];
	if (direct) return direct;
	const lower = trimmed.toLowerCase();
	const mapped = backend.modelAliases?.[lower];
	if (mapped) return mapped;
	return trimmed;
}
function resolveSystemPromptUsage(params) {
	const systemPrompt = params.systemPrompt?.trim();
	if (!systemPrompt) return null;
	const when = params.backend.systemPromptWhen ?? "first";
	if (when === "never") return null;
	if (when === "first" && !params.isNewSession) return null;
	if (!params.backend.systemPromptArg?.trim()) return null;
	return systemPrompt;
}
function resolveSessionIdToSend(params) {
	const mode = params.backend.sessionMode ?? "always";
	const existing = params.cliSessionId?.trim();
	if (mode === "none") return {
		sessionId: void 0,
		isNew: !existing
	};
	if (mode === "existing") return {
		sessionId: existing,
		isNew: !existing
	};
	if (existing) return {
		sessionId: existing,
		isNew: false
	};
	return {
		sessionId: crypto.randomUUID(),
		isNew: true
	};
}
function resolvePromptInput(params) {
	if ((params.backend.input ?? "arg") === "stdin") return { stdin: params.prompt };
	if (params.backend.maxPromptArgChars && params.prompt.length > params.backend.maxPromptArgChars) return { stdin: params.prompt };
	return { argsPrompt: params.prompt };
}
function resolveImageExtension(mimeType) {
	const normalized = mimeType.toLowerCase();
	if (normalized.includes("png")) return "png";
	if (normalized.includes("jpeg") || normalized.includes("jpg")) return "jpg";
	if (normalized.includes("gif")) return "gif";
	if (normalized.includes("webp")) return "webp";
	return "bin";
}
function appendImagePathsToPrompt(prompt, paths) {
	if (!paths.length) return prompt;
	const trimmed = prompt.trimEnd();
	return `${trimmed}${trimmed ? "\n\n" : ""}${paths.join("\n")}`;
}
async function loadPromptRefImages(params) {
	const refs = detectImageReferences(params.prompt);
	if (refs.length === 0) return [];
	const maxBytes = params.maxBytes ?? 6291456;
	const seen = /* @__PURE__ */ new Set();
	const images = [];
	for (const ref of refs) {
		const key = `${ref.type}:${ref.resolved}`;
		if (seen.has(key)) continue;
		seen.add(key);
		const image = await loadImageFromRef(ref, params.workspaceDir, {
			maxBytes,
			workspaceOnly: params.workspaceOnly,
			sandbox: params.sandbox
		});
		if (image) images.push(image);
	}
	const { images: sanitizedImages } = await sanitizeImageBlocks(images, "prompt:images", { maxBytes });
	return sanitizedImages;
}
async function writeCliImages(images) {
	const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "openclaw-cli-images-"));
	const paths = [];
	for (let i = 0; i < images.length; i += 1) {
		const image = images[i];
		const ext = resolveImageExtension(image.mimeType);
		const filePath = path.join(tempDir, `image-${i + 1}.${ext}`);
		const buffer = Buffer.from(image.data, "base64");
		await fs.writeFile(filePath, buffer, { mode: 384 });
		paths.push(filePath);
	}
	const cleanup = async () => {
		await fs.rm(tempDir, {
			recursive: true,
			force: true
		});
	};
	return {
		paths,
		cleanup
	};
}
function buildCliArgs(params) {
	const args = [...params.baseArgs];
	if (params.backend.modelArg && params.modelId) args.push(params.backend.modelArg, params.modelId);
	if (!params.useResume && params.systemPrompt && params.backend.systemPromptArg) args.push(params.backend.systemPromptArg, params.systemPrompt);
	if (!params.useResume && params.sessionId) {
		if (params.backend.sessionArgs && params.backend.sessionArgs.length > 0) for (const entry of params.backend.sessionArgs) args.push(entry.replaceAll("{sessionId}", params.sessionId));
		else if (params.backend.sessionArg) args.push(params.backend.sessionArg, params.sessionId);
	}
	if (params.imagePaths && params.imagePaths.length > 0) {
		const mode = params.backend.imageMode ?? "repeat";
		const imageArg = params.backend.imageArg;
		if (imageArg) if (mode === "list") args.push(imageArg, params.imagePaths.join(","));
		else for (const imagePath of params.imagePaths) args.push(imageArg, imagePath);
	}
	if (params.promptArg !== void 0) args.push(params.promptArg);
	return args;
}
//#endregion
//#region src/agents/cli-runner/log.ts
const cliBackendLog = createSubsystemLogger("agent/cli-backend");
//#endregion
//#region src/agents/cli-runner/execute.ts
const executeDeps = {
	getProcessSupervisor,
	enqueueSystemEvent,
	requestHeartbeatNow
};
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
async function executePreparedCliRun(context, cliSessionIdToUse) {
	const params = context.params;
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
	let imagePaths;
	let cleanupImages;
	let prompt = prependBootstrapPromptWarning(params.prompt, context.bootstrapPromptWarningLines, { preserveExactPrompt: context.heartbeatPrompt });
	const resolvedImages = params.images && params.images.length > 0 ? params.images : await loadPromptRefImages({
		prompt,
		workspaceDir: context.workspaceDir
	});
	if (resolvedImages.length > 0) {
		const imagePayload = await writeCliImages(resolvedImages);
		imagePaths = imagePayload.paths;
		cleanupImages = imagePayload.cleanup;
		if (!backend.imageArg) prompt = appendImagePathsToPrompt(prompt, imagePaths);
	}
	const { argsPrompt, stdin } = resolvePromptInput({
		backend,
		prompt
	});
	const stdinPayload = stdin ?? "";
	const baseArgs = useResume ? backend.resumeArgs ?? backend.args ?? [] : backend.args ?? [];
	const args = buildCliArgs({
		backend,
		baseArgs: useResume ? baseArgs.map((entry) => entry.replaceAll("{sessionId}", resolvedSessionId ?? "")) : baseArgs,
		modelId: context.normalizedModel,
		sessionId: resolvedSessionId,
		systemPrompt: systemPromptArg,
		imagePaths,
		promptArg: argsPrompt,
		useResume
	});
	const queueKey = backend.serialize ?? true ? context.backendResolved.id : `${context.backendResolved.id}:${params.runId}`;
	try {
		return await enqueueCliRun(queueKey, async () => {
			cliBackendLog.info(`cli exec: provider=${params.provider} model=${context.normalizedModel} promptChars=${params.prompt.length}`);
			const logOutputText = isTruthyEnvValue(process.env["OPENCLAW_CLI_BACKEND_LOG_OUTPUT"]) || isTruthyEnvValue(process.env["OPENCLAW_CLAUDE_CLI_LOG_OUTPUT"]);
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
			}
			const env = (() => {
				const next = sanitizeHostExecEnv({
					baseEnv: process.env,
					overrides: backend.env,
					blockPathOverrides: true
				});
				for (const key of backend.clearEnv ?? []) delete next[key];
				return next;
			})();
			const noOutputTimeoutMs = resolveCliNoOutputTimeoutMs({
				backend,
				timeoutMs: params.timeoutMs,
				useResume
			});
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
				input: stdinPayload
			});
			const result = await managedRun.wait();
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
				const err = stderr || stdout || "CLI failed.";
				const reason = classifyFailoverReason(err) ?? "unknown";
				const status = resolveFailoverStatus(reason);
				throw new FailoverError(err, {
					reason,
					provider: params.provider,
					model: context.modelId,
					status
				});
			}
			return parseCliOutput({
				raw: stdout,
				backend,
				providerId: context.backendResolved.id,
				outputMode: useResume ? backend.resumeOutput ?? backend.output : backend.output,
				fallbackSessionId: resolvedSessionId
			});
		});
	} finally {
		if (cleanupImages) await cleanupImages();
	}
}
//#endregion
//#region src/plugins/cli-backends.runtime.ts
function resolveRuntimeCliBackends() {
	return (getActivePluginRegistry()?.cliBackends ?? []).map((entry) => ({
		...entry.backend,
		pluginId: entry.pluginId
	}));
}
//#endregion
//#region src/agents/cli-backends.ts
function resolveFallbackBundleMcpCapability(provider) {
	return provider === "claude-cli";
}
function normalizeBackendKey(key) {
	return normalizeProviderId(key);
}
function pickBackendConfig(config, normalizedId) {
	const directKey = Object.keys(config).find((key) => key.trim().toLowerCase() === normalizedId);
	if (directKey) return config[directKey];
	for (const [key, entry] of Object.entries(config)) if (normalizeBackendKey(key) === normalizedId) return entry;
}
function resolveRegisteredBackend(provider) {
	const normalized = normalizeBackendKey(provider);
	return resolveRuntimeCliBackends().find((entry) => normalizeBackendKey(entry.id) === normalized);
}
function mergeBackendConfig(base, override) {
	if (!override) return { ...base };
	const baseFresh = base.reliability?.watchdog?.fresh ?? {};
	const baseResume = base.reliability?.watchdog?.resume ?? {};
	const overrideFresh = override.reliability?.watchdog?.fresh ?? {};
	const overrideResume = override.reliability?.watchdog?.resume ?? {};
	return {
		...base,
		...override,
		args: override.args ?? base.args,
		env: {
			...base.env,
			...override.env
		},
		modelAliases: {
			...base.modelAliases,
			...override.modelAliases
		},
		clearEnv: Array.from(new Set([...base.clearEnv ?? [], ...override.clearEnv ?? []])),
		sessionIdFields: override.sessionIdFields ?? base.sessionIdFields,
		sessionArgs: override.sessionArgs ?? base.sessionArgs,
		resumeArgs: override.resumeArgs ?? base.resumeArgs,
		reliability: {
			...base.reliability,
			...override.reliability,
			watchdog: {
				...base.reliability?.watchdog,
				...override.reliability?.watchdog,
				fresh: {
					...baseFresh,
					...overrideFresh
				},
				resume: {
					...baseResume,
					...overrideResume
				}
			}
		}
	};
}
function resolveCliBackendConfig(provider, cfg) {
	const normalized = normalizeBackendKey(provider);
	const override = pickBackendConfig(cfg?.agents?.defaults?.cliBackends ?? {}, normalized);
	const registered = resolveRegisteredBackend(normalized);
	if (registered) {
		const merged = mergeBackendConfig(registered.config, override);
		const config = registered.normalizeConfig ? registered.normalizeConfig(merged) : merged;
		const command = config.command?.trim();
		if (!command) return null;
		return {
			id: normalized,
			config: {
				...config,
				command
			},
			bundleMcp: registered.bundleMcp === true,
			pluginId: registered.pluginId
		};
	}
	if (!override) return null;
	const command = override.command?.trim();
	if (!command) return null;
	return {
		id: normalized,
		config: {
			...override,
			command
		},
		bundleMcp: resolveFallbackBundleMcpCapability(normalized)
	};
}
//#endregion
//#region src/agents/cli-session.ts
const CLAUDE_CLI_BACKEND_ID = "claude-cli";
function trimOptional(value) {
	const trimmed = value?.trim();
	return trimmed ? trimmed : void 0;
}
function hashCliSessionText(value) {
	const trimmed = trimOptional(value);
	if (!trimmed) return;
	return crypto.createHash("sha256").update(trimmed).digest("hex");
}
function getCliSessionBinding(entry, provider) {
	if (!entry) return;
	const normalized = normalizeProviderId(provider);
	const fromBindings = entry.cliSessionBindings?.[normalized];
	const bindingSessionId = trimOptional(fromBindings?.sessionId);
	if (bindingSessionId) return {
		sessionId: bindingSessionId,
		authProfileId: trimOptional(fromBindings?.authProfileId),
		extraSystemPromptHash: trimOptional(fromBindings?.extraSystemPromptHash),
		mcpConfigHash: trimOptional(fromBindings?.mcpConfigHash)
	};
	const fromMap = entry.cliSessionIds?.[normalized];
	if (fromMap?.trim()) return { sessionId: fromMap.trim() };
	if (normalized === CLAUDE_CLI_BACKEND_ID) {
		const legacy = entry.claudeCliSessionId?.trim();
		if (legacy) return { sessionId: legacy };
	}
}
function getCliSessionId(entry, provider) {
	return getCliSessionBinding(entry, provider)?.sessionId;
}
function setCliSessionId(entry, provider, sessionId) {
	setCliSessionBinding(entry, provider, { sessionId });
}
function setCliSessionBinding(entry, provider, binding) {
	const normalized = normalizeProviderId(provider);
	const trimmed = binding.sessionId.trim();
	if (!trimmed) return;
	entry.cliSessionBindings = {
		...entry.cliSessionBindings,
		[normalized]: {
			sessionId: trimmed,
			...trimOptional(binding.authProfileId) ? { authProfileId: trimOptional(binding.authProfileId) } : {},
			...trimOptional(binding.extraSystemPromptHash) ? { extraSystemPromptHash: trimOptional(binding.extraSystemPromptHash) } : {},
			...trimOptional(binding.mcpConfigHash) ? { mcpConfigHash: trimOptional(binding.mcpConfigHash) } : {}
		}
	};
	entry.cliSessionIds = {
		...entry.cliSessionIds,
		[normalized]: trimmed
	};
	if (normalized === CLAUDE_CLI_BACKEND_ID) entry.claudeCliSessionId = trimmed;
}
function clearCliSession(entry, provider) {
	const normalized = normalizeProviderId(provider);
	if (entry.cliSessionBindings?.[normalized] !== void 0) {
		const next = { ...entry.cliSessionBindings };
		delete next[normalized];
		entry.cliSessionBindings = Object.keys(next).length > 0 ? next : void 0;
	}
	if (entry.cliSessionIds?.[normalized] !== void 0) {
		const next = { ...entry.cliSessionIds };
		delete next[normalized];
		entry.cliSessionIds = Object.keys(next).length > 0 ? next : void 0;
	}
	if (normalized === CLAUDE_CLI_BACKEND_ID) delete entry.claudeCliSessionId;
}
function resolveCliSessionReuse(params) {
	const binding = params.binding;
	const sessionId = trimOptional(binding?.sessionId);
	if (!sessionId) return {};
	const currentAuthProfileId = trimOptional(params.authProfileId);
	const currentExtraSystemPromptHash = trimOptional(params.extraSystemPromptHash);
	const currentMcpConfigHash = trimOptional(params.mcpConfigHash);
	if (trimOptional(binding?.authProfileId) !== currentAuthProfileId) return { invalidatedReason: "auth-profile" };
	if (trimOptional(binding?.extraSystemPromptHash) !== currentExtraSystemPromptHash) return { invalidatedReason: "system-prompt" };
	if (trimOptional(binding?.mcpConfigHash) !== currentMcpConfigHash) return { invalidatedReason: "mcp" };
	return { sessionId };
}
//#endregion
//#region src/agents/cli-runner/bundle-mcp.ts
async function readExternalMcpConfig(configPath) {
	try {
		return { mcpServers: extractMcpServerMap(JSON.parse(await fs.readFile(configPath, "utf-8"))) };
	} catch {
		return { mcpServers: {} };
	}
}
function findMcpConfigPath(args) {
	if (!args?.length) return;
	for (let i = 0; i < args.length; i += 1) {
		const arg = args[i] ?? "";
		if (arg === "--mcp-config") {
			const next = args[i + 1];
			return typeof next === "string" && next.trim() ? next.trim() : void 0;
		}
		if (arg.startsWith("--mcp-config=")) return arg.slice(13).trim() || void 0;
	}
}
function injectMcpConfigArgs(args, mcpConfigPath) {
	const next = [];
	for (let i = 0; i < (args?.length ?? 0); i += 1) {
		const arg = args?.[i] ?? "";
		if (arg === "--strict-mcp-config") continue;
		if (arg === "--mcp-config") {
			i += 1;
			continue;
		}
		if (arg.startsWith("--mcp-config=")) continue;
		next.push(arg);
	}
	next.push("--strict-mcp-config", "--mcp-config", mcpConfigPath);
	return next;
}
async function prepareCliBundleMcpConfig(params) {
	if (!params.enabled) return { backend: params.backend };
	const existingMcpConfigPath = findMcpConfigPath(params.backend.resumeArgs) ?? findMcpConfigPath(params.backend.args);
	let mergedConfig = { mcpServers: {} };
	if (existingMcpConfigPath) {
		const resolvedExistingPath = path.isAbsolute(existingMcpConfigPath) ? existingMcpConfigPath : path.resolve(params.workspaceDir, existingMcpConfigPath);
		mergedConfig = applyMergePatch(mergedConfig, await readExternalMcpConfig(resolvedExistingPath));
	}
	const bundleConfig = loadEnabledBundleMcpConfig({
		workspaceDir: params.workspaceDir,
		cfg: params.config
	});
	for (const diagnostic of bundleConfig.diagnostics) params.warn?.(`bundle MCP skipped for ${diagnostic.pluginId}: ${diagnostic.message}`);
	mergedConfig = applyMergePatch(mergedConfig, bundleConfig.config);
	const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "openclaw-cli-mcp-"));
	const mcpConfigPath = path.join(tempDir, "mcp.json");
	const serializedConfig = `${JSON.stringify(mergedConfig, null, 2)}\n`;
	await fs.writeFile(mcpConfigPath, serializedConfig, "utf-8");
	return {
		backend: {
			...params.backend,
			args: injectMcpConfigArgs(params.backend.args, mcpConfigPath),
			resumeArgs: injectMcpConfigArgs(params.backend.resumeArgs ?? params.backend.args ?? [], mcpConfigPath)
		},
		mcpConfigHash: crypto.createHash("sha256").update(serializedConfig).digest("hex"),
		cleanup: async () => {
			await fs.rm(tempDir, {
				recursive: true,
				force: true
			});
		}
	};
}
//#endregion
//#region src/agents/cli-runner/prepare.ts
const prepareDeps = {
	makeBootstrapWarn,
	resolveBootstrapContextForRun
};
async function prepareCliRunContext(params) {
	const started = Date.now();
	const workspaceResolution = resolveRunWorkspaceDir({
		workspaceDir: params.workspaceDir,
		sessionKey: params.sessionKey,
		agentId: params.agentId,
		config: params.config
	});
	const resolvedWorkspace = workspaceResolution.workspaceDir;
	const redactedSessionId = redactRunIdentifier(params.sessionId);
	const redactedSessionKey = redactRunIdentifier(params.sessionKey);
	const redactedWorkspace = redactRunIdentifier(resolvedWorkspace);
	if (workspaceResolution.usedFallback) cliBackendLog.warn(`[workspace-fallback] caller=runCliAgent reason=${workspaceResolution.fallbackReason} run=${params.runId} session=${redactedSessionId} sessionKey=${redactedSessionKey} agent=${workspaceResolution.agentId} workspace=${redactedWorkspace}`);
	const workspaceDir = resolvedWorkspace;
	const backendResolved = resolveCliBackendConfig(params.provider, params.config);
	if (!backendResolved) throw new Error(`Unknown CLI backend: ${params.provider}`);
	const preparedBackend = await prepareCliBundleMcpConfig({
		enabled: backendResolved.bundleMcp,
		backend: backendResolved.config,
		workspaceDir,
		config: params.config,
		warn: (message) => cliBackendLog.warn(message)
	});
	const extraSystemPrompt = params.extraSystemPrompt?.trim() ?? "";
	const extraSystemPromptHash = hashCliSessionText(extraSystemPrompt);
	const reusableCliSession = resolveCliSessionReuse({
		binding: params.cliSessionBinding ?? (params.cliSessionId ? { sessionId: params.cliSessionId } : void 0),
		authProfileId: params.authProfileId,
		extraSystemPromptHash,
		mcpConfigHash: preparedBackend.mcpConfigHash
	});
	if (reusableCliSession.invalidatedReason) cliBackendLog.info(`cli session reset: provider=${params.provider} reason=${reusableCliSession.invalidatedReason}`);
	const modelId = (params.model ?? "default").trim() || "default";
	const normalizedModel = normalizeCliModel(modelId, preparedBackend.backend);
	const modelDisplay = `${params.provider}/${modelId}`;
	const sessionLabel = params.sessionKey ?? params.sessionId;
	const { bootstrapFiles, contextFiles } = await prepareDeps.resolveBootstrapContextForRun({
		workspaceDir,
		config: params.config,
		sessionKey: params.sessionKey,
		sessionId: params.sessionId,
		warn: prepareDeps.makeBootstrapWarn({
			sessionLabel,
			warn: (message) => cliBackendLog.warn(message)
		})
	});
	const bootstrapMaxChars = resolveBootstrapMaxChars(params.config);
	const bootstrapTotalMaxChars = resolveBootstrapTotalMaxChars(params.config);
	const bootstrapAnalysis = analyzeBootstrapBudget({
		files: buildBootstrapInjectionStats({
			bootstrapFiles,
			injectedFiles: contextFiles
		}),
		bootstrapMaxChars,
		bootstrapTotalMaxChars
	});
	const bootstrapPromptWarningMode = resolveBootstrapPromptTruncationWarningMode(params.config);
	const bootstrapPromptWarning = buildBootstrapPromptWarning({
		analysis: bootstrapAnalysis,
		mode: bootstrapPromptWarningMode,
		seenSignatures: params.bootstrapPromptWarningSignaturesSeen,
		previousSignature: params.bootstrapPromptWarningSignature
	});
	const { defaultAgentId, sessionAgentId } = resolveSessionAgentIds({
		sessionKey: params.sessionKey,
		config: params.config,
		agentId: params.agentId
	});
	const heartbeatPrompt = sessionAgentId === defaultAgentId ? resolveHeartbeatPrompt(params.config?.agents?.defaults?.heartbeat?.prompt) : void 0;
	const docsPath = await resolveOpenClawDocsPath({
		workspaceDir,
		argv1: process.argv[1],
		cwd: process.cwd(),
		moduleUrl: import.meta.url
	});
	const systemPrompt = buildSystemPrompt({
		workspaceDir,
		config: params.config,
		defaultThinkLevel: params.thinkLevel,
		extraSystemPrompt,
		ownerNumbers: params.ownerNumbers,
		heartbeatPrompt,
		docsPath: docsPath ?? void 0,
		tools: [],
		contextFiles,
		modelDisplay,
		agentId: sessionAgentId
	});
	return {
		params,
		started,
		workspaceDir,
		backendResolved,
		preparedBackend,
		reusableCliSession,
		modelId,
		normalizedModel,
		systemPrompt,
		systemPromptReport: buildSystemPromptReport({
			source: "run",
			generatedAt: Date.now(),
			sessionId: params.sessionId,
			sessionKey: params.sessionKey,
			provider: params.provider,
			model: modelId,
			workspaceDir,
			bootstrapMaxChars,
			bootstrapTotalMaxChars,
			bootstrapTruncation: buildBootstrapTruncationReportMeta({
				analysis: bootstrapAnalysis,
				warningMode: bootstrapPromptWarningMode,
				warning: bootstrapPromptWarning
			}),
			sandbox: {
				mode: "off",
				sandboxed: false
			},
			systemPrompt,
			bootstrapFiles,
			injectedFiles: contextFiles,
			skillsPrompt: "",
			tools: []
		}),
		bootstrapPromptWarningLines: bootstrapPromptWarning.lines,
		heartbeatPrompt,
		extraSystemPromptHash
	};
}
//#endregion
//#region src/agents/cli-runner.ts
async function runCliAgent(params) {
	const context = await prepareCliRunContext(params);
	const buildCliRunResult = (resultParams) => {
		const text = resultParams.output.text?.trim();
		return {
			payloads: text ? [{ text }] : void 0,
			meta: {
				durationMs: Date.now() - context.started,
				systemPromptReport: context.systemPromptReport,
				agentMeta: {
					sessionId: resultParams.effectiveCliSessionId ?? params.sessionId ?? "",
					provider: params.provider,
					model: context.modelId,
					usage: resultParams.output.usage,
					...resultParams.effectiveCliSessionId ? { cliSessionBinding: {
						sessionId: resultParams.effectiveCliSessionId,
						...params.authProfileId ? { authProfileId: params.authProfileId } : {},
						...context.extraSystemPromptHash ? { extraSystemPromptHash: context.extraSystemPromptHash } : {},
						...context.preparedBackend.mcpConfigHash ? { mcpConfigHash: context.preparedBackend.mcpConfigHash } : {}
					} } : {}
				}
			}
		};
	};
	try {
		try {
			const output = await executePreparedCliRun(context, context.reusableCliSession.sessionId);
			return buildCliRunResult({
				output,
				effectiveCliSessionId: output.sessionId ?? context.reusableCliSession.sessionId
			});
		} catch (err) {
			if (err instanceof FailoverError) {
				if (err.reason === "session_expired" && context.reusableCliSession.sessionId && params.sessionKey) {
					const output = await executePreparedCliRun(context, void 0);
					const effectiveCliSessionId = output.sessionId;
					return buildCliRunResult({
						output,
						effectiveCliSessionId
					});
				}
				throw err;
			}
			const message = err instanceof Error ? err.message : String(err);
			if (isFailoverErrorMessage(message)) {
				const reason = classifyFailoverReason(message) ?? "unknown";
				const status = resolveFailoverStatus(reason);
				throw new FailoverError(message, {
					reason,
					provider: params.provider,
					model: context.modelId,
					status
				});
			}
			throw err;
		}
	} finally {
		await context.preparedBackend.cleanup?.();
	}
}
//#endregion
export { setCliSessionBinding as a, getCliSessionId as i, clearCliSession as n, setCliSessionId as o, getCliSessionBinding as r, runCliAgent as t };
