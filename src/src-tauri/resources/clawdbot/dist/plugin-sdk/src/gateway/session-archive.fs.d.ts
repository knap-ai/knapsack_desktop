import { type SessionArchiveReason } from "../config/sessions/artifacts.js";
export type ArchiveFileReason = SessionArchiveReason;
export declare function archiveFileOnDisk(filePath: string, reason: ArchiveFileReason): string;
export declare function archiveSessionTranscripts(opts: {
    sessionId: string;
    storePath: string | undefined;
    sessionFile?: string;
    agentId?: string;
    reason: "reset" | "deleted";
    restrictToStoreDir?: boolean;
}): string[];
export declare function cleanupArchivedSessionTranscripts(opts: {
    directories: string[];
    olderThanMs: number;
    reason?: ArchiveFileReason;
    nowMs?: number;
}): Promise<{
    removed: number;
    scanned: number;
}>;
