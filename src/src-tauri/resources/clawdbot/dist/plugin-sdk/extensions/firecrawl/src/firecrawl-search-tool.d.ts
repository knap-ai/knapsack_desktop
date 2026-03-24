import type { OpenClawPluginApi } from "openclaw/plugin-sdk/plugin-runtime";
export declare function createFirecrawlSearchTool(api: OpenClawPluginApi): {
    name: string;
    label: string;
    description: string;
    parameters: import("@sinclair/typebox").TObject<{
        query: import("@sinclair/typebox").TString;
        count: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
        sources: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
        categories: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
        scrapeResults: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
        timeoutSeconds: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    }>;
    execute: (_toolCallId: string, rawParams: Record<string, unknown>) => Promise<import("@mariozechner/pi-agent-core").AgentToolResult<unknown>>;
};
