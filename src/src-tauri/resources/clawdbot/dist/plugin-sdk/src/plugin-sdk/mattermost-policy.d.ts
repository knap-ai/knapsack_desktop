type MattermostSenderAllowed = (params: {
    senderId: string;
    senderName?: string;
    allowFrom: string[];
    allowNameMatching?: boolean;
}) => boolean;
type FacadeModule = {
    isMattermostSenderAllowed: MattermostSenderAllowed;
};
export declare const isMattermostSenderAllowed: FacadeModule["isMattermostSenderAllowed"];
export {};
