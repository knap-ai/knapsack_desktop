import "./auth-profiles-DnpV8DWM.js";
import "./utils-q1rHOG-N.js";
import "./exec-B52LZOrO.js";
import "./agent-scope-Bu62UIQZ.js";
import "./github-copilot-token-C4G0wDDt.js";
import "./config-BJWIHf6x.js";
import "./manifest-registry-DlFh5LWe.js";
import "./plugins-DsHRVW6o.js";
import "./logging-B5vJSgy6.js";
import "./accounts-CXiTuiOz.js";
import "./media-EWF5qDpT.js";
import "./message-channel-D-iPIX3C.js";
import "./render-DyRjoIgA.js";
import "./tables-DuWEJJJ_.js";
import { r as sendReactionWhatsApp } from "./outbound-rrsCq6bM.js";
import "./image-ops-BuOO2fiP.js";
import "./fetch-CiM7YqYo.js";
import "./tool-images-Do-zTkGT.js";
import { a as jsonResult, n as createActionGate, s as readReactionParams, u as readStringParam } from "./common-2Kd-SlSi.js";

//#region src/agents/tools/whatsapp-actions.ts
async function handleWhatsAppAction(params, cfg) {
	const action = readStringParam(params, "action", { required: true });
	const isActionEnabled = createActionGate(cfg.channels?.whatsapp?.actions);
	if (action === "react") {
		if (!isActionEnabled("reactions")) throw new Error("WhatsApp reactions are disabled.");
		const chatJid = readStringParam(params, "chatJid", { required: true });
		const messageId = readStringParam(params, "messageId", { required: true });
		const { emoji, remove, isEmpty } = readReactionParams(params, { removeErrorMessage: "Emoji is required to remove a WhatsApp reaction." });
		const participant = readStringParam(params, "participant");
		const accountId = readStringParam(params, "accountId");
		const fromMeRaw = params.fromMe;
		await sendReactionWhatsApp(chatJid, messageId, remove ? "" : emoji, {
			verbose: false,
			fromMe: typeof fromMeRaw === "boolean" ? fromMeRaw : void 0,
			participant: participant ?? void 0,
			accountId: accountId ?? void 0
		});
		if (!remove && !isEmpty) return jsonResult({
			ok: true,
			added: emoji
		});
		return jsonResult({
			ok: true,
			removed: true
		});
	}
	throw new Error(`Unsupported WhatsApp action: ${action}`);
}

//#endregion
export { handleWhatsAppAction };