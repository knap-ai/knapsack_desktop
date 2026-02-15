import type { OpenClawConfig } from "../../config/config.js";
import type { AuthProfileStore } from "./types.js";
export declare function resolveApiKeyForProfile(params: {
    cfg?: OpenClawConfig;
    store: AuthProfileStore;
    profileId: string;
    agentDir?: string;
}): Promise<{
    apiKey: string;
    provider: string;
    email?: string;
} | null>;
