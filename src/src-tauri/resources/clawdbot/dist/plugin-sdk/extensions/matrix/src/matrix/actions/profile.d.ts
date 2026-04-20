import { type MatrixProfileSyncResult } from "../profile.js";
import type { MatrixActionClientOpts } from "./types.js";
export declare function updateMatrixOwnProfile(opts?: MatrixActionClientOpts & {
    displayName?: string;
    avatarUrl?: string;
    avatarPath?: string;
}): Promise<MatrixProfileSyncResult>;
