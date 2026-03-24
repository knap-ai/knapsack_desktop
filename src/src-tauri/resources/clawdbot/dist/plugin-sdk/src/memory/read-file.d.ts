import type { OpenClawConfig } from "../config/config.js";
export declare function readMemoryFile(params: {
    workspaceDir: string;
    extraPaths?: string[];
    relPath: string;
    from?: number;
    lines?: number;
}): Promise<{
    text: string;
    path: string;
}>;
export declare function readAgentMemoryFile(params: {
    cfg: OpenClawConfig;
    agentId: string;
    relPath: string;
    from?: number;
    lines?: number;
}): Promise<{
    text: string;
    path: string;
}>;
