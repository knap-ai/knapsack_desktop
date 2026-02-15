import type { AgentTool } from "@mariozechner/pi-agent-core";
import type { ToolDefinition } from "@mariozechner/pi-coding-agent";
import type { ClientToolDefinition } from "./pi-embedded-runner/run/params.js";
type AnyAgentTool = AgentTool<any, unknown>;
export declare function toToolDefinitions(tools: AnyAgentTool[]): ToolDefinition[];
export declare function toClientToolDefinitions(tools: ClientToolDefinition[], onClientToolCall?: (toolName: string, params: Record<string, unknown>) => void, hookContext?: {
    agentId?: string;
    sessionKey?: string;
}): ToolDefinition[];
export {};
