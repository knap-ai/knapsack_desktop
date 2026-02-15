import type { OpenClawConfig } from "../../config/config.js";
import type { AuthProfileFailureReason, AuthProfileStore } from "./types.js";
/**
 * Check if a profile is currently in cooldown (due to rate limiting or errors).
 */
export declare function isProfileInCooldown(store: AuthProfileStore, profileId: string): boolean;
/**
 * Mark a profile as successfully used. Resets error count and updates lastUsed.
 * Uses store lock to avoid overwriting concurrent usage updates.
 */
export declare function markAuthProfileUsed(params: {
    store: AuthProfileStore;
    profileId: string;
    agentDir?: string;
}): Promise<void>;
export declare function calculateAuthProfileCooldownMs(errorCount: number): number;
export declare function resolveProfileUnusableUntilForDisplay(store: AuthProfileStore, profileId: string): number | null;
/**
 * Mark a profile as failed for a specific reason. Billing failures are treated
 * as "disabled" (longer backoff) vs the regular cooldown window.
 */
export declare function markAuthProfileFailure(params: {
    store: AuthProfileStore;
    profileId: string;
    reason: AuthProfileFailureReason;
    cfg?: OpenClawConfig;
    agentDir?: string;
}): Promise<void>;
/**
 * Mark a profile as failed/rate-limited. Applies exponential backoff cooldown.
 * Cooldown times: 1min, 5min, 25min, max 1 hour.
 * Uses store lock to avoid overwriting concurrent usage updates.
 */
export declare function markAuthProfileCooldown(params: {
    store: AuthProfileStore;
    profileId: string;
    agentDir?: string;
}): Promise<void>;
/**
 * Clear cooldown for a profile (e.g., manual reset).
 * Uses store lock to avoid overwriting concurrent usage updates.
 */
export declare function clearAuthProfileCooldown(params: {
    store: AuthProfileStore;
    profileId: string;
    agentDir?: string;
}): Promise<void>;
