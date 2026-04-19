export declare function isMatrixVerificationEventType(type: unknown): boolean;
export declare function isMatrixVerificationRequestMsgType(msgtype: unknown): boolean;
export declare function isMatrixVerificationNoticeBody(body: unknown): boolean;
export declare function isMatrixVerificationRoomMessage(content: {
    msgtype?: unknown;
    body?: unknown;
}): boolean;
export declare const matrixVerificationConstants: {
    readonly eventPrefix: "m.key.verification.";
    readonly requestMsgtype: "m.key.verification.request";
};
