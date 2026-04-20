import type { AgentToolResult } from "@mariozechner/pi-agent-core";
import type { CoreConfig } from "./types.js";
export declare function handleMatrixAction(params: Record<string, unknown>, cfg: CoreConfig, opts?: {
    mediaLocalRoots?: readonly string[];
}): Promise<AgentToolResult<unknown>>;
