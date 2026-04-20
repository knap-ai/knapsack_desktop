import { i as normalizeLowercaseStringOrEmpty } from "./string-coerce-BUSzWgUA.js";
//#region src/infra/tls/fingerprint.ts
function normalizeFingerprint(input) {
	return normalizeLowercaseStringOrEmpty(input.trim().replace(/^sha-?256\s*:?\s*/i, "").replace(/[^a-fA-F0-9]/g, ""));
}
//#endregion
export { normalizeFingerprint as t };
