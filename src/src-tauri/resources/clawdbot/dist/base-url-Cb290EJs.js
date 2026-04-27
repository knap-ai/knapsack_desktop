import { c as normalizeOptionalString } from "./string-coerce-C1IzJjqi.js";
import "./text-runtime-B1c54bxG.js";
//#region extensions/openai/base-url.ts
function isOpenAIApiBaseUrl(baseUrl) {
	const trimmed = normalizeOptionalString(baseUrl);
	if (!trimmed) return false;
	return /^https?:\/\/api\.openai\.com(?:\/v1)?\/?$/i.test(trimmed);
}
function isOpenAICodexBaseUrl(baseUrl) {
	const trimmed = normalizeOptionalString(baseUrl);
	if (!trimmed) return false;
	return /^https?:\/\/chatgpt\.com\/backend-api(?:\/codex)?(?:\/v1)?\/?$/i.test(trimmed);
}
//#endregion
export { isOpenAICodexBaseUrl as n, isOpenAIApiBaseUrl as t };
