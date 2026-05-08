export type PlainTextToolCallBlock = {
    arguments: Record<string, unknown>;
    end: number;
    name: string;
    raw: string;
    start: number;
};
type ParseOptions = {
    allowedToolNames?: Iterable<string>;
    maxPayloadBytes?: number;
};
export declare function parseStandalonePlainTextToolCallBlocks(text: string, options?: ParseOptions): PlainTextToolCallBlock[] | null;
export declare function stripPlainTextToolCallBlocks(text: string): string;
export {};
