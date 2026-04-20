import type { MatrixClient } from "../sdk.js";
import type { MatrixRawEvent } from "./types.js";
type MatrixThreadContext = {
    threadStarterBody?: string;
    senderId?: string;
    senderLabel?: string;
    summary?: string;
};
export declare function summarizeMatrixThreadStarterEvent(event: MatrixRawEvent): string | undefined;
export declare function createMatrixThreadContextResolver(params: {
    client: MatrixClient;
    getMemberDisplayName: (roomId: string, userId: string) => Promise<string>;
    logVerboseMessage: (message: string) => void;
}): (input: {
    roomId: string;
    threadRootId: string;
}) => Promise<MatrixThreadContext>;
export {};
