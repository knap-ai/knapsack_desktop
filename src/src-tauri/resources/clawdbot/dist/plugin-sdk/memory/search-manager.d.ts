import type { OpenClawConfig } from "../config/config.js";
import type { MemorySearchManager } from "./types.js";
export type MemorySearchManagerResult = {
    manager: MemorySearchManager | null;
    error?: string;
};
export declare function getMemorySearchManager(params: {
    cfg: OpenClawConfig;
    agentId: string;
}): Promise<MemorySearchManagerResult>;
