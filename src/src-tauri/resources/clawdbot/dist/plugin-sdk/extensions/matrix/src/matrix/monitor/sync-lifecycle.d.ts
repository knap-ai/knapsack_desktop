import type { MatrixClient } from "../sdk.js";
import type { MatrixMonitorStatusController } from "./status.js";
export declare function createMatrixMonitorSyncLifecycle(params: {
    client: MatrixClient;
    statusController: MatrixMonitorStatusController;
    isStopping?: () => boolean;
}): {
    waitForFatalStop(): Promise<void>;
    dispose(): void;
};
