import type { ChannelSetupWizard } from "../channels/plugins/setup-wizard-types.js";
import type { ChannelSetupAdapter } from "../channels/plugins/types.adapters.js";
type FacadeModule = {
    feishuSetupAdapter: ChannelSetupAdapter;
    feishuSetupWizard: ChannelSetupWizard;
};
export declare const feishuSetupAdapter: FacadeModule["feishuSetupAdapter"];
export declare const feishuSetupWizard: FacadeModule["feishuSetupWizard"];
export {};
