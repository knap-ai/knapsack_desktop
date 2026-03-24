import { i as resolveAnthropicVertexRegion } from "./anthropic-vertex-provider-B2x4YywE.js";
//#region src/plugins/provider-catalog.ts
function findCatalogTemplate(params) {
	return params.templateIds.map((templateId) => params.entries.find((entry) => entry.provider.toLowerCase() === params.providerId.toLowerCase() && entry.id.toLowerCase() === templateId.toLowerCase())).find((entry) => entry !== void 0);
}
async function buildSingleProviderApiKeyCatalog(params) {
	const apiKey = params.ctx.resolveProviderApiKey(params.providerId).apiKey;
	if (!apiKey) return null;
	const explicitProvider = params.allowExplicitBaseUrl ? params.ctx.config.models?.providers?.[params.providerId] : void 0;
	const explicitBaseUrl = typeof explicitProvider?.baseUrl === "string" ? explicitProvider.baseUrl.trim() : "";
	return { provider: {
		...await params.buildProvider(),
		...explicitBaseUrl ? { baseUrl: explicitBaseUrl } : {},
		apiKey
	} };
}
async function buildPairedProviderApiKeyCatalog(params) {
	const apiKey = params.ctx.resolveProviderApiKey(params.providerId).apiKey;
	if (!apiKey) return null;
	const providers = await params.buildProviders();
	return { providers: Object.fromEntries(Object.entries(providers).map(([id, provider]) => [id, {
		...provider,
		apiKey
	}])) };
}
//#endregion
//#region extensions/anthropic-vertex/provider-catalog.ts
const ANTHROPIC_VERTEX_DEFAULT_MODEL_ID = "claude-sonnet-4-6";
const ANTHROPIC_VERTEX_DEFAULT_CONTEXT_WINDOW = 1e6;
const GCP_VERTEX_CREDENTIALS_MARKER = "gcp-vertex-credentials";
function buildAnthropicVertexModel(params) {
	return {
		id: params.id,
		name: params.name,
		reasoning: params.reasoning,
		input: params.input,
		cost: params.cost,
		contextWindow: ANTHROPIC_VERTEX_DEFAULT_CONTEXT_WINDOW,
		maxTokens: params.maxTokens
	};
}
function buildAnthropicVertexCatalog() {
	return [buildAnthropicVertexModel({
		id: "claude-opus-4-6",
		name: "Claude Opus 4.6",
		reasoning: true,
		input: ["text", "image"],
		cost: {
			input: 5,
			output: 25,
			cacheRead: .5,
			cacheWrite: 6.25
		},
		maxTokens: 128e3
	}), buildAnthropicVertexModel({
		id: ANTHROPIC_VERTEX_DEFAULT_MODEL_ID,
		name: "Claude Sonnet 4.6",
		reasoning: true,
		input: ["text", "image"],
		cost: {
			input: 3,
			output: 15,
			cacheRead: .3,
			cacheWrite: 3.75
		},
		maxTokens: 128e3
	})];
}
function buildAnthropicVertexProvider(params) {
	const region = resolveAnthropicVertexRegion(params?.env);
	return {
		baseUrl: region.toLowerCase() === "global" ? "https://aiplatform.googleapis.com" : `https://${region}-aiplatform.googleapis.com`,
		api: "anthropic-messages",
		apiKey: GCP_VERTEX_CREDENTIALS_MARKER,
		models: buildAnthropicVertexCatalog()
	};
}
//#endregion
export { findCatalogTemplate as a, buildSingleProviderApiKeyCatalog as i, buildAnthropicVertexProvider as n, buildPairedProviderApiKeyCatalog as r, ANTHROPIC_VERTEX_DEFAULT_MODEL_ID as t };
