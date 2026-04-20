import { i as normalizeLowercaseStringOrEmpty } from "./string-coerce-BUSzWgUA.js";
import { r as normalizeProviderId } from "./provider-id-KaStHhRz.js";
import { n as normalizeGooglePreviewModelId, r as normalizeNativeXaiModelId } from "./provider-model-id-normalize-C-aZ6pzm.js";
//#region src/agents/model-ref-shared.ts
function modelKey(provider, model) {
	const providerId = provider.trim();
	const modelId = model.trim();
	if (!providerId) return modelId;
	if (!modelId) return providerId;
	return normalizeLowercaseStringOrEmpty(modelId).startsWith(`${normalizeLowercaseStringOrEmpty(providerId)}/`) ? modelId : `${providerId}/${modelId}`;
}
function normalizeAnthropicModelId(model) {
	const trimmed = model.trim();
	if (!trimmed) return trimmed;
	switch (normalizeLowercaseStringOrEmpty(trimmed)) {
		case "opus-4.6": return "claude-opus-4-6";
		case "opus-4.5": return "claude-opus-4-5";
		case "sonnet-4.6": return "claude-sonnet-4-6";
		case "sonnet-4.5": return "claude-sonnet-4-5";
		default: return trimmed;
	}
}
function normalizeHuggingfaceModelId(model) {
	const trimmed = model.trim();
	if (!trimmed) return trimmed;
	return normalizeLowercaseStringOrEmpty(trimmed).startsWith("huggingface/") ? trimmed.slice(12) : trimmed;
}
function normalizeStaticProviderModelId(provider, model) {
	if (provider === "anthropic") return normalizeAnthropicModelId(model);
	if (provider === "huggingface") return normalizeHuggingfaceModelId(model);
	if (provider === "google" || provider === "google-vertex") return normalizeGooglePreviewModelId(model);
	if (provider === "openrouter" && !model.includes("/")) return `openrouter/${model}`;
	if (provider === "xai") return normalizeNativeXaiModelId(model);
	if (provider === "vercel-ai-gateway" && !model.includes("/")) {
		const normalizedAnthropicModel = normalizeAnthropicModelId(model);
		if (normalizedAnthropicModel.startsWith("claude-")) return `anthropic/${normalizedAnthropicModel}`;
	}
	return model;
}
function parseStaticModelRef(raw, defaultProvider) {
	const trimmed = raw.trim();
	if (!trimmed) return null;
	const slash = trimmed.indexOf("/");
	const providerRaw = slash === -1 ? defaultProvider : trimmed.slice(0, slash).trim();
	const modelRaw = slash === -1 ? trimmed : trimmed.slice(slash + 1).trim();
	if (!providerRaw || !modelRaw) return null;
	const provider = normalizeProviderId(providerRaw);
	return {
		provider,
		model: normalizeStaticProviderModelId(provider, modelRaw)
	};
}
function resolveStaticAllowlistModelKey(raw, defaultProvider) {
	const parsed = parseStaticModelRef(raw, defaultProvider);
	if (!parsed) return null;
	return modelKey(parsed.provider, parsed.model);
}
//#endregion
export { resolveStaticAllowlistModelKey as i, normalizeStaticProviderModelId as n, parseStaticModelRef as r, modelKey as t };
