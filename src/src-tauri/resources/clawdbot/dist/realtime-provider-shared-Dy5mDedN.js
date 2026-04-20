import { s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import "./text-runtime-DTMxvodz.js";
//#region extensions/openai/realtime-provider-shared.ts
const trimToUndefined = normalizeOptionalString;
function asFiniteNumber(value) {
	return typeof value === "number" && Number.isFinite(value) ? value : void 0;
}
function asObjectRecord(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value) ? value : void 0;
}
function readRealtimeErrorDetail(error) {
	if (typeof error === "string" && error) return error;
	const message = asObjectRecord(error)?.message;
	if (typeof message === "string" && message) return message;
	return "Unknown error";
}
function resolveOpenAIProviderConfigRecord(config) {
	return asObjectRecord(asObjectRecord(config.providers)?.openai) ?? asObjectRecord(config.openai) ?? asObjectRecord(config);
}
//#endregion
export { trimToUndefined as a, resolveOpenAIProviderConfigRecord as i, asObjectRecord as n, readRealtimeErrorDetail as r, asFiniteNumber as t };
