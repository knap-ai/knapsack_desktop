export type InboundAccessControlResult = {
    allowed: boolean;
    shouldMarkRead: boolean;
    isSelfChat: boolean;
    resolvedAccountId: string;
};
export declare function checkInboundAccessControl(params: {
    accountId: string;
    from: string;
    selfE164: string | null;
    senderE164: string | null;
    group: boolean;
    pushName?: string;
    isFromMe: boolean;
    messageTimestampMs?: number;
    connectedAtMs?: number;
    pairingGraceMs?: number;
    sock: {
        sendMessage: (jid: string, content: {
            text: string;
        }) => Promise<unknown>;
    };
    remoteJid: string;
}): Promise<InboundAccessControlResult>;
