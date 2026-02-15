import type { RuntimeEnv } from "../../runtime.js";
export declare function mergeAllowlist(params: {
    existing?: Array<string | number>;
    additions: string[];
}): string[];
export declare function summarizeMapping(label: string, mapping: string[], unresolved: string[], runtime: RuntimeEnv): void;
