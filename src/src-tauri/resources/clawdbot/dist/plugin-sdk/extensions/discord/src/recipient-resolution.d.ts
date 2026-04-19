import { type OpenClawConfig } from "openclaw/plugin-sdk/config-runtime";
type DiscordRecipient = {
    kind: "user";
    id: string;
} | {
    kind: "channel";
    id: string;
};
export declare function parseAndResolveRecipient(raw: string, accountId?: string, cfg?: OpenClawConfig): Promise<DiscordRecipient>;
export {};
