import type { MatrixClient } from "../sdk.js";
type EncryptedFile = {
    url: string;
    key: {
        kty: string;
        key_ops: string[];
        alg: string;
        k: string;
        ext: boolean;
    };
    iv: string;
    hashes: Record<string, string>;
    v: string;
};
export declare function downloadMatrixMedia(params: {
    client: MatrixClient;
    mxcUrl: string;
    contentType?: string;
    sizeBytes?: number;
    maxBytes: number;
    file?: EncryptedFile;
    originalFilename?: string;
}): Promise<{
    path: string;
    contentType?: string;
    placeholder: string;
} | null>;
export {};
