import type { EncryptedFile, MessageEventContent } from "../sdk.js";
export type { MatrixRawEvent } from "../sdk.js";
export declare const EventType: {
    readonly RoomMessage: "m.room.message";
    readonly RoomMessageEncrypted: "m.room.encrypted";
    readonly RoomMember: "m.room.member";
    readonly Location: "m.location";
    readonly Reaction: "m.reaction";
};
export declare const RelationType: {
    readonly Replace: "m.replace";
    readonly Thread: "m.thread";
};
export type RoomMessageEventContent = MessageEventContent & {
    url?: string;
    file?: EncryptedFile;
    info?: {
        mimetype?: string;
        size?: number;
    };
    "m.relates_to"?: {
        rel_type?: string;
        event_id?: string;
        "m.in_reply_to"?: {
            event_id?: string;
        };
    };
};
