export { asNullableRecord as asRecord } from "openclaw/plugin-sdk/text-runtime";
export { formatErrorMessage } from "openclaw/plugin-sdk/error-runtime";
export declare function normalizeTrimmedString(value: unknown): string | undefined;
export declare function includesSystemEventToken(cleanedBody: string, eventText: string): boolean;
