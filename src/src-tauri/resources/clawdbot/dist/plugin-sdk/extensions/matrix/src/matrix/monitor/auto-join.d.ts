import type { MatrixConfig } from "../../types.js";
import type { MatrixClient } from "../sdk.js";
import type { RuntimeEnv } from "./runtime-api.js";
export declare function registerMatrixAutoJoin(params: {
    client: MatrixClient;
    accountConfig: Pick<MatrixConfig, "autoJoin" | "autoJoinAllowlist">;
    runtime: RuntimeEnv;
}): void;
