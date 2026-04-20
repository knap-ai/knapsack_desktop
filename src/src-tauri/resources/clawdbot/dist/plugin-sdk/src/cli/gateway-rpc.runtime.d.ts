import type { GatewayRpcOpts } from "./gateway-rpc.types.js";
export declare function callGatewayFromCliRuntime(method: string, opts: GatewayRpcOpts, params?: unknown, extra?: {
    expectFinal?: boolean;
    progress?: boolean;
}): Promise<Record<string, unknown>>;
