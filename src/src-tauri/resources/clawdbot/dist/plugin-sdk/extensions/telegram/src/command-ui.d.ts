import type { ReplyPayload } from "openclaw/plugin-sdk/reply-runtime";
import { type ProviderInfo } from "./model-buttons.js";
export declare function buildCommandsPaginationKeyboard(currentPage: number, totalPages: number, agentId?: string): Array<Array<{
    text: string;
    callback_data: string;
}>>;
export declare function buildTelegramCommandsListChannelData(params: {
    currentPage: number;
    totalPages: number;
    agentId?: string;
}): ReplyPayload["channelData"] | null;
export declare function buildTelegramModelsProviderChannelData(params: {
    providers: ProviderInfo[];
}): ReplyPayload["channelData"] | null;
export declare function buildTelegramModelsListChannelData(params: {
    provider: string;
    models: readonly string[];
    currentModel?: string;
    currentPage: number;
    totalPages: number;
    pageSize?: number;
    modelNames?: ReadonlyMap<string, string>;
}): ReplyPayload["channelData"] | null;
export declare function buildTelegramModelBrowseChannelData(): ReplyPayload["channelData"];
