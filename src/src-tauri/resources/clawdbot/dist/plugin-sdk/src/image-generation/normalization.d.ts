import type { ImageGenerationIgnoredOverride, ImageGenerationNormalization, ImageGenerationProvider, ImageGenerationResolution, ImageGenerationSourceImage } from "./types.js";
export type ResolvedImageGenerationOverrides = {
    size?: string;
    aspectRatio?: string;
    resolution?: ImageGenerationResolution;
    ignoredOverrides: ImageGenerationIgnoredOverride[];
    normalization?: ImageGenerationNormalization;
};
export declare function resolveImageGenerationOverrides(params: {
    provider: ImageGenerationProvider;
    size?: string;
    aspectRatio?: string;
    resolution?: ImageGenerationResolution;
    inputImages?: ImageGenerationSourceImage[];
}): ResolvedImageGenerationOverrides;
