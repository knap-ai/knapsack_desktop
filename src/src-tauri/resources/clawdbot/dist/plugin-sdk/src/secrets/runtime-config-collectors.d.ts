import type { OpenClawConfig } from "../config/config.js";
import type { PluginOrigin } from "../plugins/types.js";
import type { ResolverContext } from "./runtime-shared.js";
export declare function collectConfigAssignments(params: {
    config: OpenClawConfig;
    context: ResolverContext;
    loadablePluginOrigins?: ReadonlyMap<string, PluginOrigin>;
}): void;
