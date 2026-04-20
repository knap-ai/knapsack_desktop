import { o as normalizeOptionalLowercaseString, s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { f as resolveDefaultModelForAgent, i as buildModelAliasIndex, m as resolveModelRefFromString } from "./model-selection-CTdyYoio.js";
import { t as requireApiKey } from "./model-auth-runtime-shared-jdNQNamX.js";
import { r as getApiKeyForModel } from "./model-auth-KKLbMBGv.js";
import { n as resolveModelAsync } from "./model-Bl_gU5g0.js";
import { t as prepareModelForSimpleCompletion } from "./simple-completion-transport-Bvnrd78A.js";
import "./provider-registry-CasPS0mm.js";
import "./provider-error-utils-CyJAWFR1.js";
import { rmSync } from "node:fs";
import { completeSimple } from "@mariozechner/pi-ai";
//#region src/tts/tts-core.ts
const TEMP_FILE_CLEANUP_DELAY_MS = 300 * 1e3;
function resolveDefaultSummarizeTextDeps() {
	return {
		completeSimple,
		getApiKeyForModel,
		prepareModelForSimpleCompletion,
		requireApiKey,
		resolveModelAsync
	};
}
function requireInRange(value, min, max, label) {
	if (!Number.isFinite(value) || value < min || value > max) throw new Error(`${label} must be between ${min} and ${max}`);
}
function normalizeLanguageCode(code) {
	const normalized = normalizeOptionalLowercaseString(code);
	if (!normalized) return;
	if (!/^[a-z]{2}$/.test(normalized)) throw new Error("languageCode must be a 2-letter ISO 639-1 code (e.g. en, de, fr)");
	return normalized;
}
function normalizeApplyTextNormalization(mode) {
	const normalized = normalizeOptionalLowercaseString(mode);
	if (!normalized) return;
	if (normalized === "auto" || normalized === "on" || normalized === "off") return normalized;
	throw new Error("applyTextNormalization must be one of: auto, on, off");
}
function normalizeSeed(seed) {
	if (seed == null) return;
	const next = Math.floor(seed);
	if (!Number.isFinite(next) || next < 0 || next > 4294967295) throw new Error("seed must be between 0 and 4294967295");
	return next;
}
function resolveSummaryModelRef(cfg, config) {
	const defaultRef = resolveDefaultModelForAgent({ cfg });
	const override = normalizeOptionalString(config.summaryModel);
	if (!override) return {
		ref: defaultRef,
		source: "default"
	};
	const aliasIndex = buildModelAliasIndex({
		cfg,
		defaultProvider: defaultRef.provider
	});
	const resolved = resolveModelRefFromString({
		raw: override,
		defaultProvider: defaultRef.provider,
		aliasIndex
	});
	if (!resolved) return {
		ref: defaultRef,
		source: "default"
	};
	return {
		ref: resolved.ref,
		source: "summaryModel"
	};
}
function isTextContentBlock(block) {
	return block.type === "text";
}
async function summarizeText(params, deps = resolveDefaultSummarizeTextDeps()) {
	const { text, targetLength, cfg, config, timeoutMs } = params;
	if (targetLength < 100 || targetLength > 1e4) throw new Error(`Invalid targetLength: ${targetLength}`);
	const startTime = Date.now();
	const { ref } = resolveSummaryModelRef(cfg, config);
	const resolved = await deps.resolveModelAsync(ref.provider, ref.model, void 0, cfg);
	if (!resolved.model) throw new Error(resolved.error ?? `Unknown summary model: ${ref.provider}/${ref.model}`);
	const completionModel = deps.prepareModelForSimpleCompletion({
		model: resolved.model,
		cfg
	});
	const apiKey = deps.requireApiKey(await deps.getApiKeyForModel({
		model: completionModel,
		cfg
	}), ref.provider);
	try {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), timeoutMs);
		try {
			const summary = (await deps.completeSimple(completionModel, { messages: [{
				role: "user",
				content: `You are an assistant that summarizes texts concisely while keeping the most important information. Summarize the text to approximately ${targetLength} characters. Maintain the original tone and style. Reply only with the summary, without additional explanations.\n\n<text_to_summarize>\n${text}\n</text_to_summarize>`,
				timestamp: Date.now()
			}] }, {
				apiKey,
				maxTokens: Math.ceil(targetLength / 2),
				temperature: .3,
				signal: controller.signal
			})).content.filter(isTextContentBlock).map((block) => block.text.trim()).filter(Boolean).join(" ").trim();
			if (!summary) throw new Error("No summary returned");
			return {
				summary,
				latencyMs: Date.now() - startTime,
				inputLength: text.length,
				outputLength: summary.length
			};
		} finally {
			clearTimeout(timeout);
		}
	} catch (err) {
		if (err.name === "AbortError") throw new Error("Summarization timed out", { cause: err });
		throw err;
	}
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
export { scheduleCleanup as a, requireInRange as i, normalizeLanguageCode as n, summarizeText as o, normalizeSeed as r, normalizeApplyTextNormalization as t };
