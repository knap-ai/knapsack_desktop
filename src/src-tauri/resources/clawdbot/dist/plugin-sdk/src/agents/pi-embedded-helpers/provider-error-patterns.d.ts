/**
 * Provider-specific error patterns that improve failover classification accuracy.
 *
 * Many providers return errors in non-standard formats. Without these patterns,
 * errors get misclassified (e.g., a context overflow classified as "format"),
 * causing the failover engine to choose wrong recovery strategies.
 */
import type { FailoverReason } from "./types.js";
type ProviderErrorPattern = {
    /** Regex to match against the raw error message. */
    test: RegExp;
    /** The failover reason this pattern maps to. */
    reason: FailoverReason;
};
/**
 * Provider-specific context overflow patterns not covered by the generic
 * `isContextOverflowError()` in errors.ts. Called from `isContextOverflowError()`
 * to catch provider-specific wording that the generic regex misses.
 */
export declare const PROVIDER_CONTEXT_OVERFLOW_PATTERNS: readonly RegExp[];
/**
 * Provider-specific patterns that map to specific failover reasons.
 * These handle cases where the generic classifiers in failover-matches.ts
 * produce wrong results for specific providers.
 */
export declare const PROVIDER_SPECIFIC_PATTERNS: readonly ProviderErrorPattern[];
/**
 * Check if an error message matches any provider-specific context overflow pattern.
 * Called from `isContextOverflowError()` to catch provider-specific wording.
 */
export declare function matchesProviderContextOverflow(errorMessage: string): boolean;
/**
 * Try to classify an error using provider-specific patterns.
 * Returns null if no provider-specific pattern matches (fall through to generic classification).
 */
export declare function classifyProviderSpecificError(errorMessage: string): FailoverReason | null;
export {};
