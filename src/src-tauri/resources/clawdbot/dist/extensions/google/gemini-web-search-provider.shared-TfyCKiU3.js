function isRecord(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
function trimToUndefined(value) {
	return typeof value === "string" && value.trim().length > 0 ? value.trim() : void 0;
}
function resolveGeminiConfig(searchConfig) {
	const gemini = searchConfig?.gemini;
	return isRecord(gemini) ? gemini : {};
}
function resolveGeminiModel(gemini) {
	return trimToUndefined(gemini?.model) ?? "gemini-2.5-flash";
}
//#endregion
export { resolveGeminiModel as n, resolveGeminiConfig as t };
