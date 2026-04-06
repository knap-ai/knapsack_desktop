import type { StreamFn } from "@mariozechner/pi-agent-core";
import type { OpenClawConfig } from "../../config/config.js";
export declare function createAnthropicToolPayloadCompatibilityWrapper(baseStreamFn: StreamFn | undefined, resolverOptions?: {
    config?: OpenClawConfig;
    workspaceDir?: string;
    env?: NodeJS.ProcessEnv;
}): StreamFn;
