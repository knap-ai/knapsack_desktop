import { type GroupPolicy } from "openclaw/plugin-sdk/config-runtime";
import { type SenderGroupAccessDecision } from "openclaw/plugin-sdk/group-access";
export declare function isZaloSenderAllowed(senderId: string, allowFrom: string[]): boolean;
export declare function resolveZaloRuntimeGroupPolicy(params: {
    providerConfigPresent: boolean;
    groupPolicy?: GroupPolicy;
    defaultGroupPolicy?: GroupPolicy;
}): {
    groupPolicy: GroupPolicy;
    providerMissingFallbackApplied: boolean;
};
export declare function evaluateZaloGroupAccess(params: {
    providerConfigPresent: boolean;
    configuredGroupPolicy?: GroupPolicy;
    defaultGroupPolicy?: GroupPolicy;
    groupAllowFrom: string[];
    senderId: string;
}): SenderGroupAccessDecision;
