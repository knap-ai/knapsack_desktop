import type { OpenClawConfig } from "../config/config.js";
import type { FailoverReason } from "./pi-embedded-helpers.js";
type FallbackAttempt = {
    provider: string;
    model: string;
    error: string;
    reason?: FailoverReason;
    status?: number;
    code?: string;
};
export declare function runWithModelFallback<T>(params: {
    cfg: OpenClawConfig | undefined;
    provider: string;
    model: string;
    agentDir?: string;
    /** Optional explicit fallbacks list; when provided (even empty), replaces agents.defaults.model.fallbacks. */
    fallbacksOverride?: string[];
    run: (provider: string, model: string) => Promise<T>;
    onError?: (attempt: {
        provider: string;
        model: string;
        error: unknown;
        attempt: number;
        total: number;
    }) => void | Promise<void>;
}): Promise<{
    result: T;
    provider: string;
    model: string;
    attempts: FallbackAttempt[];
}>;
export declare function runWithImageModelFallback<T>(params: {
    cfg: OpenClawConfig | undefined;
    modelOverride?: string;
    run: (provider: string, model: string) => Promise<T>;
    onError?: (attempt: {
        provider: string;
        model: string;
        error: unknown;
        attempt: number;
        total: number;
    }) => void | Promise<void>;
}): Promise<{
    result: T;
    provider: string;
    model: string;
    attempts: FallbackAttempt[];
}>;
export {};
