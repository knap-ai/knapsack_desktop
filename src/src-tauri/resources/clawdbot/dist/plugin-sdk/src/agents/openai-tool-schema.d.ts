type OpenAITransportKind = "stream" | "websocket";
type OpenAIStrictToolModel = {
    provider?: unknown;
    api?: unknown;
    baseUrl?: unknown;
    id?: unknown;
    compat?: {
        supportsStore?: boolean;
    };
};
type ToolWithParameters = {
    parameters: unknown;
};
export declare function normalizeStrictOpenAIJsonSchema(schema: unknown): unknown;
export declare function normalizeOpenAIStrictToolParameters<T>(schema: T, strict: boolean): T;
export declare function isStrictOpenAIJsonSchemaCompatible(schema: unknown): boolean;
export declare function resolveOpenAIStrictToolFlagForInventory<T extends ToolWithParameters>(tools: readonly T[], strict: boolean | null | undefined): boolean | undefined;
export declare function resolvesToNativeOpenAIStrictTools(model: OpenAIStrictToolModel, transport: OpenAITransportKind): boolean;
export declare function resolveOpenAIStrictToolSetting(model: OpenAIStrictToolModel, options?: {
    transport?: OpenAITransportKind;
    supportsStrictMode?: boolean;
}): boolean | undefined;
export {};
