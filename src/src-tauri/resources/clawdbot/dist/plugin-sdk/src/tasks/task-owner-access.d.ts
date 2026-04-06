import type { TaskRecord } from "./task-registry.types.js";
export declare function getTaskByIdForOwner(params: {
    taskId: string;
    callerOwnerKey: string;
}): TaskRecord | undefined;
export declare function findTaskByRunIdForOwner(params: {
    runId: string;
    callerOwnerKey: string;
}): TaskRecord | undefined;
export declare function listTasksForRelatedSessionKeyForOwner(params: {
    relatedSessionKey: string;
    callerOwnerKey: string;
}): TaskRecord[];
export declare function buildTaskStatusSnapshotForRelatedSessionKeyForOwner(params: {
    relatedSessionKey: string;
    callerOwnerKey: string;
}): import("./task-status.js").TaskStatusSnapshot;
export declare function findLatestTaskForRelatedSessionKeyForOwner(params: {
    relatedSessionKey: string;
    callerOwnerKey: string;
}): TaskRecord | undefined;
export declare function resolveTaskForLookupTokenForOwner(params: {
    token: string;
    callerOwnerKey: string;
}): TaskRecord | undefined;
