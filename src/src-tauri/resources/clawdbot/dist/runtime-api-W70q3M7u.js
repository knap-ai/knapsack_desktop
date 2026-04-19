import { t as createPluginRuntimeStore } from "./runtime-store-Cvr8bl0h.js";
import "./channel-policy-G84s3mXs.js";
import "./channel-reply-pipeline-DHFpjrzi.js";
import "./channel-pairing-DMzs787S.js";
import "./webhook-request-guards-Df6jC-7E.js";
import "./webhook-targets-CBZjdIw_.js";
import "./config-runtime-Bh8MKSv2.js";
import "./outbound-media-DUQMvysg.js";
import "./ssrf-runtime-CmuKDV7X.js";
import "./media-runtime-M1ED8IU3.js";
import "./channel-config-primitives-Uzl-J-Mr.js";
import "./channel-actions-CkAP8jIY.js";
import "./channel-feedback-CM4YbZWs.js";
import "./channel-inbound-CiISPL9O.js";
import "./channel-lifecycle-D1c7td96.js";
import "./googlechat-runtime-shared-D97uW_rr.js";
import "./channel-status-CnINozhH.js";
//#region extensions/googlechat/src/runtime.ts
const { setRuntime: setGoogleChatRuntime, getRuntime: getGoogleChatRuntime } = createPluginRuntimeStore({
	pluginId: "googlechat",
	errorMessage: "Google Chat runtime not initialized"
});
//#endregion
export { setGoogleChatRuntime as n, getGoogleChatRuntime as t };
