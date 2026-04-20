import "./provider-model-shared-DyDnBaDe.js";
import "./core-Dh0sB0kj.js";
import "./routing-BI8_fMua.js";
import { t as createPluginRuntimeStore } from "./runtime-store-Cvr8bl0h.js";
import "./channel-policy-G84s3mXs.js";
import "./reply-history-DTh6o1-h.js";
import "./channel-reply-pipeline-DHFpjrzi.js";
import "./channel-pairing-DMzs787S.js";
import "./webhook-targets-CBZjdIw_.js";
import "./webhook-ingress-KrGlV9-3.js";
import "./setup-Ben3xLZg.js";
import "./config-runtime-Bh8MKSv2.js";
import "./agent-media-payload-D_-uGY_i.js";
import "./outbound-media-DUQMvysg.js";
import "./media-runtime-M1ED8IU3.js";
import "./browser-node-runtime-Cr9m9xwX.js";
import "./command-auth-Da7bqm4r.js";
import "./channel-feedback-CM4YbZWs.js";
import "./channel-inbound-CiISPL9O.js";
import "./channel-lifecycle-D1c7td96.js";
import "./channel-status-CnINozhH.js";
//#region extensions/mattermost/src/runtime.ts
const { setRuntime: setMattermostRuntime, getRuntime: getMattermostRuntime } = createPluginRuntimeStore({
	pluginId: "mattermost",
	errorMessage: "Mattermost runtime not initialized"
});
//#endregion
export { setMattermostRuntime as n, getMattermostRuntime as t };
