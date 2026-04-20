import { i as normalizeLowercaseStringOrEmpty, o as normalizeOptionalLowercaseString } from "./string-coerce-BUSzWgUA.js";
import { a as parseApiErrorPayload, i as parseApiErrorInfo, n as formatRawAssistantErrorForUi, r as isCloudflareOrHtmlErrorPage, t as extractLeadingHttpStatus } from "./assistant-error-format-tQ4SCN8S.js";
//#region src/agents/exec-approval-result.ts
const EXEC_DENIED_RE = /^exec denied \(([^)]*)\):(?:\s*([\s\S]*))?$/i;
const EXEC_FINISHED_RE = /^exec finished \(([^)]*)\)(?:\n([\s\S]*))?$/i;
const EXEC_COMPLETED_RE = /^exec completed:\s*([\s\S]*)$/i;
function parseExecApprovalResultText(resultText) {
	const raw = resultText.trim();
	if (!raw) return {
		kind: "other",
		raw
	};
	const deniedMatch = EXEC_DENIED_RE.exec(raw);
	if (deniedMatch) return {
		kind: "denied",
		raw,
		metadata: deniedMatch[1]?.trim() ?? "",
		body: deniedMatch[2]?.trim() ?? ""
	};
	const finishedMatch = EXEC_FINISHED_RE.exec(raw);
	if (finishedMatch) return {
		kind: "finished",
		raw,
		metadata: finishedMatch[1]?.trim() ?? "",
		body: finishedMatch[2]?.trim() ?? ""
	};
	const completedMatch = EXEC_COMPLETED_RE.exec(raw);
	if (completedMatch) return {
		kind: "completed",
		raw,
		body: completedMatch[1]?.trim() ?? ""
	};
	return {
		kind: "other",
		raw
	};
}
function isExecDeniedResultText(resultText) {
	return parseExecApprovalResultText(resultText).kind === "denied";
}
function formatExecDeniedUserMessage(resultText) {
	const parsed = parseExecApprovalResultText(resultText);
	if (parsed.kind !== "denied") return null;
	const metadata = normalizeLowercaseStringOrEmpty(parsed.metadata);
	if (metadata.includes("approval-timeout")) return "Command did not run: approval timed out.";
	if (metadata.includes("user-denied")) return "Command did not run: approval was denied.";
	if (metadata.includes("allowlist-miss")) return "Command did not run: approval is required.";
	if (metadata.includes("approval-request-failed")) return "Command did not run: approval request failed.";
	if (metadata.includes("spawn-failed") || metadata.includes("invoke-failed")) return "Command did not run.";
	return "Command did not run.";
}
//#endregion
//#region src/agents/pi-embedded-helpers/failover-matches.ts
const PERIODIC_USAGE_LIMIT_RE = /\b(?:daily|weekly|monthly)(?:\/(?:daily|weekly|monthly))* (?:usage )?limit(?:s)?(?: (?:exhausted|reached|exceeded))?\b/i;
const HIGH_CONFIDENCE_AUTH_PERMANENT_PATTERNS = [
	/api[_ ]?key[_ ]?(?:revoked|deactivated|deleted)/i,
	"key has been disabled",
	"key has been revoked",
	"account has been deactivated",
	"not allowed for this organization"
];
const AMBIGUOUS_AUTH_ERROR_PATTERNS = [
	/invalid[_ ]?api[_ ]?key/,
	/could not (?:authenticate|validate).*(?:api[_ ]?key|credentials)/i,
	"permission_error"
];
const COMMON_AUTH_ERROR_PATTERNS = [
	"incorrect api key",
	"invalid token",
	"authentication",
	"re-authenticate",
	"oauth token refresh failed",
	"unauthorized",
	"forbidden",
	"access denied",
	"insufficient permissions",
	"insufficient permission",
	/missing scopes?:/i,
	"expired",
	"token has expired",
	/\b401\b/,
	/\b403\b/,
	"no credentials found",
	"no api key found",
	/\bfailed to (?:extract|parse|validate|decode)\b.*\btoken\b/
];
const ZAI_BILLING_CODE_1311_RE = /"code"\s*:\s*1311\b/;
const ZAI_AUTH_ERROR_PATTERNS = [/"code"\s*:\s*1113\b/];
const ERROR_PATTERNS = {
	rateLimit: [
		/rate[_ ]limit|too many requests|429/,
		/too many (?:concurrent )?requests/i,
		/throttling(?:exception)?/i,
		"model_cooldown",
		"exceeded your current quota",
		"resource has been exhausted",
		"quota exceeded",
		"resource_exhausted",
		"throttlingexception",
		"throttling_exception",
		"throttled",
		"throttling",
		"usage limit",
		/\btpm\b/i,
		"tokens per minute",
		"tokens per day"
	],
	overloaded: [
		/overloaded_error|"type"\s*:\s*"overloaded_error"/i,
		"overloaded",
		/service[_ ]unavailable.*(?:overload|capacity|high[_ ]demand)|(?:overload|capacity|high[_ ]demand).*service[_ ]unavailable/i,
		"high demand"
	],
	serverError: [
		"an error occurred while processing",
		"internal server error",
		"internal_error",
		"server_error",
		"service temporarily unavailable",
		"service_unavailable",
		"bad gateway",
		"gateway timeout",
		"upstream error",
		"upstream connect error",
		"connection reset"
	],
	timeout: [
		"timeout",
		"timed out",
		"service unavailable",
		"deadline exceeded",
		"context deadline exceeded",
		"connection error",
		"network error",
		"network request failed",
		"fetch failed",
		"socket hang up",
		/\beconn(?:refused|reset|aborted)\b/i,
		/\benetunreach\b/i,
		/\behostunreach\b/i,
		/\behostdown\b/i,
		/\benetreset\b/i,
		/\betimedout\b/i,
		/\besockettimedout\b/i,
		/\bepipe\b/i,
		/\benotfound\b/i,
		/\beai_again\b/i,
		/without sending (?:any )?chunks?/i,
		/\bstop reason:\s*(?:abort|error|malformed_response|network_error)\b/i,
		/\breason:\s*(?:abort|error|malformed_response|network_error)\b/i,
		/\bunhandled stop reason:\s*(?:abort|error|malformed_response|network_error)\b/i,
		/\bfinish_reason:\s*(?:abort|error|malformed_response|network_error)\b/i,
		/\boperation was aborted\b/i,
		/\bstream (?:was )?(?:closed|aborted)\b/i
	],
	billing: [
		/["']?(?:status|code)["']?\s*[:=]\s*402\b|\bhttp\s*402\b|\berror(?:\s+code)?\s*[:=]?\s*402\b|\b(?:got|returned|received)\s+(?:a\s+)?402\b|^\s*402\s+payment/i,
		"payment required",
		"insufficient credits",
		/insufficient[_ ]quota/i,
		"credit balance",
		"plans & billing",
		"insufficient balance",
		"insufficient usd or diem balance",
		/requires?\s+more\s+credits/i,
		/out of extra usage/i,
		/draw from your extra usage/i,
		/extra usage is required(?: for long context requests)?/i,
		ZAI_BILLING_CODE_1311_RE
	],
	authPermanent: HIGH_CONFIDENCE_AUTH_PERMANENT_PATTERNS,
	auth: [
		...AMBIGUOUS_AUTH_ERROR_PATTERNS,
		...COMMON_AUTH_ERROR_PATTERNS,
		...ZAI_AUTH_ERROR_PATTERNS
	],
	format: [
		"string should match pattern",
		"tool_use.id",
		"tool_use_id",
		"messages.1.content.1.tool_use.id",
		"invalid request format",
		/tool call id was.*must be/i
	]
};
const BILLING_ERROR_HEAD_RE = /^(?:error[:\s-]+)?billing(?:\s+error)?(?:[:\s-]+|$)|^(?:error[:\s-]+)?(?:credit balance|insufficient credits?|payment required|http\s*402\b)/i;
const BILLING_ERROR_HARD_402_RE = /["']?(?:status|code)["']?\s*[:=]\s*402\b|\bhttp\s*402\b|\berror(?:\s+code)?\s*[:=]?\s*402\b|^\s*402\s+payment/i;
const BILLING_ERROR_MAX_LENGTH = 512;
function matchesErrorPatterns(raw, patterns) {
	if (!raw) return false;
	const value = normalizeLowercaseStringOrEmpty(raw);
	return patterns.some((pattern) => pattern instanceof RegExp ? pattern.test(value) : value.includes(pattern));
}
function matchesErrorPatternGroups(raw, groups) {
	return groups.some((patterns) => matchesErrorPatterns(raw, patterns));
}
function matchesFormatErrorPattern(raw) {
	return matchesErrorPatterns(raw, ERROR_PATTERNS.format);
}
function isRateLimitErrorMessage(raw) {
	return matchesErrorPatterns(raw, ERROR_PATTERNS.rateLimit);
}
function isTimeoutErrorMessage(raw) {
	return matchesErrorPatterns(raw, ERROR_PATTERNS.timeout);
}
function isPeriodicUsageLimitErrorMessage(raw) {
	return PERIODIC_USAGE_LIMIT_RE.test(raw);
}
function isBillingErrorMessage(raw) {
	const value = normalizeLowercaseStringOrEmpty(raw);
	if (!value) return false;
	if (raw.length > BILLING_ERROR_MAX_LENGTH) return BILLING_ERROR_HARD_402_RE.test(value) || ZAI_BILLING_CODE_1311_RE.test(value);
	if (matchesErrorPatterns(value, ERROR_PATTERNS.billing)) return true;
	if (!BILLING_ERROR_HEAD_RE.test(raw)) return false;
	return value.includes("upgrade") || value.includes("credits") || value.includes("payment") || value.includes("plan");
}
function isAuthPermanentErrorMessage(raw) {
	return matchesErrorPatternGroups(raw, [HIGH_CONFIDENCE_AUTH_PERMANENT_PATTERNS]);
}
function isAuthErrorMessage(raw) {
	return matchesErrorPatternGroups(raw, [
		AMBIGUOUS_AUTH_ERROR_PATTERNS,
		COMMON_AUTH_ERROR_PATTERNS,
		ZAI_AUTH_ERROR_PATTERNS
	]);
}
function isOverloadedErrorMessage(raw) {
	return matchesErrorPatterns(raw, ERROR_PATTERNS.overloaded);
}
function isServerErrorMessage(raw) {
	return matchesErrorPatterns(raw, ERROR_PATTERNS.serverError);
}
//#endregion
//#region src/agents/internal-runtime-context.ts
const INTERNAL_RUNTIME_CONTEXT_BEGIN = "<<<BEGIN_OPENCLAW_INTERNAL_CONTEXT>>>";
const INTERNAL_RUNTIME_CONTEXT_END = "<<<END_OPENCLAW_INTERNAL_CONTEXT>>>";
const ESCAPED_INTERNAL_RUNTIME_CONTEXT_BEGIN = "[[OPENCLAW_INTERNAL_CONTEXT_BEGIN]]";
const ESCAPED_INTERNAL_RUNTIME_CONTEXT_END = "[[OPENCLAW_INTERNAL_CONTEXT_END]]";
const LEGACY_INTERNAL_CONTEXT_HEADER = [
	"OpenClaw runtime context (internal):",
	"This context is runtime-generated, not user-authored. Keep internal details private.",
	""
].join("\n") + "\n";
const LEGACY_INTERNAL_EVENT_MARKER = "[Internal task completion event]";
const LEGACY_INTERNAL_EVENT_SEPARATOR = "\n\n---\n\n";
const LEGACY_UNTRUSTED_RESULT_BEGIN = "<<<BEGIN_UNTRUSTED_CHILD_RESULT>>>";
const LEGACY_UNTRUSTED_RESULT_END = "<<<END_UNTRUSTED_CHILD_RESULT>>>";
function escapeInternalRuntimeContextDelimiters(value) {
	return value.replaceAll(INTERNAL_RUNTIME_CONTEXT_BEGIN, ESCAPED_INTERNAL_RUNTIME_CONTEXT_BEGIN).replaceAll(INTERNAL_RUNTIME_CONTEXT_END, ESCAPED_INTERNAL_RUNTIME_CONTEXT_END);
}
function escapeRegExp(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function findDelimitedTokenIndex(text, token, from) {
	const tokenRe = new RegExp(`(?:^|\\r?\\n)${escapeRegExp(token)}(?=\\r?\\n|$)`, "g");
	tokenRe.lastIndex = Math.max(0, from);
	const match = tokenRe.exec(text);
	if (!match) return -1;
	const prefixLength = match[0].length - token.length;
	return match.index + prefixLength;
}
function stripDelimitedBlock(text, begin, end) {
	let next = text;
	for (;;) {
		const start = findDelimitedTokenIndex(next, begin, 0);
		if (start === -1) return next;
		let cursor = start + begin.length;
		let depth = 1;
		let finish = -1;
		while (depth > 0) {
			const nextBegin = findDelimitedTokenIndex(next, begin, cursor);
			const nextEnd = findDelimitedTokenIndex(next, end, cursor);
			if (nextEnd === -1) break;
			if (nextBegin !== -1 && nextBegin < nextEnd) {
				depth += 1;
				cursor = nextBegin + begin.length;
				continue;
			}
			depth -= 1;
			finish = nextEnd;
			cursor = nextEnd + end.length;
		}
		const before = next.slice(0, start).trimEnd();
		if (finish === -1 || depth !== 0) return before;
		const after = next.slice(finish + end.length).trimStart();
		next = before && after ? `${before}\n\n${after}` : `${before}${after}`;
	}
}
function findLegacyInternalEventEnd(text, start) {
	if (!text.startsWith(LEGACY_INTERNAL_EVENT_MARKER, start)) return null;
	const resultBegin = text.indexOf(LEGACY_UNTRUSTED_RESULT_BEGIN, start + 32);
	if (resultBegin === -1) return null;
	const resultEnd = text.indexOf(LEGACY_UNTRUSTED_RESULT_END, resultBegin + 34);
	if (resultEnd === -1) return null;
	const actionIndex = text.indexOf("\n\nAction:\n", resultEnd + 32);
	if (actionIndex === -1) return null;
	const afterAction = actionIndex + 10;
	const nextEvent = text.indexOf(`${LEGACY_INTERNAL_EVENT_SEPARATOR}${LEGACY_INTERNAL_EVENT_MARKER}`, afterAction);
	if (nextEvent !== -1) return nextEvent;
	const nextParagraph = text.indexOf("\n\n", afterAction);
	return nextParagraph === -1 ? text.length : nextParagraph;
}
function stripLegacyInternalRuntimeContext(text) {
	let next = text;
	let searchFrom = 0;
	for (;;) {
		const headerStart = next.indexOf(LEGACY_INTERNAL_CONTEXT_HEADER, searchFrom);
		if (headerStart === -1) return next;
		const eventStart = headerStart + LEGACY_INTERNAL_CONTEXT_HEADER.length;
		if (!next.startsWith(LEGACY_INTERNAL_EVENT_MARKER, eventStart)) {
			searchFrom = eventStart;
			continue;
		}
		let blockEnd = findLegacyInternalEventEnd(next, eventStart);
		if (blockEnd == null) {
			const nextParagraph = next.indexOf("\n\n", eventStart + 32);
			blockEnd = nextParagraph === -1 ? next.length : nextParagraph;
		} else while (next.startsWith(`${LEGACY_INTERNAL_EVENT_SEPARATOR}${LEGACY_INTERNAL_EVENT_MARKER}`, blockEnd)) {
			const nextEventStart = blockEnd + 7;
			const nextEventEnd = findLegacyInternalEventEnd(next, nextEventStart);
			if (nextEventEnd == null) break;
			blockEnd = nextEventEnd;
		}
		const before = next.slice(0, headerStart).trimEnd();
		const after = next.slice(blockEnd).trimStart();
		next = before && after ? `${before}\n\n${after}` : `${before}${after}`;
		searchFrom = Math.max(0, before.length - 1);
	}
}
function stripInternalRuntimeContext(text) {
	if (!text) return text;
	return stripLegacyInternalRuntimeContext(stripDelimitedBlock(text, INTERNAL_RUNTIME_CONTEXT_BEGIN, INTERNAL_RUNTIME_CONTEXT_END));
}
function hasInternalRuntimeContext(text) {
	if (!text) return false;
	return findDelimitedTokenIndex(text, "<<<BEGIN_OPENCLAW_INTERNAL_CONTEXT>>>", 0) !== -1 || text.includes(LEGACY_INTERNAL_CONTEXT_HEADER);
}
//#endregion
//#region src/agents/stable-stringify.ts
function stableStringify(value) {
	if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "null";
	if (Array.isArray(value)) return `[${value.map((entry) => stableStringify(entry)).join(",")}]`;
	const record = value;
	return `{${Object.keys(record).toSorted().map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`).join(",")}}`;
}
//#endregion
//#region src/agents/pi-embedded-helpers/sanitize-user-facing-text.ts
function formatBillingErrorMessage(provider, model) {
	const providerName = provider?.trim();
	const modelName = model?.trim();
	const providerLabel = providerName && modelName ? `${providerName} (${modelName})` : providerName || void 0;
	if (providerLabel) return `⚠️ ${providerLabel} returned a billing error — your API key has run out of credits or has an insufficient balance. Check your ${providerName} billing dashboard and top up or switch to a different API key.`;
	return "⚠️ API provider returned a billing error — your API key has run out of credits or has an insufficient balance. Check your provider's billing dashboard and top up or switch to a different API key.";
}
const BILLING_ERROR_USER_MESSAGE = formatBillingErrorMessage();
const RATE_LIMIT_ERROR_USER_MESSAGE = "⚠️ API rate limit reached. Please try again later.";
const OVERLOADED_ERROR_USER_MESSAGE = "The AI service is temporarily overloaded. Please try again in a moment.";
const FINAL_TAG_RE = /<\s*\/?\s*final\s*>/gi;
const ERROR_PREFIX_RE = /^(?:error|(?:[a-z][\w-]*\s+)?api\s*error|openai\s*error|anthropic\s*error|gateway\s*error|codex\s*error|request failed|failed|exception)(?:\s+\d{3})?[:\s-]+/i;
const CONTEXT_OVERFLOW_ERROR_HEAD_RE = /^(?:context overflow:|request_too_large\b|request size exceeds\b|request exceeds the maximum size\b|context length exceeded\b|maximum context length\b|prompt is too long\b|exceeds model context window\b)/i;
const HTTP_ERROR_HINTS = [
	"error",
	"bad request",
	"not found",
	"unauthorized",
	"forbidden",
	"internal server",
	"service unavailable",
	"gateway",
	"rate limit",
	"overloaded",
	"timeout",
	"timed out",
	"invalid",
	"too many requests",
	"permission"
];
const RATE_LIMIT_SPECIFIC_HINT_RE = /\bmin(ute)?s?\b|\bhours?\b|\bseconds?\b|\btry again in\b|\breset\b|\bplan\b|\bquota\b/i;
const NON_ERROR_PROVIDER_PAYLOAD_MAX_LENGTH = 16384;
const NON_ERROR_PROVIDER_PAYLOAD_PREFIX_RE = /^codex\s*error(?:\s+\d{3})?[:\s-]+/i;
function extractProviderRateLimitMessage(raw) {
	const withoutPrefix = raw.replace(ERROR_PREFIX_RE, "").trim();
	const candidate = (parseApiErrorInfo(raw) ?? parseApiErrorInfo(withoutPrefix))?.message ?? (extractLeadingHttpStatus(withoutPrefix)?.rest || withoutPrefix);
	if (!candidate || !RATE_LIMIT_SPECIFIC_HINT_RE.test(candidate)) return;
	if (isCloudflareOrHtmlErrorPage(withoutPrefix)) return;
	const trimmed = candidate.trim();
	if (trimmed.length > 300 || trimmed.startsWith("{") || /^(?:<!doctype\s+html\b|<html\b)/i.test(trimmed)) return;
	return `⚠️ ${trimmed}`;
}
function formatRateLimitOrOverloadedErrorCopy(raw) {
	if (isRateLimitErrorMessage(raw)) return extractProviderRateLimitMessage(raw) ?? RATE_LIMIT_ERROR_USER_MESSAGE;
	if (isOverloadedErrorMessage(raw)) return OVERLOADED_ERROR_USER_MESSAGE;
}
function formatTransportErrorCopy(raw) {
	if (!raw) return;
	if (isCloudflareOrHtmlErrorPage(raw)) return;
	const lower = normalizeLowercaseStringOrEmpty(raw);
	if (/\beconnrefused\b/i.test(raw) || lower.includes("connection refused") || lower.includes("actively refused")) return "LLM request failed: connection refused by the provider endpoint.";
	if (/\beconnreset\b|\beconnaborted\b|\benetreset\b|\bepipe\b/i.test(raw) || lower.includes("socket hang up") || lower.includes("connection reset") || lower.includes("connection aborted")) return "LLM request failed: network connection was interrupted.";
	if (/\benotfound\b|\beai_again\b/i.test(raw) || lower.includes("getaddrinfo") || lower.includes("no such host") || lower.includes("dns")) return "LLM request failed: DNS lookup for the provider endpoint failed.";
	if (/\benetunreach\b|\behostunreach\b|\behostdown\b/i.test(raw) || lower.includes("network is unreachable") || lower.includes("host is unreachable")) return "LLM request failed: the provider endpoint is unreachable from this host.";
	if (lower.includes("fetch failed") || lower.includes("connection error") || lower.includes("network request failed")) return "LLM request failed: network connection error.";
}
function formatDiskSpaceErrorCopy(raw) {
	if (!raw) return;
	const lower = normalizeLowercaseStringOrEmpty(raw);
	if (/\benospc\b/i.test(raw) || lower.includes("no space left on device") || lower.includes("disk full")) return "OpenClaw could not write local session data because the disk is full. Free some disk space and try again.";
}
function isReasoningConstraintErrorMessage(raw) {
	if (!raw) return false;
	const lower = normalizeLowercaseStringOrEmpty(raw);
	return lower.includes("reasoning is mandatory") || lower.includes("reasoning is required") || lower.includes("requires reasoning") || lower.includes("reasoning") && lower.includes("cannot be disabled");
}
function isInvalidStreamingEventOrderError(raw) {
	if (!raw) return false;
	const lower = normalizeLowercaseStringOrEmpty(raw);
	return lower.includes("unexpected event order") && lower.includes("message_start") && lower.includes("message_stop");
}
function hasRateLimitTpmHint(raw) {
	const lower = normalizeLowercaseStringOrEmpty(raw);
	return /\btpm\b/i.test(lower) || lower.includes("tokens per minute");
}
function looksLikeGenericContextOverflowError(raw) {
	if (!raw) return false;
	const lower = normalizeLowercaseStringOrEmpty(raw);
	const hasRequestSizeExceeds = lower.includes("request size exceeds");
	const hasContextWindow = lower.includes("context window") || lower.includes("context length") || lower.includes("maximum context length");
	return lower.includes("request_too_large") || lower.includes("invalid_argument") && lower.includes("maximum number of tokens") || lower.includes("request exceeds the maximum size") || lower.includes("context length exceeded") || lower.includes("maximum context length") || lower.includes("prompt is too long") || lower.includes("prompt too long") || lower.includes("exceeds model context window") || lower.includes("model token limit") || lower.includes("input exceeds") && lower.includes("maximum number of tokens") || hasRequestSizeExceeds && hasContextWindow || lower.includes("context overflow:") || lower.includes("exceed context limit") || lower.includes("exceeds the model's maximum context") || lower.includes("max_tokens") && lower.includes("exceed") && lower.includes("context") || lower.includes("input length") && lower.includes("exceed") && lower.includes("context") || lower.includes("413") && lower.includes("too large") || lower.includes("context_window_exceeded") || raw.includes("上下文过长") || raw.includes("上下文超出") || raw.includes("上下文长度超") || raw.includes("超出最大上下文") || raw.includes("请压缩上下文");
}
function shouldRewriteContextOverflowText(raw) {
	if (hasRateLimitTpmHint(raw) || isReasoningConstraintErrorMessage(raw)) return false;
	if (!looksLikeGenericContextOverflowError(raw)) return false;
	return isRawApiErrorPayload(raw) || isLikelyHttpErrorText(raw) || ERROR_PREFIX_RE.test(raw) || CONTEXT_OVERFLOW_ERROR_HEAD_RE.test(raw);
}
function getApiErrorPayloadFingerprint(raw) {
	if (!raw) return null;
	const payload = parseApiErrorPayload(raw);
	if (!payload) return null;
	return stableStringify(payload);
}
function isRawApiErrorPayload(raw) {
	return getApiErrorPayloadFingerprint(raw) !== null;
}
function isLikelyProviderErrorType(type) {
	const normalized = normalizeOptionalLowercaseString(type);
	if (!normalized) return false;
	return normalized.endsWith("_error");
}
function shouldRewriteRawPayloadWithoutErrorContext(raw) {
	if (raw.length > NON_ERROR_PROVIDER_PAYLOAD_MAX_LENGTH) return false;
	if (!NON_ERROR_PROVIDER_PAYLOAD_PREFIX_RE.test(raw)) return false;
	const info = parseApiErrorInfo(raw);
	if (!info) return false;
	if (isLikelyProviderErrorType(info.type)) return true;
	if (info.httpCode) {
		const parsedCode = Number(info.httpCode);
		if (Number.isFinite(parsedCode) && parsedCode >= 400) return true;
	}
	return false;
}
function coerceText(value) {
	if (typeof value === "string") return value;
	if (value == null) return "";
	if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint" || typeof value === "symbol") return String(value);
	if (typeof value === "object") try {
		return JSON.stringify(value) ?? "";
	} catch {
		return "";
	}
	return "";
}
function stripFinalTagsFromText(text) {
	const normalized = coerceText(text);
	if (!normalized) return normalized;
	return normalized.replace(FINAL_TAG_RE, "");
}
function collapseConsecutiveDuplicateBlocks(text) {
	const trimmed = text.trim();
	if (!trimmed) return text;
	const blocks = trimmed.split(/\n{2,}/);
	if (blocks.length < 2) return text;
	const normalizeBlock = (value) => value.trim().replace(/\s+/g, " ");
	const result = [];
	let lastNormalized = null;
	for (const block of blocks) {
		const normalized = normalizeBlock(block);
		if (lastNormalized && normalized === lastNormalized) continue;
		result.push(block.trim());
		lastNormalized = normalized;
	}
	if (result.length === blocks.length) return text;
	return result.join("\n\n");
}
function isLikelyHttpErrorText(raw) {
	if (isCloudflareOrHtmlErrorPage(raw)) return true;
	const status = extractLeadingHttpStatus(raw);
	if (!status) return false;
	if (status.code < 400) return false;
	const message = normalizeLowercaseStringOrEmpty(status.rest);
	return HTTP_ERROR_HINTS.some((hint) => message.includes(hint));
}
function sanitizeUserFacingText(text, opts) {
	const raw = coerceText(text);
	if (!raw) return raw;
	const errorContext = opts?.errorContext ?? false;
	const stripped = stripInternalRuntimeContext(stripFinalTagsFromText(raw));
	const trimmed = stripped.trim();
	if (!trimmed) return "";
	if (!errorContext && shouldRewriteRawPayloadWithoutErrorContext(trimmed)) return formatRawAssistantErrorForUi(trimmed);
	if (errorContext) {
		const execDeniedMessage = formatExecDeniedUserMessage(trimmed);
		if (execDeniedMessage) return execDeniedMessage;
		const diskSpaceCopy = formatDiskSpaceErrorCopy(trimmed);
		if (diskSpaceCopy) return diskSpaceCopy;
		if (/incorrect role information|roles must alternate/i.test(trimmed)) return "Message ordering conflict - please try again. If this persists, use /new to start a fresh session.";
		if (shouldRewriteContextOverflowText(trimmed)) return "Context overflow: prompt too large for the model. Try /reset (or /new) to start a fresh session, or use a larger-context model.";
		if (isBillingErrorMessage(trimmed)) return BILLING_ERROR_USER_MESSAGE;
		if (isInvalidStreamingEventOrderError(trimmed)) return "LLM request failed: provider returned an invalid streaming response. Please try again.";
		if (isRawApiErrorPayload(trimmed) || isLikelyHttpErrorText(trimmed)) return formatRawAssistantErrorForUi(trimmed);
		if (ERROR_PREFIX_RE.test(trimmed)) {
			const prefixedCopy = formatRateLimitOrOverloadedErrorCopy(trimmed);
			if (prefixedCopy) return prefixedCopy;
			const transportCopy = formatTransportErrorCopy(trimmed);
			if (transportCopy) return transportCopy;
			if (isTimeoutErrorMessage(trimmed)) return "LLM request timed out.";
			return formatRawAssistantErrorForUi(trimmed);
		}
	}
	return collapseConsecutiveDuplicateBlocks(stripped.replace(/^(?:[ \t]*\r?\n)+/, ""));
}
//#endregion
export { isTimeoutErrorMessage as C, parseExecApprovalResultText as D, isExecDeniedResultText as E, isServerErrorMessage as S, formatExecDeniedUserMessage as T, isAuthPermanentErrorMessage as _, formatTransportErrorCopy as a, isPeriodicUsageLimitErrorMessage as b, isLikelyHttpErrorText as c, stableStringify as d, INTERNAL_RUNTIME_CONTEXT_BEGIN as f, isAuthErrorMessage as g, hasInternalRuntimeContext as h, formatRateLimitOrOverloadedErrorCopy as i, isRawApiErrorPayload as l, escapeInternalRuntimeContextDelimiters as m, formatBillingErrorMessage as n, getApiErrorPayloadFingerprint as o, INTERNAL_RUNTIME_CONTEXT_END as p, formatDiskSpaceErrorCopy as r, isInvalidStreamingEventOrderError as s, BILLING_ERROR_USER_MESSAGE as t, sanitizeUserFacingText as u, isBillingErrorMessage as v, matchesFormatErrorPattern as w, isRateLimitErrorMessage as x, isOverloadedErrorMessage as y };
