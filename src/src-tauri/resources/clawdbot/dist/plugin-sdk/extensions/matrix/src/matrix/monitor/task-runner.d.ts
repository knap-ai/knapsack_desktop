import type { RuntimeLogger } from "../../runtime-api.js";
export declare function createMatrixMonitorTaskRunner(params: {
    logger: RuntimeLogger;
    logVerboseMessage: (message: string) => void;
}): {
    runDetachedTask: (label: string, task: () => Promise<void>) => Promise<void>;
    waitForIdle: () => Promise<void>;
};
