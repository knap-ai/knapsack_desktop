import type { OpenClawConfig } from "./runtime-api.js";
type SendBlueBubblesMessage = (id: string, message: string, params: {
    cfg: OpenClawConfig;
    accountId?: string;
}) => Promise<unknown>;
export declare function createBlueBubblesPairingText(sendMessageBlueBubbles: SendBlueBubblesMessage): {
    idLabel: string;
    message: string;
    normalizeAllowEntry: (entry: string) => string;
    notify: ({ cfg, id, message, accountId, }: {
        cfg: OpenClawConfig;
        id: string;
        message: string;
        accountId?: string;
    }) => Promise<void>;
};
export {};
