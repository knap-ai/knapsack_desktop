import type { App } from "@slack/bolt";
import type { OpenClawConfig } from "openclaw/plugin-sdk/config-runtime";
import { type ExecApprovalRequest, type ExecApprovalResolved } from "openclaw/plugin-sdk/infra-runtime";
type SlackExecApprovalConfig = NonNullable<NonNullable<NonNullable<OpenClawConfig["channels"]>["slack"]>["execApprovals"]>;
type SlackExecApprovalHandlerOpts = {
    app: App;
    accountId: string;
    config: SlackExecApprovalConfig;
    gatewayUrl?: string;
    cfg: OpenClawConfig;
};
export declare class SlackExecApprovalHandler {
    private readonly runtime;
    private readonly opts;
    constructor(opts: SlackExecApprovalHandlerOpts);
    shouldHandle(request: ExecApprovalRequest): boolean;
    start(): Promise<void>;
    stop(): Promise<void>;
    handleApprovalRequested(request: ExecApprovalRequest): Promise<void>;
    handleApprovalResolved(resolved: ExecApprovalResolved): Promise<void>;
    handleApprovalTimeout(approvalId: string): Promise<void>;
    private finalizeResolved;
    private finalizeExpired;
    private updateMessage;
}
export {};
