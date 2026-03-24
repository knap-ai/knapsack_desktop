import type { SsrFPolicy } from "openclaw/plugin-sdk/infra-runtime";
import { getDefaultLocalRoots, LocalMediaAccessError, type LocalMediaAccessErrorCode, type MediaKind } from "openclaw/plugin-sdk/media-runtime";
import { optimizeImageToPng } from "openclaw/plugin-sdk/media-runtime";
export { getDefaultLocalRoots, LocalMediaAccessError };
export type { LocalMediaAccessErrorCode };
export type WebMediaResult = {
    buffer: Buffer;
    contentType?: string;
    kind: MediaKind | undefined;
    fileName?: string;
};
type WebMediaOptions = {
    maxBytes?: number;
    optimizeImages?: boolean;
    ssrfPolicy?: SsrFPolicy;
    /** Allowed root directories for local path reads. "any" is deprecated; prefer sandboxValidated + readFile. */
    localRoots?: readonly string[] | "any";
    /** Caller already validated the local path (sandbox/other guards); requires readFile override. */
    sandboxValidated?: boolean;
    readFile?: (filePath: string) => Promise<Buffer>;
};
export declare function loadWebMedia(mediaUrl: string, maxBytesOrOptions?: number | WebMediaOptions, options?: {
    ssrfPolicy?: SsrFPolicy;
    localRoots?: readonly string[] | "any";
}): Promise<WebMediaResult>;
export declare function loadWebMediaRaw(mediaUrl: string, maxBytesOrOptions?: number | WebMediaOptions, options?: {
    ssrfPolicy?: SsrFPolicy;
    localRoots?: readonly string[] | "any";
}): Promise<WebMediaResult>;
export declare function optimizeImageToJpeg(buffer: Buffer, maxBytes: number, opts?: {
    contentType?: string;
    fileName?: string;
}): Promise<{
    buffer: Buffer;
    optimizedSize: number;
    resizeSide: number;
    quality: number;
}>;
export { optimizeImageToPng };
