import { createPluginRuntimeStore } from "openclaw/plugin-sdk/runtime-store";
//#region extensions/slack/src/runtime.ts
const { setRuntime: setSlackRuntime, clearRuntime: clearSlackRuntime, tryGetRuntime: getOptionalSlackRuntime, getRuntime: getSlackRuntime } = createPluginRuntimeStore({
	pluginId: "slack",
	errorMessage: "Slack runtime not initialized"
});
//#endregion
export { setSlackRuntime as n, getOptionalSlackRuntime as t };
