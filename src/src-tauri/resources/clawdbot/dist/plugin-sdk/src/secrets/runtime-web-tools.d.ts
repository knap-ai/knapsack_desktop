import type { OpenClawConfig } from "../config/config.js";
import { type ResolverContext } from "./runtime-shared.js";
import type { RuntimeWebDiagnostic, RuntimeWebDiagnosticCode, RuntimeWebFetchFirecrawlMetadata, RuntimeWebSearchMetadata, RuntimeWebToolsMetadata } from "./runtime-web-tools.types.js";
export type { RuntimeWebDiagnostic, RuntimeWebDiagnosticCode, RuntimeWebFetchFirecrawlMetadata, RuntimeWebSearchMetadata, RuntimeWebToolsMetadata, };
export declare function resolveRuntimeWebTools(params: {
    sourceConfig: OpenClawConfig;
    resolvedConfig: OpenClawConfig;
    context: ResolverContext;
}): Promise<RuntimeWebToolsMetadata>;
