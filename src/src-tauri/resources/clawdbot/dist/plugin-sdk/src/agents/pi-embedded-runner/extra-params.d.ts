import type { StreamFn } from "@mariozechner/pi-agent-core";
import type { ThinkLevel } from "../../auto-reply/thinking.js";
import type { OpenClawConfig } from "../../config/config.js";
import { prepareProviderExtraParams as prepareProviderExtraParamsRuntime, wrapProviderStreamFn as wrapProviderStreamFnRuntime } from "../../plugins/provider-runtime.js";
declare const defaultProviderRuntimeDeps: {
    prepareProviderExtraParams: typeof prepareProviderExtraParamsRuntime;
    wrapProviderStreamFn: typeof wrapProviderStreamFnRuntime;
};
export declare const __testing: {
    setProviderRuntimeDepsForTest(deps: Partial<typeof defaultProviderRuntimeDeps> | undefined): void;
    resetProviderRuntimeDepsForTest(): void;
};
/**
 * Resolve provider-specific extra params from model config.
 * Used to pass through stream params like temperature/maxTokens.
 *
 * @internal Exported for testing only
 */
export declare function resolveExtraParams(params: {
    cfg: OpenClawConfig | undefined;
    provider: string;
    modelId: string;
    agentId?: string;
}): Record<string, unknown> | undefined;
/**
 * Apply extra params (like temperature) to an agent's streamFn.
 * Also applies verified provider-specific request wrappers, such as OpenRouter attribution.
 *
 * @internal Exported for testing
 */
export declare function applyExtraParamsToAgent(agent: {
    streamFn?: StreamFn;
}, cfg: OpenClawConfig | undefined, provider: string, modelId: string, extraParamsOverride?: Record<string, unknown>, thinkingLevel?: ThinkLevel, agentId?: string, workspaceDir?: string): void;
export {};
