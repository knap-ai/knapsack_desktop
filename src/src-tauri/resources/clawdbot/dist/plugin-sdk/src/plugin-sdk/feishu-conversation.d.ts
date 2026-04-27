import type { OpenClawConfig } from "../config/types.js";
import type { BindingTargetKind } from "../infra/outbound/session-binding-service.js";
type FeishuGroupSessionScope = "group" | "group_sender" | "group_topic" | "group_topic_sender";
type FeishuThreadBindingRecord = {
    accountId: string;
    conversationId: string;
    parentConversationId?: string;
    deliveryTo?: string;
    deliveryThreadId?: string;
    targetKind: "subagent" | "acp";
    targetSessionKey: string;
    agentId?: string;
    label?: string;
    boundBy?: string;
    boundAt: number;
    lastActivityAt: number;
};
type FeishuThreadBindingManager = {
    accountId: string;
    getByConversationId: (conversationId: string) => FeishuThreadBindingRecord | undefined;
    listBySessionKey: (targetSessionKey: string) => FeishuThreadBindingRecord[];
    bindConversation: (params: {
        conversationId: string;
        parentConversationId?: string;
        targetKind: BindingTargetKind;
        targetSessionKey: string;
        metadata?: Record<string, unknown>;
    }) => FeishuThreadBindingRecord | null;
    touchConversation: (conversationId: string, at?: number) => FeishuThreadBindingRecord | null;
    unbindConversation: (conversationId: string) => FeishuThreadBindingRecord | null;
    unbindBySessionKey: (targetSessionKey: string) => FeishuThreadBindingRecord[];
    stop: () => void;
};
type FacadeModule = {
    buildFeishuConversationId: (params: {
        chatId: string;
        scope: FeishuGroupSessionScope;
        senderOpenId?: string;
        topicId?: string;
    }) => string;
    createFeishuThreadBindingManager: (params: {
        accountId?: string;
        cfg: OpenClawConfig;
    }) => FeishuThreadBindingManager;
    feishuSessionBindingAdapterChannels: readonly ["feishu"];
    feishuThreadBindingTesting: {
        resetFeishuThreadBindingsForTests: () => void;
    };
    parseFeishuDirectConversationId: (raw: unknown) => string | undefined;
    parseFeishuConversationId: (params: {
        conversationId: string;
        parentConversationId?: string;
    }) => {
        canonicalConversationId: string;
        chatId: string;
        topicId?: string;
        senderOpenId?: string;
        scope: FeishuGroupSessionScope;
    } | null;
    parseFeishuTargetId: (raw: unknown) => string | undefined;
};
export declare const buildFeishuConversationId: FacadeModule["buildFeishuConversationId"];
export declare const createFeishuThreadBindingManager: FacadeModule["createFeishuThreadBindingManager"];
export declare const feishuSessionBindingAdapterChannels: FacadeModule["feishuSessionBindingAdapterChannels"];
export declare const feishuThreadBindingTesting: FacadeModule["feishuThreadBindingTesting"];
export declare const parseFeishuDirectConversationId: FacadeModule["parseFeishuDirectConversationId"];
export declare const parseFeishuConversationId: FacadeModule["parseFeishuConversationId"];
export declare const parseFeishuTargetId: FacadeModule["parseFeishuTargetId"];
export {};
