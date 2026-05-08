import type { PluginDiagnostic } from "./manifest-types.js";
export declare function hashString(value: string): string;
export declare function hashJson(value: unknown): string;
export declare function safeHashFile(params: {
    filePath: string;
    pluginId?: string;
    diagnostics: PluginDiagnostic[];
    required: boolean;
}): string | undefined;
