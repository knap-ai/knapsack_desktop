export type QmdQueryResult = {
    docid?: string;
    score?: number;
    file?: string;
    snippet?: string;
    body?: string;
};
export declare function parseQmdQueryJson(stdout: string, stderr: string): QmdQueryResult[];
