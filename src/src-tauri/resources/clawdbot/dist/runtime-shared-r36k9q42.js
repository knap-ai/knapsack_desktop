import { s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { r as DEFAULT_PROVIDER } from "./defaults-CiQa3xnX.js";
import { t as getProviderEnvVars } from "./provider-env-vars-Sj-BhOn9.js";
import { n as resolveAgentModelPrimaryValue, t as resolveAgentModelFallbackValues } from "./model-input-DFbXtnkw.js";
import { n as ensureAuthProfileStore } from "./store-C1I9Mkh8.js";
import { t as resolveEnvApiKey } from "./model-auth-env-B-45Q6PX.js";
import "./auth-profiles-BQEgLpFI.js";
import { n as listProfilesForProvider } from "./profiles-CVErLX2C.js";
//#region src/media-generation/runtime-shared.ts
function hasMediaNormalizationEntry(entry) {
	return Boolean(entry && (entry.requested !== void 0 || entry.applied !== void 0 || entry.derivedFrom !== void 0 || (entry.supportedValues?.length ?? 0) > 0));
}
const IMAGE_RESOLUTION_ORDER = [
	"1K",
	"2K",
	"4K"
];
function resolveCurrentDefaultProviderId(cfg) {
	const trimmed = normalizeOptionalString(resolveAgentModelPrimaryValue(cfg?.agents?.defaults?.model));
	if (!trimmed) return DEFAULT_PROVIDER;
	const slash = trimmed.indexOf("/");
	if (slash <= 0) return DEFAULT_PROVIDER;
	return normalizeOptionalString(trimmed.slice(0, slash)) || "openai";
}
function isCapabilityProviderConfigured(params) {
	if (params.provider.isConfigured) return params.provider.isConfigured({
		cfg: params.cfg,
		agentDir: params.agentDir
	});
	if (resolveEnvApiKey(params.provider.id)?.apiKey) return true;
	const agentDir = normalizeOptionalString(params.agentDir);
	if (!agentDir) return false;
	return listProfilesForProvider(ensureAuthProfileStore(agentDir, { allowKeychainPrompt: false }), params.provider.id).length > 0;
}
function resolveAutoCapabilityFallbackRefs(params) {
	const providerDefaults = /* @__PURE__ */ new Map();
	for (const provider of params.listProviders(params.cfg)) {
		const providerId = normalizeOptionalString(provider.id);
		const modelId = normalizeOptionalString(provider.defaultModel);
		if (!providerId || !modelId || providerDefaults.has(providerId) || !isCapabilityProviderConfigured({
			provider,
			cfg: params.cfg,
			agentDir: params.agentDir
		})) continue;
		providerDefaults.set(providerId, `${providerId}/${modelId}`);
	}
	const defaultProvider = resolveCurrentDefaultProviderId(params.cfg);
	return [defaultProvider, ...[...providerDefaults.keys()].filter((providerId) => providerId !== defaultProvider).toSorted()].flatMap((providerId) => {
		const ref = providerDefaults.get(providerId);
		return ref ? [ref] : [];
	});
}
function resolveCapabilityModelCandidates(params) {
	const candidates = [];
	const seen = /* @__PURE__ */ new Set();
	const add = (raw) => {
		const parsed = params.parseModelRef(raw);
		if (!parsed) return;
		const key = `${parsed.provider}/${parsed.model}`;
		if (seen.has(key)) return;
		seen.add(key);
		candidates.push(parsed);
	};
	add(params.modelOverride);
	add(resolveAgentModelPrimaryValue(params.modelConfig));
	for (const fallback of resolveAgentModelFallbackValues(params.modelConfig)) add(fallback);
	if ((params.autoProviderFallback ?? params.cfg.agents?.defaults?.mediaGenerationAutoProviderFallback !== false) && params.listProviders) for (const candidate of resolveAutoCapabilityFallbackRefs({
		cfg: params.cfg,
		agentDir: params.agentDir,
		listProviders: params.listProviders
	})) add(candidate);
	return candidates;
}
function normalizeSupportedValues(values) {
	return (values ?? []).flatMap((entry) => {
		return normalizeOptionalString(entry) ? [entry] : [];
	});
}
function compareScores(next, best) {
	if (!best) return true;
	if (next.primary !== best.primary) return next.primary < best.primary;
	if (next.secondary !== best.secondary) return next.secondary < best.secondary;
	return next.tertiary.localeCompare(best.tertiary) < 0;
}
function parseAspectRatioValue(raw) {
	const trimmed = normalizeOptionalString(raw);
	if (!trimmed) return null;
	const match = /^(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)$/.exec(trimmed);
	if (!match) return null;
	const width = Number(match[1]);
	const height = Number(match[2]);
	if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return null;
	return {
		width,
		height,
		value: width / height
	};
}
function parseSizeValue(raw) {
	const trimmed = normalizeOptionalString(raw);
	if (!trimmed) return null;
	const match = /^(\d+)\s*x\s*(\d+)$/i.exec(trimmed);
	if (!match) return null;
	const width = Number(match[1]);
	const height = Number(match[2]);
	if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return null;
	return {
		width,
		height,
		aspectRatio: width / height,
		area: width * height
	};
}
function greatestCommonDivisor(a, b) {
	let left = Math.abs(a);
	let right = Math.abs(b);
	while (right !== 0) {
		const next = left % right;
		left = right;
		right = next;
	}
	return left || 1;
}
function deriveAspectRatioFromSize(size) {
	const parsed = parseSizeValue(size);
	if (!parsed) return;
	const divisor = greatestCommonDivisor(parsed.width, parsed.height);
	return `${parsed.width / divisor}:${parsed.height / divisor}`;
}
function resolveClosestAspectRatio(params) {
	const supported = normalizeSupportedValues(params.supportedAspectRatios);
	if (supported.length === 0) return params.requestedAspectRatio ?? deriveAspectRatioFromSize(params.requestedSize);
	if (params.requestedAspectRatio && supported.includes(params.requestedAspectRatio)) return params.requestedAspectRatio;
	const requested = parseAspectRatioValue(params.requestedAspectRatio) ?? parseAspectRatioValue(deriveAspectRatioFromSize(params.requestedSize));
	if (!requested) return;
	let bestValue;
	let bestScore = null;
	for (const candidate of supported) {
		const parsed = parseAspectRatioValue(candidate);
		if (!parsed) continue;
		const score = {
			primary: Math.abs(Math.log(parsed.value / requested.value)),
			secondary: Math.abs(parsed.width * requested.height - requested.width * parsed.height),
			tertiary: candidate
		};
		if (compareScores(score, bestScore)) {
			bestValue = candidate;
			bestScore = score;
		}
	}
	return bestValue;
}
function resolveClosestSize(params) {
	const supported = normalizeSupportedValues(params.supportedSizes);
	if (supported.length === 0) return params.requestedSize;
	if (params.requestedSize && supported.includes(params.requestedSize)) return params.requestedSize;
	const requested = parseSizeValue(params.requestedSize);
	const requestedAspectRatio = parseAspectRatioValue(params.requestedAspectRatio);
	if (!requested && !requestedAspectRatio) return;
	let bestValue;
	let bestScore = null;
	for (const candidate of supported) {
		const parsed = parseSizeValue(candidate);
		if (!parsed) continue;
		const score = {
			primary: Math.abs(Math.log(parsed.aspectRatio / (requested?.aspectRatio ?? requestedAspectRatio.value))),
			secondary: requested ? Math.abs(Math.log(parsed.area / requested.area)) : parsed.area,
			tertiary: candidate
		};
		if (compareScores(score, bestScore)) {
			bestValue = candidate;
			bestScore = score;
		}
	}
	return bestValue;
}
function resolveClosestResolution(params) {
	const supported = normalizeSupportedValues(params.supportedResolutions);
	if (supported.length === 0) return params.requestedResolution;
	if (params.requestedResolution && supported.includes(params.requestedResolution)) return params.requestedResolution;
	const order = params.order ?? IMAGE_RESOLUTION_ORDER;
	const requestedIndex = params.requestedResolution ? order.indexOf(params.requestedResolution) : -1;
	if (requestedIndex < 0) return;
	let bestValue;
	let bestScore = null;
	for (const candidate of supported) {
		const candidateIndex = order.indexOf(candidate);
		if (candidateIndex < 0) continue;
		const score = {
			primary: Math.abs(candidateIndex - requestedIndex),
			secondary: candidateIndex,
			tertiary: candidate
		};
		if (compareScores(score, bestScore)) {
			bestValue = candidate;
			bestScore = score;
		}
	}
	return bestValue;
}
function normalizeDurationToClosestMax(durationSeconds, maxDurationSeconds) {
	if (typeof durationSeconds !== "number" || !Number.isFinite(durationSeconds)) return;
	const rounded = Math.max(1, Math.round(durationSeconds));
	if (typeof maxDurationSeconds !== "number" || !Number.isFinite(maxDurationSeconds) || maxDurationSeconds <= 0) return rounded;
	return Math.min(rounded, Math.max(1, Math.round(maxDurationSeconds)));
}
function buildMediaGenerationNormalizationMetadata(params) {
	const metadata = {};
	const { normalization } = params;
	if (normalization?.size?.requested !== void 0 && normalization.size.applied !== void 0) {
		metadata.requestedSize = normalization.size.requested;
		metadata.normalizedSize = normalization.size.applied;
	}
	if (normalization?.aspectRatio?.applied !== void 0) {
		if (normalization.aspectRatio.requested !== void 0) metadata.requestedAspectRatio = normalization.aspectRatio.requested;
		metadata.normalizedAspectRatio = normalization.aspectRatio.applied;
		if (normalization.aspectRatio.derivedFrom === "size" && params.requestedSizeForDerivedAspectRatio) {
			metadata.requestedSize = params.requestedSizeForDerivedAspectRatio;
			metadata.aspectRatioDerivedFromSize = deriveAspectRatioFromSize(params.requestedSizeForDerivedAspectRatio);
		}
	}
	if (normalization?.resolution?.requested !== void 0 && normalization.resolution.applied !== void 0) {
		metadata.requestedResolution = normalization.resolution.requested;
		metadata.normalizedResolution = normalization.resolution.applied;
	}
	if (normalization?.durationSeconds?.requested !== void 0 && normalization.durationSeconds.applied !== void 0) {
		metadata.requestedDurationSeconds = normalization.durationSeconds.requested;
		metadata.normalizedDurationSeconds = normalization.durationSeconds.applied;
		if (params.includeSupportedDurationSeconds && normalization.durationSeconds.supportedValues?.length) metadata.supportedDurationSeconds = normalization.durationSeconds.supportedValues;
	}
	return metadata;
}
function throwCapabilityGenerationFailure(params) {
	if (params.attempts.length <= 1 && params.lastError) throw params.lastError;
	const summary = params.attempts.length > 0 ? params.attempts.map((attempt) => `${attempt.provider}/${attempt.model}: ${attempt.error}`).join(" | ") : "unknown";
	throw new Error(`All ${params.capabilityLabel} models failed (${params.attempts.length}): ${summary}`, { cause: params.lastError instanceof Error ? params.lastError : void 0 });
}
function buildNoCapabilityModelConfiguredMessage(params) {
	const sampleModel = params.providers.find((provider) => normalizeOptionalString(provider.id) && normalizeOptionalString(provider.defaultModel));
	const sampleRef = sampleModel ? `${sampleModel.id}/${sampleModel.defaultModel}` : params.fallbackSampleRef ?? "<provider>/<model>";
	const authHints = params.providers.flatMap((provider) => {
		const envVars = getProviderEnvVars(provider.id);
		if (envVars.length === 0) return [];
		return [`${provider.id}: ${envVars.join(" / ")}`];
	}).slice(0, 3);
	return [`No ${params.capabilityLabel} model configured. Set agents.defaults.${params.modelConfigKey}.primary to a provider/model like "${sampleRef}".`, authHints.length > 0 ? `If you want a specific provider, also configure that provider's auth/API key first (${authHints.join("; ")}).` : "If you want a specific provider, also configure that provider's auth/API key first."].join(" ");
}
//#endregion
export { normalizeDurationToClosestMax as a, resolveClosestResolution as c, hasMediaNormalizationEntry as i, resolveClosestSize as l, buildNoCapabilityModelConfiguredMessage as n, resolveCapabilityModelCandidates as o, deriveAspectRatioFromSize as r, resolveClosestAspectRatio as s, buildMediaGenerationNormalizationMetadata as t, throwCapabilityGenerationFailure as u };
