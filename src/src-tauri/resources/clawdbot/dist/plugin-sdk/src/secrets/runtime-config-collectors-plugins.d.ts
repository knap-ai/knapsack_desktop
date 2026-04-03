import type { OpenClawConfig } from "../config/config.js";
import type { PluginOrigin } from "../plugins/types.js";
import { type ResolverContext, type SecretDefaults } from "./runtime-shared.js";
/**
 * Walk plugin config entries and collect SecretRef assignments for MCP server
 * env vars. Without this, SecretRefs in paths like
 * `plugins.entries.acpx.config.mcpServers.*.env.*` are never resolved and
 * remain as raw objects at runtime.
 *
 * This surface is intentionally scoped to ACPX. Third-party plugins may define
 * their own `mcpServers`-shaped config, but that is not a documented SecretRef
 * surface and should not be rewritten here.
 *
 * When `loadablePluginOrigins` is provided, entries whose ID is not in the map
 * are treated as inactive (stale config entries for plugins that are no longer
 * installed). This prevents resolution failures for SecretRefs belonging to
 * non-loadable plugins from blocking startup or preflight validation.
 */
export declare function collectPluginConfigAssignments(params: {
    config: OpenClawConfig;
    defaults: SecretDefaults | undefined;
    context: ResolverContext;
    loadablePluginOrigins?: ReadonlyMap<string, PluginOrigin>;
}): void;
