import { type FutureConfigActionBlock } from "../config/future-version-guard.js";
export declare function readFutureConfigActionBlock(action: string): Promise<FutureConfigActionBlock | null>;
export declare function assertFutureConfigActionAllowed(action: string): Promise<void>;
