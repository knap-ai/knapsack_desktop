import type { OpenClawConfig } from "../../config/config.js";
import { normalizeDeliveryContext } from "../../utils/delivery-context.js";
import type { OpenClawPluginToolContext } from "../types.js";
import type { PluginRuntimeTaskFlow } from "./runtime-taskflow.js";
import type { TaskFlowDetail, TaskFlowView, TaskRunAggregateSummary, TaskRunCancelResult, TaskRunDetail, TaskRunView } from "./task-domain-types.js";
export type BoundTaskRunsRuntime = {
    readonly sessionKey: string;
    readonly requesterOrigin?: ReturnType<typeof normalizeDeliveryContext>;
    get: (taskId: string) => TaskRunDetail | undefined;
    list: () => TaskRunView[];
    findLatest: () => TaskRunDetail | undefined;
    resolve: (token: string) => TaskRunDetail | undefined;
    cancel: (params: {
        taskId: string;
        cfg: OpenClawConfig;
    }) => Promise<TaskRunCancelResult>;
};
export type PluginRuntimeTaskRuns = {
    bindSession: (params: {
        sessionKey: string;
        requesterOrigin?: import("../../tasks/task-registry.types.js").TaskDeliveryState["requesterOrigin"];
    }) => BoundTaskRunsRuntime;
    fromToolContext: (ctx: Pick<OpenClawPluginToolContext, "sessionKey" | "deliveryContext">) => BoundTaskRunsRuntime;
};
export type BoundTaskFlowsRuntime = {
    readonly sessionKey: string;
    readonly requesterOrigin?: ReturnType<typeof normalizeDeliveryContext>;
    get: (flowId: string) => TaskFlowDetail | undefined;
    list: () => TaskFlowView[];
    findLatest: () => TaskFlowDetail | undefined;
    resolve: (token: string) => TaskFlowDetail | undefined;
    getTaskSummary: (flowId: string) => TaskRunAggregateSummary | undefined;
};
export type PluginRuntimeTaskFlows = {
    bindSession: (params: {
        sessionKey: string;
        requesterOrigin?: import("../../tasks/task-registry.types.js").TaskDeliveryState["requesterOrigin"];
    }) => BoundTaskFlowsRuntime;
    fromToolContext: (ctx: Pick<OpenClawPluginToolContext, "sessionKey" | "deliveryContext">) => BoundTaskFlowsRuntime;
};
export type PluginRuntimeTasks = {
    runs: PluginRuntimeTaskRuns;
    flows: PluginRuntimeTaskFlows;
    /** @deprecated Use runtime.tasks.flows for DTO-based TaskFlow access. */
    flow: PluginRuntimeTaskFlow;
};
export declare function createRuntimeTaskRuns(): PluginRuntimeTaskRuns;
export declare function createRuntimeTaskFlows(): PluginRuntimeTaskFlows;
export declare function createRuntimeTasks(params: {
    legacyTaskFlow: PluginRuntimeTaskFlow;
}): PluginRuntimeTasks;
