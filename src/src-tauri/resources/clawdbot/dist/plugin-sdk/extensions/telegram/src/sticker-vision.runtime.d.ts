import type { OpenClawConfig } from "openclaw/plugin-sdk/config-runtime";
export declare function resolveStickerVisionSupportRuntime(params: {
    cfg: OpenClawConfig;
    agentId?: string;
}): Promise<boolean>;
