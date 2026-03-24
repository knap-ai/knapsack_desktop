import type { ResolvedFeishuAccount } from "./types.js";
export type FeishuPermissionError = {
    code: number;
    message: string;
    grantUrl?: string;
};
type SenderNameResult = {
    name?: string;
    permissionError?: FeishuPermissionError;
};
export declare function resolveFeishuSenderName(params: {
    account: ResolvedFeishuAccount;
    senderId: string;
    log: (...args: any[]) => void;
}): Promise<SenderNameResult>;
export {};
