import type { AnyAgentTool } from "./pi-tools.types.js";
export declare function normalizeToolParameters(tool: AnyAgentTool): AnyAgentTool;
export declare function cleanToolSchemaForGemini(schema: Record<string, unknown>): unknown;
