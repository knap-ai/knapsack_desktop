import { type JsonRpcRequest } from "./mcp-http.protocol.js";
import type { McpLoopbackTool, McpToolSchemaEntry } from "./mcp-http.schema.js";
export declare function handleMcpJsonRpc(params: {
    message: JsonRpcRequest;
    tools: McpLoopbackTool[];
    toolSchema: McpToolSchemaEntry[];
}): Promise<object | null>;
