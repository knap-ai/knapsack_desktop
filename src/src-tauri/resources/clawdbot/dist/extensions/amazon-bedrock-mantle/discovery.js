import { createSubsystemLogger } from "openclaw/plugin-sdk/core";
import { formatErrorMessage } from "openclaw/plugin-sdk/error-runtime";
import { normalizeLowercaseStringOrEmpty } from "openclaw/plugin-sdk/text-runtime";
//#region extensions/amazon-bedrock-mantle/discovery.ts
const log = createSubsystemLogger("bedrock-mantle-discovery");
const DEFAULT_COST = {
	input: 0,
	output: 0,
	cacheRead: 0,
	cacheWrite: 0
};
const DEFAULT_CONTEXT_WINDOW = 32e3;
const DEFAULT_MAX_TOKENS = 4096;
const DEFAULT_REFRESH_INTERVAL_SECONDS = 3600;
const MANTLE_SUPPORTED_REGIONS = [
	"us-east-1",
	"us-east-2",
	"us-west-2",
	"ap-northeast-1",
	"ap-south-1",
	"ap-southeast-3",
	"eu-central-1",
	"eu-west-1",
	"eu-west-2",
	"eu-south-1",
	"eu-north-1",
	"sa-east-1"
];
function mantleEndpoint(region) {
	return `https://bedrock-mantle.${region}.api.aws`;
}
function isSupportedRegion(region) {
	return MANTLE_SUPPORTED_REGIONS.includes(region);
}
/**
* Resolve a bearer token for Mantle authentication.
*
* Returns the value of AWS_BEARER_TOKEN_BEDROCK if set, undefined otherwise.
* When no explicit token is set, `resolveImplicitMantleProvider` will attempt
* to generate one from IAM credentials via `@aws/bedrock-token-generator`.
*/
function resolveMantleBearerToken(env = process.env) {
	const explicitToken = env.AWS_BEARER_TOKEN_BEDROCK?.trim();
	if (explicitToken) return explicitToken;
}
/** Token cache for IAM-derived bearer tokens, keyed by region. */
const iamTokenCache = /* @__PURE__ */ new Map();
const IAM_TOKEN_TTL_MS = 36e5;
/**
* Generate a bearer token from IAM credentials using `@aws/bedrock-token-generator`.
*
* Uses the AWS default credential chain (instance roles, SSO, access keys, EKS IRSA).
* Returns undefined if the package is not installed or credentials are unavailable.
*/
async function generateBearerTokenFromIam(params) {
	const now = params.now?.() ?? Date.now();
	const cached = iamTokenCache.get(params.region);
	if (cached && cached.expiresAt > now) return cached.token;
	try {
		const { getTokenProvider } = await import("@aws/bedrock-token-generator");
		const token = await getTokenProvider({
			region: params.region,
			expiresInSeconds: 7200
		})();
		iamTokenCache.set(params.region, {
			token,
			expiresAt: now + IAM_TOKEN_TTL_MS
		});
		return token;
	} catch (error) {
		log.debug?.("Mantle IAM token generation unavailable", {
			region: params.region,
			error: formatErrorMessage(error)
		});
		return;
	}
}
/** Reset the IAM token cache (for testing). */
function resetIamTokenCacheForTest() {
	iamTokenCache.clear();
}
/** Model ID substrings that indicate reasoning/thinking support. */
const REASONING_PATTERNS = [
	"thinking",
	"reasoner",
	"reasoning",
	"deepseek.r",
	"gpt-oss-120b",
	"gpt-oss-safeguard-120b"
];
function inferReasoningSupport(modelId) {
	const lower = normalizeLowercaseStringOrEmpty(modelId);
	return REASONING_PATTERNS.some((p) => lower.includes(p));
}
const discoveryCache = /* @__PURE__ */ new Map();
/** Clear the discovery cache (for testing). */
function resetMantleDiscoveryCacheForTest() {
	discoveryCache.clear();
}
/**
* Discover available models from the Mantle `/v1/models` endpoint.
*
* The response is in standard OpenAI format:
* ```json
* { "data": [{ "id": "anthropic.claude-sonnet-4-6", "object": "model", "owned_by": "anthropic" }] }
* ```
*
* Results are cached per region for `DEFAULT_REFRESH_INTERVAL_SECONDS`.
* Returns an empty array if the request fails (no permission, network error, etc.).
*/
async function discoverMantleModels(params) {
	const { region, bearerToken, fetchFn = fetch, now = Date.now } = params;
	const cacheKey = region;
	const cached = discoveryCache.get(cacheKey);
	if (cached && now() - cached.fetchedAt < DEFAULT_REFRESH_INTERVAL_SECONDS * 1e3) return cached.models;
	const endpoint = `${mantleEndpoint(region)}/v1/models`;
	try {
		const response = await fetchFn(endpoint, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${bearerToken}`,
				Accept: "application/json"
			}
		});
		if (!response.ok) {
			log.debug?.("Mantle model discovery failed", {
				status: response.status,
				statusText: response.statusText
			});
			return cached?.models ?? [];
		}
		const models = ((await response.json()).data ?? []).filter((m) => m.id?.trim()).map((m) => ({
			id: m.id,
			name: m.id,
			reasoning: inferReasoningSupport(m.id),
			input: ["text"],
			cost: DEFAULT_COST,
			contextWindow: DEFAULT_CONTEXT_WINDOW,
			maxTokens: DEFAULT_MAX_TOKENS
		})).toSorted((a, b) => a.id.localeCompare(b.id));
		discoveryCache.set(cacheKey, {
			models,
			fetchedAt: now()
		});
		return models;
	} catch (error) {
		log.debug?.("Mantle model discovery error", { error: formatErrorMessage(error) });
		return cached?.models ?? [];
	}
}
/**
* Resolve an implicit Bedrock Mantle provider if authentication is available.
*
* Detection priority:
* 1. AWS_BEARER_TOKEN_BEDROCK env var → use directly
* 2. IAM credentials → generate bearer token via `@aws/bedrock-token-generator`
* - Region from AWS_REGION / AWS_DEFAULT_REGION / default us-east-1
* - Models discovered from `/v1/models`
*/
async function resolveImplicitMantleProvider(params) {
	const env = params.env ?? process.env;
	const region = env.AWS_REGION ?? env.AWS_DEFAULT_REGION ?? "us-east-1";
	const explicitBearerToken = resolveMantleBearerToken(env);
	if (!isSupportedRegion(region)) {
		log.debug?.("Mantle not available in region", { region });
		return null;
	}
	const bearerToken = explicitBearerToken ?? await generateBearerTokenFromIam({ region });
	if (!bearerToken) return null;
	const models = await discoverMantleModels({
		region,
		bearerToken,
		fetchFn: params.fetchFn
	});
	if (models.length === 0) return null;
	log.debug?.("Mantle provider resolved", {
		region,
		modelCount: models.length
	});
	return {
		baseUrl: `${mantleEndpoint(region)}/v1`,
		api: "openai-completions",
		auth: "api-key",
		apiKey: explicitBearerToken ? "env:AWS_BEARER_TOKEN_BEDROCK" : bearerToken,
		models
	};
}
function mergeImplicitMantleProvider(params) {
	const { existing, implicit } = params;
	if (!existing) return implicit;
	return {
		...implicit,
		...existing,
		models: Array.isArray(existing.models) && existing.models.length > 0 ? existing.models : implicit.models
	};
}
//#endregion
export { discoverMantleModels, generateBearerTokenFromIam, mergeImplicitMantleProvider, resetIamTokenCacheForTest, resetMantleDiscoveryCacheForTest, resolveImplicitMantleProvider, resolveMantleBearerToken };
