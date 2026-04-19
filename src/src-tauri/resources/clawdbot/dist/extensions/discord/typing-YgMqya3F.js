import { t as __exportAll } from "./rolldown-runtime-DUslC3ob.js";
import { Routes } from "discord-api-types/v10";
//#region extensions/discord/src/monitor/typing.ts
var typing_exports = /* @__PURE__ */ __exportAll({ sendTyping: () => sendTyping });
const DISCORD_TYPING_START_TIMEOUT_MS = 5e3;
async function sendTyping(params) {
	let timer;
	const timeoutPromise = new Promise((_, reject) => {
		timer = setTimeout(() => {
			reject(/* @__PURE__ */ new Error(`discord typing start timed out after ${DISCORD_TYPING_START_TIMEOUT_MS}ms`));
		}, DISCORD_TYPING_START_TIMEOUT_MS);
		timer.unref?.();
	});
	try {
		await Promise.race([params.rest.post(Routes.channelTyping(params.channelId)), timeoutPromise]);
	} finally {
		if (timer) clearTimeout(timer);
	}
}
//#endregion
export { typing_exports as n, sendTyping as t };
