import { t as resolveWhatsAppOutboundTarget } from "./resolve-outbound-target-CV-iBmSG.js";
import { n as normalizeWhatsAppPayloadText } from "./outbound-media-contract-ioTkt8tn.js";
import { t as createWhatsAppOutboundBase } from "./outbound-base-E84SMkd9.js";
import { shouldLogVerbose } from "openclaw/plugin-sdk/runtime-env";
import { chunkText } from "openclaw/plugin-sdk/reply-chunking";
//#region extensions/whatsapp/src/outbound-adapter.ts
let whatsAppSendModulePromise;
function loadWhatsAppSendModule() {
	whatsAppSendModulePromise ??= import("./send-E_kMiuZP.js").then((n) => n.a);
	return whatsAppSendModulePromise;
}
function normalizeOutboundText(text) {
	return normalizeWhatsAppPayloadText(text);
}
const whatsappOutbound = createWhatsAppOutboundBase({
	chunker: chunkText,
	sendMessageWhatsApp: async (to, text, options) => await (await loadWhatsAppSendModule()).sendMessageWhatsApp(to, normalizeOutboundText(text), { ...options }),
	sendPollWhatsApp: async (to, poll, options) => await (await loadWhatsAppSendModule()).sendPollWhatsApp(to, poll, options),
	shouldLogVerbose: () => shouldLogVerbose(),
	resolveTarget: ({ to, allowFrom, mode }) => resolveWhatsAppOutboundTarget({
		to,
		allowFrom,
		mode
	}),
	normalizeText: normalizeOutboundText,
	skipEmptyText: true
});
//#endregion
export { whatsappOutbound as t };
