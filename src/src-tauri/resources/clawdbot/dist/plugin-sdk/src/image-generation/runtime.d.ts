import type { AuthProfileStore } from "../agents/auth-profiles.js";
import type { FallbackAttempt } from "../agents/model-fallback.types.js";
import type { OpenClawConfig } from "../config/config.js";
import type { GeneratedImageAsset, ImageGenerationResolution, ImageGenerationSourceImage } from "./types.js";
export type GenerateImageParams = {
    cfg: OpenClawConfig;
    prompt: string;
    agentDir?: string;
    authStore?: AuthProfileStore;
    modelOverride?: string;
    count?: number;
    size?: string;
    aspectRatio?: string;
    resolution?: ImageGenerationResolution;
    inputImages?: ImageGenerationSourceImage[];
};
export type GenerateImageRuntimeResult = {
    images: GeneratedImageAsset[];
    provider: string;
    model: string;
    attempts: FallbackAttempt[];
    metadata?: Record<string, unknown>;
};
export declare function listRuntimeImageGenerationProviders(params?: {
    config?: OpenClawConfig;
}): import("./types.js").ImageGenerationProvider[];
export declare function generateImage(params: GenerateImageParams): Promise<GenerateImageRuntimeResult>;
