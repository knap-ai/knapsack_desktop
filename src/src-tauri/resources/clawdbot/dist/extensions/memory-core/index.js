import { i as formatErrorMessage } from "../../errors-Jbvi20TW.js";
import { a as normalizeLowercaseStringOrEmpty } from "../../string-coerce-C1IzJjqi.js";
import { n as asNullableRecord } from "../../record-coerce-BpObaVhi.js";
import { o as parseAgentSessionKey } from "../../session-key-utils-BT0y7mVK.js";
import { p as resolveSessionAgentId } from "../../agent-scope-_6dFncNS.js";
import { n as parseNonNegativeByteSize } from "../../zod-schema-Q-_hlOBD.js";
import { F as resolveMemoryDeepDreamingConfig, I as resolveMemoryDreamingConfig, P as resolveMemoryCorePluginConfig$1, z as resolveMemoryDreamingWorkspaces } from "../../dreaming-K8xreO0H.js";
import { l as listMemoryCorpusSupplements } from "../../memory-state-I5DhT9-V.js";
import { t as loadCombinedSessionStoreForGateway } from "../../combined-store-gateway-qDHoxMjQ.js";
import { n as SILENT_REPLY_TOKEN } from "../../tokens-C_v_J0E7.js";
import "../../pi-settings-DnGbeiAj.js";
import { f as readNumberParam, g as readStringParam, i as asToolParamsRecord, l as jsonResult } from "../../common-B4WrK_Ib.js";
import { a as resolveEffectiveSessionToolsVisibility, r as createSessionVisibilityGuard, t as createAgentToAgentPolicy } from "../../session-visibility-BaId4y0g.js";
import { n as resolveCronStyleNow } from "../../current-time-GUMQXnlj.js";
import { t as resolveMemorySearchConfig } from "../../memory-search--kG5KoFE.js";
import "../../text-runtime-B1c54bxG.js";
import { t as definePluginEntry } from "../../plugin-entry-oWwpQhIC.js";
import "../../error-runtime-D8vVwCEz.js";
import { n as resolveTranscriptStemToSessionKeys, t as extractTranscriptStemFromSessionsMemoryHit } from "../../session-transcript-hit-Dwum7uxE.js";
import "../../memory-core-host-runtime-core-DbLpPUqA.js";
import { i as resolveMemoryHostEventLogPath } from "../../events-D_R_jQEz.js";
import "../../memory-core-host-events-6AXBMagt.js";
import "../../memory-core-host-status-BfwKpmnZ.js";
import { c as recordShortTermRecalls } from "../../short-term-promotion-CI1S22E7.js";
import "../../dreaming-shared-CkfGe3lS.js";
import { t as registerMemoryCli } from "../../cli-L6RFqFT9.js";
import { n as resolveShortTermPromotionDreamingConfig, t as registerShortTermPromotionDreaming } from "../../dreaming-DugQEpYx.js";
import { o as registerBuiltInMemoryEmbeddingProviders } from "../../manager-Cjkvk5xb.js";
import { t as memoryRuntime } from "../../runtime-provider-Ovf31eiI.js";
import path from "node:path";
import fs from "node:fs/promises";
import { Type } from "typebox";
//#region extensions/memory-core/src/dreaming-command.ts
function resolveMemoryCorePluginConfig(cfg) {
	return asNullableRecord(asNullableRecord(cfg.plugins?.entries?.["memory-core"])?.config) ?? {};
}
function updateDreamingEnabledInConfig(cfg, enabled) {
	const entries = { ...cfg.plugins?.entries };
	const existingEntry = asNullableRecord(entries["memory-core"]) ?? {};
	const existingConfig = asNullableRecord(existingEntry.config) ?? {};
	const existingSleep = asNullableRecord(existingConfig.dreaming) ?? {};
	entries["memory-core"] = {
		...existingEntry,
		config: {
			...existingConfig,
			dreaming: {
				...existingSleep,
				enabled
			}
		}
	};
	return {
		...cfg,
		plugins: {
			...cfg.plugins,
			entries
		}
	};
}
function formatEnabled(value) {
	return value ? "on" : "off";
}
function formatPhaseGuide() {
	return [
		"- implementation detail: each sweep runs light -> REM -> deep.",
		"- deep is the only stage that writes durable entries to MEMORY.md.",
		"- DREAMS.md is for human-readable dreaming summaries and diary entries."
	].join("\n");
}
function formatStatus(cfg) {
	const pluginConfig = resolveMemoryCorePluginConfig(cfg);
	const dreaming = resolveMemoryDreamingConfig({
		pluginConfig,
		cfg
	});
	const deep = resolveShortTermPromotionDreamingConfig({
		pluginConfig,
		cfg
	});
	const timezone = dreaming.timezone ? ` (${dreaming.timezone})` : "";
	return [
		"Dreaming status:",
		`- enabled: ${formatEnabled(dreaming.enabled)}${timezone}`,
		`- sweep cadence: ${dreaming.frequency}`,
		`- promotion policy: score>=${deep.minScore}, recalls>=${deep.minRecallCount}, uniqueQueries>=${deep.minUniqueQueries}`
	].join("\n");
}
function formatUsage(includeStatus) {
	return [
		"Usage: /dreaming status",
		"Usage: /dreaming on|off",
		"",
		includeStatus,
		"",
		"Phases:",
		formatPhaseGuide()
	].join("\n");
}
function requiresAdminToMutateDreaming(gatewayClientScopes) {
	return Array.isArray(gatewayClientScopes) && !gatewayClientScopes.includes("operator.admin");
}
function registerDreamingCommand(api) {
	api.registerCommand({
		name: "dreaming",
		description: "Enable or disable memory dreaming.",
		acceptsArgs: true,
		handler: async (ctx) => {
			const [firstToken = ""] = (ctx.args?.trim() ?? "").split(/\s+/).filter(Boolean).map((token) => normalizeLowercaseStringOrEmpty(token));
			const currentConfig = api.runtime.config.loadConfig();
			if (!firstToken || firstToken === "help" || firstToken === "options" || firstToken === "phases") return { text: formatUsage(formatStatus(currentConfig)) };
			if (firstToken === "status") return { text: formatStatus(currentConfig) };
			if (firstToken === "on" || firstToken === "off") {
				if (requiresAdminToMutateDreaming(ctx.gatewayClientScopes)) return { text: "⚠️ /dreaming on|off requires operator.admin for gateway clients." };
				const enabled = firstToken === "on";
				const nextConfig = updateDreamingEnabledInConfig(currentConfig, enabled);
				await api.runtime.config.writeConfigFile(nextConfig);
				return { text: [
					`Dreaming ${enabled ? "enabled" : "disabled"}.`,
					"",
					formatStatus(nextConfig)
				].join("\n") };
			}
			return { text: formatUsage(formatStatus(currentConfig)) };
		}
	});
}
//#endregion
//#region extensions/memory-core/src/flush-plan.ts
const DEFAULT_MEMORY_FLUSH_SOFT_TOKENS = 4e3;
const DEFAULT_MEMORY_FLUSH_FORCE_TRANSCRIPT_BYTES = 2 * 1024 * 1024;
const MEMORY_FLUSH_TARGET_HINT = "Store durable memories only in memory/YYYY-MM-DD.md (create memory/ if needed).";
const MEMORY_FLUSH_APPEND_ONLY_HINT = "If memory/YYYY-MM-DD.md already exists, APPEND new content only and do not overwrite existing entries.";
const MEMORY_FLUSH_READ_ONLY_HINT = "Treat workspace bootstrap/reference files such as MEMORY.md, DREAMS.md, SOUL.md, TOOLS.md, and AGENTS.md as read-only during this flush; never overwrite, replace, or edit them.";
const MEMORY_FLUSH_REQUIRED_HINTS = [
	MEMORY_FLUSH_TARGET_HINT,
	MEMORY_FLUSH_APPEND_ONLY_HINT,
	MEMORY_FLUSH_READ_ONLY_HINT
];
const DEFAULT_MEMORY_FLUSH_PROMPT = [
	"Pre-compaction memory flush.",
	MEMORY_FLUSH_TARGET_HINT,
	MEMORY_FLUSH_READ_ONLY_HINT,
	MEMORY_FLUSH_APPEND_ONLY_HINT,
	"Do NOT create timestamped variant files (e.g., YYYY-MM-DD-HHMM.md); always use the canonical YYYY-MM-DD.md filename.",
	`If nothing to store, reply with ${SILENT_REPLY_TOKEN}.`
].join(" ");
const DEFAULT_MEMORY_FLUSH_SYSTEM_PROMPT = [
	"Pre-compaction memory flush turn.",
	"The session is near auto-compaction; capture durable memories to disk.",
	MEMORY_FLUSH_TARGET_HINT,
	MEMORY_FLUSH_READ_ONLY_HINT,
	MEMORY_FLUSH_APPEND_ONLY_HINT,
	`You may reply, but usually ${SILENT_REPLY_TOKEN} is correct.`
].join(" ");
function formatDateStampInTimezone(nowMs, timezone) {
	const parts = new Intl.DateTimeFormat("en-US", {
		timeZone: timezone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit"
	}).formatToParts(new Date(nowMs));
	const year = parts.find((part) => part.type === "year")?.value;
	const month = parts.find((part) => part.type === "month")?.value;
	const day = parts.find((part) => part.type === "day")?.value;
	if (year && month && day) return `${year}-${month}-${day}`;
	return new Date(nowMs).toISOString().slice(0, 10);
}
function normalizeNonNegativeInt(value) {
	if (typeof value !== "number" || !Number.isFinite(value)) return null;
	const int = Math.floor(value);
	return int >= 0 ? int : null;
}
function ensureNoReplyHint(text) {
	if (text.includes("NO_REPLY")) return text;
	return `${text}\n\nIf no user-visible reply is needed, start with ${SILENT_REPLY_TOKEN}.`;
}
function ensureMemoryFlushSafetyHints(text) {
	let next = text.trim();
	for (const hint of MEMORY_FLUSH_REQUIRED_HINTS) if (!next.includes(hint)) next = next ? `${next}\n\n${hint}` : hint;
	return next;
}
function appendCurrentTimeLine(text, timeLine) {
	const trimmed = text.trimEnd();
	if (!trimmed) return timeLine;
	if (trimmed.includes("Current time:")) return trimmed;
	return `${trimmed}\n${timeLine}`;
}
function buildMemoryFlushPlan(params = {}) {
	const resolved = params;
	const nowMs = Number.isFinite(resolved.nowMs) ? resolved.nowMs : Date.now();
	const cfg = resolved.cfg;
	const defaults = cfg?.agents?.defaults?.compaction?.memoryFlush;
	if (defaults?.enabled === false) return null;
	const softThresholdTokens = normalizeNonNegativeInt(defaults?.softThresholdTokens) ?? 4e3;
	const forceFlushTranscriptBytes = parseNonNegativeByteSize(defaults?.forceFlushTranscriptBytes) ?? 2097152;
	const reserveTokensFloor = normalizeNonNegativeInt(cfg?.agents?.defaults?.compaction?.reserveTokensFloor) ?? 2e4;
	const { timeLine, userTimezone } = resolveCronStyleNow(cfg ?? {}, nowMs);
	const dateStamp = formatDateStampInTimezone(nowMs, userTimezone);
	const relativePath = `memory/${dateStamp}.md`;
	const promptBase = ensureNoReplyHint(ensureMemoryFlushSafetyHints(defaults?.prompt?.trim() || DEFAULT_MEMORY_FLUSH_PROMPT));
	const systemPrompt = ensureNoReplyHint(ensureMemoryFlushSafetyHints(defaults?.systemPrompt?.trim() || DEFAULT_MEMORY_FLUSH_SYSTEM_PROMPT));
	return {
		softThresholdTokens,
		forceFlushTranscriptBytes,
		reserveTokensFloor,
		prompt: appendCurrentTimeLine(promptBase.replaceAll("YYYY-MM-DD", dateStamp), timeLine),
		systemPrompt: systemPrompt.replaceAll("YYYY-MM-DD", dateStamp),
		relativePath
	};
}
//#endregion
//#region extensions/memory-core/src/prompt-section.ts
const buildPromptSection = ({ availableTools, citationsMode }) => {
	const hasMemorySearch = availableTools.has("memory_search");
	const hasMemoryGet = availableTools.has("memory_get");
	if (!hasMemorySearch && !hasMemoryGet) return [];
	let toolGuidance;
	if (hasMemorySearch && hasMemoryGet) toolGuidance = "Before answering anything about prior work, decisions, dates, people, preferences, or todos: run memory_search on MEMORY.md + memory/*.md + indexed session transcripts; then use memory_get to pull only the needed lines. If low confidence after search, say you checked.";
	else if (hasMemorySearch) toolGuidance = "Before answering anything about prior work, decisions, dates, people, preferences, or todos: run memory_search on MEMORY.md + memory/*.md + indexed session transcripts and answer from the matching results. If low confidence after search, say you checked.";
	else toolGuidance = "Before answering anything about prior work, decisions, dates, people, preferences, or todos that already point to a specific memory file or note: run memory_get to pull only the needed lines. If low confidence after reading them, say you checked.";
	const lines = ["## Memory Recall", toolGuidance];
	if (citationsMode === "off") lines.push("Citations are disabled: do not mention file paths or line numbers in replies unless the user explicitly asks.");
	else lines.push("Citations: include Source: <path#line> when it helps the user verify memory snippets.");
	lines.push("");
	return lines;
};
//#endregion
//#region extensions/memory-core/src/public-artifacts.ts
async function pathExists(inputPath) {
	try {
		await fs.access(inputPath);
		return true;
	} catch {
		return false;
	}
}
async function listMarkdownFilesRecursive(rootDir) {
	const entries = await fs.readdir(rootDir, { withFileTypes: true }).catch(() => []);
	const files = [];
	for (const entry of entries) {
		const fullPath = path.join(rootDir, entry.name);
		if (entry.isDirectory()) {
			files.push(...await listMarkdownFilesRecursive(fullPath));
			continue;
		}
		if (entry.isFile() && entry.name.endsWith(".md")) files.push(fullPath);
	}
	return files.toSorted((left, right) => left.localeCompare(right));
}
async function collectWorkspaceArtifacts(params) {
	const artifacts = [];
	const workspaceEntries = new Set((await fs.readdir(params.workspaceDir, { withFileTypes: true }).catch(() => [])).filter((entry) => entry.isFile()).map((entry) => entry.name));
	for (const relativePath of ["MEMORY.md"]) {
		if (!workspaceEntries.has(relativePath)) continue;
		const absolutePath = path.join(params.workspaceDir, relativePath);
		artifacts.push({
			kind: "memory-root",
			workspaceDir: params.workspaceDir,
			relativePath,
			absolutePath,
			agentIds: [...params.agentIds],
			contentType: "markdown"
		});
	}
	const memoryDir = path.join(params.workspaceDir, "memory");
	for (const absolutePath of await listMarkdownFilesRecursive(memoryDir)) {
		const relativePath = path.relative(params.workspaceDir, absolutePath).replace(/\\/g, "/");
		artifacts.push({
			kind: relativePath.startsWith("memory/dreaming/") ? "dream-report" : "daily-note",
			workspaceDir: params.workspaceDir,
			relativePath,
			absolutePath,
			agentIds: [...params.agentIds],
			contentType: "markdown"
		});
	}
	const eventLogPath = resolveMemoryHostEventLogPath(params.workspaceDir);
	if (await pathExists(eventLogPath)) artifacts.push({
		kind: "event-log",
		workspaceDir: params.workspaceDir,
		relativePath: path.relative(params.workspaceDir, eventLogPath).replace(/\\/g, "/"),
		absolutePath: eventLogPath,
		agentIds: [...params.agentIds],
		contentType: "json"
	});
	const deduped = /* @__PURE__ */ new Map();
	for (const artifact of artifacts) deduped.set(`${artifact.workspaceDir}\0${artifact.relativePath}\0${artifact.kind}`, artifact);
	return [...deduped.values()];
}
async function listMemoryCorePublicArtifacts(params) {
	const workspaces = resolveMemoryDreamingWorkspaces(params.cfg);
	const artifacts = [];
	for (const workspace of workspaces) artifacts.push(...await collectWorkspaceArtifacts({
		workspaceDir: workspace.workspaceDir,
		agentIds: workspace.agentIds
	}));
	return artifacts;
}
//#endregion
//#region extensions/memory-core/src/session-search-visibility.ts
async function filterMemorySearchHitsBySessionVisibility(params) {
	const visibility = resolveEffectiveSessionToolsVisibility({
		cfg: params.cfg,
		sandboxed: params.sandboxed
	});
	const a2aPolicy = createAgentToAgentPolicy(params.cfg);
	const guard = params.requesterSessionKey ? await createSessionVisibilityGuard({
		action: "history",
		requesterSessionKey: params.requesterSessionKey,
		visibility,
		a2aPolicy
	}) : null;
	const { store: combinedSessionStore } = loadCombinedSessionStoreForGateway(params.cfg);
	const next = [];
	for (const hit of params.hits) {
		if (hit.source !== "sessions") {
			next.push(hit);
			continue;
		}
		if (!params.requesterSessionKey || !guard) continue;
		const stem = extractTranscriptStemFromSessionsMemoryHit(hit.path);
		if (!stem) continue;
		const keys = resolveTranscriptStemToSessionKeys({
			store: combinedSessionStore,
			stem
		});
		if (keys.length === 0) continue;
		if (!keys.some((key) => guard.check(key).allowed)) continue;
		next.push(hit);
	}
	return next;
}
//#endregion
//#region extensions/memory-core/src/tools.citations.ts
function resolveMemoryCitationsMode(cfg) {
	const mode = cfg.memory?.citations;
	if (mode === "on" || mode === "off" || mode === "auto") return mode;
	return "auto";
}
function decorateCitations(results, include) {
	if (!include) return results.map((entry) => ({
		...entry,
		citation: void 0
	}));
	return results.map((entry) => {
		const citation = formatCitation(entry);
		const snippet = `${entry.snippet.trim()}\n\nSource: ${citation}`;
		return {
			...entry,
			citation,
			snippet
		};
	});
}
function formatCitation(entry) {
	const lineRange = entry.startLine === entry.endLine ? `#L${entry.startLine}` : `#L${entry.startLine}-L${entry.endLine}`;
	return `${entry.path}${lineRange}`;
}
function clampResultsByInjectedChars(results, budget) {
	if (!budget || budget <= 0) return results;
	let remaining = budget;
	const clamped = [];
	for (const entry of results) {
		if (remaining <= 0) break;
		const snippet = entry.snippet ?? "";
		if (snippet.length <= remaining) {
			clamped.push(entry);
			remaining -= snippet.length;
		} else {
			const trimmed = snippet.slice(0, Math.max(0, remaining));
			clamped.push({
				...entry,
				snippet: trimmed
			});
			break;
		}
	}
	return clamped;
}
function shouldIncludeCitations(params) {
	if (params.mode === "on") return true;
	if (params.mode === "off") return false;
	return deriveChatTypeFromSessionKey(params.sessionKey) === "direct";
}
function deriveChatTypeFromSessionKey(sessionKey) {
	const parsed = parseAgentSessionKey(sessionKey);
	if (!parsed?.rest) return "direct";
	const tokens = new Set(normalizeLowercaseStringOrEmpty(parsed.rest).split(":").filter(Boolean));
	if (tokens.has("channel")) return "channel";
	if (tokens.has("group")) return "group";
	return "direct";
}
//#endregion
//#region extensions/memory-core/src/tools.shared.ts
let memoryToolRuntimePromise = null;
async function loadMemoryToolRuntime() {
	memoryToolRuntimePromise ??= import("../../tools.runtime-B_ugF814.js");
	return await memoryToolRuntimePromise;
}
const MemorySearchSchema = Type.Object({
	query: Type.String(),
	maxResults: Type.Optional(Type.Number()),
	minScore: Type.Optional(Type.Number()),
	corpus: Type.Optional(Type.Union([
		Type.Literal("memory"),
		Type.Literal("wiki"),
		Type.Literal("all"),
		Type.Literal("sessions")
	]))
});
const MemoryGetSchema = Type.Object({
	path: Type.String(),
	from: Type.Optional(Type.Number()),
	lines: Type.Optional(Type.Number()),
	corpus: Type.Optional(Type.Union([
		Type.Literal("memory"),
		Type.Literal("wiki"),
		Type.Literal("all")
	]))
});
function resolveMemoryToolContext(options) {
	const cfg = options.config;
	if (!cfg) return null;
	const agentId = resolveSessionAgentId({
		sessionKey: options.agentSessionKey,
		config: cfg
	});
	if (!resolveMemorySearchConfig(cfg, agentId)) return null;
	return {
		cfg,
		agentId
	};
}
async function getMemoryManagerContext(params) {
	return await getMemoryManagerContextWithPurpose({
		...params,
		purpose: void 0
	});
}
async function getMemoryManagerContextWithPurpose(params) {
	const { getMemorySearchManager } = await loadMemoryToolRuntime();
	const { manager, error } = await getMemorySearchManager({
		cfg: params.cfg,
		agentId: params.agentId,
		purpose: params.purpose
	});
	return manager ? { manager } : { error };
}
function createMemoryTool(params) {
	const ctx = resolveMemoryToolContext(params.options);
	if (!ctx) return null;
	return {
		label: params.label,
		name: params.name,
		description: params.description,
		parameters: params.parameters,
		execute: params.execute(ctx)
	};
}
function buildMemorySearchUnavailableResult(error) {
	const reason = (error ?? "memory search unavailable").trim() || "memory search unavailable";
	const isQuotaError = /insufficient_quota|quota|429/.test(normalizeLowercaseStringOrEmpty(reason));
	const warning = isQuotaError ? "Memory search is unavailable because the embedding provider quota is exhausted." : "Memory search is unavailable due to an embedding/provider error.";
	const action = isQuotaError ? "Top up or switch embedding provider, then retry memory_search." : "Check embedding provider configuration and retry memory_search.";
	return {
		results: [],
		disabled: true,
		unavailable: true,
		error: reason,
		warning,
		action,
		debug: {
			warning,
			action,
			error: reason
		}
	};
}
async function searchMemoryCorpusSupplements(params) {
	if (params.corpus === "memory" || params.corpus === "sessions") return [];
	const supplements = listMemoryCorpusSupplements();
	if (supplements.length === 0) return [];
	return (await Promise.all(supplements.map(async (registration) => await registration.supplement.search(params)))).flat().toSorted((left, right) => {
		if (left.score !== right.score) return right.score - left.score;
		return left.path.localeCompare(right.path);
	}).slice(0, Math.max(1, params.maxResults ?? 10));
}
async function getMemoryCorpusSupplementResult(params) {
	if (params.corpus === "memory" || params.corpus === "sessions") return null;
	for (const registration of listMemoryCorpusSupplements()) {
		const result = await registration.supplement.get(params);
		if (result) return result;
	}
	return null;
}
//#endregion
//#region extensions/memory-core/src/tools.ts
function buildRecallKey(result) {
	return `${result.source}:${result.path}:${result.startLine}:${result.endLine}`;
}
function resolveRecallTrackingResults(rawResults, surfacedResults) {
	if (surfacedResults.length === 0 || rawResults.length === 0) return surfacedResults;
	const rawByKey = /* @__PURE__ */ new Map();
	for (const raw of rawResults) {
		const key = buildRecallKey(raw);
		if (!rawByKey.has(key)) rawByKey.set(key, raw);
	}
	return surfacedResults.map((surfaced) => rawByKey.get(buildRecallKey(surfaced)) ?? surfaced);
}
function queueShortTermRecallTracking(params) {
	const trackingResults = resolveRecallTrackingResults(params.rawResults, params.surfacedResults);
	recordShortTermRecalls({
		workspaceDir: params.workspaceDir,
		query: params.query,
		results: trackingResults,
		timezone: params.timezone
	}).catch(() => {});
}
function normalizeActiveMemoryQmdSearchMode(value) {
	return value === "inherit" || value === "search" || value === "vsearch" || value === "query" ? value : "search";
}
function isActiveMemorySessionKey(sessionKey) {
	return typeof sessionKey === "string" && sessionKey.includes(":active-memory:");
}
function resolveActiveMemoryQmdSearchModeOverride(cfg, sessionKey) {
	if (!isActiveMemorySessionKey(sessionKey)) return;
	const entry = cfg.plugins?.entries?.["active-memory"];
	const entryRecord = entry && typeof entry === "object" && !Array.isArray(entry) ? entry : void 0;
	const searchMode = normalizeActiveMemoryQmdSearchMode((entryRecord?.config && typeof entryRecord.config === "object" && !Array.isArray(entryRecord.config) ? entryRecord.config : void 0)?.qmd?.searchMode);
	return searchMode === "inherit" ? void 0 : searchMode;
}
async function getSupplementMemoryReadResult(params) {
	const supplement = await getMemoryCorpusSupplementResult({
		lookup: params.relPath,
		fromLine: params.from,
		lineCount: params.lines,
		agentSessionKey: params.agentSessionKey,
		corpus: params.corpus
	});
	if (!supplement) return null;
	const { content, ...rest } = supplement;
	return {
		...rest,
		text: content
	};
}
async function resolveMemoryReadFailureResult(params) {
	if (params.requestedCorpus === "all") {
		const supplement = await getSupplementMemoryReadResult({
			relPath: params.relPath,
			from: params.from,
			lines: params.lines,
			agentSessionKey: params.agentSessionKey,
			corpus: params.requestedCorpus
		});
		if (supplement) return jsonResult(supplement);
	}
	const message = formatErrorMessage(params.error);
	return jsonResult({
		path: params.relPath,
		text: "",
		disabled: true,
		error: message
	});
}
async function executeMemoryReadResult(params) {
	try {
		return jsonResult(await params.read());
	} catch (error) {
		return await resolveMemoryReadFailureResult({
			error,
			requestedCorpus: params.requestedCorpus,
			relPath: params.relPath,
			from: params.from,
			lines: params.lines,
			agentSessionKey: params.agentSessionKey
		});
	}
}
function createMemorySearchTool(options) {
	return createMemoryTool({
		options,
		label: "Memory Search",
		name: "memory_search",
		description: "Mandatory recall step: semantically search MEMORY.md + memory/*.md (and optional session transcripts) before answering questions about prior work, decisions, dates, people, preferences, or todos. Optional `corpus=wiki` or `corpus=all` also searches registered compiled-wiki supplements. `corpus=memory` restricts hits to indexed memory files (excludes session transcript chunks from ranking). `corpus=sessions` restricts hits to indexed session transcripts (same visibility rules as session history tools). If response has disabled=true, memory retrieval is unavailable and should be surfaced to the user.",
		parameters: MemorySearchSchema,
		execute: ({ cfg, agentId }) => async (_toolCallId, params) => {
			const rawParams = asToolParamsRecord(params);
			const query = readStringParam(rawParams, "query", { required: true });
			const maxResults = readNumberParam(rawParams, "maxResults");
			const minScore = readNumberParam(rawParams, "minScore");
			const requestedCorpus = readStringParam(rawParams, "corpus");
			const { resolveMemoryBackendConfig } = await loadMemoryToolRuntime();
			const shouldQueryMemory = requestedCorpus !== "wiki";
			const shouldQuerySupplements = requestedCorpus === "wiki" || requestedCorpus === "all";
			const memory = shouldQueryMemory ? await getMemoryManagerContext({
				cfg,
				agentId
			}) : null;
			if (shouldQueryMemory && memory && "error" in memory && !shouldQuerySupplements) return jsonResult(buildMemorySearchUnavailableResult(memory.error));
			try {
				const citationsMode = resolveMemoryCitationsMode(cfg);
				const includeCitations = shouldIncludeCitations({
					mode: citationsMode,
					sessionKey: options.agentSessionKey
				});
				const searchStartedAt = Date.now();
				let rawResults = [];
				let surfacedMemoryResults = [];
				let provider;
				let model;
				let fallback;
				let searchMode;
				let searchDebug;
				if (shouldQueryMemory && memory && !("error" in memory)) {
					const runtimeDebug = [];
					const qmdSearchModeOverride = resolveActiveMemoryQmdSearchModeOverride(cfg, options.agentSessionKey);
					const searchSources = requestedCorpus === "sessions" ? ["sessions"] : requestedCorpus === "memory" ? ["memory"] : void 0;
					rawResults = await memory.manager.search(query, {
						maxResults,
						minScore,
						sessionKey: options.agentSessionKey,
						qmdSearchModeOverride,
						onDebug: (debug) => {
							runtimeDebug.push(debug);
						},
						...searchSources ? { sources: searchSources } : {}
					});
					rawResults = await filterMemorySearchHitsBySessionVisibility({
						cfg,
						requesterSessionKey: options.agentSessionKey,
						sandboxed: options.sandboxed === true,
						hits: rawResults
					});
					if (requestedCorpus === "sessions") rawResults = rawResults.filter((hit) => hit.source === "sessions");
					else if (requestedCorpus === "memory") rawResults = rawResults.filter((hit) => hit.source === "memory");
					const status = memory.manager.status();
					const decorated = decorateCitations(rawResults, includeCitations);
					const resolved = resolveMemoryBackendConfig({
						cfg,
						agentId
					});
					const memoryResults = status.backend === "qmd" ? clampResultsByInjectedChars(decorated, resolved.qmd?.limits.maxInjectedChars) : decorated;
					surfacedMemoryResults = memoryResults.map((result) => ({
						...result,
						corpus: "memory"
					}));
					const sleepTimezone = resolveMemoryDeepDreamingConfig({
						pluginConfig: resolveMemoryCorePluginConfig$1(cfg),
						cfg
					}).timezone;
					queueShortTermRecallTracking({
						workspaceDir: status.workspaceDir,
						query,
						rawResults,
						surfacedResults: memoryResults,
						timezone: sleepTimezone
					});
					provider = status.provider;
					model = status.model;
					fallback = status.fallback;
					const latestDebug = runtimeDebug.at(-1);
					searchMode = latestDebug?.effectiveMode;
					searchDebug = {
						backend: status.backend,
						configuredMode: latestDebug?.configuredMode,
						effectiveMode: status.backend === "qmd" ? latestDebug?.effectiveMode ?? latestDebug?.configuredMode : "n/a",
						fallback: latestDebug?.fallback,
						searchMs: Math.max(0, Date.now() - searchStartedAt),
						hits: rawResults.length
					};
				}
				const supplementResults = shouldQuerySupplements ? await searchMemoryCorpusSupplements({
					query,
					maxResults,
					agentSessionKey: options.agentSessionKey,
					corpus: requestedCorpus
				}) : [];
				return jsonResult({
					results: [...surfacedMemoryResults, ...supplementResults].toSorted((left, right) => {
						if (left.score !== right.score) return right.score - left.score;
						return left.path.localeCompare(right.path);
					}).slice(0, Math.max(1, maxResults ?? 10)),
					provider,
					model,
					fallback,
					citations: citationsMode,
					mode: searchMode,
					debug: searchDebug
				});
			} catch (err) {
				return jsonResult(buildMemorySearchUnavailableResult(formatErrorMessage(err)));
			}
		}
	});
}
function createMemoryGetTool(options) {
	return createMemoryTool({
		options,
		label: "Memory Get",
		name: "memory_get",
		description: "Safe exact excerpt read from MEMORY.md or memory/*.md. Defaults to a bounded excerpt when lines are omitted, includes truncation/continuation info when more content exists, and `corpus=wiki` reads from registered compiled-wiki supplements.",
		parameters: MemoryGetSchema,
		execute: ({ cfg, agentId }) => async (_toolCallId, params) => {
			const rawParams = asToolParamsRecord(params);
			const relPath = readStringParam(rawParams, "path", { required: true });
			const from = readNumberParam(rawParams, "from", { integer: true });
			const lines = readNumberParam(rawParams, "lines", { integer: true });
			const requestedCorpus = readStringParam(rawParams, "corpus");
			const { readAgentMemoryFile, resolveMemoryBackendConfig } = await loadMemoryToolRuntime();
			if (requestedCorpus === "wiki") return jsonResult(await getSupplementMemoryReadResult({
				relPath,
				from: from ?? void 0,
				lines: lines ?? void 0,
				agentSessionKey: options.agentSessionKey,
				corpus: requestedCorpus
			}) ?? {
				path: relPath,
				text: "",
				disabled: true,
				error: "wiki corpus result not found"
			});
			if (resolveMemoryBackendConfig({
				cfg,
				agentId
			}).backend === "builtin") return await executeMemoryReadResult({
				read: async () => await readAgentMemoryFile({
					cfg,
					agentId,
					relPath,
					from: from ?? void 0,
					lines: lines ?? void 0
				}),
				requestedCorpus,
				relPath,
				from: from ?? void 0,
				lines: lines ?? void 0,
				agentSessionKey: options.agentSessionKey
			});
			const memory = await getMemoryManagerContextWithPurpose({
				cfg,
				agentId,
				purpose: "status"
			});
			if ("error" in memory) return jsonResult({
				path: relPath,
				text: "",
				disabled: true,
				error: memory.error
			});
			return await executeMemoryReadResult({
				read: async () => await memory.manager.readFile({
					relPath,
					from: from ?? void 0,
					lines: lines ?? void 0
				}),
				requestedCorpus,
				relPath,
				from: from ?? void 0,
				lines: lines ?? void 0,
				agentSessionKey: options.agentSessionKey
			});
		}
	});
}
//#endregion
//#region extensions/memory-core/index.ts
var memory_core_default = definePluginEntry({
	id: "memory-core",
	name: "Memory (Core)",
	description: "File-backed memory search tools and CLI",
	kind: "memory",
	register(api) {
		registerBuiltInMemoryEmbeddingProviders(api);
		registerShortTermPromotionDreaming(api);
		registerDreamingCommand(api);
		api.registerMemoryCapability({
			promptBuilder: buildPromptSection,
			flushPlanResolver: buildMemoryFlushPlan,
			runtime: memoryRuntime,
			publicArtifacts: { listArtifacts: listMemoryCorePublicArtifacts }
		});
		api.registerTool((ctx) => createMemorySearchTool({
			config: ctx.config,
			agentSessionKey: ctx.sessionKey,
			sandboxed: ctx.sandboxed
		}), { names: ["memory_search"] });
		api.registerTool((ctx) => createMemoryGetTool({
			config: ctx.config,
			agentSessionKey: ctx.sessionKey
		}), { names: ["memory_get"] });
		api.registerCli(({ program }) => {
			registerMemoryCli(program);
		}, { descriptors: [{
			name: "memory",
			description: "Search, inspect, and reindex memory files",
			hasSubcommands: true
		}] });
	}
});
//#endregion
export { DEFAULT_MEMORY_FLUSH_FORCE_TRANSCRIPT_BYTES, DEFAULT_MEMORY_FLUSH_PROMPT, DEFAULT_MEMORY_FLUSH_SOFT_TOKENS, buildMemoryFlushPlan, buildPromptSection, memory_core_default as default };
