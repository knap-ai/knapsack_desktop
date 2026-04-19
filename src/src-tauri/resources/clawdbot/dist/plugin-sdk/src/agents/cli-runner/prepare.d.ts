import { ensureMcpLoopbackServer } from "../../gateway/mcp-http.js";
import { createMcpLoopbackServerConfig, getActiveMcpLoopbackRuntime } from "../../gateway/mcp-http.loopback-runtime.js";
import { makeBootstrapWarn as makeBootstrapWarnImpl, resolveBootstrapContextForRun as resolveBootstrapContextForRunImpl } from "../bootstrap-files.js";
import type { PreparedCliRunContext, RunCliAgentParams } from "./types.js";
declare const prepareDeps: {
    makeBootstrapWarn: typeof makeBootstrapWarnImpl;
    resolveBootstrapContextForRun: typeof resolveBootstrapContextForRunImpl;
    getActiveMcpLoopbackRuntime: typeof getActiveMcpLoopbackRuntime;
    ensureMcpLoopbackServer: typeof ensureMcpLoopbackServer;
    createMcpLoopbackServerConfig: typeof createMcpLoopbackServerConfig;
    resolveOpenClawDocsPath: (params: Parameters<typeof import("../docs-path.js").resolveOpenClawDocsPath>[0]) => Promise<string | null>;
};
export declare function setCliRunnerPrepareTestDeps(overrides: Partial<typeof prepareDeps>): void;
export declare function prepareCliRunContext(params: RunCliAgentParams): Promise<PreparedCliRunContext>;
export {};
