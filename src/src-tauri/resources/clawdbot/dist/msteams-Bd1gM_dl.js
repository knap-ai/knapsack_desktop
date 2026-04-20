import "./utils-D5DtWkEu.js";
import "./types.secrets-CeL3gSMO.js";
import "./config-schema-sgVTuroC.js";
import "./zod-schema.providers-core-BxvvQH1c.js";
import "./file-lock-ByJeCMLs.js";
import "./tokens-CKM4Lddu.js";
import "./mime-B6nXlmtY.js";
import "./fetch-guard-B3p4gGaY.js";
import "./ssrf-DoOclwFS.js";
import "./store-CFeRgpZO.js";
import "./json-store-iQhnwImo.js";
import "./dm-policy-shared-B7IvP1oD.js";
import "./history-BexnEA43.js";
import "./setup-wizard-helpers-C8R_wm_7.js";
import "./channel-reply-pipeline-DHFpjrzi.js";
import "./channel-pairing-DMzs787S.js";
import "./status-helpers-BEDVo_4L.js";
import "./http-body-CmkD5yuo.js";
import { t as createOptionalChannelSetupSurface } from "./channel-setup-CXvL-Qpc.js";
import "./inbound-reply-dispatch-DL65hfTX.js";
import "./web-media-BFBS6C3r.js";
import "./outbound-media-DUQMvysg.js";
import "./ssrf-policy-CChtVzhj.js";
import "./session-envelope-AsZhkZyg.js";
//#region src/plugin-sdk/msteams.ts
const msteamsSetup = createOptionalChannelSetupSurface({
	channel: "msteams",
	label: "Microsoft Teams",
	npmSpec: "@openclaw/msteams",
	docsPath: "/channels/msteams"
});
const msteamsSetupWizard = msteamsSetup.setupWizard;
const msteamsSetupAdapter = msteamsSetup.setupAdapter;
//#endregion
export { msteamsSetupWizard as n, msteamsSetupAdapter as t };
