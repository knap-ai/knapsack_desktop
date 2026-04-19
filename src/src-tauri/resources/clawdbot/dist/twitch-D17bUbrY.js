import "./zod-schema.core-CYrn8zgQ.js";
import "./config-schema-sgVTuroC.js";
import "./channel-reply-pipeline-DHFpjrzi.js";
import { t as createOptionalChannelSetupSurface } from "./channel-setup-CXvL-Qpc.js";
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
