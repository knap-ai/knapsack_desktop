import { type MatrixActionClientOpts, type MatrixMessageSummary } from "./types.js";
export declare function pinMatrixMessage(roomId: string, messageId: string, opts?: MatrixActionClientOpts): Promise<{
    pinned: string[];
}>;
export declare function unpinMatrixMessage(roomId: string, messageId: string, opts?: MatrixActionClientOpts): Promise<{
    pinned: string[];
}>;
export declare function listMatrixPins(roomId: string, opts?: MatrixActionClientOpts): Promise<{
    pinned: string[];
    events: MatrixMessageSummary[];
}>;
