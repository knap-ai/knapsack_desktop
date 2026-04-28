import type { OpenClawConfig } from "../config/types.openclaw.js";
export declare function getPluginCommandSpecs(provider?: string, options?: {
    env?: NodeJS.ProcessEnv;
    stateDir?: string;
    workspaceDir?: string;
    config?: OpenClawConfig;
}): Array<{
    name: string;
    description: string;
    acceptsArgs: boolean;
}>;
