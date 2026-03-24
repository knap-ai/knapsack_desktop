import { t as createPluginRuntimeStore } from "./runtime-store-CpniCRIn.js";
//#region extensions/zalo/src/runtime.ts
const { setRuntime: setZaloRuntime, getRuntime: getZaloRuntime } = createPluginRuntimeStore("Zalo runtime not initialized");
//#endregion
export { setZaloRuntime as n, getZaloRuntime as t };
