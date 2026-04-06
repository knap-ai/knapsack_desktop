import "./links-Ce33eXq9.js";
import "./zod-schema.providers-core-BJorTsd7.js";
import "./config-schema-BoSEJoAt.js";
import "./registry-DTO_OK4F.js";
import "./setup-helpers-CjYO5YkF.js";
import "./status-helpers-CtpWf3f1.js";
import "./common-RGbDbB5n.js";
import "./fetch-guard-Lvq2pw52.js";
import "./fetch-ClF-ZgDC.js";
import { n as resolveChannelGroupRequireMention } from "./group-policy-B1uRyci5.js";
import "./setup-wizard-helpers-BfrhuTOh.js";
import "./dm-policy-shared-ikRqobo8.js";
import "./channel-policy-Dqo0XdDX.js";
import { t as createOptionalChannelSetupSurface } from "./channel-setup-CHiUxDQ-.js";
import "./channel-reply-pipeline-S26JmiPz.js";
import "./webhook-ingress-B2uHxBM3.js";
import "./web-media-DPyBx-37.js";
import "./outbound-media-Cj_f0fBE.js";
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
