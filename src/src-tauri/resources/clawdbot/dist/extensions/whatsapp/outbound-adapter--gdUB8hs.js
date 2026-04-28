import { t as resolveWhatsAppOutboundTarget } from "./resolve-outbound-target-muaeoILm.js";
import { t as createWhatsAppOutboundBase } from "./outbound-base-DSLEOtaz.js";
import { shouldLogVerbose } from "openclaw/plugin-sdk/runtime-env";
import { chunkText } from "openclaw/plugin-sdk/reply-chunking";
//#region extensions/whatsapp/src/outbound-adapter.ts
let whatsAppSendModulePromise;
function loadWhatsAppSendModule() {
	whatsAppSendModulePromise ??= import("./send-DcMGZ9qO.js").then((n) => n.a);
	return whatsAppSendModulePromise;
}
function trimLeadingWhitespace(text) {
	return text?.trimStart() ?? "";
}
const whatsappOutbound = createWhatsAppOutboundBase({
	chunker: chunkText,
	sendMessageWhatsApp: async (to, text, options) => await (await loadWhatsAppSendModule()).sendMessageWhatsApp(to, trimLeadingWhitespace(text), { ...options }),
	sendPollWhatsApp: async (to, poll, options) => await (await loadWhatsAppSendModule()).sendPollWhatsApp(to, poll, options),
	shouldLogVerbose: () => shouldLogVerbose(),
	resolveTarget: ({ to, allowFrom, mode }) => resolveWhatsAppOutboundTarget({
		to,
		allowFrom,
		mode
	}),
	normalizeText: trimLeadingWhitespace,
	skipEmptyText: true
});
//#endregion
export { whatsappOutbound as t };
