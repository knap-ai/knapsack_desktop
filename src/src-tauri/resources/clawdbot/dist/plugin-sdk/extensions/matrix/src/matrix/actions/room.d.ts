import { type MatrixActionClientOpts } from "./types.js";
export declare function getMatrixMemberInfo(userId: string, opts?: MatrixActionClientOpts & {
    roomId?: string;
}): Promise<{
    userId: string;
    profile: {
        displayName: string | null;
        avatarUrl: string | null;
    };
    membership: null;
    powerLevel: null;
    displayName: string | null;
    roomId: string | null;
}>;
export declare function getMatrixRoomInfo(roomId: string, opts?: MatrixActionClientOpts): Promise<{
    roomId: string;
    name: string | null;
    topic: string | null;
    canonicalAlias: string | null;
    altAliases: never[];
    memberCount: number | null;
}>;
