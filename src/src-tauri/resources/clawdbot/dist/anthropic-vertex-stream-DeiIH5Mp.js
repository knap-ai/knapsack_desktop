import "./defaults-BwiMD7ye.js";
import { n as findNormalizedProviderValue, r as normalizeProviderId } from "./provider-id-CTiEzT1T.js";
import { o as normalizeModelCompat } from "./provider-model-shared-B0P3sbBu.js";
import "./model-selection-8a6zD_aX.js";
import { t as resolveOpenClawAgentDir } from "./agent-paths-BiYMSfDv.js";
import { I as runProviderDynamicModel, c as clearProviderRuntimeHookCache, g as prepareProviderDynamicModel, h as normalizeProviderTransportWithPlugin, j as resolveProviderStreamFn, n as applyProviderResolvedModelCompatWithPlugins, p as normalizeProviderResolvedModelWithPlugin, r as applyProviderResolvedTransportWithPlugin, s as buildProviderUnknownModelHintWithPlugin } from "./provider-runtime-Dhor2yYF.js";
import { f as isSecretRefHeaderValueMarker } from "./model-auth-markers-BjPX15EF.js";
import { i as discoverModels, r as discoverAuthStorage } from "./pi-model-discovery-BeVyC0Vk.js";
import { i as resolveProviderRequestConfig } from "./provider-request-config-0I1kx7Qd.js";
import { n as shouldSuppressBuiltInModel, t as buildSuppressedBuiltInModelError } from "./model-suppression-iE5DGYO3.js";
import { c as resolveAnthropicVertexProjectId, o as resolveAnthropicVertexClientRegion } from "./anthropic-vertex-BwgF0JMo.js";
import { getApiProvider, registerApiProvider, streamAnthropic } from "@mariozechner/pi-ai";
import { AnthropicVertex } from "@anthropic-ai/vertex-sdk";
//#region src/agents/custom-api-registry.ts
const CUSTOM_API_SOURCE_PREFIX = "openclaw-custom-api:";
function getCustomApiRegistrySourceId(api) {
	return `${CUSTOM_API_SOURCE_PREFIX}${api}`;
}
function ensureCustomApiRegistered(api, streamFn) {
	if (getApiProvider(api)) return false;
	registerApiProvider({
		api,
		stream: (model, context, options) => streamFn(model, context, options),
		streamSimple: (model, context, options) => streamFn(model, context, options)
	}, getCustomApiRegistrySourceId(api));
	return true;
}
//#endregion
//#region src/agents/provider-stream.ts
function registerProviderStreamForModel(params) {
	const streamFn = resolveProviderStreamFn({
		provider: params.model.provider,
		config: params.cfg,
		workspaceDir: params.workspaceDir,
		env: params.env,
		context: {
			config: params.cfg,
			agentDir: params.agentDir,
			workspaceDir: params.workspaceDir,
			provider: params.model.provider,
			modelId: params.model.id,
			model: params.model
		}
	});
	if (!streamFn) return;
	ensureCustomApiRegistered(params.model.api, streamFn);
	return streamFn;
}
//#endregion
//#region src/agents/model-alias-lines.ts
function buildModelAliasLines(cfg) {
	const models = cfg?.agents?.defaults?.models ?? {};
	const entries = [];
	for (const [keyRaw, entryRaw] of Object.entries(models)) {
		const model = String(keyRaw ?? "").trim();
		if (!model) continue;
		const alias = String(entryRaw?.alias ?? "").trim();
		if (!alias) continue;
		entries.push({
			alias,
			model
		});
	}
	return entries.toSorted((a, b) => a.alias.localeCompare(b.alias)).map((entry) => `- ${entry.alias}: ${entry.model}`);
}
//#endregion
//#region src/agents/pi-embedded-runner/model.provider-normalization.ts
function normalizeResolvedProviderModel(params) {
	return normalizeModelCompat(params.model);
}
//#endregion
//#region src/agents/pi-embedded-runner/model.ts
const DEFAULT_PROVIDER_RUNTIME_HOOKS = {
	applyProviderResolvedModelCompatWithPlugins,
	applyProviderResolvedTransportWithPlugin,
	buildProviderUnknownModelHintWithPlugin,
	prepareProviderDynamicModel,
	runProviderDynamicModel,
	normalizeProviderResolvedModelWithPlugin,
	normalizeProviderTransportWithPlugin
};
const STATIC_PROVIDER_RUNTIME_HOOKS = {
	applyProviderResolvedModelCompatWithPlugins: () => void 0,
	applyProviderResolvedTransportWithPlugin: () => void 0,
	buildProviderUnknownModelHintWithPlugin: () => void 0,
	prepareProviderDynamicModel: async () => {},
	runProviderDynamicModel: () => void 0,
	normalizeProviderResolvedModelWithPlugin: () => void 0,
	normalizeProviderTransportWithPlugin: () => void 0
};
function resolveRuntimeHooks(params) {
	if (params?.skipProviderRuntimeHooks) return STATIC_PROVIDER_RUNTIME_HOOKS;
	return params?.runtimeHooks ?? DEFAULT_PROVIDER_RUNTIME_HOOKS;
}
function normalizeResolvedTransportApi(api) {
	switch (api) {
		case "anthropic-messages":
		case "bedrock-converse-stream":
		case "github-copilot":
		case "google-generative-ai":
		case "ollama":
		case "openai-codex-responses":
		case "openai-completions":
		case "openai-responses":
		case "azure-openai-responses": return api;
		default: return;
	}
}
function sanitizeModelHeaders(headers, opts) {
	if (!headers || typeof headers !== "object" || Array.isArray(headers)) return;
	const next = {};
	for (const [headerName, headerValue] of Object.entries(headers)) {
		if (typeof headerValue !== "string") continue;
		if (opts?.stripSecretRefMarkers && isSecretRefHeaderValueMarker(headerValue)) continue;
		next[headerName] = headerValue;
	}
	return Object.keys(next).length > 0 ? next : void 0;
}
function applyResolvedTransportFallback(params) {
	const normalized = params.runtimeHooks.normalizeProviderTransportWithPlugin({
		provider: params.provider,
		config: params.cfg,
		context: {
			provider: params.provider,
			api: params.model.api,
			baseUrl: params.model.baseUrl
		}
	});
	if (!normalized) return;
	const nextApi = normalizeResolvedTransportApi(normalized.api) ?? params.model.api;
	const nextBaseUrl = normalized.baseUrl ?? params.model.baseUrl;
	if (nextApi === params.model.api && nextBaseUrl === params.model.baseUrl) return;
	return {
		...params.model,
		api: nextApi,
		baseUrl: nextBaseUrl
	};
}
function normalizeResolvedModel(params) {
	const normalizedInputModel = Array.isArray(params.model.input) && params.model.input.length > 0 ? params.model : {
		...params.model,
		input: ["text"]
	};
	const runtimeHooks = params.runtimeHooks ?? DEFAULT_PROVIDER_RUNTIME_HOOKS;
	const pluginNormalized = runtimeHooks.normalizeProviderResolvedModelWithPlugin({
		provider: params.provider,
		config: params.cfg,
		context: {
			config: params.cfg,
			agentDir: params.agentDir,
			provider: params.provider,
			modelId: normalizedInputModel.id,
			model: normalizedInputModel
		}
	});
	const compatNormalized = runtimeHooks.applyProviderResolvedModelCompatWithPlugins?.({
		provider: params.provider,
		config: params.cfg,
		context: {
			config: params.cfg,
			agentDir: params.agentDir,
			provider: params.provider,
			modelId: normalizedInputModel.id,
			model: pluginNormalized ?? normalizedInputModel
		}
	});
	const fallbackTransportNormalized = runtimeHooks.applyProviderResolvedTransportWithPlugin?.({
		provider: params.provider,
		config: params.cfg,
		context: {
			config: params.cfg,
			agentDir: params.agentDir,
			provider: params.provider,
			modelId: normalizedInputModel.id,
			model: compatNormalized ?? pluginNormalized ?? normalizedInputModel
		}
	}) ?? applyResolvedTransportFallback({
		provider: params.provider,
		cfg: params.cfg,
		runtimeHooks,
		model: compatNormalized ?? pluginNormalized ?? normalizedInputModel
	});
	return normalizeResolvedProviderModel({
		provider: params.provider,
		model: fallbackTransportNormalized ?? compatNormalized ?? pluginNormalized ?? normalizedInputModel
	});
}
function resolveProviderTransport(params) {
	const normalized = (params.runtimeHooks ?? DEFAULT_PROVIDER_RUNTIME_HOOKS).normalizeProviderTransportWithPlugin({
		provider: params.provider,
		config: params.cfg,
		context: {
			provider: params.provider,
			api: params.api,
			baseUrl: params.baseUrl
		}
	});
	return {
		api: normalizeResolvedTransportApi(normalized?.api ?? params.api),
		baseUrl: normalized?.baseUrl ?? params.baseUrl
	};
}
function findInlineModelMatch(params) {
	const inlineModels = buildInlineProviderModels(params.providers);
	const exact = inlineModels.find((entry) => entry.provider === params.provider && entry.id === params.modelId);
	if (exact) return exact;
	const normalizedProvider = normalizeProviderId(params.provider);
	return inlineModels.find((entry) => normalizeProviderId(entry.provider) === normalizedProvider && entry.id === params.modelId);
}
function resolveConfiguredProviderConfig(cfg, provider) {
	const configuredProviders = cfg?.models?.providers;
	if (!configuredProviders) return;
	const exactProviderConfig = configuredProviders[provider];
	if (exactProviderConfig) return exactProviderConfig;
	return findNormalizedProviderValue(configuredProviders, provider);
}
function applyConfiguredProviderOverrides(params) {
	const { discoveredModel, providerConfig, modelId } = params;
	if (!providerConfig) return {
		...discoveredModel,
		headers: sanitizeModelHeaders(discoveredModel.headers, { stripSecretRefMarkers: true })
	};
	const configuredModel = providerConfig.models?.find((candidate) => candidate.id === modelId);
	const discoveredHeaders = sanitizeModelHeaders(discoveredModel.headers, { stripSecretRefMarkers: true });
	const providerHeaders = sanitizeModelHeaders(providerConfig.headers, { stripSecretRefMarkers: true });
	const configuredHeaders = sanitizeModelHeaders(configuredModel?.headers, { stripSecretRefMarkers: true });
	if (!configuredModel && !providerConfig.baseUrl && !providerConfig.api && !providerHeaders) return {
		...discoveredModel,
		headers: discoveredHeaders
	};
	const resolvedInput = configuredModel?.input ?? discoveredModel.input;
	const normalizedInput = Array.isArray(resolvedInput) && resolvedInput.length > 0 ? resolvedInput.filter((item) => item === "text" || item === "image") : ["text"];
	const resolvedTransport = resolveProviderTransport({
		provider: params.provider,
		api: configuredModel?.api ?? providerConfig.api ?? discoveredModel.api,
		baseUrl: providerConfig.baseUrl ?? discoveredModel.baseUrl,
		cfg: params.cfg,
		runtimeHooks: params.runtimeHooks
	});
	const requestConfig = resolveProviderRequestConfig({
		provider: params.provider,
		api: resolvedTransport.api ?? normalizeResolvedTransportApi(discoveredModel.api) ?? "openai-responses",
		baseUrl: resolvedTransport.baseUrl ?? discoveredModel.baseUrl,
		discoveredHeaders,
		providerHeaders,
		modelHeaders: configuredHeaders,
		authHeader: providerConfig.authHeader,
		capability: "llm",
		transport: "stream"
	});
	return {
		...discoveredModel,
		api: requestConfig.api ?? "openai-responses",
		baseUrl: requestConfig.baseUrl ?? discoveredModel.baseUrl,
		reasoning: configuredModel?.reasoning ?? discoveredModel.reasoning,
		input: normalizedInput,
		cost: configuredModel?.cost ?? discoveredModel.cost,
		contextWindow: configuredModel?.contextWindow ?? discoveredModel.contextWindow,
		maxTokens: configuredModel?.maxTokens ?? discoveredModel.maxTokens,
		headers: requestConfig.headers,
		compat: configuredModel?.compat ?? discoveredModel.compat
	};
}
function buildInlineProviderModels(providers) {
	return Object.entries(providers).flatMap(([providerId, entry]) => {
		const trimmed = providerId.trim();
		if (!trimmed) return [];
		const providerHeaders = sanitizeModelHeaders(entry?.headers, { stripSecretRefMarkers: true });
		return (entry?.models ?? []).map((model) => {
			const transport = resolveProviderTransport({
				provider: trimmed,
				api: model.api ?? entry?.api,
				baseUrl: entry?.baseUrl
			});
			const modelHeaders = sanitizeModelHeaders(model.headers, { stripSecretRefMarkers: true });
			const requestConfig = resolveProviderRequestConfig({
				provider: trimmed,
				api: transport.api ?? model.api,
				baseUrl: transport.baseUrl,
				providerHeaders,
				modelHeaders,
				authHeader: entry?.authHeader,
				capability: "llm",
				transport: "stream"
			});
			return {
				...model,
				provider: trimmed,
				baseUrl: requestConfig.baseUrl,
				api: requestConfig.api ?? model.api,
				headers: requestConfig.headers
			};
		});
	});
}
function resolveExplicitModelWithRegistry(params) {
	const { provider, modelId, modelRegistry, cfg, agentDir, runtimeHooks } = params;
	if (shouldSuppressBuiltInModel({
		provider,
		id: modelId
	})) return { kind: "suppressed" };
	const providerConfig = resolveConfiguredProviderConfig(cfg, provider);
	const inlineMatch = findInlineModelMatch({
		providers: cfg?.models?.providers ?? {},
		provider,
		modelId
	});
	if (inlineMatch?.api) return {
		kind: "resolved",
		model: normalizeResolvedModel({
			provider,
			cfg,
			agentDir,
			model: inlineMatch,
			runtimeHooks
		})
	};
	const model = modelRegistry.find(provider, modelId);
	if (model) return {
		kind: "resolved",
		model: normalizeResolvedModel({
			provider,
			cfg,
			agentDir,
			model: applyConfiguredProviderOverrides({
				provider,
				discoveredModel: model,
				providerConfig,
				modelId,
				cfg,
				runtimeHooks
			}),
			runtimeHooks
		})
	};
	const fallbackInlineMatch = findInlineModelMatch({
		providers: cfg?.models?.providers ?? {},
		provider,
		modelId
	});
	if (fallbackInlineMatch?.api) return {
		kind: "resolved",
		model: normalizeResolvedModel({
			provider,
			cfg,
			agentDir,
			model: fallbackInlineMatch,
			runtimeHooks
		})
	};
}
function resolvePluginDynamicModelWithRegistry(params) {
	const { provider, modelId, modelRegistry, cfg, agentDir } = params;
	const runtimeHooks = params.runtimeHooks ?? DEFAULT_PROVIDER_RUNTIME_HOOKS;
	const providerConfig = resolveConfiguredProviderConfig(cfg, provider);
	const pluginDynamicModel = runtimeHooks.runProviderDynamicModel({
		provider,
		config: cfg,
		context: {
			config: cfg,
			agentDir,
			provider,
			modelId,
			modelRegistry,
			providerConfig
		}
	});
	if (!pluginDynamicModel) return;
	return normalizeResolvedModel({
		provider,
		cfg,
		agentDir,
		model: applyConfiguredProviderOverrides({
			provider,
			discoveredModel: pluginDynamicModel,
			providerConfig,
			modelId,
			cfg,
			runtimeHooks
		}),
		runtimeHooks
	});
}
function resolveConfiguredFallbackModel(params) {
	const { provider, modelId, cfg, agentDir, runtimeHooks } = params;
	const providerConfig = resolveConfiguredProviderConfig(cfg, provider);
	const configuredModel = providerConfig?.models?.find((candidate) => candidate.id === modelId);
	const providerHeaders = sanitizeModelHeaders(providerConfig?.headers, { stripSecretRefMarkers: true });
	const modelHeaders = sanitizeModelHeaders(configuredModel?.headers, { stripSecretRefMarkers: true });
	if (!providerConfig && !modelId.startsWith("mock-")) return;
	const fallbackTransport = resolveProviderTransport({
		provider,
		api: providerConfig?.api ?? "openai-responses",
		baseUrl: providerConfig?.baseUrl,
		cfg,
		runtimeHooks
	});
	const requestConfig = resolveProviderRequestConfig({
		provider,
		api: fallbackTransport.api ?? "openai-responses",
		baseUrl: fallbackTransport.baseUrl,
		providerHeaders,
		modelHeaders,
		authHeader: providerConfig?.authHeader,
		capability: "llm",
		transport: "stream"
	});
	return normalizeResolvedModel({
		provider,
		cfg,
		agentDir,
		model: {
			id: modelId,
			name: modelId,
			api: requestConfig.api ?? "openai-responses",
			provider,
			baseUrl: requestConfig.baseUrl,
			reasoning: configuredModel?.reasoning ?? false,
			input: ["text"],
			cost: {
				input: 0,
				output: 0,
				cacheRead: 0,
				cacheWrite: 0
			},
			contextWindow: configuredModel?.contextWindow ?? providerConfig?.models?.[0]?.contextWindow ?? 2e5,
			maxTokens: configuredModel?.maxTokens ?? providerConfig?.models?.[0]?.maxTokens ?? 2e5,
			headers: requestConfig.headers
		},
		runtimeHooks
	});
}
function resolveModelWithRegistry(params) {
	const explicitModel = resolveExplicitModelWithRegistry(params);
	if (explicitModel?.kind === "suppressed") return;
	if (explicitModel?.kind === "resolved") return explicitModel.model;
	const pluginDynamicModel = resolvePluginDynamicModelWithRegistry(params);
	if (pluginDynamicModel) return pluginDynamicModel;
	return resolveConfiguredFallbackModel(params);
}
function resolveModel(provider, modelId, agentDir, cfg, options) {
	const resolvedAgentDir = agentDir ?? resolveOpenClawAgentDir();
	const authStorage = options?.authStorage ?? discoverAuthStorage(resolvedAgentDir);
	const modelRegistry = options?.modelRegistry ?? discoverModels(authStorage, resolvedAgentDir);
	const runtimeHooks = resolveRuntimeHooks(options);
	const model = resolveModelWithRegistry({
		provider,
		modelId,
		modelRegistry,
		cfg,
		agentDir: resolvedAgentDir,
		runtimeHooks
	});
	if (model) return {
		model,
		authStorage,
		modelRegistry
	};
	return {
		error: buildUnknownModelError({
			provider,
			modelId,
			cfg,
			agentDir: resolvedAgentDir,
			runtimeHooks
		}),
		authStorage,
		modelRegistry
	};
}
async function resolveModelAsync(provider, modelId, agentDir, cfg, options) {
	const resolvedAgentDir = agentDir ?? resolveOpenClawAgentDir();
	const authStorage = options?.authStorage ?? discoverAuthStorage(resolvedAgentDir);
	const modelRegistry = options?.modelRegistry ?? discoverModels(authStorage, resolvedAgentDir);
	const runtimeHooks = resolveRuntimeHooks(options);
	const explicitModel = resolveExplicitModelWithRegistry({
		provider,
		modelId,
		modelRegistry,
		cfg,
		agentDir: resolvedAgentDir,
		runtimeHooks
	});
	if (explicitModel?.kind === "suppressed") return {
		error: buildUnknownModelError({
			provider,
			modelId,
			cfg,
			agentDir: resolvedAgentDir,
			runtimeHooks
		}),
		authStorage,
		modelRegistry
	};
	const providerConfig = resolveConfiguredProviderConfig(cfg, provider);
	const resolveDynamicAttempt = async (attemptOptions) => {
		if (attemptOptions?.clearHookCache) clearProviderRuntimeHookCache();
		await runtimeHooks.prepareProviderDynamicModel({
			provider,
			config: cfg,
			context: {
				config: cfg,
				agentDir: resolvedAgentDir,
				provider,
				modelId,
				modelRegistry,
				providerConfig
			}
		});
		return resolveModelWithRegistry({
			provider,
			modelId,
			modelRegistry,
			cfg,
			agentDir: resolvedAgentDir,
			runtimeHooks
		});
	};
	let model = explicitModel?.kind === "resolved" ? explicitModel.model : await resolveDynamicAttempt();
	if (!model && !explicitModel && options?.retryTransientProviderRuntimeMiss) model = await resolveDynamicAttempt({ clearHookCache: true });
	if (model) return {
		model,
		authStorage,
		modelRegistry
	};
	return {
		error: buildUnknownModelError({
			provider,
			modelId,
			cfg,
			agentDir: resolvedAgentDir,
			runtimeHooks
		}),
		authStorage,
		modelRegistry
	};
}
/**
* Build a more helpful error when the model is not found.
*
* Some provider plugins only become available after setup/auth has registered
* them. When users point `agents.defaults.model.primary` at one of those
* providers before setup, the raw `Unknown model` error is too vague. Provider
* plugins can append a targeted recovery hint here.
*
* See: https://github.com/openclaw/openclaw/issues/17328
*/
function buildUnknownModelError(params) {
	const suppressed = buildSuppressedBuiltInModelError({
		provider: params.provider,
		id: params.modelId
	});
	if (suppressed) return suppressed;
	const base = `Unknown model: ${params.provider}/${params.modelId}`;
	const hint = (params.runtimeHooks ?? DEFAULT_PROVIDER_RUNTIME_HOOKS).buildProviderUnknownModelHintWithPlugin({
		provider: params.provider,
		config: params.cfg,
		env: process.env,
		context: {
			config: params.cfg,
			agentDir: params.agentDir,
			env: process.env,
			provider: params.provider,
			modelId: params.modelId
		}
	});
	return hint ? `${base}. ${hint}` : base;
}
//#endregion
//#region src/agents/anthropic-vertex-stream.ts
function resolveAnthropicVertexMaxTokens(params) {
	const modelMax = typeof params.modelMaxTokens === "number" && Number.isFinite(params.modelMaxTokens) && params.modelMaxTokens > 0 ? Math.floor(params.modelMaxTokens) : void 0;
	const requested = typeof params.requestedMaxTokens === "number" && Number.isFinite(params.requestedMaxTokens) && params.requestedMaxTokens > 0 ? Math.floor(params.requestedMaxTokens) : void 0;
	if (modelMax !== void 0 && requested !== void 0) return Math.min(requested, modelMax);
	return requested ?? modelMax;
}
/**
* Create a StreamFn that routes through pi-ai's `streamAnthropic` with an
* injected `AnthropicVertex` client.  All streaming, message conversion, and
* event handling is handled by pi-ai — we only supply the GCP-authenticated
* client and map SimpleStreamOptions → AnthropicOptions.
*/
function createAnthropicVertexStreamFn(projectId, region, baseURL) {
	const client = new AnthropicVertex({
		region,
		...baseURL ? { baseURL } : {},
		...projectId ? { projectId } : {}
	});
	return (model, context, options) => {
		const maxTokens = resolveAnthropicVertexMaxTokens({
			modelMaxTokens: model.maxTokens,
			requestedMaxTokens: options?.maxTokens
		});
		const opts = {
			client,
			temperature: options?.temperature,
			...maxTokens !== void 0 ? { maxTokens } : {},
			signal: options?.signal,
			cacheRetention: options?.cacheRetention,
			sessionId: options?.sessionId,
			headers: options?.headers,
			onPayload: options?.onPayload,
			maxRetryDelayMs: options?.maxRetryDelayMs,
			metadata: options?.metadata
		};
		if (options?.reasoning) if (model.id.includes("opus-4-6") || model.id.includes("opus-4.6") || model.id.includes("sonnet-4-6") || model.id.includes("sonnet-4.6")) {
			opts.thinkingEnabled = true;
			opts.effort = {
				minimal: "low",
				low: "low",
				medium: "medium",
				high: "high",
				xhigh: model.id.includes("opus-4-6") || model.id.includes("opus-4.6") ? "max" : "high"
			}[options.reasoning] ?? "high";
		} else {
			opts.thinkingEnabled = true;
			const budgets = options.thinkingBudgets;
			opts.thinkingBudgetTokens = (budgets && options.reasoning in budgets ? budgets[options.reasoning] : void 0) ?? 1e4;
		}
		else opts.thinkingEnabled = false;
		return streamAnthropic(model, context, opts);
	};
}
function resolveAnthropicVertexSdkBaseUrl(baseUrl) {
	const trimmed = baseUrl?.trim();
	if (!trimmed) return;
	try {
		const url = new URL(trimmed);
		const normalizedPath = url.pathname.replace(/\/+$/, "");
		if (!normalizedPath || normalizedPath === "") {
			url.pathname = "/v1";
			return url.toString().replace(/\/$/, "");
		}
		if (!normalizedPath.endsWith("/v1")) {
			url.pathname = `${normalizedPath}/v1`;
			return url.toString().replace(/\/$/, "");
		}
		return trimmed;
	} catch {
		return trimmed;
	}
}
function createAnthropicVertexStreamFnForModel(model, env = process.env) {
	return createAnthropicVertexStreamFn(resolveAnthropicVertexProjectId(env), resolveAnthropicVertexClientRegion({
		baseUrl: model.baseUrl,
		env
	}), resolveAnthropicVertexSdkBaseUrl(model.baseUrl));
}
//#endregion
export { buildModelAliasLines as a, resolveModelWithRegistry as i, resolveModel as n, registerProviderStreamForModel as o, resolveModelAsync as r, ensureCustomApiRegistered as s, createAnthropicVertexStreamFnForModel as t };
