import { readFileSync } from "node:fs";
import { join } from "node:path";
import { homedir, platform } from "node:os";
//#region extensions/anthropic-vertex/provider-discovery.ts
const PROVIDER_ID = "anthropic-vertex";
const ANTHROPIC_VERTEX_DEFAULT_REGION = "global";
const ANTHROPIC_VERTEX_REGION_RE = /^[a-z0-9-]+$/;
const ANTHROPIC_VERTEX_DEFAULT_CONTEXT_WINDOW = 1e6;
const GCP_VERTEX_CREDENTIALS_MARKER = "gcp-vertex-credentials";
const GCLOUD_DEFAULT_ADC_PATH = join(homedir(), ".config", "gcloud", "application_default_credentials.json");
function normalizeOptionalString(value) {
	return typeof value === "string" && value.trim() ? value.trim() : void 0;
}
function normalizeLowercaseStringOrEmpty(value) {
	return normalizeOptionalString(value)?.toLowerCase() ?? "";
}
function resolveAnthropicVertexRegion(env = process.env) {
	const region = normalizeOptionalString(env.GOOGLE_CLOUD_LOCATION) || normalizeOptionalString(env.CLOUD_ML_REGION);
	return region && ANTHROPIC_VERTEX_REGION_RE.test(region) ? region : ANTHROPIC_VERTEX_DEFAULT_REGION;
}
function hasAnthropicVertexMetadataServerAdc(env = process.env) {
	const explicitMetadataOptIn = normalizeOptionalString(env.ANTHROPIC_VERTEX_USE_GCP_METADATA);
	return explicitMetadataOptIn === "1" || normalizeLowercaseStringOrEmpty(explicitMetadataOptIn) === "true";
}
function resolveAnthropicVertexDefaultAdcPath(env = process.env) {
	return platform() === "win32" ? join(env.APPDATA ?? join(homedir(), "AppData", "Roaming"), "gcloud", "application_default_credentials.json") : GCLOUD_DEFAULT_ADC_PATH;
}
function resolveAnthropicVertexAdcCredentialsPathCandidate(env = process.env) {
	const explicit = normalizeOptionalString(env.GOOGLE_APPLICATION_CREDENTIALS);
	if (explicit) return explicit;
	if (env !== process.env) return;
	return resolveAnthropicVertexDefaultAdcPath(env);
}
function readAnthropicVertexAdc(env = process.env) {
	const credentialsPath = resolveAnthropicVertexAdcCredentialsPathCandidate(env);
	if (!credentialsPath) return null;
	try {
		return JSON.parse(readFileSync(credentialsPath, "utf8"));
	} catch {
		return null;
	}
}
function hasAnthropicVertexAvailableAuth(env = process.env) {
	return hasAnthropicVertexMetadataServerAdc(env) || readAnthropicVertexAdc(env) !== null;
}
function resolveAnthropicVertexConfigApiKey(env = process.env) {
	return hasAnthropicVertexAvailableAuth(env) ? GCP_VERTEX_CREDENTIALS_MARKER : void 0;
}
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
function buildAnthropicVertexProvider(params) {
	const region = resolveAnthropicVertexRegion(params?.env);
	return {
		baseUrl: normalizeLowercaseStringOrEmpty(region) === "global" ? "https://aiplatform.googleapis.com" : `https://${region}-aiplatform.googleapis.com`,
		api: "anthropic-messages",
		apiKey: GCP_VERTEX_CREDENTIALS_MARKER,
		models: [buildAnthropicVertexModel({
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
			id: "claude-sonnet-4-6",
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
		})]
	};
}
function mergeImplicitAnthropicVertexProvider(params) {
	const { existing, implicit } = params;
	if (!existing) return implicit;
	return {
		...implicit,
		...existing,
		models: Array.isArray(existing.models) && existing.models.length > 0 ? existing.models : implicit.models
	};
}
function resolveImplicitAnthropicVertexProvider(params) {
	const env = params?.env ?? process.env;
	if (!hasAnthropicVertexAvailableAuth(env)) return null;
	return buildAnthropicVertexProvider({ env });
}
async function runAnthropicVertexCatalog(ctx) {
	const implicit = resolveImplicitAnthropicVertexProvider({ env: ctx.env });
	if (!implicit) return null;
	return { provider: mergeImplicitAnthropicVertexProvider({
		existing: ctx.config.models?.providers?.[PROVIDER_ID],
		implicit
	}) };
}
const anthropicVertexProviderDiscovery = {
	id: PROVIDER_ID,
	label: "Anthropic Vertex",
	docsPath: "/providers/models",
	auth: [],
	catalog: {
		order: "simple",
		run: runAnthropicVertexCatalog
	},
	resolveConfigApiKey: ({ env }) => resolveAnthropicVertexConfigApiKey(env)
};
//#endregion
export { anthropicVertexProviderDiscovery, anthropicVertexProviderDiscovery as default };
