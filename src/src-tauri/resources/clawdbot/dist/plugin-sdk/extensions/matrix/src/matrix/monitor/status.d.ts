import type { ChannelAccountSnapshot } from "openclaw/plugin-sdk/channel-contract";
import { type MatrixSyncState } from "../sync-state.js";
type MatrixMonitorStatusSink = (patch: ChannelAccountSnapshot) => void;
export type MatrixMonitorStatusController = ReturnType<typeof createMatrixMonitorStatusController>;
export declare function createMatrixMonitorStatusController(params: {
    accountId: string;
    baseUrl?: string;
    statusSink?: MatrixMonitorStatusSink;
}): {
    noteSyncState(state: MatrixSyncState, error?: unknown, at?: number): void;
    noteUnexpectedError(error: unknown, at?: number): void;
    markStopped(at?: number): void;
};
export {};
