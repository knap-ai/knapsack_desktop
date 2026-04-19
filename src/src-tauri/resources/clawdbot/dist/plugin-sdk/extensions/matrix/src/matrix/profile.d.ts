import type { MatrixClient } from "./sdk.js";
export declare const MATRIX_PROFILE_AVATAR_MAX_BYTES: number;
type MatrixProfileClient = Pick<MatrixClient, "getUserProfile" | "setDisplayName" | "setAvatarUrl" | "uploadContent">;
type MatrixProfileLoadResult = {
    buffer: Buffer;
    contentType?: string;
    fileName?: string;
};
export type MatrixProfileSyncResult = {
    skipped: boolean;
    displayNameUpdated: boolean;
    avatarUpdated: boolean;
    resolvedAvatarUrl: string | null;
    uploadedAvatarSource: "http" | "path" | null;
    convertedAvatarFromHttp: boolean;
};
export declare function isMatrixMxcUri(value: string): boolean;
export declare function isMatrixHttpAvatarUri(value: string): boolean;
export declare function isSupportedMatrixAvatarSource(value: string): boolean;
export declare function syncMatrixOwnProfile(params: {
    client: MatrixProfileClient;
    userId: string;
    displayName?: string | null;
    avatarUrl?: string | null;
    avatarPath?: string | null;
    avatarMaxBytes?: number;
    loadAvatarFromUrl?: (url: string, maxBytes: number) => Promise<MatrixProfileLoadResult>;
    loadAvatarFromPath?: (path: string, maxBytes: number) => Promise<MatrixProfileLoadResult>;
}): Promise<MatrixProfileSyncResult>;
export {};
