import "./zod-schema.core-Cx4hqkoC.js";
import "./config-schema-BoSEJoAt.js";
import "./status-helpers-CtpWf3f1.js";
import "./ssrf-BWlfjI7J.js";
import { t as createOptionalChannelSetupSurface } from "./channel-setup-CHiUxDQ-.js";
import "./channel-reply-pipeline-S26JmiPz.js";
import "./webhook-memory-guards-B61rc1wa.js";
import "./direct-dm-DRMChReK.js";
//#region src/plugin-sdk/nostr.ts
const nostrSetup = createOptionalChannelSetupSurface({
	channel: "nostr",
	label: "Nostr",
	npmSpec: "@openclaw/nostr",
	docsPath: "/channels/nostr"
});
const nostrSetupAdapter = nostrSetup.setupAdapter;
const nostrSetupWizard = nostrSetup.setupWizard;
//#endregion
export { nostrSetupWizard as n, nostrSetupAdapter as t };
