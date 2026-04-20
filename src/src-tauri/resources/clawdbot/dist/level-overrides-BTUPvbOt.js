import { d as normalizeVerboseLevel, l as normalizeTraceLevel } from "./thinking.shared-CAbk7EZs.js";
//#region src/sessions/level-overrides.ts
function parseVerboseOverride(raw) {
	if (raw === null) return {
		ok: true,
		value: null
	};
	if (raw === void 0) return {
		ok: true,
		value: void 0
	};
	if (typeof raw !== "string") return {
		ok: false,
		error: "invalid verboseLevel (use \"on\"|\"off\")"
	};
	const normalized = normalizeVerboseLevel(raw);
	if (!normalized) return {
		ok: false,
		error: "invalid verboseLevel (use \"on\"|\"off\")"
	};
	return {
		ok: true,
		value: normalized
	};
}
function applyVerboseOverride(entry, level) {
	if (level === void 0) return;
	if (level === null) {
		delete entry.verboseLevel;
		return;
	}
	entry.verboseLevel = level;
}
function parseTraceOverride(raw) {
	if (raw === null) return {
		ok: true,
		value: null
	};
	if (raw === void 0) return {
		ok: true,
		value: void 0
	};
	if (typeof raw !== "string") return {
		ok: false,
		error: "invalid traceLevel (use \"on\"|\"off\"|\"raw\")"
	};
	const normalized = normalizeTraceLevel(raw);
	if (!normalized) return {
		ok: false,
		error: "invalid traceLevel (use \"on\"|\"off\"|\"raw\")"
	};
	return {
		ok: true,
		value: normalized
	};
}
function applyTraceOverride(entry, level) {
	if (level === void 0) return;
	if (level === null) {
		delete entry.traceLevel;
		return;
	}
	entry.traceLevel = level;
}
//#endregion
export { parseVerboseOverride as i, applyVerboseOverride as n, parseTraceOverride as r, applyTraceOverride as t };
