export type HybridSource = string;
export type HybridVectorResult = {
    id: string;
    path: string;
    startLine: number;
    endLine: number;
    source: HybridSource;
    snippet: string;
    vectorScore: number;
};
export type HybridKeywordResult = {
    id: string;
    path: string;
    startLine: number;
    endLine: number;
    source: HybridSource;
    snippet: string;
    textScore: number;
};
export declare function buildFtsQuery(raw: string): string | null;
export declare function bm25RankToScore(rank: number): number;
export declare function mergeHybridResults(params: {
    vector: HybridVectorResult[];
    keyword: HybridKeywordResult[];
    vectorWeight: number;
    textWeight: number;
}): Array<{
    path: string;
    startLine: number;
    endLine: number;
    score: number;
    snippet: string;
    source: HybridSource;
}>;
