import type { CronJobCreate, CronJobPatch } from "./types.js";
import { type CronServiceDeps } from "./service/state.js";
export type { CronEvent, CronServiceDeps } from "./service/state.js";
export declare class CronService {
    private readonly state;
    constructor(deps: CronServiceDeps);
    start(): Promise<void>;
    stop(): void;
    status(): Promise<{
        enabled: boolean;
        storePath: string;
        jobs: number;
        nextWakeAtMs: number | null;
    }>;
    list(opts?: {
        includeDisabled?: boolean;
    }): Promise<import("./types.js").CronJob[]>;
    add(input: CronJobCreate): Promise<import("./types.js").CronJob>;
    update(id: string, patch: CronJobPatch): Promise<import("./types.js").CronJob>;
    remove(id: string): Promise<{
        readonly ok: false;
        readonly removed: false;
    } | {
        readonly ok: true;
        readonly removed: boolean;
    }>;
    run(id: string, mode?: "due" | "force"): Promise<{
        ok: boolean;
        ran: boolean;
        reason: "already-running";
    } | {
        ok: boolean;
        ran: boolean;
        reason: "not-due";
    } | {
        readonly ok: true;
        readonly ran: true;
        reason?: undefined;
    }>;
    wake(opts: {
        mode: "now" | "next-heartbeat";
        text: string;
    }): {
        readonly ok: false;
    } | {
        readonly ok: true;
    };
}
