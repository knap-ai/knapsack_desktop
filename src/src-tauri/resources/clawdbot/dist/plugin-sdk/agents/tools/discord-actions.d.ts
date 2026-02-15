import type { AgentToolResult } from "@mariozechner/pi-agent-core";
import type { OpenClawConfig } from "../../config/config.js";
export declare function handleDiscordAction(params: Record<string, unknown>, cfg: OpenClawConfig): Promise<AgentToolResult<unknown>>;
