import type { AllowlistMatch, ChannelGroupContext, GroupToolPolicyConfig } from "../runtime-api.js";
import type { FeishuConfig, FeishuGroupConfig } from "./types.js";
export type FeishuAllowlistMatch = AllowlistMatch<"wildcard" | "id">;
export declare function resolveFeishuAllowlistMatch(params: {
    allowFrom: Array<string | number>;
    senderId: string;
    senderIds?: Array<string | null | undefined>;
    senderName?: string | null;
}): FeishuAllowlistMatch;
export declare function resolveFeishuGroupConfig(params: {
    cfg?: FeishuConfig;
    groupId?: string | null;
}): FeishuGroupConfig | undefined;
export declare function resolveFeishuGroupToolPolicy(params: ChannelGroupContext): GroupToolPolicyConfig | undefined;
export declare function isFeishuGroupAllowed(params: {
    groupPolicy: "open" | "allowlist" | "disabled" | "allowall";
    allowFrom: Array<string | number>;
    senderId: string;
    senderIds?: Array<string | null | undefined>;
    senderName?: string | null;
}): boolean;
export declare function resolveFeishuReplyPolicy(params: {
    isDirectMessage: boolean;
    globalConfig?: FeishuConfig;
    groupConfig?: FeishuGroupConfig;
}): {
    requireMention: boolean;
};
