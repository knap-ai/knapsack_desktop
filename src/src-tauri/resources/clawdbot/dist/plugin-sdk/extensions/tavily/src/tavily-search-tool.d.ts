import type { OpenClawPluginApi } from "openclaw/plugin-sdk/plugin-runtime";
export declare function createTavilySearchTool(api: OpenClawPluginApi): {
    name: string;
    label: string;
    description: string;
    parameters: import("@sinclair/typebox").TObject<{
        query: import("@sinclair/typebox").TString;
        search_depth: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnsafe<"advanced" | "basic">>;
        topic: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnsafe<"general" | "news" | "finance">>;
        max_results: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
        include_answer: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
        time_range: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnsafe<"year" | "month" | "day" | "week">>;
        include_domains: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
        exclude_domains: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
    }>;
    execute: (_toolCallId: string, rawParams: Record<string, unknown>) => Promise<import("@mariozechner/pi-agent-core").AgentToolResult<unknown>>;
};
