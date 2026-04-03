//#region src/shared/assistant-error-format.ts
const ERROR_PAYLOAD_PREFIX_RE = /^(?:error|(?:[a-z][\w-]*\s+)?api\s*error|apierror|openai\s*error|anthropic\s*error|gateway\s*error|codex\s*error)(?:\s+\d{3})?[:\s-]+/i;
const HTTP_STATUS_DELIMITER_RE = /(?:\s*:\s*|\s+)/;
const HTTP_STATUS_PREFIX_RE = new RegExp(`^(?:http\\s*)?(\\d{3})${HTTP_STATUS_DELIMITER_RE.source}(.+)$`, "i");
const HTTP_STATUS_CODE_PREFIX_RE = new RegExp(`^(?:http\\s*)?(\\d{3})(?:${HTTP_STATUS_DELIMITER_RE.source}([\\s\\S]+))?$`, "i");
const HTML_ERROR_PREFIX_RE = /^\s*(?:<!doctype\s+html\b|<html\b)/i;
const CLOUDFLARE_HTML_ERROR_CODES = new Set([
	521,
	522,
	523,
	524,
	525,
	526,
	530
]);
function isErrorPayloadObject(payload) {
	if (!payload || typeof payload !== "object" || Array.isArray(payload)) return false;
	const record = payload;
	if (record.type === "error") return true;
	if (typeof record.request_id === "string" || typeof record.requestId === "string") return true;
	if ("error" in record) {
		const err = record.error;
		if (err && typeof err === "object" && !Array.isArray(err)) {
			const errRecord = err;
			if (typeof errRecord.message === "string" || typeof errRecord.type === "string" || typeof errRecord.code === "string") return true;
		}
	}
	return false;
}
function parseApiErrorPayload(raw) {
	if (!raw) return null;
	const trimmed = raw.trim();
	if (!trimmed) return null;
	const candidates = [trimmed];
	if (ERROR_PAYLOAD_PREFIX_RE.test(trimmed)) candidates.push(trimmed.replace(ERROR_PAYLOAD_PREFIX_RE, "").trim());
	for (const candidate of candidates) {
		if (!candidate.startsWith("{") || !candidate.endsWith("}")) continue;
		try {
			const parsed = JSON.parse(candidate);
			if (isErrorPayloadObject(parsed)) return parsed;
		} catch {}
	}
	return null;
}
function extractLeadingHttpStatus(raw) {
	const match = raw.match(HTTP_STATUS_CODE_PREFIX_RE);
	if (!match) return null;
	const code = Number(match[1]);
	if (!Number.isFinite(code)) return null;
	return {
		code,
		rest: (match[2] ?? "").trim()
	};
}
function isCloudflareOrHtmlErrorPage(raw) {
	const trimmed = raw.trim();
	if (!trimmed) return false;
	const status = extractLeadingHttpStatus(trimmed);
	if (!status || status.code < 500) return false;
	if (CLOUDFLARE_HTML_ERROR_CODES.has(status.code)) return true;
	return status.code < 600 && HTML_ERROR_PREFIX_RE.test(status.rest) && /<\/html>/i.test(status.rest);
}
function parseApiErrorInfo(raw) {
	if (!raw) return null;
	const trimmed = raw.trim();
	if (!trimmed) return null;
	let httpCode;
	let candidate = trimmed;
	const httpPrefixMatch = candidate.match(/^(\d{3})\s+(.+)$/s);
	if (httpPrefixMatch) {
		httpCode = httpPrefixMatch[1];
		candidate = httpPrefixMatch[2].trim();
	}
	const payload = parseApiErrorPayload(candidate);
	if (!payload) return null;
	const requestId = typeof payload.request_id === "string" ? payload.request_id : typeof payload.requestId === "string" ? payload.requestId : void 0;
	const topType = typeof payload.type === "string" ? payload.type : void 0;
	const topMessage = typeof payload.message === "string" ? payload.message : void 0;
	let errType;
	let errMessage;
	if (payload.error && typeof payload.error === "object" && !Array.isArray(payload.error)) {
		const err = payload.error;
		if (typeof err.type === "string") errType = err.type;
		if (typeof err.code === "string" && !errType) errType = err.code;
		if (typeof err.message === "string") errMessage = err.message;
	}
	return {
		httpCode,
		type: errType ?? topType,
		message: errMessage ?? topMessage,
		requestId
	};
}
function formatRawAssistantErrorForUi(raw) {
	const trimmed = (raw ?? "").trim();
	if (!trimmed) return "LLM request failed with an unknown error.";
	const leadingStatus = extractLeadingHttpStatus(trimmed);
	if (leadingStatus && isCloudflareOrHtmlErrorPage(trimmed)) return `The AI service is temporarily unavailable (HTTP ${leadingStatus.code}). Please try again in a moment.`;
	const httpMatch = trimmed.match(HTTP_STATUS_PREFIX_RE);
	if (httpMatch) {
		const rest = httpMatch[2].trim();
		if (!rest.startsWith("{")) return `HTTP ${httpMatch[1]}: ${rest}`;
	}
	const info = parseApiErrorInfo(trimmed);
	if (info?.message) return `${info.httpCode ? `HTTP ${info.httpCode}` : "LLM error"}${info.type ? ` ${info.type}` : ""}: ${info.message}`;
	return trimmed.length > 600 ? `${trimmed.slice(0, 600)}…` : trimmed;
}
//#endregion
export { parseApiErrorPayload as a, parseApiErrorInfo as i, formatRawAssistantErrorForUi as n, isCloudflareOrHtmlErrorPage as r, extractLeadingHttpStatus as t };
