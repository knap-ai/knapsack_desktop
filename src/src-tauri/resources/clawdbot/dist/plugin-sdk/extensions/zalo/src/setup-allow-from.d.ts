import { type ChannelSetupDmPolicy, type ChannelSetupWizard, type OpenClawConfig } from "openclaw/plugin-sdk/setup";
export declare function noteZaloTokenHelp(prompter: Parameters<NonNullable<ChannelSetupWizard["finalize"]>>[0]["prompter"]): Promise<void>;
export declare function promptZaloAllowFrom(params: {
    cfg: OpenClawConfig;
    prompter: Parameters<NonNullable<ChannelSetupDmPolicy["promptAllowFrom"]>>[0]["prompter"];
    accountId?: string;
}): Promise<OpenClawConfig>;
