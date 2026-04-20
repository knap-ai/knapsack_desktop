import { processMessage } from "./monitor-processing.js";
import type { WebhookTarget } from "./monitor-shared.js";
export type BlueBubblesCatchupConfig = {
    enabled?: boolean;
    maxAgeMinutes?: number;
    perRunLimit?: number;
    firstRunLookbackMinutes?: number;
    /**
     * Per-message retry ceiling. After this many consecutive failed
     * `processMessage` attempts against the same GUID, catchup logs a WARN
     * and force-advances the cursor past the wedged message instead of
     * holding it indefinitely. Defaults to 10. Clamped to [1, 1000].
     */
    maxFailureRetries?: number;
};
export type BlueBubblesCatchupSummary = {
    querySucceeded: boolean;
    replayed: number;
    skippedFromMe: number;
    skippedPreCursor: number;
    /**
     * Messages whose GUID was already recorded as "given up" from a previous
     * run (count >= `maxFailureRetries`). These are skipped without calling
     * `processMessage` again. Lets the cursor continue advancing past the
     * wedged message on the next sweep while avoiding another failed attempt.
     */
    skippedGivenUp: number;
    failed: number;
    /**
     * Messages that crossed the `maxFailureRetries` ceiling ON THIS RUN.
     * Each transition triggers a WARN log line. Already-given-up messages
     * in subsequent runs count under `skippedGivenUp`, not here. Lets
     * operators distinguish fresh give-up events from steady-state skips.
     */
    givenUp: number;
    cursorBefore: number | null;
    cursorAfter: number;
    windowStartMs: number;
    windowEndMs: number;
    fetchedCount: number;
};
export type BlueBubblesCatchupCursor = {
    lastSeenMs: number;
    updatedAt: number;
    /**
     * Per-GUID failure counter, preserved across runs. Two states:
     * - `1 <= count < maxFailureRetries`: the GUID is still retrying and
     *   continues to hold the cursor back.
     * - `count >= maxFailureRetries`: catchup has "given up" on the GUID.
     *   The message is skipped on sight (no `processMessage` attempt) and
     *   the GUID no longer holds the cursor. The entry stays in the map
     *   until the cursor naturally advances past the message's timestamp
     *   (at which point the message stops appearing in queries entirely).
     *
     * A successful `processMessage` removes the entry. Optional on the
     * persisted shape so older cursor files without this field load cleanly.
     */
    failureRetries?: Record<string, number>;
};
export declare function loadBlueBubblesCatchupCursor(accountId: string): Promise<BlueBubblesCatchupCursor | null>;
export declare function saveBlueBubblesCatchupCursor(accountId: string, lastSeenMs: number, failureRetries?: Record<string, number>): Promise<void>;
type FetchOpts = {
    baseUrl: string;
    password: string;
    allowPrivateNetwork: boolean;
    timeoutMs?: number;
};
export type BlueBubblesCatchupFetchResult = {
    resolved: boolean;
    messages: Array<Record<string, unknown>>;
};
export declare function fetchBlueBubblesMessagesSince(sinceMs: number, limit: number, opts: FetchOpts): Promise<BlueBubblesCatchupFetchResult>;
export type RunBlueBubblesCatchupDeps = {
    fetchMessages?: typeof fetchBlueBubblesMessagesSince;
    processMessageFn?: typeof processMessage;
    now?: () => number;
    log?: (message: string) => void;
    error?: (message: string) => void;
};
export declare function runBlueBubblesCatchup(target: WebhookTarget, deps?: RunBlueBubblesCatchupDeps): Promise<BlueBubblesCatchupSummary | null>;
export {};
