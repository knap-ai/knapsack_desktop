import { t as createPluginRuntimeStore } from "./runtime-store-CURt34XU.js";
import "./msteams-YeNTishM.js";
//#region extensions/msteams/src/runtime.ts
const { setRuntime: setMSTeamsRuntime, getRuntime: getMSTeamsRuntime } = createPluginRuntimeStore({
	pluginId: "msteams",
	errorMessage: "MSTeams runtime not initialized"
});
//#endregion
export { setMSTeamsRuntime as n, getMSTeamsRuntime as t };
