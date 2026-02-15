import type { RuntimeEnv } from "../runtime.js";
export { DEFAULT_IMESSAGE_PROBE_TIMEOUT_MS } from "./constants.js";
export type IMessageProbe = {
    ok: boolean;
    error?: string | null;
    fatal?: boolean;
};
export type IMessageProbeOptions = {
    cliPath?: string;
    dbPath?: string;
    runtime?: RuntimeEnv;
};
/**
 * Probe iMessage RPC availability.
 * @param timeoutMs - Explicit timeout in ms. If undefined, uses config or default.
 * @param opts - Additional options (cliPath, dbPath, runtime).
 */
export declare function probeIMessage(timeoutMs?: number, opts?: IMessageProbeOptions): Promise<IMessageProbe>;
