import type { PluginSdkFacadeTypeMap } from "../generated/plugin-sdk-facade-type-map.generated.js";
type FacadeEntry = PluginSdkFacadeTypeMap["feishu-setup"];
type FacadeModule = FacadeEntry["module"];
export declare const feishuSetupAdapter: FacadeModule["feishuSetupAdapter"];
export declare const feishuSetupWizard: FacadeModule["feishuSetupWizard"];
export {};
