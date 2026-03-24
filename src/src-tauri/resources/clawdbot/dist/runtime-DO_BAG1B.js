import { t as createPluginRuntimeStore } from "./runtime-store-CpniCRIn.js";
//#region extensions/msteams/src/runtime.ts
const { setRuntime: setMSTeamsRuntime, getRuntime: getMSTeamsRuntime } = createPluginRuntimeStore("MSTeams runtime not initialized");
//#endregion
export { setMSTeamsRuntime as n, getMSTeamsRuntime as t };
