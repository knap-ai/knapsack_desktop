import type { OpenClawConfig } from "../config/types.openclaw.js";
type ChannelPresenceOptions = {
    includePersistedAuthState?: boolean;
    persistedAuthStateProbe?: {
        listChannelIds: () => readonly string[];
        hasState: (params: {
            channelId: string;
            cfg: OpenClawConfig;
            env: NodeJS.ProcessEnv;
        }) => boolean;
    };
};
export declare function hasMeaningfulChannelConfig(value: unknown): boolean;
export declare function listPotentialConfiguredChannelIds(cfg: OpenClawConfig, env?: NodeJS.ProcessEnv, options?: ChannelPresenceOptions): string[];
export declare function hasPotentialConfiguredChannels(cfg: OpenClawConfig | null | undefined, env?: NodeJS.ProcessEnv, options?: ChannelPresenceOptions): boolean;
export {};
