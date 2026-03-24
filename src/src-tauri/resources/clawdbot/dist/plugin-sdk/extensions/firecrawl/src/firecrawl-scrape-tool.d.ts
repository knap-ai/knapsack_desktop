import type { OpenClawPluginApi } from "openclaw/plugin-sdk/plugin-runtime";
export declare function createFirecrawlScrapeTool(api: OpenClawPluginApi): {
    name: string;
    label: string;
    description: string;
    parameters: import("@sinclair/typebox").TObject<{
        url: import("@sinclair/typebox").TString;
        extractMode: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnsafe<"text" | "markdown">>;
        maxChars: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
        onlyMainContent: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
        maxAgeMs: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
        proxy: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnsafe<"auto" | "basic" | "stealth">>;
        storeInCache: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
        timeoutSeconds: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    }>;
    execute: (_toolCallId: string, rawParams: Record<string, unknown>) => Promise<import("@mariozechner/pi-agent-core").AgentToolResult<unknown>>;
};
