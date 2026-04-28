import { SessionManager } from "@mariozechner/pi-coding-agent";
import type { OpenClawConfig } from "../../config/types.openclaw.js";
type ReadonlySessionManagerForRotation = Pick<SessionManager, "buildSessionContext" | "getBranch" | "getCwd" | "getEntries" | "getHeader">;
export type CompactionTranscriptRotation = {
    rotated: boolean;
    reason?: string;
    sessionId?: string;
    sessionFile?: string;
    compactionEntryId?: string;
    leafId?: string;
    entriesWritten?: number;
};
export declare function shouldRotateCompactionTranscript(config?: OpenClawConfig): boolean;
export declare function rotateTranscriptAfterCompaction(params: {
    sessionManager: ReadonlySessionManagerForRotation;
    sessionFile: string;
    now?: () => Date;
}): Promise<CompactionTranscriptRotation>;
export {};
