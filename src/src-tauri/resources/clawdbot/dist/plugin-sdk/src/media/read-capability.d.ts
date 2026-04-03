import type { OpenClawConfig } from "../config/config.js";
import type { OutboundMediaAccess, OutboundMediaReadFile } from "./load-options.js";
export declare function createAgentScopedHostMediaReadFile(params: {
    cfg: OpenClawConfig;
    agentId?: string;
    workspaceDir?: string;
}): OutboundMediaReadFile | undefined;
export declare function resolveAgentScopedOutboundMediaAccess(params: {
    cfg: OpenClawConfig;
    agentId?: string;
    mediaSources?: readonly string[];
    workspaceDir?: string;
    mediaAccess?: OutboundMediaAccess;
    mediaReadFile?: OutboundMediaReadFile;
}): OutboundMediaAccess;
