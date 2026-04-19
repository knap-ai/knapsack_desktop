export declare function buildTelegramInboundDebounceKey(params: {
    accountId?: string | null;
    conversationKey: string;
    senderId: string;
    debounceLane: "default" | "forward";
}): string;
