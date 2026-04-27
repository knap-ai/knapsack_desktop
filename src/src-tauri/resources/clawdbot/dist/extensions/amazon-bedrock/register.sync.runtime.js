import { mergeImplicitBedrockProvider, resolveBedrockConfigApiKey, resolveImplicitBedrockProvider } from "./discovery.js";
import "./api.js";
import { bedrockMemoryEmbeddingProviderAdapter } from "./memory-embedding-adapter.js";
import { resolvePluginConfigObject } from "openclaw/plugin-sdk/config-runtime";
import { ANTHROPIC_BY_MODEL_REPLAY_HOOKS, normalizeProviderId } from "openclaw/plugin-sdk/provider-model-shared";
import { createBedrockNoCacheWrapper, isAnthropicBedrockModel, streamWithPayloadPatch } from "openclaw/plugin-sdk/provider-stream-shared";
//#region extensions/amazon-bedrock/register.sync.runtime.ts
function createGuardrailWrapStreamFn(innerWrapStreamFn, guardrailConfig) {
	return (ctx) => {
		const inner = innerWrapStreamFn(ctx);
		if (!inner) return inner;
		return (model, context, options) => {
			return streamWithPayloadPatch(inner, model, context, options, (payload) => {
				const gc = {
					guardrailIdentifier: guardrailConfig.guardrailIdentifier,
					guardrailVersion: guardrailConfig.guardrailVersion
				};
				if (guardrailConfig.streamProcessingMode) gc.streamProcessingMode = guardrailConfig.streamProcessingMode;
				if (guardrailConfig.trace) gc.trace = guardrailConfig.trace;
				payload.guardrailConfig = gc;
			});
		};
	};
}
/**
* Mirrors the shipped pi-ai Bedrock `supportsPromptCaching` matcher.
* Keep this in sync with node_modules/@mariozechner/pi-ai/dist/providers/amazon-bedrock.js.
*/
function matchesPiAiPromptCachingModelId(modelId) {
	const id = modelId.toLowerCase();
	if (!id.includes("claude")) return false;
	if (id.includes("-4-") || id.includes("-4.")) return true;
	if (id.includes("claude-3-7-sonnet")) return true;
	if (id.includes("claude-3-5-haiku")) return true;
	return false;
}
function piAiWouldInjectCachePoints(modelId) {
	return matchesPiAiPromptCachingModelId(modelId);
}
/**
* Detect Bedrock application inference profile ARNs — these are the only IDs
* where pi-ai's model-name-based checks fail because the ARN is opaque.
* System-defined profiles (us., eu., global.) and base model IDs always
* contain the model name and are handled by pi-ai natively.
*/
const BEDROCK_APP_INFERENCE_PROFILE_RE = /^arn:aws(-cn|-us-gov)?:bedrock:.*:application-inference-profile\//i;
function isBedrockAppInferenceProfile(modelId) {
	return BEDROCK_APP_INFERENCE_PROFILE_RE.test(modelId);
}
/**
* pi-ai's internal `supportsPromptCaching` checks `model.id` for specific Claude
* model name patterns, which fails for application inference profile ARNs (opaque
* IDs that may not contain the model name). When OpenClaw's `isAnthropicBedrockModel`
* identifies the model but pi-ai won't inject cache points, we do it via onPayload.
*
* Gated to application inference profile ARNs only — regular Claude model IDs and
* system-defined inference profiles (us.anthropic.claude-*) are left to pi-ai.
*/
function needsCachePointInjection(modelId) {
	if (!isBedrockAppInferenceProfile(modelId)) return false;
	if (piAiWouldInjectCachePoints(modelId)) return false;
	if (isAnthropicBedrockModel(modelId)) return true;
	return false;
}
/**
* Extract the region from a Bedrock ARN.
* e.g. "arn:aws:bedrock:us-east-1:123:application-inference-profile/abc" → "us-east-1"
*/
function extractRegionFromArn(arn) {
	const parts = arn.split(":");
	return parts.length >= 4 && parts[3] ? parts[3] : void 0;
}
/**
* Check if a resolved foundation model ARN supports prompt caching using the
* same matcher pi-ai uses for direct model IDs.
*/
function resolvedModelSupportsCaching(modelArn) {
	return matchesPiAiPromptCachingModelId(modelArn);
}
/**
* Resolve the underlying foundation model for an application inference profile
* via GetInferenceProfile. Results are cached so we only call the API once per
* profile ARN. Returns true if the underlying model supports prompt caching.
*
* Region is extracted from the profile ARN itself to avoid mismatches when
* the OpenClaw config region differs from the profile's home region.
*/
const appProfileCacheEligibleCache = /* @__PURE__ */ new Map();
function resetBedrockAppProfileCacheEligibilityForTest() {
	appProfileCacheEligibleCache.clear();
}
async function resolveAppProfileCacheEligible(modelId, fallbackRegion) {
	if (appProfileCacheEligibleCache.has(modelId)) return appProfileCacheEligibleCache.get(modelId);
	try {
		const { BedrockClient, GetInferenceProfileCommand } = await import("@aws-sdk/client-bedrock");
		const region = extractRegionFromArn(modelId) ?? fallbackRegion;
		const models = (await new BedrockClient(region ? { region } : {}).send(new GetInferenceProfileCommand({ inferenceProfileIdentifier: modelId }))).models ?? [];
		const eligible = models.length > 0 && models.every((m) => resolvedModelSupportsCaching(m.modelArn ?? ""));
		appProfileCacheEligibleCache.set(modelId, eligible);
		return eligible;
	} catch {
		return isAnthropicBedrockModel(modelId);
	}
}
function hasCachePoint(blocks) {
	return blocks?.some((b) => b.cachePoint != null) === true;
}
function makeCachePoint(cacheRetention) {
	return { cachePoint: {
		type: "default",
		...cacheRetention === "long" ? { ttl: "1h" } : {}
	} };
}
/**
* Inject Bedrock Converse cache points into the payload when pi-ai skipped them
* because it didn't recognize the model ID (application inference profiles).
*/
function injectBedrockCachePoints(payload, cacheRetention) {
	if (!cacheRetention || cacheRetention === "none") return;
	const point = makeCachePoint(cacheRetention);
	const system = payload.system;
	if (Array.isArray(system) && system.length > 0 && !hasCachePoint(system)) system.push(point);
	const messages = payload.messages;
	if (Array.isArray(messages) && messages.length > 0) for (let i = messages.length - 1; i >= 0; i--) {
		const msg = messages[i];
		if (msg.role === "user" && Array.isArray(msg.content)) {
			if (!hasCachePoint(msg.content)) msg.content.push(point);
			break;
		}
	}
}
function registerAmazonBedrockPlugin(api) {
	const providerId = "amazon-bedrock";
	const claude46ModelRe = /claude-(?:opus|sonnet)-4(?:\.|-)6(?:$|[-.])/i;
	const bedrockRegionRe = /bedrock-runtime\.([a-z0-9-]+)\.amazonaws\./;
	const bedrockContextOverflowPatterns = [
		/ValidationException.*(?:input is too long|max input token|input token.*exceed)/i,
		/ValidationException.*(?:exceeds? the (?:maximum|max) (?:number of )?(?:input )?tokens)/i,
		/ModelStreamErrorException.*(?:Input is too long|too many input tokens)/i
	];
	const anthropicByModelReplayHooks = ANTHROPIC_BY_MODEL_REPLAY_HOOKS;
	const startupPluginConfig = api.pluginConfig ?? {};
	function resolveCurrentPluginConfig(config) {
		return resolvePluginConfigObject(config, providerId) ?? (config ? void 0 : startupPluginConfig);
	}
	api.registerMemoryEmbeddingProvider(bedrockMemoryEmbeddingProviderAdapter);
	const baseWrapStreamFn = ({ modelId, streamFn }) => {
		if (isAnthropicBedrockModel(modelId)) return streamFn;
		if (isBedrockAppInferenceProfile(modelId)) return streamFn;
		return createBedrockNoCacheWrapper(streamFn);
	};
	/** Extract the AWS region from a bedrock-runtime baseUrl. */
	function extractRegionFromBaseUrl(baseUrl) {
		if (!baseUrl) return;
		return bedrockRegionRe.exec(baseUrl)?.[1];
	}
	/**
	* Resolve the AWS region for Bedrock API calls.
	* Provider-specific baseUrl wins over global bedrockDiscovery to avoid signing
	* with the wrong region when discovery and provider target different regions.
	*/
	function resolveBedrockRegion(config) {
		const providers = config?.models?.providers;
		if (providers) {
			const exact = providers[providerId]?.baseUrl;
			if (exact) {
				const region = extractRegionFromBaseUrl(exact);
				if (region) return region;
			}
			for (const [key, value] of Object.entries(providers)) {
				if (key === providerId || normalizeProviderId(key) !== providerId) continue;
				const region = extractRegionFromBaseUrl(value.baseUrl);
				if (region) return region;
			}
		}
		return config?.models?.bedrockDiscovery?.region;
	}
	api.registerProvider({
		id: providerId,
		label: "Amazon Bedrock",
		docsPath: "/providers/models",
		auth: [],
		catalog: {
			order: "simple",
			run: async (ctx) => {
				const currentPluginConfig = resolveCurrentPluginConfig(ctx.config);
				const implicit = await resolveImplicitBedrockProvider({
					config: ctx.config,
					pluginConfig: currentPluginConfig,
					env: ctx.env
				});
				if (!implicit) return null;
				return { provider: mergeImplicitBedrockProvider({
					existing: ctx.config.models?.providers?.[providerId],
					implicit
				}) };
			}
		},
		resolveConfigApiKey: ({ env }) => resolveBedrockConfigApiKey(env),
		...anthropicByModelReplayHooks,
		wrapStreamFn: ({ modelId, config, model, streamFn }) => {
			const currentGuardrail = resolveCurrentPluginConfig(config)?.guardrail;
			const wrapped = currentGuardrail?.guardrailIdentifier && currentGuardrail?.guardrailVersion ? createGuardrailWrapStreamFn(baseWrapStreamFn, currentGuardrail)({
				modelId,
				streamFn
			}) : baseWrapStreamFn({
				modelId,
				streamFn
			});
			const region = resolveBedrockRegion(config) ?? extractRegionFromBaseUrl(model?.baseUrl);
			const mayNeedCacheInjection = isBedrockAppInferenceProfile(modelId) && !piAiWouldInjectCachePoints(modelId);
			const heuristicMatch = needsCachePointInjection(modelId);
			if (!region && !mayNeedCacheInjection) return wrapped;
			const underlying = wrapped ?? streamFn;
			if (!underlying) return wrapped;
			return (streamModel, context, options) => {
				const merged = Object.assign({}, options, region ? { region } : {});
				if (!mayNeedCacheInjection) return underlying(streamModel, context, merged);
				const cacheRetention = typeof merged.cacheRetention === "string" ? merged.cacheRetention : "short";
				if (heuristicMatch) return streamWithPayloadPatch(underlying, streamModel, context, merged, (payload) => {
					injectBedrockCachePoints(payload, cacheRetention);
				});
				const originalOnPayload = merged.onPayload;
				return underlying(streamModel, context, {
					...merged,
					onPayload: async (payload, payloadModel) => {
						if (await resolveAppProfileCacheEligible(modelId, region) && payload && typeof payload === "object") injectBedrockCachePoints(payload, cacheRetention);
						return originalOnPayload?.(payload, payloadModel);
					}
				});
			};
		},
		matchesContextOverflowError: ({ errorMessage }) => bedrockContextOverflowPatterns.some((pattern) => pattern.test(errorMessage)),
		classifyFailoverReason: ({ errorMessage }) => {
			if (/ThrottlingException|Too many concurrent requests/i.test(errorMessage)) return "rate_limit";
			if (/ModelNotReadyException/i.test(errorMessage)) return "overloaded";
		},
		resolveThinkingProfile: ({ modelId }) => ({
			levels: [
				{ id: "off" },
				{ id: "minimal" },
				{ id: "low" },
				{ id: "medium" },
				{ id: "high" },
				...claude46ModelRe.test(modelId.trim()) ? [{ id: "adaptive" }] : []
			],
			defaultLevel: claude46ModelRe.test(modelId.trim()) ? "adaptive" : void 0
		})
	});
}
//#endregion
export { registerAmazonBedrockPlugin, resetBedrockAppProfileCacheEligibilityForTest };
