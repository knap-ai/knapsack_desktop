//#region src/shared/net/redact-sensitive-url.ts
const SENSITIVE_URL_HINT_TAG = "url-secret";
const SENSITIVE_URL_QUERY_PARAM_NAMES = new Set([
	"token",
	"key",
	"api_key",
	"apikey",
	"secret",
	"access_token",
	"password",
	"pass",
	"auth",
	"client_secret",
	"refresh_token"
]);
function isSensitiveUrlQueryParamName(name) {
	return SENSITIVE_URL_QUERY_PARAM_NAMES.has(name.toLowerCase());
}
function isSensitiveUrlConfigPath(path) {
	if (path.endsWith(".baseUrl") || path.endsWith(".httpUrl")) return true;
	return /^mcp\.servers\.(?:\*|[^.]+)\.url$/.test(path);
}
function hasSensitiveUrlHintTag(hint) {
	return hint?.tags?.includes(SENSITIVE_URL_HINT_TAG) === true;
}
function redactSensitiveUrl(value) {
	try {
		const parsed = new URL(value);
		let mutated = false;
		if (parsed.username || parsed.password) {
			parsed.username = parsed.username ? "***" : "";
			parsed.password = parsed.password ? "***" : "";
			mutated = true;
		}
		for (const key of Array.from(parsed.searchParams.keys())) if (isSensitiveUrlQueryParamName(key)) {
			parsed.searchParams.set(key, "***");
			mutated = true;
		}
		return mutated ? parsed.toString() : value;
	} catch {
		return value;
	}
}
function redactSensitiveUrlLikeString(value) {
	const redactedUrl = redactSensitiveUrl(value);
	if (redactedUrl !== value) return redactedUrl;
	return value.replace(/\/\/([^@/?#]+)@/, "//***:***@").replace(/([?&])([^=&]+)=([^&]*)/g, (match, prefix, key) => isSensitiveUrlQueryParamName(key) ? `${prefix}${key}=***` : match);
}
//#endregion
export { redactSensitiveUrlLikeString as a, redactSensitiveUrl as i, hasSensitiveUrlHintTag as n, isSensitiveUrlConfigPath as r, SENSITIVE_URL_HINT_TAG as t };
