import { drainSessionWriteLockStateForTest } from "../agents/session-write-lock.js";
import { drainSessionStoreLockQueuesForTest } from "../config/sessions/store.js";
import { drainFileLockStateForTest } from "../infra/file-lock.js";
export declare function setSessionStateCleanupRuntimeForTests(params: {
    drainFileLockStateForTest?: typeof drainFileLockStateForTest | null;
    drainSessionStoreLockQueuesForTest?: typeof drainSessionStoreLockQueuesForTest | null;
    drainSessionWriteLockStateForTest?: typeof drainSessionWriteLockStateForTest | null;
}): void;
export declare function resetSessionStateCleanupRuntimeForTests(): void;
export declare function cleanupSessionStateForTest(): Promise<void>;
