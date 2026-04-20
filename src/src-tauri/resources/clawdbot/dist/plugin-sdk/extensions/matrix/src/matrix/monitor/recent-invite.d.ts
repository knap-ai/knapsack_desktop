import type { MatrixRoomConfig } from "../../types.js";
import type { MatrixRoomInfo } from "./room-info.js";
export declare function shouldPromoteRecentInviteRoom(params: {
    roomId: string;
    roomInfo: Pick<MatrixRoomInfo, "name" | "canonicalAlias" | "altAliases" | "nameResolved" | "aliasesResolved">;
    rooms?: Record<string, MatrixRoomConfig>;
}): boolean;
