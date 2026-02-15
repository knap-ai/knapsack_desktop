import type { NormalizedUsage } from "../../agents/usage.js";
import type { ChannelThreadingToolContext } from "../../channels/plugins/types.js";
import type { OpenClawConfig } from "../../config/config.js";
import type { TemplateContext } from "../templating.js";
import type { ReplyPayload } from "../types.js";
import type { FollowupRun } from "./queue.js";
/**
 * Build provider-specific threading context for tool auto-injection.
 */
export declare function buildThreadingToolContext(params: {
    sessionCtx: TemplateContext;
    config: OpenClawConfig | undefined;
    hasRepliedRef: {
        value: boolean;
    } | undefined;
}): ChannelThreadingToolContext;
export declare const isBunFetchSocketError: (message?: string) => boolean;
export declare const formatBunFetchSocketError: (message: string) => string;
export declare const formatResponseUsageLine: (params: {
    usage?: NormalizedUsage;
    showCost: boolean;
    costConfig?: {
        input: number;
        output: number;
        cacheRead: number;
        cacheWrite: number;
    };
}) => string | null;
export declare const appendUsageLine: (payloads: ReplyPayload[], line: string) => ReplyPayload[];
export declare const resolveEnforceFinalTag: (run: FollowupRun["run"], provider: string) => boolean;
