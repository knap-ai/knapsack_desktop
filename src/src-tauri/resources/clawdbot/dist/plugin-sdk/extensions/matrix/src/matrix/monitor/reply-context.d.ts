import type { MatrixClient } from "../sdk.js";
import type { MatrixRawEvent } from "./types.js";
export type MatrixReplyContext = {
    replyToBody?: string;
    replyToSender?: string;
    replyToSenderId?: string;
};
export declare function summarizeMatrixReplyEvent(event: MatrixRawEvent): string | undefined;
/**
 * Creates a cached resolver that fetches the body and sender of a replied-to
 * Matrix event. This allows the agent to see the content of the message being
 * replied to, not just its event ID.
 */
export declare function createMatrixReplyContextResolver(params: {
    client: MatrixClient;
    getMemberDisplayName: (roomId: string, userId: string) => Promise<string>;
    logVerboseMessage: (message: string) => void;
}): (input: {
    roomId: string;
    eventId: string;
}) => Promise<MatrixReplyContext>;
