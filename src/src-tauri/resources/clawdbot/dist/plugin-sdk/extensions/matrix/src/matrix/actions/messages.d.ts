import { type MatrixActionClientOpts, type MatrixMessageSummary } from "./types.js";
export declare function sendMatrixMessage(to: string, content: string | undefined, opts?: MatrixActionClientOpts & {
    mediaUrl?: string;
    replyToId?: string;
    threadId?: string;
    audioAsVoice?: boolean;
}): Promise<import("../send.js").MatrixSendResult>;
export declare function editMatrixMessage(roomId: string, messageId: string, content: string, opts?: MatrixActionClientOpts): Promise<{
    eventId: string | null;
}>;
export declare function deleteMatrixMessage(roomId: string, messageId: string, opts?: MatrixActionClientOpts & {
    reason?: string;
}): Promise<void>;
export declare function readMatrixMessages(roomId: string, opts?: MatrixActionClientOpts & {
    limit?: number;
    before?: string;
    after?: string;
}): Promise<{
    messages: MatrixMessageSummary[];
    nextBatch?: string | null;
    prevBatch?: string | null;
}>;
