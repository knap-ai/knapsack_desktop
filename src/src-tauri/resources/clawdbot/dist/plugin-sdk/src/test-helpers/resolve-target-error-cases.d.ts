type ResolveTargetMode = "explicit" | "implicit" | "heartbeat";
type ResolveTargetResult = {
    ok: boolean;
    to?: string;
    error?: unknown;
};
type ResolveTargetFn = (params: {
    to?: string;
    mode: ResolveTargetMode;
    allowFrom: string[];
}) => ResolveTargetResult;
export declare function installCommonResolveTargetErrorCases(params: {
    resolveTarget: ResolveTargetFn;
    implicitAllowFrom: string[];
}): void;
export {};
