import { i as normalizeModelCompat } from "./provider-model-compat-Dsxuyzi4.js";
import "./provider-model-shared-DyDnBaDe.js";
import { l as readCodexPluginConfig, n as listCodexAppServerModels, u as resolveCodexAppServerRuntimeOptions } from "./harness-CEkXZeCP.js";
//#region extensions/codex/provider.ts
const PROVIDER_ID = "codex";
const CODEX_BASE_URL = "https://chatgpt.com/backend-api";
const DEFAULT_CONTEXT_WINDOW = 272e3;
const DEFAULT_MAX_TOKENS = 128e3;
const DEFAULT_DISCOVERY_TIMEOUT_MS = 2500;
const LIVE_DISCOVERY_ENV = "OPENCLAW_CODEX_DISCOVERY_LIVE";
const FALLBACK_CODEX_MODELS = [
	{
		id: "gpt-5.4",
		model: "gpt-5.4",
		displayName: "gpt-5.4",
		description: "Latest frontier agentic coding model.",
		isDefault: true,
		inputModalities: ["text", "image"],
		supportedReasoningEfforts: [
			"low",
			"medium",
			"high",
			"xhigh"
		]
	},
	{
		id: "gpt-5.4-mini",
		model: "gpt-5.4-mini",
		displayName: "GPT-5.4-Mini",
		description: "Smaller frontier agentic coding model.",
		inputModalities: ["text", "image"],
		supportedReasoningEfforts: [
			"low",
			"medium",
			"high",
			"xhigh"
		]
	},
	{
		id: "gpt-5.2",
		model: "gpt-5.2",
		displayName: "gpt-5.2",
		inputModalities: ["text", "image"],
		supportedReasoningEfforts: [
			"low",
			"medium",
			"high",
			"xhigh"
		]
	}
];
function buildCodexProvider(options = {}) {
	return {
		id: PROVIDER_ID,
		label: "Codex",
		docsPath: "/providers/models",
		auth: [],
		catalog: {
			order: "late",
			run: async (ctx) => buildCodexProviderCatalog({
				env: ctx.env,
				pluginConfig: options.pluginConfig,
				listModels: options.listModels
			})
		},
		resolveDynamicModel: (ctx) => resolveCodexDynamicModel(ctx.modelId),
		resolveSyntheticAuth: () => ({
			apiKey: "codex-app-server",
			source: "codex-app-server",
			mode: "token"
		}),
		supportsXHighThinking: ({ modelId }) => isKnownXHighCodexModel(modelId),
		isModernModelRef: ({ modelId }) => isModernCodexModel(modelId)
	};
}
async function buildCodexProviderCatalog(options = {}) {
	const config = readCodexPluginConfig(options.pluginConfig);
	const appServer = resolveCodexAppServerRuntimeOptions({ pluginConfig: options.pluginConfig });
	const timeoutMs = normalizeTimeoutMs(config.discovery?.timeoutMs);
	let discovered = [];
	if (config.discovery?.enabled !== false && !shouldSkipLiveDiscovery(options.env)) discovered = await listModelsBestEffort({
		listModels: options.listModels ?? listCodexAppServerModels,
		timeoutMs,
		startOptions: appServer.start
	});
	return { provider: {
		baseUrl: CODEX_BASE_URL,
		apiKey: "codex-app-server",
		auth: "token",
		api: "openai-codex-responses",
		models: (discovered.length > 0 ? discovered : FALLBACK_CODEX_MODELS).map(codexModelToDefinition)
	} };
}
function resolveCodexDynamicModel(modelId) {
	const id = modelId.trim();
	if (!id) return;
	return normalizeModelCompat({
		...buildModelDefinition({
			id,
			model: id,
			inputModalities: ["text", "image"],
			supportedReasoningEfforts: shouldDefaultToReasoningModel(id) ? ["medium"] : []
		}),
		provider: PROVIDER_ID,
		baseUrl: CODEX_BASE_URL
	});
}
function codexModelToDefinition(model) {
	return buildModelDefinition(model);
}
function buildModelDefinition(model) {
	const id = model.id.trim() || model.model.trim();
	return {
		id,
		name: model.displayName?.trim() || id,
		api: "openai-codex-responses",
		reasoning: model.supportedReasoningEfforts.length > 0 || shouldDefaultToReasoningModel(id),
		input: model.inputModalities.includes("image") ? ["text", "image"] : ["text"],
		cost: {
			input: 0,
			output: 0,
			cacheRead: 0,
			cacheWrite: 0
		},
		contextWindow: DEFAULT_CONTEXT_WINDOW,
		maxTokens: DEFAULT_MAX_TOKENS,
		compat: {
			supportsReasoningEffort: model.supportedReasoningEfforts.length > 0,
			supportsUsageInStreaming: true
		}
	};
}
async function listModelsBestEffort(params) {
	try {
		return (await params.listModels({
			timeoutMs: params.timeoutMs,
			limit: 100,
			startOptions: params.startOptions,
			sharedClient: false
		})).models.filter((model) => !model.hidden);
	} catch {
		return [];
	}
}
function normalizeTimeoutMs(value) {
	return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : DEFAULT_DISCOVERY_TIMEOUT_MS;
}
function shouldSkipLiveDiscovery(env = process.env) {
	const override = env[LIVE_DISCOVERY_ENV]?.trim().toLowerCase();
	if (override === "0" || override === "false") return true;
	return Boolean(env.VITEST) && override !== "1";
}
function shouldDefaultToReasoningModel(modelId) {
	const lower = modelId.toLowerCase();
	return lower.startsWith("gpt-5") || lower.startsWith("o1") || lower.startsWith("o3") || lower.startsWith("o4");
}
function isKnownXHighCodexModel(modelId) {
	const lower = modelId.trim().toLowerCase();
	return lower.startsWith("gpt-5") || lower.startsWith("o3") || lower.startsWith("o4") || lower.includes("codex");
}
function isModernCodexModel(modelId) {
	const lower = modelId.trim().toLowerCase();
	return lower === "gpt-5.4" || lower === "gpt-5.4-mini" || lower === "gpt-5.2";
}
//#endregion
export { buildCodexProviderCatalog as n, buildCodexProvider as t };
