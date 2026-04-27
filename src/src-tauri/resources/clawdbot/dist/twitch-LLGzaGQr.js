import "./zod-schema.core-BR1v7ukx.js";
import "./config-schema-BEuj464I.js";
import "./channel-reply-pipeline-zp0MNhbR.js";
import { t as createOptionalChannelSetupSurface } from "./channel-setup-ByPYNtWa.js";
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
