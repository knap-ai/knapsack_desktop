export declare const MAX_CONCEPT_TAGS = 8;
export type ConceptTagScriptFamily = "latin" | "cjk" | "mixed" | "other";
export type ConceptTagScriptCoverage = {
    latinEntryCount: number;
    cjkEntryCount: number;
    mixedEntryCount: number;
    otherEntryCount: number;
};
export declare function classifyConceptTagScript(tag: string): ConceptTagScriptFamily;
declare function normalizeConceptToken(rawToken: string): string | null;
declare function collectGlossaryMatches(source: string): string[];
declare function collectCompoundTokens(source: string): string[];
declare function collectSegmentTokens(source: string): string[];
export declare function deriveConceptTags(params: {
    path: string;
    snippet: string;
    limit?: number;
}): string[];
export declare function summarizeConceptTagScriptCoverage(conceptTagsByEntry: string[][]): ConceptTagScriptCoverage;
export declare const __testing: {
    normalizeConceptToken: typeof normalizeConceptToken;
    collectGlossaryMatches: typeof collectGlossaryMatches;
    collectCompoundTokens: typeof collectCompoundTokens;
    collectSegmentTokens: typeof collectSegmentTokens;
};
export {};
