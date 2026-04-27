import fs from "node:fs";
import { type QueuedFileWriter } from "../agents/queued-file-writer.js";
import type { OpenClawConfig } from "../config/types.openclaw.js";
import type { TrajectoryToolDefinition } from "./types.js";
type TrajectoryRuntimeInit = {
    cfg?: OpenClawConfig;
    env?: NodeJS.ProcessEnv;
    runId?: string;
    sessionId: string;
    sessionKey?: string;
    sessionFile?: string;
    provider?: string;
    modelId?: string;
    modelApi?: string | null;
    workspaceDir?: string;
    writer?: QueuedFileWriter;
};
type TrajectoryRuntimeRecorder = {
    enabled: true;
    filePath: string;
    recordEvent: (type: string, data?: Record<string, unknown>) => void;
    flush: () => Promise<void>;
};
export declare const TRAJECTORY_RUNTIME_FILE_MAX_BYTES: number;
export declare const TRAJECTORY_RUNTIME_EVENT_MAX_BYTES: number;
type TrajectoryPointerOpenFlagConstants = Pick<typeof fs.constants, "O_CREAT" | "O_TRUNC" | "O_WRONLY"> & Partial<Pick<typeof fs.constants, "O_NOFOLLOW">>;
export declare function safeTrajectorySessionFileName(sessionId: string): string;
export declare function resolveTrajectoryPointerOpenFlags(constants?: TrajectoryPointerOpenFlagConstants): number;
export declare function resolveTrajectoryFilePath(params: {
    env?: NodeJS.ProcessEnv;
    sessionFile?: string;
    sessionId: string;
}): string;
export declare function resolveTrajectoryPointerFilePath(sessionFile: string): string;
export declare function toTrajectoryToolDefinitions(tools: ReadonlyArray<{
    name?: string;
    description?: string;
    parameters?: unknown;
}>): TrajectoryToolDefinition[];
export declare function createTrajectoryRuntimeRecorder(params: TrajectoryRuntimeInit): TrajectoryRuntimeRecorder | null;
export {};
