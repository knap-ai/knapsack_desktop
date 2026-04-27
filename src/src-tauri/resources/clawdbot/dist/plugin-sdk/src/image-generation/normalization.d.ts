import type { ImageGenerationIgnoredOverride, ImageGenerationNormalization, ImageGenerationOutputFormat, ImageGenerationProvider, ImageGenerationQuality, ImageGenerationResolution, ImageGenerationSourceImage } from "./types.js";
export type ResolvedImageGenerationOverrides = {
    size?: string;
    aspectRatio?: string;
    resolution?: ImageGenerationResolution;
    quality?: ImageGenerationQuality;
    outputFormat?: ImageGenerationOutputFormat;
    ignoredOverrides: ImageGenerationIgnoredOverride[];
    normalization?: ImageGenerationNormalization;
};
export declare function resolveImageGenerationOverrides(params: {
    provider: ImageGenerationProvider;
    size?: string;
    aspectRatio?: string;
    resolution?: ImageGenerationResolution;
    quality?: ImageGenerationQuality;
    outputFormat?: ImageGenerationOutputFormat;
    inputImages?: ImageGenerationSourceImage[];
}): ResolvedImageGenerationOverrides;
