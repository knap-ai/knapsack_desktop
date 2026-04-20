import type { SQLInputValue } from "node:sqlite";
type VectorWriteDb = {
    prepare: (sql: string) => {
        run: (...params: SQLInputValue[]) => unknown;
    };
};
export declare function replaceMemoryVectorRow(params: {
    db: VectorWriteDb;
    id: string;
    embedding: number[];
    tableName?: string;
}): void;
export {};
