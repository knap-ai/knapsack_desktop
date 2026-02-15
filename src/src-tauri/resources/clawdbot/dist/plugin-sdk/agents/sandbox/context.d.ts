import type { OpenClawConfig } from "../../config/config.js";
import type { SandboxContext, SandboxWorkspaceInfo } from "./types.js";
export declare function resolveSandboxContext(params: {
    config?: OpenClawConfig;
    sessionKey?: string;
    workspaceDir?: string;
}): Promise<SandboxContext | null>;
export declare function ensureSandboxWorkspaceForSession(params: {
    config?: OpenClawConfig;
    sessionKey?: string;
    workspaceDir?: string;
}): Promise<SandboxWorkspaceInfo | null>;
