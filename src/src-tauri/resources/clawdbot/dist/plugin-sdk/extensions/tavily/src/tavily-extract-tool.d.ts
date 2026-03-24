import type { OpenClawPluginApi } from "openclaw/plugin-sdk/plugin-runtime";
export declare function createTavilyExtractTool(api: OpenClawPluginApi): {
    name: string;
    label: string;
    description: string;
    parameters: import("@sinclair/typebox").TObject<{
        urls: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
        query: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        extract_depth: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnsafe<"advanced" | "basic">>;
        chunks_per_source: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
        include_images: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    }>;
    execute: (_toolCallId: string, rawParams: Record<string, unknown>) => Promise<import("@mariozechner/pi-agent-core").AgentToolResult<unknown>>;
};
