type MatrixCommandAuthorizer = {
    configured: boolean;
    allowed: boolean;
};
type MatrixMonitorAllowListMatch = {
    allowed: boolean;
    matchKey?: string;
    matchSource?: "wildcard" | "id" | "prefixed-id" | "prefixed-user";
};
export type MatrixMonitorAccessState = {
    effectiveAllowFrom: string[];
    effectiveGroupAllowFrom: string[];
    effectiveRoomUsers: string[];
    groupAllowConfigured: boolean;
    directAllowMatch: MatrixMonitorAllowListMatch;
    roomUserMatch: MatrixMonitorAllowListMatch | null;
    groupAllowMatch: MatrixMonitorAllowListMatch | null;
    commandAuthorizers: [MatrixCommandAuthorizer, MatrixCommandAuthorizer, MatrixCommandAuthorizer];
};
export declare function resolveMatrixMonitorAccessState(params: {
    allowFrom: Array<string | number>;
    storeAllowFrom: Array<string | number>;
    groupAllowFrom: Array<string | number>;
    roomUsers: Array<string | number>;
    senderId: string;
    isRoom: boolean;
}): MatrixMonitorAccessState;
export {};
