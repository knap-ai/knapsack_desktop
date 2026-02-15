//#region src/infra/errors.ts
function extractErrorCode(err) {
	if (!err || typeof err !== "object") return;
	const code = err.code;
	if (typeof code === "string") return code;
	if (typeof code === "number") return String(code);
}
/**
* Type guard for NodeJS.ErrnoException (any error with a `code` property).
*/
function isErrno(err) {
	return Boolean(err && typeof err === "object" && "code" in err);
}
/**
* Check if an error has a specific errno code.
*/
function hasErrnoCode(err, code) {
	return isErrno(err) && err.code === code;
}
function formatErrorMessage(err) {
	if (err instanceof Error) return err.message || err.name || "Error";
	if (typeof err === "string") return err;
	if (typeof err === "number" || typeof err === "boolean" || typeof err === "bigint") return String(err);
	try {
		return JSON.stringify(err);
	} catch {
		return Object.prototype.toString.call(err);
	}
}
function formatUncaughtError(err) {
	if (extractErrorCode(err) === "INVALID_CONFIG") return formatErrorMessage(err);
	if (err instanceof Error) return err.stack ?? err.message ?? err.name;
	return formatErrorMessage(err);
}

//#endregion
export { isErrno as a, hasErrnoCode as i, formatErrorMessage as n, formatUncaughtError as r, extractErrorCode as t };