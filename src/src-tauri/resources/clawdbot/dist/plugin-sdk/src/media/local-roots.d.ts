import type { OpenClawConfig } from "../config/config.js";
export declare function getDefaultMediaLocalRoots(): readonly string[];
export declare function getAgentScopedMediaLocalRoots(cfg: OpenClawConfig, agentId?: string): readonly string[];
/**
 * @deprecated Kept for plugin-sdk compatibility. Media sources no longer widen allowed roots.
 */
export declare function appendLocalMediaParentRoots(roots: readonly string[], _mediaSources?: readonly string[]): string[];
export declare function getAgentScopedMediaLocalRootsForSources({ cfg, agentId, mediaSources: _mediaSources, }: {
    cfg: OpenClawConfig;
    agentId?: string;
    mediaSources?: readonly string[];
}): readonly string[];
