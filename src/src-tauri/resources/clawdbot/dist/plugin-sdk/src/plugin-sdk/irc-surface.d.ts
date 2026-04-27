import type { ChannelSetupWizard } from "../channels/plugins/setup-wizard-types.js";
import type { ChannelSetupAdapter } from "../channels/plugins/types.adapters.js";
import type { OpenClawConfig } from "../config/types.js";
type IrcAccountConfig = {
    name?: string;
    enabled?: boolean;
    host?: string;
    port?: number;
    tls?: boolean;
    nick?: string;
    username?: string;
    realname?: string;
    password?: string;
    passwordFile?: string;
    channels?: string[];
    groups?: Record<string, unknown>;
};
type ResolvedIrcAccount = {
    accountId: string;
    enabled: boolean;
    name?: string;
    configured: boolean;
    host: string;
    port: number;
    tls: boolean;
    nick: string;
    username: string;
    realname: string;
    password: string;
    passwordSource: "env" | "passwordFile" | "config" | "none";
    config: IrcAccountConfig;
};
type FacadeModule = {
    ircSetupAdapter: ChannelSetupAdapter;
    ircSetupWizard: ChannelSetupWizard;
    listIrcAccountIds: (cfg: OpenClawConfig) => string[];
    resolveDefaultIrcAccountId: (cfg: OpenClawConfig) => string;
    resolveIrcAccount: (params: {
        cfg: OpenClawConfig;
        accountId?: string | null;
    }) => ResolvedIrcAccount;
};
export declare const ircSetupAdapter: FacadeModule["ircSetupAdapter"];
export declare const ircSetupWizard: FacadeModule["ircSetupWizard"];
export declare const listIrcAccountIds: FacadeModule["listIrcAccountIds"];
export declare const resolveDefaultIrcAccountId: FacadeModule["resolveDefaultIrcAccountId"];
export declare const resolveIrcAccount: FacadeModule["resolveIrcAccount"];
export {};
