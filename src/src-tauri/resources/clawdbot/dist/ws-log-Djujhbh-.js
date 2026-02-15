import { A as isVerbose, s as shouldLogSubsystemToConsole, t as createSubsystemLogger } from "./subsystem-QRNIBE7-.js";
import { y as parseAgentSessionKey } from "./session-key-BWxPj0z_.js";
import { n as redactSensitiveText, t as getDefaultRedactPatterns } from "./redact-Bb36nvYe.js";
import chalk from "chalk";

//#region src/gateway/ws-logging.ts
let gatewayWsLogStyle = "auto";
function setGatewayWsLogStyle(style) {
	gatewayWsLogStyle = style;
}
function getGatewayWsLogStyle() {
	return gatewayWsLogStyle;
}
const DEFAULT_WS_SLOW_MS = 50;

//#endregion
//#region src/gateway/ws-log.ts
const LOG_VALUE_LIMIT = 240;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const WS_LOG_REDACT_OPTIONS = {
	mode: "tools",
	patterns: getDefaultRedactPatterns()
};
const wsInflightCompact = /* @__PURE__ */ new Map();
let wsLastCompactConnId;
const wsInflightOptimized = /* @__PURE__ */ new Map();
const wsInflightSince = /* @__PURE__ */ new Map();
const wsLog = createSubsystemLogger("gateway/ws");
function shortId(value) {
	const s = value.trim();
	if (UUID_RE.test(s)) return `${s.slice(0, 8)}…${s.slice(-4)}`;
	if (s.length <= 24) return s;
	return `${s.slice(0, 12)}…${s.slice(-4)}`;
}
function formatForLog(value) {
	try {
		if (value instanceof Error) {
			const parts = [];
			if (value.name) parts.push(value.name);
			if (value.message) parts.push(value.message);
			const code = "code" in value && (typeof value.code === "string" || typeof value.code === "number") ? String(value.code) : "";
			if (code) parts.push(`code=${code}`);
			const combined = parts.filter(Boolean).join(": ").trim();
			if (combined) return combined.length > LOG_VALUE_LIMIT ? `${combined.slice(0, LOG_VALUE_LIMIT)}...` : combined;
		}
		if (value && typeof value === "object") {
			const rec = value;
			if (typeof rec.message === "string" && rec.message.trim()) {
				const name = typeof rec.name === "string" ? rec.name.trim() : "";
				const code = typeof rec.code === "string" || typeof rec.code === "number" ? String(rec.code) : "";
				const parts = [name, rec.message.trim()].filter(Boolean);
				if (code) parts.push(`code=${code}`);
				const combined = parts.join(": ").trim();
				return combined.length > LOG_VALUE_LIMIT ? `${combined.slice(0, LOG_VALUE_LIMIT)}...` : combined;
			}
		}
		const str = typeof value === "string" || typeof value === "number" ? String(value) : JSON.stringify(value);
		if (!str) return "";
		const redacted = redactSensitiveText(str, WS_LOG_REDACT_OPTIONS);
		return redacted.length > LOG_VALUE_LIMIT ? `${redacted.slice(0, LOG_VALUE_LIMIT)}...` : redacted;
	} catch {
		return String(value);
	}
}
function compactPreview(input, maxLen = 160) {
	const oneLine = input.replace(/\s+/g, " ").trim();
	if (oneLine.length <= maxLen) return oneLine;
	return `${oneLine.slice(0, Math.max(0, maxLen - 1))}…`;
}
function summarizeAgentEventForWsLog(payload) {
	if (!payload || typeof payload !== "object") return {};
	const rec = payload;
	const runId = typeof rec.runId === "string" ? rec.runId : void 0;
	const stream = typeof rec.stream === "string" ? rec.stream : void 0;
	const seq = typeof rec.seq === "number" ? rec.seq : void 0;
	const sessionKey = typeof rec.sessionKey === "string" ? rec.sessionKey : void 0;
	const data = rec.data && typeof rec.data === "object" ? rec.data : void 0;
	const extra = {};
	if (runId) extra.run = shortId(runId);
	if (sessionKey) {
		const parsed = parseAgentSessionKey(sessionKey);
		if (parsed) {
			extra.agent = parsed.agentId;
			extra.session = parsed.rest;
		} else extra.session = sessionKey;
	}
	if (stream) extra.stream = stream;
	if (seq !== void 0) extra.aseq = seq;
	if (!data) return extra;
	if (stream === "assistant") {
		const text = typeof data.text === "string" ? data.text : void 0;
		if (text?.trim()) extra.text = compactPreview(text);
		const mediaUrls = Array.isArray(data.mediaUrls) ? data.mediaUrls : void 0;
		if (mediaUrls && mediaUrls.length > 0) extra.media = mediaUrls.length;
		return extra;
	}
	if (stream === "tool") {
		const phase = typeof data.phase === "string" ? data.phase : void 0;
		const name = typeof data.name === "string" ? data.name : void 0;
		if (phase || name) extra.tool = `${phase ?? "?"}:${name ?? "?"}`;
		const toolCallId = typeof data.toolCallId === "string" ? data.toolCallId : void 0;
		if (toolCallId) extra.call = shortId(toolCallId);
		const meta = typeof data.meta === "string" ? data.meta : void 0;
		if (meta?.trim()) extra.meta = meta;
		if (typeof data.isError === "boolean") extra.err = data.isError;
		return extra;
	}
	if (stream === "lifecycle") {
		const phase = typeof data.phase === "string" ? data.phase : void 0;
		if (phase) extra.phase = phase;
		if (typeof data.aborted === "boolean") extra.aborted = data.aborted;
		const error = typeof data.error === "string" ? data.error : void 0;
		if (error?.trim()) extra.error = compactPreview(error, 120);
		return extra;
	}
	const reason = typeof data.reason === "string" ? data.reason : void 0;
	if (reason?.trim()) extra.reason = reason;
	return extra;
}
function logWs(direction, kind, meta) {
	if (!shouldLogSubsystemToConsole("gateway/ws")) return;
	const style = getGatewayWsLogStyle();
	if (!isVerbose()) {
		logWsOptimized(direction, kind, meta);
		return;
	}
	if (style === "compact" || style === "auto") {
		logWsCompact(direction, kind, meta);
		return;
	}
	const now = Date.now();
	const connId = typeof meta?.connId === "string" ? meta.connId : void 0;
	const id = typeof meta?.id === "string" ? meta.id : void 0;
	const method = typeof meta?.method === "string" ? meta.method : void 0;
	const ok = typeof meta?.ok === "boolean" ? meta.ok : void 0;
	const event = typeof meta?.event === "string" ? meta.event : void 0;
	const inflightKey = connId && id ? `${connId}:${id}` : void 0;
	if (direction === "in" && kind === "req" && inflightKey) wsInflightSince.set(inflightKey, now);
	const durationMs = direction === "out" && kind === "res" && inflightKey ? (() => {
		const startedAt = wsInflightSince.get(inflightKey);
		if (startedAt === void 0) return;
		wsInflightSince.delete(inflightKey);
		return now - startedAt;
	})() : void 0;
	const dirArrow = direction === "in" ? "←" : "→";
	const prefix = `${(direction === "in" ? chalk.greenBright : chalk.cyanBright)(dirArrow)} ${chalk.bold(kind)}`;
	const headline = (kind === "req" || kind === "res") && method ? chalk.bold(method) : kind === "event" && event ? chalk.bold(event) : void 0;
	const statusToken = kind === "res" && ok !== void 0 ? ok ? chalk.greenBright("✓") : chalk.redBright("✗") : void 0;
	const durationToken = typeof durationMs === "number" ? chalk.dim(`${durationMs}ms`) : void 0;
	const restMeta = [];
	if (meta) for (const [key, value] of Object.entries(meta)) {
		if (value === void 0) continue;
		if (key === "connId" || key === "id") continue;
		if (key === "method" || key === "ok") continue;
		if (key === "event") continue;
		restMeta.push(`${chalk.dim(key)}=${formatForLog(value)}`);
	}
	const trailing = [];
	if (connId) trailing.push(`${chalk.dim("conn")}=${chalk.gray(shortId(connId))}`);
	if (id) trailing.push(`${chalk.dim("id")}=${chalk.gray(shortId(id))}`);
	const tokens = [
		prefix,
		statusToken,
		headline,
		durationToken,
		...restMeta,
		...trailing
	].filter((t) => Boolean(t));
	wsLog.info(tokens.join(" "));
}
function logWsOptimized(direction, kind, meta) {
	const connId = typeof meta?.connId === "string" ? meta.connId : void 0;
	const id = typeof meta?.id === "string" ? meta.id : void 0;
	const ok = typeof meta?.ok === "boolean" ? meta.ok : void 0;
	const method = typeof meta?.method === "string" ? meta.method : void 0;
	const inflightKey = connId && id ? `${connId}:${id}` : void 0;
	if (direction === "in" && kind === "req" && inflightKey) {
		wsInflightOptimized.set(inflightKey, Date.now());
		if (wsInflightOptimized.size > 2e3) wsInflightOptimized.clear();
		return;
	}
	if (kind === "parse-error") {
		const errorMsg = typeof meta?.error === "string" ? formatForLog(meta.error) : void 0;
		wsLog.warn([
			`${chalk.redBright("✗")} ${chalk.bold("parse-error")}`,
			errorMsg ? `${chalk.dim("error")}=${errorMsg}` : void 0,
			`${chalk.dim("conn")}=${chalk.gray(shortId(connId ?? "?"))}`
		].filter((t) => Boolean(t)).join(" "));
		return;
	}
	if (direction !== "out" || kind !== "res") return;
	const startedAt = inflightKey ? wsInflightOptimized.get(inflightKey) : void 0;
	if (inflightKey) wsInflightOptimized.delete(inflightKey);
	const durationMs = typeof startedAt === "number" ? Date.now() - startedAt : void 0;
	if (!(ok === false || typeof durationMs === "number" && durationMs >= DEFAULT_WS_SLOW_MS)) return;
	const statusToken = ok === void 0 ? void 0 : ok ? chalk.greenBright("✓") : chalk.redBright("✗");
	const durationToken = typeof durationMs === "number" ? chalk.dim(`${durationMs}ms`) : void 0;
	const restMeta = [];
	if (meta) for (const [key, value] of Object.entries(meta)) {
		if (value === void 0) continue;
		if (key === "connId" || key === "id") continue;
		if (key === "method" || key === "ok") continue;
		restMeta.push(`${chalk.dim(key)}=${formatForLog(value)}`);
	}
	const tokens = [
		`${chalk.yellowBright("⇄")} ${chalk.bold("res")}`,
		statusToken,
		method ? chalk.bold(method) : void 0,
		durationToken,
		...restMeta,
		connId ? `${chalk.dim("conn")}=${chalk.gray(shortId(connId))}` : void 0,
		id ? `${chalk.dim("id")}=${chalk.gray(shortId(id))}` : void 0
	].filter((t) => Boolean(t));
	wsLog.info(tokens.join(" "));
}
function logWsCompact(direction, kind, meta) {
	const now = Date.now();
	const connId = typeof meta?.connId === "string" ? meta.connId : void 0;
	const id = typeof meta?.id === "string" ? meta.id : void 0;
	const method = typeof meta?.method === "string" ? meta.method : void 0;
	const ok = typeof meta?.ok === "boolean" ? meta.ok : void 0;
	const inflightKey = connId && id ? `${connId}:${id}` : void 0;
	if (kind === "req" && direction === "in" && inflightKey) {
		wsInflightCompact.set(inflightKey, {
			ts: now,
			method,
			meta
		});
		return;
	}
	const compactArrow = (() => {
		if (kind === "req" || kind === "res") return "⇄";
		return direction === "in" ? "←" : "→";
	})();
	const prefix = `${(kind === "req" || kind === "res" ? chalk.yellowBright : direction === "in" ? chalk.greenBright : chalk.cyanBright)(compactArrow)} ${chalk.bold(kind)}`;
	const statusToken = kind === "res" && ok !== void 0 ? ok ? chalk.greenBright("✓") : chalk.redBright("✗") : void 0;
	const startedAt = kind === "res" && direction === "out" && inflightKey ? wsInflightCompact.get(inflightKey)?.ts : void 0;
	if (kind === "res" && direction === "out" && inflightKey) wsInflightCompact.delete(inflightKey);
	const durationToken = typeof startedAt === "number" ? chalk.dim(`${now - startedAt}ms`) : void 0;
	const headline = (kind === "req" || kind === "res") && method ? chalk.bold(method) : kind === "event" && typeof meta?.event === "string" ? chalk.bold(meta.event) : void 0;
	const restMeta = [];
	if (meta) for (const [key, value] of Object.entries(meta)) {
		if (value === void 0) continue;
		if (key === "connId" || key === "id") continue;
		if (key === "method" || key === "ok") continue;
		if (key === "event") continue;
		restMeta.push(`${chalk.dim(key)}=${formatForLog(value)}`);
	}
	const trailing = [];
	if (connId && connId !== wsLastCompactConnId) {
		trailing.push(`${chalk.dim("conn")}=${chalk.gray(shortId(connId))}`);
		wsLastCompactConnId = connId;
	}
	if (id) trailing.push(`${chalk.dim("id")}=${chalk.gray(shortId(id))}`);
	const tokens = [
		prefix,
		statusToken,
		headline,
		durationToken,
		...restMeta,
		...trailing
	].filter((t) => Boolean(t));
	wsLog.info(tokens.join(" "));
}

//#endregion
export { setGatewayWsLogStyle as i, logWs as n, summarizeAgentEventForWsLog as r, formatForLog as t };