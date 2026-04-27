import { b as setOpenClawVersion } from "./sender-BZ_TJkxQ.js";
import { createPluginRuntimeStore } from "openclaw/plugin-sdk/runtime-store";
//#region extensions/qqbot/src/bridge/runtime.ts
const { setRuntime: _setRuntime, getRuntime: getQQBotRuntime } = createPluginRuntimeStore({
	pluginId: "qqbot",
	errorMessage: "QQBot runtime not initialized"
});
/** Set the QQBot runtime and inject the framework version into the User-Agent. */
function setQQBotRuntime(runtime) {
	_setRuntime(runtime);
	setOpenClawVersion(runtime.version);
}
/** Type-narrowed getter for engine/ modules that need GatewayPluginRuntime. */
function getQQBotRuntimeForEngine() {
	return getQQBotRuntime();
}
//#endregion
export { getQQBotRuntimeForEngine as n, setQQBotRuntime as r, getQQBotRuntime as t };
