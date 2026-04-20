import { i as normalizeLowercaseStringOrEmpty } from "./string-coerce-BUSzWgUA.js";
import "./provider-registry-CasPS0mm.js";
import "./provider-error-utils-CyJAWFR1.js";
import { rmSync } from "node:fs";
//#region src/plugin-sdk/speech.ts
const TEMP_FILE_CLEANUP_DELAY_MS = 300 * 1e3;
function requireInRange(value, min, max, label) {
	if (!Number.isFinite(value) || value < min || value > max) throw new Error(`${label} must be between ${min} and ${max}`);
}
function normalizeLanguageCode(code) {
	const trimmed = code?.trim();
	if (!trimmed) return;
	const normalized = normalizeLowercaseStringOrEmpty(trimmed);
	if (!/^[a-z]{2}$/.test(normalized)) throw new Error("languageCode must be a 2-letter ISO 639-1 code (e.g. en, de, fr)");
	return normalized;
}
function normalizeApplyTextNormalization(mode) {
	const trimmed = mode?.trim();
	if (!trimmed) return;
	const normalized = normalizeLowercaseStringOrEmpty(trimmed);
	if (normalized === "auto" || normalized === "on" || normalized === "off") return normalized;
	throw new Error("applyTextNormalization must be one of: auto, on, off");
}
function normalizeSeed(seed) {
	if (seed == null) return;
	const next = Math.floor(seed);
	if (!Number.isFinite(next) || next < 0 || next > 4294967295) throw new Error("seed must be between 0 and 4294967295");
	return next;
}
function scheduleCleanup(tempDir, delayMs = TEMP_FILE_CLEANUP_DELAY_MS) {
	setTimeout(() => {
		try {
			rmSync(tempDir, {
				recursive: true,
				force: true
			});
		} catch {}
	}, delayMs).unref();
}
//#endregion
export { scheduleCleanup as a, requireInRange as i, normalizeLanguageCode as n, normalizeSeed as r, normalizeApplyTextNormalization as t };
