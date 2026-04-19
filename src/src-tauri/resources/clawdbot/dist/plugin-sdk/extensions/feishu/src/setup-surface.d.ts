import { type ChannelSetupWizard, type OpenClawConfig } from "openclaw/plugin-sdk/setup";
type WizardPrompter = Parameters<NonNullable<ChannelSetupWizard["finalize"]>>[0]["prompter"];
export declare function runFeishuLogin(params: {
    cfg: OpenClawConfig;
    prompter: WizardPrompter;
}): Promise<OpenClawConfig>;
export { feishuSetupAdapter } from "./setup-core.js";
export declare const feishuSetupWizard: ChannelSetupWizard;
