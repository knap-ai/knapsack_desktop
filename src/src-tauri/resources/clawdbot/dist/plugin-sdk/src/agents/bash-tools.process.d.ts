import { processSchema } from "./bash-tools.schemas.js";
import type { AgentToolWithMeta } from "./tools/common.js";
export type ProcessToolDefaults = {
    cleanupMs?: number;
    hasCronTool?: boolean;
    scopeKey?: string;
};
export declare function createProcessTool(defaults?: ProcessToolDefaults): AgentToolWithMeta<typeof processSchema, unknown>;
export declare const processTool: AgentToolWithMeta<import("@sinclair/typebox").TObject<{
    action: import("@sinclair/typebox").TString;
    sessionId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    data: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    keys: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
    hex: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
    literal: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    text: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    bracketed: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    eof: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    offset: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    limit: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    timeout: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
}>, unknown>;
