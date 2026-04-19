import type { OpenClawConfig } from "../../config/types.openclaw.js";
import { type AnyAgentTool, type SandboxFsBridge, type ToolFsPolicy } from "./tool-runtime.helpers.js";
export declare const PdfToolSchema: import("@sinclair/typebox").TObject<{
    prompt: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    pdf: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    pdfs: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
    pages: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    model: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    maxBytesMb: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
}>;
export { resolvePdfModelConfigForTool } from "./pdf-tool.model-config.js";
type PdfSandboxConfig = {
    root: string;
    bridge: SandboxFsBridge;
};
export declare function createPdfTool(options?: {
    config?: OpenClawConfig;
    agentDir?: string;
    workspaceDir?: string;
    sandbox?: PdfSandboxConfig;
    fsPolicy?: ToolFsPolicy;
}): AnyAgentTool | null;
