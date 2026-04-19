import type { Command } from "commander";
export type { GatewayRpcOpts } from "./gateway-rpc.types.js";
import type { GatewayRpcOpts } from "./gateway-rpc.types.js";
export declare function addGatewayClientOptions(cmd: Command): Command;
export declare function callGatewayFromCli(method: string, opts: GatewayRpcOpts, params?: unknown, extra?: {
    expectFinal?: boolean;
    progress?: boolean;
}): Promise<Record<string, unknown>>;
