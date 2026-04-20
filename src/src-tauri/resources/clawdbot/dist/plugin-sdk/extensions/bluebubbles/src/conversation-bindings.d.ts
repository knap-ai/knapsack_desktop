import type { OpenClawConfig } from "openclaw/plugin-sdk/config-runtime";
import { type AccountScopedConversationBindingManager } from "openclaw/plugin-sdk/thread-bindings-runtime";
type BlueBubblesBindingTargetKind = "subagent" | "acp";
type BlueBubblesConversationBindingManager = AccountScopedConversationBindingManager<BlueBubblesBindingTargetKind>;
export declare function createBlueBubblesConversationBindingManager(params: {
    accountId?: string;
    cfg: OpenClawConfig;
}): BlueBubblesConversationBindingManager;
export declare const __testing: {
    resetBlueBubblesConversationBindingsForTests(): void;
};
export {};
