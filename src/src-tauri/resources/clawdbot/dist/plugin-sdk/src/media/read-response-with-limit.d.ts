export declare function readResponseWithLimit(res: Response, maxBytes: number, opts?: {
    onOverflow?: (params: {
        size: number;
        maxBytes: number;
        res: Response;
    }) => Error;
    chunkTimeoutMs?: number;
}): Promise<Buffer>;
export declare function readResponseTextSnippet(res: Response, opts?: {
    maxBytes?: number;
    maxChars?: number;
    chunkTimeoutMs?: number;
}): Promise<string | undefined>;
