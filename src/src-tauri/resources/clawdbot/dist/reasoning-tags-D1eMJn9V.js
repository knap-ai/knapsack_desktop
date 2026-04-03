//#region src/shared/text/code-regions.ts
function findCodeRegions(text) {
	const regions = [];
	for (const match of text.matchAll(/(^|\n)(```|~~~)[^\n]*\n[\s\S]*?(?:\n\2|$)/g)) {
		const start = (match.index ?? 0) + match[1].length;
		regions.push({
			start,
			end: start + match[0].length - match[1].length
		});
	}
	for (const match of text.matchAll(/`+[^`]+`+/g)) {
		const start = match.index ?? 0;
		const end = start + match[0].length;
		if (!regions.some((r) => start >= r.start && end <= r.end)) regions.push({
			start,
			end
		});
	}
	regions.sort((a, b) => a.start - b.start);
	return regions;
}
function isInsideCode(pos, regions) {
	return regions.some((r) => pos >= r.start && pos < r.end);
}
//#endregion
//#region src/shared/text/reasoning-tags.ts
const QUICK_TAG_RE = /<\s*\/?\s*(?:(?:antml:)?(?:think(?:ing)?|thought)|antthinking|final)\b/i;
const FINAL_TAG_RE = /<\s*\/?\s*final\b[^<>]*>/gi;
const THINKING_TAG_RE = /<\s*(\/?)\s*(?:(?:antml:)?(?:think(?:ing)?|thought)|antthinking)\b[^<>]*>/gi;
function applyTrim(value, mode) {
	if (mode === "none") return value;
	if (mode === "start") return value.trimStart();
	return value.trim();
}
function stripReasoningTagsFromText(text, options) {
	if (!text) return text;
	if (!QUICK_TAG_RE.test(text)) return text;
	const mode = options?.mode ?? "strict";
	const trimMode = options?.trim ?? "both";
	let cleaned = text;
	if (FINAL_TAG_RE.test(cleaned)) {
		FINAL_TAG_RE.lastIndex = 0;
		const finalMatches = [];
		const preCodeRegions = findCodeRegions(cleaned);
		for (const match of cleaned.matchAll(FINAL_TAG_RE)) {
			const start = match.index ?? 0;
			finalMatches.push({
				start,
				length: match[0].length,
				inCode: isInsideCode(start, preCodeRegions)
			});
		}
		for (let i = finalMatches.length - 1; i >= 0; i--) {
			const m = finalMatches[i];
			if (!m.inCode) cleaned = cleaned.slice(0, m.start) + cleaned.slice(m.start + m.length);
		}
	} else FINAL_TAG_RE.lastIndex = 0;
	const codeRegions = findCodeRegions(cleaned);
	THINKING_TAG_RE.lastIndex = 0;
	let result = "";
	let lastIndex = 0;
	let inThinking = false;
	for (const match of cleaned.matchAll(THINKING_TAG_RE)) {
		const idx = match.index ?? 0;
		const isClose = match[1] === "/";
		if (isInsideCode(idx, codeRegions)) continue;
		if (!inThinking) {
			result += cleaned.slice(lastIndex, idx);
			if (!isClose) inThinking = true;
		} else if (isClose) inThinking = false;
		lastIndex = idx + match[0].length;
	}
	if (!inThinking || mode === "preserve") result += cleaned.slice(lastIndex);
	return applyTrim(result, trimMode);
}
//#endregion
export { findCodeRegions as n, isInsideCode as r, stripReasoningTagsFromText as t };
