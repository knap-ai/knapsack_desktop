import { r as discordSetupAdapter, t as createDiscordPluginBase } from "./shared-Cp4gA3Ad.js";
import { n as createDiscordSetupWizardProxy } from "./setup-core-Bxbkndrl.js";
//#endregion
//#region extensions/discord/src/channel.setup.ts
const discordSetupPlugin = { ...createDiscordPluginBase({
	setupWizard: createDiscordSetupWizardProxy(async () => (await import("./setup-surface-BXGBFBfH.js")).discordSetupWizard),
	setup: discordSetupAdapter
}) };
//#endregion
export { discordSetupPlugin as t };
