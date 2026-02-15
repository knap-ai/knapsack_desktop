export type SignalProbe = {
    ok: boolean;
    status?: number | null;
    error?: string | null;
    elapsedMs: number;
    version?: string | null;
};
export declare function probeSignal(baseUrl: string, timeoutMs: number): Promise<SignalProbe>;
