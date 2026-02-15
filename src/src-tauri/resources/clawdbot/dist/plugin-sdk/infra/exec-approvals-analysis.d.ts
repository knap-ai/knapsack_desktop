import type { ExecAllowlistEntry } from "./exec-approvals.js";
export declare const DEFAULT_SAFE_BINS: string[];
export type CommandResolution = {
    rawExecutable: string;
    resolvedPath?: string;
    executableName: string;
};
export declare function resolveCommandResolution(command: string, cwd?: string, env?: NodeJS.ProcessEnv): CommandResolution | null;
export declare function resolveCommandResolutionFromArgv(argv: string[], cwd?: string, env?: NodeJS.ProcessEnv): CommandResolution | null;
export declare function resolveAllowlistCandidatePath(resolution: CommandResolution | null, cwd?: string): string | undefined;
export declare function matchAllowlist(entries: ExecAllowlistEntry[], resolution: CommandResolution | null): ExecAllowlistEntry | null;
export type ExecCommandSegment = {
    raw: string;
    argv: string[];
    resolution: CommandResolution | null;
};
export type ExecCommandAnalysis = {
    ok: boolean;
    reason?: string;
    segments: ExecCommandSegment[];
    chains?: ExecCommandSegment[][];
};
export declare function isWindowsPlatform(platform?: string | null): boolean;
/**
 * Splits a command string by chain operators (&&, ||, ;) while respecting quotes.
 * Returns null when no chain is present or when the chain is malformed.
 */
export declare function splitCommandChain(command: string): string[] | null;
export declare function analyzeShellCommand(params: {
    command: string;
    cwd?: string;
    env?: NodeJS.ProcessEnv;
    platform?: string | null;
}): ExecCommandAnalysis;
export declare function analyzeArgvCommand(params: {
    argv: string[];
    cwd?: string;
    env?: NodeJS.ProcessEnv;
}): ExecCommandAnalysis;
