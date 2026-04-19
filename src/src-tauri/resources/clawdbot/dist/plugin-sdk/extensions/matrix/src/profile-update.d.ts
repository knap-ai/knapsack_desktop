import type { CoreConfig } from "./types.js";
export type MatrixProfileUpdateResult = {
    accountId: string;
    displayName: string | null;
    avatarUrl: string | null;
    profile: {
        displayNameUpdated: boolean;
        avatarUpdated: boolean;
        resolvedAvatarUrl: string | null;
        uploadedAvatarSource: "http" | "path" | null;
        convertedAvatarFromHttp: boolean;
    };
    configPath: string;
};
export declare function applyMatrixProfileUpdate(params: {
    cfg?: CoreConfig;
    account?: string;
    displayName?: string;
    avatarUrl?: string;
    avatarPath?: string;
    mediaLocalRoots?: readonly string[];
}): Promise<MatrixProfileUpdateResult>;
