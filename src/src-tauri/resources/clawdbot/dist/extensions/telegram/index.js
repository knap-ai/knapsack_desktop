import { i as defineChannelPluginEntry } from "../../core-BghMcc08.js";
import { n as setTelegramRuntime, t as telegramPlugin } from "../../channel-BIiK00F1.js";
//#region extensions/telegram/index.ts
var telegram_default = defineChannelPluginEntry({
	id: "telegram",
	name: "Telegram",
	description: "Telegram channel plugin",
	plugin: telegramPlugin,
	setRuntime: setTelegramRuntime
});
//#endregion
export { telegram_default as default, setTelegramRuntime, telegramPlugin };
