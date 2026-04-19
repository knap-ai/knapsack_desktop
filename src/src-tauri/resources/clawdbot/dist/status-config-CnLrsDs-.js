import { o as normalizeOptionalLowercaseString, s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { f as resolveConfigDir, m as resolveUserPath } from "./utils-D5DtWkEu.js";
import { n as normalizeTtsAutoMode } from "./tts-auto-mode-ZhfpRKB9.js";
import fs from "node:fs";
import path from "node:path";
//#region src/tts/status-config.ts
const DEFAULT_TTS_MAX_LENGTH = 1500;
const DEFAULT_TTS_SUMMARIZE = true;
function resolveConfiguredTtsAutoMode(raw) {
	return normalizeTtsAutoMode(raw.auto) ?? (raw.enabled ? "always" : "off");
}
function normalizeConfiguredSpeechProviderId(providerId) {
	const normalized = normalizeOptionalLowercaseString(providerId);
	if (!normalized) return;
	return normalized === "edge" ? "microsoft" : normalized;
}
function resolveTtsPrefsPathValue(prefsPath) {
	const configuredPath = normalizeOptionalString(prefsPath);
	if (configuredPath) return resolveUserPath(configuredPath);
	const envPath = normalizeOptionalString(process.env.OPENCLAW_TTS_PREFS);
	if (envPath) return resolveUserPath(envPath);
	return path.join(resolveConfigDir(process.env), "settings", "tts.json");
}
function readPrefs(prefsPath) {
	try {
		if (!fs.existsSync(prefsPath)) return {};
		return JSON.parse(fs.readFileSync(prefsPath, "utf8"));
	} catch {
		return {};
	}
}
function resolveTtsAutoModeFromPrefs(prefs) {
	const auto = normalizeTtsAutoMode(prefs.tts?.auto);
	if (auto) return auto;
	if (typeof prefs.tts?.enabled === "boolean") return prefs.tts.enabled ? "always" : "off";
}
function resolveStatusTtsSnapshot(params) {
	const raw = params.cfg.messages?.tts ?? {};
	const prefs = readPrefs(resolveTtsPrefsPathValue(raw.prefsPath));
	const autoMode = normalizeTtsAutoMode(params.sessionAuto) ?? resolveTtsAutoModeFromPrefs(prefs) ?? resolveConfiguredTtsAutoMode(raw);
	if (autoMode === "off") return null;
	return {
		autoMode,
		provider: normalizeConfiguredSpeechProviderId(prefs.tts?.provider) ?? normalizeConfiguredSpeechProviderId(raw.provider) ?? "auto",
		maxLength: prefs.tts?.maxLength ?? DEFAULT_TTS_MAX_LENGTH,
		summarize: prefs.tts?.summarize ?? DEFAULT_TTS_SUMMARIZE
	};
}
//#endregion
export { resolveStatusTtsSnapshot as t };
