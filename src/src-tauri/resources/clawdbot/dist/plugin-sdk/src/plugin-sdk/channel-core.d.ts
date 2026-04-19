export type { ChannelConfigUiHint, ChannelPlugin, OpenClawConfig, OpenClawPluginApi, PluginCommandContext, PluginRuntime, ChannelOutboundSessionRouteParams, } from "./core.js";
import { createChannelPluginBase as createChannelPluginBaseFromCore } from "./core.js";
export declare const createChannelPluginBase: typeof createChannelPluginBaseFromCore;
export { buildChannelConfigSchema, buildChannelOutboundSessionRoute, clearAccountEntryFields, createChatChannelPlugin, defineChannelPluginEntry, defineSetupPluginEntry, parseOptionalDelimitedEntries, stripChannelTargetPrefix, stripTargetKindPrefix, tryReadSecretFileSync, } from "./core.js";
