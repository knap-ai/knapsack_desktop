import type { StreamFn } from "@mariozechner/pi-agent-core";
import { type Context, type Model, type SimpleStreamOptions } from "@mariozechner/pi-ai";
type GoogleTransportModel = Model<"google-generative-ai"> & {
    headers?: Record<string, string>;
    provider: string;
};
type GoogleThinkingLevel = "MINIMAL" | "LOW" | "MEDIUM" | "HIGH";
type GoogleTransportOptions = SimpleStreamOptions & {
    cachedContent?: string;
    toolChoice?: "auto" | "none" | "any" | "required" | {
        type: "function";
        function: {
            name: string;
        };
    };
    thinking?: {
        enabled: boolean;
        budgetTokens?: number;
        level?: GoogleThinkingLevel;
    };
};
type GoogleGenerateContentRequest = {
    cachedContent?: string;
    contents: Array<Record<string, unknown>>;
    generationConfig?: Record<string, unknown>;
    systemInstruction?: Record<string, unknown>;
    tools?: Array<Record<string, unknown>>;
    toolConfig?: Record<string, unknown>;
};
export declare function buildGoogleGenerativeAiParams(model: GoogleTransportModel, context: Context, options?: GoogleTransportOptions): GoogleGenerateContentRequest;
export declare function createGoogleGenerativeAiTransportStreamFn(): StreamFn;
export {};
