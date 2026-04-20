import type { CliBackendConfig } from "../config/types.js";
import type { OpenClawConfig } from "../config/types.openclaw.js";
import { resolveRuntimeCliBackends } from "../plugins/cli-backends.runtime.js";
import { resolvePluginSetupCliBackend } from "../plugins/setup-registry.js";
import type { CliBundleMcpMode, CliBackendPlugin, PluginTextTransforms } from "../plugins/types.js";
type CliBackendsDeps = {
    resolvePluginSetupCliBackend: typeof resolvePluginSetupCliBackend;
    resolveRuntimeCliBackends: typeof resolveRuntimeCliBackends;
};
export type ResolvedCliBackend = {
    id: string;
    config: CliBackendConfig;
    bundleMcp: boolean;
    bundleMcpMode?: CliBundleMcpMode;
    pluginId?: string;
    transformSystemPrompt?: CliBackendPlugin["transformSystemPrompt"];
    textTransforms?: PluginTextTransforms;
};
export type ResolvedCliBackendLiveTest = {
    defaultModelRef?: string;
    defaultImageProbe: boolean;
    defaultMcpProbe: boolean;
    dockerNpmPackage?: string;
    dockerBinaryName?: string;
};
export declare function normalizeClaudeBackendConfig(config: CliBackendConfig): CliBackendConfig;
export declare function resolveCliBackendIds(cfg?: OpenClawConfig): Set<string>;
export declare function resolveCliBackendLiveTest(provider: string): ResolvedCliBackendLiveTest | null;
export declare function resolveCliBackendConfig(provider: string, cfg?: OpenClawConfig): ResolvedCliBackend | null;
export declare const __testing: {
    readonly resetDepsForTest: () => void;
    readonly setDepsForTest: (deps: Partial<CliBackendsDeps>) => void;
};
export {};
