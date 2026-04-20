type SetupSurfaceModule = typeof import("./src/setup-surface.js");
export { zaloDmPolicy, zaloSetupAdapter, createZaloSetupWizardProxy } from "./src/setup-core.js";
export { evaluateZaloGroupAccess, resolveZaloRuntimeGroupPolicy } from "./src/group-access.js";
export declare const zaloSetupWizard: SetupSurfaceModule["zaloSetupWizard"];
