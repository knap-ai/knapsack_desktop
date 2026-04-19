import type { Api, Model } from "@mariozechner/pi-ai";
import { getApiKeyForModel, resolveApiKeyForProvider } from "../../agents/model-auth.js";
import type { OpenClawConfig } from "../../config/types.openclaw.js";
import type { ResolvedProviderRuntimeAuth } from "./model-auth-types.js";
export { getApiKeyForModel, resolveApiKeyForProvider };
/**
 * Resolve request-ready auth for a runtime model, applying any provider-owned
 * `prepareRuntimeAuth` exchange on top of the standard credential lookup.
 */
export declare function getRuntimeAuthForModel(params: {
    model: Model<Api>;
    cfg?: OpenClawConfig;
    workspaceDir?: string;
}): Promise<ResolvedProviderRuntimeAuth>;
