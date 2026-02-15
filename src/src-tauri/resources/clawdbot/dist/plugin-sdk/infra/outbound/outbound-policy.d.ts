import type { ChannelId, ChannelMessageActionName, ChannelThreadingToolContext } from "../../channels/plugins/types.js";
import type { OpenClawConfig } from "../../config/config.js";
export type CrossContextDecoration = {
    prefix: string;
    suffix: string;
    embeds?: unknown[];
};
export declare function enforceCrossContextPolicy(params: {
    channel: ChannelId;
    action: ChannelMessageActionName;
    args: Record<string, unknown>;
    toolContext?: ChannelThreadingToolContext;
    cfg: OpenClawConfig;
}): void;
export declare function buildCrossContextDecoration(params: {
    cfg: OpenClawConfig;
    channel: ChannelId;
    target: string;
    toolContext?: ChannelThreadingToolContext;
    accountId?: string | null;
}): Promise<CrossContextDecoration | null>;
export declare function shouldApplyCrossContextMarker(action: ChannelMessageActionName): boolean;
export declare function applyCrossContextDecoration(params: {
    message: string;
    decoration: CrossContextDecoration;
    preferEmbeds: boolean;
}): {
    message: string;
    embeds?: unknown[];
    usedEmbeds: boolean;
};
