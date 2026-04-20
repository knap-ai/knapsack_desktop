export { ANTHROPIC_VERTEX_DEFAULT_MODEL_ID, buildAnthropicVertexProvider, } from "./provider-catalog.js";
export { hasAnthropicVertexAvailableAuth, hasAnthropicVertexCredentials, resolveAnthropicVertexClientRegion, resolveAnthropicVertexConfigApiKey, resolveAnthropicVertexProjectId, resolveAnthropicVertexRegion, resolveAnthropicVertexRegionFromBaseUrl, } from "./region.js";
import { buildAnthropicVertexProvider } from "./provider-catalog.js";
export declare function mergeImplicitAnthropicVertexProvider(params: {
    existing?: ReturnType<typeof buildAnthropicVertexProvider>;
    implicit: ReturnType<typeof buildAnthropicVertexProvider>;
}): import("openclaw/plugin-sdk/provider-onboard").ModelProviderConfig;
export declare function resolveImplicitAnthropicVertexProvider(params?: {
    env?: NodeJS.ProcessEnv;
}): import("openclaw/plugin-sdk/provider-onboard").ModelProviderConfig | null;
