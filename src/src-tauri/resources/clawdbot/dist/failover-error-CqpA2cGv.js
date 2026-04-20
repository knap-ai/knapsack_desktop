import { c as readErrorName } from "./errors-D8p6rxH8.js";
import { C as isTimeoutErrorMessage } from "./sanitize-user-facing-text-CQF1CTnZ.js";
import { n as classifyFailoverSignal } from "./errors-CJULmF31.js";
//#region src/agents/failover-error.ts
const ABORT_TIMEOUT_RE = /request was aborted|request aborted/i;
var FailoverError = class extends Error {
	constructor(message, params) {
		super(message, { cause: params.cause });
		this.name = "FailoverError";
		this.reason = params.reason;
		this.provider = params.provider;
		this.model = params.model;
		this.profileId = params.profileId;
		this.status = params.status;
		this.code = params.code;
	}
};
function isFailoverError(err) {
	if (err instanceof FailoverError) return true;
	return Boolean(err && typeof err === "object" && err.name === "FailoverError" && typeof err.reason === "string");
}
function resolveFailoverStatus(reason) {
	switch (reason) {
		case "billing": return 402;
		case "rate_limit": return 429;
		case "overloaded": return 503;
		case "auth": return 401;
		case "auth_permanent": return 403;
		case "timeout": return 408;
		case "format": return 400;
		case "model_not_found": return 404;
		case "session_expired": return 410;
		default: return;
	}
}
function findErrorProperty(err, reader, seen = /* @__PURE__ */ new Set()) {
	const direct = reader(err);
	if (direct !== void 0) return direct;
	if (!err || typeof err !== "object") return;
	if (seen.has(err)) return;
	seen.add(err);
	const candidate = err;
	return findErrorProperty(candidate.error, reader, seen) ?? findErrorProperty(candidate.cause, reader, seen);
}
function readDirectStatusCode(err) {
	if (!err || typeof err !== "object") return;
	const candidate = err.status ?? err.statusCode;
	if (typeof candidate === "number") return candidate;
	if (typeof candidate === "string" && /^\d+$/.test(candidate)) return Number(candidate);
}
function getStatusCode(err) {
	return findErrorProperty(err, readDirectStatusCode);
}
function readDirectErrorCode(err) {
	if (!err || typeof err !== "object") return;
	const directCode = err.code;
	if (typeof directCode === "string") {
		const trimmed = directCode.trim();
		return trimmed ? trimmed : void 0;
	}
	const status = err.status;
	if (typeof status !== "string" || /^\d+$/.test(status)) return;
	const trimmed = status.trim();
	return trimmed ? trimmed : void 0;
}
function getErrorCode(err) {
	return findErrorProperty(err, readDirectErrorCode);
}
function readDirectProvider(err) {
	if (!err || typeof err !== "object") return;
	const provider = err.provider;
	if (typeof provider !== "string") return;
	return provider.trim() || void 0;
}
function getProvider(err) {
	return findErrorProperty(err, readDirectProvider);
}
function readDirectErrorMessage(err) {
	if (err instanceof Error) return err.message || void 0;
	if (typeof err === "string") return err || void 0;
	if (typeof err === "number" || typeof err === "boolean" || typeof err === "bigint") return String(err);
	if (typeof err === "symbol") return err.description ?? void 0;
	if (err && typeof err === "object") {
		const message = err.message;
		if (typeof message === "string") return message || void 0;
	}
}
function getErrorMessage(err) {
	return findErrorProperty(err, readDirectErrorMessage) ?? "";
}
function getErrorCause(err) {
	if (!err || typeof err !== "object" || !("cause" in err)) return;
	return err.cause;
}
function hasTimeoutHint(err) {
	if (!err) return false;
	if (readErrorName(err) === "TimeoutError") return true;
	const message = getErrorMessage(err);
	return Boolean(message && isTimeoutErrorMessage(message));
}
function isTimeoutError(err) {
	if (hasTimeoutHint(err)) return true;
	if (!err || typeof err !== "object") return false;
	if (readErrorName(err) !== "AbortError") return false;
	const message = getErrorMessage(err);
	if (message && ABORT_TIMEOUT_RE.test(message)) return true;
	const cause = "cause" in err ? err.cause : void 0;
	const reason = "reason" in err ? err.reason : void 0;
	return hasTimeoutHint(cause) || hasTimeoutHint(reason);
}
function failoverReasonFromClassification(classification) {
	return classification?.kind === "reason" ? classification.reason : null;
}
function normalizeErrorSignal(err) {
	const message = getErrorMessage(err);
	return {
		status: getStatusCode(err),
		code: getErrorCode(err),
		message: message || void 0,
		provider: getProvider(err)
	};
}
function resolveFailoverClassificationFromError(err) {
	if (isFailoverError(err)) return {
		kind: "reason",
		reason: err.reason
	};
	const classification = classifyFailoverSignal(normalizeErrorSignal(err));
	if (!classification || classification.kind === "context_overflow") {
		const cause = getErrorCause(err);
		if (cause && cause !== err) {
			const causeClassification = resolveFailoverClassificationFromError(cause);
			if (causeClassification) return causeClassification;
		}
	}
	if (classification) return classification;
	if (isTimeoutError(err)) return {
		kind: "reason",
		reason: "timeout"
	};
	return null;
}
function resolveFailoverReasonFromError(err) {
	return failoverReasonFromClassification(resolveFailoverClassificationFromError(err));
}
function describeFailoverError(err) {
	if (isFailoverError(err)) return {
		message: err.message,
		reason: err.reason,
		status: err.status,
		code: err.code
	};
	const signal = normalizeErrorSignal(err);
	return {
		message: signal.message ?? String(err),
		reason: resolveFailoverReasonFromError(err) ?? void 0,
		status: signal.status,
		code: signal.code
	};
}
function coerceToFailoverError(err, context) {
	if (isFailoverError(err)) return err;
	const reason = resolveFailoverReasonFromError(err);
	if (!reason) return null;
	const signal = normalizeErrorSignal(err);
	const message = signal.message ?? String(err);
	const status = signal.status ?? resolveFailoverStatus(reason);
	const code = signal.code;
	return new FailoverError(message, {
		reason,
		provider: context?.provider,
		model: context?.model,
		profileId: context?.profileId,
		status,
		code,
		cause: err instanceof Error ? err : void 0
	});
}
//#endregion
export { isTimeoutError as a, isFailoverError as i, coerceToFailoverError as n, resolveFailoverReasonFromError as o, describeFailoverError as r, resolveFailoverStatus as s, FailoverError as t };
