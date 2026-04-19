import AjvPkg, { type ErrorObject } from "ajv";
import type { SessionsPatchResult } from "../session-utils.types.js";
import { type AgentEvent, AgentEventSchema, type AgentIdentityParams, AgentIdentityParamsSchema, type AgentIdentityResult, AgentIdentityResultSchema, AgentParamsSchema, MessageActionParamsSchema, type AgentSummary, AgentSummarySchema, type AgentsFileEntry, AgentsFileEntrySchema, type AgentsCreateParams, AgentsCreateParamsSchema, type AgentsCreateResult, AgentsCreateResultSchema, type AgentsUpdateParams, AgentsUpdateParamsSchema, type AgentsUpdateResult, AgentsUpdateResultSchema, type AgentsDeleteParams, AgentsDeleteParamsSchema, type AgentsDeleteResult, AgentsDeleteResultSchema, type AgentsFilesGetParams, AgentsFilesGetParamsSchema, type AgentsFilesGetResult, AgentsFilesGetResultSchema, type AgentsFilesListParams, AgentsFilesListParamsSchema, type AgentsFilesListResult, AgentsFilesListResultSchema, type AgentsFilesSetParams, AgentsFilesSetParamsSchema, type AgentsFilesSetResult, AgentsFilesSetResultSchema, type AgentsListParams, AgentsListParamsSchema, type AgentsListResult, AgentsListResultSchema, type AgentWaitParams, type ChannelsLogoutParams, ChannelsLogoutParamsSchema, type TalkConfigParams, TalkConfigParamsSchema, type TalkConfigResult, TalkConfigResultSchema, type TalkSpeakParams, TalkSpeakParamsSchema, type TalkSpeakResult, TalkSpeakResultSchema, type ChannelsStatusParams, ChannelsStatusParamsSchema, type ChannelsStatusResult, ChannelsStatusResultSchema, type CommandEntry, type CommandsListParams, CommandsListParamsSchema, type CommandsListResult, CommandsListResultSchema, type ChatEvent, ChatEventSchema, ChatHistoryParamsSchema, type ChatInjectParams, ChatInjectParamsSchema, ChatSendParamsSchema, type ConfigApplyParams, ConfigApplyParamsSchema, type ConfigGetParams, ConfigGetParamsSchema, type ConfigPatchParams, ConfigPatchParamsSchema, ConfigSchemaLookupParamsSchema, ConfigSchemaLookupResultSchema, type ConfigSchemaParams, ConfigSchemaParamsSchema, type ConfigSchemaResponse, ConfigSchemaResponseSchema, type ConfigSetParams, ConfigSetParamsSchema, type ConnectParams, ConnectParamsSchema, type CronAddParams, CronAddParamsSchema, type CronJob, CronJobSchema, type CronListParams, CronListParamsSchema, type CronRemoveParams, CronRemoveParamsSchema, type CronRunLogEntry, type CronRunParams, CronRunParamsSchema, type CronRunsParams, CronRunsParamsSchema, type CronStatusParams, CronStatusParamsSchema, type CronUpdateParams, CronUpdateParamsSchema, type DevicePairApproveParams, type DevicePairListParams, type DevicePairRejectParams, type ExecApprovalsGetParams, ExecApprovalsGetParamsSchema, type ExecApprovalsSetParams, ExecApprovalsSetParamsSchema, type ExecApprovalsSnapshot, type ExecApprovalGetParams, ExecApprovalGetParamsSchema, type ExecApprovalRequestParams, ExecApprovalRequestParamsSchema, type ExecApprovalResolveParams, ExecApprovalResolveParamsSchema, ErrorCodes, type ErrorShape, ErrorShapeSchema, type EventFrame, EventFrameSchema, errorShape, type GatewayFrame, GatewayFrameSchema, type HelloOk, HelloOkSchema, type LogsTailParams, LogsTailParamsSchema, type LogsTailResult, LogsTailResultSchema, ModelsListParamsSchema, type NodeEventParams, type NodePendingDrainParams, NodePendingDrainParamsSchema, type NodePendingDrainResult, NodePendingDrainResultSchema, type NodePendingEnqueueParams, NodePendingEnqueueParamsSchema, type NodePendingEnqueueResult, NodePendingEnqueueResultSchema, type NodeInvokeParams, NodeInvokeParamsSchema, type NodeInvokeResultParams, type NodeListParams, NodeListParamsSchema, NodePendingAckParamsSchema, type NodePairApproveParams, NodePairApproveParamsSchema, type NodePairListParams, NodePairListParamsSchema, type NodePairRejectParams, NodePairRejectParamsSchema, type NodePairRequestParams, NodePairRequestParamsSchema, type NodePairVerifyParams, NodePairVerifyParamsSchema, type PollParams, PollParamsSchema, PROTOCOL_VERSION, PushTestParamsSchema, PushTestResultSchema, type PresenceEntry, PresenceEntrySchema, ProtocolSchemas, type RequestFrame, RequestFrameSchema, type ResponseFrame, ResponseFrameSchema, SendParamsSchema, SessionsAbortParamsSchema, type SessionsCompactParams, SessionsCompactParamsSchema, SessionsCompactionBranchParamsSchema, SessionsCompactionGetParamsSchema, SessionsCompactionListParamsSchema, SessionsCompactionRestoreParamsSchema, SessionsCreateParamsSchema, type SessionsDeleteParams, SessionsDeleteParamsSchema, type SessionsListParams, SessionsListParamsSchema, type SessionsPatchParams, SessionsPatchParamsSchema, type SessionsPreviewParams, SessionsPreviewParamsSchema, type SessionsResetParams, SessionsResetParamsSchema, type SessionsResolveParams, SessionsResolveParamsSchema, SessionsSendParamsSchema, type SessionsUsageParams, SessionsUsageParamsSchema, type ShutdownEvent, ShutdownEventSchema, type SkillsBinsParams, type SkillsBinsResult, type SkillsDetailParams, SkillsDetailParamsSchema, type SkillsDetailResult, SkillsDetailResultSchema, type SkillsInstallParams, SkillsInstallParamsSchema, type SkillsSearchParams, SkillsSearchParamsSchema, type SkillsSearchResult, SkillsSearchResultSchema, type SkillsStatusParams, SkillsStatusParamsSchema, type SkillsUpdateParams, SkillsUpdateParamsSchema, type ToolsCatalogParams, ToolsCatalogParamsSchema, type ToolsCatalogResult, type ToolsEffectiveParams, ToolsEffectiveParamsSchema, type ToolsEffectiveResult, type Snapshot, SnapshotSchema, type StateVersion, StateVersionSchema, type TalkModeParams, type TickEvent, TickEventSchema, type UpdateRunParams, UpdateRunParamsSchema, type WakeParams, WakeParamsSchema, type WebLoginStartParams, WebLoginStartParamsSchema, type WebLoginWaitParams, WebLoginWaitParamsSchema, type WizardCancelParams, WizardCancelParamsSchema, type WizardNextParams, WizardNextParamsSchema, type WizardNextResult, WizardNextResultSchema, type WizardStartParams, WizardStartParamsSchema, type WizardStartResult, WizardStartResultSchema, type WizardStatusParams, WizardStatusParamsSchema, type WizardStatusResult, WizardStatusResultSchema, type WizardStep, WizardStepSchema } from "./schema.js";
export declare const validateCommandsListParams: AjvPkg.ValidateFunction<{
    provider?: string | undefined;
    scope?: "text" | "both" | "native" | undefined;
    agentId?: string | undefined;
    includeArgs?: boolean | undefined;
}>;
export declare const validateConnectParams: AjvPkg.ValidateFunction<{
    commands?: string[] | undefined;
    auth?: {
        token?: string | undefined;
        password?: string | undefined;
        bootstrapToken?: string | undefined;
        deviceToken?: string | undefined;
    } | undefined;
    role?: string | undefined;
    permissions?: {
        [x: string]: boolean;
    } | undefined;
    scopes?: string[] | undefined;
    caps?: string[] | undefined;
    pathEnv?: string | undefined;
    device?: {
        id: string;
        publicKey: string;
        signature: string;
        signedAt: number;
        nonce: string;
    } | undefined;
    locale?: string | undefined;
    userAgent?: string | undefined;
    minProtocol: number;
    maxProtocol: number;
    client: {
        displayName?: string | undefined;
        deviceFamily?: string | undefined;
        modelIdentifier?: string | undefined;
        instanceId?: string | undefined;
        id: "cli" | "webchat" | "test" | "webchat-ui" | "openclaw-control-ui" | "openclaw-tui" | "gateway-client" | "openclaw-macos" | "openclaw-ios" | "openclaw-android" | "node-host" | "fingerprint" | "openclaw-probe";
        mode: "cli" | "node" | "webchat" | "test" | "ui" | "backend" | "probe";
        version: string;
        platform: string;
    };
}>;
export declare const validateRequestFrame: AjvPkg.ValidateFunction<{
    params?: unknown;
    id: string;
    type: "req";
    method: string;
}>;
export declare const validateResponseFrame: AjvPkg.ValidateFunction<{
    error?: {
        details?: unknown;
        retryable?: boolean | undefined;
        retryAfterMs?: number | undefined;
        message: string;
        code: string;
    } | undefined;
    payload?: unknown;
    id: string;
    type: "res";
    ok: boolean;
}>;
export declare const validateEventFrame: AjvPkg.ValidateFunction<{
    payload?: unknown;
    seq?: number | undefined;
    stateVersion?: {
        health: number;
        presence: number;
    } | undefined;
    type: "event";
    event: string;
}>;
export declare const validateMessageActionParams: AjvPkg.ValidateFunction<{
    sessionId?: string | undefined;
    agentId?: string | undefined;
    sessionKey?: string | undefined;
    accountId?: string | undefined;
    requesterSenderId?: string | undefined;
    senderIsOwner?: boolean | undefined;
    toolContext?: {
        hasRepliedRef?: {
            value: boolean;
        } | undefined;
        currentChannelId?: string | undefined;
        currentThreadTs?: string | undefined;
        currentGraphChannelId?: string | undefined;
        currentChannelProvider?: string | undefined;
        currentMessageId?: string | number | undefined;
        replyToMode?: "off" | "all" | "first" | "batched" | undefined;
        skipCrossContextDecoration?: boolean | undefined;
    } | undefined;
    channel: string;
    action: string;
    params: {
        [x: string]: unknown;
    };
    idempotencyKey: string;
}>;
export declare const validateSendParams: AjvPkg.ValidateFunction<{
    to: any;
    idempotencyKey: any;
} & {
    to: any;
} & {
    idempotencyKey: any;
}>;
export declare const validatePollParams: AjvPkg.ValidateFunction<{
    channel?: string | undefined;
    silent?: boolean | undefined;
    threadId?: string | undefined;
    accountId?: string | undefined;
    durationSeconds?: number | undefined;
    maxSelections?: number | undefined;
    durationHours?: number | undefined;
    isAnonymous?: boolean | undefined;
    options: string[];
    to: string;
    idempotencyKey: string;
    question: string;
}>;
export declare const validateAgentParams: AjvPkg.ValidateFunction<{
    message: any;
    idempotencyKey: any;
} & {
    message: any;
} & {
    idempotencyKey: any;
}>;
export declare const validateAgentIdentityParams: AjvPkg.ValidateFunction<{
    agentId?: string | undefined;
    sessionKey?: string | undefined;
}>;
export declare const validateAgentWaitParams: AjvPkg.ValidateFunction<{
    timeoutMs?: number | undefined;
    runId: string;
}>;
export declare const validateWakeParams: AjvPkg.ValidateFunction<{
    text: string;
    mode: "now" | "next-heartbeat";
}>;
export declare const validateAgentsListParams: AjvPkg.ValidateFunction<{}>;
export declare const validateAgentsCreateParams: AjvPkg.ValidateFunction<{
    emoji?: string | undefined;
    avatar?: string | undefined;
    model?: string | undefined;
    name: string;
    workspace: string;
}>;
export declare const validateAgentsUpdateParams: AjvPkg.ValidateFunction<{
    name?: string | undefined;
    workspace?: string | undefined;
    emoji?: string | undefined;
    avatar?: string | undefined;
    model?: string | undefined;
    agentId: string;
}>;
export declare const validateAgentsDeleteParams: AjvPkg.ValidateFunction<{
    deleteFiles?: boolean | undefined;
    agentId: string;
}>;
export declare const validateAgentsFilesListParams: AjvPkg.ValidateFunction<{
    agentId: string;
}>;
export declare const validateAgentsFilesGetParams: AjvPkg.ValidateFunction<{
    name: string;
    agentId: string;
}>;
export declare const validateAgentsFilesSetParams: AjvPkg.ValidateFunction<{
    name: string;
    agentId: string;
    content: string;
}>;
export declare const validateNodePairRequestParams: AjvPkg.ValidateFunction<{
    silent?: boolean | undefined;
    version?: string | undefined;
    commands?: string[] | undefined;
    displayName?: string | undefined;
    platform?: string | undefined;
    deviceFamily?: string | undefined;
    remoteIp?: string | undefined;
    modelIdentifier?: string | undefined;
    caps?: string[] | undefined;
    coreVersion?: string | undefined;
    uiVersion?: string | undefined;
    nodeId: string;
}>;
export declare const validateNodePairListParams: AjvPkg.ValidateFunction<{}>;
export declare const validateNodePairApproveParams: AjvPkg.ValidateFunction<{
    requestId: string;
}>;
export declare const validateNodePairRejectParams: AjvPkg.ValidateFunction<{
    requestId: string;
}>;
export declare const validateNodePairVerifyParams: AjvPkg.ValidateFunction<{
    token: string;
    nodeId: string;
}>;
export declare const validateNodeRenameParams: AjvPkg.ValidateFunction<{
    displayName: string;
    nodeId: string;
}>;
export declare const validateNodeListParams: AjvPkg.ValidateFunction<{}>;
export declare const validateNodePendingAckParams: AjvPkg.ValidateFunction<{
    ids: string[];
}>;
export declare const validateNodeDescribeParams: AjvPkg.ValidateFunction<{
    nodeId: string;
}>;
export declare const validateNodeInvokeParams: AjvPkg.ValidateFunction<{
    params?: unknown;
    timeoutMs?: number | undefined;
    command: string;
    idempotencyKey: string;
    nodeId: string;
}>;
export declare const validateNodeInvokeResultParams: AjvPkg.ValidateFunction<{
    error?: {
        message?: string | undefined;
        code?: string | undefined;
    } | undefined;
    payload?: unknown;
    payloadJSON?: string | undefined;
    id: string;
    ok: boolean;
    nodeId: string;
}>;
export declare const validateNodeEventParams: AjvPkg.ValidateFunction<{
    payload?: unknown;
    payloadJSON?: string | undefined;
    event: string;
}>;
export declare const validateNodePendingDrainParams: AjvPkg.ValidateFunction<{
    maxItems?: number | undefined;
}>;
export declare const validateNodePendingEnqueueParams: AjvPkg.ValidateFunction<{
    wake?: boolean | undefined;
    priority?: string | undefined;
    expiresInMs?: number | undefined;
    type: string;
    nodeId: string;
}>;
export declare const validatePushTestParams: AjvPkg.ValidateFunction<{
    title?: string | undefined;
    body?: string | undefined;
    environment?: string | undefined;
    nodeId: string;
}>;
export declare const validateSecretsResolveParams: AjvPkg.ValidateFunction<{
    commandName: string;
    targetIds: string[];
}>;
export declare const validateSecretsResolveResult: AjvPkg.ValidateFunction<{
    ok?: boolean | undefined;
    diagnostics?: string[] | undefined;
    assignments?: {
        path?: string | undefined;
        value: unknown;
        pathSegments: string[];
    }[] | undefined;
    inactiveRefPaths?: string[] | undefined;
}>;
export declare const validateSessionsListParams: AjvPkg.ValidateFunction<{
    search?: string | undefined;
    label?: string | undefined;
    spawnedBy?: string | undefined;
    agentId?: string | undefined;
    limit?: number | undefined;
    activeMinutes?: number | undefined;
    includeGlobal?: boolean | undefined;
    includeUnknown?: boolean | undefined;
    includeDerivedTitles?: boolean | undefined;
    includeLastMessage?: boolean | undefined;
}>;
export declare const validateSessionsPreviewParams: AjvPkg.ValidateFunction<{
    maxChars?: number | undefined;
    limit?: number | undefined;
    keys: string[];
}>;
export declare const validateSessionsResolveParams: AjvPkg.ValidateFunction<{
    key?: string | undefined;
    label?: string | undefined;
    sessionId?: string | undefined;
    spawnedBy?: string | undefined;
    agentId?: string | undefined;
    includeGlobal?: boolean | undefined;
    includeUnknown?: boolean | undefined;
}>;
export declare const validateSessionsCreateParams: AjvPkg.ValidateFunction<{
    message?: string | undefined;
    key?: string | undefined;
    label?: string | undefined;
    model?: string | undefined;
    parentSessionKey?: string | undefined;
    agentId?: string | undefined;
    task?: string | undefined;
}>;
export declare const validateSessionsSendParams: AjvPkg.ValidateFunction<{
    thinking?: string | undefined;
    timeoutMs?: number | undefined;
    attachments?: unknown[] | undefined;
    idempotencyKey?: string | undefined;
    message: string;
    key: string;
}>;
export declare const validateSessionsMessagesSubscribeParams: AjvPkg.ValidateFunction<{
    key: string;
}>;
export declare const validateSessionsMessagesUnsubscribeParams: AjvPkg.ValidateFunction<{
    key: string;
}>;
export declare const validateSessionsAbortParams: AjvPkg.ValidateFunction<{
    runId?: string | undefined;
    key: string;
}>;
export declare const validateSessionsPatchParams: AjvPkg.ValidateFunction<{
    label?: string | null | undefined;
    model?: string | null | undefined;
    spawnedBy?: string | null | undefined;
    spawnedWorkspaceDir?: string | null | undefined;
    spawnDepth?: number | null | undefined;
    subagentRole?: "orchestrator" | "leaf" | null | undefined;
    subagentControlScope?: "none" | "children" | null | undefined;
    thinkingLevel?: string | null | undefined;
    fastMode?: boolean | null | undefined;
    verboseLevel?: string | null | undefined;
    traceLevel?: string | null | undefined;
    reasoningLevel?: string | null | undefined;
    elevatedLevel?: string | null | undefined;
    execHost?: string | null | undefined;
    execSecurity?: string | null | undefined;
    execAsk?: string | null | undefined;
    execNode?: string | null | undefined;
    responseUsage?: "off" | "on" | "full" | "tokens" | null | undefined;
    groupActivation?: "always" | "mention" | null | undefined;
    sendPolicy?: "allow" | "deny" | null | undefined;
    key: string;
}>;
export declare const validateSessionsResetParams: AjvPkg.ValidateFunction<{
    reason?: "new" | "reset" | undefined;
    key: string;
}>;
export declare const validateSessionsDeleteParams: AjvPkg.ValidateFunction<{
    deleteTranscript?: boolean | undefined;
    emitLifecycleHooks?: boolean | undefined;
    key: string;
}>;
export declare const validateSessionsCompactParams: AjvPkg.ValidateFunction<{
    maxLines?: number | undefined;
    key: string;
}>;
export declare const validateSessionsCompactionListParams: AjvPkg.ValidateFunction<{
    key: string;
}>;
export declare const validateSessionsCompactionGetParams: AjvPkg.ValidateFunction<{
    key: string;
    checkpointId: string;
}>;
export declare const validateSessionsCompactionBranchParams: AjvPkg.ValidateFunction<{
    key: string;
    checkpointId: string;
}>;
export declare const validateSessionsCompactionRestoreParams: AjvPkg.ValidateFunction<{
    key: string;
    checkpointId: string;
}>;
export declare const validateSessionsUsageParams: AjvPkg.ValidateFunction<{
    mode?: "gateway" | "utc" | "specific" | undefined;
    key?: string | undefined;
    limit?: number | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    utcOffset?: string | undefined;
    includeContextWeight?: boolean | undefined;
}>;
export declare const validateConfigGetParams: AjvPkg.ValidateFunction<{}>;
export declare const validateConfigSetParams: AjvPkg.ValidateFunction<{
    baseHash?: string | undefined;
    raw: string;
}>;
export declare const validateConfigApplyParams: AjvPkg.ValidateFunction<{
    deliveryContext?: {
        channel?: string | undefined;
        threadId?: string | number | undefined;
        accountId?: string | undefined;
        to?: string | undefined;
    } | undefined;
    sessionKey?: string | undefined;
    baseHash?: string | undefined;
    note?: string | undefined;
    restartDelayMs?: number | undefined;
    raw: string;
}>;
export declare const validateConfigPatchParams: AjvPkg.ValidateFunction<{
    deliveryContext?: {
        channel?: string | undefined;
        threadId?: string | number | undefined;
        accountId?: string | undefined;
        to?: string | undefined;
    } | undefined;
    sessionKey?: string | undefined;
    baseHash?: string | undefined;
    note?: string | undefined;
    restartDelayMs?: number | undefined;
    raw: string;
}>;
export declare const validateConfigSchemaParams: AjvPkg.ValidateFunction<{}>;
export declare const validateConfigSchemaLookupParams: AjvPkg.ValidateFunction<{
    path: string;
}>;
export declare const validateConfigSchemaLookupResult: AjvPkg.ValidateFunction<{
    hint?: {
        group?: string | undefined;
        label?: string | undefined;
        sensitive?: boolean | undefined;
        order?: number | undefined;
        placeholder?: string | undefined;
        help?: string | undefined;
        advanced?: boolean | undefined;
        tags?: string[] | undefined;
        itemTemplate?: unknown;
    } | undefined;
    hintPath?: string | undefined;
    path: string;
    schema: unknown;
    children: {
        type?: string | string[] | undefined;
        hint?: {
            group?: string | undefined;
            label?: string | undefined;
            sensitive?: boolean | undefined;
            order?: number | undefined;
            placeholder?: string | undefined;
            help?: string | undefined;
            advanced?: boolean | undefined;
            tags?: string[] | undefined;
            itemTemplate?: unknown;
        } | undefined;
        hintPath?: string | undefined;
        path: string;
        key: string;
        required: boolean;
        hasChildren: boolean;
    }[];
}>;
export declare const validateWizardStartParams: AjvPkg.ValidateFunction<{
    mode?: "local" | "remote" | undefined;
    workspace?: string | undefined;
}>;
export declare const validateWizardNextParams: AjvPkg.ValidateFunction<{
    answer?: {
        value?: unknown;
        stepId: string;
    } | undefined;
    sessionId: string;
}>;
export declare const validateWizardCancelParams: AjvPkg.ValidateFunction<{
    sessionId: string;
}>;
export declare const validateWizardStatusParams: AjvPkg.ValidateFunction<{
    sessionId: string;
}>;
export declare const validateTalkModeParams: AjvPkg.ValidateFunction<{
    phase?: string | undefined;
    enabled: boolean;
}>;
export declare const validateTalkConfigParams: AjvPkg.ValidateFunction<{
    includeSecrets?: boolean | undefined;
}>;
export declare const validateTalkConfigResult: AjvPkg.ValidateFunction<{
    config: {
        session?: {
            mainKey?: string | undefined;
        } | undefined;
        ui?: {
            seamColor?: string | undefined;
        } | undefined;
        talk?: {
            provider?: string | undefined;
            providers?: {
                [x: string]: {
                    apiKey?: string | {
                        source: "env";
                        provider: string;
                        id: string;
                    } | {
                        source: "file";
                        provider: string;
                        id: string;
                    } | {
                        source: "exec";
                        provider: string;
                        id: string;
                    } | undefined;
                };
            } | undefined;
            interruptOnSpeech?: boolean | undefined;
            silenceTimeoutMs?: number | undefined;
            resolved: {
                provider: string;
                config: {
                    apiKey?: string | {
                        source: "env";
                        provider: string;
                        id: string;
                    } | {
                        source: "file";
                        provider: string;
                        id: string;
                    } | {
                        source: "exec";
                        provider: string;
                        id: string;
                    } | undefined;
                };
            };
        } | undefined;
    };
}>;
export declare const validateTalkSpeakParams: AjvPkg.ValidateFunction<{
    style?: number | undefined;
    normalize?: string | undefined;
    language?: string | undefined;
    modelId?: string | undefined;
    voiceId?: string | undefined;
    outputFormat?: string | undefined;
    speed?: number | undefined;
    rateWpm?: number | undefined;
    stability?: number | undefined;
    similarity?: number | undefined;
    speakerBoost?: boolean | undefined;
    seed?: number | undefined;
    latencyTier?: number | undefined;
    text: string;
}>;
export declare const validateTalkSpeakResult: AjvPkg.ValidateFunction<{
    mimeType?: string | undefined;
    outputFormat?: string | undefined;
    voiceCompatible?: boolean | undefined;
    fileExtension?: string | undefined;
    provider: string;
    audioBase64: string;
}>;
export declare const validateChannelsStatusParams: AjvPkg.ValidateFunction<{
    timeoutMs?: number | undefined;
    probe?: boolean | undefined;
}>;
export declare const validateChannelsLogoutParams: AjvPkg.ValidateFunction<{
    accountId?: string | undefined;
    channel: string;
}>;
export declare const validateModelsListParams: AjvPkg.ValidateFunction<{}>;
export declare const validateSkillsStatusParams: AjvPkg.ValidateFunction<{
    agentId?: string | undefined;
}>;
export declare const validateToolsCatalogParams: AjvPkg.ValidateFunction<{
    agentId?: string | undefined;
    includePlugins?: boolean | undefined;
}>;
export declare const validateToolsEffectiveParams: AjvPkg.ValidateFunction<{
    agentId?: string | undefined;
    sessionKey: string;
}>;
export declare const validateSkillsBinsParams: AjvPkg.ValidateFunction<{}>;
export declare const validateSkillsInstallParams: AjvPkg.ValidateFunction<{
    timeoutMs?: number | undefined;
    dangerouslyForceUnsafeInstall?: boolean | undefined;
    name: string;
    installId: string;
} | {
    force?: boolean | undefined;
    version?: string | undefined;
    timeoutMs?: number | undefined;
    source: "clawhub";
    slug: string;
}>;
export declare const validateSkillsUpdateParams: AjvPkg.ValidateFunction<{
    env?: {
        [x: string]: string;
    } | undefined;
    enabled?: boolean | undefined;
    apiKey?: string | undefined;
    skillKey: string;
} | {
    all?: boolean | undefined;
    slug?: string | undefined;
    source: "clawhub";
}>;
export declare const validateSkillsSearchParams: AjvPkg.ValidateFunction<{
    query?: string | undefined;
    limit?: number | undefined;
}>;
export declare const validateSkillsDetailParams: AjvPkg.ValidateFunction<{
    slug: string;
}>;
export declare const validateCronListParams: AjvPkg.ValidateFunction<{
    query?: string | undefined;
    enabled?: "all" | "disabled" | "enabled" | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
    includeDisabled?: boolean | undefined;
    sortBy?: "name" | "updatedAtMs" | "nextRunAtMs" | undefined;
    sortDir?: "asc" | "desc" | undefined;
}>;
export declare const validateCronStatusParams: AjvPkg.ValidateFunction<{}>;
export declare const validateCronAddParams: AjvPkg.ValidateFunction<{
    enabled?: boolean | undefined;
    description?: string | undefined;
    agentId?: string | null | undefined;
    sessionKey?: string | null | undefined;
    deleteAfterRun?: boolean | undefined;
    delivery?: {
        channel?: string | undefined;
        accountId?: string | undefined;
        to?: string | undefined;
        bestEffort?: boolean | undefined;
        failureDestination?: {
            channel?: string | undefined;
            mode?: "announce" | "webhook" | undefined;
            accountId?: string | undefined;
            to?: string | undefined;
        } | undefined;
        mode: "none";
    } | {
        channel?: string | undefined;
        accountId?: string | undefined;
        to?: string | undefined;
        bestEffort?: boolean | undefined;
        failureDestination?: {
            channel?: string | undefined;
            mode?: "announce" | "webhook" | undefined;
            accountId?: string | undefined;
            to?: string | undefined;
        } | undefined;
        mode: "announce";
    } | {
        channel?: string | undefined;
        accountId?: string | undefined;
        bestEffort?: boolean | undefined;
        failureDestination?: {
            channel?: string | undefined;
            mode?: "announce" | "webhook" | undefined;
            accountId?: string | undefined;
            to?: string | undefined;
        } | undefined;
        mode: "webhook";
        to: string;
    } | undefined;
    failureAlert?: false | {
        channel?: string | undefined;
        mode?: "announce" | "webhook" | undefined;
        accountId?: string | undefined;
        to?: string | undefined;
        after?: number | undefined;
        cooldownMs?: number | undefined;
    } | undefined;
    name: string;
    payload: {
        text: string;
        kind: "systemEvent";
    } | {
        thinking?: string | undefined;
        timeoutSeconds?: number | undefined;
        model?: string | undefined;
        fallbacks?: string[] | undefined;
        allowUnsafeExternalContent?: boolean | undefined;
        lightContext?: boolean | undefined;
        toolsAllow?: unknown;
        message: unknown;
        kind: "agentTurn";
    };
    schedule: {
        at: string;
        kind: "at";
    } | {
        anchorMs?: number | undefined;
        kind: "every";
        everyMs: number;
    } | {
        tz?: string | undefined;
        staggerMs?: number | undefined;
        kind: "cron";
        expr: string;
    };
    sessionTarget: string;
    wakeMode: "now" | "next-heartbeat";
}>;
export declare const validateCronUpdateParams: AjvPkg.ValidateFunction<{
    id: string;
} | {
    jobId: string;
}>;
export declare const validateCronRemoveParams: AjvPkg.ValidateFunction<{
    id: string;
} | {
    jobId: string;
}>;
export declare const validateCronRunParams: AjvPkg.ValidateFunction<{
    id: string;
} | {
    jobId: string;
}>;
export declare const validateCronRunsParams: AjvPkg.ValidateFunction<{
    status?: "error" | "all" | "ok" | "skipped" | undefined;
    id?: string | undefined;
    query?: string | undefined;
    scope?: "all" | "job" | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
    jobId?: string | undefined;
    sortDir?: "asc" | "desc" | undefined;
    statuses?: ("error" | "ok" | "skipped")[] | undefined;
    deliveryStatuses?: ("unknown" | "delivered" | "not-delivered" | "not-requested")[] | undefined;
    deliveryStatus?: "unknown" | "delivered" | "not-delivered" | "not-requested" | undefined;
}>;
export declare const validateDevicePairListParams: AjvPkg.ValidateFunction<{}>;
export declare const validateDevicePairApproveParams: AjvPkg.ValidateFunction<{
    requestId: string;
}>;
export declare const validateDevicePairRejectParams: AjvPkg.ValidateFunction<{
    requestId: string;
}>;
export declare const validateDevicePairRemoveParams: AjvPkg.ValidateFunction<{
    deviceId: string;
}>;
export declare const validateDeviceTokenRotateParams: AjvPkg.ValidateFunction<{
    scopes?: string[] | undefined;
    role: string;
    deviceId: string;
}>;
export declare const validateDeviceTokenRevokeParams: AjvPkg.ValidateFunction<{
    role: string;
    deviceId: string;
}>;
export declare const validateExecApprovalsGetParams: AjvPkg.ValidateFunction<{}>;
export declare const validateExecApprovalsSetParams: AjvPkg.ValidateFunction<{
    baseHash?: string | undefined;
    file: {
        defaults?: {
            ask?: string | undefined;
            security?: string | undefined;
            askFallback?: string | undefined;
            autoAllowSkills?: boolean | undefined;
        } | undefined;
        agents?: {
            [x: string]: {
                allowlist?: {
                    id?: string | undefined;
                    argPattern?: string | undefined;
                    lastUsedAt?: number | undefined;
                    lastUsedCommand?: string | undefined;
                    lastResolvedPath?: string | undefined;
                    pattern: string;
                }[] | undefined;
                ask?: string | undefined;
                security?: string | undefined;
                askFallback?: string | undefined;
                autoAllowSkills?: boolean | undefined;
            };
        } | undefined;
        socket?: {
            path?: string | undefined;
            token?: string | undefined;
        } | undefined;
        version: 1;
    };
}>;
export declare const validateExecApprovalGetParams: AjvPkg.ValidateFunction<{
    id: string;
}>;
export declare const validateExecApprovalRequestParams: AjvPkg.ValidateFunction<{
    env?: {
        [x: string]: string;
    } | undefined;
    id?: string | undefined;
    command?: string | undefined;
    cwd?: string | null | undefined;
    resolvedPath?: string | null | undefined;
    ask?: string | null | undefined;
    timeoutMs?: number | undefined;
    agentId?: string | null | undefined;
    sessionKey?: string | null | undefined;
    host?: string | null | undefined;
    security?: string | null | undefined;
    nodeId?: string | null | undefined;
    commandArgv?: string[] | undefined;
    systemRunPlan?: {
        commandPreview?: string | null | undefined;
        mutableFileOperand?: {
            path: string;
            sha256: string;
            argvIndex: number;
        } | null | undefined;
        argv: string[];
        cwd: string | null;
        agentId: string | null;
        sessionKey: string | null;
        commandText: string;
    } | undefined;
    turnSourceChannel?: string | null | undefined;
    turnSourceTo?: string | null | undefined;
    turnSourceAccountId?: string | null | undefined;
    turnSourceThreadId?: string | number | null | undefined;
    twoPhase?: boolean | undefined;
}>;
export declare const validateExecApprovalResolveParams: AjvPkg.ValidateFunction<{
    id: string;
    decision: string;
}>;
export declare const validatePluginApprovalRequestParams: AjvPkg.ValidateFunction<{
    pluginId?: string | undefined;
    timeoutMs?: number | undefined;
    agentId?: string | undefined;
    sessionKey?: string | undefined;
    turnSourceChannel?: string | undefined;
    turnSourceTo?: string | undefined;
    turnSourceAccountId?: string | undefined;
    turnSourceThreadId?: string | number | undefined;
    twoPhase?: boolean | undefined;
    severity?: string | undefined;
    toolName?: string | undefined;
    toolCallId?: string | undefined;
    description: string;
    title: string;
}>;
export declare const validatePluginApprovalResolveParams: AjvPkg.ValidateFunction<{
    id: string;
    decision: string;
}>;
export declare const validateExecApprovalsNodeGetParams: AjvPkg.ValidateFunction<{
    nodeId: string;
}>;
export declare const validateExecApprovalsNodeSetParams: AjvPkg.ValidateFunction<{
    baseHash?: string | undefined;
    file: {
        defaults?: {
            ask?: string | undefined;
            security?: string | undefined;
            askFallback?: string | undefined;
            autoAllowSkills?: boolean | undefined;
        } | undefined;
        agents?: {
            [x: string]: {
                allowlist?: {
                    id?: string | undefined;
                    argPattern?: string | undefined;
                    lastUsedAt?: number | undefined;
                    lastUsedCommand?: string | undefined;
                    lastResolvedPath?: string | undefined;
                    pattern: string;
                }[] | undefined;
                ask?: string | undefined;
                security?: string | undefined;
                askFallback?: string | undefined;
                autoAllowSkills?: boolean | undefined;
            };
        } | undefined;
        socket?: {
            path?: string | undefined;
            token?: string | undefined;
        } | undefined;
        version: 1;
    };
    nodeId: string;
}>;
export declare const validateLogsTailParams: AjvPkg.ValidateFunction<{
    cursor?: number | undefined;
    maxBytes?: number | undefined;
    limit?: number | undefined;
}>;
export declare const validateChatHistoryParams: AjvPkg.ValidateFunction<{
    sessionKey: any;
}>;
export declare const validateChatSendParams: AjvPkg.ValidateFunction<{
    message: any;
    sessionKey: any;
    idempotencyKey: any;
} & {
    message: any;
} & {
    sessionKey: any;
} & {
    idempotencyKey: any;
}>;
export declare const validateChatAbortParams: AjvPkg.ValidateFunction<{
    runId?: string | undefined;
    sessionKey: string;
}>;
export declare const validateChatInjectParams: AjvPkg.ValidateFunction<{
    label?: string | undefined;
    message: string;
    sessionKey: string;
}>;
export declare const validateChatEvent: AjvPkg.ValidateFunction<{
    runId: any;
    sessionKey: any;
    seq: any;
    state: any;
} & {
    runId: any;
} & {
    sessionKey: any;
} & {
    seq: any;
} & {
    state: any;
}>;
export declare const validateUpdateRunParams: AjvPkg.ValidateFunction<{
    timeoutMs?: number | undefined;
    deliveryContext?: {
        channel?: string | undefined;
        threadId?: string | number | undefined;
        accountId?: string | undefined;
        to?: string | undefined;
    } | undefined;
    sessionKey?: string | undefined;
    note?: string | undefined;
    restartDelayMs?: number | undefined;
}>;
export declare const validateWebLoginStartParams: AjvPkg.ValidateFunction<{
    force?: boolean | undefined;
    timeoutMs?: number | undefined;
    verbose?: boolean | undefined;
    accountId?: string | undefined;
}>;
export declare const validateWebLoginWaitParams: AjvPkg.ValidateFunction<{
    timeoutMs?: number | undefined;
    accountId?: string | undefined;
}>;
export declare function formatValidationErrors(errors: ErrorObject[] | null | undefined): string;
export { ConnectParamsSchema, HelloOkSchema, RequestFrameSchema, ResponseFrameSchema, EventFrameSchema, GatewayFrameSchema, PresenceEntrySchema, SnapshotSchema, ErrorShapeSchema, StateVersionSchema, AgentEventSchema, MessageActionParamsSchema, ChatEventSchema, SendParamsSchema, PollParamsSchema, AgentParamsSchema, AgentIdentityParamsSchema, AgentIdentityResultSchema, WakeParamsSchema, PushTestParamsSchema, PushTestResultSchema, NodePairRequestParamsSchema, NodePairListParamsSchema, NodePairApproveParamsSchema, NodePairRejectParamsSchema, NodePairVerifyParamsSchema, NodeListParamsSchema, NodePendingAckParamsSchema, NodeInvokeParamsSchema, NodePendingDrainParamsSchema, NodePendingDrainResultSchema, NodePendingEnqueueParamsSchema, NodePendingEnqueueResultSchema, SessionsListParamsSchema, SessionsPreviewParamsSchema, SessionsResolveParamsSchema, SessionsCompactionListParamsSchema, SessionsCompactionGetParamsSchema, SessionsCompactionBranchParamsSchema, SessionsCompactionRestoreParamsSchema, SessionsCreateParamsSchema, SessionsSendParamsSchema, SessionsAbortParamsSchema, SessionsPatchParamsSchema, SessionsResetParamsSchema, SessionsDeleteParamsSchema, SessionsCompactParamsSchema, SessionsUsageParamsSchema, ConfigGetParamsSchema, ConfigSetParamsSchema, ConfigApplyParamsSchema, ConfigPatchParamsSchema, ConfigSchemaParamsSchema, ConfigSchemaLookupParamsSchema, ConfigSchemaResponseSchema, ConfigSchemaLookupResultSchema, WizardStartParamsSchema, WizardNextParamsSchema, WizardCancelParamsSchema, WizardStatusParamsSchema, WizardStepSchema, WizardNextResultSchema, WizardStartResultSchema, WizardStatusResultSchema, TalkConfigParamsSchema, TalkConfigResultSchema, TalkSpeakParamsSchema, TalkSpeakResultSchema, ChannelsStatusParamsSchema, ChannelsStatusResultSchema, ChannelsLogoutParamsSchema, WebLoginStartParamsSchema, WebLoginWaitParamsSchema, AgentSummarySchema, AgentsFileEntrySchema, AgentsCreateParamsSchema, AgentsCreateResultSchema, AgentsUpdateParamsSchema, AgentsUpdateResultSchema, AgentsDeleteParamsSchema, AgentsDeleteResultSchema, AgentsFilesListParamsSchema, AgentsFilesListResultSchema, AgentsFilesGetParamsSchema, AgentsFilesGetResultSchema, AgentsFilesSetParamsSchema, AgentsFilesSetResultSchema, AgentsListParamsSchema, AgentsListResultSchema, CommandsListParamsSchema, CommandsListResultSchema, ModelsListParamsSchema, SkillsStatusParamsSchema, ToolsCatalogParamsSchema, ToolsEffectiveParamsSchema, SkillsInstallParamsSchema, SkillsSearchParamsSchema, SkillsSearchResultSchema, SkillsDetailParamsSchema, SkillsDetailResultSchema, SkillsUpdateParamsSchema, CronJobSchema, CronListParamsSchema, CronStatusParamsSchema, CronAddParamsSchema, CronUpdateParamsSchema, CronRemoveParamsSchema, CronRunParamsSchema, CronRunsParamsSchema, LogsTailParamsSchema, LogsTailResultSchema, ExecApprovalsGetParamsSchema, ExecApprovalsSetParamsSchema, ExecApprovalGetParamsSchema, ExecApprovalRequestParamsSchema, ExecApprovalResolveParamsSchema, ChatHistoryParamsSchema, ChatSendParamsSchema, ChatInjectParamsSchema, UpdateRunParamsSchema, TickEventSchema, ShutdownEventSchema, ProtocolSchemas, PROTOCOL_VERSION, ErrorCodes, errorShape, };
export type { GatewayFrame, ConnectParams, HelloOk, RequestFrame, ResponseFrame, EventFrame, PresenceEntry, Snapshot, ErrorShape, StateVersion, AgentEvent, AgentIdentityParams, AgentIdentityResult, AgentWaitParams, ChatEvent, TickEvent, ShutdownEvent, WakeParams, NodePairRequestParams, NodePairListParams, NodePairApproveParams, DevicePairListParams, DevicePairApproveParams, DevicePairRejectParams, ConfigGetParams, ConfigSetParams, ConfigApplyParams, ConfigPatchParams, ConfigSchemaParams, ConfigSchemaResponse, WizardStartParams, WizardNextParams, WizardCancelParams, WizardStatusParams, WizardStep, WizardNextResult, WizardStartResult, WizardStatusResult, TalkConfigParams, TalkConfigResult, TalkSpeakParams, TalkSpeakResult, TalkModeParams, ChannelsStatusParams, ChannelsStatusResult, ChannelsLogoutParams, WebLoginStartParams, WebLoginWaitParams, AgentSummary, AgentsFileEntry, AgentsCreateParams, AgentsCreateResult, AgentsUpdateParams, AgentsUpdateResult, AgentsDeleteParams, AgentsDeleteResult, AgentsFilesListParams, AgentsFilesListResult, AgentsFilesGetParams, AgentsFilesGetResult, AgentsFilesSetParams, AgentsFilesSetResult, AgentsListParams, AgentsListResult, CommandsListParams, CommandsListResult, CommandEntry, SkillsStatusParams, ToolsCatalogParams, ToolsCatalogResult, ToolsEffectiveParams, ToolsEffectiveResult, SkillsBinsParams, SkillsBinsResult, SkillsSearchParams, SkillsSearchResult, SkillsDetailParams, SkillsDetailResult, SkillsInstallParams, SkillsUpdateParams, NodePairRejectParams, NodePairVerifyParams, NodeListParams, NodeInvokeParams, NodeInvokeResultParams, NodeEventParams, NodePendingDrainParams, NodePendingDrainResult, NodePendingEnqueueParams, NodePendingEnqueueResult, SessionsListParams, SessionsPreviewParams, SessionsResolveParams, SessionsPatchParams, SessionsPatchResult, SessionsResetParams, SessionsDeleteParams, SessionsCompactParams, SessionsUsageParams, CronJob, CronListParams, CronStatusParams, CronAddParams, CronUpdateParams, CronRemoveParams, CronRunParams, CronRunsParams, CronRunLogEntry, ExecApprovalsGetParams, ExecApprovalsSetParams, ExecApprovalsSnapshot, ExecApprovalGetParams, ExecApprovalRequestParams, ExecApprovalResolveParams, LogsTailParams, LogsTailResult, PollParams, UpdateRunParams, ChatInjectParams, };
