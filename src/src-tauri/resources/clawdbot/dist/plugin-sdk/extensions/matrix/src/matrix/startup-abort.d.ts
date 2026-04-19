export declare function createMatrixStartupAbortError(): Error;
export declare function throwIfMatrixStartupAborted(abortSignal?: AbortSignal): void;
export declare function isMatrixStartupAbortError(error: unknown): boolean;
export declare function awaitMatrixStartupWithAbort<T>(promise: Promise<T>, abortSignal?: AbortSignal): Promise<T>;
