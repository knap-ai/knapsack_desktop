import { createPluginRuntimeStore } from "openclaw/plugin-sdk/runtime-store";
//#region extensions/matrix/src/runtime.ts
const { setRuntime: setMatrixRuntime, getRuntime: getMatrixRuntime } = createPluginRuntimeStore({
	pluginId: "matrix",
	errorMessage: "Matrix runtime not initialized"
});
//#endregion
export { setMatrixRuntime as n, getMatrixRuntime as t };
