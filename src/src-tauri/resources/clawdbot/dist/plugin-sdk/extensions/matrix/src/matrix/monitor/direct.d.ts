import type { MatrixClient } from "../sdk.js";
type DirectMessageCheck = {
    roomId: string;
    senderId?: string;
    selfUserId?: string;
};
type DirectRoomTrackerOptions = {
    log?: (message: string) => void;
    canPromoteRecentInvite?: (roomId: string) => boolean | Promise<boolean>;
    shouldKeepLocallyPromotedDirectRoom?: ((roomId: string) => boolean | undefined | Promise<boolean | undefined>) | undefined;
};
export declare function createDirectRoomTracker(client: MatrixClient, opts?: DirectRoomTrackerOptions): {
    invalidateRoom: (roomId: string) => void;
    rememberInvite: (roomId: string, remoteUserId: string) => void;
    isDirectMessage: (params: DirectMessageCheck) => Promise<boolean>;
};
export {};
