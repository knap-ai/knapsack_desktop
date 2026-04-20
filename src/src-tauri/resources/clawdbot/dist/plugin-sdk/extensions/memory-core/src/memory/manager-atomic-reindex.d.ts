export declare function moveMemoryIndexFiles(sourceBase: string, targetBase: string): Promise<void>;
export declare function removeMemoryIndexFiles(basePath: string): Promise<void>;
export declare function swapMemoryIndexFiles(targetPath: string, tempPath: string): Promise<void>;
export declare function runMemoryAtomicReindex<T>(params: {
    targetPath: string;
    tempPath: string;
    build: () => Promise<T>;
}): Promise<T>;
