import { type Mock } from "vitest";
import type { MsgContext } from "../../../auto-reply/templating.js";
import type { ReplyPayload } from "../../../auto-reply/types.js";
import type { OpenClawConfig } from "../../../config/config.js";
import type { ResolveProviderRuntimeGroupPolicyParams, RuntimeGroupPolicyResolution } from "../../../config/runtime-group-policy.js";
import type { SessionBindingCapabilities, SessionBindingRecord } from "../../../infra/outbound/session-binding-service.js";
import type { ChannelAccountSnapshot, ChannelAccountState, ChannelSetupInput } from "../types.core.js";
import type { ChannelMessageActionName, ChannelMessageCapability, ChannelPlugin } from "../types.js";
type OutboundSendMock = Mock<(...args: unknown[]) => Promise<Record<string, unknown>>>;
type SlackOutboundPayloadHarness = {
    run: () => Promise<Record<string, unknown>>;
    sendMock: OutboundSendMock;
    to: string;
};
export declare function createSlackOutboundPayloadHarness(params: {
    payload: ReplyPayload;
    sendResults?: Array<{
        messageId: string;
    }>;
}): SlackOutboundPayloadHarness;
export declare function installChannelPluginContractSuite(params: {
    plugin: Pick<ChannelPlugin, "id" | "meta" | "capabilities" | "config">;
}): void;
type ChannelActionsContractCase = {
    name: string;
    cfg: OpenClawConfig;
    expectedActions: readonly ChannelMessageActionName[];
    expectedCapabilities?: readonly ChannelMessageCapability[];
    beforeTest?: () => void;
};
export declare function installChannelActionsContractSuite(params: {
    plugin: Pick<ChannelPlugin, "id" | "actions">;
    cases: readonly ChannelActionsContractCase[];
    unsupportedAction?: ChannelMessageActionName;
}): void;
export declare function installChannelSurfaceContractSuite(params: {
    plugin: Pick<ChannelPlugin, "id" | "actions" | "setup" | "status" | "outbound" | "messaging" | "threading" | "directory" | "gateway">;
    surface: "actions" | "setup" | "status" | "outbound" | "messaging" | "threading" | "directory" | "gateway";
}): void;
export declare function installChannelThreadingContractSuite(params: {
    plugin: Pick<ChannelPlugin, "id" | "threading">;
}): void;
export declare function installChannelDirectoryContractSuite(params: {
    plugin: Pick<ChannelPlugin, "id" | "directory">;
    coverage?: "lookups" | "presence";
    cfg?: OpenClawConfig;
    accountId?: string;
}): void;
export declare function installSessionBindingContractSuite(params: {
    getCapabilities: () => SessionBindingCapabilities | Promise<SessionBindingCapabilities>;
    bindAndResolve: () => Promise<SessionBindingRecord>;
    unbindAndVerify: (binding: SessionBindingRecord) => Promise<void>;
    cleanup: () => Promise<void> | void;
    expectedCapabilities: SessionBindingCapabilities;
}): void;
type ChannelSetupContractCase<ResolvedAccount> = {
    name: string;
    cfg: OpenClawConfig;
    accountId?: string;
    input: ChannelSetupInput;
    expectedAccountId?: string;
    expectedValidation?: string | null;
    beforeTest?: () => void;
    assertPatchedConfig?: (cfg: OpenClawConfig) => void;
    assertResolvedAccount?: (account: ResolvedAccount, cfg: OpenClawConfig) => void;
};
export declare function installChannelSetupContractSuite<ResolvedAccount>(params: {
    plugin: Pick<ChannelPlugin<ResolvedAccount>, "id" | "config" | "setup">;
    cases: readonly ChannelSetupContractCase<ResolvedAccount>[];
}): void;
type ChannelStatusContractCase<Probe> = {
    name: string;
    cfg: OpenClawConfig;
    accountId?: string;
    runtime?: ChannelAccountSnapshot;
    probe?: Probe;
    beforeTest?: () => void;
    expectedState?: ChannelAccountState;
    resolveStateInput?: {
        configured: boolean;
        enabled: boolean;
    };
    assertSnapshot?: (snapshot: ChannelAccountSnapshot) => void;
    assertSummary?: (summary: Record<string, unknown>) => void;
};
export declare function installChannelStatusContractSuite<ResolvedAccount, Probe = unknown>(params: {
    plugin: Pick<ChannelPlugin<ResolvedAccount, Probe>, "id" | "config" | "status">;
    cases: readonly ChannelStatusContractCase<Probe>[];
}): void;
type PayloadLike = {
    mediaUrl?: string;
    mediaUrls?: string[];
    text?: string;
};
type SendResultLike = {
    messageId: string;
    [key: string]: unknown;
};
type ChunkingMode = {
    longTextLength: number;
    maxChunkLength: number;
    mode: "split";
} | {
    longTextLength: number;
    mode: "passthrough";
};
export declare function installChannelOutboundPayloadContractSuite(params: {
    channel: string;
    chunking: ChunkingMode;
    createHarness: (params: {
        payload: PayloadLike;
        sendResults?: SendResultLike[];
    }) => {
        run: () => Promise<Record<string, unknown>>;
        sendMock: Mock;
        to: string;
    };
}): void;
export declare function primeChannelOutboundSendMock<TArgs extends unknown[]>(sendMock: Mock<(...args: TArgs) => Promise<unknown>>, fallbackResult: Record<string, unknown>, sendResults?: Record<string, unknown>[]): void;
type RuntimeGroupPolicyResolver = (params: ResolveProviderRuntimeGroupPolicyParams) => RuntimeGroupPolicyResolution;
export declare function installChannelRuntimeGroupPolicyFallbackSuite(params: {
    configuredLabel: string;
    defaultGroupPolicyUnderTest: "allowlist" | "disabled" | "open";
    missingConfigLabel: string;
    missingDefaultLabel: string;
    resolve: RuntimeGroupPolicyResolver;
}): void;
export declare function expectChannelInboundContextContract(ctx: MsgContext): void;
export {};
