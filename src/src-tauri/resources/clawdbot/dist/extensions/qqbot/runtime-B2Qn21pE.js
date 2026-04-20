import { createPluginRuntimeStore } from "openclaw/plugin-sdk/runtime-store";
//#region extensions/qqbot/src/runtime.ts
const { setRuntime: setQQBotRuntime, getRuntime: getQQBotRuntime } = createPluginRuntimeStore({
	pluginId: "qqbot",
	errorMessage: "QQBot runtime not initialized"
});
//#endregion
export { setQQBotRuntime as n, getQQBotRuntime as t };
