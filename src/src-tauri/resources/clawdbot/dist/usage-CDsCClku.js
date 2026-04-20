import { t as asFiniteNumber } from "./number-coercion-Cl2KmzKx.js";
//#region src/agents/usage.ts
function makeZeroUsageSnapshot() {
	return {
		input: 0,
		output: 0,
		cacheRead: 0,
		cacheWrite: 0,
		totalTokens: 0,
		cost: {
			input: 0,
			output: 0,
			cacheRead: 0,
			cacheWrite: 0,
			total: 0
		}
	};
}
function hasNonzeroUsage(usage) {
	if (!usage) return false;
	return [
		usage.input,
		usage.output,
		usage.cacheRead,
		usage.cacheWrite,
		usage.total
	].some((v) => typeof v === "number" && Number.isFinite(v) && v > 0);
}
function normalizeUsage(raw) {
	if (!raw) return;
	const cacheRead = asFiniteNumber(raw.cacheRead ?? raw.cache_read ?? raw.cache_read_input_tokens ?? raw.cached_tokens ?? raw.input_tokens_details?.cached_tokens ?? raw.prompt_tokens_details?.cached_tokens);
	const rawInputValue = raw.input ?? raw.inputTokens ?? raw.input_tokens ?? raw.promptTokens ?? raw.prompt_tokens;
	const usesOpenAIStylePromptTotals = raw.cached_tokens !== void 0 || raw.input_tokens_details?.cached_tokens !== void 0 || raw.prompt_tokens_details?.cached_tokens !== void 0;
	const rawInput = asFiniteNumber(rawInputValue);
	const normalizedInput = rawInput !== void 0 && usesOpenAIStylePromptTotals && cacheRead !== void 0 ? rawInput - cacheRead : rawInput;
	const input = normalizedInput !== void 0 && normalizedInput < 0 ? 0 : normalizedInput;
	const output = asFiniteNumber(raw.output ?? raw.outputTokens ?? raw.output_tokens ?? raw.completionTokens ?? raw.completion_tokens);
	const cacheWrite = asFiniteNumber(raw.cacheWrite ?? raw.cache_write ?? raw.cache_creation_input_tokens);
	const total = asFiniteNumber(raw.total ?? raw.totalTokens ?? raw.total_tokens);
	if (input === void 0 && output === void 0 && cacheRead === void 0 && cacheWrite === void 0 && total === void 0) return;
	return {
		input,
		output,
		cacheRead,
		cacheWrite,
		total
	};
}
/**
* Maps normalized usage to OpenAI Chat Completions `usage` fields.
*
* `prompt_tokens` is input + cacheRead (cache write is excluded to match the
* OpenAI-style breakdown used by the compat endpoint).
*
* `total_tokens` is the greater of the component sum and aggregate `total` when
* present, so a partial breakdown cannot discard a valid upstream total.
*/
function toOpenAiChatCompletionsUsage(usage) {
	const input = usage?.input ?? 0;
	const output = usage?.output ?? 0;
	const cacheRead = usage?.cacheRead ?? 0;
	const promptTokens = Math.max(0, input + cacheRead);
	const completionTokens = Math.max(0, output);
	const componentTotal = promptTokens + completionTokens;
	const aggregateRaw = usage?.total;
	const aggregateTotal = typeof aggregateRaw === "number" && Number.isFinite(aggregateRaw) ? Math.max(0, aggregateRaw) : void 0;
	return {
		prompt_tokens: promptTokens,
		completion_tokens: completionTokens,
		total_tokens: aggregateTotal !== void 0 ? Math.max(componentTotal, aggregateTotal) : componentTotal
	};
}
function derivePromptTokens(usage) {
	if (!usage) return;
	const input = usage.input ?? 0;
	const cacheRead = usage.cacheRead ?? 0;
	const cacheWrite = usage.cacheWrite ?? 0;
	const sum = input + cacheRead + cacheWrite;
	return sum > 0 ? sum : void 0;
}
function deriveSessionTotalTokens(params) {
	const promptOverride = params.promptTokens;
	const hasPromptOverride = typeof promptOverride === "number" && Number.isFinite(promptOverride) && promptOverride > 0;
	const usage = params.usage;
	if (!usage && !hasPromptOverride) return;
	const promptTokens = hasPromptOverride ? promptOverride : derivePromptTokens({
		input: usage?.input,
		cacheRead: usage?.cacheRead,
		cacheWrite: usage?.cacheWrite
	});
	if (!(typeof promptTokens === "number") || !Number.isFinite(promptTokens) || promptTokens <= 0) return;
	return promptTokens;
}
//#endregion
export { normalizeUsage as a, makeZeroUsageSnapshot as i, deriveSessionTotalTokens as n, toOpenAiChatCompletionsUsage as o, hasNonzeroUsage as r, derivePromptTokens as t };
