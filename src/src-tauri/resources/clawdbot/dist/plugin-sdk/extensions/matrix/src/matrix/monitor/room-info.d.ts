import type { MatrixClient } from "../sdk.js";
export type MatrixRoomInfo = {
    name?: string;
    canonicalAlias?: string;
    altAliases: string[];
    nameResolved: boolean;
    aliasesResolved: boolean;
};
export declare function createMatrixRoomInfoResolver(client: MatrixClient): {
    getRoomInfo: (roomId: string, opts?: {
        includeAliases?: boolean;
    }) => Promise<MatrixRoomInfo>;
    getMemberDisplayName: (roomId: string, userId: string) => Promise<string>;
};
