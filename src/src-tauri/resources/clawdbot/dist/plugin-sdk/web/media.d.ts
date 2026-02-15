import type { SsrFPolicy } from "../infra/net/ssrf.js";
import { type MediaKind } from "../media/constants.js";
import { optimizeImageToPng } from "../media/image-ops.js";
export type WebMediaResult = {
    buffer: Buffer;
    contentType?: string;
    kind: MediaKind;
    fileName?: string;
};
type WebMediaOptions = {
    maxBytes?: number;
    optimizeImages?: boolean;
    ssrfPolicy?: SsrFPolicy;
    /** Allowed root directories for local path reads. "any" skips the check (caller already validated). */
    localRoots?: string[] | "any";
    readFile?: (filePath: string) => Promise<Buffer>;
};
export declare function loadWebMedia(mediaUrl: string, maxBytesOrOptions?: number | WebMediaOptions, options?: {
    ssrfPolicy?: SsrFPolicy;
    localRoots?: string[] | "any";
}): Promise<WebMediaResult>;
export declare function loadWebMediaRaw(mediaUrl: string, maxBytesOrOptions?: number | WebMediaOptions, options?: {
    ssrfPolicy?: SsrFPolicy;
    localRoots?: string[] | "any";
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
