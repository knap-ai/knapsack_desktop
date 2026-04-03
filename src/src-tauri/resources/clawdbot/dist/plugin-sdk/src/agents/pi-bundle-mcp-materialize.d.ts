import type { OpenClawConfig } from "../config/config.js";
import type { BundleMcpToolRuntime, SessionMcpRuntime } from "./pi-bundle-mcp-types.js";
export declare function materializeBundleMcpToolsForRun(params: {
    runtime: SessionMcpRuntime;
    reservedToolNames?: Iterable<string>;
    disposeRuntime?: () => Promise<void>;
}): Promise<BundleMcpToolRuntime>;
export declare function createBundleMcpToolRuntime(params: {
    workspaceDir: string;
    cfg?: OpenClawConfig;
    reservedToolNames?: Iterable<string>;
}): Promise<BundleMcpToolRuntime>;
