import type { OpenClawConfig } from "../config/types.js";
import type { PluginManifestActivationCapability } from "./manifest.js";
import type { PluginOrigin } from "./plugin-origin.types.js";
export type PluginActivationPlannerTrigger = {
    kind: "command";
    command: string;
} | {
    kind: "provider";
    provider: string;
} | {
    kind: "agentHarness";
    runtime: string;
} | {
    kind: "channel";
    channel: string;
} | {
    kind: "route";
    route: string;
} | {
    kind: "capability";
    capability: PluginManifestActivationCapability;
};
export declare function resolveManifestActivationPluginIds(params: {
    trigger: PluginActivationPlannerTrigger;
    config?: OpenClawConfig;
    workspaceDir?: string;
    env?: NodeJS.ProcessEnv;
    cache?: boolean;
    origin?: PluginOrigin;
    onlyPluginIds?: readonly string[];
}): string[];
