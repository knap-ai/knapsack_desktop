import { a as normalizeLowercaseStringOrEmpty, s as normalizeOptionalLowercaseString } from "./string-coerce-C1IzJjqi.js";
import { r as listSpeechProviders } from "./provider-registry-Be32s6G6.js";
import { rmSync } from "node:fs";
//#region src/tts/tts-provider-helpers.ts
const TEMP_FILE_CLEANUP_DELAY_MS = 300 * 1e3;
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
//#region src/tts/directives.ts
function buildProviderOrder(left, right) {
	const leftOrder = left.autoSelectOrder ?? Number.MAX_SAFE_INTEGER;
	const rightOrder = right.autoSelectOrder ?? Number.MAX_SAFE_INTEGER;
	if (leftOrder !== rightOrder) return leftOrder - rightOrder;
	return left.id.localeCompare(right.id);
}
function resolveDirectiveProviders(options) {
	if (options?.providers) return [...options.providers].toSorted(buildProviderOrder);
	return listSpeechProviders(options?.cfg).toSorted(buildProviderOrder);
}
function resolveDirectiveProviderConfig(provider, options) {
	return options?.providerConfigs?.[provider.id];
}
function prioritizeProvider(providers, providerId) {
	if (!providerId) return [...providers];
	const preferredProvider = providers.find((provider) => provider.id === providerId);
	if (!preferredProvider) return [...providers];
	return [preferredProvider, ...providers.filter((provider) => provider.id !== providerId)];
}
function collectMarkdownCodeRanges(text) {
	const ranges = [];
	const addMatches = (regex) => {
		for (const match of text.matchAll(regex)) {
			if (match.index == null) continue;
			ranges.push({
				start: match.index,
				end: match.index + match[0].length
			});
		}
	};
	addMatches(/```[\s\S]*?```/g);
	addMatches(/~~~[\s\S]*?~~~/g);
	addMatches(/^(?: {4}|\t).*(?:\n|$)/gm);
	addMatches(/`+[^`\n]*`+/g);
	return ranges.toSorted((left, right) => left.start - right.start);
}
function isInsideRange(index, ranges) {
	return ranges.some((range) => index >= range.start && index < range.end);
}
function replaceOutsideMarkdownCode(text, regex, replace) {
	const codeRanges = collectMarkdownCodeRanges(text);
	return text.replace(regex, (...args) => {
		const match = String(args[0]);
		const offset = args.at(-2);
		if (typeof offset === "number" && isInsideRange(offset, codeRanges)) return match;
		return replace(match, args.slice(1, -2).map((capture) => String(capture)));
	});
}
function parseTtsDirectives(text, policy, options) {
	if (!policy.enabled) return {
		cleanedText: text,
		overrides: {},
		warnings: [],
		hasDirective: false
	};
	if (!/\[\[\s*\/?\s*tts(?:\s*:|\s*\]\])/iu.test(text)) return {
		cleanedText: text,
		overrides: {},
		warnings: [],
		hasDirective: false
	};
	let providers;
	const getProviders = () => {
		providers ??= resolveDirectiveProviders(options);
		return providers;
	};
	const overrides = {};
	const warnings = [];
	let cleanedText = text;
	let hasDirective = false;
	cleanedText = replaceOutsideMarkdownCode(cleanedText, /\[\[\s*tts\s*:\s*text\s*\]\]([\s\S]*?)\[\[\s*\/\s*tts\s*:\s*text\s*\]\]/gi, (_match, [inner = ""]) => {
		hasDirective = true;
		if (policy.allowText && overrides.ttsText == null) overrides.ttsText = inner.trim();
		return "";
	});
	cleanedText = replaceOutsideMarkdownCode(cleanedText, /\[\[\s*tts\s*\]\]([\s\S]*?)\[\[\s*\/\s*tts\s*\]\]/gi, (_match, [inner = ""]) => {
		hasDirective = true;
		const visible = inner.trim();
		if (policy.allowText && overrides.ttsText == null) overrides.ttsText = visible;
		return visible;
	});
	cleanedText = replaceOutsideMarkdownCode(cleanedText, /\[\[\s*tts\s*:\s*([^\]]+)\]\]/gi, (_match, [body = ""]) => {
		hasDirective = true;
		const tokens = body.split(/\s+/).filter(Boolean);
		let declaredProviderId;
		if (policy.allowProvider) for (const token of tokens) {
			const eqIndex = token.indexOf("=");
			if (eqIndex === -1) continue;
			const rawKey = token.slice(0, eqIndex).trim();
			if (!rawKey || normalizeLowercaseStringOrEmpty(rawKey) !== "provider") continue;
			const rawValue = token.slice(eqIndex + 1).trim();
			if (!rawValue) continue;
			const providerId = normalizeLowercaseStringOrEmpty(rawValue);
			if (!providerId) {
				warnings.push("invalid provider id");
				continue;
			}
			declaredProviderId = providerId;
			overrides.provider = providerId;
		}
		let orderedProviders;
		const getOrderedProviders = () => {
			orderedProviders ??= prioritizeProvider(getProviders(), declaredProviderId ?? normalizeLowercaseStringOrEmpty(options?.preferredProviderId));
			return orderedProviders;
		};
		for (const token of tokens) {
			const eqIndex = token.indexOf("=");
			if (eqIndex === -1) continue;
			const rawKey = token.slice(0, eqIndex).trim();
			const rawValue = token.slice(eqIndex + 1).trim();
			if (!rawKey || !rawValue) continue;
			const key = normalizeLowercaseStringOrEmpty(rawKey);
			if (key === "provider") continue;
			for (const provider of getOrderedProviders()) {
				const parsed = provider.parseDirectiveToken?.({
					key,
					value: rawValue,
					policy,
					providerConfig: resolveDirectiveProviderConfig(provider, options),
					currentOverrides: overrides.providerOverrides?.[provider.id]
				});
				if (!parsed?.handled) continue;
				if (parsed.overrides) overrides.providerOverrides = {
					...overrides.providerOverrides,
					[provider.id]: {
						...overrides.providerOverrides?.[provider.id],
						...parsed.overrides
					}
				};
				if (parsed.warnings?.length) warnings.push(...parsed.warnings);
				break;
			}
		}
		return "";
	});
	cleanedText = replaceOutsideMarkdownCode(cleanedText, /\[\[\s*tts\s*\]\]/gi, () => {
		hasDirective = true;
		return "";
	});
	cleanedText = replaceOutsideMarkdownCode(cleanedText, /\[\[\s*\/\s*tts(?:\s*:\s*[^\]]*)?\]\]/gi, () => {
		hasDirective = true;
		return "";
	});
	return {
		cleanedText,
		ttsText: overrides.ttsText,
		hasDirective,
		overrides,
		warnings
	};
}
//#endregion
export { requireInRange as a, normalizeSeed as i, normalizeApplyTextNormalization as n, scheduleCleanup as o, normalizeLanguageCode as r, parseTtsDirectives as t };
