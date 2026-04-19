import type { MatrixActionClientOpts } from "./types.js";
export declare function voteMatrixPoll(roomId: string, pollId: string, opts?: MatrixActionClientOpts & {
    optionId?: string;
    optionIds?: string[];
    optionIndex?: number;
    optionIndexes?: number[];
}): Promise<{
    eventId: string;
    roomId: string;
    pollId: string;
    answerIds: string[];
    labels: string[];
    maxSelections: number;
}>;
