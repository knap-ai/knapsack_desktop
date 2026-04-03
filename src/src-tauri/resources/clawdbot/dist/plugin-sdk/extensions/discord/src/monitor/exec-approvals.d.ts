import { Button, type ButtonInteraction, type ComponentData } from "@buape/carbon";
import { ButtonStyle } from "discord-api-types/v10";
import type { OpenClawConfig } from "openclaw/plugin-sdk/config-runtime";
import type { DiscordExecApprovalConfig } from "openclaw/plugin-sdk/config-runtime";
import type { ExecApprovalDecision, ExecApprovalRequest, ExecApprovalResolved, PluginApprovalRequest, PluginApprovalResolved } from "openclaw/plugin-sdk/infra-runtime";
import type { RuntimeEnv } from "openclaw/plugin-sdk/runtime-env";
export { extractDiscordChannelId } from "../approval-native.js";
export type { ExecApprovalRequest, ExecApprovalResolved, PluginApprovalRequest, PluginApprovalResolved, };
type ApprovalRequest = ExecApprovalRequest | PluginApprovalRequest;
type ApprovalResolved = ExecApprovalResolved | PluginApprovalResolved;
export declare function buildExecApprovalCustomId(approvalId: string, action: ExecApprovalDecision): string;
export declare function parseExecApprovalData(data: ComponentData): {
    approvalId: string;
    action: ExecApprovalDecision;
} | null;
export type DiscordExecApprovalHandlerOpts = {
    token: string;
    accountId: string;
    config: DiscordExecApprovalConfig;
    gatewayUrl?: string;
    cfg: OpenClawConfig;
    runtime?: RuntimeEnv;
    onResolve?: (id: string, decision: ExecApprovalDecision) => Promise<void>;
};
export declare class DiscordExecApprovalHandler {
    private readonly runtime;
    private opts;
    constructor(opts: DiscordExecApprovalHandlerOpts);
    shouldHandle(request: ApprovalRequest): boolean;
    start(): Promise<void>;
    stop(): Promise<void>;
    handleApprovalRequested(request: ApprovalRequest): Promise<void>;
    handleApprovalResolved(resolved: ApprovalResolved): Promise<void>;
    handleApprovalTimeout(approvalId: string, _source?: "channel" | "dm"): Promise<void>;
    private finalizeResolved;
    private finalizeExpired;
    private finalizeMessage;
    private updateMessage;
    resolveApproval(approvalId: string, decision: ExecApprovalDecision): Promise<boolean>;
    /** Return the list of configured approver IDs. */
    getApprovers(): string[];
}
export type ExecApprovalButtonContext = {
    handler: DiscordExecApprovalHandler;
};
export declare class ExecApprovalButton extends Button {
    label: string;
    customId: string;
    style: ButtonStyle;
    private ctx;
    constructor(ctx: ExecApprovalButtonContext);
    run(interaction: ButtonInteraction, data: ComponentData): Promise<void>;
}
export declare function createExecApprovalButton(ctx: ExecApprovalButtonContext): Button;
