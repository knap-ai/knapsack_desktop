import type { OpenClawConfig } from "../../config/config.js";
import type { RuntimeWebFetchMetadata } from "../../secrets/runtime-web-tools.types.js";
import type { AnyAgentTool } from "./common.js";
export { extractReadableContent } from "./web-fetch-utils.js";
export declare function createWebFetchTool(options?: {
    config?: OpenClawConfig;
    sandboxed?: boolean;
    runtimeWebFetch?: RuntimeWebFetchMetadata;
}): AnyAgentTool | null;
