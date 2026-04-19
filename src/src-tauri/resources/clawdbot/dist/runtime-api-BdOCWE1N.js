import "./core-Dh0sB0kj.js";
import "./secret-input-BEMaS7ol.js";
import { t as createPluginRuntimeStore } from "./runtime-store-Cvr8bl0h.js";
import "./channel-reply-pipeline-DHFpjrzi.js";
import "./channel-pairing-DMzs787S.js";
import "./status-helpers-BEDVo_4L.js";
import "./webhook-ingress-KrGlV9-3.js";
import "./runtime-Lsq_Ew0U.js";
import "./setup-Ben3xLZg.js";
import "./config-runtime-Bh8MKSv2.js";
import "./command-auth-Da7bqm4r.js";
import "./channel-feedback-CM4YbZWs.js";
import "./channel-status-CnINozhH.js";
//#region extensions/zalo/src/runtime.ts
const { setRuntime: setZaloRuntime, getRuntime: getZaloRuntime } = createPluginRuntimeStore({
	pluginId: "zalo",
	errorMessage: "Zalo runtime not initialized"
});
//#endregion
export { setZaloRuntime as n, getZaloRuntime as t };
