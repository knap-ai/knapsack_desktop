import type { Api, Model } from "@mariozechner/pi-ai";
import type { ModelCompatConfig } from "../config/types.models.js";
export declare const XAI_TOOL_SCHEMA_PROFILE = "xai";
export declare const HTML_ENTITY_TOOL_CALL_ARGUMENTS_ENCODING = "html-entities";
export declare function applyModelCompatPatch<T extends {
    compat?: ModelCompatConfig;
}>(model: T, patch: ModelCompatConfig): T;
export declare function applyXaiModelCompat<T extends {
    compat?: ModelCompatConfig;
}>(model: T): T;
export declare function usesXaiToolSchemaProfile(modelOrCompat: {
    compat?: unknown;
} | ModelCompatConfig | undefined): boolean;
export declare function hasNativeWebSearchTool(modelOrCompat: {
    compat?: unknown;
} | ModelCompatConfig | undefined): boolean;
export declare function resolveToolCallArgumentsEncoding(modelOrCompat: {
    compat?: unknown;
} | ModelCompatConfig | undefined): ModelCompatConfig["toolCallArgumentsEncoding"] | undefined;
export declare function normalizeModelCompat(model: Model<Api>): Model<Api>;
