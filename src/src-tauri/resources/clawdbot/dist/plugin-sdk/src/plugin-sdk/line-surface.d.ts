import type { BaseProbeResult } from "../channels/plugins/types.public.js";
type FacadeFunction = (...args: unknown[]) => unknown;
type FacadeModule = Record<"createActionCard" | "createAgendaCard" | "createAppleTvRemoteCard" | "createDeviceControlCard" | "createEventCard" | "createImageCard" | "createInfoCard" | "createListCard" | "createMediaPlayerCard" | "createReceiptCard" | "listLineAccountIds" | "normalizeAccountId" | "processLineMessage" | "resolveDefaultLineAccountId" | "resolveExactLineGroupConfigKey" | "resolveLineAccount", FacadeFunction> & {
    LineConfigSchema: object;
};
export declare const createActionCard: FacadeModule["createActionCard"];
export declare const createAgendaCard: FacadeModule["createAgendaCard"];
export declare const createAppleTvRemoteCard: FacadeModule["createAppleTvRemoteCard"];
export declare const createDeviceControlCard: FacadeModule["createDeviceControlCard"];
export declare const createEventCard: FacadeModule["createEventCard"];
export declare const createImageCard: FacadeModule["createImageCard"];
export declare const createInfoCard: FacadeModule["createInfoCard"];
export declare const createListCard: FacadeModule["createListCard"];
export declare const createMediaPlayerCard: FacadeModule["createMediaPlayerCard"];
export declare const createReceiptCard: FacadeModule["createReceiptCard"];
export declare const LineConfigSchema: FacadeModule["LineConfigSchema"];
export declare const listLineAccountIds: FacadeModule["listLineAccountIds"];
export declare const normalizeAccountId: FacadeModule["normalizeAccountId"];
export declare const processLineMessage: FacadeModule["processLineMessage"];
export declare const resolveDefaultLineAccountId: FacadeModule["resolveDefaultLineAccountId"];
export declare const resolveExactLineGroupConfigKey: FacadeModule["resolveExactLineGroupConfigKey"];
export declare const resolveLineAccount: FacadeModule["resolveLineAccount"];
export type Action = Record<string, unknown>;
export interface ListItem {
    title: string;
    subtitle?: string;
    action?: Action;
}
export interface CardAction {
    label: string;
    action: Action;
}
export interface LineThreadBindingsConfig {
    enabled?: boolean;
    idleHours?: number;
    maxAgeHours?: number;
    spawnSubagentSessions?: boolean;
    spawnAcpSessions?: boolean;
}
interface LineAccountBaseConfig {
    enabled?: boolean;
    channelAccessToken?: string;
    channelSecret?: string;
    tokenFile?: string;
    secretFile?: string;
    name?: string;
    allowFrom?: Array<string | number>;
    groupAllowFrom?: Array<string | number>;
    dmPolicy?: "open" | "allowlist" | "pairing" | "disabled";
    groupPolicy?: "open" | "allowlist" | "disabled";
    responsePrefix?: string;
    mediaMaxMb?: number;
    webhookPath?: string;
    threadBindings?: LineThreadBindingsConfig;
    groups?: Record<string, LineGroupConfig>;
}
export interface LineConfig extends LineAccountBaseConfig {
    accounts?: Record<string, LineAccountBaseConfig>;
    defaultAccount?: string;
}
export interface LineGroupConfig {
    enabled?: boolean;
    allowFrom?: Array<string | number>;
    requireMention?: boolean;
    systemPrompt?: string;
    skills?: string[];
}
export interface ResolvedLineAccount {
    accountId: string;
    name?: string;
    enabled: boolean;
    channelAccessToken: string;
    channelSecret: string;
    tokenSource: "config" | "env" | "file" | "none";
    config: LineConfig & LineAccountBaseConfig;
}
export type LineProbeResult = BaseProbeResult<string> & {
    bot?: {
        displayName?: string;
        userId?: string;
        basicId?: string;
        pictureUrl?: string;
    };
};
export type LineChannelData = {
    quickReplies?: string[];
    location?: {
        title: string;
        address: string;
        latitude: number;
        longitude: number;
    };
    flexMessage?: {
        altText: string;
        contents: unknown;
    };
    templateMessage?: unknown;
};
export {};
