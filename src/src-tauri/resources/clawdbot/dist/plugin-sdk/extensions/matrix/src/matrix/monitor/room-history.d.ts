/**
 * Per-room group chat history tracking for Matrix.
 *
 * Maintains a shared per-room message queue and per-(agentId, roomId) watermarks so
 * each agent independently tracks which messages it has already consumed. This design
 * lets multiple agents in the same room see independent history windows:
 *
 * - dev replies to @dev msgB (watermark advances to B) → room queue still has [A, B]
 * - spark replies to @spark msgC → spark watermark starts at 0 and sees [A, B, C]
 *
 * Race-condition safety: the watermark only advances to the snapshot index taken at
 * dispatch time, NOT to the queue's end at reply time.  Messages that land in the queue
 * while the agent is processing stay visible to the next trigger for that agent.
 */
import type { HistoryEntry } from "openclaw/plugin-sdk/reply-history";
export type { HistoryEntry };
export type HistorySnapshotToken = {
    snapshotIdx: number;
    queueGeneration: number;
};
export type PreparedTriggerResult = {
    history: HistoryEntry[];
} & HistorySnapshotToken;
export type RoomHistoryTracker = {
    /**
     * Record a non-trigger message for future context.
     * Call this when a room message arrives but does not mention the bot.
     */
    recordPending: (roomId: string, entry: HistoryEntry) => void;
    /**
     * Capture pending history and append the trigger as one idempotent operation.
     * Retries of the same Matrix event reuse the original prepared history window.
     */
    prepareTrigger: (agentId: string, roomId: string, limit: number, entry: HistoryEntry) => PreparedTriggerResult;
    /**
     * Advance the agent's watermark to the snapshot index returned by prepareTrigger
     * (or the lower-level recordTrigger helper used in tests).
     * Only messages appended after that snapshot remain visible on the next trigger.
     */
    consumeHistory: (agentId: string, roomId: string, snapshot: HistorySnapshotToken, messageId?: string) => void;
};
export type RoomHistoryTrackerTestApi = RoomHistoryTracker & {
    /**
     * Test-only helper for inspecting pending room history directly.
     */
    getPendingHistory: (agentId: string, roomId: string, limit: number) => HistoryEntry[];
    /**
     * Test-only helper for manually appending a trigger entry and snapshot index.
     */
    recordTrigger: (roomId: string, entry: HistoryEntry) => HistorySnapshotToken;
};
export declare function createRoomHistoryTracker(maxQueueSize?: number, maxRoomQueues?: number, maxWatermarkEntries?: number, maxPreparedTriggerEntries?: number): RoomHistoryTracker;
export declare function createRoomHistoryTrackerForTests(maxQueueSize?: number, maxRoomQueues?: number, maxWatermarkEntries?: number, maxPreparedTriggerEntries?: number): RoomHistoryTrackerTestApi;
