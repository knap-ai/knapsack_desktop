import { t as createPluginRuntimeStore } from "./runtime-store-BnOb3XjU.js";
import "./channel-policy-D_qJHct1.js";
import "./channel-pairing-DFE8Potd.js";
import "./inbound-reply-dispatch-BJCyKZ9L.js";
import "./ssrf-runtime-CIV6CU_8.js";
//#region extensions/nextcloud-talk/src/runtime.ts
const { setRuntime: setNextcloudTalkRuntime, getRuntime: getNextcloudTalkRuntime } = createPluginRuntimeStore({
	pluginId: "nextcloud-talk",
	errorMessage: "Nextcloud Talk runtime not initialized"
});
//#endregion
export { setNextcloudTalkRuntime as n, getNextcloudTalkRuntime as t };
