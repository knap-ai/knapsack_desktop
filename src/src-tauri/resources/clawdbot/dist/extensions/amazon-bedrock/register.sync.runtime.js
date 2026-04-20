import { mergeImplicitBedrockProvider, resolveBedrockConfigApiKey, resolveImplicitBedrockProvider } from "./discovery.js";
import "./api.js";
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
	const pluginConfig = api.pluginConfig ?? {};
	const guardrail = pluginConfig.guardrail;
	const baseWrapStreamFn = ({ modelId, streamFn }) => isAnthropicBedrockModel(modelId) ? streamFn : createBedrockNoCacheWrapper(streamFn);
	const cacheWrapStreamFn = guardrail?.guardrailIdentifier && guardrail?.guardrailVersion ? createGuardrailWrapStreamFn(baseWrapStreamFn, guardrail) : baseWrapStreamFn;
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
				const implicit = await resolveImplicitBedrockProvider({
					config: ctx.config,
					pluginConfig,
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
			const wrapped = cacheWrapStreamFn({
				modelId,
				streamFn
			});
			const region = resolveBedrockRegion(config) ?? extractRegionFromBaseUrl(model?.baseUrl);
			if (!region) return wrapped;
			const underlying = wrapped ?? streamFn;
			if (!underlying) return wrapped;
			return (streamModel, context, options) => {
				return underlying(streamModel, context, Object.assign({}, options, { region }));
			};
		},
		matchesContextOverflowError: ({ errorMessage }) => bedrockContextOverflowPatterns.some((pattern) => pattern.test(errorMessage)),
		classifyFailoverReason: ({ errorMessage }) => {
			if (/ThrottlingException|Too many concurrent requests/i.test(errorMessage)) return "rate_limit";
			if (/ModelNotReadyException/i.test(errorMessage)) return "overloaded";
		},
		resolveDefaultThinkingLevel: ({ modelId }) => claude46ModelRe.test(modelId.trim()) ? "adaptive" : void 0
	});
}
//#endregion
export { registerAmazonBedrockPlugin };
