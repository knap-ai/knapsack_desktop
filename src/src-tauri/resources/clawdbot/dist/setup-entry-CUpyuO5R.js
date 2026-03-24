import { Ub as defineSetupPluginEntry } from "./pi-embedded-CbCYZxIb.js";
import { r as discordSetupAdapter } from "./setup-core-BcW9GMrI.js";
import { t as createDiscordPluginBase } from "./shared-DTaF-SKX.js";
//#region extensions/discord/src/channel.setup.ts
const discordSetupPlugin = { ...createDiscordPluginBase({ setup: discordSetupAdapter }) };
//#endregion
//#region extensions/discord/setup-entry.ts
var setup_entry_default = defineSetupPluginEntry(discordSetupPlugin);
//#endregion
export { discordSetupPlugin as n, setup_entry_default as t };
