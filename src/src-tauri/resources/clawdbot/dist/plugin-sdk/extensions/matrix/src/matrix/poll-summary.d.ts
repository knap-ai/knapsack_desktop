import type { MatrixMessageSummary } from "./actions/types.js";
import type { MatrixClient, MatrixRawEvent } from "./sdk.js";
export type MatrixPollSnapshot = {
    pollEventId: string;
    triggerEvent: MatrixRawEvent;
    rootEvent: MatrixRawEvent;
    text: string;
};
export declare function resolveMatrixPollRootEventId(event: Pick<MatrixRawEvent, "event_id" | "type" | "content">): string | null;
export declare function fetchMatrixPollSnapshot(client: MatrixClient, roomId: string, event: MatrixRawEvent): Promise<MatrixPollSnapshot | null>;
export declare function fetchMatrixPollMessageSummary(client: MatrixClient, roomId: string, event: MatrixRawEvent): Promise<MatrixMessageSummary | null>;
