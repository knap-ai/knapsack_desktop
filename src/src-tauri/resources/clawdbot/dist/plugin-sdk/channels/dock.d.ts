import type { OpenClawConfig } from "../config/config.js";
import type { ChannelCapabilities, ChannelCommandAdapter, ChannelElevatedAdapter, ChannelGroupAdapter, ChannelId, ChannelAgentPromptAdapter, ChannelMentionAdapter, ChannelThreadingAdapter } from "./plugins/types.js";
export type ChannelDock = {
    id: ChannelId;
    capabilities: ChannelCapabilities;
    commands?: ChannelCommandAdapter;
    outbound?: {
        textChunkLimit?: number;
    };
    streaming?: ChannelDockStreaming;
    elevated?: ChannelElevatedAdapter;
    config?: {
        resolveAllowFrom?: (params: {
            cfg: OpenClawConfig;
            accountId?: string | null;
        }) => Array<string | number> | undefined;
        formatAllowFrom?: (params: {
            cfg: OpenClawConfig;
            accountId?: string | null;
            allowFrom: Array<string | number>;
        }) => string[];
    };
    groups?: ChannelGroupAdapter;
    mentions?: ChannelMentionAdapter;
    threading?: ChannelThreadingAdapter;
    agentPrompt?: ChannelAgentPromptAdapter;
};
type ChannelDockStreaming = {
    blockStreamingCoalesceDefaults?: {
        minChars?: number;
        idleMs?: number;
    };
};
export declare function listChannelDocks(): ChannelDock[];
export declare function getChannelDock(id: ChannelId): ChannelDock | undefined;
export {};
