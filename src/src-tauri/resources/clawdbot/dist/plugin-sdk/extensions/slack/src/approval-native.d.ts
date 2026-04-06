export declare const slackApprovalCapability: import("openclaw/plugin-sdk/channel-contract").ChannelApprovalCapability;
export declare const slackNativeApprovalAdapter: {
    auth: {
        authorizeActorAction?: import("openclaw/plugin-sdk/channel-contract").ChannelApprovalCapability["authorizeActorAction"];
        getActionAvailabilityState?: import("openclaw/plugin-sdk/channel-contract").ChannelApprovalCapability["getActionAvailabilityState"];
    };
    delivery: import("openclaw/plugin-sdk/channel-contract").ChannelApprovalCapability["delivery"];
    render: import("openclaw/plugin-sdk/channel-contract").ChannelApprovalCapability["render"];
    native: import("openclaw/plugin-sdk/channel-contract").ChannelApprovalCapability["native"];
};
