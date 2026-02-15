export type TelegramProbe = {
    ok: boolean;
    status?: number | null;
    error?: string | null;
    elapsedMs: number;
    bot?: {
        id?: number | null;
        username?: string | null;
        canJoinGroups?: boolean | null;
        canReadAllGroupMessages?: boolean | null;
        supportsInlineQueries?: boolean | null;
    };
    webhook?: {
        url?: string | null;
        hasCustomCert?: boolean | null;
    };
};
export declare function probeTelegram(token: string, timeoutMs: number, proxyUrl?: string): Promise<TelegramProbe>;
