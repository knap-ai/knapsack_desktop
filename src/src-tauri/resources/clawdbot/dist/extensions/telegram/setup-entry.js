import { a as defineSetupPluginEntry } from "../../core-BghMcc08.js";
import { n as telegramSetupAdapter, t as telegramSetupWizard } from "../../setup-surface-Dy5qZ0XD.js";
import { t as createTelegramPluginBase } from "../../shared-DoOcydyi.js";
//#region extensions/telegram/src/channel.setup.ts
const telegramSetupPlugin = { ...createTelegramPluginBase({
	setupWizard: telegramSetupWizard,
	setup: telegramSetupAdapter
}) };
//#endregion
//#region extensions/telegram/setup-entry.ts
var setup_entry_default = defineSetupPluginEntry(telegramSetupPlugin);
//#endregion
export { setup_entry_default as default, telegramSetupPlugin };
