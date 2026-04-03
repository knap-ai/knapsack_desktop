import "./links-Ce33eXq9.js";
import "./config-schema-BoSEJoAt.js";
import "./setup-helpers-CjYO5YkF.js";
import "./status-helpers-CtpWf3f1.js";
import "./ssrf-BWlfjI7J.js";
import "./fetch-guard-Lvq2pw52.js";
import "./runtime-DQYrJ0Nk.js";
import { t as createOptionalChannelSetupSurface } from "./channel-setup-CHiUxDQ-.js";
import "./channel-reply-pipeline-S26JmiPz.js";
//#region src/plugin-sdk/tlon.ts
const tlonSetup = createOptionalChannelSetupSurface({
	channel: "tlon",
	label: "Tlon",
	npmSpec: "@openclaw/tlon",
	docsPath: "/channels/tlon"
});
const tlonSetupAdapter = tlonSetup.setupAdapter;
const tlonSetupWizard = tlonSetup.setupWizard;
//#endregion
export { tlonSetupWizard as n, tlonSetupAdapter as t };
