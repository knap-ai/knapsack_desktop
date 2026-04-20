import { resolveConfiguredAcpBindingRecord, type PluginRuntime } from "../../runtime-api.js";
import type { CoreConfig } from "../../types.js";
type MatrixResolvedRoute = ReturnType<PluginRuntime["channel"]["routing"]["resolveAgentRoute"]>;
export declare function resolveMatrixInboundRoute(params: {
    cfg: CoreConfig;
    accountId: string;
    roomId: string;
    senderId: string;
    isDirectMessage: boolean;
    dmSessionScope?: "per-user" | "per-room";
    threadId?: string;
    eventTs?: number;
    resolveAgentRoute: PluginRuntime["channel"]["routing"]["resolveAgentRoute"];
}): {
    route: MatrixResolvedRoute;
    configuredBinding: ReturnType<typeof resolveConfiguredAcpBindingRecord>;
    runtimeBindingId: string | null;
};
export {};
