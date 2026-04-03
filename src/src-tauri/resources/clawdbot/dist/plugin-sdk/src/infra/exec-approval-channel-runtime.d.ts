import type { OpenClawConfig } from "../config/config.js";
import type { ExecApprovalRequest, ExecApprovalResolved } from "./exec-approvals.js";
import type { PluginApprovalRequest, PluginApprovalResolved } from "./plugin-approvals.js";
type ApprovalRequestEvent = ExecApprovalRequest | PluginApprovalRequest;
type ApprovalResolvedEvent = ExecApprovalResolved | PluginApprovalResolved;
export type ExecApprovalChannelRuntimeEventKind = "exec" | "plugin";
export type ExecApprovalChannelRuntimeAdapter<TPending, TRequest extends ApprovalRequestEvent = ExecApprovalRequest, TResolved extends ApprovalResolvedEvent = ExecApprovalResolved> = {
    label: string;
    clientDisplayName: string;
    cfg: OpenClawConfig;
    gatewayUrl?: string;
    eventKinds?: readonly ExecApprovalChannelRuntimeEventKind[];
    isConfigured: () => boolean;
    shouldHandle: (request: TRequest) => boolean;
    deliverRequested: (request: TRequest) => Promise<TPending[]>;
    finalizeResolved: (params: {
        request: TRequest;
        resolved: TResolved;
        entries: TPending[];
    }) => Promise<void>;
    finalizeExpired?: (params: {
        request: TRequest;
        entries: TPending[];
    }) => Promise<void>;
    nowMs?: () => number;
};
export type ExecApprovalChannelRuntime<TRequest extends ApprovalRequestEvent = ExecApprovalRequest, TResolved extends ApprovalResolvedEvent = ExecApprovalResolved> = {
    start: () => Promise<void>;
    stop: () => Promise<void>;
    handleRequested: (request: TRequest) => Promise<void>;
    handleResolved: (resolved: TResolved) => Promise<void>;
    handleExpired: (approvalId: string) => Promise<void>;
    request: <T = unknown>(method: string, params: Record<string, unknown>) => Promise<T>;
};
export declare function createExecApprovalChannelRuntime<TPending, TRequest extends ApprovalRequestEvent = ExecApprovalRequest, TResolved extends ApprovalResolvedEvent = ExecApprovalResolved>(adapter: ExecApprovalChannelRuntimeAdapter<TPending, TRequest, TResolved>): ExecApprovalChannelRuntime<TRequest, TResolved>;
export {};
