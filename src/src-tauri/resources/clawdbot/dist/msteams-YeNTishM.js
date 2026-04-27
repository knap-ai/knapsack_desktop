import "./utils-BMRcljdi.js";
import "./types.secrets-Zn5Zyn7M.js";
import "./config-schema-BEuj464I.js";
import "./zod-schema.providers-core-Bl_XI-8U.js";
import "./file-lock-DUSWWPN-.js";
import "./tokens-C_v_J0E7.js";
import "./mime-Zn7U6BSf.js";
import "./ssrf-MkDHylX_.js";
import "./fetch-guard-DKbwHPzH.js";
import "./store-B9O3InEv.js";
import "./json-store-DD6hxObv.js";
import "./dm-policy-shared-CF1kNTSS.js";
import "./history-yaBRQgK8.js";
import "./setup-wizard-helpers-B8Qrpsoj.js";
import "./channel-reply-pipeline-zp0MNhbR.js";
import "./channel-pairing-DF6gWII4.js";
import "./status-helpers-Jbf-oZqp.js";
import "./http-body-DmMOHMx8.js";
import { t as createOptionalChannelSetupSurface } from "./channel-setup-ByPYNtWa.js";
import "./inbound-reply-dispatch-C2ZcRBQy.js";
import "./web-media-Bb3gpr-C.js";
import "./outbound-media-Crb_x_N8.js";
import "./ssrf-policy-fyM1MW87.js";
import "./session-envelope-CuB14LAP.js";
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
