import { getAcpSessionManager } from "../acp/control-plane/manager.js";
import type { PluginHookReplyDispatchContext, PluginHookReplyDispatchEvent, PluginHookReplyDispatchResult } from "../plugins/types.js";
export { getAcpSessionManager };
export { AcpRuntimeError, isAcpRuntimeError } from "../acp/runtime/errors.js";
export type { AcpRuntimeErrorCode } from "../acp/runtime/errors.js";
export { getAcpRuntimeBackend, registerAcpRuntimeBackend, requireAcpRuntimeBackend, unregisterAcpRuntimeBackend, } from "../acp/runtime/registry.js";
export type { AcpRuntime, AcpRuntimeCapabilities, AcpRuntimeDoctorReport, AcpRuntimeEnsureInput, AcpRuntimeEvent, AcpRuntimeHandle, AcpRuntimeStatus, AcpRuntimeTurnAttachment, AcpRuntimeTurnInput, AcpSessionUpdateTag, } from "../acp/runtime/types.js";
export { readAcpSessionEntry } from "../acp/runtime/session-meta.js";
export type { AcpSessionStoreEntry } from "../acp/runtime/session-meta.js";
export declare function tryDispatchAcpReplyHook(event: PluginHookReplyDispatchEvent, ctx: PluginHookReplyDispatchContext): Promise<PluginHookReplyDispatchResult | void>;
export declare const __testing: {
    resetAcpSessionManagerForTests(): void;
    setAcpSessionManagerForTests(manager: unknown): void;
} & {
    resetAcpRuntimeBackendsForTests(): void;
    getAcpRuntimeRegistryGlobalStateForTests(): {
        backendsById: Map<string, import("../acp/runtime/registry.js").AcpRuntimeBackend>;
    };
};
