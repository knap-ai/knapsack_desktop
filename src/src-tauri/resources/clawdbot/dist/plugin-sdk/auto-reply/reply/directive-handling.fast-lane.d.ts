import type { ModelAliasIndex } from "../../agents/model-selection.js";
import type { OpenClawConfig } from "../../config/config.js";
import type { SessionEntry } from "../../config/sessions.js";
import type { MsgContext } from "../templating.js";
import type { ReplyPayload } from "../types.js";
import type { InlineDirectives } from "./directive-handling.parse.js";
import type { ThinkLevel } from "./directives.js";
export declare function applyInlineDirectivesFastLane(params: {
    directives: InlineDirectives;
    commandAuthorized: boolean;
    ctx: MsgContext;
    cfg: OpenClawConfig;
    agentId?: string;
    isGroup: boolean;
    sessionEntry: SessionEntry;
    sessionStore: Record<string, SessionEntry>;
    sessionKey: string;
    storePath?: string;
    elevatedEnabled: boolean;
    elevatedAllowed: boolean;
    elevatedFailures?: Array<{
        gate: string;
        key: string;
    }>;
    messageProviderKey?: string;
    defaultProvider: string;
    defaultModel: string;
    aliasIndex: ModelAliasIndex;
    allowedModelKeys: Set<string>;
    allowedModelCatalog: Awaited<ReturnType<typeof import("../../agents/model-catalog.js").loadModelCatalog>>;
    resetModelOverride: boolean;
    provider: string;
    model: string;
    initialModelLabel: string;
    formatModelSwitchEvent: (label: string, alias?: string) => string;
    agentCfg?: NonNullable<OpenClawConfig["agents"]>["defaults"];
    modelState: {
        resolveDefaultThinkingLevel: () => Promise<ThinkLevel | undefined>;
        allowedModelKeys: Set<string>;
        allowedModelCatalog: Awaited<ReturnType<typeof import("../../agents/model-catalog.js").loadModelCatalog>>;
        resetModelOverride: boolean;
    };
}): Promise<{
    directiveAck?: ReplyPayload;
    provider: string;
    model: string;
}>;
