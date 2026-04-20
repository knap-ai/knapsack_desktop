import type { CoreConfig } from "../types.js";
import type { MatrixClient } from "./sdk.js";
type MatrixDraftPreviewMode = "partial" | "quiet";
export type MatrixDraftStream = {
    /** Update the draft with the latest accumulated text for the current block. */
    update: (text: string) => void;
    /** Ensure the last pending update has been sent. */
    flush: () => Promise<void>;
    /** Flush and mark this block as done. Returns the event ID if a message was sent. */
    stop: () => Promise<string | undefined>;
    /** Clear the MSC4357 live marker in place when the draft is kept as final text. */
    finalizeLive: () => Promise<boolean>;
    /** Reset state for the next text block (after tool calls). */
    reset: () => void;
    /** The event ID of the current draft message, if any. */
    eventId: () => string | undefined;
    /** True when the provided text matches the last rendered draft payload. */
    matchesPreparedText: (text: string) => boolean;
    /** True when preview streaming must fall back to normal final delivery. */
    mustDeliverFinalNormally: () => boolean;
};
export declare function createMatrixDraftStream(params: {
    roomId: string;
    client: MatrixClient;
    cfg: CoreConfig;
    mode?: MatrixDraftPreviewMode;
    threadId?: string;
    replyToId?: string;
    /** When true, reset() restores the original replyToId instead of clearing it. */
    preserveReplyId?: boolean;
    accountId?: string;
    log?: (message: string) => void;
}): MatrixDraftStream;
export {};
