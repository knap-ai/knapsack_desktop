import { a as normalizeLowercaseStringOrEmpty, c as normalizeOptionalString, f as readStringValue, s as normalizeOptionalLowercaseString } from "./string-coerce-Bje8XVt9.js";
import { h as shortenHomeInString, y as truncateUtf16Safe } from "./utils-DvkbxKCZ.js";
import { f as freezeDiagnosticTraceContext } from "./diagnostic-events-B5Jlu4QM.js";
import { i as normalizeChannelId, t as getChannelPlugin } from "./registry-yTN80EXi.js";
import "./plugins-D-K4uCVI.js";
import { p as normalizeToolName } from "./tool-policy-CC72sL8W.js";
import { n as logProviderToolSchemaDiagnostics, r as normalizeProviderToolSchemas } from "./tool-result-middleware-D5J2jmZy.js";
import { r as splitMediaFromOutput } from "./parse-DbkqxPau.js";
import { r as resolveToolDisplay } from "./tool-display-DI3gntLU.js";
import { t as collectTextContentBlocks } from "./content-blocks-D1wobhfn.js";
import { a as normalizeTargetForProvider } from "./target-normalization-Ct82ML9w.js";
import { t as pluginRegistrationContractRegistry } from "./registry-0w2lmC7e.js";
import { t as runContextEngineMaintenance } from "./context-engine-maintenance-Bq7hIoub.js";
import { n as buildAfterTurnRuntimeContextFromUsage, t as buildAfterTurnRuntimeContext } from "./attempt.prompt-helpers-87NGkTSR.js";
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
	const direct = extractDirectErrorField(record);
	if (direct) return direct;
	const status = normalizeOptionalString(record.status) ?? "";
	if (!status || !isErrorLikeStatus(status)) return;
	return normalizeToolErrorText(status);
}
function extractDirectErrorField(value) {
	if (!value || typeof value !== "object") return;
	const record = value;
	return readErrorCandidate(record.error) ?? readErrorCandidate(record.message) ?? readErrorCandidate(record.reason);
}
function extractAggregatedErrorField(value) {
	if (!value || typeof value !== "object") return;
	return readErrorCandidate(value.aggregated);
}
function isHostDenialToolText(text) {
	const normalized = text.trim();
	if (normalized.includes("SYSTEM_RUN_DENIED") || normalized.includes("INVALID_REQUEST")) return true;
	return normalized.toLowerCase().includes("approval cannot safely bind");
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
function extractTextContentMediaArtifact(content) {
	const mediaUrls = [];
	let audioAsVoice = false;
	let hasImageContent = false;
	for (const item of content) {
		if (!item || typeof item !== "object") continue;
		const entry = item;
		if (entry.type === "image") {
			hasImageContent = true;
			continue;
		}
		if (entry.type !== "text" || typeof entry.text !== "string") continue;
		const parsed = splitMediaFromOutput(entry.text);
		if (parsed.audioAsVoice) audioAsVoice = true;
		if (parsed.mediaUrls?.length) mediaUrls.push(...parsed.mediaUrls);
	}
	return {
		mediaUrls,
		...audioAsVoice ? { audioAsVoice: true } : {},
		hasImageContent
	};
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
	const textMedia = extractTextContentMediaArtifact(content);
	if (textMedia.mediaUrls.length > 0) return {
		mediaUrls: textMedia.mediaUrls,
		...textMedia.audioAsVoice ? { audioAsVoice: true } : {}
	};
	if (textMedia.hasImageContent) {
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
	const fromDetails = extractDirectErrorField(record.details);
	if (fromDetails) return fromDetails;
	const fromDetailsAggregated = extractAggregatedErrorField(record.details);
	if (fromDetailsAggregated) return fromDetailsAggregated;
	const fromRoot = extractDirectErrorField(record);
	if (fromRoot) return fromRoot;
	const text = extractToolResultText(result);
	if (text) {
		try {
			const fromJson = extractErrorField(JSON.parse(text));
			if (fromJson) return fromJson;
		} catch {}
		if (isHostDenialToolText(text)) return normalizeToolErrorText(text);
	}
	const fromDetailsStatus = extractErrorField(record.details);
	if (fromDetailsStatus) return fromDetailsStatus;
	const fromRootStatus = extractErrorField(record);
	if (fromRootStatus) return fromRootStatus;
	return text ? normalizeToolErrorText(text) : void 0;
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
//#region src/agents/runtime-plan/tools.ts
function runtimePlanToolContext(params) {
	return {
		workspaceDir: params.workspaceDir,
		modelApi: params.modelApi ?? void 0,
		model: params.model
	};
}
function normalizeAgentRuntimeTools(params) {
	const planContext = runtimePlanToolContext(params);
	return params.runtimePlan?.tools.normalize(params.tools, planContext) ?? normalizeProviderToolSchemas({
		tools: params.tools,
		provider: params.provider,
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env ?? process.env,
		modelId: params.modelId,
		modelApi: params.modelApi,
		model: params.model
	});
}
function logAgentRuntimeToolDiagnostics(params) {
	const planContext = runtimePlanToolContext(params);
	if (params.runtimePlan) {
		params.runtimePlan.tools.logDiagnostics(params.tools, planContext);
		return;
	}
	logProviderToolSchemaDiagnostics({
		tools: params.tools,
		provider: params.provider,
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env ?? process.env,
		modelId: params.modelId,
		modelApi: params.modelApi,
		model: params.model
	});
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
export { isToolResultTimedOut as _, buildHarnessContextEngineRuntimeContextFromUsage as a, isMessagingToolSendAction as b, runHarnessContextEngineMaintenance as c, extractMessagingToolSend as d, extractToolErrorMessage as f, isToolResultError as g, filterToolResultMediaUrls as h, buildHarnessContextEngineRuntimeContext as i, logAgentRuntimeToolDiagnostics as l, extractToolResultText as m, assembleHarnessContextEngine as n, finalizeHarnessContextEngineTurn as o, extractToolResultMediaArtifact as p, bootstrapHarnessContextEngine as r, isActiveHarnessContextEngine as s, buildEmbeddedAttemptToolRunContext as t, normalizeAgentRuntimeTools as u, sanitizeToolResult as v, formatToolAggregate as x, isMessagingTool as y };
