import type { PluginSdkFacadeTypeMap } from "../generated/plugin-sdk-facade-type-map.generated.js";
type FacadeEntry = PluginSdkFacadeTypeMap["irc-surface"];
type FacadeModule = FacadeEntry["module"];
export declare const ircSetupAdapter: FacadeModule["ircSetupAdapter"];
export declare const ircSetupWizard: FacadeModule["ircSetupWizard"];
export declare const listIrcAccountIds: FacadeModule["listIrcAccountIds"];
export declare const resolveDefaultIrcAccountId: FacadeModule["resolveDefaultIrcAccountId"];
export declare const resolveIrcAccount: FacadeModule["resolveIrcAccount"];
export {};
