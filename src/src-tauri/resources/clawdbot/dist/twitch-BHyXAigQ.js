import "./links-Ce33eXq9.js";
import "./zod-schema.core-Cx4hqkoC.js";
import "./config-schema-BoSEJoAt.js";
import { t as createOptionalChannelSetupSurface } from "./channel-setup-CHiUxDQ-.js";
import "./channel-reply-pipeline-S26JmiPz.js";
//#region src/plugin-sdk/twitch.ts
const twitchSetup = createOptionalChannelSetupSurface({
	channel: "twitch",
	label: "Twitch",
	npmSpec: "@openclaw/twitch"
});
const twitchSetupAdapter = twitchSetup.setupAdapter;
const twitchSetupWizard = twitchSetup.setupWizard;
//#endregion
export { twitchSetupWizard as n, twitchSetupAdapter as t };
