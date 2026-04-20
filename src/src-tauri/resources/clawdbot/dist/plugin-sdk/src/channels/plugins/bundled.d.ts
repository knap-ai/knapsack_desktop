import type { PluginRuntime } from "../../plugins/runtime/types.js";
import type { ChannelPlugin } from "./types.plugin.js";
import type { ChannelId } from "./types.public.js";
type BundledChannelEntryRuntimeContract = {
    kind: "bundled-channel-entry";
    id: string;
    name: string;
    description: string;
    features?: {
        accountInspect?: boolean;
    };
    register: (api: unknown) => void;
    loadChannelPlugin: () => ChannelPlugin;
    loadChannelSecrets?: () => ChannelPlugin["secrets"] | undefined;
    loadChannelAccountInspector?: () => NonNullable<ChannelPlugin["config"]["inspectAccount"]>;
    setChannelRuntime?: (runtime: PluginRuntime) => void;
};
type BundledChannelSetupEntryRuntimeContract = {
    kind: "bundled-channel-setup-entry";
    loadSetupPlugin: () => ChannelPlugin;
    loadSetupSecrets?: () => ChannelPlugin["secrets"] | undefined;
    features?: {
        legacyStateMigrations?: boolean;
        legacySessionSurfaces?: boolean;
    };
};
export declare function listBundledChannelPluginIds(): readonly ChannelId[];
export declare function listBundledChannelPlugins(): readonly ChannelPlugin[];
export declare function listBundledChannelSetupPlugins(): readonly ChannelPlugin[];
export declare function listBundledChannelSetupPluginsByFeature(feature: keyof NonNullable<BundledChannelSetupEntryRuntimeContract["features"]>): readonly ChannelPlugin[];
export declare function hasBundledChannelEntryFeature(id: ChannelId, feature: keyof NonNullable<BundledChannelEntryRuntimeContract["features"]>): boolean;
export declare function getBundledChannelAccountInspector(id: ChannelId): NonNullable<ChannelPlugin["config"]["inspectAccount"]> | undefined;
export declare function getBundledChannelPlugin(id: ChannelId): ChannelPlugin | undefined;
export declare function getBundledChannelSecrets(id: ChannelId): ChannelPlugin["secrets"] | undefined;
export declare function getBundledChannelSetupPlugin(id: ChannelId): ChannelPlugin | undefined;
export declare function getBundledChannelSetupSecrets(id: ChannelId): ChannelPlugin["secrets"] | undefined;
export declare function requireBundledChannelPlugin(id: ChannelId): ChannelPlugin;
export declare function setBundledChannelRuntime(id: ChannelId, runtime: PluginRuntime): void;
export {};
