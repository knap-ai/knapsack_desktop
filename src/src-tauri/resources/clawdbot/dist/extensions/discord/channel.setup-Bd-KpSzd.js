import { r as discordSetupAdapter, t as createDiscordPluginBase } from "./shared-BnG2t5DU.js";
import { n as createDiscordSetupWizardProxy } from "./setup-core-DlJaz-Lj.js";
//#endregion
//#region extensions/discord/src/channel.setup.ts
const discordSetupPlugin = { ...createDiscordPluginBase({
	setupWizard: createDiscordSetupWizardProxy(async () => (await import("./setup-surface-iRgi3kli.js")).discordSetupWizard),
	setup: discordSetupAdapter
}) };
//#endregion
export { discordSetupPlugin as t };
