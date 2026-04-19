export declare function trimMaybeString(value: unknown): string | undefined;
export declare function resolveMatrixSessionAccountId(value: unknown): string | undefined;
export declare function resolveMatrixStoredRoomId(params: {
    deliveryTo?: unknown;
    lastTo?: unknown;
    originNativeChannelId?: unknown;
    originTo?: unknown;
}): string | undefined;
type MatrixStoredSessionEntryLike = {
    deliveryContext?: {
        channel?: unknown;
        to?: unknown;
        accountId?: unknown;
    };
    origin?: {
        provider?: unknown;
        from?: unknown;
        to?: unknown;
        nativeChannelId?: unknown;
        nativeDirectUserId?: unknown;
        accountId?: unknown;
        chatType?: unknown;
    };
    lastChannel?: unknown;
    lastTo?: unknown;
    lastAccountId?: unknown;
    chatType?: unknown;
};
export declare function resolveMatrixStoredSessionMeta(entry?: MatrixStoredSessionEntryLike): {
    channel?: string;
    accountId?: string;
    roomId?: string;
    directUserId?: string;
} | null;
export {};
