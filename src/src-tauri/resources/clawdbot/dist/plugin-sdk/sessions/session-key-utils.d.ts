export type ParsedAgentSessionKey = {
    agentId: string;
    rest: string;
};
export declare function parseAgentSessionKey(sessionKey: string | undefined | null): ParsedAgentSessionKey | null;
export declare function isCronRunSessionKey(sessionKey: string | undefined | null): boolean;
export declare function isSubagentSessionKey(sessionKey: string | undefined | null): boolean;
export declare function isAcpSessionKey(sessionKey: string | undefined | null): boolean;
export declare function resolveThreadParentSessionKey(sessionKey: string | undefined | null): string | null;
