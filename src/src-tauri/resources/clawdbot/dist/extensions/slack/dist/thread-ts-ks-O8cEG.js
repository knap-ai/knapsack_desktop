import { normalizeOptionalString } from "openclaw/plugin-sdk/string-coerce-runtime";
//#region extensions/slack/src/truncate.ts
function truncateSlackText(value, max) {
	const trimmed = value.trim();
	if (trimmed.length <= max) return trimmed;
	if (max <= 1) return trimmed.slice(0, max);
	return `${trimmed.slice(0, max - 1)}…`;
}
//#endregion
//#region extensions/slack/src/limits.ts
const SLACK_TEXT_LIMIT = 8e3;
//#endregion
//#region extensions/slack/src/blocks-input.ts
const SLACK_MAX_BLOCKS = 50;
function parseBlocksJson(raw) {
	try {
		return JSON.parse(raw);
	} catch {
		throw new Error("blocks must be valid JSON");
	}
}
function assertBlocksArray(raw) {
	if (!Array.isArray(raw)) throw new Error("blocks must be an array");
	if (raw.length === 0) throw new Error("blocks must contain at least one block");
	if (raw.length > 50) throw new Error(`blocks cannot exceed 50 items`);
	for (const block of raw) {
		if (!block || typeof block !== "object" || Array.isArray(block)) throw new Error("each block must be an object");
		const type = block.type;
		if (typeof type !== "string" || type.trim().length === 0) throw new Error("each block must include a non-empty string type");
	}
}
function validateSlackBlocksArray(raw) {
	assertBlocksArray(raw);
	return raw;
}
function parseSlackBlocksInput(raw) {
	if (raw == null) return;
	return validateSlackBlocksArray(typeof raw === "string" ? parseBlocksJson(raw) : raw);
}
//#endregion
//#region extensions/slack/src/thread-ts.ts
const SLACK_THREAD_TS_PATTERN = /^\d+\.\d+$/;
function normalizeSlackThreadTsCandidate(value) {
	if (typeof value !== "string") return;
	const normalized = normalizeOptionalString(value);
	return normalized && SLACK_THREAD_TS_PATTERN.test(normalized) ? normalized : void 0;
}
function resolveSlackThreadTsValue(params) {
	return normalizeSlackThreadTsCandidate(params.replyToId) ?? normalizeSlackThreadTsCandidate(params.threadId);
}
//#endregion
export { validateSlackBlocksArray as a, parseSlackBlocksInput as i, resolveSlackThreadTsValue as n, SLACK_TEXT_LIMIT as o, SLACK_MAX_BLOCKS as r, truncateSlackText as s, normalizeSlackThreadTsCandidate as t };
