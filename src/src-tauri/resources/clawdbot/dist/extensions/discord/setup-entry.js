import { a as defineSetupPluginEntry } from "../../core-BghMcc08.js";
import { r as discordSetupAdapter } from "../../setup-core-Dgl1xr2H.js";
import { t as createDiscordPluginBase } from "../../shared-CjqrO3KH.js";
//#region extensions/discord/src/channel.setup.ts
const discordSetupPlugin = { ...createDiscordPluginBase({ setup: discordSetupAdapter }) };
//#endregion
//#region extensions/discord/setup-entry.ts
var setup_entry_default = defineSetupPluginEntry(discordSetupPlugin);
//#endregion
export { setup_entry_default as default, discordSetupPlugin };
