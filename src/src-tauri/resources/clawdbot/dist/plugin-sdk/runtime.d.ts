export type RuntimeEnv = {
    log: typeof console.log;
    error: typeof console.error;
    exit: (code: number) => never;
};
export declare const defaultRuntime: RuntimeEnv;
export declare function createNonExitingRuntime(): RuntimeEnv;
