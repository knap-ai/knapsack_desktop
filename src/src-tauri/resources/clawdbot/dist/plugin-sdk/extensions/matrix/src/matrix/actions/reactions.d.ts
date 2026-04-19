import { type MatrixActionClientOpts, type MatrixReactionSummary } from "./types.js";
export declare function listMatrixReactions(roomId: string, messageId: string, opts?: MatrixActionClientOpts & {
    limit?: number;
}): Promise<MatrixReactionSummary[]>;
export declare function removeMatrixReactions(roomId: string, messageId: string, opts?: MatrixActionClientOpts & {
    emoji?: string;
}): Promise<{
    removed: number;
}>;
