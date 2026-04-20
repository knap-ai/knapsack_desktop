export type MatrixSyncState = "PREPARED" | "SYNCING" | "CATCHUP" | "RECONNECTING" | "ERROR" | "STOPPED" | (string & {});
export declare function isMatrixReadySyncState(state: MatrixSyncState | null | undefined): state is "PREPARED" | "SYNCING" | "CATCHUP";
export declare function isMatrixDisconnectedSyncState(state: MatrixSyncState | null | undefined): state is "RECONNECTING" | "ERROR" | "STOPPED";
export declare function isMatrixTerminalSyncState(state: MatrixSyncState | null | undefined): state is "STOPPED";
