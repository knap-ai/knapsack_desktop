import { a as normalizeLowercaseStringOrEmpty } from "./string-coerce-Bje8XVt9.js";
import { i as formatErrorMessage } from "./errors-CDFVCV9D.js";
import { c as isRecord } from "./utils-DvkbxKCZ.js";
import { t as createSubsystemLogger } from "./subsystem-rHhUC6qs.js";
import { y as resolveAgentContextLimits } from "./agent-scope-i10se9ty.js";
import { i as openBoundaryFileSync } from "./boundary-file-read-C8TEdk8a.js";
import { l as normalizePluginsConfigWithResolver, u as resolveEffectivePluginActivationState } from "./manifest-registry-CXpW6f0a.js";
import { n as loadPluginManifestRegistryForPluginRegistry } from "./plugin-registry-CZ8QXP5l.js";
import { t as applyMergePatch } from "./merge-patch-CGxsvYoX.js";
import { n as acquireSessionWriteLock } from "./session-write-lock-L2DXbmZV.js";
import { t as emitSessionTranscriptUpdate } from "./transcript-events-CI8Ym6av.js";
import { t as log$1 } from "./logger-8xw2ZKab.js";
import { t as loadEmbeddedPiMcpConfig } from "./embedded-pi-mcp-CWmA9F4Z.js";
import { r as applyPiCompactionSettingsFromConfig } from "./pi-settings-BIyj5b9L.js";
import { n as rewriteTranscriptEntriesInSessionManager } from "./transcript-rewrite-D1GDBpQp.js";
import fs from "node:fs";
import path from "node:path";
import { SessionManager, SettingsManager } from "@mariozechner/pi-coding-agent";
//#region src/agents/pi-project-settings-snapshot.ts
const log = createSubsystemLogger("embedded-pi-settings");
const DEFAULT_EMBEDDED_PI_PROJECT_SETTINGS_POLICY = "sanitize";
const SANITIZED_PROJECT_PI_KEYS = ["shellPath", "shellCommandPrefix"];
function sanitizePiSettingsSnapshot(settings) {
	const sanitized = { ...settings };
	for (const key of SANITIZED_PROJECT_PI_KEYS) delete sanitized[key];
	return sanitized;
}
function sanitizeProjectSettings(settings) {
	return sanitizePiSettingsSnapshot(settings);
}
function loadBundleSettingsFile(params) {
	const absolutePath = path.join(params.rootDir, params.relativePath);
	const opened = openBoundaryFileSync({
		absolutePath,
		rootPath: params.rootDir,
		boundaryLabel: "plugin root",
		rejectHardlinks: true
	});
	if (!opened.ok) {
		log.warn(`skipping unsafe bundle settings file: ${absolutePath}`);
		return null;
	}
	try {
		const raw = JSON.parse(fs.readFileSync(opened.fd, "utf-8"));
		if (!isRecord(raw)) {
			log.warn(`skipping bundle settings file with non-object JSON: ${absolutePath}`);
			return null;
		}
		return sanitizePiSettingsSnapshot(raw);
	} catch (error) {
		log.warn(`failed to parse bundle settings file ${absolutePath}: ${String(error)}`);
		return null;
	} finally {
		fs.closeSync(opened.fd);
	}
}
function buildRegistryPluginIdAliases(registry) {
	return Object.fromEntries(registry.plugins.flatMap((record) => [...(record.providers ?? []).filter((providerId) => providerId !== record.id).map((providerId) => [providerId, record.id]), ...(record.legacyPluginIds ?? []).map((legacyPluginId) => [legacyPluginId, record.id])]).toSorted(([left], [right]) => left.localeCompare(right)));
}
function createRegistryPluginIdNormalizer(registry) {
	const aliases = buildRegistryPluginIdAliases(registry);
	return (id) => {
		const trimmed = id.trim();
		return aliases[trimmed] ?? trimmed;
	};
}
function loadEnabledBundlePiSettingsSnapshot(params) {
	const workspaceDir = params.cwd.trim();
	if (!workspaceDir) return {};
	const registry = loadPluginManifestRegistryForPluginRegistry({
		workspaceDir,
		config: params.cfg,
		includeDisabled: true
	});
	if (registry.plugins.length === 0) return {};
	const normalizedPlugins = normalizePluginsConfigWithResolver(params.cfg?.plugins, createRegistryPluginIdNormalizer(registry));
	let snapshot = {};
	for (const record of registry.plugins) {
		const settingsFiles = record.settingsFiles ?? [];
		if (record.format !== "bundle" || settingsFiles.length === 0) continue;
		if (!resolveEffectivePluginActivationState({
			id: record.id,
			origin: record.origin,
			config: normalizedPlugins,
			rootConfig: params.cfg
		}).activated) continue;
		for (const relativePath of settingsFiles) {
			const bundleSettings = loadBundleSettingsFile({
				rootDir: record.rootDir,
				relativePath
			});
			if (!bundleSettings) continue;
			snapshot = applyMergePatch(snapshot, bundleSettings);
		}
	}
	const embeddedPiMcp = loadEmbeddedPiMcpConfig({
		workspaceDir,
		cfg: params.cfg
	});
	for (const diagnostic of embeddedPiMcp.diagnostics) log.warn(`bundle MCP skipped for ${diagnostic.pluginId}: ${diagnostic.message}`);
	if (Object.keys(embeddedPiMcp.mcpServers).length > 0) snapshot = applyMergePatch(snapshot, { mcpServers: embeddedPiMcp.mcpServers });
	return snapshot;
}
function resolveEmbeddedPiProjectSettingsPolicy(cfg) {
	const raw = cfg?.agents?.defaults?.embeddedPi?.projectSettingsPolicy;
	if (raw === "trusted" || raw === "sanitize" || raw === "ignore") return raw;
	return DEFAULT_EMBEDDED_PI_PROJECT_SETTINGS_POLICY;
}
function buildEmbeddedPiSettingsSnapshot(params) {
	const effectiveProjectSettings = params.policy === "ignore" ? {} : params.policy === "sanitize" ? sanitizeProjectSettings(params.projectSettings) : params.projectSettings;
	return applyMergePatch(applyMergePatch(params.globalSettings, sanitizePiSettingsSnapshot(params.pluginSettings ?? {})), effectiveProjectSettings);
}
//#endregion
//#region src/agents/pi-project-settings.ts
function createEmbeddedPiSettingsManager(params) {
	const fileSettingsManager = SettingsManager.create(params.cwd, params.agentDir);
	const policy = resolveEmbeddedPiProjectSettingsPolicy(params.cfg);
	const pluginSettings = loadEnabledBundlePiSettingsSnapshot({
		cwd: params.cwd,
		cfg: params.cfg
	});
	const hasPluginSettings = Object.keys(pluginSettings).length > 0;
	if (policy === "trusted" && !hasPluginSettings) return fileSettingsManager;
	const settings = buildEmbeddedPiSettingsSnapshot({
		globalSettings: fileSettingsManager.getGlobalSettings(),
		pluginSettings,
		projectSettings: fileSettingsManager.getProjectSettings(),
		policy
	});
	return SettingsManager.inMemory(settings);
}
function createPreparedEmbeddedPiSettingsManager(params) {
	const settingsManager = createEmbeddedPiSettingsManager(params);
	applyPiCompactionSettingsFromConfig({
		settingsManager,
		cfg: params.cfg,
		contextTokenBudget: params.contextTokenBudget
	});
	return settingsManager;
}
const IMAGE_CHAR_ESTIMATE = 8e3;
function isTextBlock(block) {
	return !!block && typeof block === "object" && block.type === "text" && typeof block.text === "string";
}
function isImageBlock(block) {
	return !!block && typeof block === "object" && block.type === "image";
}
function estimateUnknownChars(value) {
	if (typeof value === "string") return value.length;
	if (value === void 0) return 0;
	try {
		const serialized = JSON.stringify(value);
		return typeof serialized === "string" ? serialized.length : 0;
	} catch {
		return 256;
	}
}
function isToolResultMessage(msg) {
	const role = msg.role;
	const type = msg.type;
	return role === "toolResult" || role === "tool" || type === "toolResult";
}
function getToolResultContent(msg) {
	if (!isToolResultMessage(msg)) return [];
	const content = msg.content;
	if (typeof content === "string") return [{
		type: "text",
		text: content
	}];
	return Array.isArray(content) ? content : [];
}
function estimateContentBlockChars(content) {
	let chars = 0;
	for (const block of content) if (isTextBlock(block)) chars += block.text.length;
	else if (isImageBlock(block)) chars += IMAGE_CHAR_ESTIMATE;
	else chars += estimateUnknownChars(block);
	return chars;
}
function getToolResultText(msg) {
	const content = getToolResultContent(msg);
	const chunks = [];
	for (const block of content) if (isTextBlock(block)) chunks.push(block.text);
	return chunks.join("\n");
}
function estimateMessageChars(msg) {
	if (!msg || typeof msg !== "object") return 0;
	if (msg.role === "user") {
		const content = msg.content;
		if (typeof content === "string") return content.length;
		if (Array.isArray(content)) return estimateContentBlockChars(content);
		return 0;
	}
	if (msg.role === "assistant") {
		let chars = 0;
		const content = msg.content;
		if (Array.isArray(content)) for (const block of content) {
			if (!block || typeof block !== "object") continue;
			const typed = block;
			if (typed.type === "text" && typeof typed.text === "string") chars += typed.text.length;
			else if (typed.type === "thinking" && typeof typed.thinking === "string") chars += typed.thinking.length;
			else if (typed.type === "toolCall") try {
				chars += JSON.stringify(typed.arguments ?? {}).length;
			} catch {
				chars += 128;
			}
			else chars += estimateUnknownChars(block);
		}
		return chars;
	}
	if (isToolResultMessage(msg)) {
		let chars = estimateContentBlockChars(getToolResultContent(msg));
		const details = msg.details;
		chars += estimateUnknownChars(details);
		const weightedChars = Math.ceil(chars * (4 / 2));
		return Math.max(chars, weightedChars);
	}
	return 256;
}
function createMessageCharEstimateCache() {
	return /* @__PURE__ */ new WeakMap();
}
function estimateMessageCharsCached(msg, cache) {
	const hit = cache.get(msg);
	if (hit !== void 0) return hit;
	const estimated = estimateMessageChars(msg);
	cache.set(msg, estimated);
	return estimated;
}
function estimateContextChars(messages, cache) {
	return messages.reduce((sum, msg) => sum + estimateMessageCharsCached(msg, cache), 0);
}
function invalidateMessageCharsCacheEntry(cache, msg) {
	cache.delete(msg);
}
//#endregion
//#region src/agents/pi-embedded-runner/tool-result-context-guard.ts
const SINGLE_TOOL_RESULT_CONTEXT_SHARE = .5;
const PREEMPTIVE_OVERFLOW_RATIO = .9;
const CONTEXT_LIMIT_TRUNCATION_NOTICE = "more characters truncated";
const PREEMPTIVE_CONTEXT_OVERFLOW_MESSAGE = "Context overflow: estimated context size exceeds safe threshold during tool loop.";
const TOOL_RESULT_ESTIMATE_TO_TEXT_RATIO = 4 / 2;
function formatContextLimitTruncationNotice(truncatedChars) {
	return `[... ${Math.max(1, Math.floor(truncatedChars))} ${CONTEXT_LIMIT_TRUNCATION_NOTICE}]`;
}
function truncateTextToBudget(text, maxChars) {
	if (text.length <= maxChars) return text;
	if (maxChars <= 0) return formatContextLimitTruncationNotice(text.length);
	let bodyBudget = maxChars;
	for (let i = 0; i < 4; i += 1) {
		const estimatedSuffix = formatContextLimitTruncationNotice(Math.max(1, text.length - bodyBudget));
		bodyBudget = Math.max(0, maxChars - estimatedSuffix.length);
	}
	let cutPoint = bodyBudget;
	const newline = text.lastIndexOf("\n", cutPoint);
	if (newline > bodyBudget * .7) cutPoint = newline;
	const omittedChars = text.length - cutPoint;
	return text.slice(0, cutPoint) + formatContextLimitTruncationNotice(omittedChars);
}
function replaceToolResultText(msg, text) {
	const content = msg.content;
	const replacementContent = typeof content === "string" || content === void 0 ? text : [{
		type: "text",
		text
	}];
	const { details: _details, ...rest } = msg;
	return {
		...rest,
		content: replacementContent
	};
}
function estimateBudgetToTextBudget(maxChars) {
	return Math.max(0, Math.floor(maxChars / TOOL_RESULT_ESTIMATE_TO_TEXT_RATIO));
}
function truncateToolResultToChars(msg, maxChars, cache) {
	if (!isToolResultMessage(msg)) return msg;
	const estimatedChars = estimateMessageCharsCached(msg, cache);
	if (estimatedChars <= maxChars) return msg;
	const rawText = getToolResultText(msg);
	if (!rawText) return replaceToolResultText(msg, formatContextLimitTruncationNotice(Math.max(1, estimateBudgetToTextBudget(Math.max(estimatedChars - maxChars, 1)))));
	const textBudget = estimateBudgetToTextBudget(maxChars);
	if (textBudget <= 0) return replaceToolResultText(msg, formatContextLimitTruncationNotice(rawText.length));
	if (rawText.length <= textBudget) return replaceToolResultText(msg, rawText);
	return replaceToolResultText(msg, truncateTextToBudget(rawText, textBudget));
}
function cloneMessagesForGuard(messages) {
	return messages.map((msg) => ({ ...msg }));
}
function toolResultsNeedTruncation(params) {
	const { messages, maxSingleToolResultChars } = params;
	const estimateCache = createMessageCharEstimateCache();
	for (const message of messages) {
		if (!isToolResultMessage(message)) continue;
		if (estimateMessageCharsCached(message, estimateCache) > maxSingleToolResultChars) return true;
	}
	return false;
}
function exceedsPreemptiveOverflowThreshold(params) {
	const estimateCache = createMessageCharEstimateCache();
	return estimateContextChars(params.messages, estimateCache) > params.maxContextChars;
}
function applyMessageMutationInPlace(target, source, cache) {
	if (target === source) return;
	const targetRecord = target;
	const sourceRecord = source;
	for (const key of Object.keys(targetRecord)) if (!(key in sourceRecord)) delete targetRecord[key];
	Object.assign(targetRecord, sourceRecord);
	if (cache) invalidateMessageCharsCacheEntry(cache, target);
}
function enforceToolResultLimitInPlace(params) {
	const { messages, maxSingleToolResultChars } = params;
	const estimateCache = createMessageCharEstimateCache();
	for (const message of messages) {
		if (!isToolResultMessage(message)) continue;
		applyMessageMutationInPlace(message, truncateToolResultToChars(message, maxSingleToolResultChars, estimateCache), estimateCache);
	}
}
/**
* Per-iteration `afterTurn` + `assemble` wrapper for sessions where
* the context engine owns compaction. Lets the engine compact inside
* a long tool loop instead of only at end of attempt.
*/
function installContextEngineLoopHook(params) {
	const { contextEngine, sessionId, sessionKey, sessionFile, tokenBudget, modelId } = params;
	const mutableAgent = params.agent;
	const originalTransformContext = mutableAgent.transformContext;
	let lastSeenLength = null;
	let lastAssembledView = null;
	mutableAgent.transformContext = (async (messages, signal) => {
		const transformed = originalTransformContext ? await originalTransformContext.call(mutableAgent, messages, signal) : messages;
		const sourceMessages = Array.isArray(transformed) ? transformed : messages;
		const prePromptMessageCount = Math.max(0, Math.min(sourceMessages.length, lastSeenLength ?? params.getPrePromptMessageCount?.() ?? sourceMessages.length));
		lastSeenLength = prePromptMessageCount;
		if (!(sourceMessages.length > prePromptMessageCount)) return lastAssembledView ?? sourceMessages;
		try {
			if (typeof contextEngine.afterTurn === "function") await contextEngine.afterTurn({
				sessionId,
				sessionKey,
				sessionFile,
				messages: sourceMessages,
				prePromptMessageCount,
				tokenBudget,
				runtimeContext: params.getRuntimeContext?.({
					messages: sourceMessages,
					prePromptMessageCount
				})
			});
			else {
				const newMessages = sourceMessages.slice(prePromptMessageCount);
				if (newMessages.length > 0) if (typeof contextEngine.ingestBatch === "function") await contextEngine.ingestBatch({
					sessionId,
					sessionKey,
					messages: newMessages
				});
				else for (const message of newMessages) await contextEngine.ingest({
					sessionId,
					sessionKey,
					message
				});
			}
			lastSeenLength = sourceMessages.length;
			const assembled = await contextEngine.assemble({
				sessionId,
				sessionKey,
				messages: sourceMessages,
				tokenBudget,
				model: modelId
			});
			if (assembled && Array.isArray(assembled.messages) && assembled.messages !== sourceMessages) {
				lastAssembledView = assembled.messages;
				return assembled.messages;
			}
			lastAssembledView = null;
		} catch {}
		return sourceMessages;
	});
	return () => {
		mutableAgent.transformContext = originalTransformContext;
	};
}
function installToolResultContextGuard(params) {
	const contextWindowTokens = Math.max(1, Math.floor(params.contextWindowTokens));
	const maxContextChars = Math.max(1024, Math.floor(contextWindowTokens * 4 * PREEMPTIVE_OVERFLOW_RATIO));
	const maxSingleToolResultChars = Math.max(1024, Math.floor(contextWindowTokens * 2 * SINGLE_TOOL_RESULT_CONTEXT_SHARE));
	const mutableAgent = params.agent;
	const originalTransformContext = mutableAgent.transformContext;
	mutableAgent.transformContext = (async (messages, signal) => {
		const transformed = originalTransformContext ? await originalTransformContext.call(mutableAgent, messages, signal) : messages;
		const sourceMessages = Array.isArray(transformed) ? transformed : messages;
		const contextMessages = toolResultsNeedTruncation({
			messages: sourceMessages,
			maxSingleToolResultChars
		}) ? cloneMessagesForGuard(sourceMessages) : sourceMessages;
		if (contextMessages !== sourceMessages) enforceToolResultLimitInPlace({
			messages: contextMessages,
			maxSingleToolResultChars
		});
		if (exceedsPreemptiveOverflowThreshold({
			messages: contextMessages,
			maxContextChars
		})) throw new Error(PREEMPTIVE_CONTEXT_OVERFLOW_MESSAGE);
		return contextMessages;
	});
	return () => {
		mutableAgent.transformContext = originalTransformContext;
	};
}
//#endregion
//#region src/agents/pi-embedded-runner/tool-result-truncation.ts
/**
* Maximum share of the context window a single tool result should occupy.
* This is intentionally conservative – a single tool result should not
* consume more than 30% of the context window even without other messages.
*/
const MAX_TOOL_RESULT_CONTEXT_SHARE = .3;
/**
* Default hard cap for a single live tool result text block.
*
* Pi already truncates tool results aggressively when serializing old history
* for compaction summaries. For the live request path we still keep a bounded
* request-local ceiling so oversized tool output cannot dominate the next turn.
*/
const DEFAULT_MAX_LIVE_TOOL_RESULT_CHARS = 16e3;
/**
* Minimum characters to keep when truncating.
* We always keep at least the first portion so the model understands
* what was in the content.
*/
const MIN_KEEP_CHARS = 2e3;
const RECOVERY_MIN_KEEP_CHARS = 0;
const DEFAULT_SUFFIX = (truncatedChars) => formatContextLimitTruncationNotice(truncatedChars);
MIN_KEEP_CHARS + DEFAULT_SUFFIX(1).length;
function resolveSuffixFactory(suffix) {
	if (typeof suffix === "function") return suffix;
	if (typeof suffix === "string") return () => suffix;
	return DEFAULT_SUFFIX;
}
function resolveEffectiveMinKeepChars(params) {
	const suffixFloor = params.suffixFactory(1).length;
	return Math.max(0, Math.min(params.minKeepChars, Math.max(0, params.maxChars - suffixFloor)));
}
function appendBoundedTruncationSuffix(params) {
	const build = (keptText) => keptText + params.suffixFactory(Math.max(1, params.originalTextLength - keptText.length));
	let keptText = params.keptText;
	while (true) {
		const finalText = build(keptText);
		if (finalText.length <= params.maxChars) return finalText;
		if (keptText.length === 0) return finalText.slice(0, params.maxChars);
		const overflow = finalText.length - params.maxChars;
		const nextKeptText = keptText.slice(0, Math.max(0, keptText.length - overflow));
		keptText = nextKeptText.length < keptText.length ? nextKeptText : keptText.slice(0, -1);
	}
}
/**
* Marker inserted between head and tail when using head+tail truncation.
*/
const MIDDLE_OMISSION_MARKER = "\n\n⚠️ [... middle content omitted — showing head and tail ...]\n\n";
/**
* Detect whether text likely contains error/diagnostic content near the end,
* which should be preserved during truncation.
*/
function hasImportantTail(text) {
	const tail = normalizeLowercaseStringOrEmpty(text.slice(-2e3));
	return /\b(error|exception|failed|fatal|traceback|panic|stack trace|errno|exit code)\b/.test(tail) || /\}\s*$/.test(tail.trim()) || /\b(total|summary|result|complete|finished|done)\b/.test(tail);
}
/**
* Truncate a single text string to fit within maxChars.
*
* Uses a head+tail strategy when the tail contains important content
* (errors, results, JSON structure), otherwise preserves the beginning.
* This ensures error messages and summaries at the end of tool output
* aren't lost during truncation.
*/
function truncateToolResultText(text, maxChars, options = {}) {
	const suffixFactory = resolveSuffixFactory(options.suffix);
	const minKeepChars = resolveEffectiveMinKeepChars({
		maxChars,
		minKeepChars: options.minKeepChars ?? MIN_KEEP_CHARS,
		suffixFactory
	});
	if (text.length <= maxChars) return text;
	const defaultSuffix = suffixFactory(Math.max(1, text.length - maxChars));
	const budget = Math.max(minKeepChars, maxChars - defaultSuffix.length);
	if (hasImportantTail(text) && budget > minKeepChars * 2) {
		const tailBudget = Math.min(Math.floor(budget * .3), 4e3);
		const headBudget = budget - tailBudget - 63;
		if (headBudget > minKeepChars) {
			let headCut = headBudget;
			const headNewline = text.lastIndexOf("\n", headBudget);
			if (headNewline > headBudget * .8) headCut = headNewline;
			let tailStart = text.length - tailBudget;
			const tailNewline = text.indexOf("\n", tailStart);
			if (tailNewline !== -1 && tailNewline < tailStart + tailBudget * .2) tailStart = tailNewline + 1;
			return appendBoundedTruncationSuffix({
				keptText: text.slice(0, headCut) + MIDDLE_OMISSION_MARKER + text.slice(tailStart),
				originalTextLength: text.length,
				maxChars,
				suffixFactory
			});
		}
	}
	let cutPoint = budget;
	const lastNewline = text.lastIndexOf("\n", budget);
	if (lastNewline > budget * .8) cutPoint = lastNewline;
	return appendBoundedTruncationSuffix({
		keptText: text.slice(0, cutPoint),
		originalTextLength: text.length,
		maxChars,
		suffixFactory
	});
}
/**
* Calculate the maximum allowed characters for a single tool result
* based on the model's context window tokens.
*
* Uses a rough 4 chars ≈ 1 token heuristic (conservative for English text;
* actual ratio varies by tokenizer).
*/
function calculateMaxToolResultChars(contextWindowTokens) {
	return calculateMaxToolResultCharsWithCap(contextWindowTokens, DEFAULT_MAX_LIVE_TOOL_RESULT_CHARS);
}
function calculateMaxToolResultCharsWithCap(contextWindowTokens, hardCapChars) {
	const maxChars = Math.floor(contextWindowTokens * MAX_TOOL_RESULT_CONTEXT_SHARE) * 4;
	return Math.min(maxChars, Math.max(1, hardCapChars));
}
function resolveLiveToolResultMaxChars(params) {
	const configuredCap = resolveAgentContextLimits(params.cfg, params.agentId)?.toolResultMaxChars ?? 16e3;
	return calculateMaxToolResultCharsWithCap(params.contextWindowTokens, configuredCap);
}
/**
* Get the total character count of text content blocks in a tool result message.
*/
function getToolResultTextLength(msg) {
	if (!msg || msg.role !== "toolResult") return 0;
	const content = msg.content;
	if (!Array.isArray(content)) return 0;
	let totalLength = 0;
	for (const block of content) if (block && typeof block === "object" && block.type === "text") {
		const text = block.text;
		if (typeof text === "string") totalLength += text.length;
	}
	return totalLength;
}
/**
* Truncate a tool result message's text content blocks to fit within maxChars.
* Returns a new message (does not mutate the original).
*/
function truncateToolResultMessage(msg, maxChars, options = {}) {
	const suffixFactory = resolveSuffixFactory(options.suffix);
	const minKeepChars = resolveEffectiveMinKeepChars({
		maxChars,
		minKeepChars: options.minKeepChars ?? MIN_KEEP_CHARS,
		suffixFactory
	});
	const content = msg.content;
	if (!Array.isArray(content)) return msg;
	const totalTextChars = getToolResultTextLength(msg);
	if (totalTextChars <= maxChars) return msg;
	const newContent = content.map((block) => {
		if (!block || typeof block !== "object" || block.type !== "text") return block;
		const textBlock = block;
		if (typeof textBlock.text !== "string") return block;
		const blockShare = textBlock.text.length / totalTextChars;
		const defaultSuffix = suffixFactory(Math.max(1, textBlock.text.length - Math.floor(maxChars * blockShare)));
		const proportionalBudget = Math.floor(maxChars * blockShare);
		const blockBudget = Math.max(1, Math.min(maxChars, Math.max(minKeepChars + defaultSuffix.length, proportionalBudget)));
		return Object.assign({}, textBlock, { text: truncateToolResultText(textBlock.text, blockBudget, {
			suffix: suffixFactory,
			minKeepChars
		}) });
	});
	return {
		...msg,
		content: newContent
	};
}
function calculateRecoveryAggregateToolResultChars(contextWindowTokens, maxCharsOverride) {
	return Math.max(1, maxCharsOverride ?? calculateMaxToolResultChars(contextWindowTokens));
}
function buildAggregateToolResultReplacements(params) {
	const minKeepChars = params.minKeepChars ?? MIN_KEEP_CHARS;
	const minTruncatedTextChars = minKeepChars + DEFAULT_SUFFIX(1).length;
	const candidates = params.branch.map((entry, index) => ({
		entry,
		index
	})).filter((item) => item.entry.type === "message" && Boolean(item.entry.message) && item.entry.message.role === "toolResult").map((item) => ({
		index: item.index,
		entryId: item.entry.id,
		message: item.entry.message,
		textLength: getToolResultTextLength(item.entry.message)
	})).filter((item) => item.textLength > 0);
	if (candidates.length < 2) return [];
	const totalChars = candidates.reduce((sum, item) => sum + item.textLength, 0);
	if (totalChars <= params.aggregateBudgetChars) return [];
	let remainingReduction = totalChars - params.aggregateBudgetChars;
	const replacements = [];
	for (const candidate of candidates.toSorted((a, b) => {
		if (a.index !== b.index) return b.index - a.index;
		return b.textLength - a.textLength;
	})) {
		if (remainingReduction <= 0) break;
		const reducibleChars = Math.max(0, candidate.textLength - minTruncatedTextChars);
		if (reducibleChars <= 0) continue;
		const requestedReduction = Math.min(reducibleChars, remainingReduction);
		const targetChars = Math.max(minTruncatedTextChars, candidate.textLength - requestedReduction);
		const truncatedMessage = truncateToolResultMessage(candidate.message, targetChars, { minKeepChars });
		const newLength = getToolResultTextLength(truncatedMessage);
		const actualReduction = Math.max(0, candidate.textLength - newLength);
		if (actualReduction <= 0) continue;
		replacements.push({
			entryId: candidate.entryId,
			message: truncatedMessage
		});
		remainingReduction -= actualReduction;
	}
	return replacements;
}
function buildOversizedToolResultReplacements(params) {
	const minKeepChars = params.minKeepChars ?? MIN_KEEP_CHARS;
	const replacements = [];
	for (const entry of params.branch) {
		if (entry.type !== "message" || !entry.message) continue;
		const msg = entry.message;
		if (msg.role !== "toolResult") continue;
		if (getToolResultTextLength(msg) <= params.maxChars) continue;
		replacements.push({
			entryId: entry.id,
			message: truncateToolResultMessage(msg, params.maxChars, { minKeepChars })
		});
	}
	return replacements;
}
function calculateReplacementReduction(branch, replacements) {
	if (replacements.length === 0) return 0;
	const branchById = new Map(branch.map((entry) => [entry.id, entry]));
	let reduction = 0;
	for (const replacement of replacements) {
		const entry = branchById.get(replacement.entryId);
		if (!entry?.message) continue;
		reduction += Math.max(0, getToolResultTextLength(entry.message) - getToolResultTextLength(replacement.message));
	}
	return reduction;
}
function applyToolResultReplacementsToBranch(branch, replacements) {
	if (replacements.length === 0) return branch;
	const replacementsById = new Map(replacements.map((replacement) => [replacement.entryId, replacement]));
	return branch.map((entry) => {
		const replacement = replacementsById.get(entry.id);
		if (!replacement || entry.type !== "message") return entry;
		return {
			...entry,
			message: replacement.message
		};
	});
}
function buildToolResultReplacementPlan(params) {
	const minKeepChars = params.minKeepChars ?? MIN_KEEP_CHARS;
	const oversizedReplacements = buildOversizedToolResultReplacements({
		branch: params.branch,
		maxChars: params.maxChars,
		minKeepChars
	});
	const oversizedReducibleChars = calculateReplacementReduction(params.branch, oversizedReplacements);
	const oversizedTrimmedBranch = applyToolResultReplacementsToBranch(params.branch, oversizedReplacements);
	const aggregateReplacements = buildAggregateToolResultReplacements({
		branch: oversizedTrimmedBranch,
		aggregateBudgetChars: params.aggregateBudgetChars,
		minKeepChars
	});
	const aggregateReducibleChars = calculateReplacementReduction(oversizedTrimmedBranch, aggregateReplacements);
	return {
		replacements: [...oversizedReplacements, ...aggregateReplacements],
		oversizedReplacementCount: oversizedReplacements.length,
		aggregateReplacementCount: aggregateReplacements.length,
		oversizedReducibleChars,
		aggregateReducibleChars
	};
}
function estimateToolResultReductionPotential(params) {
	const { messages, contextWindowTokens } = params;
	const maxChars = Math.max(1, params.maxCharsOverride ?? calculateMaxToolResultChars(contextWindowTokens));
	const aggregateBudgetChars = calculateRecoveryAggregateToolResultChars(contextWindowTokens, maxChars);
	const branch = messages.map((message, index) => ({
		id: `message-${index}`,
		type: "message",
		message
	}));
	let toolResultCount = 0;
	let totalToolResultChars = 0;
	for (const msg of messages) {
		if (msg.role !== "toolResult") continue;
		const textLength = getToolResultTextLength(msg);
		if (textLength <= 0) continue;
		toolResultCount += 1;
		totalToolResultChars += textLength;
	}
	const plan = buildToolResultReplacementPlan({
		branch,
		maxChars,
		aggregateBudgetChars,
		minKeepChars: RECOVERY_MIN_KEEP_CHARS
	});
	const maxReducibleChars = plan.oversizedReducibleChars + plan.aggregateReducibleChars;
	return {
		maxChars,
		aggregateBudgetChars,
		toolResultCount,
		totalToolResultChars,
		oversizedCount: plan.oversizedReplacementCount,
		oversizedReducibleChars: plan.oversizedReducibleChars,
		aggregateReducibleChars: plan.aggregateReducibleChars,
		maxReducibleChars
	};
}
function truncateOversizedToolResultsInExistingSessionManager(params) {
	const { sessionManager, contextWindowTokens } = params;
	const maxChars = Math.max(1, params.maxCharsOverride ?? calculateMaxToolResultChars(contextWindowTokens));
	const aggregateBudgetChars = calculateRecoveryAggregateToolResultChars(contextWindowTokens, maxChars);
	const branch = sessionManager.getBranch();
	if (branch.length === 0) return {
		truncated: false,
		truncatedCount: 0,
		reason: "empty session"
	};
	const plan = buildToolResultReplacementPlan({
		branch,
		maxChars,
		aggregateBudgetChars,
		minKeepChars: RECOVERY_MIN_KEEP_CHARS
	});
	if (plan.replacements.length === 0) return {
		truncated: false,
		truncatedCount: 0,
		reason: "no oversized or aggregate tool results"
	};
	const rewriteResult = rewriteTranscriptEntriesInSessionManager({
		sessionManager,
		replacements: plan.replacements
	});
	if (rewriteResult.changed && params.sessionFile) emitSessionTranscriptUpdate(params.sessionFile);
	log$1.info(`[tool-result-truncation] Truncated ${rewriteResult.rewrittenEntries} tool result(s) in session (contextWindow=${contextWindowTokens} maxChars=${maxChars} aggregateBudgetChars=${aggregateBudgetChars} oversized=${plan.oversizedReplacementCount} aggregate=${plan.aggregateReplacementCount}) sessionKey=${params.sessionKey ?? params.sessionId ?? "unknown"}`);
	return {
		truncated: rewriteResult.changed,
		truncatedCount: rewriteResult.rewrittenEntries,
		reason: rewriteResult.reason
	};
}
function truncateOversizedToolResultsInSessionManager(params) {
	try {
		return truncateOversizedToolResultsInExistingSessionManager(params);
	} catch (err) {
		const errMsg = formatErrorMessage(err);
		log$1.warn(`[tool-result-truncation] Failed to truncate: ${errMsg}`);
		return {
			truncated: false,
			truncatedCount: 0,
			reason: errMsg
		};
	}
}
async function truncateOversizedToolResultsInSession(params) {
	const { sessionFile, contextWindowTokens } = params;
	let sessionLock;
	try {
		sessionLock = await acquireSessionWriteLock({ sessionFile });
		return truncateOversizedToolResultsInExistingSessionManager({
			sessionManager: SessionManager.open(sessionFile),
			contextWindowTokens,
			maxCharsOverride: params.maxCharsOverride,
			sessionFile,
			sessionId: params.sessionId,
			sessionKey: params.sessionKey
		});
	} catch (err) {
		const errMsg = formatErrorMessage(err);
		log$1.warn(`[tool-result-truncation] Failed to truncate: ${errMsg}`);
		return {
			truncated: false,
			truncatedCount: 0,
			reason: errMsg
		};
	} finally {
		await sessionLock?.release();
	}
}
function sessionLikelyHasOversizedToolResults(params) {
	const estimate = estimateToolResultReductionPotential(params);
	return estimate.oversizedCount > 0 || estimate.aggregateReducibleChars > 0;
}
//#endregion
export { truncateOversizedToolResultsInSession as a, formatContextLimitTruncationNotice as c, createPreparedEmbeddedPiSettingsManager as d, sessionLikelyHasOversizedToolResults as i, installContextEngineLoopHook as l, estimateToolResultReductionPotential as n, truncateOversizedToolResultsInSessionManager as o, resolveLiveToolResultMaxChars as r, truncateToolResultMessage as s, DEFAULT_MAX_LIVE_TOOL_RESULT_CHARS as t, installToolResultContextGuard as u };
