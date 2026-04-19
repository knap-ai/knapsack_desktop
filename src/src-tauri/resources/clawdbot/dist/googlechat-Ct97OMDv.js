import "./types.secrets-CeL3gSMO.js";
import "./config-schema-sgVTuroC.js";
import "./registry-CENZffQG.js";
import "./zod-schema.providers-core-BxvvQH1c.js";
import "./fetch-guard-B3p4gGaY.js";
import "./common-BWtun2If.js";
import "./fetch-BL7ekE3E.js";
import { n as resolveChannelGroupRequireMention } from "./group-policy-BtMLH9Qc.js";
import "./setup-helpers-NxWLbAbV.js";
import "./channel-policy-G84s3mXs.js";
import "./dm-policy-shared-B7IvP1oD.js";
import "./setup-wizard-helpers-C8R_wm_7.js";
import "./channel-reply-pipeline-DHFpjrzi.js";
import "./channel-pairing-DMzs787S.js";
import "./status-helpers-BEDVo_4L.js";
import "./webhook-ingress-KrGlV9-3.js";
import { t as createOptionalChannelSetupSurface } from "./channel-setup-CXvL-Qpc.js";
import "./web-media-BFBS6C3r.js";
import "./outbound-media-DUQMvysg.js";
//#region src/plugin-sdk/googlechat.ts
function resolveGoogleChatGroupRequireMention(params) {
	return resolveChannelGroupRequireMention({
		cfg: params.cfg,
		channel: "googlechat",
		groupId: params.groupId,
		accountId: params.accountId
	});
}
const googlechatSetup = createOptionalChannelSetupSurface({
	channel: "googlechat",
	label: "Google Chat",
	npmSpec: "@openclaw/googlechat",
	docsPath: "/channels/googlechat"
});
const googlechatSetupAdapter = googlechatSetup.setupAdapter;
const googlechatSetupWizard = googlechatSetup.setupWizard;
//#endregion
export { googlechatSetupWizard as n, resolveGoogleChatGroupRequireMention as r, googlechatSetupAdapter as t };
