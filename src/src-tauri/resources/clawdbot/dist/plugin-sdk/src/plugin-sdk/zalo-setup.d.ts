import type { ChannelSetupWizard } from "../channels/plugins/setup-wizard-types.js";
import type { ChannelSetupAdapter } from "../channels/plugins/types.adapters.js";
import type { GroupPolicy } from "../config/types.base.js";
import type { SenderGroupAccessDecision } from "./group-access.js";
type ZaloRuntimeGroupPolicyResult = {
    groupPolicy: GroupPolicy;
    providerMissingFallbackApplied: boolean;
};
type SetupFacadeModule = {
    zaloSetupAdapter: ChannelSetupAdapter;
    zaloSetupWizard: ChannelSetupWizard;
};
type GroupAccessFacadeModule = {
    evaluateZaloGroupAccess: (params: {
        providerConfigPresent: boolean;
        configuredGroupPolicy?: GroupPolicy;
        defaultGroupPolicy?: GroupPolicy;
        groupAllowFrom: string[];
        senderId: string;
    }) => SenderGroupAccessDecision;
    resolveZaloRuntimeGroupPolicy: (params: {
        providerConfigPresent: boolean;
        groupPolicy?: GroupPolicy;
        defaultGroupPolicy?: GroupPolicy;
    }) => ZaloRuntimeGroupPolicyResult;
};
export declare const evaluateZaloGroupAccess: GroupAccessFacadeModule["evaluateZaloGroupAccess"];
export declare const resolveZaloRuntimeGroupPolicy: GroupAccessFacadeModule["resolveZaloRuntimeGroupPolicy"];
export declare const zaloSetupAdapter: SetupFacadeModule["zaloSetupAdapter"];
export declare const zaloSetupWizard: SetupFacadeModule["zaloSetupWizard"];
export {};
