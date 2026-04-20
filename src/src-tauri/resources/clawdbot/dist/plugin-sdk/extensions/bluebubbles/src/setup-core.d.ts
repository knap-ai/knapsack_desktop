import { type ChannelSetupAdapter, type DmPolicy, type OpenClawConfig } from "openclaw/plugin-sdk/setup";
export declare function setBlueBubblesDmPolicy(cfg: OpenClawConfig, accountId: string, dmPolicy: DmPolicy): OpenClawConfig;
export declare function setBlueBubblesAllowFrom(cfg: OpenClawConfig, accountId: string, allowFrom: string[]): OpenClawConfig;
export declare const blueBubblesSetupAdapter: ChannelSetupAdapter;
