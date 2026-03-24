import { t as createPluginRuntimeStore } from "./runtime-store-CpniCRIn.js";
//#region extensions/imessage/src/runtime.ts
const { setRuntime: setIMessageRuntime, getRuntime: getIMessageRuntime } = createPluginRuntimeStore("iMessage runtime not initialized");
//#endregion
export { setIMessageRuntime as n, getIMessageRuntime as t };
