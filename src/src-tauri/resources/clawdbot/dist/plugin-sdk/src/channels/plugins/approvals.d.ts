import type { ChannelApprovalAdapter, ChannelApprovalCapability, ChannelPlugin } from "./types.js";
export declare function resolveChannelApprovalCapability(plugin?: Pick<ChannelPlugin, "approvalCapability" | "auth" | "approvals"> | null): ChannelApprovalCapability | undefined;
export declare function resolveChannelApprovalAdapter(plugin?: Pick<ChannelPlugin, "approvalCapability" | "auth" | "approvals"> | null): ChannelApprovalAdapter | undefined;
