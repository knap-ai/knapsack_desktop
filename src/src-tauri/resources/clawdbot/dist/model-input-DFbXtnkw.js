import { f as resolvePrimaryStringValue, s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
//#region src/config/model-input.ts
function resolveAgentModelPrimaryValue(model) {
	return resolvePrimaryStringValue(model);
}
function resolveAgentModelFallbackValues(model) {
	if (!model || typeof model !== "object") return [];
	return Array.isArray(model.fallbacks) ? model.fallbacks : [];
}
function toAgentModelListLike(model) {
	if (typeof model === "string") {
		const primary = normalizeOptionalString(model);
		return primary ? { primary } : void 0;
	}
	if (!model || typeof model !== "object") return;
	return model;
}
//#endregion
export { resolveAgentModelPrimaryValue as n, toAgentModelListLike as r, resolveAgentModelFallbackValues as t };
