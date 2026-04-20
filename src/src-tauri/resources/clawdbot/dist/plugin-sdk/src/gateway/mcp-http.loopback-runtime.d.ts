export type McpLoopbackRuntime = {
    port: number;
    token: string;
};
export declare function getActiveMcpLoopbackRuntime(): McpLoopbackRuntime | undefined;
export declare function setActiveMcpLoopbackRuntime(runtime: McpLoopbackRuntime): void;
export declare function clearActiveMcpLoopbackRuntime(token: string): void;
export declare function createMcpLoopbackServerConfig(port: number): {
    mcpServers: {
        openclaw: {
            type: string;
            url: string;
            headers: {
                Authorization: string;
                "x-session-key": string;
                "x-openclaw-agent-id": string;
                "x-openclaw-account-id": string;
                "x-openclaw-message-channel": string;
                "x-openclaw-sender-is-owner": string;
            };
        };
    };
};
