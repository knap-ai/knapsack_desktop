import { t as createPluginRuntimeStore } from "./runtime-store-CIDSrOnb.js";
//#region extensions/matrix/src/runtime.ts
const { setRuntime: setMatrixRuntime, getRuntime: getMatrixRuntime } = createPluginRuntimeStore("Matrix runtime not initialized");
//#endregion
export { setMatrixRuntime as n, getMatrixRuntime as t };
