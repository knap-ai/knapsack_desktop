//#region extensions/openai/shared.ts
const OPENAI_API_BASE_URL = "https://api.openai.com/v1";
function matchesExactOrPrefix(id, values) {
	const normalizedId = id.trim().toLowerCase();
	return values.some((value) => {
		const normalizedValue = value.trim().toLowerCase();
		return normalizedId === normalizedValue || normalizedId.startsWith(normalizedValue);
	});
}
function isOpenAIApiBaseUrl(baseUrl) {
	const trimmed = baseUrl?.trim();
	if (!trimmed) return false;
	return /^https?:\/\/api\.openai\.com(?:\/v1)?\/?$/i.test(trimmed);
}
//#endregion
export { isOpenAIApiBaseUrl as n, matchesExactOrPrefix as r, OPENAI_API_BASE_URL as t };
