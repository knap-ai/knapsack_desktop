import { i as formatErrorMessage } from "./errors-CDFVCV9D.js";
import { n as isAbortError } from "./unhandled-rejections-CjchfgLD.js";
import { t as createSubsystemLogger } from "./subsystem-rHhUC6qs.js";
import "./defaults-CRz26M83.js";
import { n as extractToolResultId, t as extractToolCallsFromAssistant } from "./tool-call-id-CYE4DX47.js";
import { a as isTimeoutError } from "./failover-error-DQkWPkYr.js";
import { a as stripToolResultDetails, n as repairToolUseResultPairing } from "./session-transcript-repair-D9T_omS-.js";
import { n as retryAsync } from "./retry-DH0sbtC7.js";
import { estimateTokens, generateSummary } from "@mariozechner/pi-coding-agent";
//#region src/agents/compaction.ts
const log = createSubsystemLogger("compaction");
const BASE_CHUNK_RATIO = .4;
const MIN_CHUNK_RATIO = .15;
const SAFETY_MARGIN = 1.2;
const DEFAULT_SUMMARY_FALLBACK = "No prior history.";
const DEFAULT_PARTS = 2;
const MERGE_SUMMARIES_INSTRUCTIONS = [
	"Merge these partial summaries into a single cohesive summary.",
	"",
	"MUST PRESERVE:",
	"- Active tasks and their current status (in-progress, blocked, pending)",
	"- Batch operation progress (e.g., '5/17 items completed')",
	"- The last thing the user requested and what was being done about it",
	"- Decisions made and their rationale",
	"- TODOs, open questions, and constraints",
	"- Any commitments or follow-ups promised",
	"",
	"PRIORITIZE recent context over older history. The agent needs to know",
	"what it was doing, not just what was discussed."
].join("\n");
const IDENTIFIER_PRESERVATION_INSTRUCTIONS = "Preserve all opaque identifiers exactly as written (no shortening or reconstruction), including UUIDs, hashes, IDs, hostnames, IPs, ports, URLs, and file names.";
const generateSummaryCompat = generateSummary;
function resolveIdentifierPreservationInstructions(instructions) {
	const policy = instructions?.identifierPolicy ?? "strict";
	if (policy === "off") return;
	if (policy === "custom") {
		const custom = instructions?.identifierInstructions?.trim();
		return custom && custom.length > 0 ? custom : IDENTIFIER_PRESERVATION_INSTRUCTIONS;
	}
	return IDENTIFIER_PRESERVATION_INSTRUCTIONS;
}
function buildCompactionSummarizationInstructions(customInstructions, instructions) {
	const custom = customInstructions?.trim();
	const identifierPreservation = resolveIdentifierPreservationInstructions(instructions);
	if (!identifierPreservation && !custom) return;
	if (!custom) return identifierPreservation;
	if (!identifierPreservation) return `Additional focus:\n${custom}`;
	return `${identifierPreservation}\n\nAdditional focus:\n${custom}`;
}
function estimateMessagesTokens(messages) {
	return stripToolResultDetails(messages).reduce((sum, message) => sum + estimateTokens(message), 0);
}
function estimateCompactionMessageTokens(message) {
	return estimateMessagesTokens([message]);
}
function normalizeParts(parts, messageCount) {
	if (!Number.isFinite(parts) || parts <= 1) return 1;
	return Math.min(Math.max(1, Math.floor(parts)), Math.max(1, messageCount));
}
function splitMessagesByTokenShare(messages, parts = DEFAULT_PARTS) {
	if (messages.length === 0) return [];
	const normalizedParts = normalizeParts(parts, messages.length);
	if (normalizedParts <= 1) return [messages];
	const targetTokens = estimateMessagesTokens(messages) / normalizedParts;
	const chunks = [];
	let current = [];
	let currentTokens = 0;
	let pendingToolCallIds = /* @__PURE__ */ new Set();
	let pendingChunkStartIndex = null;
	const splitCurrentAtPendingBoundary = () => {
		if (pendingChunkStartIndex === null || pendingChunkStartIndex <= 0 || chunks.length >= normalizedParts - 1) return false;
		chunks.push(current.slice(0, pendingChunkStartIndex));
		current = current.slice(pendingChunkStartIndex);
		currentTokens = current.reduce((sum, msg) => sum + estimateCompactionMessageTokens(msg), 0);
		pendingChunkStartIndex = 0;
		return true;
	};
	for (const message of messages) {
		const messageTokens = estimateCompactionMessageTokens(message);
		if (pendingToolCallIds.size === 0 && chunks.length < normalizedParts - 1 && current.length > 0 && currentTokens + messageTokens > targetTokens) {
			chunks.push(current);
			current = [];
			currentTokens = 0;
			pendingChunkStartIndex = null;
		}
		current.push(message);
		currentTokens += messageTokens;
		if (message.role === "assistant") {
			const toolCalls = extractToolCallsFromAssistant(message);
			const stopReason = message.stopReason;
			const keepsPending = stopReason !== "aborted" && stopReason !== "error" && toolCalls.length > 0;
			pendingToolCallIds = keepsPending ? new Set(toolCalls.map((t) => t.id)) : /* @__PURE__ */ new Set();
			pendingChunkStartIndex = keepsPending ? current.length - 1 : null;
		} else if (message.role === "toolResult" && pendingToolCallIds.size > 0) {
			const resultId = extractToolResultId(message);
			if (!resultId) {
				pendingToolCallIds = /* @__PURE__ */ new Set();
				pendingChunkStartIndex = null;
			} else pendingToolCallIds.delete(resultId);
			if (pendingToolCallIds.size === 0 && chunks.length < normalizedParts - 1 && currentTokens > targetTokens) {
				splitCurrentAtPendingBoundary();
				pendingChunkStartIndex = null;
			}
		}
	}
	if (pendingToolCallIds.size > 0 && currentTokens > targetTokens) splitCurrentAtPendingBoundary();
	if (current.length > 0) chunks.push(current);
	return chunks;
}
const SUMMARIZATION_OVERHEAD_TOKENS = 4096;
function chunkMessagesByMaxTokens(messages, maxTokens) {
	if (messages.length === 0) return [];
	const effectiveMax = Math.max(1, Math.floor(maxTokens / SAFETY_MARGIN));
	const chunks = [];
	let currentChunk = [];
	let currentTokens = 0;
	for (const message of messages) {
		const messageTokens = estimateCompactionMessageTokens(message);
		if (currentChunk.length > 0 && currentTokens + messageTokens > effectiveMax) {
			chunks.push(currentChunk);
			currentChunk = [];
			currentTokens = 0;
		}
		currentChunk.push(message);
		currentTokens += messageTokens;
		if (messageTokens > effectiveMax) {
			chunks.push(currentChunk);
			currentChunk = [];
			currentTokens = 0;
		}
	}
	if (currentChunk.length > 0) chunks.push(currentChunk);
	return chunks;
}
/**
* Compute adaptive chunk ratio based on average message size.
* When messages are large, we use smaller chunks to avoid exceeding model limits.
*/
function computeAdaptiveChunkRatio(messages, contextWindow) {
	if (messages.length === 0) return BASE_CHUNK_RATIO;
	const avgRatio = estimateMessagesTokens(messages) / messages.length * SAFETY_MARGIN / contextWindow;
	if (avgRatio > .1) {
		const reduction = Math.min(avgRatio * 2, BASE_CHUNK_RATIO - MIN_CHUNK_RATIO);
		return Math.max(MIN_CHUNK_RATIO, BASE_CHUNK_RATIO - reduction);
	}
	return BASE_CHUNK_RATIO;
}
/**
* Check if a single message is too large to summarize.
* If single message > 50% of context, it can't be summarized safely.
*/
function isOversizedForSummary(msg, contextWindow) {
	return estimateCompactionMessageTokens(msg) * SAFETY_MARGIN > contextWindow * .5;
}
async function summarizeChunks(params) {
	if (params.messages.length === 0) return params.previousSummary ?? DEFAULT_SUMMARY_FALLBACK;
	const chunks = chunkMessagesByMaxTokens(stripToolResultDetails(params.messages), params.maxChunkTokens);
	let summary = params.previousSummary;
	const effectiveInstructions = buildCompactionSummarizationInstructions(params.customInstructions, params.summarizationInstructions);
	for (const chunk of chunks) summary = await retryAsync(() => generateSummary$1(chunk, params.model, params.reserveTokens, params.apiKey, params.headers, params.signal, effectiveInstructions, summary), {
		attempts: 3,
		minDelayMs: 500,
		maxDelayMs: 5e3,
		jitter: .2,
		label: "compaction/generateSummary",
		shouldRetry: (err) => !isAbortError(err) && !isTimeoutError(err)
	});
	return summary ?? DEFAULT_SUMMARY_FALLBACK;
}
function generateSummary$1(currentMessages, model, reserveTokens, apiKey, headers, signal, customInstructions, previousSummary) {
	if (generateSummary.length >= 8) return generateSummaryCompat(currentMessages, model, reserveTokens, apiKey, headers, signal, customInstructions, previousSummary);
	return generateSummaryCompat(currentMessages, model, reserveTokens, apiKey, signal, customInstructions, previousSummary);
}
/**
* Summarize with progressive fallback for handling oversized messages.
* If full summarization fails, tries partial summarization excluding oversized messages.
*/
async function summarizeWithFallback(params) {
	const { messages, contextWindow } = params;
	if (messages.length === 0) return params.previousSummary ?? DEFAULT_SUMMARY_FALLBACK;
	try {
		return await summarizeChunks(params);
	} catch (fullError) {
		log.warn(`Full summarization failed: ${formatErrorMessage(fullError)}`);
	}
	const smallMessages = [];
	const oversizedNotes = [];
	for (const msg of messages) if (isOversizedForSummary(msg, contextWindow)) {
		const role = msg.role ?? "message";
		const tokens = estimateCompactionMessageTokens(msg);
		oversizedNotes.push(`[Large ${role} (~${Math.round(tokens / 1e3)}K tokens) omitted from summary]`);
	} else smallMessages.push(msg);
	if (smallMessages.length > 0 && smallMessages.length !== messages.length) try {
		return await summarizeChunks({
			...params,
			messages: smallMessages
		}) + (oversizedNotes.length > 0 ? `\n\n${oversizedNotes.join("\n")}` : "");
	} catch (partialError) {
		log.warn(`Partial summarization also failed: ${formatErrorMessage(partialError)}`);
	}
	return `Context contained ${messages.length} messages (${oversizedNotes.length} oversized). Summary unavailable due to size limits.`;
}
async function summarizeInStages(params) {
	const { messages } = params;
	if (messages.length === 0) return params.previousSummary ?? DEFAULT_SUMMARY_FALLBACK;
	const minMessagesForSplit = Math.max(2, params.minMessagesForSplit ?? 4);
	const parts = normalizeParts(params.parts ?? DEFAULT_PARTS, messages.length);
	const totalTokens = estimateMessagesTokens(messages);
	if (parts <= 1 || messages.length < minMessagesForSplit || totalTokens <= params.maxChunkTokens) return summarizeWithFallback(params);
	const splits = splitMessagesByTokenShare(messages, parts).filter((chunk) => chunk.length > 0);
	if (splits.length <= 1) return summarizeWithFallback(params);
	const partialSummaries = [];
	for (const chunk of splits) partialSummaries.push(await summarizeWithFallback({
		...params,
		messages: chunk,
		previousSummary: void 0
	}));
	if (partialSummaries.length === 1) return partialSummaries[0];
	const summaryMessages = partialSummaries.map((summary) => ({
		role: "user",
		content: summary,
		timestamp: Date.now()
	}));
	const custom = params.customInstructions?.trim();
	const mergeInstructions = custom ? `${MERGE_SUMMARIES_INSTRUCTIONS}\n\n${custom}` : MERGE_SUMMARIES_INSTRUCTIONS;
	return summarizeWithFallback({
		...params,
		messages: summaryMessages,
		customInstructions: mergeInstructions
	});
}
function pruneHistoryForContextShare(params) {
	const maxHistoryShare = params.maxHistoryShare ?? .5;
	const budgetTokens = Math.max(1, Math.floor(params.maxContextTokens * maxHistoryShare));
	let keptMessages = params.messages;
	const allDroppedMessages = [];
	let droppedChunks = 0;
	let droppedMessages = 0;
	let droppedTokens = 0;
	const parts = normalizeParts(params.parts ?? DEFAULT_PARTS, keptMessages.length);
	while (keptMessages.length > 0 && estimateMessagesTokens(keptMessages) > budgetTokens) {
		const chunks = splitMessagesByTokenShare(keptMessages, parts);
		if (chunks.length <= 1) break;
		const [dropped, ...rest] = chunks;
		const repairReport = repairToolUseResultPairing(rest.flat());
		const repairedKept = repairReport.messages;
		const orphanedCount = repairReport.droppedOrphanCount;
		droppedChunks += 1;
		droppedMessages += dropped.length + orphanedCount;
		droppedTokens += estimateMessagesTokens(dropped);
		allDroppedMessages.push(...dropped);
		keptMessages = repairedKept;
	}
	return {
		messages: keptMessages,
		droppedMessagesList: allDroppedMessages,
		droppedChunks,
		droppedMessages,
		droppedTokens,
		keptTokens: estimateMessagesTokens(keptMessages),
		budgetTokens
	};
}
function resolveContextWindowTokens(model) {
	const effective = model?.contextTokens ?? model?.contextWindow;
	return Math.max(1, Math.floor(effective ?? 2e5));
}
//#endregion
export { pruneHistoryForContextShare as a, estimateMessagesTokens as i, SUMMARIZATION_OVERHEAD_TOKENS as n, resolveContextWindowTokens as o, computeAdaptiveChunkRatio as r, summarizeInStages as s, SAFETY_MARGIN as t };
