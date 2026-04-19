type EnableStateLike = {
    enabled: boolean;
    reason?: string;
};
type EnableStateParamsLike = {
    id: string;
    origin: string;
    config: unknown;
    enabledByDefault?: boolean;
};
type PluginKindLike = string | readonly string[] | undefined;
export declare function toEnableStateResult<TState extends EnableStateLike>(state: TState): {
    enabled: boolean;
    reason?: string;
};
export declare function resolveEnableStateResult<TParams, TState extends EnableStateLike>(params: TParams, resolveState: (params: TParams) => TState): {
    enabled: boolean;
    reason?: string;
};
export declare function resolveEnableStateShared<TParams extends EnableStateParamsLike, TState extends EnableStateLike>(params: TParams, resolveState: (params: TParams) => TState): {
    enabled: boolean;
    reason?: string;
};
export declare function resolveMemorySlotDecisionShared(params: {
    id: string;
    kind?: PluginKindLike;
    slot: string | null | undefined;
    selectedId: string | null;
}): {
    enabled: boolean;
    reason?: string;
    selected?: boolean;
};
export {};
