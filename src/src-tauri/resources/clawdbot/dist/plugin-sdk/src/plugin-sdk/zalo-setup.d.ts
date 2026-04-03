import type { PluginSdkFacadeTypeMap } from "../generated/plugin-sdk-facade-type-map.generated.js";
type FacadeEntry = PluginSdkFacadeTypeMap["zalo-setup"];
type FacadeModule = FacadeEntry["module"];
export declare const evaluateZaloGroupAccess: FacadeModule["evaluateZaloGroupAccess"];
export declare const resolveZaloRuntimeGroupPolicy: FacadeModule["resolveZaloRuntimeGroupPolicy"];
export declare const zaloSetupAdapter: FacadeModule["zaloSetupAdapter"];
export declare const zaloSetupWizard: FacadeModule["zaloSetupWizard"];
export {};
