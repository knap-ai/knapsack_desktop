import type { OpenClawConfig } from "../config/config.js";
export { buildHuggingfaceProvider, buildKilocodeProviderWithDiscovery, buildVeniceProvider, buildVercelAiGatewayProvider, } from "../plugin-sdk/provider-catalog.js";
export { resolveOllamaApiBase } from "./ollama-models.js";
type ModelsConfig = NonNullable<OpenClawConfig["models"]>;
type ProviderConfig = NonNullable<ModelsConfig["providers"]>[string];
export declare function buildOllamaProvider(configuredBaseUrl?: string, opts?: {
    quiet?: boolean;
}): Promise<ProviderConfig>;
export declare function buildVllmProvider(params?: {
    baseUrl?: string;
    apiKey?: string;
}): Promise<ProviderConfig>;
export declare function buildSglangProvider(params?: {
    baseUrl?: string;
    apiKey?: string;
}): Promise<ProviderConfig>;
