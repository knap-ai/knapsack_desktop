import type { CoreConfig } from "../types.js";
export declare function shouldStoreMatrixAccountAtTopLevel(cfg: CoreConfig, accountId: string): boolean;
export declare function resolveMatrixConfigPath(cfg: CoreConfig, accountId: string): string;
export declare function resolveMatrixConfigFieldPath(cfg: CoreConfig, accountId: string, fieldPath: string): string;
