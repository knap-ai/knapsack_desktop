import { i as normalizeLowercaseStringOrEmpty, s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { b as truncateUtf16Safe } from "./utils-D5DtWkEu.js";
import { a as sanitizeTaskStatusText } from "./task-status-DdxMiKkn.js";
//#region src/auto-reply/reply/subagents-utils.ts
function resolveSubagentLabel(entry, fallback = "subagent") {
	return normalizeOptionalString(entry.label) || normalizeOptionalString(entry.task) || fallback;
}
function formatRunLabel(entry, options) {
	const raw = sanitizeTaskStatusText(resolveSubagentLabel(entry)) || "subagent";
	const maxLength = options?.maxLength ?? 72;
	if (!Number.isFinite(maxLength) || maxLength <= 0) return raw;
	return raw.length > maxLength ? `${truncateUtf16Safe(raw, maxLength).trimEnd()}…` : raw;
}
function formatRunStatus(entry) {
	if (!entry.endedAt) return "running";
	const status = entry.outcome?.status ?? "done";
	return status === "ok" ? "done" : status;
}
function sortSubagentRuns(runs) {
	return [...runs].toSorted((a, b) => {
		const aTime = a.startedAt ?? a.createdAt ?? 0;
		return (b.startedAt ?? b.createdAt ?? 0) - aTime;
	});
}
function resolveSubagentTargetFromRuns(params) {
	const trimmed = normalizeOptionalString(params.token);
	if (!trimmed) return { error: params.errors.missingTarget };
	const sorted = sortSubagentRuns(params.runs);
	const deduped = [];
	const seenChildSessionKeys = /* @__PURE__ */ new Set();
	for (const entry of sorted) {
		if (seenChildSessionKeys.has(entry.childSessionKey)) continue;
		seenChildSessionKeys.add(entry.childSessionKey);
		deduped.push(entry);
	}
	if (trimmed === "last") return { entry: deduped[0] };
	const isActive = params.isActive ?? ((entry) => !entry.endedAt);
	const recentCutoff = Date.now() - params.recentWindowMinutes * 6e4;
	const numericOrder = [...deduped.filter((entry) => isActive(entry)), ...deduped.filter((entry) => !isActive(entry) && !!entry.endedAt && (entry.endedAt ?? 0) >= recentCutoff)];
	if (/^\d+$/.test(trimmed)) {
		const idx = Number.parseInt(trimmed, 10);
		if (!Number.isFinite(idx) || idx <= 0 || idx > numericOrder.length) return { error: params.errors.invalidIndex(trimmed) };
		return { entry: numericOrder[idx - 1] };
	}
	if (trimmed.includes(":")) {
		const bySessionKey = deduped.find((entry) => entry.childSessionKey === trimmed);
		return bySessionKey ? { entry: bySessionKey } : { error: params.errors.unknownSession(trimmed) };
	}
	const lowered = normalizeLowercaseStringOrEmpty(trimmed);
	const byExactLabel = deduped.filter((entry) => normalizeLowercaseStringOrEmpty(params.label(entry)) === lowered);
	if (byExactLabel.length === 1) return { entry: byExactLabel[0] };
	if (byExactLabel.length > 1) return { error: params.errors.ambiguousLabel(trimmed) };
	const byLabelPrefix = deduped.filter((entry) => normalizeLowercaseStringOrEmpty(params.label(entry)).startsWith(lowered));
	if (byLabelPrefix.length === 1) return { entry: byLabelPrefix[0] };
	if (byLabelPrefix.length > 1) return { error: params.errors.ambiguousLabelPrefix(trimmed) };
	const byRunIdPrefix = deduped.filter((entry) => entry.runId.startsWith(trimmed));
	if (byRunIdPrefix.length === 1) return { entry: byRunIdPrefix[0] };
	if (byRunIdPrefix.length > 1) return { error: params.errors.ambiguousRunIdPrefix(trimmed) };
	return { error: params.errors.unknownTarget(trimmed) };
}
//#endregion
//#region src/shared/subagents-format.ts
function formatTokenShort(value) {
	if (!value || !Number.isFinite(value) || value <= 0) return;
	const n = Math.floor(value);
	if (n < 1e3) return `${n}`;
	if (n < 1e4) return `${(n / 1e3).toFixed(1).replace(/\.0$/, "")}k`;
	if (n < 1e6) return `${Math.round(n / 1e3)}k`;
	return `${(n / 1e6).toFixed(1).replace(/\.0$/, "")}m`;
}
function truncateLine(value, maxLength) {
	if (value.length <= maxLength) return value;
	return `${value.slice(0, maxLength).trimEnd()}...`;
}
function resolveTotalTokens(entry) {
	if (!entry || typeof entry !== "object") return;
	if (typeof entry.totalTokens === "number" && Number.isFinite(entry.totalTokens)) return entry.totalTokens;
	const total = (typeof entry.inputTokens === "number" ? entry.inputTokens : 0) + (typeof entry.outputTokens === "number" ? entry.outputTokens : 0);
	return total > 0 ? total : void 0;
}
function resolveIoTokens(entry) {
	if (!entry || typeof entry !== "object") return;
	const input = typeof entry.inputTokens === "number" && Number.isFinite(entry.inputTokens) ? entry.inputTokens : 0;
	const output = typeof entry.outputTokens === "number" && Number.isFinite(entry.outputTokens) ? entry.outputTokens : 0;
	const total = input + output;
	if (total <= 0) return;
	return {
		input,
		output,
		total
	};
}
function formatTokenUsageDisplay(entry) {
	const io = resolveIoTokens(entry);
	const promptCache = resolveTotalTokens(entry);
	const parts = [];
	if (io) {
		const input = formatTokenShort(io.input) ?? "0";
		const output = formatTokenShort(io.output) ?? "0";
		parts.push(`tokens ${formatTokenShort(io.total)} (in ${input} / out ${output})`);
	} else if (typeof promptCache === "number" && promptCache > 0) parts.push(`tokens ${formatTokenShort(promptCache)} prompt/cache`);
	if (typeof promptCache === "number" && io && promptCache > io.total) parts.push(`prompt/cache ${formatTokenShort(promptCache)}`);
	return parts.join(", ");
}
//#endregion
export { formatRunStatus as a, sortSubagentRuns as c, formatRunLabel as i, resolveTotalTokens as n, resolveSubagentLabel as o, truncateLine as r, resolveSubagentTargetFromRuns as s, formatTokenUsageDisplay as t };
