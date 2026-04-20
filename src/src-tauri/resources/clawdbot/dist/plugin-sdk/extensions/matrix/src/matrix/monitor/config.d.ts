import { resolveMatrixTargets } from "../../resolve-targets.js";
import type { CoreConfig, MatrixRoomConfig } from "../../types.js";
import { type RuntimeEnv } from "./runtime-api.js";
type MatrixRoomsConfig = Record<string, MatrixRoomConfig>;
type ResolveMatrixTargetsFn = typeof resolveMatrixTargets;
export declare function resolveMatrixMonitorConfig(params: {
    cfg: CoreConfig;
    accountId?: string | null;
    allowFrom?: Array<string | number>;
    groupAllowFrom?: Array<string | number>;
    roomsConfig?: MatrixRoomsConfig;
    runtime: RuntimeEnv;
    resolveTargets?: ResolveMatrixTargetsFn;
}): Promise<{
    allowFrom: string[];
    groupAllowFrom: string[];
    roomsConfig?: MatrixRoomsConfig;
}>;
export {};
