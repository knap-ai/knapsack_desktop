type SubagentSurface = {
    run: (params: {
        idempotencyKey: string;
        sessionKey: string;
        message: string;
        extraSystemPrompt?: string;
        deliver?: boolean;
    }) => Promise<{
        runId: string;
    }>;
    waitForRun: (params: {
        runId: string;
        timeoutMs?: number;
    }) => Promise<{
        status: string;
        error?: string;
    }>;
    getSessionMessages: (params: {
        sessionKey: string;
        limit?: number;
    }) => Promise<{
        messages: unknown[];
    }>;
    deleteSession: (params: {
        sessionKey: string;
    }) => Promise<void>;
};
export type NarrativePhaseData = {
    phase: "light" | "deep" | "rem";
    /** Short memory snippets the phase processed. */
    snippets: string[];
    /** Concept tags / themes that surfaced (REM and light). */
    themes?: string[];
    /** Snippets that were promoted to durable memory (deep). */
    promotions?: string[];
};
type Logger = {
    info: (message: string) => void;
    warn: (message: string) => void;
    error: (message: string) => void;
};
export declare function buildNarrativePrompt(data: NarrativePhaseData): string;
export declare function extractNarrativeText(messages: unknown[]): string | null;
export declare function formatNarrativeDate(epochMs: number, timezone?: string): string;
export declare function formatBackfillDiaryDate(isoDay: string, _timezone?: string): string;
export declare function buildBackfillDiaryEntry(params: {
    isoDay: string;
    bodyLines: string[];
    sourcePath?: string;
    timezone?: string;
}): string;
export declare function writeBackfillDiaryEntries(params: {
    workspaceDir: string;
    entries: Array<{
        isoDay: string;
        bodyLines: string[];
        sourcePath?: string;
    }>;
    timezone?: string;
}): Promise<{
    dreamsPath: string;
    written: number;
    replaced: number;
}>;
export declare function removeBackfillDiaryEntries(params: {
    workspaceDir: string;
}): Promise<{
    dreamsPath: string;
    removed: number;
}>;
export declare function dedupeDreamDiaryEntries(params: {
    workspaceDir: string;
}): Promise<{
    dreamsPath: string;
    removed: number;
    kept: number;
}>;
export declare function buildDiaryEntry(narrative: string, dateStr: string): string;
export declare function appendNarrativeEntry(params: {
    workspaceDir: string;
    narrative: string;
    nowMs: number;
    timezone?: string;
}): Promise<string>;
export declare function generateAndAppendDreamNarrative(params: {
    subagent: SubagentSurface;
    workspaceDir: string;
    data: NarrativePhaseData;
    nowMs?: number;
    timezone?: string;
    logger: Logger;
}): Promise<void>;
export {};
