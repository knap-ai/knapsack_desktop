import type { MediaUnderstandingCapability } from "./types.js";
type BundledMediaProviderDefaults = {
    defaultModels?: Partial<Record<MediaUnderstandingCapability, string>>;
    autoPriority?: Partial<Record<MediaUnderstandingCapability, number>>;
    nativeDocumentInputs?: Array<"pdf">;
};
export declare function getBundledMediaProviderDefaults(providerId: string): BundledMediaProviderDefaults | null;
export declare function resolveBundledDefaultMediaModel(params: {
    providerId: string;
    capability: MediaUnderstandingCapability;
}): string | undefined;
export declare function resolveBundledAutoMediaKeyProviders(capability: MediaUnderstandingCapability): string[];
export declare function bundledProviderSupportsNativePdfDocument(providerId: string): boolean;
export {};
