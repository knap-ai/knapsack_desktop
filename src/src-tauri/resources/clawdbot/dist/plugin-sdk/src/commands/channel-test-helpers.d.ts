import type { ChannelSetupWizardAdapter } from "./channel-setup/types.js";
import type { ChannelChoice } from "./onboard-types.js";
type ChannelSetupWizardAdapterPatch = Partial<Pick<ChannelSetupWizardAdapter, "afterConfigWritten" | "configure" | "configureInteractive" | "configureWhenConfigured" | "getStatus">>;
export declare function setDefaultChannelPluginRegistryForTests(): void;
export declare function patchChannelSetupWizardAdapter(channel: ChannelChoice, patch: ChannelSetupWizardAdapterPatch): () => void;
export declare const patchChannelOnboardingAdapter: typeof patchChannelSetupWizardAdapter;
export {};
