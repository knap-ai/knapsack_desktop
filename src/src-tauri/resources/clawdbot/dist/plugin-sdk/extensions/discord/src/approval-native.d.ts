import type { DiscordExecApprovalConfig, OpenClawConfig } from "openclaw/plugin-sdk/config-runtime";
import type { ExecApprovalRequest, PluginApprovalRequest } from "openclaw/plugin-sdk/infra-runtime";
type ApprovalRequest = ExecApprovalRequest | PluginApprovalRequest;
export declare function extractDiscordChannelId(sessionKey?: string | null): string | null;
export declare function shouldHandleDiscordApprovalRequest(params: {
    cfg: OpenClawConfig;
    accountId?: string | null;
    request: ApprovalRequest;
    configOverride?: DiscordExecApprovalConfig | null;
}): boolean;
export declare function createDiscordApprovalCapability(configOverride?: DiscordExecApprovalConfig | null): import("openclaw/plugin-sdk/channel-contract").ChannelApprovalCapability;
export declare function createDiscordNativeApprovalAdapter(configOverride?: DiscordExecApprovalConfig | null): {
    auth: {
        authorizeActorAction?: import("openclaw/plugin-sdk/channel-contract").ChannelApprovalCapability["authorizeActorAction"];
        getActionAvailabilityState?: import("openclaw/plugin-sdk/channel-contract").ChannelApprovalCapability["getActionAvailabilityState"];
    };
    delivery: import("openclaw/plugin-sdk/channel-contract").ChannelApprovalCapability["delivery"];
    render: import("openclaw/plugin-sdk/channel-contract").ChannelApprovalCapability["render"];
    native: import("openclaw/plugin-sdk/channel-contract").ChannelApprovalCapability["native"];
};
export declare const discordApprovalCapability: import("openclaw/plugin-sdk/channel-contract").ChannelApprovalCapability;
export declare const discordNativeApprovalAdapter: {
    auth: {
        authorizeActorAction?: import("openclaw/plugin-sdk/channel-contract").ChannelApprovalCapability["authorizeActorAction"];
        getActionAvailabilityState?: import("openclaw/plugin-sdk/channel-contract").ChannelApprovalCapability["getActionAvailabilityState"];
    };
    delivery: import("openclaw/plugin-sdk/channel-contract").ChannelApprovalCapability["delivery"];
    render: import("openclaw/plugin-sdk/channel-contract").ChannelApprovalCapability["render"];
    native: import("openclaw/plugin-sdk/channel-contract").ChannelApprovalCapability["native"];
};
export {};
