import type { MatrixRoomConfig } from "../../types.js";
export type MatrixRoomConfigResolved = {
    allowed: boolean;
    allowlistConfigured: boolean;
    config?: MatrixRoomConfig;
    matchKey?: string;
    matchSource?: "direct" | "wildcard";
};
export declare function resolveMatrixRoomConfig(params: {
    rooms?: Record<string, MatrixRoomConfig>;
    roomId: string;
    aliases: string[];
}): MatrixRoomConfigResolved;
