import { makeBootstrapWarn as makeBootstrapWarnImpl, resolveBootstrapContextForRun as resolveBootstrapContextForRunImpl } from "../bootstrap-files.js";
import type { PreparedCliRunContext, RunCliAgentParams } from "./types.js";
declare const prepareDeps: {
    makeBootstrapWarn: typeof makeBootstrapWarnImpl;
    resolveBootstrapContextForRun: typeof resolveBootstrapContextForRunImpl;
};
export declare function setCliRunnerPrepareTestDeps(overrides: Partial<typeof prepareDeps>): void;
export declare function prepareCliRunContext(params: RunCliAgentParams): Promise<PreparedCliRunContext>;
export {};
