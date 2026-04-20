import type { ChannelDoctorConfigMutation, ChannelDoctorLegacyConfigRule } from "openclaw/plugin-sdk/channel-contract";
import type { OpenClawConfig } from "openclaw/plugin-sdk/config-runtime";
export declare const legacyConfigRules: ChannelDoctorLegacyConfigRule[];
export declare function normalizeCompatibilityConfig({ cfg, }: {
    cfg: OpenClawConfig;
}): ChannelDoctorConfigMutation;
