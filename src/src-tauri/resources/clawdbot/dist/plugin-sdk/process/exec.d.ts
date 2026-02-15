export declare function runExec(command: string, args: string[], opts?: number | {
    timeoutMs?: number;
    maxBuffer?: number;
}): Promise<{
    stdout: string;
    stderr: string;
}>;
export type SpawnResult = {
    stdout: string;
    stderr: string;
    code: number | null;
    signal: NodeJS.Signals | null;
    killed: boolean;
};
export type CommandOptions = {
    timeoutMs: number;
    cwd?: string;
    input?: string;
    env?: NodeJS.ProcessEnv;
    windowsVerbatimArguments?: boolean;
};
export declare function runCommandWithTimeout(argv: string[], optionsOrTimeout: number | CommandOptions): Promise<SpawnResult>;
