import type { CronJob } from "./types.js";
export declare function cronScheduleIdentity(job: Pick<CronJob, "schedule"> & {
    enabled?: boolean;
}): string;
export declare function tryCronScheduleIdentity(job: {
    schedule?: unknown;
    enabled?: unknown;
} & Record<string, unknown>): string | undefined;
export declare function cronSchedulingInputsEqual(previous: Pick<CronJob, "schedule"> & {
    enabled?: boolean;
}, next: Pick<CronJob, "schedule"> & {
    enabled?: boolean;
}): boolean;
