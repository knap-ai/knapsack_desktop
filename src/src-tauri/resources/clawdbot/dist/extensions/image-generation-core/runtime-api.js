import { t as createSubsystemLogger } from "../../subsystem-CJEvHE2o.js";
import { n as resolveAgentModelPrimaryValue, t as resolveAgentModelFallbackValues } from "../../model-input-DR9jgad-.js";
import { n as getProviderEnvVars } from "../../provider-env-vars-BgFCVfb6.js";
import { c as parseImageGenerationModelRef, i as isFailoverError, r as describeFailoverError } from "../../failover-error-qR7EPsdr.js";
import { n as listImageGenerationProviders, t as getImageGenerationProvider } from "../../image-generation-core-BFZyzbuM.js";
import "../../api-ClLzPgJc.js";
//#region extensions/image-generation-core/src/runtime.ts
const log = createSubsystemLogger("image-generation");
function resolveImageGenerationCandidates(params) {
	const candidates = [];
	const seen = /* @__PURE__ */ new Set();
	const add = (raw) => {
		const parsed = parseImageGenerationModelRef(raw);
		if (!parsed) return;
		const key = `${parsed.provider}/${parsed.model}`;
		if (seen.has(key)) return;
		seen.add(key);
		candidates.push(parsed);
	};
	add(params.modelOverride);
	add(resolveAgentModelPrimaryValue(params.cfg.agents?.defaults?.imageGenerationModel));
	for (const fallback of resolveAgentModelFallbackValues(params.cfg.agents?.defaults?.imageGenerationModel)) add(fallback);
	return candidates;
}
function throwImageGenerationFailure(params) {
	if (params.attempts.length <= 1 && params.lastError) throw params.lastError;
	const summary = params.attempts.length > 0 ? params.attempts.map((attempt) => `${attempt.provider}/${attempt.model}: ${attempt.error}`).join(" | ") : "unknown";
	throw new Error(`All image generation models failed (${params.attempts.length}): ${summary}`, { cause: params.lastError instanceof Error ? params.lastError : void 0 });
}
function buildNoImageGenerationModelConfiguredMessage(cfg) {
	const providers = listImageGenerationProviders(cfg);
	const sampleModel = providers.find((provider) => provider.defaultModel) ?? {
		id: "google",
		defaultModel: "gemini-3-pro-image-preview"
	};
	const authHints = providers.flatMap((provider) => {
		const envVars = getProviderEnvVars(provider.id);
		if (envVars.length === 0) return [];
		return [`${provider.id}: ${envVars.join(" / ")}`];
	}).slice(0, 3);
	return [`No image-generation model configured. Set agents.defaults.imageGenerationModel.primary to a provider/model like "${sampleModel.id}/${sampleModel.defaultModel}".`, authHints.length > 0 ? `If you want a specific provider, also configure that provider's auth/API key first (${authHints.join("; ")}).` : "If you want a specific provider, also configure that provider's auth/API key first."].join(" ");
}
function listRuntimeImageGenerationProviders(params) {
	return listImageGenerationProviders(params?.config);
}
async function generateImage(params) {
	const candidates = resolveImageGenerationCandidates({
		cfg: params.cfg,
		modelOverride: params.modelOverride
	});
	if (candidates.length === 0) throw new Error(buildNoImageGenerationModelConfiguredMessage(params.cfg));
	const attempts = [];
	let lastError;
	for (const candidate of candidates) {
		const provider = getImageGenerationProvider(candidate.provider, params.cfg);
		if (!provider) {
			const error = `No image-generation provider registered for ${candidate.provider}`;
			attempts.push({
				provider: candidate.provider,
				model: candidate.model,
				error
			});
			lastError = new Error(error);
			continue;
		}
		try {
			const result = await provider.generateImage({
				provider: candidate.provider,
				model: candidate.model,
				prompt: params.prompt,
				cfg: params.cfg,
				agentDir: params.agentDir,
				authStore: params.authStore,
				count: params.count,
				size: params.size,
				aspectRatio: params.aspectRatio,
				resolution: params.resolution,
				inputImages: params.inputImages
			});
			if (!Array.isArray(result.images) || result.images.length === 0) throw new Error("Image generation provider returned no images.");
			return {
				images: result.images,
				provider: candidate.provider,
				model: result.model ?? candidate.model,
				attempts,
				metadata: result.metadata
			};
		} catch (err) {
			lastError = err;
			const described = isFailoverError(err) ? describeFailoverError(err) : void 0;
			attempts.push({
				provider: candidate.provider,
				model: candidate.model,
				error: described?.message ?? (err instanceof Error ? err.message : String(err)),
				reason: described?.reason,
				status: described?.status,
				code: described?.code
			});
			log.debug(`image-generation candidate failed: ${candidate.provider}/${candidate.model}`);
		}
	}
	throwImageGenerationFailure({
		attempts,
		lastError
	});
}
//#endregion
export { generateImage, listRuntimeImageGenerationProviders };
