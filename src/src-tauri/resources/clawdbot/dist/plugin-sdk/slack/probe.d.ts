export type SlackProbe = {
    ok: boolean;
    status?: number | null;
    error?: string | null;
    elapsedMs?: number | null;
    bot?: {
        id?: string;
        name?: string;
    };
    team?: {
        id?: string;
        name?: string;
    };
};
export declare function probeSlack(token: string, timeoutMs?: number): Promise<SlackProbe>;
