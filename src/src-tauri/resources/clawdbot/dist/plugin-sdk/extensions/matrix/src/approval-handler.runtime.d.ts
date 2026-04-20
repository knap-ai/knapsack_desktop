import { type ExecApprovalReplyDecision } from "openclaw/plugin-sdk/approval-reply-runtime";
import { deleteMatrixMessage, editMatrixMessage } from "./matrix/actions/messages.js";
import { repairMatrixDirectRooms } from "./matrix/direct-management.js";
import type { MatrixClient } from "./matrix/sdk.js";
import { reactMatrixMessage, sendMessageMatrix } from "./matrix/send.js";
type PendingMessage = {
    roomId: string;
    messageIds: readonly string[];
    reactionEventId: string;
};
type PreparedMatrixTarget = {
    to: string;
    roomId: string;
    threadId?: string;
};
type PendingApprovalContent = {
    approvalId: string;
    text: string;
    allowedDecisions: readonly ExecApprovalReplyDecision[];
};
type ReactionTargetRef = {
    roomId: string;
    eventId: string;
};
export type MatrixApprovalHandlerDeps = {
    nowMs?: () => number;
    sendMessage?: typeof sendMessageMatrix;
    reactMessage?: typeof reactMatrixMessage;
    editMessage?: typeof editMatrixMessage;
    deleteMessage?: typeof deleteMatrixMessage;
    repairDirectRooms?: typeof repairMatrixDirectRooms;
};
export type MatrixApprovalHandlerContext = {
    client: MatrixClient;
    deps?: MatrixApprovalHandlerDeps;
};
export declare const matrixApprovalNativeRuntime: import("openclaw/plugin-sdk/approval-handler-runtime").ChannelApprovalNativeRuntimeAdapter<PendingApprovalContent, PreparedMatrixTarget, PendingMessage, ReactionTargetRef, string>;
export {};
