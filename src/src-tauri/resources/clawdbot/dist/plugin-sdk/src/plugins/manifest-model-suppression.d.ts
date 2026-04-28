import type { OpenClawConfig } from "../config/types.openclaw.js";
export declare function clearManifestModelSuppressionCacheForTest(): void;
export declare function resolveManifestBuiltInModelSuppression(params: {
    provider?: string | null;
    id?: string | null;
    config?: OpenClawConfig;
    workspaceDir?: string;
    env?: NodeJS.ProcessEnv;
}): {
    suppress: boolean;
    errorMessage: string;
} | undefined;
