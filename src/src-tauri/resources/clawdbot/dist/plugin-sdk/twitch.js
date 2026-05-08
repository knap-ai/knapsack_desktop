import { t as formatDocsLink } from "../links-BszRQhGa.js";
import { n as normalizeAccountId, t as DEFAULT_ACCOUNT_ID } from "../account-id-DhSD7lhD.js";
import { h as MarkdownConfigSchema } from "../zod-schema.core-Dkd4NgDa.js";
import { r as buildChannelConfigSchema } from "../config-schema-Di5PBhdS.js";
import { n as emptyPluginConfigSchema } from "../config-schema-CBtJ4osk.js";
import { t as createChannelReplyPipeline } from "../channel-reply-pipeline-BYR66qkC.js";
import { t as createOptionalChannelSetupSurface } from "../channel-setup-DXcxitmF.js";
//#region src/plugin-sdk/twitch.ts
const twitchSetup = createOptionalChannelSetupSurface({
	channel: "twitch",
	label: "Twitch",
	npmSpec: "@openclaw/twitch"
});
const twitchSetupAdapter = twitchSetup.setupAdapter;
const twitchSetupWizard = twitchSetup.setupWizard;
//#endregion
export { DEFAULT_ACCOUNT_ID, MarkdownConfigSchema, buildChannelConfigSchema, createChannelReplyPipeline, emptyPluginConfigSchema, formatDocsLink, normalizeAccountId, twitchSetupAdapter, twitchSetupWizard };
