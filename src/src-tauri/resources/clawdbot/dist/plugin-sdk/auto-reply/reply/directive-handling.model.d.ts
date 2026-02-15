import type { OpenClawConfig } from "../../config/config.js";
import type { ReplyPayload } from "../types.js";
import type { InlineDirectives } from "./directive-handling.parse.js";
import { type ModelAliasIndex } from "../../agents/model-selection.js";
import { type ModelDirectiveSelection } from "./model-selection.js";
export declare function maybeHandleModelDirectiveInfo(params: {
    directives: InlineDirectives;
    cfg: OpenClawConfig;
    agentDir: string;
    activeAgentId: string;
    provider: string;
    model: string;
    defaultProvider: string;
    defaultModel: string;
    aliasIndex: ModelAliasIndex;
    allowedModelCatalog: Array<{
        provider: string;
        id?: string;
        name?: string;
    }>;
    resetModelOverride: boolean;
    surface?: string;
}): Promise<ReplyPayload | undefined>;
export declare function resolveModelSelectionFromDirective(params: {
    directives: InlineDirectives;
    cfg: OpenClawConfig;
    agentDir: string;
    defaultProvider: string;
    defaultModel: string;
    aliasIndex: ModelAliasIndex;
    allowedModelKeys: Set<string>;
    allowedModelCatalog: Array<{
        provider: string;
        id?: string;
        name?: string;
    }>;
    provider: string;
}): {
    modelSelection?: ModelDirectiveSelection;
    profileOverride?: string;
    errorText?: string;
};
