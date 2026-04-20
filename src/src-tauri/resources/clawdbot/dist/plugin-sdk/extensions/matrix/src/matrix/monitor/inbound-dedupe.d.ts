import type { MatrixAuth } from "../client/types.js";
export type MatrixInboundEventDeduper = {
    claimEvent: (params: {
        roomId: string;
        eventId: string;
    }) => boolean;
    commitEvent: (params: {
        roomId: string;
        eventId: string;
    }) => Promise<void>;
    releaseEvent: (params: {
        roomId: string;
        eventId: string;
    }) => void;
    flush: () => Promise<void>;
    stop: () => Promise<void>;
};
export declare function createMatrixInboundEventDeduper(params: {
    auth: MatrixAuth;
    env?: NodeJS.ProcessEnv;
    stateDir?: string;
    storagePath?: string;
    ttlMs?: number;
    maxEntries?: number;
    nowMs?: () => number;
}): Promise<MatrixInboundEventDeduper>;
