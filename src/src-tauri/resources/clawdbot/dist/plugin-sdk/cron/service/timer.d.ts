import type { CronJob } from "../types.js";
import type { CronEvent, CronServiceState } from "./state.js";
export declare function armTimer(state: CronServiceState): void;
export declare function onTimer(state: CronServiceState): Promise<void>;
export declare function runMissedJobs(state: CronServiceState): Promise<void>;
export declare function runDueJobs(state: CronServiceState): Promise<void>;
/**
 * Execute a job. This version is used by the `run` command and other
 * places that need the full execution with state updates.
 */
export declare function executeJob(state: CronServiceState, job: CronJob, _nowMs: number, _opts: {
    forced: boolean;
}): Promise<void>;
export declare function wake(state: CronServiceState, opts: {
    mode: "now" | "next-heartbeat";
    text: string;
}): {
    readonly ok: false;
} | {
    readonly ok: true;
};
export declare function stopTimer(state: CronServiceState): void;
export declare function emit(state: CronServiceState, evt: CronEvent): void;
