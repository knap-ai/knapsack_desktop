export type SessionFileEntry = {
    path: string;
    absPath: string;
    mtimeMs: number;
    size: number;
    hash: string;
    content: string;
    /** Maps each content line (0-indexed) to its 1-indexed JSONL source line. */
    lineMap: number[];
    /** Maps each content line (0-indexed) to epoch ms; 0 means unknown timestamp. */
    messageTimestampsMs: number[];
    /** True when this transcript belongs to an internal dreaming narrative run. */
    generatedByDreamingNarrative?: boolean;
};
export type BuildSessionEntryOptions = {
    /** Optional preclassification from a caller-managed dreaming transcript lookup. */
    generatedByDreamingNarrative?: boolean;
};
export declare function normalizeSessionTranscriptPathForComparison(pathname: string): string;
export declare function loadDreamingNarrativeTranscriptPathSetForSessionsDir(sessionsDir: string): ReadonlySet<string>;
export declare function loadDreamingNarrativeTranscriptPathSetForAgent(agentId: string): ReadonlySet<string>;
export declare function listSessionFilesForAgent(agentId: string): Promise<string[]>;
export declare function sessionPathForFile(absPath: string): string;
export declare function extractSessionText(content: unknown, role?: "user" | "assistant"): string | null;
export declare function buildSessionEntry(absPath: string, opts?: BuildSessionEntryOptions): Promise<SessionFileEntry | null>;
