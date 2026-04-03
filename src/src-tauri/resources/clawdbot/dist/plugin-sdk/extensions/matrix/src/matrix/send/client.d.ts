import type { CoreConfig } from "../../types.js";
import type { MatrixClient } from "../sdk.js";
export declare function resolveMediaMaxBytes(accountId?: string | null, cfg?: CoreConfig): number | undefined;
export declare function withResolvedMatrixSendClient<T>(opts: {
    client?: MatrixClient;
    cfg?: CoreConfig;
    timeoutMs?: number;
    accountId?: string | null;
}, run: (client: MatrixClient) => Promise<T>): Promise<T>;
export declare function withResolvedMatrixControlClient<T>(opts: {
    client?: MatrixClient;
    cfg?: CoreConfig;
    timeoutMs?: number;
    accountId?: string | null;
}, run: (client: MatrixClient) => Promise<T>): Promise<T>;
